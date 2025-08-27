#!/bin/bash

# Test script for basic pipeline generator functionality
set -e

echo "🧪 Testing Basic Pipeline Generator Functionality"
echo "================================================"

# Get the API endpoint from CDK outputs
API_ENDPOINT=$(cd cdk-pipeline-generator && aws cloudformation describe-stacks --stack-name PipelineGeneratorStack --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
    echo "❌ Could not find API endpoint. Make sure the stack is deployed."
    exit 1
fi

echo "🔗 API Endpoint: $API_ENDPOINT"
echo ""

# Test 1: Basic validation (missing rtsp_url)
echo "Test 1: Basic validation (missing rtsp_url)"
echo "-------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{}' \
    -w "HTTP_STATUS:%{http_code}")

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "400" ] && echo "$BODY" | grep -q "rtsp_url is required"; then
    echo "✅ PASS: Correctly validates missing rtsp_url"
else
    echo "❌ FAIL: Expected 400 with 'rtsp_url is required', got HTTP $HTTP_STATUS: $BODY"
    exit 1
fi

echo ""

# Test 2: Invalid RTSP URL
echo "Test 2: Invalid RTSP URL handling"
echo "--------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "invalid-url", "mode": "pipeline"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ] && echo "$BODY" | grep -q "error"; then
    echo "✅ PASS: Correctly handles invalid RTSP URL"
else
    echo "⚠️  WARN: Unexpected response for invalid URL: HTTP $HTTP_STATUS: $BODY"
fi

echo ""

# Test 3: Valid request format
echo "Test 3: Valid request format (characteristics mode)"
echo "--------------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://demo:demo@demo.com/stream", "mode": "characteristics"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: API accepts valid request format"
    echo "📄 Response preview: $(echo "$BODY" | head -c 100)..."
else
    echo "❌ FAIL: Expected 200, got HTTP $HTTP_STATUS: $BODY"
fi

echo ""

# Test 4: Pipeline mode
echo "Test 4: Pipeline generation mode"
echo "-------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://demo:demo@demo.com/stream", "mode": "pipeline"}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: Pipeline mode works"
    echo "📄 Response preview: $(echo "$BODY" | head -c 100)..."
else
    echo "❌ FAIL: Expected 200, got HTTP $HTTP_STATUS: $BODY"
fi

echo ""
echo "🎉 Basic functionality tests completed!"
echo "======================================="
