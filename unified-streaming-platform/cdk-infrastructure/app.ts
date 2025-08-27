#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { EnhancedPipelineGeneratorStack } from './enhanced-pipeline-stack';

const app = new cdk.App();

new EnhancedPipelineGeneratorStack(app, 'UnifiedStreamingPlatformStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  description: 'Unified Streaming Platform - Cloud Gateway with GStreamer Expert System and Camera Management'
});

// Add tags to all resources
cdk.Tags.of(app).add('Project', 'Unified-Streaming-Platform');
cdk.Tags.of(app).add('Repository', 'cloud-gateway-for-amazon-kinesis-video-streams');
cdk.Tags.of(app).add('Integration', 'Phase-7-Cloud-Gateway-Integration');
