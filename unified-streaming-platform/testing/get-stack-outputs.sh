#!/bin/bash

# Get Stack Outputs Helper Script
# Fetches CDK stack outputs and exports them as environment variables

set -e

STACK_NAME="UnifiedStreamingPlatformStack"
AWS_PROFILE="malone-aws"
AWS_REGION="us-east-1"

echo "🔍 Fetching CDK Stack Outputs..."
echo "================================="
echo "Stack: $STACK_NAME"
echo "Profile: $AWS_PROFILE"
echo "Region: $AWS_REGION"
echo ""

# Function to get stack output value
get_output() {
    local output_key=$1
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --profile "$AWS_PROFILE" \
        --region "$AWS_REGION" \
        --query "Stacks[0].Outputs[?OutputKey=='$output_key'].OutputValue" \
        --output text 2>/dev/null || echo ""
}

# Get all required outputs
export USER_POOL_ID=$(get_output "CognitoUserPoolId")
export CLIENT_ID=$(get_output "CognitoUserPoolWebClientId")
export API_BASE_URL=$(get_output "UnifiedApiEndpoint")
export AWS_ACCOUNT_ID=$(get_output "AWSAccountId")
export KNOWLEDGE_BASE_ID=$(get_output "KnowledgeBaseId")

# Validate that we got the required values
if [ -z "$USER_POOL_ID" ] || [ -z "$CLIENT_ID" ] || [ -z "$API_BASE_URL" ]; then
    echo "❌ Failed to get required CDK outputs"
    echo "   USER_POOL_ID: ${USER_POOL_ID:-NOT_FOUND}"
    echo "   CLIENT_ID: ${CLIENT_ID:-NOT_FOUND}"
    echo "   API_BASE_URL: ${API_BASE_URL:-NOT_FOUND}"
    echo ""
    echo "Make sure the CDK stack is deployed:"
    echo "   ./deploy.sh"
    exit 1
fi

echo "✅ Successfully retrieved CDK outputs:"
echo "   USER_POOL_ID: $USER_POOL_ID"
echo "   CLIENT_ID: $CLIENT_ID"
echo "   API_BASE_URL: $API_BASE_URL"
echo "   AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "   KNOWLEDGE_BASE_ID: $KNOWLEDGE_BASE_ID"
echo ""

# Export for use by other scripts
echo "📤 Exporting environment variables for test scripts..."
echo "export USER_POOL_ID='$USER_POOL_ID'"
echo "export CLIENT_ID='$CLIENT_ID'"
echo "export API_BASE_URL='$API_BASE_URL'"
echo "export AWS_ACCOUNT_ID='$AWS_ACCOUNT_ID'"
echo "export KNOWLEDGE_BASE_ID='$KNOWLEDGE_BASE_ID'"
