import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';
import * as path from 'path';

export class EnhancedPipelineGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const deployRtspTestServer = new cdk.CfnParameter(this, 'DeployRtspTestServer', {
      type: 'String',
      default: 'true',
      allowedValues: ['true', 'false'],
      description: 'Whether to deploy the RTSP Test Server component (default: true)'
    });

    const deployFrontend = new cdk.CfnParameter(this, 'DeployFrontend', {
      type: 'String',
      default: 'true',
      allowedValues: ['true', 'false'],
      description: 'Whether to deploy the React frontend application (default: true)'
    });

    // Configuration - Use existing knowledge base from bedrock-gstreamer project
    const knowledgeBaseId = '5CGJIOV1QM';
    const claudeModel = 'anthropic.claude-3-5-sonnet-20240620-v1:0'; // Switch from Opus to Sonnet for better performance

    // Create Cognito User Pool for authentication (v2 - email as username)
    const userPool = new cognito.UserPool(this, 'UserPoolV2', {
      userPoolName: 'enhanced-pipeline-user-pool',
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      // Allow users to sign in with email only (no username)
      signInAliases: {
        email: true
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        },
        givenName: {
          required: false,
          mutable: true
        },
        familyName: {
          required: false,
          mutable: true
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY // Allow cleanup for development
    });

    // Create User Pool Client for web applications
    const userPoolWebClient = userPool.addClient('WebClient', {
      userPoolClientName: 'enhanced-pipeline-web-client',
      generateSecret: false, // Web clients don't use secrets
      authFlows: {
        userSrp: true,
        userPassword: true, // Enable for testing, disable in production
        adminUserPassword: true // Enable ADMIN_NO_SRP_AUTH for test scripts
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE
        ],
        callbackUrls: [
          'http://localhost:3000', // For local development
          'https://localhost:3000' // For local HTTPS development
        ],
        logoutUrls: [
          'http://localhost:3000',
          'https://localhost:3000'
        ]
      }
    });

    // Create User Pool Client for native/mobile applications
    const userPoolNativeClient = userPool.addClient('NativeClient', {
      userPoolClientName: 'enhanced-pipeline-native-client',
      generateSecret: true, // Native clients can use secrets
      authFlows: {
        userSrp: true,
        userPassword: true
      }
    });

    // Create DynamoDB table for camera configurations
    const camerasTable = new dynamodb.Table(this, 'CameraConfigurations', {
      tableName: 'CameraConfigurations',
      partitionKey: {
        name: 'composite_key', // Combination of UUID and owner ID
        type: dynamodb.AttributeType.STRING
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Retain data on stack deletion
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES // Enable streams for future event processing
    });

    // Add Global Secondary Index for querying by camera_id
    camerasTable.addGlobalSecondaryIndex({
      indexName: 'CameraIdIndex',
      partitionKey: {
        name: 'camera_id',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Add Global Secondary Index for querying by owner (user-specific cameras)
    camerasTable.addGlobalSecondaryIndex({
      indexName: 'OwnerIndex',
      partitionKey: {
        name: 'owner',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'created_at',
        type: dynamodb.AttributeType.STRING
      },
      projectionType: dynamodb.ProjectionType.ALL
    });

    // Create IAM role for Camera Management Lambda
    const cameraLambdaRole = new iam.Role(this, 'CameraLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
      inlinePolicies: {
        CameraManagementPolicy: new iam.PolicyDocument({
          statements: [
            // DynamoDB permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'dynamodb:GetItem',
                'dynamodb:PutItem',
                'dynamodb:UpdateItem',
                'dynamodb:DeleteItem',
                'dynamodb:Query',
                'dynamodb:Scan'
              ],
              resources: [
                camerasTable.tableArn,
                `${camerasTable.tableArn}/index/*`
              ]
            }),
            // Secrets Manager permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'secretsmanager:CreateSecret',
                'secretsmanager:GetSecretValue',
                'secretsmanager:PutSecretValue',
                'secretsmanager:UpdateSecret',
                'secretsmanager:DeleteSecret',
                'secretsmanager:DescribeSecret',
                'secretsmanager:TagResource'
              ],
              resources: ['*'],
              conditions: {
                StringLike: {
                  'secretsmanager:Name': 'camera-rtsp-*'
                }
              }
            })
          ]
        })
      }
    });

    // Create log group for Camera Management Lambda
    const cameraManagementLogGroup = new logs.LogGroup(this, 'CameraManagementLogGroup', {
      logGroupName: '/aws/lambda/CameraManagementFunction',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Camera Management Lambda function
    const cameraManagementFunction = new lambda.Function(this, 'CameraManagementFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'camera_management.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda-camera-management'), {
        bundling: {
          image: lambda.Runtime.PYTHON_3_11.bundlingImage,
          command: [
            'bash', '-c',
            'pip install -r camera_requirements.txt -t /asset-output && cp camera_management.py /asset-output/'
          ]
        }
      }),
      role: cameraLambdaRole,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        CAMERAS_TABLE_NAME: camerasTable.tableName,
        CAMERAS_TABLE_CAMERA_ID_GSI_NAME: 'CameraIdIndex',
        CAMERAS_TABLE_OWNER_GSI_NAME: 'OwnerIndex',
        SECRETS_PREFIX: 'camera-rtsp-'
      },
      logGroup: cameraManagementLogGroup,
      description: 'Camera management for enhanced pipeline generator'
    });

    // Create IAM role for Enhanced Pipeline Lambda function
    const enhancedLambdaRole = new iam.Role(this, 'EnhancedLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
      ],
      inlinePolicies: {
        BedrockKnowledgeBasePolicy: new iam.PolicyDocument({
          statements: [
            // Bedrock Model Invocation Permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream'
              ],
              resources: [
                // Foundation Models - wildcard for all regions and models
                `arn:aws:bedrock:*::foundation-model/*`,
                // Inference Profiles - wildcard for all regions with account ID
                `arn:aws:bedrock:*:${this.account}:inference-profile/*`
              ]
            }),
            // Knowledge Base Access Permissions
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:Retrieve',
                'bedrock:RetrieveAndGenerate'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}:${this.account}:knowledge-base/${knowledgeBaseId}`
              ]
            }),
            // Additional Bedrock Permissions for Agent Integration
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:GetFoundationModel',
                'bedrock:ListFoundationModels'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });

    // Create log group for Enhanced Pipeline Lambda
    const enhancedPipelineLogGroup = new logs.LogGroup(this, 'EnhancedPipelineLogGroup', {
      logGroupName: '/aws/lambda/EnhancedPipelineFunction',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Enhanced Pipeline Lambda function
    const enhancedLambda = new lambda.DockerImageFunction(this, 'EnhancedPipelineFunction', {
      code: lambda.DockerImageCode.fromImageAsset('../lambda-enhanced-pipeline', {
        file: 'Dockerfile'
      }),
      role: enhancedLambdaRole,
      timeout: cdk.Duration.seconds(600), // 10 minutes for complex analysis
      memorySize: 3008, // Maximum memory for OpenCV and enhanced processing
      environment: {
        KNOWLEDGE_BASE_ID: knowledgeBaseId,
        CLAUDE_MODEL: claudeModel,
        // OpenCV configuration
        FRAME_WIDTH: '640',
        FRAME_TIMEOUT: '30',
        JPEG_QUALITY: '85'
      },
      logGroup: enhancedPipelineLogGroup,
      description: 'Enhanced GStreamer pipeline generator with expert system and OpenCV'
    });

    // Create unified API Gateway for both functions
    const api = new apigateway.RestApi(this, 'UnifiedPipelineApi', {
      restApiName: 'Unified GStreamer Pipeline & Camera Management API',
      description: 'Unified API for enhanced GStreamer pipeline generation and camera management',
      defaultCorsPreflightOptions: {
        allowOrigins: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:5173',
          'http://localhost:8080',
          'http://localhost:8000',
          'https://localhost:3000',
          'https://localhost:3001',
          'https://localhost:5173',
          'https://localhost:8080',
          'https://localhost:8000'
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'X-Amz-User-Agent',
          'Access-Control-Allow-Origin',
          'Access-Control-Allow-Headers'
        ],
        allowCredentials: true
      }
    });

    // Create Cognito User Pool authorizer for camera management
    const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
      authorizerName: 'CameraManagementAuthorizer',
      identitySource: 'method.request.header.Authorization'
    });

    // Enhanced Pipeline Lambda integration
    const enhancedLambdaIntegration = new apigateway.LambdaIntegration(enhancedLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    // Camera Management Lambda integration
    const cameraLambdaIntegration = new apigateway.LambdaIntegration(cameraManagementFunction, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' },
      proxy: true
    });

    // Enhanced Pipeline API endpoints (v1)
    const v1 = api.root.addResource('v1');
    
    // Enhanced pipeline generation endpoint
    const generatePipeline = v1.addResource('generate-pipeline');
    generatePipeline.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Specialized tool endpoints
    const tools = v1.addResource('tools');
    
    // Element search endpoint
    const searchElements = tools.addResource('search-elements');
    searchElements.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Troubleshooting endpoint
    const troubleshoot = tools.addResource('troubleshoot');
    troubleshoot.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Optimization endpoint
    const optimize = tools.addResource('optimize');
    optimize.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Validation endpoint
    const validate = tools.addResource('validate');
    validate.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Comprehensive expert endpoint
    const expert = tools.addResource('expert');
    expert.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Stream characteristics endpoint (maintains compatibility)
    const characteristics = v1.addResource('characteristics');
    characteristics.addMethod('POST', enhancedLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Camera Management API endpoints
    const camerasResource = api.root.addResource('cameras');
    
    // POST /cameras - Create new camera
    camerasResource.addMethod('POST', cameraLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // GET /cameras - List all cameras
    camerasResource.addMethod('GET', cameraLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Individual camera resource
    const cameraResource = camerasResource.addResource('{camera_id}');
    
    // GET /cameras/{camera_id} - Get specific camera
    cameraResource.addMethod('GET', cameraLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });
    
    // PUT /cameras/{camera_id} - Update camera
    cameraResource.addMethod('PUT', cameraLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });
    
    // DELETE /cameras/{camera_id} - Delete camera
    cameraResource.addMethod('DELETE', cameraLambdaIntegration, {
      authorizer: cognitoAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO
    });

    // Output important values for frontend integration
    new cdk.CfnOutput(this, 'UnifiedApiEndpoint', {
      value: api.url,
      description: 'Unified API Gateway endpoint for pipeline generation and camera management'
    });

    // Cognito Configuration Outputs
    new cdk.CfnOutput(this, 'CognitoUserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID for authentication'
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolWebClientId', {
      value: userPoolWebClient.userPoolClientId,
      description: 'Cognito User Pool Web Client ID for frontend authentication'
    });

    new cdk.CfnOutput(this, 'CognitoUserPoolNativeClientId', {
      value: userPoolNativeClient.userPoolClientId,
      description: 'Cognito User Pool Native Client ID for mobile apps'
    });

    new cdk.CfnOutput(this, 'CognitoRegion', {
      value: this.region,
      description: 'AWS Region for Cognito authentication'
    });

    // API Configuration Outputs
    new cdk.CfnOutput(this, 'ApiGatewayId', {
      value: api.restApiId,
      description: 'API Gateway REST API ID'
    });

    new cdk.CfnOutput(this, 'ApiGatewayStage', {
      value: api.deploymentStage.stageName,
      description: 'API Gateway deployment stage'
    });

    // Backend Configuration Outputs
    new cdk.CfnOutput(this, 'KnowledgeBaseId', {
      value: knowledgeBaseId,
      description: 'Bedrock Knowledge Base ID for GStreamer expertise'
    });

    new cdk.CfnOutput(this, 'ClaudeModel', {
      value: claudeModel,
      description: 'Claude model used for pipeline generation'
    });

    new cdk.CfnOutput(this, 'EnhancedLambdaFunctionName', {
      value: enhancedLambda.functionName,
      description: 'Enhanced pipeline generator Lambda function name'
    });

    new cdk.CfnOutput(this, 'CameraLambdaFunctionName', {
      value: cameraManagementFunction.functionName,
      description: 'Camera management Lambda function name'
    });

    new cdk.CfnOutput(this, 'CamerasTableName', {
      value: camerasTable.tableName,
      description: 'DynamoDB table name for camera configurations'
    });

    // AWS Configuration Outputs
    new cdk.CfnOutput(this, 'AWSRegion', {
      value: this.region,
      description: 'AWS Region for all services'
    });

    new cdk.CfnOutput(this, 'AWSAccountId', {
      value: this.account,
      description: 'AWS Account ID'
    });

    // Optional RTSP Test Server Component
    const rtspTestServerCondition = new cdk.CfnCondition(this, 'DeployRtspTestServerCondition', {
      expression: cdk.Fn.conditionEquals(deployRtspTestServer.valueAsString, 'true')
    });

    // Use the default VPC for RTSP Test Server (cost optimization)
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
      isDefault: true,
    });

    // Create ECS Cluster for RTSP Test Server
    const rtspCluster = new ecs.Cluster(this, 'RTSPTestCluster', { 
      vpc,
      clusterName: 'rtsp-test-server-cluster'
    });
    // Apply condition to the cluster
    const cfnCluster = rtspCluster.node.defaultChild as ecs.CfnCluster;
    cfnCluster.cfnOptions.condition = rtspTestServerCondition;

    // Create security group for RTSP Test Server
    const rtspSecurityGroup = new ec2.SecurityGroup(this, 'RTSPTestSecurityGroup', {
      vpc,
      description: 'Security group for RTSP Test Server with ports 8554-8557 and 8080 open',
      allowAllOutbound: true,
    });
    // Apply condition to the security group
    const cfnSecurityGroup = rtspSecurityGroup.node.defaultChild as ec2.CfnSecurityGroup;
    cfnSecurityGroup.cfnOptions.condition = rtspTestServerCondition;

    // Add inbound rules for RTSP ports and HTTP API
    rtspSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcpRange(8554, 8557),
      'Allow RTSP traffic on ports 8554-8557'
    );
    rtspSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(8080),
      'Allow HTTP REST API traffic on port 8080'
    );

    // Create CloudWatch Log Group for RTSP Test Server
    const rtspLogGroup = new logs.LogGroup(this, 'RTSPTestServerLogGroup', {
      logGroupName: '/aws/ecs/rtsp-test-server',
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // Apply condition to the log group
    const cfnLogGroup = rtspLogGroup.node.defaultChild as logs.CfnLogGroup;
    cfnLogGroup.cfnOptions.condition = rtspTestServerCondition;

    // Create Fargate Task Definition for RTSP Test Server (updated to avoid deprecation)
    const rtspTaskDefinition = new ecs.FargateTaskDefinition(this, 'RTSPTestTaskDefinition', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      runtimePlatform: {
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
        cpuArchitecture: ecs.CpuArchitecture.X86_64
      },
      // Explicitly avoid deprecated properties
      family: 'rtsp-test-server-task'
    });
    // Apply condition to the task definition
    const cfnTaskDefinition = rtspTaskDefinition.node.defaultChild as ecs.CfnTaskDefinition;
    cfnTaskDefinition.cfnOptions.condition = rtspTestServerCondition;

    // Add container to task definition
    const rtspContainer = rtspTaskDefinition.addContainer('RTSPTestServerContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, '../rtsp-test-server')),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'rtsp-test-server',
        logGroup: rtspLogGroup,
      }),
      environment: {
        'RTSP_SERVER_MODE': 'production',
        'AWS_DEFAULT_REGION': this.region,
      },
      // Use Python health check script for more reliable health checking
      healthCheck: {
        command: ['CMD-SHELL', 'python3 /simple-health-check.py || exit 1'],
        interval: cdk.Duration.seconds(30),
        timeout: cdk.Duration.seconds(10),
        retries: 5, // Increased retries for more resilience
        startPeriod: cdk.Duration.seconds(90), // Longer start period for GStreamer initialization
      },
      essential: true,
    });

    // Add port mappings for RTSP and HTTP
    rtspContainer.addPortMappings(
      { containerPort: 8554, protocol: ecs.Protocol.TCP },
      { containerPort: 8555, protocol: ecs.Protocol.TCP },
      { containerPort: 8556, protocol: ecs.Protocol.TCP },
      { containerPort: 8557, protocol: ecs.Protocol.TCP },
      { containerPort: 8080, protocol: ecs.Protocol.TCP }
    );

    // Create Fargate Service for RTSP Test Server
    const rtspService = new ecs.FargateService(this, 'RTSPTestService', {
      cluster: rtspCluster,
      taskDefinition: rtspTaskDefinition,
      desiredCount: 1,
      assignPublicIp: true,
      securityGroups: [rtspSecurityGroup],
      minHealthyPercent: 0, // Allow service to restart without maintaining healthy tasks
      maxHealthyPercent: 200,
      enableExecuteCommand: true, // Enable ECS Exec for debugging
      // Configure circuit breaker to prevent infinite restart loops
      circuitBreaker: {
        rollback: true,
      },
    });
    // Apply condition to the service
    const cfnService = rtspService.node.defaultChild as ecs.CfnService;
    cfnService.cfnOptions.condition = rtspTestServerCondition;

    // Output RTSP Test Server information (conditional)
    const rtspTestServerOutput = new cdk.CfnOutput(this, 'RTSPTestServerStatus', {
      value: cdk.Fn.conditionIf(
        rtspTestServerCondition.logicalId,
        'RTSP Test Server deployed - check ECS service for public IP',
        'RTSP Test Server not deployed'
      ).toString(),
      description: 'RTSP Test Server deployment status and access information'
    });
    rtspTestServerOutput.condition = rtspTestServerCondition;

    // RTSP Test Server Configuration Outputs (conditional)
    const rtspClusterOutput = new cdk.CfnOutput(this, 'RTSPTestServerCluster', {
      value: cdk.Fn.conditionIf(
        rtspTestServerCondition.logicalId,
        rtspCluster.clusterName,
        'Not deployed'
      ).toString(),
      description: 'ECS Cluster name for RTSP Test Server'
    });
    rtspClusterOutput.condition = rtspTestServerCondition;

    const rtspServiceOutput = new cdk.CfnOutput(this, 'RTSPTestServerService', {
      value: cdk.Fn.conditionIf(
        rtspTestServerCondition.logicalId,
        rtspService.serviceName,
        'Not deployed'
      ).toString(),
      description: 'ECS Service name for RTSP Test Server'
    });
    rtspServiceOutput.condition = rtspTestServerCondition;

    const rtspPortsOutput = new cdk.CfnOutput(this, 'RTSPTestServerPorts', {
      value: cdk.Fn.conditionIf(
        rtspTestServerCondition.logicalId,
        'RTSP: 8554, HTTP: 8080, HTTPS: 8443, Admin: 8888',
        'Not deployed'
      ).toString(),
      description: 'RTSP Test Server port configuration'
    });
    rtspPortsOutput.condition = rtspTestServerCondition;

    // Add tags for resource management
    cdk.Tags.of(this).add('Project', 'Unified-GStreamer-Pipeline-System');
    cdk.Tags.of(this).add('Component', 'Cloud-Gateway-Consolidated');
    cdk.Tags.of(this).add('Version', '3.0-Unified');

    // ========================================
    // Frontend Hosting (React Application)
    // ========================================

    // Frontend deployment (conditional)
    if (deployFrontend.valueAsString === 'true') {
      // S3 Bucket for React app hosting
      const frontendBucket = new s3.Bucket(this, 'FrontendBucket', {
        bucketName: `${this.stackName.toLowerCase()}-frontend-${this.account}`,
        websiteIndexDocument: 'index.html',
        websiteErrorDocument: 'index.html', // SPA routing support
        publicReadAccess: true,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

      // CloudFront Distribution for global CDN
      const distribution = new cloudfront.Distribution(this, 'FrontendDistribution', {
        defaultBehavior: {
          origin: new origins.S3StaticWebsiteOrigin(frontendBucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        },
        defaultRootObject: 'index.html',
        errorResponses: [
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html', // SPA routing support
          },
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html', // SPA routing support
          },
        ],
        comment: 'Unified Streaming Platform Frontend Distribution',
      });

      // S3 Deployment for React build (conditional)
      // Note: This requires the frontend to be built first
      const frontendDeployment = new s3deploy.BucketDeployment(this, 'FrontendDeployment', {
        sources: [s3deploy.Source.asset(path.join(__dirname, '../frontend/dist'))],
        destinationBucket: frontendBucket,
        distribution,
        distributionPaths: ['/*'],
        memoryLimit: 512,
      });

      // Output frontend URLs
      new cdk.CfnOutput(this, 'FrontendBucketName', {
        value: frontendBucket.bucketName,
        description: 'S3 bucket name for frontend hosting'
      });

      new cdk.CfnOutput(this, 'FrontendURL', {
        value: `https://${distribution.distributionDomainName}`,
        description: 'CloudFront URL for the React frontend application'
      });

      new cdk.CfnOutput(this, 'FrontendS3URL', {
        value: frontendBucket.bucketWebsiteUrl,
        description: 'S3 website URL for the React frontend application'
      });
    } else {
      // Output placeholder values when frontend is not deployed
      new cdk.CfnOutput(this, 'FrontendBucketName', {
        value: 'Frontend not deployed',
        description: 'S3 bucket name for frontend hosting'
      });

      new cdk.CfnOutput(this, 'FrontendURL', {
        value: 'Frontend not deployed',
        description: 'CloudFront URL for the React frontend application'
      });

      new cdk.CfnOutput(this, 'FrontendS3URL', {
        value: 'Frontend not deployed',
        description: 'S3 website URL for the React frontend application'
      });
    }
  }
}
