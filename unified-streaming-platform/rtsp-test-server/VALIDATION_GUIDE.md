# RTSP Test Server Validation Guide

This guide explains how to use the comprehensive validation script to test the RTSP Test Server component.

## Overview

The `validate-rtsp-test-server.sh` script provides automated testing of all 24 RTSP endpoints with proper GStreamer pipelines that validate both video and audio streams.

## Prerequisites

### Required Software
- **Docker**: For running the RTSP Test Server container
- **GStreamer**: For testing RTSP streams (`gst-launch-1.0` command)
- **jq**: For JSON parsing (HTTP API validation)
- **curl**: For HTTP API testing

### macOS Installation
```bash
# Install GStreamer
brew install gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav

# Install jq
brew install jq
```

### Ubuntu/Debian Installation
```bash
# Install GStreamer
sudo apt-get update
sudo apt-get install gstreamer1.0-tools gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav

# Install jq
sudo apt-get install jq curl
```

## Usage

### Basic Usage
```bash
# Run full validation (all 24 RTSP endpoints + HTTP API)
./validate-rtsp-test-server.sh

# Run quick validation (subset of streams for fast testing)
./validate-rtsp-test-server.sh --quick

# Run with custom test duration per stream
./validate-rtsp-test-server.sh --duration 5

# Keep container running after tests (for debugging)
./validate-rtsp-test-server.sh --no-cleanup
```

### Command Line Options
| Option | Description | Default |
|--------|-------------|---------|
| `--quick` | Run quick test (one stream per codec type) | Full test |
| `--no-cleanup` | Don't cleanup container after tests | Cleanup enabled |
| `--duration N` | Test duration per stream in seconds | 3 seconds |
| `--help` | Show usage information | - |

## What the Script Tests

### 1. Prerequisites Check
- ✅ Docker availability and functionality
- ✅ GStreamer installation (`gst-launch-1.0`)
- ✅ Docker image existence (`rtsp-test-server`)

### 2. RTSP Server Startup
- ✅ Container deployment with proper port mapping
- ✅ Server initialization and readiness
- ✅ HTTP API responsiveness

### 3. Stream Validation (24 Endpoints)

#### Port 8554: Modern Codecs (H.264/H.265)
- **H.264 Streams**: 360p/15fps, 360p/15fps+AAC, 480p/20fps, 720p/25fps
- **H.265 Streams**: 360p/15fps, 360p/15fps+AAC, 480p/20fps, 720p/25fps
- **Pipeline**: `rtspsrc ! rtph264depay ! h264parse ! avdec_h264 ! fakesink`

#### Port 8555: MPEG Codecs (MPEG-2/MPEG-4)
- **MPEG-2 Streams**: 360p/15fps, 360p/15fps+AAC, 480p/20fps, 720p/25fps
- **MPEG-4 Streams**: 360p/15fps, 360p/15fps+AAC, 480p/20fps, 720p/25fps
- **Pipeline**: `rtspsrc ! rtpmpvdepay ! mpegvideoparse ! avdec_mpeg2video ! fakesink`

#### Port 8556: MJPEG (IP Camera Standard)
- **MJPEG Streams**: 360p/10fps, 360p/10fps+G.711, 480p/15fps, 720p/20fps
- **Pipeline**: `rtspsrc ! rtpjpegdepay ! jpegdec ! fakesink`

#### Port 8557: Theora (Open Source)
- **Theora Streams**: 360p/15fps, 360p/15fps+AAC, 480p/20fps, 720p/25fps
- **Pipeline**: `rtspsrc ! rtptheoradepay ! theoradec ! fakesink`

### 4. Audio+Video Stream Testing
For streams with audio, the script uses dual-pipeline approach:
```bash
gst-launch-1.0 rtspsrc location=rtsp://IP:PORT/STREAM name=src \
  src. ! queue ! application/x-rtp,media=video ! [video_pipeline] ! fakesink \
  src. ! queue ! application/x-rtp,media=audio ! [audio_pipeline] ! fakesink
```

### 5. HTTP REST API Testing
- ✅ API endpoint responsiveness (`/rtsp-urls`)
- ✅ JSON response validation
- ✅ CORS headers verification
- ✅ Stream metadata accuracy

## GStreamer Pipeline Reference

### Video Codecs
| Codec | Depayloader | Parser | Decoder |
|-------|-------------|--------|---------|
| H.264 | `rtph264depay` | `h264parse` | `avdec_h264` |
| H.265 | `rtph265depay` | `h265parse` | `avdec_h265` |
| MPEG-2 | `rtpmpvdepay` | `mpegvideoparse` | `avdec_mpeg2video` |
| MPEG-4 | `rtpmp4vdepay` | `mpeg4videoparse` | `avdec_mpeg4` |
| MJPEG | `rtpjpegdepay` | - | `jpegdec` |
| Theora | `rtptheoradepay` | - | `theoradec` |

### Audio Codecs
| Codec | Depayloader | Parser | Decoder |
|-------|-------------|--------|---------|
| AAC | `rtpmp4adepay` | `aacparse` | `avdec_aac` |
| G.711 μ-law | `rtppcmudepay` | - | `mulawdec` |

## Expected Output

### Successful Run
```
🧪 RTSP Test Server Comprehensive Validation
=============================================

📋 Checking Prerequisites
----------------------------------------
✅ Docker available
✅ GStreamer available
✅ Docker image 'rtsp-test-server' available

📋 Starting RTSP Test Server
----------------------------------------
✅ Container started with IP: 172.17.0.2
✅ HTTP API responding

📋 Retrieving Stream List
----------------------------------------
✅ Server reports 24 streams available

📋 Testing H.264 Streams (Port 8554)
----------------------------------------
Testing: H.264 360p 15fps (video only) ... ✅ SUCCESS
Testing: H.264 360p 15fps + AAC (video + audio) ... ✅ SUCCESS
Testing: H.264 480p 20fps (video only) ... ✅ SUCCESS
Testing: H.264 720p 25fps (video only) ... ✅ SUCCESS

[... continues for all stream types ...]

📋 Test Results Summary
----------------------------------------
Total Tests: 26
Passed: 26
Failed: 0
Success Rate: 100%

🎉 ALL TESTS PASSED! RTSP Test Server is working perfectly.
```

### Failed Test Example
```
Testing: H.264 360p 15fps (video only) ... ❌ FAILED

📋 Test Results Summary
----------------------------------------
Total Tests: 26
Passed: 25
Failed: 1
Success Rate: 96%

❌ Some tests failed. Failed streams:
  - rtsp://172.17.0.2:8554/h264_360p_15fps
```

## Troubleshooting

### Common Issues

#### 1. Docker Image Not Found
```
❌ Docker image 'rtsp-test-server' not found. Please build it first.
Run: docker build -t rtsp-test-server .
```
**Solution**: Build the Docker image first:
```bash
cd rtsp-test-server
docker build -t rtsp-test-server .
```

#### 2. GStreamer Not Installed
```
❌ GStreamer is required but not installed
```
**Solution**: Install GStreamer using the platform-specific instructions above.

#### 3. Port Already in Use
```
docker: Error response from daemon: port is already allocated
```
**Solution**: The script automatically cleans up, but if needed:
```bash
docker rm -f rtsp-test-server-validation
```

#### 4. GStreamer Pipeline Errors
If specific codecs fail, check GStreamer plugin availability:
```bash
# Check available plugins
gst-inspect-1.0 | grep -E "(h264|h265|mpeg|jpeg|theora)"

# Check specific element
gst-inspect-1.0 avdec_h264
```

### Debug Mode
For detailed GStreamer output, modify the script to add debug flags:
```bash
# Add to pipeline commands
GST_DEBUG=3 gst-launch-1.0 [pipeline]
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: RTSP Test Server Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y gstreamer1.0-tools gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav jq curl
      
      - name: Build Docker image
        run: |
          cd unified-streaming-platform/rtsp-test-server
          docker build -t rtsp-test-server .
      
      - name: Run validation
        run: |
          cd unified-streaming-platform/rtsp-test-server
          ./validate-rtsp-test-server.sh
```

### AWS CodeBuild Example
```yaml
version: 0.2
phases:
  install:
    runtime-versions:
      docker: 20
    commands:
      - apt-get update
      - apt-get install -y gstreamer1.0-tools gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav jq curl
  
  build:
    commands:
      - cd unified-streaming-platform/rtsp-test-server
      - docker build -t rtsp-test-server .
      - ./validate-rtsp-test-server.sh
```

## Performance Benchmarking

### Extended Testing
For performance testing, run with longer duration:
```bash
# Test each stream for 30 seconds
./validate-rtsp-test-server.sh --duration 30

# Keep container running for manual testing
./validate-rtsp-test-server.sh --no-cleanup
```

### Manual Stream Testing
With `--no-cleanup`, you can manually test streams:
```bash
# Test with VLC
vlc rtsp://localhost:8554/h264_360p_15fps

# Test with FFmpeg
ffplay rtsp://localhost:8554/h264_360p_15fps

# Test with GStreamer (display)
gst-launch-1.0 rtspsrc location=rtsp://localhost:8554/h264_360p_15fps ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! autovideosink
```

## Customization

### Adding New Tests
To add custom validation tests, modify the script:

1. **Add new test function**:
```bash
test_custom_streams() {
    print_test_header "Testing Custom Streams"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/custom_stream" \
        "Custom stream description" \
        "gst-launch-1.0 [custom_pipeline]" \
        "Custom Test"
}
```

2. **Call in main function**:
```bash
# Add to main() function
test_custom_streams
```

### Modifying Test Parameters
```bash
# Change test duration
TEST_DURATION=5

# Change container name
CONTAINER_NAME="my-rtsp-test"

# Add custom ports
RTSP_PORTS="8554 8555 8556 8557 8558"
```

---

This validation script provides comprehensive, automated testing of the RTSP Test Server component, ensuring all streams work correctly with proper GStreamer pipelines before deployment to production environments.
