import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class EnhancedPipelineGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Configuration - Use existing knowledge base from bedrock-gstreamer project
    const knowledgeBaseId = '5CGJIOV1QM';
    const claudeModel = 'us.anthropic.claude-opus-4-1-20250805-v1:0';

    // Create IAM role for Lambda function with enhanced permissions
    const lambdaRole = new iam.Role(this, 'EnhancedLambdaRole', {
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

    // Create Lambda function with enhanced capabilities
    const enhancedLambda = new lambda.DockerImageFunction(this, 'EnhancedPipelineFunction', {
      code: lambda.DockerImageCode.fromImageAsset('./enhanced-pipeline-generator', {
        file: 'Dockerfile'
      }),
      role: lambdaRole,
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

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'EnhancedPipelineApi', {
      restApiName: 'Enhanced GStreamer Pipeline Generator',
      description: 'API for enhanced GStreamer pipeline generation with expert system',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token']
      }
    });

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(enhancedLambda, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    // API endpoints
    const v1 = api.root.addResource('v1');
    
    // Enhanced pipeline generation endpoint
    const generatePipeline = v1.addResource('generate-pipeline');
    generatePipeline.addMethod('POST', lambdaIntegration);
    generatePipeline.addMethod('OPTIONS', lambdaIntegration);

    // Specialized tool endpoints
    const tools = v1.addResource('tools');
    
    // Element search endpoint
    const searchElements = tools.addResource('search-elements');
    searchElements.addMethod('POST', lambdaIntegration);
    searchElements.addMethod('OPTIONS', lambdaIntegration);

    // Troubleshooting endpoint
    const troubleshoot = tools.addResource('troubleshoot');
    troubleshoot.addMethod('POST', lambdaIntegration);
    troubleshoot.addMethod('OPTIONS', lambdaIntegration);

    // Optimization endpoint
    const optimize = tools.addResource('optimize');
    optimize.addMethod('POST', lambdaIntegration);
    optimize.addMethod('OPTIONS', lambdaIntegration);

    // Comprehensive expert endpoint
    const expert = tools.addResource('expert');
    expert.addMethod('POST', lambdaIntegration);
    expert.addMethod('OPTIONS', lambdaIntegration);

    // Stream characteristics endpoint (maintains compatibility)
    const characteristics = v1.addResource('characteristics');
    characteristics.addMethod('POST', lambdaIntegration);
    characteristics.addMethod('OPTIONS', lambdaIntegration);

    // Output important values
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'Enhanced Pipeline Generator API Gateway endpoint'
    });

    new cdk.CfnOutput(this, 'KnowledgeBaseId', {
      value: knowledgeBaseId,
      description: 'Bedrock Knowledge Base ID for GStreamer expertise'
    });

    new cdk.CfnOutput(this, 'ClaudeModel', {
      value: claudeModel,
      description: 'Claude model used for pipeline generation'
    });

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: enhancedLambda.functionName,
      description: 'Enhanced Lambda function name'
    });

    // Add tags for resource management
    cdk.Tags.of(this).add('Project', 'Enhanced-GStreamer-Pipeline-Generator');
    cdk.Tags.of(this).add('Component', 'Cloud-Gateway-Integration');
    cdk.Tags.of(this).add('Version', '2.0-Enhanced');
  }
}
