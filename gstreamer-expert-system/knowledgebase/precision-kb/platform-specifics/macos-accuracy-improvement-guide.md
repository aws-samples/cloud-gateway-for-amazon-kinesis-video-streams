#### macOS Elements (Use on macOS)
```bash
# Video
avfvideosrc     # Camera source
osxvideosink    # Video display
vtenc_h264      # Hardware H.264 encoding
vtdec           # Hardware decoding

# Audio  
osxaudiosrc     # Audio input
osxaudiosink    # Audio output
```

#### Linux Elements (Use on Linux)
```bash
# Video
v4l2src         # Camera source
--
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
