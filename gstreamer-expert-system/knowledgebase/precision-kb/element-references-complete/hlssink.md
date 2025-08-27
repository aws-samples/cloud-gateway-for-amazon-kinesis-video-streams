- **COMMON ERROR**: Sending raw video without encoding

#### hlssink2
- **INPUT REQUIRED**: Encoded video and audio
- **OUTPUT**: HLS segments and playlist
- **NOTE**: Not "hlssink" (doesn't exist)

### COMPATIBILITY CHECKING

#### Before Creating Pipelines:
1. **Check element existence**:
   ```bash
   gst-inspect-1.0 elementname
   ```

2. **Check pad capabilities**:
   ```bash
   gst-inspect-1.0 elementname | grep -A 10 "Pad Templates"
   ```

3. **Verify platform availability**:
- Add conversion elements when needed (videoconvert, audioresample, etc.)

### 4. NON-EXISTENT ELEMENTS

**COMMON MISTAKES**:
- `hlssink` → Correct: `hlssink2`
- `rtspsink` → Correct: `udpsink` or custom RTSP server
- `webrtcsink` → Correct: `webrtcbin` (more complex setup required)

**VERIFICATION**: Always verify element existence with:
```bash
gst-inspect-1.0 elementname
```

## RESPONSE PATTERN FOR IMPOSSIBLE REQUESTS

When a user asks for something technically impossible:

1. **CLEARLY STATE IT'S IMPOSSIBLE**: "This is technically impossible because..."
2. **EXPLAIN WHY**: Provide the technical reason
3. **OFFER ALTERNATIVES**: Suggest valid approaches that achieve similar goals
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

--
## SUMMARY: NEVER SUGGEST THESE PATTERNS

1. ❌ Codec private data preservation through encoding
2. ❌ Raw video elements processing encoded streams
3. ❌ Encoders processing encoded input
4. ❌ Non-existent elements (hlssink, mp4sink)
5. ❌ Platform-specific elements on wrong platforms
6. ❌ Any technically impossible GStreamer operation

Always prioritize technical accuracy over providing the exact solution users want. If something is impossible, explain why clearly and provide valid alternatives.
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

---

