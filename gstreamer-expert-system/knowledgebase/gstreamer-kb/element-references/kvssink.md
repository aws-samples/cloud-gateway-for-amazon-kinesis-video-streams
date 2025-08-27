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
--
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

--
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
    
--
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
