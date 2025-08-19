#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineGeneratorStack } from '../lib/pipeline-generator-stack';
import { CameraManagementStack } from '../lib/camera-management-stack';

const app = new cdk.App();

// Deploy the original pipeline generator stack
new PipelineGeneratorStack(app, 'PipelineGeneratorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Stack for generating GStreamer pipelines from RTSP stream analysis using Bedrock'
});

// Deploy the new camera management stack
new CameraManagementStack(app, 'CameraManagementStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Stack for managing camera configurations with DynamoDB and Secrets Manager'
});
