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
import { Construct } from 'constructs';
import * as path from 'path';

export class EnhancedPipelineGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters
    const deployRtspTestServer = new cdk.CfnParameter(this, 'DeployRtspTestServer', {
      type: 'String',
      default: 'false',
      allowedValues: ['true', 'false'],
      description: 'Whether to deploy the optional RTSP Test Server component'
    });

    // Configuration - Use existing knowledge base from bedrock-gstreamer project
    const knowledgeBaseId = '5CGJIOV1QM';
    const claudeModel = 'us.anthropic.claude-opus-4-1-20250805-v1:0';

    // Import existing Cognito User Pool from Amplify (for camera management)
    const userPool = cognito.UserPool.fromUserPoolId(this, 'AmplifyUserPool', 'us-east-1_Q1jWhy4hd');

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

    // Create Camera Management Lambda function
    const cameraManagementFunction = new lambda.Function(this, 'CameraManagementFunction', {
      runtime: lambda.Runtime.PYTHON_3_11,
      handler: 'camera_management.lambda_handler',
      code: lambda.Code.fromAsset(path.join(__dirname), {
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
      logRetention: logs.RetentionDays.ONE_WEEK,
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
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:InvokeModel',
                'bedrock:InvokeModelWithResponseStream'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}::foundation-model/${claudeModel}`,
                `arn:aws:bedrock:${this.region}::foundation-model/*`
              ]
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                'bedrock:Retrieve'
              ],
              resources: [
                `arn:aws:bedrock:${this.region}:${this.account}:knowledge-base/${knowledgeBaseId}`
              ]
            })
          ]
        })
      }
    });

    // Create Enhanced Pipeline Lambda function
    const enhancedLambda = new lambda.DockerImageFunction(this, 'EnhancedPipelineFunction', {
      code: lambda.DockerImageCode.fromImageAsset('./', {
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
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: 'Enhanced GStreamer pipeline generator with expert system and OpenCV'
    });

    // Create unified API Gateway for both functions
    const api = new apigateway.RestApi(this, 'UnifiedPipelineApi', {
      restApiName: 'Unified GStreamer Pipeline & Camera Management API',
      description: 'Unified API for enhanced GStreamer pipeline generation and camera management',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
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
    generatePipeline.addMethod('POST', enhancedLambdaIntegration);
    generatePipeline.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Specialized tool endpoints
    const tools = v1.addResource('tools');
    
    // Element search endpoint
    const searchElements = tools.addResource('search-elements');
    searchElements.addMethod('POST', enhancedLambdaIntegration);
    searchElements.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Troubleshooting endpoint
    const troubleshoot = tools.addResource('troubleshoot');
    troubleshoot.addMethod('POST', enhancedLambdaIntegration);
    troubleshoot.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Optimization endpoint
    const optimize = tools.addResource('optimize');
    optimize.addMethod('POST', enhancedLambdaIntegration);
    optimize.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Validation endpoint
    const validate = tools.addResource('validate');
    validate.addMethod('POST', enhancedLambdaIntegration);
    validate.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Comprehensive expert endpoint
    const expert = tools.addResource('expert');
    expert.addMethod('POST', enhancedLambdaIntegration);
    expert.addMethod('OPTIONS', enhancedLambdaIntegration);

    // Stream characteristics endpoint (maintains compatibility)
    const characteristics = v1.addResource('characteristics');
    characteristics.addMethod('POST', enhancedLambdaIntegration);
    characteristics.addMethod('OPTIONS', enhancedLambdaIntegration);

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

    // Output important values
    new cdk.CfnOutput(this, 'UnifiedApiEndpoint', {
      value: api.url,
      description: 'Unified API Gateway endpoint for pipeline generation and camera management'
    });

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
    rtspCluster.cfnCluster.cfnOptions.condition = rtspTestServerCondition;

    // Create security group for RTSP Test Server
    const rtspSecurityGroup = new ec2.SecurityGroup(this, 'RTSPTestSecurityGroup', {
      vpc,
      description: 'Security group for RTSP Test Server with ports 8554-8557 and 8080 open',
      allowAllOutbound: true,
    });
    rtspSecurityGroup.cfnSecurityGroup.cfnOptions.condition = rtspTestServerCondition;

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
    rtspLogGroup.cfnLogGroup.cfnOptions.condition = rtspTestServerCondition;

    // Create Fargate Task Definition for RTSP Test Server
    const rtspTaskDefinition = new ecs.FargateTaskDefinition(this, 'RTSPTestTaskDefinition', {
      memoryLimitMiB: 2048,
      cpu: 1024,
    });
    rtspTaskDefinition.cfnTaskDefinition.cfnOptions.condition = rtspTestServerCondition;

    // Add container to task definition
    const rtspContainer = rtspTaskDefinition.addContainer('RTSPTestServerContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, 'rtsp-test-server')),
      logging: ecs.LogDrivers.awsLogs({
        streamPrefix: 'rtsp-test-server',
        logGroup: rtspLogGroup,
      }),
      environment: {
        'RTSP_SERVER_MODE': 'production',
        'AWS_DEFAULT_REGION': this.region,
      },
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
    });
    rtspService.cfnService.cfnOptions.condition = rtspTestServerCondition;

    // Output RTSP Test Server information (conditional)
    const rtspTestServerOutput = new cdk.CfnOutput(this, 'RTSPTestServerStatus', {
      value: cdk.Fn.conditionIf(
        rtspTestServerCondition.logicalId,
        'RTSP Test Server deployed - check ECS service for public IP',
        'RTSP Test Server not deployed'
      ).toString(),
      description: 'RTSP Test Server deployment status and access information'
    });

    // Add tags for resource management
    cdk.Tags.of(this).add('Project', 'Unified-GStreamer-Pipeline-System');
    cdk.Tags.of(this).add('Component', 'Cloud-Gateway-Consolidated');
    cdk.Tags.of(this).add('Version', '3.0-Unified');
  }
}
