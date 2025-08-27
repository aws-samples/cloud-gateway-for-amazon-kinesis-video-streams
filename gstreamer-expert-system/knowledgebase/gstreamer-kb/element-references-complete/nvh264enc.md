```bash
# Video
v4l2src         # Camera source
xvimagesink     # Video display
vaapih264enc    # Intel hardware encoding
nvh264enc       # NVIDIA hardware encoding

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink
--
```

### Issue 4: Hardware Acceleration Assumptions
```bash
# ❌ WRONG - Assuming hardware acceleration is available
gst-launch-1.0 avfvideosrc ! nvh264enc ! kvssink

# ✅ CORRECT - Check availability and provide fallbacks
# Check for hardware encoders:
gst-inspect-1.0 vtenc_h264    # macOS VideoToolbox
gst-inspect-1.0 nvh264enc     # NVIDIA
gst-inspect-1.0 vaapih264enc  # Intel VAAPI

# Provide fallback:
# Try hardware first, fallback to software:
gst-launch-1.0 avfvideosrc ! vtenc_h264 ! kvssink
# If hardware not available:
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! kvssink
```

## Improved Recommendation Template

When providing GStreamer solutions, use this template:

```markdown
## Platform Considerations
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

--
```

### Test Hardware Acceleration
```bash
# Test NVIDIA H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! nvh264enc ! fakesink

# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"


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
--
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
#### videoconvert
- **INPUT REQUIRED**: video/x-raw
- **OUTPUT**: video/x-raw (different pixel format)
- **PURPOSE**: Convert between pixel formats (I420, NV12, RGB, etc.)

#### Video Encoders (x264enc, x265enc, nvh264enc, etc.)
- **INPUT REQUIRED**: video/x-raw
- **OUTPUT**: Encoded video (video/x-h264, video/x-h265, etc.)
- **ALWAYS CREATES**: New codec private data

#### Video Decoders (avdec_h264, nvh264dec, etc.)
- **INPUT REQUIRED**: Encoded video
- **OUTPUT**: video/x-raw

### AUDIO PROCESSING ELEMENTS

#### audioconvert
- **INPUT REQUIRED**: audio/x-raw
- **OUTPUT**: audio/x-raw (different format)

#### audioresample  

## CRITICAL: THESE OPERATIONS ARE TECHNICALLY IMPOSSIBLE

### 1. CODEC PRIVATE DATA PRESERVATION DURING TRANSCODING

**IMPOSSIBLE**: Preserving original codec private data when transcoding with any encoder (x264enc, x265enc, nvh264enc, etc.)

**WHY**: 
- Encoders ALWAYS generate new codec private data based on their encoding parameters
- Codec private data contains encoder-specific initialization parameters
- Each encoder creates its own unique codec private data
- There is NO "extradata" or "preserve-codec-data" property that can maintain original codec private data

**CORRECT RESPONSE**: 
"It's technically impossible to preserve original codec private data during transcoding. Encoders always generate new codec private data. Your options are:
1. Use stream copy (no transcoding) to preserve original codec data
2. Accept that transcoding will create new codec private data
3. Ensure your HLS player can handle the new codec parameters"

**KEYWORDS**: codec private data, preserve, extradata, transcoding, HLS compatibility, x264enc, x265enc, nvh264enc

### 2. VIDEOSCALE ON ENCODED STREAMS

**IMPOSSIBLE**: Using videoscale directly on encoded video streams (H.264, H.265, VP8, VP9, etc.)

**WHY**:
- videoscale requires raw video input (video/x-raw)
- Encoded streams are compressed and cannot be scaled without decoding first
- videoscale cannot parse encoded video formats

**CORRECT RESPONSE**:
"videoscale cannot process encoded streams. You need to decode first:
```
rtspsrc ! decodebin ! videoscale ! video/x-raw,width=1920,height=1080 ! encoder ! sink
```

---

