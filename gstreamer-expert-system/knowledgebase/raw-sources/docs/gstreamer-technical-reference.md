# GStreamer Technical Reference: Element Compatibility and Common Errors

## Element Data Type Requirements

### Raw Video Elements (Require video/x-raw input)
These elements can ONLY process decoded, raw video data:

- **videoscale** - Scales video resolution
- **videoconvert** - Converts between color formats
- **videorate** - Changes frame rate
- **videoflip** - Flips/rotates video
- **videocrop** - Crops video frames
- **videobox** - Adds borders to video

**Critical:** These elements cannot process encoded streams (H.264, H.265, VP8, VP9, etc.)

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

### Decoders (Input: encoded stream, Output: raw video)
These elements convert encoded streams to raw video:

- **avdec_h264** - H.264 decoder
- **avdec_h265** - H.265/HEVC decoder
- **avdec_vp8** - VP8 decoder
- **avdec_vp9** - VP9 decoder
- **vtdec** - macOS VideoToolbox decoder
- **nvh264dec** - NVIDIA H.264 decoder
- **vaapih264dec** - Intel VAAPI H.264 decoder

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
```
**Use Case:** Live capture, webcam streaming
**Platform Note:** Use avfvideosrc on macOS, v4l2src on Linux

## Codec Private Data Reality

### What is Codec Private Data?
Codec private data includes:
- **SPS (Sequence Parameter Set)** - Video dimensions, profile, level
- **PPS (Picture Parameter Set)** - Encoding parameters
- **VPS (Video Parameter Set)** - H.265 specific parameters

### Critical Understanding: Encoding Always Creates New Codec Data
```
Original Stream: [SPS/PPS from camera] → H.264 data
Decode Process: H.264 data → Raw pixels (codec data LOST)
Encode Process: Raw pixels → NEW H.264 data with NEW SPS/PPS
```

**IMPOSSIBLE:** Preserving original codec private data through decode→encode
**REALITY:** Encoders generate codec data based on their own settings

### Why This Matters
- HLS playback may require specific codec private data
- Some players are sensitive to SPS/PPS changes
- Transcoding always changes codec private data
- Stream passthrough preserves original codec data

## Platform-Specific Elements

### macOS (Darwin) Elements
```bash
# Video Sources
avfvideosrc          # AVFoundation video capture (cameras, screen)
videotestsrc         # Test pattern generator

# Video Sinks
osxvideosink         # Native macOS video display
glimagesink          # OpenGL video display

# Hardware Encoding/Decoding
vtenc_h264           # VideoToolbox H.264 encoder
vtenc_h265           # VideoToolbox H.265 encoder
vtdec                # VideoToolbox decoder

# Audio
osxaudiosrc          # CoreAudio input
osxaudiosink         # CoreAudio output
```

### Linux Elements
```bash
# Video Sources
v4l2src              # Video4Linux2 cameras
ximagesrc            # X11 screen capture

# Video Sinks
xvimagesink          # X11 video display
glimagesink          # OpenGL video display

# Hardware Encoding/Decoding
vaapih264enc         # Intel VAAPI H.264 encoder
nvh264enc            # NVIDIA H.264 encoder
nvh264dec            # NVIDIA H.264 decoder

# Audio
alsasrc              # ALSA audio input
alsasink             # ALSA audio output
pulsesrc             # PulseAudio input
pulsesink            # PulseAudio output
```

### Cross-Platform Elements
```bash
# Auto-Selection (Recommended)
autovideosrc         # Automatically selects best video source
autovideosink        # Automatically selects best video sink
autoaudiosrc         # Automatically selects best audio source
autoaudiosink        # Automatically selects best audio sink

# Software Encoding/Decoding (Available everywhere)
x264enc              # Software H.264 encoder
x265enc              # Software H.265 encoder
avdec_h264           # Software H.264 decoder
avdec_h265           # Software H.265 decoder
```

## Common Invalid Pipeline Patterns

### ❌ Invalid: Encoded Stream to Raw Video Element
```bash
# WRONG - videoscale cannot process H.264 data
rtspsrc ! rtph264depay ! h264parse ! videoscale ! kvssink

# CORRECT - Decode first
rtspsrc ! rtph264depay ! h264parse ! avdec_h264 ! videoscale ! videoconvert ! x264enc ! kvssink
```

### ❌ Invalid: Non-Existent Elements
```bash
# WRONG - hlssink doesn't exist
rtspsrc ! rtph264depay ! h264parse ! hlssink

# CORRECT - Use hlssink2
rtspsrc ! rtph264depay ! h264parse ! hlssink2
```

### ❌ Invalid: Platform-Specific Elements on Wrong Platform
```bash
# WRONG - v4l2src doesn't exist on macOS
v4l2src ! videoconvert ! x264enc ! kvssink

# CORRECT - Use avfvideosrc on macOS
avfvideosrc ! videoconvert ! x264enc ! kvssink

# BEST - Use cross-platform auto element
autovideosrc ! videoconvert ! x264enc ! kvssink
```

### ❌ Invalid: Impossible Codec Data Preservation
```bash
# WRONG - Cannot preserve original codec data through encoding
rtspsrc ! rtph264depay ! h264parse ! avdec_h264 ! videoscale ! x264enc,preserve-original-sps=true ! kvssink

# REALITY - Encoding always creates new codec data
rtspsrc ! rtph264depay ! h264parse ! avdec_h264 ! videoscale ! videoconvert ! x264enc ! kvssink
```

## Valid Solutions for Common Use Cases

### Use Case: Reduce Bitrate While Preserving Codec Data
**Problem:** Want lower bitrate but keep original SPS/PPS for HLS compatibility
**Reality:** This is technically impossible through decode→encode
**Solutions:**
1. **Stream passthrough** (limited bitrate control)
2. **Accept new codec data** (full transcoding control)
3. **Use hardware encoder** (better performance, still new codec data)

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
# Check if element exists and see its properties
gst-inspect-1.0 videoscale
gst-inspect-1.0 avfvideosrc
gst-inspect-1.0 kvssink

# List all available elements
gst-inspect-1.0 | grep -i video

# Check element capabilities
gst-inspect-1.0 x264enc | grep -A 10 "Pad Templates"
```

## Pipeline Testing Methodology

### Step 1: Test Source
```bash
# Test video source alone
gst-launch-1.0 autovideosrc ! autovideosink
```

### Step 2: Test Processing
```bash
# Add processing elements one by one
gst-launch-1.0 autovideosrc ! videoscale ! video/x-raw,width=320,height=240 ! autovideosink
```

### Step 3: Test Encoding
```bash
# Add encoding
gst-launch-1.0 autovideosrc ! videoscale ! video/x-raw,width=320,height=240 ! videoconvert ! x264enc ! h264parse ! fakesink
```

### Step 4: Test Complete Pipeline
```bash
# Full pipeline
gst-launch-1.0 autovideosrc ! videoscale ! video/x-raw,width=320,height=240 ! videoconvert ! x264enc ! h264parse ! kvssink
```

This systematic approach ensures each component works before building complex pipelines.
