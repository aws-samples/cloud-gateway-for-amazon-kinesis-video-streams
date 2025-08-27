gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink

# Linux:
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink
gst-launch-1.0 autovideosrc ! videoconvert ! autovideosink
```

### 3. Include Element Property Verification
```bash
# Don't assume properties exist - recommend checking:
gst-inspect-1.0 x264enc | grep bitrate
gst-inspect-1.0 kvssink | grep stream-name
```

### 4. Recommend Testing with Minimal Pipelines First
```bash
# Start simple, then build complexity:

# Step 1: Test source
gst-launch-1.0 avfvideosrc ! fakesink

# Step 2: Test source + conversion
gst-launch-1.0 avfvideosrc ! videoconvert ! fakesink

# Step 3: Test full pipeline
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! kvssink stream-name="test"
```

## Common Accuracy Issues and Solutions

### Issue 1: Wrong Element Names
```bash
# ❌ WRONG - Assuming Linux elements work on macOS
gst-launch-1.0 v4l2src ! xvimagesink

# ✅ CORRECT - Platform-specific recommendation
# On macOS:
gst-launch-1.0 avfvideosrc ! osxvideosink
# On Linux:
gst-launch-1.0 v4l2src ! xvimagesink
# Cross-platform:
gst-launch-1.0 autovideosrc ! autovideosink
```

### Issue 2: Incorrect Property Names
```bash
# ❌ WRONG - Assuming properties without verification
gst-launch-1.0 x264enc quality=high ! kvssink

# ✅ CORRECT - Verify properties first
# Check available properties:
gst-inspect-1.0 x264enc | grep -E "(bitrate|quality|preset)"
# Then use correct property names:
gst-launch-1.0 x264enc bitrate=4000 speed-preset=ultrafast ! kvssink
```

### Issue 3: Missing Plugin Dependencies
```bash
# ❌ WRONG - Assuming all plugins are installed
gst-launch-1.0 filesrc location=video.mp4 ! qtdemux ! h264parse ! kvssink

# ✅ CORRECT - Check plugin availability and provide alternatives
# Check if qtdemux is available:
gst-inspect-1.0 qtdemux
# If not available, suggest installation or alternative:
# Alternative: use decodebin for automatic demuxing
gst-launch-1.0 filesrc location=video.mp4 ! decodebin ! videoconvert ! x264enc ! kvssink
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
**Target Platform**: [macOS/Linux/Windows/Cross-platform]

## Element Verification
First, verify these elements are available:
```bash
gst-inspect-1.0 [element1]
gst-inspect-1.0 [element2]
```

## Recommended Pipeline
### Primary Solution (Platform-Specific)
```bash
[platform-specific pipeline]
```

### Alternative Solution (Cross-Platform)
```bash
[cross-platform pipeline using auto elements]
```

### Fallback Solution (Software-Only)
```bash
[software-only pipeline for maximum compatibility]
```

## Testing Steps
1. Test source connectivity:
   ```bash
   gst-launch-1.0 [source] ! fakesink
   ```

2. Test basic pipeline:
   ```bash
   gst-launch-1.0 [source] ! [processing] ! fakesink
   ```

3. Test full pipeline:
   ```bash
   gst-launch-1.0 [complete pipeline]
   ```

## Troubleshooting
If the pipeline fails:
- Check element availability with `gst-inspect-1.0`
- Verify property names and values
- Try software alternatives
- Enable debugging: `GST_DEBUG=3 gst-launch-1.0 [pipeline]`
```

## Knowledge Base Quality Indicators

### High-Quality Recommendations Include:
1. **Platform awareness** (macOS vs Linux elements)
2. **Element verification** commands
3. **Property validation** steps
4. **Multiple alternatives** (hardware/software)
5. **Testing methodology**
6. **Troubleshooting steps**

### Low-Quality Recommendations:
1. **Generic solutions** without platform consideration
2. **Assumed element availability**
3. **Incorrect property names**
4. **No verification steps**
5. **Single solution without alternatives**

## Continuous Improvement Process

### 1. Collect Failure Cases
Document when recommendations fail:
- Which elements were not available
- Which properties were incorrect
- What platform-specific issues occurred

### 2. Update Knowledge Base
Add platform-specific guides for common failure cases

### 3. Improve Introspection
Always recommend verification before implementation

### 4. Test Recommendations
Validate solutions on actual target platforms

This approach ensures recommendations are accurate, platform-appropriate, and actually work in practice.
