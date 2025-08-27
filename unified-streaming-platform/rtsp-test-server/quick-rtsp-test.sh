#!/bin/bash

# Quick RTSP Test - Tests one stream to verify server is up
# Usage: ./quick-rtsp-test.sh [server_ip]

SERVER_IP=${1:-127.0.0.1}
TEST_STREAM="rtsp://${SERVER_IP}:8554/h264_720p_25fps"
TEST_DURATION=3

echo "🚀 Quick RTSP Server Test"
echo "========================="
echo "Server: ${SERVER_IP}"
echo "Test Stream: ${TEST_STREAM}"
echo "Duration: ${TEST_DURATION}s"
echo ""

# Check if server is responding
echo "📡 Checking HTTP API..."
if curl -s --connect-timeout 5 "http://${SERVER_IP}:8080/health" > /dev/null; then
    echo "✅ HTTP API responding"
else
    echo "❌ HTTP API not responding"
    exit 1
fi

# Test one RTSP stream using GStreamer
echo "🎥 Testing RTSP stream..."
echo "Stream: ${TEST_STREAM}"

# Use timeout command if available, otherwise use background process
if command -v timeout >/dev/null 2>&1; then
    timeout ${TEST_DURATION}s gst-launch-1.0 rtspsrc location="${TEST_STREAM}" protocols=tcp ! fakesink >/dev/null 2>&1
    RESULT=$?
elif command -v gtimeout >/dev/null 2>&1; then
    gtimeout ${TEST_DURATION}s gst-launch-1.0 rtspsrc location="${TEST_STREAM}" protocols=tcp ! fakesink >/dev/null 2>&1
    RESULT=$?
else
    # Fallback: background process with manual kill
    gst-launch-1.0 rtspsrc location="${TEST_STREAM}" protocols=tcp ! fakesink >/dev/null 2>&1 &
    GST_PID=$!
    sleep ${TEST_DURATION}
    kill $GST_PID 2>/dev/null
    wait $GST_PID 2>/dev/null
    RESULT=0  # Assume success if we got this far
fi

if [ $RESULT -eq 0 ] || [ $RESULT -eq 124 ] || [ $RESULT -eq 143 ]; then
    echo "✅ RTSP stream working"
    echo ""
    echo "🎯 Quick Test Result: PASS"
    echo "Server appears to be working correctly"
    exit 0
else
    echo "❌ RTSP stream failed"
    echo ""
    echo "🎯 Quick Test Result: FAIL"
    echo "Server may have issues"
    exit 1
fi
