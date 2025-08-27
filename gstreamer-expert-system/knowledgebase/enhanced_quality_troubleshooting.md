# GStreamer Quality Troubleshooting Guide

## Pixelation and Blocking Artifacts

### Symptoms
- Blocky, pixelated video output
- Loss of detail in motion scenes
- Visible compression artifacts
- Poor video quality despite good source

### Root Causes and Solutions

#### 1. Insufficient Bitrate
**Problem**: Encoder bitrate too low for content complexity
**Detection**:
```bash
# Monitor bitrate in real-time
GST_DEBUG=*enc*:4 gst-launch-1.0 [your-pipeline] 2>&1 | grep -i bitrate
```

**Solutions**:
```bash
# Increase bitrate for x264enc
gst-launch-1.0 videotestsrc ! x264enc bitrate=2000 ! fakesink

# Use variable bitrate with quality control
gst-launch-1.0 videotestsrc ! x264enc pass=qual quantizer=23 ! fakesink

# Platform-specific optimizations
# macOS VideoToolbox
gst-launch-1.0 videotestsrc ! vtenc_h264 bitrate=2000 quality=0.5 ! fakesink

# NVIDIA hardware encoding
gst-launch-1.0 videotestsrc ! nvh264enc bitrate=2000 rc-mode=vbr ! fakesink
```

#### 2. Encoder Preset and Tuning
**Problem**: Encoder optimized for speed over quality
**Solutions**:
```bash
# High quality preset (slower encoding)
gst-launch-1.0 videotestsrc ! x264enc preset=slow tune=film ! fakesink

# Zero-latency for real-time (may reduce quality)
gst-launch-1.0 videotestsrc ! x264enc tune=zerolatency ! fakesink

# Balanced quality/performance
gst-launch-1.0 videotestsrc ! x264enc preset=medium tune=film ! fakesink
```

#### 3. GOP Structure and B-frames
**Problem**: Poor GOP structure for content type
**Solutions**:
```bash
# Optimize GOP for streaming (no B-frames)
gst-launch-1.0 videotestsrc ! x264enc bframes=0 key-int-max=30 ! fakesink

# High quality with B-frames (higher latency)
gst-launch-1.0 videotestsrc ! x264enc bframes=3 key-int-max=60 ! fakesink
```

### Quality Assessment Tools
```bash
# Analyze video quality metrics
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! videoconvert ! \
  video/x-raw,format=I420 ! multifilesink location=frame_%05d.yuv

# Real-time quality monitoring
gst-launch-1.0 videotestsrc ! x264enc ! h264parse ! \
  tee name=t ! queue ! fakesink t. ! queue ! filesink location=output.h264
```

## Green Screen and Color Artifacts

### Symptoms
- Green or gray screen instead of video
- Incorrect colors or color shifts
- Missing video with audio playing correctly
- Color space conversion errors

### Root Causes and Solutions

#### 1. Color Space Conversion Issues
**Problem**: Missing or incorrect color space conversion
**Detection**:
```bash
# Debug color space negotiation
GST_DEBUG=videoconvert:5 gst-launch-1.0 [your-pipeline]

# Check caps negotiation
GST_DEBUG=*caps*:4 gst-launch-1.0 [your-pipeline]
```

**Solutions**:
```bash
# Add explicit color conversion
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  avdec_h264 ! videoconvert ! video/x-raw,format=I420 ! autovideosink

# Force specific color format
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  avdec_h264 ! videoconvert ! video/x-raw,format=RGB ! autovideosink

# Platform-specific color handling
# macOS with VideoToolbox
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  vtdec ! videoconvert ! autovideosink
```

#### 2. Hardware Decoder Issues
**Problem**: Hardware decoder producing incorrect color format
**Solutions**:
```bash
# Force software decoding
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  avdec_h264 ! videoconvert ! autovideosink

# Test different decoders
# Try hardware decoder first, fallback to software
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  nvh264dec ! videoconvert ! autovideosink

# If hardware fails, use software
gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! \
  avdec_h264 ! videoconvert ! autovideosink
```

#### 3. Caps Negotiation Problems
**Problem**: Elements cannot agree on data format
**Solutions**:
```bash
# Add explicit caps filters
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video,encoding-name=H264 ! \
  rtph264depay ! h264parse ! avdec_h264 ! \
  video/x-raw,format=I420 ! videoconvert ! autovideosink

# Debug caps negotiation
GST_DEBUG=GST_CAPS:4 gst-launch-1.0 [your-pipeline]
```

### Color Space Diagnostic Commands
```bash
# Analyze source color format
gst-discoverer-1.0 rtsp://your-camera-url

# Test color conversion chain
gst-launch-1.0 videotestsrc pattern=smpte ! videoconvert ! \
  video/x-raw,format=RGB ! videoconvert ! \
  video/x-raw,format=I420 ! autovideosink

# Verify hardware decoder output format
gst-launch-1.0 videotestsrc ! x264enc ! h264parse ! \
  nvh264dec ! videoconvert ! autovideosink
```

## Audio/Video Synchronization Issues

### Symptoms
- Audio plays before or after video
- Gradual drift between audio and video
- Intermittent sync issues
- Sync problems only on specific platforms

### Root Causes and Solutions

#### 1. Buffer Size Mismatches
**Problem**: Different buffer sizes for audio and video
**Solutions**:
```bash
# Synchronize buffer sizes
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue max-size-time=200000000 ! \
  rtph264depay ! h264parse ! avdec_h264 ! autovideosink \
  src. ! application/x-rtp,media=audio ! queue max-size-time=200000000 ! \
  rtpmp4adepay ! aacparse ! avdec_aac ! autoaudiosink

# Use consistent latency settings
gst-launch-1.0 rtspsrc location=rtsp://camera latency=200 name=src \
  src. ! application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  avdec_h264 ! autovideosink \
  src. ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  avdec_aac ! autoaudiosink
```

#### 2. Clock Synchronization
**Problem**: Audio and video using different clocks
**Solutions**:
```bash
# Force common clock
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  avdec_h264 ! clocksync ! autovideosink \
  src. ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  avdec_aac ! clocksync ! autoaudiosink

# Use pipeline clock
gst-launch-1.0 --gst-debug=clock:4 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  avdec_h264 ! autovideosink \
  src. ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  avdec_aac ! autoaudiosink
```

#### 3. Platform-Specific Sync Issues
**macOS Sync Optimization**:
```bash
# Use CoreAudio for better sync
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  vtdec ! autovideosink \
  src. ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  avdec_aac ! osxaudiosink
```

**Linux ALSA Sync Optimization**:
```bash
# Configure ALSA latency
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  avdec_h264 ! autovideosink \
  src. ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  avdec_aac ! alsasink latency-time=20000
```

### Sync Diagnostic Commands
```bash
# Monitor sync status
GST_DEBUG=basesink:4 gst-launch-1.0 [your-pipeline] 2>&1 | grep -i sync

# Measure latency
gst-launch-1.0 audiotestsrc ! audioconvert ! autoaudiosink \
  videotestsrc ! videoconvert ! autovideosink

# Test sync with known good source
gst-launch-1.0 filesrc location=test.mp4 ! decodebin name=d \
  d. ! queue ! autovideosink \
  d. ! queue ! autoaudiosink
```

## Performance Impact on Quality

### CPU Usage vs Quality Trade-offs
```bash
# Monitor CPU usage during encoding
top -p $(pgrep gst-launch-1.0)

# Low CPU, lower quality
gst-launch-1.0 videotestsrc ! x264enc preset=ultrafast tune=zerolatency ! fakesink

# Higher CPU, better quality
gst-launch-1.0 videotestsrc ! x264enc preset=slow tune=film ! fakesink

# Hardware acceleration (lower CPU, good quality)
gst-launch-1.0 videotestsrc ! nvh264enc preset=hq ! fakesink  # NVIDIA
gst-launch-1.0 videotestsrc ! vtenc_h264 quality=0.5 ! fakesink  # macOS
```

### Memory Usage Optimization
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep gst-launch-1.0'

# Optimize buffer sizes for memory
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  queue max-size-buffers=10 max-size-bytes=1048576 ! \
  rtph264depay ! h264parse ! avdec_h264 ! autovideosink
```

## Quality Validation and Testing

### Automated Quality Assessment
```bash
# Extract frames for quality analysis
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! videoconvert ! \
  pngenc ! multifilesink location=frame_%05d.png

# Compare quality between pipelines
gst-launch-1.0 filesrc location=original.mp4 ! decodebin ! \
  tee name=t ! queue ! autovideosink \
  t. ! queue ! x264enc bitrate=1000 ! h264parse ! \
  avdec_h264 ! autovideosink
```

### Real-time Quality Monitoring
```bash
# Monitor encoding statistics
GST_DEBUG=x264enc:4 gst-launch-1.0 videotestsrc ! x264enc ! fakesink

# Quality metrics logging
gst-launch-1.0 videotestsrc ! x264enc ! h264parse ! \
  tee name=t ! queue ! fakesink \
  t. ! queue ! filesink location=quality_test.h264
```

This comprehensive troubleshooting guide addresses the most common quality issues in GStreamer pipelines with specific solutions, diagnostic commands, and platform-specific optimizations.
