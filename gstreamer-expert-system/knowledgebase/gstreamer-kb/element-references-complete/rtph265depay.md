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
- videoscale, videoconvert, videorate, videocrop, videoflip require video/x-raw input
- These elements CANNOT process encoded streams (H.264, H.265, VP8, VP9, etc.)
- Encoded streams must be decoded FIRST before using raw video elements

**INVALID PIPELINES:**
❌ `rtspsrc → rtph265depay → h265parse → videoscale` (videoscale cannot process H.265)
❌ `filesrc → qtdemux → h264parse → videoconvert` (videoconvert cannot process H.264)
❌ `rtspsrc → rtph264depay → videorate` (videorate cannot process H.264)

**CORRECT PIPELINES:**
✅ `rtspsrc → rtph265depay → h265parse → avdec_h265 → videoscale`
✅ `filesrc → qtdemux → h264parse → avdec_h264 → videoconvert`
✅ `rtspsrc → rtph264depay → h264parse → avdec_h264 → videorate`

### 3. ENCODERS REQUIRE RAW VIDEO INPUT

**TECHNICAL REALITY:**
- x264enc, x265enc, nvh264enc, vaapih264enc, vtenc_h264 require video/x-raw input
- These elements CANNOT process encoded streams as input
- Encoded streams must be decoded FIRST before encoding

**INVALID PIPELINES:**
❌ `rtspsrc → rtph265depay → h265parse → x265enc` (x265enc cannot process H.265 input)
❌ `filesrc → qtdemux → h264parse → x264enc` (x264enc cannot process H.264 input)

**CORRECT PIPELINES:**
✅ `rtspsrc → rtph265depay → h265parse → avdec_h265 → videoconvert → x265enc`
✅ `filesrc → qtdemux → h264parse → avdec_h264 → videoconvert → x264enc`

## ELEMENT EXISTENCE VERIFICATION

### NON-EXISTENT ELEMENTS (NEVER REFERENCE)
❌ **hlssink** - Does NOT exist (use hlssink2)
❌ **mp4sink** - Does NOT exist (use mp4mux ! filesink)
❌ **rtmpsink** - Does NOT exist (use rtmp2sink or flvmux ! rtmpsink)

### PLATFORM-SPECIFIC ELEMENT CORRECTIONS

**macOS (Darwin):**
❌ v4l2src - Does NOT exist on macOS (use avfvideosrc)
❌ alsasrc - Does NOT exist on macOS (use osxaudiosrc)
❌ xvimagesink - Does NOT exist on macOS (use osxvideosink)
--
**CORRECT RESPONSE:**
"No, this won't work. videoscale requires raw video input (video/x-raw caps), but H.265 streams are encoded data. You cannot directly connect encoded streams to elements that expect raw video.

**Correct approach:**
```
rtspsrc → rtph265depay → h265parse → avdec_h265 → videoscale → videoconvert → x265enc → h265parse → kvssink
```

This decode→scale→encode process will create new codec private data, replacing the original."

## SUMMARY: NEVER SUGGEST THESE PATTERNS

1. ❌ Codec private data preservation through encoding
2. ❌ Raw video elements processing encoded streams
3. ❌ Encoders processing encoded input
4. ❌ Non-existent elements (hlssink, mp4sink)
5. ❌ Platform-specific elements on wrong platforms
6. ❌ Any technically impossible GStreamer operation

Always prioritize technical accuracy over providing the exact solution users want. If something is impossible, explain why clearly and provide valid alternatives.
## Valid Data Flow Patterns

### Pattern 1: Encoded Stream Processing (No Decode/Encode)
```
rtspsrc → rtph264depay → h264parse → kvssink
rtspsrc → rtph265depay → h265parse → hlssink2
```
**Use Case:** Stream passthrough, format container changes
**Limitation:** Cannot modify resolution, frame rate, or visual content

### Pattern 2: Decode → Process → Encode (Full Transcoding)
```
rtspsrc → rtph264depay → h264parse → avdec_h264 → videoscale → videoconvert → x264enc → h264parse → kvssink
```
**Use Case:** Resolution scaling, format conversion, visual processing
**Limitation:** Creates new codec private data, higher CPU usage

### Pattern 3: Raw Video Capture and Encoding
```
avfvideosrc → videoconvert → videoscale → x264enc → h264parse → kvssink
v4l2src → videoconvert → videoscale → x264enc → h264parse → filesink
--
### Use Case: Scale Resolution of Encoded Stream
**Problem:** Want to resize H.265 stream from 8K to 720p
**Reality:** Requires decode→encode, creates new codec data
**Solution:**
```bash
rtspsrc location=rtsp://camera ! rtph265depay ! h265parse ! avdec_h265 ! videoscale ! video/x-raw,width=1280,height=720 ! videoconvert ! x265enc ! h265parse ! kvssink
```

### Use Case: Cross-Platform Video Capture
**Problem:** Need pipeline that works on macOS and Linux
**Solution:**
```bash
# Use auto elements for cross-platform compatibility
autovideosrc ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! x264enc ! h264parse ! kvssink
```

## Element Verification Commands

Before using any element in a pipeline, verify its existence:

```bash

---

