#!/bin/bash

# Serverless deployment script for RTSP server CDK stack
set -e

echo "🚀 Deploying Serverless RTSP Server to AWS..."

# Set AWS profile
export AWS_PROFILE=malone-aws
echo "🔧 Using AWS profile: $AWS_PROFILE"

# Set up Node.js version 22 via nvm
echo "🔧 Setting Node.js version to 22 via nvm..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 22
echo "✅ Node.js version: $(node --version)"

# Change to the CDK directory
cd cdk-deployment

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Bootstrap CDK if needed (only runs once per account/region)
echo "🏗️  Bootstrapping CDK (if needed)..."
npm run bootstrap

# Deploy the stack
echo "🚀 Deploying serverless CDK stack..."
npm run deploy

echo "✅ Deployment complete!"
echo ""
echo "📋 To view your RTSP endpoints, check the CDK outputs above."
echo "📊 To view logs: aws logs tail /aws/ecs/serverless-rtsp-server --follow --profile malone-aws"
echo "🧹 To clean up: ./cleanup.sh"
