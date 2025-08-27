# GStreamer Media Introspection Best Practices

## The Golden Rule: ALWAYS INTROSPECT FIRST

**Never build a GStreamer pipeline without first understanding your media source characteristics.**

This is the most critical step in GStreamer development and will save hours of debugging time.

## Universal Introspection Workflow

### Step 1: Identify Source Type
```bash
# Determine what type of media source you're working with:
# - RTSP stream: rtsp://...
# - File: /path/to/file.ext
# - Device: /dev/video0, hw:0,0
# - Network stream: http://..., https://...
```

### Step 2: Choose Appropriate Introspection Tool

| Source Type | Primary Tool | Secondary Tools |
|-------------|--------------|-----------------|
| **RTSP Streams** | `gst-discoverer-1.0 "rtsp://url"` | `gst-launch-1.0 rtspsrc ! fakesink` |
| **Files** | `gst-discoverer-1.0 /path/file` | `mediainfo`, `ffprobe` |
| **Webcams/Devices** | `gst-device-monitor-1.0` | `v4l2-ctl --list-formats-ext` |
| **Network Streams** | `gst-discoverer-1.0 "http://url"` | `curl -I` for headers |

### Step 3: Analyze Results
Extract these critical characteristics:
- **Container format** (MP4, MKV, AVI, etc.)
- **Video codec** (H.264, H.265, MJPEG, VP9, etc.)
- **Audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- **Resolution and framerate**
- **Bitrates and quality settings**
- **Number of streams** (multiple video/audio tracks)

### Step 4: Design Pipeline Based on Analysis
- Choose appropriate **demuxer** based on container
- Select **decoder/encoder** based on codecs
- Determine if **transcoding** is needed
- Plan **hardware acceleration** if available
- Design **error handling** and **fallbacks**

### Step 5: Test and Validate
- Test basic connectivity/playback first
- Verify pipeline with limited buffers
- Monitor performance and resource usage
- Add debugging and logging as needed

## Source-Specific Best Practices

### RTSP Streams

#### Essential Commands
```bash
# 1. Basic connectivity and SDP analysis
gst-launch-1.0 -v rtspsrc location="rtsp://camera:554/stream" ! fakesink

# 2. Detailed debugging
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://url" num-buffers=1 ! fakesink

# 3. Stream discovery
gst-discoverer-1.0 "rtsp://camera:554/stream"
```

#### What to Look For
- **SDP content**: Codec information, payload types
- **Authentication requirements**: 401/403 errors
- **Network protocols**: TCP vs UDP transport
- **Stream availability**: Multiple tracks, resolutions
- **Timing information**: Framerate, clock rates

#### Common Pipeline Patterns
```bash
# H.264 video detected → Direct passthrough
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! h264parse ! kvssink

# MJPEG detected → Decode and encode
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! kvssink

# H.265 detected → Transcode to H.264
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph265depay ! h265parse ! nvh265dec ! nvh264enc ! kvssink
```

### File Sources

#### Essential Commands
```bash
# 1. Comprehensive analysis
gst-discoverer-1.0 -v /path/to/file.mkv

# 2. JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/file.mp4

# 3. Quick container test
gst-launch-1.0 filesrc location=file.avi ! decodebin ! fakesink num-buffers=10
```

#### Container-Specific Demuxers
```bash
# Choose demuxer based on container analysis:
# Matroska/WebM → matroskademux
# MP4/MOV → qtdemux  
# AVI → avidemux
# Generic → decodebin (automatic)
```

#### Optimization Strategies
```bash
# H.264 in MP4 → Passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# Other codecs → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

### Webcams and Devices

#### Essential Commands
```bash
# 1. Device discovery
gst-device-monitor-1.0 Video/Source

# 2. V4L2 capabilities (Linux)
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Basic capture test
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

#### Format Selection Strategy
```bash
# Priority order for efficiency:
# 1. MJPEG (hardware compressed)
gst-launch-1.0 v4l2src ! image/jpeg ! jpegdec ! videoconvert ! x264enc ! kvssink

# 2. YUY2 (uncompressed but efficient)
gst-launch-1.0 v4l2src ! video/x-raw,format=YUY2 ! videoconvert ! x264enc ! kvssink

# 3. RGB (least efficient, avoid if possible)
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! kvssink
```

## Hardware Acceleration Integration

### Discovery Process
```bash
# 1. Check available hardware encoders/decoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|nvdec|qsv|omx)"

# 2. Test hardware capability
gst-launch-1.0 videotestsrc num-buffers=10 ! vaapih264enc ! fakesink

# 3. Integrate into pipeline based on codec analysis
# If H.264 input detected:
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! nvh264dec ! nvh264enc ! kvssink
```

### Hardware Selection Logic
```bash
# NVIDIA GPUs → nvenc/nvdec
# Intel iGPU → vaapi
# Intel QuickSync → qsv  
# ARM SoCs → omx (if available)
```

## Error Handling and Debugging

### Progressive Testing Approach
```bash
# 1. Test source connectivity
gst-launch-1.0 $SOURCE ! fakesink num-buffers=1

# 2. Test demuxing/parsing
gst-launch-1.0 $SOURCE ! $DEMUXER ! fakesink num-buffers=10

# 3. Test decoding
gst-launch-1.0 $SOURCE ! $DEMUXER ! $DECODER ! fakesink num-buffers=10

# 4. Test full pipeline
gst-launch-1.0 $FULL_PIPELINE
```

### Debug Environment Variables
```bash
# General debugging
GST_DEBUG=*:3 gst-launch-1.0 $PIPELINE

# Caps negotiation issues
GST_DEBUG=caps:5 gst-launch-1.0 $PIPELINE

# RTSP-specific debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 $PIPELINE

# Performance debugging
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 $PIPELINE
```

## Common Anti-Patterns to Avoid

### ❌ Don't Do This
```bash
# Building pipelines without introspection
gst-launch-1.0 rtspsrc location="rtsp://unknown" ! h264parse ! kvssink

# Assuming codec formats
gst-launch-1.0 filesrc location=video.avi ! avidemux ! h264parse ! kvssink

# Using generic elements when specific ones exist
gst-launch-1.0 v4l2src ! decodebin ! videoconvert ! x264enc ! kvssink

# Ignoring hardware capabilities
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! avdec_h265 ! kvssink
```

### ✅ Do This Instead
```bash
# Always introspect first
gst-discoverer-1.0 "rtsp://camera:554/stream"
# → Discovered H.264, build appropriate pipeline:
gst-launch-1.0 rtspsrc location="rtsp://camera:554/stream" ! rtph264depay ! h264parse ! kvssink

# Analyze file characteristics
gst-discoverer-1.0 video.avi
# → Discovered MJPEG, build transcoding pipeline:
gst-launch-1.0 filesrc location=video.avi ! avidemux ! jpegdec ! x264enc ! kvssink

# Check device capabilities
gst-device-monitor-1.0 Video/Source
# → Discovered MJPEG support, use efficient pipeline:
gst-launch-1.0 v4l2src ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# Use hardware acceleration when available
gst-inspect-1.0 nvh265dec
# → Hardware decoder available, use it:
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! nvh265dec ! nvh264enc ! kvssink
```

## Automation and Scripting

### Introspection Script Template
```bash
#!/bin/bash

introspect_and_build_pipeline() {
    local source="$1"
    local output_target="$2"
    
    echo "=== Media Introspection Workflow ==="
    echo "Source: $source"
    echo "Target: $output_target"
    
    # Step 1: Analyze source
    echo "1. Analyzing source characteristics..."
    local analysis=$(gst-discoverer-1.0 "$source" 2>/dev/null)
    
    # Step 2: Extract key information
    local container=$(echo "$analysis" | grep "container:" | awk '{print $2}')
    local video_codec=$(echo "$analysis" | grep -i "video.*:" | head -1)
    local audio_codec=$(echo "$analysis" | grep -i "audio.*:" | head -1)
    
    echo "   Container: $container"
    echo "   Video: $video_codec"
    echo "   Audio: $audio_codec"
    
    # Step 3: Build optimal pipeline
    echo "2. Building optimal pipeline..."
    
    # Add your pipeline generation logic here based on analysis
    # This is where you implement the decision tree based on
    # discovered characteristics
    
    echo "3. Testing pipeline..."
    # Add pipeline testing logic
    
    echo "✅ Pipeline ready for production use"
}
```

## Performance Monitoring

### Key Metrics to Track
```bash
# CPU usage during transcoding
top -p $(pgrep gst-launch)

# Memory usage patterns
cat /proc/$(pgrep gst-launch)/status | grep -E "(VmRSS|VmSize)"

# Pipeline performance statistics
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 $PIPELINE 2>&1 | grep -E "(fps|bitrate|latency)"

# Network statistics for RTSP
netstat -i  # Monitor interface statistics during streaming
```

## Integration with Kinesis Video Streams

### KVS-Optimized Introspection
```bash
# For KVS, prioritize H.264 passthrough when possible
analyze_for_kvs() {
    local source="$1"
    local analysis=$(gst-discoverer-1.0 "$source")
    
    if echo "$analysis" | grep -qi "h.264\|avc"; then
        echo "✅ H.264 detected - passthrough recommended"
        echo "Pipeline: $source → h264parse → kvssink"
    elif echo "$analysis" | grep -qi "h.265\|hevc"; then
        echo "⚠️  H.265 detected - transcoding required"
        echo "Pipeline: $source → h265parse → nvh265dec → nvh264enc → kvssink"
    else
        echo "⚠️  Non-H.264 codec - transcoding required"
        echo "Pipeline: $source → decode → x264enc → kvssink"
    fi
}
```

## Summary Checklist

Before building any GStreamer pipeline, ensure you have:

- [ ] **Identified source type** (RTSP, file, device, network)
- [ ] **Run appropriate introspection tool** (gst-discoverer-1.0, gst-device-monitor-1.0, etc.)
- [ ] **Analyzed container format** and chosen correct demuxer
- [ ] **Identified video/audio codecs** and determined transcoding needs
- [ ] **Checked hardware acceleration** availability for detected codecs
- [ ] **Tested basic connectivity** before building complex pipeline
- [ ] **Planned error handling** and fallback strategies
- [ ] **Considered performance implications** of chosen approach
- [ ] **Documented pipeline decisions** for future maintenance

**Remember: 5 minutes of introspection saves hours of debugging!**
