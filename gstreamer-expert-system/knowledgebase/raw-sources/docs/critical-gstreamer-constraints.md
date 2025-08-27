# CRITICAL GStreamer Technical Constraints - MANDATORY RULES

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

**Linux:**
❌ avfvideosrc - Does NOT exist on Linux (use v4l2src)
❌ osxaudiosrc - Does NOT exist on Linux (use alsasrc or pulsesrc)
❌ osxvideosink - Does NOT exist on Linux (use xvimagesink)

## MANDATORY PIPELINE VALIDATION RULES

### RULE 1: DATA FLOW VALIDATION
Before suggesting any pipeline, verify:
1. Each element can process the data type from the previous element
2. Raw video elements only connect after decoders
3. Encoders only connect after raw video processing
4. Parsers work with encoded data, not raw video

### RULE 2: ELEMENT EXISTENCE VALIDATION
Before suggesting any element:
1. Verify the element exists in GStreamer
2. Check platform compatibility (macOS vs Linux)
3. Use cross-platform alternatives when possible (autovideosrc, autovideosink)

### RULE 3: TECHNICAL IMPOSSIBILITY IDENTIFICATION
Always identify and explain technical impossibilities:
1. Codec private data preservation through encoding
2. Direct encoded stream processing by raw video elements
3. Platform-specific elements on wrong platforms

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
