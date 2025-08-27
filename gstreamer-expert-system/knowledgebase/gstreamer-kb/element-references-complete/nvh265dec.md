```bash
# IF H.264 video detected → Use passthrough
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! h264parse ! kvssink stream-name="stream"

# IF H.265 video detected → Transcode to H.264
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph265depay ! h265parse ! nvh265dec ! nvh264enc ! kvssink

# IF MJPEG detected → Decode and encode
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! kvssink

# IF unknown codec → Use decodebin
gst-launch-1.0 rtspsrc location="rtsp://url" ! decodebin ! videoconvert ! x264enc ! kvssink
```

## File Source Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with file discovery
gst-discoverer-1.0 /path/to/video.mkv


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
--
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
--
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

### HARDWARE ACCELERATION ELEMENTS

#### NVIDIA (Cross-platform)
- **nvh264enc, nvh265enc**: NVIDIA hardware encoding
- **nvh264dec, nvh265dec**: NVIDIA hardware decoding
- **Availability**: Systems with NVIDIA GPUs and drivers
- **Requirements**: CUDA toolkit, proper drivers

#### Intel Hardware Acceleration

**Linux/Windows**:
- **qsvh264enc, qsvh265enc**: Intel Quick Sync encoding
- **qsvh264dec, qsvh265dec**: Intel Quick Sync decoding
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
- **vaapih264dec, vaapih265dec**: VA-API decoding (Linux)

#### Apple Hardware Acceleration (macOS)
- **vtenc_h264, vtenc_h265**: VideoToolbox encoding
- **vtdec_h264, vtdec_h265**: VideoToolbox decoding
- **Availability**: macOS only

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

---

