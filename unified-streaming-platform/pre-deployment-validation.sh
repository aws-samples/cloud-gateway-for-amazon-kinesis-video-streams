#!/bin/bash

# Pre-Deployment Validation Script
# Validates deployment readiness and identifies potential conflicts

set -e

echo "🔍 Pre-Deployment Validation for Unified Streaming Platform"
echo "==========================================================="
echo ""

# Configuration
AWS_PROFILE="malone-aws"
AWS_REGION="us-east-1"
STACK_NAME="UnifiedStreamingPlatformStack"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "📋 Checking Prerequisites"
echo "----------------------------------------"

# Check AWS CLI
if ! command -v aws >/dev/null 2>&1; then
    print_status $RED "❌ AWS CLI not available"
    exit 1
fi
print_status $GREEN "✅ AWS CLI available"

# Check CDK CLI
if ! command -v cdk >/dev/null 2>&1; then
    print_status $RED "❌ CDK CLI not available"
    exit 1
fi
print_status $GREEN "✅ CDK CLI available"

# Check Docker
if ! command -v docker >/dev/null 2>&1; then
    print_status $RED "❌ Docker not available"
    exit 1
fi
print_status $GREEN "✅ Docker available"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_status $RED "❌ Docker daemon not running"
    exit 1
fi
print_status $GREEN "✅ Docker daemon running"

# Check AWS credentials
if ! aws sts get-caller-identity --profile $AWS_PROFILE >/dev/null 2>&1; then
    print_status $RED "❌ AWS credentials not configured for profile: $AWS_PROFILE"
    exit 1
fi
print_status $GREEN "✅ AWS credentials configured"

echo ""
print_status $BLUE "🏗️ Validating CDK Project"
echo "----------------------------------------"

# Build CDK project
cd cdk-infrastructure
if npm run build >/dev/null 2>&1; then
    print_status $GREEN "✅ CDK project builds successfully"
else
    print_status $RED "❌ CDK project build failed"
    exit 1
fi

# Validate CDK synth
if cdk synth --profile $AWS_PROFILE >/dev/null 2>&1; then
    print_status $GREEN "✅ CDK stack synthesizes successfully"
else
    print_status $RED "❌ CDK stack synthesis failed"
    exit 1
fi
cd ..

echo ""
print_status $BLUE "🔍 Checking Current Stack Status"
echo "----------------------------------------"

# Check if our target stack already exists
EXISTING_STACK=$(aws cloudformation describe-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-name $STACK_NAME --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$EXISTING_STACK" != "NOT_FOUND" ]; then
    print_status $YELLOW "⚠️  Stack '$STACK_NAME' already exists with status: $EXISTING_STACK"
    echo "   This will be an UPDATE operation"
else
    print_status $GREEN "✅ Stack '$STACK_NAME' does not exist - will be CREATE operation"
fi

echo ""
print_status $BLUE "🔧 Validating External Dependencies"
echo "----------------------------------------"

# Check Knowledge Base (external dependency - not created by this stack)
KB_STATUS=$(aws bedrock-agent get-knowledge-base --knowledge-base-id 5CGJIOV1QM --profile $AWS_PROFILE --region $AWS_REGION --query 'knowledgeBase.status' --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$KB_STATUS" = "ACTIVE" ]; then
    print_status $GREEN "✅ Knowledge Base is available and active"
else
    print_status $YELLOW "⚠️  Knowledge Base not found or not active"
    echo "   Knowledge Base ID: 5CGJIOV1QM"
    echo "   GStreamer expert features may not work properly"
fi

# Check Bedrock model access (external dependency)
BEDROCK_ACCESS=$(aws bedrock list-foundation-models --profile $AWS_PROFILE --region $AWS_REGION --query 'modelSummaries[?contains(modelId, `claude`)].modelId' --output text 2>/dev/null || echo "")
if [ -n "$BEDROCK_ACCESS" ]; then
    print_status $GREEN "✅ Bedrock Claude models are accessible"
else
    print_status $YELLOW "⚠️  Bedrock Claude models may not be accessible"
    echo "   Check Bedrock model access in your AWS account"
fi

echo ""
print_status $BLUE "🎯 Deployment Parameters"
echo "----------------------------------------"

# Show deployment parameters
echo "Stack Name: $STACK_NAME"
echo "AWS Profile: $AWS_PROFILE"
echo "AWS Region: $AWS_REGION"
echo "Operation Type: $([ "$EXISTING_STACK" != "NOT_FOUND" ] && echo "UPDATE" || echo "CREATE")"

# Check CDK bootstrap
CDK_BOOTSTRAP=$(aws cloudformation describe-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-name CDKToolkit --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$CDK_BOOTSTRAP" = "CREATE_COMPLETE" ] || [ "$CDK_BOOTSTRAP" = "UPDATE_COMPLETE" ]; then
    print_status $GREEN "✅ CDK Bootstrap stack exists and is ready"
else
    print_status $YELLOW "⚠️  CDK Bootstrap may need to be run"
    echo "   Run: cdk bootstrap --profile $AWS_PROFILE"
fi

echo ""
print_status $BLUE "🚀 Deployment Readiness Summary"
echo "----------------------------------------"

# Final readiness check
READY=true

if [ "$EXISTING_STACK" != "NOT_FOUND" ] && [ "$EXISTING_STACK" != "CREATE_COMPLETE" ] && [ "$EXISTING_STACK" != "UPDATE_COMPLETE" ]; then
    print_status $RED "❌ Existing stack is in state: $EXISTING_STACK"
    print_status $RED "   Cannot deploy until stack is in a stable state"
    READY=false
fi

if [ "$CDK_BOOTSTRAP" = "NOT_FOUND" ]; then
    print_status $YELLOW "⚠️  CDK Bootstrap required before deployment"
    echo "   Run: cdk bootstrap --profile $AWS_PROFILE"
fi

if [ "$READY" = true ]; then
    print_status $GREEN "🎯 DEPLOYMENT READY"
    echo ""
    echo "✅ All prerequisites validated successfully"
    echo ""
    echo "Next steps:"
    echo "1. Run deployment: ./deploy.sh"
    echo "2. Monitor deployment progress in AWS Console"
    echo "3. Test API endpoints after deployment"
    echo "4. Configure frontend with generated config"
    exit 0
else
    print_status $RED "🚫 DEPLOYMENT NOT READY"
    echo ""
    echo "Please resolve the issues above before deploying."
    echo ""
    echo "Common solutions:"
    echo "• CDK Bootstrap: cdk bootstrap --profile $AWS_PROFILE"
    echo "• Check AWS permissions for Cognito and Bedrock services"
    echo "• Verify AWS region is set to us-east-1"
    exit 1
fi
