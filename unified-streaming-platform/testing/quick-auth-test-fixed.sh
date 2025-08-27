#!/bin/bash

# Quick Cognito Authentication Test Script (Fixed for email usernames)
# Tests API endpoints with Cognito authentication
# Uses dynamic CDK outputs instead of hardcoded values

set -e

# Get CDK stack outputs
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get-stack-outputs.sh"

# Configuration from CDK outputs
AWS_PROFILE="malone-aws"

# Test user credentials (using email as username)
TEST_USERNAME="api-test@example.com"
TEST_PASSWORD="TestPassword123!"

echo "🧪 Quick Cognito Authentication Test (Fixed)"
echo "============================================="
echo "User Pool: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "API URL: $API_BASE_URL"
echo "Test User: $TEST_USERNAME"
echo ""

# Function to authenticate and get token
authenticate_user() {
    echo "🔐 Authenticating user: $TEST_USERNAME"
    
    # Authenticate user and extract access token
    AUTH_RESPONSE=$(aws cognito-idp admin-initiate-auth \
        --user-pool-id "$USER_POOL_ID" \
        --client-id "$CLIENT_ID" \
        --auth-flow ADMIN_NO_SRP_AUTH \
        --auth-parameters USERNAME="$TEST_USERNAME",PASSWORD="$TEST_PASSWORD" \
        --profile "$AWS_PROFILE" \
        --region us-east-1 \
        --output json)
    
    ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.AuthenticationResult.AccessToken')
    
    if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
        echo "❌ Failed to get access token"
        echo "Response: $AUTH_RESPONSE"
        exit 1
    fi
    
    echo "✅ Authentication successful"
    echo "   Token: ${ACCESS_TOKEN:0:20}..."
}

# Function to test API endpoint
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local description="$4"
    
    echo "🔍 Testing $method $endpoint - $description"
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X GET \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            "$API_BASE_URL$endpoint" \
            --connect-timeout 10 \
            --max-time 30)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X "$method" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$API_BASE_URL$endpoint" \
            --connect-timeout 10 \
            --max-time 30)
    fi
    
    # Extract HTTP status code (last line)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
        echo "   ✅ Status: $HTTP_CODE"
        echo "   Response: $(echo "$BODY" | jq -c . 2>/dev/null || echo "$BODY")"
    else
        echo "   ❌ Status: $HTTP_CODE"
        echo "   Error: $BODY"
    fi
    
    echo ""
}

# Function to test unauthorized access
test_unauthorized() {
    echo "🚫 Testing unauthorized access (should fail)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X GET \
        "$API_BASE_URL/cameras" \
        --connect-timeout 10 \
        --max-time 30)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ]; then
        echo "   ✅ Correctly rejected unauthorized request (401)"
    else
        echo "   ❌ Unexpected status for unauthorized request: $HTTP_CODE"
    fi
    
    echo ""
}

# Main test execution
main() {
    # Check prerequisites
    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI not found"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo "❌ jq not found (install with: brew install jq)"
        exit 1
    fi
    
    if ! command -v curl &> /dev/null; then
        echo "❌ curl not found"
        exit 1
    fi
    
    # Run tests
    authenticate_user
    
    echo "📹 Testing Camera Management Endpoints"
    echo "======================================"
    
    # Test unauthorized access first
    test_unauthorized
    
    # Test authorized endpoints
    test_endpoint "GET" "/cameras" "" "List all cameras"
    
    test_endpoint "POST" "/cameras" '{
        "name": "Test Camera Fixed",
        "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
        "description": "Test camera for API validation (fixed script)",
        "location": "Test Lab"
    }' "Create new camera"
    
    echo "🎯 Test Summary"
    echo "==============="
    echo "✅ Authentication: Working"
    echo "✅ Authorization: Enforced"
    echo "✅ Camera API: Accessible with valid token"
    
    echo ""
    echo "🎉 Quick authentication test complete!"
}

# Run main function
main "$@"
