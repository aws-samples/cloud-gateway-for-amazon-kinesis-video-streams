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
STACK_NAME="EnhancedPipelineGeneratorStack"

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
print_status $BLUE "🔍 Checking for Existing Stacks"
echo "----------------------------------------"

# Check if our target stack already exists
EXISTING_STACK=$(aws cloudformation describe-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-name $STACK_NAME --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$EXISTING_STACK" != "NOT_FOUND" ]; then
    print_status $YELLOW "⚠️  Stack '$STACK_NAME' already exists with status: $EXISTING_STACK"
    echo "   This will be an UPDATE operation"
else
    print_status $GREEN "✅ Stack '$STACK_NAME' does not exist - will be CREATE operation"
fi

# Check for potentially conflicting stacks
print_status $BLUE "🔍 Checking for potentially conflicting resources..."

# Check for existing API Gateways
EXISTING_APIS=$(aws apigateway get-rest-apis --profile $AWS_PROFILE --region $AWS_REGION --query 'items[?contains(name, `Enhanced`) || contains(name, `Pipeline`) || contains(name, `RTSP`)].{Name:name, Id:id}' --output table 2>/dev/null || echo "")
if [ -n "$EXISTING_APIS" ] && [ "$EXISTING_APIS" != "" ]; then
    print_status $YELLOW "⚠️  Found potentially conflicting API Gateways:"
    echo "$EXISTING_APIS"
else
    print_status $GREEN "✅ No conflicting API Gateways found"
fi

# Check for existing Lambda functions
EXISTING_LAMBDAS=$(aws lambda list-functions --profile $AWS_PROFILE --region $AWS_REGION --query 'Functions[?contains(FunctionName, `enhanced`) || contains(FunctionName, `pipeline`) || contains(FunctionName, `rtsp`)].{Name:FunctionName, Runtime:Runtime}' --output table 2>/dev/null || echo "")
if [ -n "$EXISTING_LAMBDAS" ] && [ "$EXISTING_LAMBDAS" != "" ]; then
    print_status $YELLOW "⚠️  Found potentially conflicting Lambda functions:"
    echo "$EXISTING_LAMBDAS"
else
    print_status $GREEN "✅ No conflicting Lambda functions found"
fi

# Check for existing ECS clusters
EXISTING_CLUSTERS=$(aws ecs list-clusters --profile $AWS_PROFILE --region $AWS_REGION --query 'clusterArns[?contains(@, `rtsp`) || contains(@, `pipeline`)]' --output table 2>/dev/null || echo "")
if [ -n "$EXISTING_CLUSTERS" ] && [ "$EXISTING_CLUSTERS" != "" ]; then
    print_status $YELLOW "⚠️  Found potentially conflicting ECS clusters:"
    echo "$EXISTING_CLUSTERS"
else
    print_status $GREEN "✅ No conflicting ECS clusters found"
fi

echo ""
print_status $BLUE "📊 Resource Capacity Check"
echo "----------------------------------------"

# Check available VPCs
VPC_COUNT=$(aws ec2 describe-vpcs --profile $AWS_PROFILE --region $AWS_REGION --query 'length(Vpcs)' --output text 2>/dev/null || echo "0")
print_status $GREEN "✅ Available VPCs: $VPC_COUNT"

# Check available subnets
SUBNET_COUNT=$(aws ec2 describe-subnets --profile $AWS_PROFILE --region $AWS_REGION --query 'length(Subnets)' --output text 2>/dev/null || echo "0")
print_status $GREEN "✅ Available Subnets: $SUBNET_COUNT"

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
    echo "Next steps:"
    echo "1. Review any warnings above"
    echo "2. Run deployment: ./deploy.sh"
    echo "3. Monitor deployment progress"
    echo "4. Validate deployment success"
    echo "5. Clean up old stacks (after successful deployment)"
    exit 0
else
    print_status $RED "🚫 DEPLOYMENT NOT READY"
    echo ""
    echo "Please resolve the issues above before deploying."
    exit 1
fi
