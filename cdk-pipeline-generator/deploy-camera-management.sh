#!/bin/bash

# Deploy Camera Management Stack
# This script deploys the camera management infrastructure including:
# - DynamoDB table for camera configurations
# - Lambda function for CRUD operations
# - API Gateway for REST endpoints
# - IAM roles and policies
# - Secrets Manager integration

set -e

echo "🚀 Starting Camera Management Stack Deployment..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS CLI is not configured or credentials are invalid"
    echo "Please run 'aws configure' or set up your AWS credentials"
    exit 1
fi

# Get current AWS account and region
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region)

echo "📋 Deployment Details:"
echo "   Account: $ACCOUNT"
echo "   Region: $REGION"
echo "   Stack: CameraManagementStack"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

# Bootstrap CDK if needed (only run once per account/region)
echo "🔧 Checking CDK bootstrap status..."
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION > /dev/null 2>&1; then
    echo "🔧 Bootstrapping CDK for account $ACCOUNT in region $REGION..."
    npx cdk bootstrap aws://$ACCOUNT/$REGION
else
    echo "✅ CDK already bootstrapped"
fi

# Synthesize the stack to check for errors
echo "🔍 Synthesizing CDK stack..."
npx cdk synth CameraManagementStack

# Deploy the stack
echo "🚀 Deploying Camera Management Stack..."
npx cdk deploy CameraManagementStack --require-approval never

# Get the outputs
echo "📋 Deployment completed! Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name CameraManagementStack \
    --query 'Stacks[0].Outputs' \
    --output table

echo ""
echo "✅ Camera Management Stack deployed successfully!"
echo ""
echo "🔗 Next steps:"
echo "   1. Note the API Gateway URL from the outputs above"
echo "   2. Update your frontend configuration to use the new API endpoint"
echo "   3. Test the camera management functionality"
echo ""
echo "📚 API Endpoints:"
echo "   POST   /cameras           - Create new camera"
echo "   GET    /cameras           - List all cameras"
echo "   GET    /cameras/{id}      - Get specific camera"
echo "   PUT    /cameras/{id}      - Update camera"
echo "   DELETE /cameras/{id}      - Delete camera"
echo ""
