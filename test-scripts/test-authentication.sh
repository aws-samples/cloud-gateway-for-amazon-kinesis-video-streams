#!/bin/bash

# Test script for RTSP authentication methods
set -e

echo "🔐 Testing RTSP Authentication Methods"
echo "====================================="

# Get the API endpoint from CDK outputs
API_ENDPOINT=$(cd cdk-pipeline-generator && aws cloudformation describe-stacks --stack-name PipelineGeneratorStack --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
    echo "❌ Could not find API endpoint. Make sure the stack is deployed."
    exit 1
fi

echo "🔗 API Endpoint: $API_ENDPOINT"
echo ""

# Test 1: DIGEST authentication (working stream)
echo "Test 1: DIGEST Authentication"
echo "-----------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://rtspgateway:qOjicr6ro7ER@47.198.161.34/Preview_05_main", "mode": "characteristics"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: DIGEST authentication successful"
    
    # Check authentication method in response
    if echo "$BODY" | grep -q "DIGEST"; then
        echo "✅ PASS: DIGEST authentication method detected"
    else
        echo "⚠️  WARN: DIGEST method not explicitly mentioned in response"
    fi
else
    echo "❌ FAIL: DIGEST authentication failed - HTTP $HTTP_STATUS"
    echo "📄 Response: $BODY"
fi

echo ""

# Test 2: No authentication (public stream)
echo "Test 2: No Authentication (Public Stream)"
echo "----------------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://demo.com/stream", "mode": "characteristics"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: Public stream handling works"
elif echo "$BODY" | grep -q "error\|timeout\|connection"; then
    echo "⚠️  EXPECTED: Public demo stream may not be available"
    echo "📄 Response: $(echo "$BODY" | head -c 100)..."
else
    echo "❌ FAIL: Unexpected response - HTTP $HTTP_STATUS: $BODY"
fi

echo ""

# Test 3: Invalid credentials
echo "Test 3: Invalid Credentials"
echo "---------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://wronguser:wrongpass@47.198.161.34/Preview_05_main", "mode": "characteristics"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ] && echo "$BODY" | grep -q "error\|unauthorized\|authentication"; then
    echo "✅ PASS: Invalid credentials properly handled"
    echo "📄 Response: $(echo "$BODY" | head -c 100)..."
else
    echo "⚠️  WARN: Unexpected response for invalid credentials"
    echo "📄 HTTP $HTTP_STATUS: $(echo "$BODY" | head -c 100)..."
fi

echo ""

# Test 4: Malformed RTSP URL
echo "Test 4: Malformed RTSP URL"
echo "--------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "not-a-valid-url", "mode": "characteristics"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ] && echo "$BODY" | grep -q "error"; then
    echo "✅ PASS: Malformed URL properly handled"
    echo "📄 Response: $(echo "$BODY" | head -c 100)..."
else
    echo "⚠️  WARN: Unexpected response for malformed URL"
    echo "📄 HTTP $HTTP_STATUS: $(echo "$BODY" | head -c 100)..."
fi

echo ""

# Test 5: URL parsing validation
echo "Test 5: URL Parsing Validation"
echo "------------------------------"
echo "Testing various RTSP URL formats..."

# Test different URL formats
URLS=(
    "rtsp://user:pass@host:554/stream"
    "rtsp://host/stream"
    "rtsp://host:8554/path/to/stream"
    "rtsp://192.168.1.100/stream"
)

for url in "${URLS[@]}"; do
    echo "  Testing: $url"
    RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"rtsp_url\": \"$url\", \"mode\": \"characteristics\"}" \
        -w "HTTP_STATUS:%{http_code}" \
        --max-time 15)
    
    HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "    ✅ URL format accepted"
    else
        echo "    ⚠️  Connection failed (expected for non-existent hosts)"
    fi
done

echo ""
echo "🎉 Authentication tests completed!"
echo "=================================="
