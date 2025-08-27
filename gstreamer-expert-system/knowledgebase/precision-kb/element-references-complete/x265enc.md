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
--
2. **EXPLAIN WHY**: Provide the technical reason
3. **OFFER ALTERNATIVES**: Suggest valid approaches that achieve similar goals
4. **PROVIDE WORKING EXAMPLE**: Show a correct pipeline

Example:
"Preserving codec private data during transcoding is technically impossible because encoders always generate new codec private data based on their parameters. Instead, you can either use stream copy to avoid transcoding, or ensure your HLS player can handle the new codec parameters from x265enc."

## KEYWORDS FOR RAG RETRIEVAL
impossible, cannot, preserve, codec private data, videoscale, encoded, transcoding, compatibility, element, connection, caps, technical limitation
## FUNDAMENTAL TECHNICAL IMPOSSIBILITIES

### 1. CODEC PRIVATE DATA PRESERVATION THROUGH ENCODING IS IMPOSSIBLE

**TECHNICAL REALITY:**
- Encoders (x264enc, x265enc, nvh264enc, vaapih264enc, vtenc_h264, etc.) ALWAYS generate NEW codec private data
- Original codec private data (SPS/PPS/VPS) is DESTROYED during decode→encode process
- There is NO GStreamer element, parameter, or technique to preserve original codec private data through transcoding

**INVALID SUGGESTIONS:**
❌ "Configure x265enc to preserve original codec private data"
❌ "Use extra-sei parameter to copy original SPS/PPS"
❌ "Extract and re-inject original codec private data"
❌ "Force encoder to use original codec parameters"

**CORRECT EXPLANATION:**
✅ "Encoders always create new codec private data based on their own settings. Preserving original codec private data through decode→encode is technically impossible in GStreamer."

### 2. RAW VIDEO ELEMENTS CANNOT PROCESS ENCODED STREAMS

**TECHNICAL REALITY:**
- videoscale, videoconvert, videorate, videocrop, videoflip require video/x-raw input
- These elements CANNOT process encoded streams (H.264, H.265, VP8, VP9, etc.)
- Encoded streams must be decoded FIRST before using raw video elements

**INVALID PIPELINES:**
--
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

## CORRECT RESPONSE PATTERNS

### When User Asks for Impossible Things:

**User Request:** "How can I preserve original codec private data when transcoding with x265enc?"

**CORRECT RESPONSE:**
"This is technically impossible. Encoders like x265enc always generate new codec private data (SPS/PPS/VPS) based on their own settings. The original codec private data is destroyed during the decode process when converting to raw pixels. There is no GStreamer element, parameter, or technique that can preserve original codec private data through decode→encode transcoding.

**Alternative approaches:**
1. Stream passthrough (no transcoding) - preserves original codec data but limits processing options
2. Accept new codec data - allows full transcoding control but changes codec parameters"

### When User Suggests Invalid Pipeline:

**User Request:** "Can I use videoscale directly on H.265 stream to reduce resolution?"

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
--
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
- **Question**: "What hardware do you have available for acceleration? (CPU only, NVIDIA GPU, Intel GPU, AMD GPU)"
- **Why**: Hardware acceleration elements vary significantly:
  - NVIDIA: nvenc, nvdec, nvh264enc, nvh265enc
  - Intel: vaapi, qsvenc, qsvdec
  - AMD: vaapi elements
  - CPU only: software encoders (x264enc, x265enc)

### 3. IMPLEMENTATION APPROACH
- **Question**: "Do you need a command-line pipeline (gst-launch-1.0) or code implementation? (CLI, C/C++, Python)"
- **Why**: Different approaches have different syntax and error handling requirements

### 4. GSTREAMER VERSION
- **Question**: "What version of GStreamer are you using?"
- **Why**: Element availability and properties change between versions

### 5. SPECIFIC REQUIREMENTS
- **Question**: "What are your specific requirements for resolution, framerate, bitrate, and latency?"
- **Why**: These affect element selection and configuration

## PRIORITY 2 RESPONSE PATTERN


---

