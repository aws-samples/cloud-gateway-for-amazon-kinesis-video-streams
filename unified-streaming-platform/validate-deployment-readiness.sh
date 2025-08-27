#!/bin/bash

# Pre-Deployment Validation Script
# Validates that all prerequisites are met for unified platform deployment

set -e

echo "🔍 Unified Streaming Platform - Deployment Readiness Check"
echo "========================================================="
echo ""

VALIDATION_PASSED=true

# Function to check and report status
check_requirement() {
    local description="$1"
    local command="$2"
    local error_message="$3"
    
    echo -n "🔍 $description... "
    if eval "$command" &> /dev/null; then
        echo "✅"
    else
        echo "❌"
        echo "   Error: $error_message"
        VALIDATION_PASSED=false
    fi
}

# Function to check AWS resource
check_aws_resource() {
    local description="$1"
    local aws_command="$2"
    local error_message="$3"
    
    echo -n "🔍 $description... "
    if eval "$aws_command" &> /dev/null; then
        echo "✅"
    else
        echo "❌"
        echo "   Error: $error_message"
        VALIDATION_PASSED=false
    fi
}

echo "📋 System Prerequisites:"
check_requirement "Docker installed" "command -v docker" "Docker is required. Install from https://docker.com"
check_requirement "Docker running" "docker info" "Docker daemon is not running. Please start Docker"
check_requirement "AWS CLI installed" "command -v aws" "AWS CLI is required. Install with: pip install awscli"
check_requirement "CDK installed" "command -v cdk" "AWS CDK is required. Install with: npm install -g aws-cdk"
check_requirement "Node.js installed" "command -v node" "Node.js is required. Install from https://nodejs.org"
check_requirement "npm installed" "command -v npm" "npm is required (usually comes with Node.js)"

echo ""
echo "🔐 AWS Configuration:"
check_requirement "AWS credentials configured" "aws sts get-caller-identity --profile malone-aws" "Configure AWS CLI with: aws configure --profile malone-aws"

if aws sts get-caller-identity --profile malone-aws &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --profile malone-aws --query Account --output text)
    REGION="us-east-1"
    echo "   📍 Account: $ACCOUNT_ID, Region: $REGION"
fi

echo ""
echo "☁️  AWS Resources:"
check_aws_resource "CDK bootstrapped" "aws cloudformation describe-stacks --stack-name CDKToolkit --profile malone-aws --region us-east-1" "CDK not bootstrapped. Run: cdk bootstrap --profile malone-aws"
check_aws_resource "Cognito User Pool exists" "aws cognito-idp describe-user-pool --user-pool-id us-east-1_Q1jWhy4hd --profile malone-aws --region us-east-1" "Required Cognito User Pool not found"
check_aws_resource "Knowledge Base accessible" "aws bedrock-agent get-knowledge-base --knowledge-base-id 5CGJIOV1QM --profile malone-aws --region us-east-1" "Knowledge Base 5CGJIOV1QM not accessible"

echo ""
echo "📁 Project Structure:"
check_requirement "CDK infrastructure exists" "test -f cdk-infrastructure/enhanced-pipeline-stack.ts" "CDK stack file missing"
check_requirement "Enhanced Lambda exists" "test -f lambda-enhanced-pipeline/enhanced_lambda_function.py" "Enhanced Lambda function missing"
check_requirement "Camera Lambda exists" "test -f lambda-camera-management/camera_management.py" "Camera management Lambda missing"
check_requirement "Frontend exists" "test -d frontend/src" "Frontend source directory missing"
check_requirement "Deploy script exists" "test -x deploy.sh" "Deploy script missing or not executable"

echo ""
echo "🐳 Docker Configuration:"
check_requirement "Docker legacy builder" "test \"\$DOCKER_BUILDKIT\" != \"1\"" "Set DOCKER_BUILDKIT=0 for Lambda compatibility"

echo ""
echo "📦 Dependencies:"
if [ -d "cdk-infrastructure/node_modules" ]; then
    echo "✅ CDK dependencies installed"
else
    echo "⚠️  CDK dependencies not installed - will be installed during deployment"
fi

if [ -d "frontend/node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "⚠️  Frontend dependencies not installed - will be installed during deployment"
fi

echo ""
echo "🔍 Conflict Detection:"

# Check for conflicting stacks
CONFLICTING_STACKS=()

if aws cloudformation describe-stacks --stack-name CameraManagementStack --profile malone-aws --region us-east-1 &> /dev/null; then
    CONFLICTING_STACKS+=("CameraManagementStack")
fi

if aws cloudformation describe-stacks --stack-name PipelineGeneratorStack --profile malone-aws --region us-east-1 &> /dev/null; then
    CONFLICTING_STACKS+=("PipelineGeneratorStack")
fi

if aws cloudformation describe-stacks --stack-name SimpleRtspServerStack --profile malone-aws --region us-east-1 &> /dev/null; then
    CONFLICTING_STACKS+=("SimpleRtspServerStack")
fi

if [ ${#CONFLICTING_STACKS[@]} -gt 0 ]; then
    echo "⚠️  Conflicting stacks detected:"
    for stack in "${CONFLICTING_STACKS[@]}"; do
        echo "   • $stack"
    done
    echo "   Run ./cleanup-old-stacks.sh to clean up before deployment"
    VALIDATION_PASSED=false
else
    echo "✅ No conflicting stacks detected"
fi

# Check for conflicting DynamoDB table
if aws dynamodb describe-table --table-name CameraConfigurations --profile malone-aws --region us-east-1 &> /dev/null; then
    echo "⚠️  DynamoDB table 'CameraConfigurations' already exists"
    echo "   This may cause deployment conflicts. Consider backing up and removing."
    VALIDATION_PASSED=false
else
    echo "✅ No conflicting DynamoDB tables"
fi

echo ""
echo "📊 Validation Summary:"
if [ "$VALIDATION_PASSED" = true ]; then
    echo "🎉 All validation checks passed!"
    echo ""
    echo "✅ Ready for deployment. Run: ./deploy.sh"
    echo ""
    echo "🚀 Deployment Options:"
    echo "   • Full deployment:     ./deploy.sh"
    echo "   • Backend only:        ./deploy.sh --no-frontend --no-rtsp-test-server"
    echo "   • Without RTSP server: ./deploy.sh --no-rtsp-test-server"
    echo "   • Without frontend:    ./deploy.sh --no-frontend"
    exit 0
else
    echo "❌ Validation failed. Please address the issues above before deployment."
    echo ""
    echo "🔧 Common fixes:"
    echo "   • Install missing tools"
    echo "   • Configure AWS credentials: aws configure --profile malone-aws"
    echo "   • Bootstrap CDK: cdk bootstrap --profile malone-aws"
    echo "   • Clean up old stacks: ./cleanup-old-stacks.sh"
    echo "   • Set Docker legacy builder: export DOCKER_BUILDKIT=0"
    exit 1
fi
