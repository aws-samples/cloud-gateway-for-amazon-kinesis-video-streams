#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SimpleRtspServerStack } from '../lib/simple-rtsp-server-stack';

const app = new cdk.App();

new SimpleRtspServerStack(app, 'SimpleRtspServerStack', {
  description: 'Serverless RTSP server deployment using AWS managed networking',
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

app.synth();
