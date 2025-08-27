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


#### Provide Platform-Appropriate Elements:

**For Linux users**:
```bash
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

**For macOS users**:
```bash
gst-launch-1.0 avfvideosrc ! videoconvert ! vtenc_h264 ! rtmpsink location=rtmp://server/stream
```

**For Windows users**:
```bash
gst-launch-1.0 ksvideosrc ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

### ELEMENT AVAILABILITY CHECKING

#### Verify element exists:
```bash
gst-inspect-1.0 elementname
```

#### List available elements by category:
```bash
gst-inspect-1.0 | grep -i video
gst-inspect-1.0 | grep -i audio
```

### Example 1: RTSP Streaming Query
**User**: "How do I stream RTSP to RTMP?"

**WRONG Response** (skips priorities):
```
Use this pipeline: gst-launch-1.0 rtspsrc ! decodebin ! x264enc ! rtmpsink
```

**CORRECT Response** (follows hierarchy):
```
Before designing your RTSP-to-RTMP pipeline, let's understand your source stream:

**STEP 1 - Media Introspection:**
```bash
gst-discoverer-1.0 'rtsp://your-camera-ip:554/stream'
```

This reveals the codec, resolution, and format, which determines if we need transcoding or can use stream copy for better performance.

**STEP 2 - Environment Context:**
While running that, please share:

---

