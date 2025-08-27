#!/bin/bash

# Frontend Configuration Generator
# Automatically generates frontend-config.json from CDK stack outputs

set -e

# Configuration
STACK_NAME="UnifiedStreamingPlatformStack"
AWS_PROFILE="malone-aws"
AWS_REGION="us-east-1"
TEMPLATE_FILE="frontend-config-template.json"
OUTPUT_FILE="frontend-config.json"

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

print_status $BLUE "🔧 Frontend Configuration Generator"
echo "=========================================="
echo ""

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    print_status $RED "❌ Template file '$TEMPLATE_FILE' not found"
    exit 1
fi

# Check AWS CLI and credentials
if ! command -v aws &> /dev/null; then
    print_status $RED "❌ AWS CLI is required but not installed"
    exit 1
fi

if ! aws sts get-caller-identity --profile $AWS_PROFILE &> /dev/null; then
    print_status $RED "❌ AWS credentials not configured for profile $AWS_PROFILE"
    echo "Please configure AWS CLI with: aws configure --profile $AWS_PROFILE"
    exit 1
fi

print_status $BLUE "🔍 Fetching CDK Stack Outputs"
echo "Stack: $STACK_NAME"
echo "Profile: $AWS_PROFILE"
echo "Region: $AWS_REGION"
echo ""

# Get CDK stack outputs
STACK_OUTPUTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --query 'Stacks[0].Outputs' \
    --output json 2>/dev/null)

if [ $? -ne 0 ] || [ "$STACK_OUTPUTS" = "null" ] || [ -z "$STACK_OUTPUTS" ]; then
    print_status $RED "❌ Failed to get CDK stack outputs"
    echo "Make sure the stack '$STACK_NAME' is deployed and accessible"
    exit 1
fi

print_status $GREEN "✅ Successfully retrieved CDK outputs"

# Function to extract output value by key
get_output_value() {
    local key=$1
    echo "$STACK_OUTPUTS" | jq -r ".[] | select(.OutputKey==\"$key\") | .OutputValue" 2>/dev/null || echo ""
}

# Extract all required values
AWS_ACCOUNT_ID=$(get_output_value "AWSAccountId")
AWS_REGION_OUTPUT=$(get_output_value "AWSRegion")
COGNITO_USER_POOL_ID=$(get_output_value "CognitoUserPoolId")
COGNITO_WEB_CLIENT_ID=$(get_output_value "CognitoUserPoolWebClientId")
COGNITO_NATIVE_CLIENT_ID=$(get_output_value "CognitoUserPoolNativeClientId")
COGNITO_REGION=$(get_output_value "CognitoRegion")
API_BASE_URL=$(get_output_value "UnifiedApiEndpoint")
API_GATEWAY_ID=$(get_output_value "ApiGatewayId")
API_GATEWAY_STAGE=$(get_output_value "ApiGatewayStage")
KNOWLEDGE_BASE_ID=$(get_output_value "KnowledgeBaseId")
CLAUDE_MODEL=$(get_output_value "ClaudeModel")
ENHANCED_LAMBDA_FUNCTION=$(get_output_value "EnhancedLambdaFunctionName")
CAMERA_LAMBDA_FUNCTION=$(get_output_value "CameraLambdaFunctionName")
CAMERAS_TABLE_NAME=$(get_output_value "CamerasTableName")
RTSP_TEST_SERVER_CLUSTER=$(get_output_value "RTSPTestServerCluster")
RTSP_TEST_SERVER_SERVICE=$(get_output_value "RTSPTestServerService")

# Validate required values
REQUIRED_VALUES=(
    "AWS_ACCOUNT_ID:$AWS_ACCOUNT_ID"
    "COGNITO_USER_POOL_ID:$COGNITO_USER_POOL_ID"
    "COGNITO_WEB_CLIENT_ID:$COGNITO_WEB_CLIENT_ID"
    "API_BASE_URL:$API_BASE_URL"
    "API_GATEWAY_ID:$API_GATEWAY_ID"
)

print_status $BLUE "🔍 Validating Required Values"
MISSING_VALUES=()
for item in "${REQUIRED_VALUES[@]}"; do
    key="${item%%:*}"
    value="${item##*:}"
    if [ -z "$value" ] || [ "$value" = "null" ]; then
        MISSING_VALUES+=("$key")
    fi
done

if [ ${#MISSING_VALUES[@]} -gt 0 ]; then
    print_status $RED "❌ Missing required CDK outputs:"
    for missing in "${MISSING_VALUES[@]}"; do
        echo "   - $missing"
    done
    exit 1
fi

print_status $GREEN "✅ All required values found"
echo ""

# Try to get RTSP Test Server public IP
print_status $BLUE "🔍 Attempting to get RTSP Test Server Public IP"
RTSP_SERVER_PUBLIC_IP=""

if [ -n "$RTSP_TEST_SERVER_SERVICE" ] && [ "$RTSP_TEST_SERVER_SERVICE" != "Not deployed" ]; then
    # Get the ECS service details to find the task ARN
    TASK_ARN=$(aws ecs list-tasks \
        --cluster "$RTSP_TEST_SERVER_CLUSTER" \
        --service-name "$RTSP_TEST_SERVER_SERVICE" \
        --profile $AWS_PROFILE \
        --region $AWS_REGION \
        --query 'taskArns[0]' \
        --output text 2>/dev/null)
    
    if [ -n "$TASK_ARN" ] && [ "$TASK_ARN" != "None" ]; then
        # Get the ENI ID from the task
        ENI_ID=$(aws ecs describe-tasks \
            --cluster "$RTSP_TEST_SERVER_CLUSTER" \
            --tasks "$TASK_ARN" \
            --profile $AWS_PROFILE \
            --region $AWS_REGION \
            --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' \
            --output text 2>/dev/null)
        
        if [ -n "$ENI_ID" ] && [ "$ENI_ID" != "None" ]; then
            # Get the public IP from the ENI
            RTSP_SERVER_PUBLIC_IP=$(aws ec2 describe-network-interfaces \
                --network-interface-ids "$ENI_ID" \
                --profile $AWS_PROFILE \
                --region $AWS_REGION \
                --query 'NetworkInterfaces[0].Association.PublicIp' \
                --output text 2>/dev/null)
        fi
    fi
fi

if [ -n "$RTSP_SERVER_PUBLIC_IP" ] && [ "$RTSP_SERVER_PUBLIC_IP" != "None" ]; then
    print_status $GREEN "✅ Found RTSP Test Server Public IP: $RTSP_SERVER_PUBLIC_IP"
else
    RTSP_SERVER_PUBLIC_IP="REPLACE_WITH_RTSP_SERVER_PUBLIC_IP"
    print_status $YELLOW "⚠️  Could not automatically determine RTSP Test Server Public IP"
    echo "   You'll need to manually replace '$RTSP_SERVER_PUBLIC_IP' in the config file"
fi

echo ""
print_status $BLUE "🔧 Generating Frontend Configuration"

# Create the frontend config by replacing placeholders in template
CONFIG_CONTENT=$(cat "$TEMPLATE_FILE")

# Replace all placeholders
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_AWSAccountId }}/$AWS_ACCOUNT_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_AWSRegion }}/$AWS_REGION_OUTPUT/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CognitoUserPoolId }}/$COGNITO_USER_POOL_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CognitoUserPoolWebClientId }}/$COGNITO_WEB_CLIENT_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CognitoUserPoolNativeClientId }}/$COGNITO_NATIVE_CLIENT_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CognitoRegion }}/$COGNITO_REGION/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s|{{ REPLACE_WITH_CDK_OUTPUT_UnifiedApiEndpoint }}|$API_BASE_URL|g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_ApiGatewayId }}/$API_GATEWAY_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_ApiGatewayStage }}/$API_GATEWAY_STAGE/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_KnowledgeBaseId }}/$KNOWLEDGE_BASE_ID/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_ClaudeModel }}/$CLAUDE_MODEL/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_EnhancedLambdaFunctionName }}/$ENHANCED_LAMBDA_FUNCTION/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CameraLambdaFunctionName }}/$CAMERA_LAMBDA_FUNCTION/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_CamerasTableName }}/$CAMERAS_TABLE_NAME/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_RTSPTestServerCluster }}/$RTSP_TEST_SERVER_CLUSTER/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_RTSPTestServerService }}/$RTSP_TEST_SERVER_SERVICE/g")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_RTSP_SERVER_PUBLIC_IP }}/$RTSP_SERVER_PUBLIC_IP/g")

# Write the generated config
echo "$CONFIG_CONTENT" > "$OUTPUT_FILE"

print_status $GREEN "✅ Frontend configuration generated successfully!"
echo ""
print_status $BLUE "📄 Generated File: $OUTPUT_FILE"
echo ""

# Show summary of key values
print_status $BLUE "📋 Configuration Summary:"
echo "----------------------------------------"
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION_OUTPUT"
echo "Cognito User Pool ID: $COGNITO_USER_POOL_ID"
echo "Cognito Web Client ID: $COGNITO_WEB_CLIENT_ID"
echo "API Base URL: $API_BASE_URL"
echo "API Gateway ID: $API_GATEWAY_ID"
echo "Knowledge Base ID: $KNOWLEDGE_BASE_ID"
echo "RTSP Server Public IP: $RTSP_SERVER_PUBLIC_IP"
echo ""

if [ "$RTSP_SERVER_PUBLIC_IP" = "REPLACE_WITH_RTSP_SERVER_PUBLIC_IP" ]; then
    print_status $YELLOW "⚠️  Manual Action Required:"
    echo "Replace 'REPLACE_WITH_RTSP_SERVER_PUBLIC_IP' in $OUTPUT_FILE with the actual RTSP server public IP"
    echo "You can find this in the AWS Console under ECS > Clusters > $RTSP_TEST_SERVER_CLUSTER > Services > $RTSP_TEST_SERVER_SERVICE"
    echo ""
fi

print_status $GREEN "🎯 Frontend configuration is ready for use!"
echo "Copy $OUTPUT_FILE to your frontend application's configuration directory."
