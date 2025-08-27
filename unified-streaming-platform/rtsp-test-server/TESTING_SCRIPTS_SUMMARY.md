# RTSP Test Server - Testing Scripts Summary

## 🎯 Consolidated Testing Approach

Based on feedback, the testing scripts have been consolidated from multiple complex scripts to just **two essential scripts** that use GStreamer pipelines instead of ffprobe.

## 📋 Available Testing Scripts

### 1. Quick Health Test
**File**: `quick-rtsp-test.sh`
**Purpose**: Fast verification that the RTSP server is up and working
**Usage**: `./quick-rtsp-test.sh [server_ip]`

**What it tests**:
- HTTP API health endpoint (`/health`)
- One representative RTSP stream (H.264 720p)
- Uses GStreamer with TCP protocol for reliability

**Output Example**:
```
🚀 Quick RTSP Server Test
=========================
Server: 127.0.0.1
Test Stream: rtsp://127.0.0.1:8554/h264_720p_25fps
Duration: 3s

📡 Checking HTTP API...
✅ HTTP API responding
🎥 Testing RTSP stream...
Stream: rtsp://127.0.0.1:8554/h264_720p_25fps
✅ RTSP stream working

🎯 Quick Test Result: PASS
Server appears to be working correctly
```

### 2. Comprehensive Stream Test
**File**: `comprehensive-rtsp-test.sh`
**Purpose**: Test all available RTSP streams using GStreamer pipelines
**Usage**: `./comprehensive-rtsp-test.sh [server_ip] [test_duration]`

**What it tests**:
- All streams reported by the server's HTTP API
- Each stream tested with GStreamer rtspsrc + fakesink
- Uses TCP protocol to avoid UDP networking issues
- Provides detailed success/failure statistics

**Output Example**:
```
🧪 Comprehensive RTSP Server Test
==================================
Server: 127.0.0.1
Test Duration: 3s per stream

📋 Checking Prerequisites
-------------------------
✅ GStreamer available
✅ curl available
✅ jq available

📡 Checking Server Status
-------------------------
✅ HTTP API responding
✅ Server reports 24 streams available

🎥 Testing RTSP Streams
=======================
[  1/ 24] Testing: h264_360p_15fps                ... ✅ PASS
[  2/ 24] Testing: h264_360p_15fps_aac            ... ✅ PASS
...
[ 24/ 24] Testing: theora_720p_25fps              ... ✅ PASS

📊 Test Results Summary
======================
Total Streams Tested: 24
Passed: 24
Failed: 0
Success Rate: 100%

📝 Note: Server currently has 24 streams
   Target per specification: 50 streams (Phase 2)
   Current coverage: 48% of target

🎯 Overall Result: PASS (≥80% success rate)
✅ RTSP server is working well
```

## 🗑️ Removed Scripts

The following scripts have been removed to simplify the testing approach:

- ❌ `test-rtsp-server-codecs.py` - Used ffprobe instead of GStreamer
- ❌ `validate-rtsp-test-server.sh` - Complex Docker-based validation
- ❌ `validate-enhanced-rtsp-server.sh` - Enhanced but overly complex validation

## 🔧 Technical Details

### GStreamer Pipeline Used
```bash
gst-launch-1.0 rtspsrc location="$url" protocols=tcp ! fakesink
```

**Why this pipeline**:
- **rtspsrc**: Native GStreamer RTSP client
- **protocols=tcp**: Avoids UDP networking issues in containers/Docker
- **fakesink**: Discards data, focuses on connection/stream validation
- **Timeout handling**: Uses system timeout commands or manual process management

### Health Check Integration
Both scripts integrate with the server's health check system:
- **HTTP Health Endpoint**: `GET /health` returns port connectivity status
- **Container Health Check**: Uses `simple-health-check.py` for Docker health
- **ECS Health Check**: Configured for AWS Fargate deployment

## 📊 Current Stream Coverage

### Current Implementation: 24 Streams (48% of target)
- **H.264**: 4 streams (360p, 480p, 720p + audio variants)
- **H.265**: 4 streams (360p, 480p, 720p + audio variants)  
- **MPEG-4**: 4 streams (360p, 480p, 720p + audio variants)
- **MPEG-2**: 4 streams (360p, 480p, 720p + audio variants)
- **MJPEG**: 4 streams (360p, 480p, 720p + G.711 audio)
- **Theora**: 4 streams (360p, 480p, 720p + audio variants)

### Target Phase 2: 50 Streams (85% real-world coverage)
According to the RTSP Test Server Specification, Phase 2 should include:
- **Port 8554**: H.264 streams (20 streams) - Currently 4 ❌
- **Port 8555**: MPEG streams (12 streams) - Currently 8 ✅
- **Port 8556**: MJPEG streams (8 streams) - Currently 4 ❌
- **Port 8557**: Open source codecs (10 streams) - Currently 4 ❌

## 🚀 Usage Recommendations

### For Development
```bash
# Quick check during development
./quick-rtsp-test.sh

# Full validation before deployment
./comprehensive-rtsp-test.sh
```

### For CI/CD
```bash
# In deployment scripts
if ./quick-rtsp-test.sh; then
    echo "RTSP server ready"
else
    echo "RTSP server failed to start"
    exit 1
fi
```

### For Monitoring
```bash
# Periodic health checks
./comprehensive-rtsp-test.sh localhost 2
```

## 🎯 Success Criteria

### Quick Test
- **HTTP API responding**: Health endpoint returns 200
- **RTSP stream working**: GStreamer can connect and receive data
- **Result**: PASS/FAIL

### Comprehensive Test
- **≥80% success rate**: PASS - Server working well
- **50-79% success rate**: PARTIAL - Some issues detected
- **<50% success rate**: FAIL - Significant problems

## 🔍 Troubleshooting

### Common Issues
1. **UDP networking problems**: Scripts use TCP protocol to avoid this
2. **Container networking**: Use container IP or localhost appropriately
3. **GStreamer not available**: Scripts check prerequisites first
4. **Timeout issues**: Configurable test duration (default 3s)

### Debug Commands
```bash
# Test specific stream manually
gst-launch-1.0 rtspsrc location=rtsp://127.0.0.1:8554/h264_720p_25fps protocols=tcp ! fakesink

# Check server health directly
curl http://127.0.0.1:8080/health

# Get stream list
curl http://127.0.0.1:8080/rtsp-urls | jq .
```

---

**Status**: ✅ Consolidated and tested
**Last Updated**: 2025-08-27 19:38 UTC
**Scripts**: 2 (down from 5+)
**Test Method**: GStreamer pipelines (not ffprobe)
**Current Coverage**: 24/50 streams (48% of Phase 2 target)
