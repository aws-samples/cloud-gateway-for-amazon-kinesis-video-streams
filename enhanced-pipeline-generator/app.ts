#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnhancedPipelineGeneratorStack } from './enhanced-pipeline-stack';

const app = new cdk.App();

new EnhancedPipelineGeneratorStack(app, 'EnhancedPipelineGeneratorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Enhanced GStreamer Pipeline Generator with Expert System and OpenCV Integration'
});

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'Enhanced-GStreamer-Pipeline-Generator');
cdk.Tags.of(app).add('Repository', 'cloud-gateway-for-amazon-kinesis-video-streams');
cdk.Tags.of(app).add('Integration', 'Phase-7-Cloud-Gateway-Integration');
