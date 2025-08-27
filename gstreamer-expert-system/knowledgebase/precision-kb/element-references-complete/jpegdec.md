
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

# 2. Get JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/video.mp4

--
```

### Pipeline Decision Tree Based on Discovery
```bash
# IF MJPEG supported → Use MJPEG (most efficient)
gst-launch-1.0 v4l2src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# IF YUY2 only → Use raw format
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,format=YUY2,width=1920,height=1080 ! videoconvert ! x264enc ! kvssink

# IF unknown formats → Use generic approach
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! x264enc ! kvssink
```

## Audio Device Introspection

### Essential Commands
```bash
# 1. Discover audio sources
gst-device-monitor-1.0 Audio/Source

```bash
# H.264 video detected → Direct passthrough
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! h264parse ! kvssink

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

--

#### Format Selection Strategy
```bash
# Priority order for efficiency:
# 1. MJPEG (hardware compressed)
gst-launch-1.0 v4l2src ! image/jpeg ! jpegdec ! videoconvert ! x264enc ! kvssink

# 2. YUY2 (uncompressed but efficient)
gst-launch-1.0 v4l2src ! video/x-raw,format=YUY2 ! videoconvert ! x264enc ! kvssink

# 3. RGB (least efficient, avoid if possible)
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! kvssink
```

## Hardware Acceleration Integration

### Discovery Process
```bash
# 1. Check available hardware encoders/decoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|nvdec|qsv|omx)"

--
gst-launch-1.0 rtspsrc location="rtsp://camera:554/stream" ! rtph264depay ! h264parse ! kvssink

# Analyze file characteristics
gst-discoverer-1.0 video.avi
# → Discovered MJPEG, build transcoding pipeline:
gst-launch-1.0 filesrc location=video.avi ! avidemux ! jpegdec ! x264enc ! kvssink

# Check device capabilities
gst-device-monitor-1.0 Video/Source
# → Discovered MJPEG support, use efficient pipeline:
gst-launch-1.0 v4l2src ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# Use hardware acceleration when available
gst-inspect-1.0 nvh265dec
# → Hardware decoder available, use it:
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! nvh265dec ! nvh264enc ! kvssink
```

## Automation and Scripting

### Introspection Script Template
```bash
#!/bin/bash

introspect_and_build_pipeline() {
    local source="$1"
```bash
# After discovering webcam capabilities (1920x1080, MJPEG):
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! autovideosink
```

## Hardware Acceleration Selection

### Based on Codec Discovery

```bash
# H.264 with NVIDIA acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  nvh264dec ! nvvideoconvert ! autovideosink

# H.264 with VAAPI acceleration (Intel)
gst-launch-1.0 \

# Optimal pipeline for KVS (using MJPEG for efficiency):
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! \
  x264enc bitrate=4000 tune=zerolatency ! \
  h264parse ! \
  kvssink stream-name="c920-webcam" aws-region="us-east-1"
```

### Example 2: Built-in Laptop Camera
```bash
# Discovery shows limited capabilities
# Device found:
#   name  : Integrated Camera
#   class : Video/Source
#   caps  : video/x-raw, format=(string)YUY2, width=(int)640, height=(int)480, framerate=(fraction)30/1

# Pipeline optimized for lower resolution:
gst-launch-1.0 \
--
# Choose optimal format based on use case:
# For high quality recording:
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! \
  x264enc bitrate=6000 ! h264parse ! \
  kvssink stream-name="hq-usb-camera"

# For high framerate applications:
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1280,height=720,framerate=60/1 ! \
  jpegdec ! videoconvert ! \
  x264enc bitrate=3000 tune=zerolatency ! h264parse ! \
  kvssink stream-name="hfr-usb-camera"
```

## Audio Device Introspection

### Audio Device Discovery
```bash
# Discover audio sources
gst-device-monitor-1.0 Audio/Source

# Example output:
# Device found:
#   name  : Built-in Audio Analog Stereo
#   class : Audio/Source
--
```bash
# After discovering both video and audio capabilities:
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! \
  x264enc bitrate=4000 ! h264parse ! \
  mux.video_0 \
  alsasrc device=hw:0,0 ! \
  audio/x-raw,rate=48000,channels=2 ! \
  audioconvert ! \
  voaacenc bitrate=128000 ! aacparse ! \
  mux.audio_0 \
  mp4mux name=mux ! \
  filesink location=webcam_recording.mp4
```

## Device Capability Testing Scripts

### Comprehensive Device Analysis Script
```bash
--
        echo "✅ MJPEG format detected: ${resolution} @ ${framerate} fps"
        echo "Optimal pipeline:"
        echo "gst-launch-1.0 \\"
        echo "  v4l2src device=$device ! \\"
        echo "  image/jpeg,width=${resolution%x*},height=${resolution#*x},framerate=$framerate ! \\"
        echo "  jpegdec ! videoconvert ! \\"
        echo "  x264enc bitrate=4000 tune=zerolatency ! \\"
        echo "  h264parse ! \\"
        echo "  kvssink stream-name=\"$stream_name\" aws-region=\"us-east-1\""
        
    # Check for YUY2 support
    elif echo "$caps_output" | grep -q "YUY2"; then
        local resolution=$(echo "$caps_output" | grep "YUY2" | head -1 | sed -n 's/.*width=(int)\([0-9]*\).*height=(int)\([0-9]*\).*/\1x\2/p')
        local framerate=$(echo "$caps_output" | grep "YUY2" | head -1 | sed -n 's/.*framerate=(fraction)\([0-9]*\)\/\([0-9]*\).*/\1\/\2/p')
        
        echo "✅ YUY2 format detected: ${resolution} @ ${framerate} fps"
        echo "Optimal pipeline:"
        echo "gst-launch-1.0 \\"
        echo "  v4l2src device=$device ! \\"
        echo "  video/x-raw,format=YUY2,width=${resolution%x*},height=${resolution#*x},framerate=$framerate ! \\"
        echo "  videoconvert ! \\"
--
### Issue 4: Poor Performance
```bash
# Problem: High CPU usage or dropped frames
# Solutions:
# 1. Use hardware-native format (MJPEG if available)
gst-launch-1.0 v4l2src device=/dev/video0 ! image/jpeg ! jpegdec ! videoconvert ! autovideosink

# 2. Reduce resolution/framerate
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,width=640,height=480,framerate=15/1 ! videoconvert ! autovideosink

# 3. Use hardware encoding if available
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! vaapih264enc ! h264parse ! kvssink stream-name="webcam"
```

## Best Practices Summary

1. **ALWAYS discover device capabilities first** using gst-device-monitor-1.0
2. **Check V4L2 capabilities** on Linux for detailed format information
3. **Test basic capture** before building complex pipelines
4. **Use native formats** when possible (MJPEG > YUY2 > RGB for efficiency)
5. **Consider resolution/framerate tradeoffs** based on use case
#       Framerate: 15/1

# Optimal pipeline:
gst-launch-1.0 \
  rtspsrc location="rtsp://user:pass@192.168.1.101:554/mjpeg" ! \
  rtpjpegdepay ! jpegdec ! videoconvert ! \
  x264enc bitrate=2000 ! h264parse ! \
  kvssink stream-name="mjpeg-camera"
```

### Example 3: PTZ Camera with H.265
```bash
# Discovery with H.265 stream
gst-discoverer-1.0 "rtsp://admin:admin123@192.168.1.102:554/h265"

# Output shows:
# Stream information:
#   video: H.265 / HEVC (Main Profile)
#     Width: 3840
#     Height: 2160
#     Framerate: 30/1
--
    if echo "$video_codec" | grep -qi "h.264\|avc"; then
        pipeline="$pipeline src. ! rtph264depay ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    elif echo "$video_codec" | grep -qi "h.265\|hevc"; then
        pipeline="$pipeline src. ! rtph265depay ! h265parse ! queue ! kvssink stream-name=\"$stream_name\""
    elif echo "$video_codec" | grep -qi "mjpeg\|jpeg"; then
        pipeline="$pipeline src. ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    else
        echo "Unknown video codec, using generic approach"
        pipeline="$pipeline src. ! decodebin ! videoconvert ! x264enc ! h264parse ! queue ! kvssink stream-name=\"$stream_name\""
    fi
    
    echo "Generated pipeline:"
    echo "gst-launch-1.0 $pipeline"
    
    # Test the pipeline
    echo "Testing pipeline..."
    gst-launch-1.0 $pipeline &
    local pipeline_pid=$!
    
    sleep 10
    kill $pipeline_pid 2>/dev/null

---

