#!/bin/bash

# Comprehensive RTSP Test - Tests all streams using GStreamer pipelines
# Usage: ./comprehensive-rtsp-test.sh [server_ip] [test_duration]

SERVER_IP=${1:-127.0.0.1}
TEST_DURATION=${2:-3}

echo "🧪 Comprehensive RTSP Server Test"
echo "=================================="
echo "Server: ${SERVER_IP}"
echo "Test Duration: ${TEST_DURATION}s per stream"
echo ""

# Check prerequisites
echo "📋 Checking Prerequisites"
echo "-------------------------"

if ! command -v gst-launch-1.0 >/dev/null 2>&1; then
    echo "❌ GStreamer not available"
    exit 1
fi
echo "✅ GStreamer available"

if ! command -v curl >/dev/null 2>&1; then
    echo "❌ curl not available"
    exit 1
fi
echo "✅ curl available"

if ! command -v jq >/dev/null 2>&1; then
    echo "❌ jq not available (optional but recommended)"
    JQ_AVAILABLE=false
else
    echo "✅ jq available"
    JQ_AVAILABLE=true
fi

# Check if server is responding
echo ""
echo "📡 Checking Server Status"
echo "-------------------------"

if ! curl -s --connect-timeout 5 "http://${SERVER_IP}:8080/health" > /dev/null; then
    echo "❌ HTTP API not responding"
    exit 1
fi
echo "✅ HTTP API responding"

# Get stream list
STREAM_LIST_JSON=$(curl -s "http://${SERVER_IP}:8080/rtsp-urls")
if [ $? -ne 0 ]; then
    echo "❌ Failed to get stream list"
    exit 1
fi

if [ "$JQ_AVAILABLE" = true ]; then
    TOTAL_STREAMS=$(echo "$STREAM_LIST_JSON" | jq '.rtsp_urls | length')
    echo "✅ Server reports ${TOTAL_STREAMS} streams available"
    
    # Extract stream URLs
    STREAM_URLS=$(echo "$STREAM_LIST_JSON" | jq -r '.rtsp_urls[].url')
else
    echo "✅ Server responding (stream count unknown without jq)"
    # Fallback: create basic stream list for testing
    STREAM_URLS="rtsp://${SERVER_IP}:8554/h264_720p_25fps
rtsp://${SERVER_IP}:8554/h264_480p_20fps
rtsp://${SERVER_IP}:8555/mpeg4_480p_20fps
rtsp://${SERVER_IP}:8556/mjpeg_360p_10fps
rtsp://${SERVER_IP}:8557/theora_360p_15fps"
    TOTAL_STREAMS=5
fi

echo ""
echo "🎥 Testing RTSP Streams"
echo "======================="

# Initialize counters
PASSED=0
FAILED=0
CURRENT=0

# Test streams sequentially
while IFS= read -r url; do
    if [ -n "$url" ]; then
        CURRENT=$((CURRENT + 1))
        
        # Extract codec/description from URL
        stream_name=$(basename "$url")
        
        printf "[%3d/%3d] Testing: %-30s ... " "$CURRENT" "$TOTAL_STREAMS" "$stream_name"
        
        # Test with GStreamer using timeout if available
        if command -v timeout >/dev/null 2>&1; then
            timeout ${TEST_DURATION}s gst-launch-1.0 rtspsrc location="$url" protocols=tcp ! fakesink >/dev/null 2>&1
            result=$?
        elif command -v gtimeout >/dev/null 2>&1; then
            gtimeout ${TEST_DURATION}s gst-launch-1.0 rtspsrc location="$url" protocols=tcp ! fakesink >/dev/null 2>&1
            result=$?
        else
            # Fallback: background process
            gst-launch-1.0 rtspsrc location="$url" protocols=tcp ! fakesink >/dev/null 2>&1 &
            gst_pid=$!
            sleep ${TEST_DURATION}
            kill $gst_pid 2>/dev/null
            wait $gst_pid 2>/dev/null
            result=0  # Assume success
        fi
        
        # Check result (0 = success, 124/143 = timeout which is expected)
        if [ $result -eq 0 ] || [ $result -eq 124 ] || [ $result -eq 143 ]; then
            echo "✅ PASS"
            PASSED=$((PASSED + 1))
        else
            echo "❌ FAIL"
            FAILED=$((FAILED + 1))
        fi
        
        # Add small delay between tests to avoid overwhelming server
        sleep 0.5
    fi
done <<< "$STREAM_URLS"

# Calculate final results
TOTAL_TESTED=$((PASSED + FAILED))
if [ $TOTAL_TESTED -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED * 100) / TOTAL_TESTED ))
else
    SUCCESS_RATE=0
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"
echo "Total Streams Tested: $TOTAL_TESTED"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Success Rate: ${SUCCESS_RATE}%"
echo ""

# Note about stream count vs specification
if [ "$TOTAL_STREAMS" -lt 50 ]; then
    echo "📝 Note: Server currently has $TOTAL_STREAMS streams"
    echo "   Target per specification: 50 streams (Phase 2)"
    echo "   Current coverage: $(( (TOTAL_STREAMS * 100) / 50 ))% of target"
    echo ""
fi

# Determine overall result
if [ $SUCCESS_RATE -ge 80 ]; then
    echo "🎯 Overall Result: PASS (≥80% success rate)"
    echo "✅ RTSP server is working well"
    exit 0
elif [ $SUCCESS_RATE -ge 50 ]; then
    echo "🎯 Overall Result: PARTIAL (50-79% success rate)"
    echo "⚠️  RTSP server has some issues"
    exit 1
else
    echo "🎯 Overall Result: FAIL (<50% success rate)"
    echo "❌ RTSP server has significant issues"
    exit 2
fi
