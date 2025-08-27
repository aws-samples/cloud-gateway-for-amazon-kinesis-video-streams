# macOS GStreamer Specifics and Differences

## CRITICAL: macOS GStreamer Element Differences

**ALWAYS use macOS-specific elements when running on macOS. Do NOT use Linux-specific elements.**

## Audio Elements (macOS vs Linux)

### Audio Sinks
```bash
# ❌ WRONG - Linux elements (don't work on macOS)
alsasink
pulsesink

# ✅ CORRECT - macOS elements
osxaudiosink
```

### Audio Sources
```bash
# ❌ WRONG - Linux elements
alsasrc
pulsesrc

# ✅ CORRECT - macOS elements
osxaudiosrc
```

## Video Elements (macOS vs Linux)

### Video Sinks
```bash
# ❌ WRONG - Linux-specific
xvimagesink
ximagesink

# ✅ CORRECT - macOS compatible
osxvideosink
glimagesink
autovideosink  # Automatically selects appropriate sink
```

### Video Sources
```bash
# ❌ WRONG - Linux V4L2
v4l2src

# ✅ CORRECT - macOS compatible
avfvideosrc    # AVFoundation video source (cameras)
autovideosrc   # Automatically selects appropriate source
```

## macOS-Specific Pipeline Examples

### Basic Camera Capture (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink

# ❌ WRONG - Linux pipeline (will fail on macOS)
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink
```

### Audio Recording (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 osxaudiosrc ! audioconvert ! wavenc ! filesink location=recording.wav

# ❌ WRONG - Linux pipeline
gst-launch-1.0 alsasrc ! audioconvert ! wavenc ! filesink location=recording.wav
```

### Camera to File (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 \
  avfvideosrc ! \
  video/x-raw,width=1280,height=720,framerate=30/1 ! \
  videoconvert ! \
  x264enc ! \
  mp4mux ! \
  filesink location=output.mp4
```

### Camera to Kinesis Video Streams (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 \
  avfvideosrc ! \
  video/x-raw,width=1920,height=1080,framerate=30/1 ! \
  videoconvert ! \
  x264enc bitrate=4000 tune=zerolatency ! \
  h264parse ! \
  kvssink stream-name="macos-camera" aws-region="us-east-1"
```

## macOS Device Discovery

### Camera Discovery
```bash
# List available cameras on macOS
gst-device-monitor-1.0 Video/Source

# Test camera capabilities
gst-launch-1.0 avfvideosrc device-index=0 ! videoconvert ! osxvideosink
```

### Audio Device Discovery
```bash
# List available audio devices on macOS
gst-device-monitor-1.0 Audio/Source
gst-device-monitor-1.0 Audio/Sink

# Test audio capture
gst-launch-1.0 osxaudiosrc ! audioconvert ! osxaudiosink
```

## Common macOS GStreamer Issues and Solutions

### Issue 1: "No such element" errors
```bash
# Problem: Using Linux elements on macOS
gst-launch-1.0 v4l2src ! xvimagesink
# Error: no element "v4l2src"

# Solution: Use macOS elements
gst-launch-1.0 avfvideosrc ! osxvideosink
```

### Issue 2: Camera permission issues
```bash
# Problem: Camera access denied
# Solution: Grant camera permissions in System Preferences > Security & Privacy > Camera
# Add Terminal or your application to allowed apps
```

### Issue 3: Audio device not found
```bash
# Problem: Default audio device issues
# Solution: Specify device explicitly
gst-launch-1.0 osxaudiosrc device=0 ! audioconvert ! osxaudiosink
```

### Issue 4: Hardware acceleration differences
```bash
# macOS hardware acceleration options:
# - VideoToolbox (Apple's hardware acceleration)
# - OpenGL-based elements

# ✅ Use VideoToolbox when available
gst-launch-1.0 avfvideosrc ! vtenc_h264 ! h264parse ! kvssink

# ✅ Fallback to software encoding
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! h264parse ! kvssink
```

## macOS GStreamer Installation Differences

### Homebrew Installation
```bash
# Standard installation
brew install gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly

# Additional plugins for macOS
brew install gst-libav
```

### Plugin Availability
Some plugins common on Linux may not be available on macOS:
- **v4l2**: Not available (Linux-specific)
- **alsa**: Not available (Linux-specific)
- **pulse**: May not be available
- **x11**: Limited availability

## Platform Detection in Pipelines

### Automatic Element Selection
```bash
# Use auto elements for cross-platform compatibility
gst-launch-1.0 \
  autovideosrc ! \
  videoconvert ! \
  autovideosink

# This automatically selects:
# - avfvideosrc on macOS
# - v4l2src on Linux
# - osxvideosink on macOS
# - xvimagesink on Linux
```

## macOS-Specific Debugging

### Enable Debug Output
```bash
# Debug macOS-specific elements
GST_DEBUG=avfvideosrc:5,osxvideosink:5 gst-launch-1.0 avfvideosrc ! osxvideosink

# Debug VideoToolbox
GST_DEBUG=vtenc:5 gst-launch-1.0 avfvideosrc ! vtenc_h264 ! fakesink
```

### Check Available Elements
```bash
# List all available elements (macOS-specific will be included)
gst-inspect-1.0 | grep -E "(osx|avf|vt)"

# Check specific element properties
gst-inspect-1.0 avfvideosrc
gst-inspect-1.0 osxaudiosink
gst-inspect-1.0 vtenc_h264
```

## Best Practices for macOS GStreamer Development

1. **Always use auto elements** when possible for cross-platform compatibility
2. **Test on actual macOS hardware** - behavior can differ from Linux
3. **Check element availability** before building pipelines
4. **Use VideoToolbox** for hardware acceleration when available
5. **Handle permissions properly** for camera and microphone access
6. **Prefer osxvideosink over glimagesink** for better performance
7. **Use avfvideosrc** instead of v4l2src for camera access

## macOS Hardware Acceleration Elements

### VideoToolbox Encoders
```bash
# Available VideoToolbox encoders (if supported)
vtenc_h264      # H.264 hardware encoding
vtenc_h265      # H.265 hardware encoding (newer Macs)
```

### VideoToolbox Decoders
```bash
# Available VideoToolbox decoders
vtdec           # Hardware decoding
```

### Example with Hardware Acceleration
```bash
# Hardware-accelerated pipeline on macOS
gst-launch-1.0 \
  avfvideosrc ! \
  video/x-raw,width=1920,height=1080,framerate=30/1 ! \
  vtenc_h264 bitrate=5000 ! \
  h264parse ! \
  kvssink stream-name="hw-accelerated-stream"
```

## REMEMBER: Platform-Specific Element Usage

**When providing GStreamer solutions, ALWAYS consider the target platform:**

- **macOS**: Use `avfvideosrc`, `osxvideosink`, `osxaudiosrc`, `osxaudiosink`
- **Linux**: Use `v4l2src`, `xvimagesink`, `alsasrc`, `alsasink`
- **Cross-platform**: Use `autovideosrc`, `autovideosink`, `autoaudiosrc`, `autoaudiosink`

**This is critical for providing accurate, working solutions on macOS systems.**
