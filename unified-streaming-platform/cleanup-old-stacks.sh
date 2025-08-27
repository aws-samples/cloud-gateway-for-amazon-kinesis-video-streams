#!/bin/bash

# Cleanup Script for Old CloudFormation Stacks
# This script safely removes previous iterations of the project components
# while preserving important resources like Cognito user pools

set -e

echo "🧹 Cloud Gateway Project - Stack Cleanup"
echo "========================================"
echo ""

# Check AWS CLI and credentials
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is required but not installed"
    exit 1
fi

if ! aws sts get-caller-identity --profile malone-aws &> /dev/null; then
    echo "❌ AWS credentials not configured for profile malone-aws"
    echo "Please configure AWS CLI with: aws configure --profile malone-aws"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --profile malone-aws --query Account --output text)
REGION="us-east-1"

echo "📍 Account: $ACCOUNT_ID, Region: $REGION"
echo ""

# Function to check if stack exists
stack_exists() {
    aws cloudformation describe-stacks --stack-name "$1" --profile malone-aws --region $REGION &> /dev/null
}

# Function to get stack status
get_stack_status() {
    aws cloudformation describe-stacks --stack-name "$1" --profile malone-aws --region $REGION \
        --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND"
}

# Function to safely delete stack
delete_stack_safely() {
    local stack_name="$1"
    local description="$2"
    
    if stack_exists "$stack_name"; then
        local status=$(get_stack_status "$stack_name")
        echo "🔍 Found $stack_name (Status: $status)"
        echo "   Description: $description"
        
        # Check if stack is in a deletable state
        case "$status" in
            "CREATE_COMPLETE"|"UPDATE_COMPLETE"|"UPDATE_ROLLBACK_COMPLETE"|"ROLLBACK_COMPLETE")
                echo "   ✅ Stack is in deletable state"
                read -p "   Delete $stack_name? (y/N): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    echo "   🗑️  Deleting $stack_name..."
                    aws cloudformation delete-stack --stack-name "$stack_name" --profile malone-aws --region $REGION
                    echo "   ⏳ Waiting for deletion to complete..."
                    aws cloudformation wait stack-delete-complete --stack-name "$stack_name" --profile malone-aws --region $REGION
                    echo "   ✅ $stack_name deleted successfully"
                else
                    echo "   ⏭️  Skipping $stack_name"
                fi
                ;;
            "DELETE_IN_PROGRESS")
                echo "   ⏳ Stack is already being deleted"
                ;;
            "DELETE_FAILED")
                echo "   ⚠️  Stack deletion previously failed - manual intervention may be required"
                ;;
            *)
                echo "   ⚠️  Stack is in state $status - may not be safe to delete"
                ;;
        esac
    else
        echo "✅ $stack_name not found (already cleaned up)"
    fi
    echo ""
}

echo "🔍 Analyzing existing stacks..."
echo ""

# List stacks that are candidates for cleanup
echo "📋 Stacks identified for potential cleanup:"
echo ""

# 1. SimpleRtspServerStack - Failed RTSP server deployment
delete_stack_safely "SimpleRtspServerStack" "Previous RTSP server deployment (in failed state)"

# 2. CameraManagementStack - Previous camera management iteration
echo "⚠️  CameraManagementStack Analysis:"
echo "   This stack contains a DynamoDB table 'CameraConfigurations' that may have data."
echo "   The unified platform will create its own table with the same name."
echo ""
if stack_exists "CameraManagementStack"; then
    # Check if the DynamoDB table has any data
    echo "   🔍 Checking for existing camera data..."
    ITEM_COUNT=$(aws dynamodb scan --table-name CameraConfigurations --profile malone-aws --region $REGION \
        --select COUNT --query 'Count' --output text 2>/dev/null || echo "0")
    
    if [ "$ITEM_COUNT" -gt 0 ]; then
        echo "   ⚠️  WARNING: CameraConfigurations table contains $ITEM_COUNT items"
        echo "   📋 Consider backing up this data before deletion:"
        echo "      aws dynamodb scan --table-name CameraConfigurations --profile malone-aws > camera_backup.json"
        echo ""
        read -p "   Have you backed up the camera data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            delete_stack_safely "CameraManagementStack" "Previous camera management with $ITEM_COUNT camera configs"
        else
            echo "   ⏭️  Skipping CameraManagementStack - backup your data first"
            echo ""
        fi
    else
        delete_stack_safely "CameraManagementStack" "Previous camera management (empty table)"
    fi
else
    echo "   ✅ CameraManagementStack not found"
    echo ""
fi

# 3. PipelineGeneratorStack - Previous pipeline generator
echo "⚠️  PipelineGeneratorStack Analysis:"
echo "   This stack contains a Bedrock Agent that may be different from the current one."
echo "   The unified platform uses knowledge base 5CGJIOV1QM directly."
echo ""
delete_stack_safely "PipelineGeneratorStack" "Previous pipeline generator with Bedrock Agent"

echo "✅ Cleanup Analysis Complete!"
echo ""

echo "🔒 PRESERVED RESOURCES (DO NOT DELETE):"
echo "   • amplify-rtspcloudgatewayui-dev-83039 (Contains Cognito User Pool)"
echo "   • CDKToolkit (CDK bootstrap stack)"
echo "   • Knowledge Base 5CGJIOV1QM (Used by unified platform)"
echo "   • Any other Amplify or production stacks"
echo ""

echo "📝 Next Steps:"
echo "   1. Verify cleanup completed successfully"
echo "   2. Run unified platform deployment: ./deploy.sh"
echo "   3. Test the new unified system"
echo ""

echo "🎯 Ready for unified platform deployment!"
