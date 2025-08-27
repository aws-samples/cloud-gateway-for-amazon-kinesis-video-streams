# RTSP Stream Introspection Examples

## Essential RTSP Introspection Commands

### 1. Basic SDP Analysis
```bash
# Get SDP information from RTSP stream
gst-launch-1.0 -v rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink

# Example output analysis:
# Look for lines like:
# - "a=rtpmap:96 H264/90000" (H.264 video)
# - "a=rtpmap:97 MPEG4-GENERIC/48000/2" (AAC audio)
# - "a=framerate:30" (30 FPS)
# - "c=IN IP4 192.168.1.100" (source IP)
```

### 2. Detailed RTSP Debug Analysis
```bash
# Enable RTSP debugging for detailed SDP
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" num-buffers=1 ! fakesink

# Look for debug output containing:
# - SDP content
# - Stream setup information
# - Codec parameters
# - Transport protocols
```

### 3. Stream Discovery with gst-discoverer-1.0
```bash
# Comprehensive stream analysis
gst-discoverer-1.0 "rtsp://camera-ip:554/stream"

# Example output interpretation:
# Topology:
#   container: Quicktime
#     video: H.264 (High Profile)
#       Width: 1920
#       Height: 1080
#       Framerate: 30/1
#     audio: MPEG-4 AAC
#       Channels: 2
#       Sample rate: 48000
```

## Real-World RTSP Introspection Examples

### Example 1: IP Camera with H.264 + AAC
```bash
# Command
gst-discoverer-1.0 "rtsp://admin:password@192.168.1.100:554/stream1"

# Typical output:
# Duration: 99:99:99.999999999
# Seekable: no
# Live: yes
# Tags: 
#   video codec: H.264 / AVC
#   audio codec: MPEG-4 AAC
# 
# Stream information:
#   container: Quicktime
#     video: H.264 (High Profile)
#       Width: 1920
#       Height: 1080
#       Framerate: 25/1
#       Pixel aspect ratio: 1/1
#       Interlaced: false
#       Bitrate: 4000000
#     audio: MPEG-4 AAC
#       Channels: 2 (front-left, front-right)
#       Sample rate: 48000
#       Bitrate: 128000

# Optimal pipeline based on discovery:
gst-launch-1.0 \
  rtspsrc location="rtsp://admin:password@192.168.1.100:554/stream1" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! kvssink stream-name="camera1-video" \
  audio_tee. ! queue ! kvssink stream-name="camera1-audio"
```

### Example 2: Security Camera with MJPEG
```bash
# Discovery command
gst-discoverer-1.0 "rtsp://user:pass@192.168.1.101:554/mjpeg"

# Typical output:
# Stream information:
#   container: Multipart
#     video: Motion JPEG
#       Width: 1280
#       Height: 720
#       Framerate: 15/1

# Optimal pipeline:
gst-launch-1.0 \
  rtspsrc location="rtsp://user:pass@192.168.1.101:554/mjpeg" ! \
  rtpjpegdepay ! jpegdec ! videoconvert ! \
  x264enc bitrate=2000 ! h264parse ! \
  kvssink stream-name="mjpeg-camera"
```

### Example 3: PTZ Camera with H.265
```bash
# Discovery with H.265 stream
gst-discoverer-1.0 "rtsp://admin:admin123@192.168.1.102:554/h265"

# Output shows:
# Stream information:
#   video: H.265 / HEVC (Main Profile)
#     Width: 3840
#     Height: 2160
#     Framerate: 30/1

# Pipeline with H.265 support:
gst-launch-1.0 \
  rtspsrc location="rtsp://admin:admin123@192.168.1.102:554/h265" ! \
  rtph265depay ! h265parse ! \
  nvh265dec ! nvvideoconvert ! \
  nvh264enc bitrate=8000 ! h264parse ! \
  kvssink stream-name="4k-ptz-camera"
```

## SDP Analysis Examples

### Complete SDP Analysis Script
```bash
#!/bin/bash
RTSP_URL="$1"

if [ -z "$RTSP_URL" ]; then
    echo "Usage: $0 <rtsp_url>"
    exit 1
fi

echo "=== RTSP SDP Analysis ==="
echo "URL: $RTSP_URL"
echo ""

# Get SDP content
echo "Getting SDP information..."
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=1 ! fakesink 2>&1 | \
grep -A 50 "SDP:" | head -50

echo ""
echo "=== Stream Discovery ==="
gst-discoverer-1.0 "$RTSP_URL"

echo ""
echo "=== Connectivity Test ==="
gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=10 ! fakesink
```

### SDP Content Interpretation

```bash
# Example SDP content and interpretation:

# v=0                           # Version
# o=- 1234567890 1 IN IP4 192.168.1.100  # Origin
# s=Session                     # Session name
# c=IN IP4 192.168.1.100       # Connection info
# t=0 0                         # Time
# m=video 0 RTP/AVP 96          # Video media, payload type 96
# a=rtpmap:96 H264/90000        # H.264 codec, 90kHz clock
# a=fmtp:96 profile-level-id=42001e  # H.264 profile info
# a=control:track1              # Control URL
# m=audio 0 RTP/AVP 97          # Audio media, payload type 97
# a=rtpmap:97 MPEG4-GENERIC/48000/2  # AAC codec, 48kHz, stereo
# a=control:track2              # Control URL

# This tells us:
# - Video: H.264, payload type 96
# - Audio: AAC, payload type 97, 48kHz stereo
# - Two separate tracks (track1, track2)
```

## Pipeline Generation Based on Introspection

### Automated Pipeline Generator Script
```bash
#!/bin/bash

analyze_and_build_pipeline() {
    local rtsp_url="$1"
    local stream_name="$2"
    
    echo "Analyzing RTSP stream: $rtsp_url"
    
    # Get stream info
    local discovery_output=$(gst-discoverer-1.0 "$rtsp_url" 2>/dev/null)
    
    # Extract video codec
    local video_codec=$(echo "$discovery_output" | grep -i "video.*:" | head -1)
    local audio_codec=$(echo "$discovery_output" | grep -i "audio.*:" | head -1)
    
    echo "Detected video: $video_codec"
    echo "Detected audio: $audio_codec"
    
    # Build pipeline based on detection
    local pipeline="rtspsrc location=\"$rtsp_url\" name=src"
    
    # Video path
    if echo "$video_codec" | grep -qi "h.264\|avc"; then
        pipeline="$pipeline src. ! rtph264depay ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    elif echo "$video_codec" | grep -qi "h.265\|hevc"; then
        pipeline="$pipeline src. ! rtph265depay ! h265parse ! queue ! kvssink stream-name=\"$stream_name\""
    elif echo "$video_codec" | grep -qi "mjpeg\|jpeg"; then
        pipeline="$pipeline src. ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    else
        echo "Unknown video codec, using generic approach"
        pipeline="$pipeline src. ! decodebin ! videoconvert ! x264enc ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    fi
    
    echo "Generated pipeline:"
    echo "gst-launch-1.0 $pipeline"
    
    # Test the pipeline
    echo "Testing pipeline..."
    gst-launch-1.0 $pipeline &
    local pipeline_pid=$!
    
    sleep 10
    kill $pipeline_pid 2>/dev/null
    echo "Pipeline test completed"
}

# Usage
analyze_and_build_pipeline "rtsp://camera-ip:554/stream" "test-stream"
```

## Common RTSP Introspection Issues and Solutions

### Issue 1: Authentication Required
```bash
# Problem: Stream requires authentication
# Solution: Include credentials in URL
gst-discoverer-1.0 "rtsp://username:password@camera-ip:554/stream"

# Alternative: Use separate authentication
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" user-id="username" user-pw="password" ! fakesink
```

### Issue 2: Network Timeout
```bash
# Problem: Network timeout during discovery
# Solution: Adjust timeout parameters
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" timeout=20000000000 ! fakesink num-buffers=1
```

### Issue 3: Codec Not Supported
```bash
# Problem: Unsupported codec in stream
# Solution: Use decodebin for automatic codec selection
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! decodebin ! fakesink
```

### Issue 4: Multiple Video Tracks
```bash
# Problem: Stream has multiple video tracks
# Solution: Analyze each track separately
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink 2>&1 | grep -E "(track|stream)"
```

This comprehensive introspection approach ensures optimal RTSP pipeline construction and significantly reduces debugging time.
