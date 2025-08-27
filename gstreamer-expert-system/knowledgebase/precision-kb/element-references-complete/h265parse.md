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

### Encoded Stream Elements (Work with encoded data)
These elements process compressed video streams:

- **h264parse** - Parses H.264 streams
- **h265parse** - Parses H.265/HEVC streams
- **vp8parse** - Parses VP8 streams
- **vp9parse** - Parses VP9 streams
- **avparse** - Generic parser

### Encoders (Input: raw video, Output: encoded stream)
These elements require raw video input:

- **x264enc** - Software H.264 encoding
- **x265enc** - Software H.265/HEVC encoding
- **vp8enc** - VP8 encoding
- **vp9enc** - VP9 encoding
- **vtenc_h264** - macOS VideoToolbox H.264 encoding
- **vtenc_h265** - macOS VideoToolbox H.265 encoding
- **nvh264enc** - NVIDIA H.264 encoding
- **vaapih264enc** - Intel VAAPI H.264 encoding
--
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

