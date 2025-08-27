#!/bin/bash

# Post-Deployment Cleanup Script
# Safely removes old project components after successful deployment

set -e

echo "🧹 Post-Deployment Cleanup for Unified Streaming Platform"
echo "=========================================================="
echo ""

# Configuration
AWS_PROFILE="malone-aws"
AWS_REGION="us-east-1"
NEW_STACK_NAME="EnhancedPipelineGeneratorStack"

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

print_status $BLUE "🔍 Verifying New Stack Deployment"
echo "----------------------------------------"

# Check if new stack is successfully deployed
NEW_STACK_STATUS=$(aws cloudformation describe-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-name $NEW_STACK_NAME --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$NEW_STACK_STATUS" = "CREATE_COMPLETE" ] || [ "$NEW_STACK_STATUS" = "UPDATE_COMPLETE" ]; then
    print_status $GREEN "✅ New stack '$NEW_STACK_NAME' is successfully deployed ($NEW_STACK_STATUS)"
else
    print_status $RED "❌ New stack '$NEW_STACK_NAME' is not ready (Status: $NEW_STACK_STATUS)"
    print_status $RED "   Cannot proceed with cleanup until new stack is successfully deployed"
    exit 1
fi

echo ""
print_status $BLUE "🔍 Identifying Old Project Components"
echo "----------------------------------------"

# List of potential old stack patterns to look for
OLD_STACK_PATTERNS=(
    "enhanced-pipeline-generator"
    "cdk-pipeline-generator" 
    "lambda-sdp-extractor"
    "rtsp-test-server"
    "gstreamer-expert"
)

# Find old stacks (excluding the Amplify UI stack which we want to keep)
OLD_STACKS=()
for pattern in "${OLD_STACK_PATTERNS[@]}"; do
    FOUND_STACKS=$(aws cloudformation list-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE --query "StackSummaries[?contains(StackName, '$pattern') && StackName != '$NEW_STACK_NAME'].StackName" --output text 2>/dev/null || echo "")
    if [ -n "$FOUND_STACKS" ] && [ "$FOUND_STACKS" != "" ]; then
        for stack in $FOUND_STACKS; do
            OLD_STACKS+=("$stack")
        done
    fi
done

if [ ${#OLD_STACKS[@]} -eq 0 ]; then
    print_status $GREEN "✅ No old project stacks found to clean up"
else
    print_status $YELLOW "⚠️  Found ${#OLD_STACKS[@]} old project stack(s):"
    for stack in "${OLD_STACKS[@]}"; do
        echo "   - $stack"
    done
fi

echo ""
print_status $BLUE "🔍 Checking for Orphaned Resources"
echo "----------------------------------------"

# Check for old Lambda functions (excluding Amplify ones)
OLD_LAMBDAS=$(aws lambda list-functions --profile $AWS_PROFILE --region $AWS_REGION --query 'Functions[?contains(FunctionName, `enhanced-pipeline`) || contains(FunctionName, `cdk-pipeline`) || contains(FunctionName, `lambda-sdp`)].FunctionName' --output text 2>/dev/null || echo "")
if [ -n "$OLD_LAMBDAS" ] && [ "$OLD_LAMBDAS" != "" ]; then
    print_status $YELLOW "⚠️  Found potentially orphaned Lambda functions:"
    for lambda in $OLD_LAMBDAS; do
        echo "   - $lambda"
    done
else
    print_status $GREEN "✅ No orphaned Lambda functions found"
fi

# Check for old API Gateways
OLD_APIS=$(aws apigateway get-rest-apis --profile $AWS_PROFILE --region $AWS_REGION --query 'items[?contains(name, `enhanced-pipeline`) || contains(name, `cdk-pipeline`) || contains(name, `lambda-sdp`)].{Name:name, Id:id}' --output text 2>/dev/null || echo "")
if [ -n "$OLD_APIS" ] && [ "$OLD_APIS" != "" ]; then
    print_status $YELLOW "⚠️  Found potentially orphaned API Gateways:"
    echo "$OLD_APIS"
else
    print_status $GREEN "✅ No orphaned API Gateways found"
fi

echo ""
print_status $BLUE "🎯 Cleanup Options"
echo "----------------------------------------"

if [ ${#OLD_STACKS[@]} -eq 0 ] && [ -z "$OLD_LAMBDAS" ] && [ -z "$OLD_APIS" ]; then
    print_status $GREEN "🎉 No cleanup needed!"
    print_status $GREEN "   All old components have been successfully consolidated into the new unified stack."
    exit 0
fi

echo "The following cleanup actions are available:"
echo ""

if [ ${#OLD_STACKS[@]} -gt 0 ]; then
    echo "1. Delete old CloudFormation stacks:"
    for stack in "${OLD_STACKS[@]}"; do
        echo "   aws cloudformation delete-stack --profile $AWS_PROFILE --region $AWS_REGION --stack-name $stack"
    done
    echo ""
fi

if [ -n "$OLD_LAMBDAS" ] && [ "$OLD_LAMBDAS" != "" ]; then
    echo "2. Delete orphaned Lambda functions:"
    for lambda in $OLD_LAMBDAS; do
        echo "   aws lambda delete-function --profile $AWS_PROFILE --region $AWS_REGION --function-name $lambda"
    done
    echo ""
fi

if [ -n "$OLD_APIS" ] && [ "$OLD_APIS" != "" ]; then
    echo "3. Delete orphaned API Gateways:"
    echo "   (Manual deletion recommended via AWS Console)"
    echo ""
fi

echo ""
print_status $YELLOW "⚠️  IMPORTANT SAFETY NOTES:"
echo "----------------------------------------"
echo "1. 🛡️  The Amplify stack 'amplify-rtspcloudgatewayui-dev-83039' will be PRESERVED"
echo "   This contains the frontend UI and can work with the new backend"
echo ""
echo "2. 🔍 Please verify the new stack is fully functional before cleanup:"
echo "   - Test API endpoints"
echo "   - Verify Lambda functions work"
echo "   - Test RTSP server deployment"
echo "   - Validate all features"
echo ""
echo "3. 📋 Cleanup is OPTIONAL and can be done later"
echo "   Old stacks may incur minimal costs but won't interfere"
echo ""

# Interactive cleanup option
read -p "Do you want to proceed with automatic cleanup? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status $BLUE "🧹 Starting Automatic Cleanup"
    echo "----------------------------------------"
    
    # Delete old stacks
    for stack in "${OLD_STACKS[@]}"; do
        print_status $YELLOW "🗑️  Deleting stack: $stack"
        if aws cloudformation delete-stack --profile $AWS_PROFILE --region $AWS_REGION --stack-name $stack; then
            print_status $GREEN "✅ Initiated deletion of $stack"
        else
            print_status $RED "❌ Failed to delete $stack"
        fi
    done
    
    # Note: Lambda and API Gateway cleanup would be more complex and risky
    # Better to let CloudFormation handle it via stack deletion
    
    if [ ${#OLD_STACKS[@]} -gt 0 ]; then
        echo ""
        print_status $BLUE "⏳ Stack deletion initiated"
        echo "Monitor progress with:"
        echo "aws cloudformation list-stacks --profile $AWS_PROFILE --region $AWS_REGION --stack-status-filter DELETE_IN_PROGRESS DELETE_COMPLETE"
    fi
    
else
    print_status $BLUE "ℹ️  Cleanup skipped"
    echo "You can run this script again later or manually clean up resources."
fi

echo ""
print_status $GREEN "🎯 Cleanup Summary Complete"
echo "New unified stack is deployed and ready to use!"
echo "Frontend UI stack preserved for continued use."
