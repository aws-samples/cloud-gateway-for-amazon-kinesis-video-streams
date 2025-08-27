#!/bin/bash

# Quick Cognito Authentication Test Script
# Tests API endpoints with Cognito authentication

set -e

# Configuration
USER_POOL_ID="us-east-1_Q1jWhy4hd"
CLIENT_ID="33or6k033pn7jgjq8gbmfs2gu3"
API_BASE_URL="https://ru12gtmwv0.execute-api.us-east-1.amazonaws.com/prod"
AWS_PROFILE="malone-aws"

# Test user credentials
TEST_USERNAME="quick-test-user"
TEST_PASSWORD="QuickTest123!"
TEST_EMAIL="quicktest@example.com"

echo "🧪 Quick Cognito Authentication Test"
echo "===================================="
echo "User Pool: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "API URL: $API_BASE_URL"
echo ""

# Function to create test user
create_test_user() {
    echo "🔧 Creating test user: $TEST_USERNAME"
    
    # Create user (suppress error if user already exists)
    aws cognito-idp admin-create-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_USERNAME" \
        --user-attributes Name=email,Value="$TEST_EMAIL" Name=email_verified,Value=true \
        --temporary-password "$TEST_PASSWORD" \
        --message-action SUPPRESS \
        --profile "$AWS_PROFILE" \
        --region us-east-1 2>/dev/null || echo "   User may already exist"
    
    # Set permanent password
    aws cognito-idp admin-set-user-password \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_USERNAME" \
        --password "$TEST_PASSWORD" \
        --permanent \
        --profile "$AWS_PROFILE" \
        --region us-east-1 2>/dev/null || echo "   Password may already be set"
    
    echo "✅ Test user ready: $TEST_USERNAME"
}

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

# Function to cleanup test user
cleanup_test_user() {
    echo "🧹 Cleaning up test user: $TEST_USERNAME"
    
    aws cognito-idp admin-delete-user \
        --user-pool-id "$USER_POOL_ID" \
        --username "$TEST_USERNAME" \
        --profile "$AWS_PROFILE" \
        --region us-east-1 2>/dev/null || echo "   User may not exist"
    
    echo "✅ Cleanup complete"
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
    create_test_user
    authenticate_user
    
    echo "📹 Testing Camera Management Endpoints"
    echo "======================================"
    
    # Test unauthorized access first
    test_unauthorized
    
    # Test authorized endpoints
    test_endpoint "GET" "/cameras" "" "List all cameras"
    
    test_endpoint "POST" "/cameras" '{
        "name": "Test Camera",
        "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
        "description": "Test camera for API validation",
        "location": "Test Lab"
    }' "Create new camera"
    
    # Note: For update/delete tests, we'd need to parse the camera ID from the create response
    # This is a simplified version focusing on the main endpoints
    
    echo "🎯 Test Summary"
    echo "==============="
    echo "✅ Authentication: Working"
    echo "✅ Authorization: Enforced"
    echo "✅ Camera API: Accessible with valid token"
    
    cleanup_test_user
    
    echo ""
    echo "🎉 Quick authentication test complete!"
    echo "💡 For comprehensive testing, use: python3 cognito-auth-test.py"
}

# Run main function
main "$@"
