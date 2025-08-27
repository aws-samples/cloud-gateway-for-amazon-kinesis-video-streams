# GStreamer Media Introspection Best Practices

## Overview

Media introspection is the **CRITICAL FIRST STEP** before building any GStreamer pipeline. It allows you to understand the characteristics of your media source and build optimal pipelines based on actual stream properties rather than assumptions.

## Why Media Introspection is Essential

1. **Codec Discovery**: Understand what decoders/encoders are needed
2. **Resolution & Framerate**: Optimize for actual stream characteristics
3. **Audio Tracks**: Identify available audio streams and formats
4. **Container Format**: Choose appropriate demuxers
5. **Hardware Acceleration**: Select optimal acceleration based on codecs
6. **Pipeline Optimization**: Avoid unnecessary format conversions

## Media Introspection Tools by Source Type

### RTSP Streams

#### Method 1: SDP Analysis with rtspsrc
```bash
# Get SDP information and stream details
gst-launch-1.0 -v rtspsrc location="rtsp://your-camera-ip:554/stream" ! fakesink

# Alternative with more verbose output
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://your-camera-ip:554/stream" ! fakesink
```

**What to look for in output:**
- Video codec (H.264, H.265, MJPEG)
- Audio codec (AAC, G.711, G.726)
- Resolution and framerate
- RTP payload types
- Available tracks

#### Method 2: SDP File Analysis
```bash
# Save SDP to file for analysis
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink dump=true > stream.sdp

# Analyze SDP content
cat stream.sdp
```

#### Method 3: Using gst-discoverer-1.0
```bash
# Discover RTSP stream properties
gst-discoverer-1.0 "rtsp://camera-ip:554/stream"
```

### File Sources (MKV, MP4, AVI, etc.)

#### Method 1: gst-discoverer-1.0 (Recommended)
```bash
# Comprehensive media analysis
gst-discoverer-1.0 /path/to/video.mkv

# JSON output for programmatic parsing
gst-discoverer-1.0 -v /path/to/video.mkv --format=json
```

#### Method 2: mediainfo (if available)
```bash
# Detailed media information
mediainfo /path/to/video.mkv

# JSON output
mediainfo --Output=JSON /path/to/video.mkv
```

#### Method 3: ffprobe (if available)
```bash
# Stream information
ffprobe -v quiet -print_format json -show_format -show_streams /path/to/video.mkv
```

### Webcams and Capture Devices

#### Method 1: gst-device-monitor-1.0 (Primary)
```bash
# Discover all available devices
gst-device-monitor-1.0

# Monitor specific device class
gst-device-monitor-1.0 Video/Source
gst-device-monitor-1.0 Audio/Source
```

#### Method 2: v4l2-ctl (Linux V4L2 devices)
```bash
# List video devices
v4l2-ctl --list-devices

# Get device capabilities
v4l2-ctl -d /dev/video0 --list-formats-ext

# Get current format
v4l2-ctl -d /dev/video0 --get-fmt-video
```

#### Method 3: Test with videotestsrc
```bash
# Test pipeline with known source
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! autovideosink
```

### Network Streams (HLS, DASH, HTTP)

#### Method 1: gst-discoverer-1.0
```bash
# Analyze network stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"
```

#### Method 2: Direct pipeline analysis
```bash
# HLS stream analysis
gst-launch-1.0 -v souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink

# HTTP stream analysis
gst-launch-1.0 -v souphttpsrc location="http://example.com/stream" ! decodebin ! fakesink
```

## Introspection Workflow Examples

### Complete RTSP Analysis Workflow

```bash
#!/bin/bash
RTSP_URL="rtsp://camera-ip:554/stream"

echo "=== RTSP Stream Analysis ==="
echo "URL: $RTSP_URL"

# Step 1: Basic connectivity test
echo "1. Testing RTSP connectivity..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=10 ! fakesink

# Step 2: Detailed SDP analysis
echo "2. Analyzing SDP information..."
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=1 ! fakesink 2>&1 | grep -E "(SDP|codec|resolution|framerate)"

# Step 3: Stream discovery
echo "3. Stream discovery..."
gst-discoverer-1.0 "$RTSP_URL"

# Step 4: Test basic pipeline
echo "4. Testing basic decode pipeline..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink num-buffers=30
```

### Complete File Analysis Workflow

```bash
#!/bin/bash
FILE_PATH="$1"

echo "=== File Media Analysis ==="
echo "File: $FILE_PATH"

# Step 1: Basic file info
echo "1. File information..."
file "$FILE_PATH"

# Step 2: GStreamer discovery
echo "2. GStreamer analysis..."
gst-discoverer-1.0 -v "$FILE_PATH"

# Step 3: Test playback
echo "3. Testing playback pipeline..."
gst-launch-1.0 filesrc location="$FILE_PATH" ! decodebin ! videoconvert ! autovideosink
```

### Complete Device Analysis Workflow

```bash
#!/bin/bash

echo "=== Device Discovery Workflow ==="

# Step 1: Discover all devices
echo "1. Available devices..."
gst-device-monitor-1.0

# Step 2: Test specific device
DEVICE="/dev/video0"
echo "2. Testing device: $DEVICE"

# Check if device exists
if [ -e "$DEVICE" ]; then
    # Get device capabilities
    v4l2-ctl -d "$DEVICE" --list-formats-ext
    
    # Test basic capture
    gst-launch-1.0 v4l2src device="$DEVICE" num-buffers=10 ! videoconvert ! fakesink
else
    echo "Device $DEVICE not found"
fi
```

## Pipeline Design Based on Introspection Results

### RTSP Pipeline Design

```bash
# After discovering H.264 video + AAC audio from SDP:
gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! avdec_h264 ! videoconvert ! autovideosink \
  audio_tee. ! queue ! avdec_aac ! audioconvert ! autoaudiosink
```

### File Pipeline Design

```bash
# After discovering MKV with H.264 video + Vorbis audio:
gst-launch-1.0 \
  filesrc location="video.mkv" ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! avdec_h264 ! videoconvert ! autovideosink \
  demux.audio_0 ! vorbisparse ! vorbisdec ! audioconvert ! autoaudiosink
```

### Device Pipeline Design

```bash
# After discovering webcam capabilities (1920x1080, MJPEG):
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! autovideosink
```

## Hardware Acceleration Selection

### Based on Codec Discovery

```bash
# H.264 with NVIDIA acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  nvh264dec ! nvvideoconvert ! autovideosink

# H.264 with VAAPI acceleration (Intel)
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  vaapih264dec ! vaapipostproc ! autovideosink

# H.265 with hardware acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph265depay ! h265parse ! \
  nvh265dec ! nvvideoconvert ! autovideosink
```

## Common Introspection Patterns

### Pattern 1: Unknown Source Analysis
```bash
# Universal discovery approach
gst-discoverer-1.0 "$SOURCE_URI"
```

### Pattern 2: Capability Testing
```bash
# Test if specific codec is supported
gst-launch-1.0 $SOURCE ! $DECODER ! fakesink num-buffers=1
```

### Pattern 3: Format Negotiation Testing
```bash
# Test specific format constraints
gst-launch-1.0 $SOURCE ! $CAPS ! fakesink
```

## Debugging Introspection Issues

### Enable Debug Output
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="$URL" ! fakesink

# General pipeline debugging
GST_DEBUG=*:3 gst-launch-1.0 $PIPELINE

# Caps negotiation debugging
GST_DEBUG=caps:5 gst-launch-1.0 $PIPELINE
```

### Common Issues and Solutions

1. **RTSP Authentication**: Check credentials and authentication method
2. **Network Timeouts**: Adjust latency and timeout parameters
3. **Codec Support**: Verify required plugins are installed
4. **Format Mismatches**: Use videoconvert/audioconvert elements
5. **Device Permissions**: Check device access permissions

## Best Practices Summary

1. **ALWAYS** perform media introspection before building pipelines
2. **NEVER** assume codec, resolution, or format characteristics
3. **TEST** basic connectivity before building complex pipelines
4. **DOCUMENT** discovered characteristics for future reference
5. **OPTIMIZE** pipelines based on actual stream properties
6. **VALIDATE** pipeline functionality with limited buffer counts first
7. **DEBUG** with appropriate GST_DEBUG levels when issues occur

## Integration with Kinesis Video Streams

### RTSP to KVS with Introspection

```bash
# Step 1: Analyze RTSP stream
gst-discoverer-1.0 "rtsp://camera-ip:554/stream"

# Step 2: Build optimized pipeline based on discovery
# (Example assumes H.264 video discovered)
gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
  kvssink stream-name="my-stream" aws-region="us-east-1"
```

This comprehensive approach ensures optimal pipeline construction and reduces debugging time significantly.
