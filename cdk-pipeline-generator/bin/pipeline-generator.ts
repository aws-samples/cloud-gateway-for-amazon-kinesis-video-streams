#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { PipelineGeneratorStack } from '../lib/pipeline-generator-stack';

const app = new cdk.App();
new PipelineGeneratorStack(app, 'PipelineGeneratorStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Stack for generating GStreamer pipelines from RTSP stream analysis using Bedrock'
});
