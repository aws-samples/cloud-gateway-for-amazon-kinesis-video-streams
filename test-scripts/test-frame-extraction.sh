#!/bin/bash

# Test script for OpenCV frame extraction functionality
set -e

echo "🖼️  Testing OpenCV Frame Extraction"
echo "==================================="

# Get the API endpoint from CDK outputs
API_ENDPOINT=$(cd cdk-pipeline-generator && aws cloudformation describe-stacks --stack-name PipelineGeneratorStack --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' --output text 2>/dev/null || echo "")

if [ -z "$API_ENDPOINT" ]; then
    echo "❌ Could not find API endpoint. Make sure the stack is deployed."
    exit 1
fi

echo "🔗 API Endpoint: $API_ENDPOINT"
echo ""

# Test 1: Frame extraction with working RTSP stream
echo "Test 1: Frame extraction with live RTSP stream"
echo "---------------------------------------------"
echo "⏳ Testing frame extraction (this may take 10-15 seconds)..."

RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://rtspgateway:qOjicr6ro7ER@47.198.161.34/Preview_05_main", "mode": "characteristics", "capture_frame": true}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 60)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: Frame extraction request successful"
    
    # Check if response contains frame data
    if echo "$BODY" | grep -q "frame_capture"; then
        echo "✅ PASS: Response contains frame_capture data"
        
        # Extract frame info using Python
        python3 -c "
import json, sys
try:
    data = json.loads('$BODY')
    frame_capture = data.get('stream_characteristics', {}).get('frame_capture')
    if frame_capture:
        print(f'📸 Frame Size: {frame_capture.get(\"width\")}x{frame_capture.get(\"height\")}')
        print(f'📄 Format: {frame_capture.get(\"format\")}')
        print(f'💾 Size: {frame_capture.get(\"size_bytes\")} bytes')
        print(f'⏱️  Capture Time: {frame_capture.get(\"capture_time_ms\")}ms')
        print(f'🔧 Method: {frame_capture.get(\"extraction_method\")}')
        
        frame_data = frame_capture.get('frame_data', '')
        if len(frame_data) > 100:
            print(f'📊 Base64 Data: {len(frame_data)} characters')
            print('✅ PASS: Frame data successfully extracted')
        else:
            print('❌ FAIL: Frame data too short or missing')
    else:
        print('❌ FAIL: No frame_capture data in response')
except Exception as e:
    print(f'❌ ERROR parsing response: {e}')
"
    else
        echo "❌ FAIL: Response does not contain frame_capture data"
        echo "📄 Response: $(echo "$BODY" | head -c 200)..."
    fi
else
    echo "❌ FAIL: Expected 200, got HTTP $HTTP_STATUS"
    echo "📄 Response: $BODY"
fi

echo ""

# Test 2: Frame extraction disabled
echo "Test 2: Stream analysis without frame extraction"
echo "-----------------------------------------------"
RESPONSE=$(curl -s -X POST "$API_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{"rtsp_url": "rtsp://rtspgateway:qOjicr6ro7ER@47.198.161.34/Preview_05_main", "mode": "characteristics", "capture_frame": false}' \
    -w "HTTP_STATUS:%{http_code}" \
    --max-time 30)

HTTP_STATUS=$(echo "$RESPONSE" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_STATUS:[0-9]*$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ PASS: Stream analysis without frame extraction works"
    
    # Check that frame_capture is not present or is null
    if echo "$BODY" | grep -q "frame_capture.*null\|\"frame_capture\":null" || ! echo "$BODY" | grep -q "frame_capture"; then
        echo "✅ PASS: No frame data when capture_frame=false"
    else
        echo "⚠️  WARN: Frame data present even when capture_frame=false"
    fi
else
    echo "❌ FAIL: Expected 200, got HTTP $HTTP_STATUS: $BODY"
fi

echo ""

# Test 3: Stream characteristics validation
echo "Test 3: Stream characteristics validation"
echo "---------------------------------------"
python3 -c "
import json
try:
    data = json.loads('$BODY')
    chars = data.get('stream_characteristics', {})
    
    video = chars.get('video', {})
    audio = chars.get('audio', {})
    connection = chars.get('connection', {})
    
    print(f'🎥 Video: {video.get(\"codec\", \"Unknown\")} @ {video.get(\"framerate\", \"Unknown\")}')
    print(f'🔊 Audio: {audio.get(\"codec\", \"Unknown\")} @ {audio.get(\"sample_rate\", \"Unknown\")}')
    print(f'🔗 Auth: {connection.get(\"authentication_method\", \"Unknown\")}')
    
    if video.get('codec') and audio.get('codec') and connection.get('authentication_method'):
        print('✅ PASS: Stream characteristics properly detected')
    else:
        print('⚠️  WARN: Some stream characteristics missing')
        
except Exception as e:
    print(f'❌ ERROR: {e}')
"

echo ""
echo "🎉 Frame extraction tests completed!"
echo "===================================="
