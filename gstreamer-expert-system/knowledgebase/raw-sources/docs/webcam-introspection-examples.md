# Webcam and Device Introspection Examples

## Essential Device Discovery Commands

### 1. Universal Device Discovery
```bash
# Discover all available media devices
gst-device-monitor-1.0

# Monitor only video sources
gst-device-monitor-1.0 Video/Source

# Monitor only audio sources  
gst-device-monitor-1.0 Audio/Source

# Example output interpretation:
# Device found:
#   name  : HD Pro Webcam C920
#   class : Video/Source
#   caps  : video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1
#           video/x-raw, format=(string)YUY2, width=(int)1280, height=(int)720, pixel-aspect-ratio=(fraction)1/1, framerate=(fraction)30/1
```

### 2. V4L2 Device Analysis (Linux)
```bash
# List all video devices
v4l2-ctl --list-devices

# Get detailed device capabilities
v4l2-ctl -d /dev/video0 --list-formats-ext

# Example output shows:
# ioctl: VIDIOC_ENUM_FMT
# Index       : 0
# Type        : Video Capture
# Pixel Format: 'YUYV'
# Name        : YUYV 4:2:2
# Size: Discrete 1920x1080
#     Interval: Discrete 0.033s (30.000 fps)
# Size: Discrete 1280x720  
#     Interval: Discrete 0.033s (30.000 fps)

# Get current format
v4l2-ctl -d /dev/video0 --get-fmt-video
```

### 3. Test Device Capabilities
```bash
# Test basic capture
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink

# Test specific format
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,format=YUY2,width=1920,height=1080,framerate=30/1 ! videoconvert ! autovideosink

# Test with caps negotiation debugging
GST_DEBUG=caps:5 gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! autovideosink
```

## Real-World Webcam Examples

### Example 1: Logitech C920 HD Pro Webcam
```bash
# Discovery command
gst-device-monitor-1.0 Video/Source

# Typical output:
# Device found:
#   name  : HD Pro Webcam C920
#   class : Video/Source  
#   caps  : video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, framerate=(fraction)30/1
#           video/x-raw, format=(string)YUY2, width=(int)1280, height=(int)720, framerate=(fraction)30/1
#           image/jpeg, width=(int)1920, height=(int)1080, framerate=(fraction)30/1

# Analysis shows:
# - Supports YUY2 raw format at 1080p/720p @ 30fps
# - Supports MJPEG at 1080p @ 30fps
# - Device path: /dev/video0

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
  v4l2src device=/dev/video0 ! \
  video/x-raw,format=YUY2,width=640,height=480,framerate=30/1 ! \
  videoconvert ! \
  videoscale ! video/x-raw,width=1280,height=720 ! \
  x264enc bitrate=1500 ! h264parse ! \
  kvssink stream-name="laptop-camera"
```

### Example 3: USB UVC Camera with Multiple Formats
```bash
# V4L2 analysis shows multiple formats
v4l2-ctl -d /dev/video0 --list-formats-ext

# Output shows:
# Pixel Format: 'MJPG' (Motion-JPEG)
# Size: Discrete 1920x1080 (30.000 fps)
# Size: Discrete 1280x720 (60.000 fps)
# Pixel Format: 'YUYV'  
# Size: Discrete 640x480 (30.000 fps)

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
#   caps  : audio/x-raw, format=(string)S16LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2

# Test audio capture
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! audioconvert ! fakesink
```

### Combined Audio/Video Pipeline
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
#!/bin/bash

analyze_video_device() {
    local device="${1:-/dev/video0}"
    
    echo "=== Video Device Analysis: $device ==="
    
    # Check if device exists
    if [ ! -e "$device" ]; then
        echo "❌ Device $device not found"
        return 1
    fi
    
    echo "1. Device Information:"
    v4l2-ctl -d "$device" --info
    
    echo -e "\n2. Supported Formats:"
    v4l2-ctl -d "$device" --list-formats-ext
    
    echo -e "\n3. Current Format:"
    v4l2-ctl -d "$device" --get-fmt-video
    
    echo -e "\n4. GStreamer Device Discovery:"
    gst-device-monitor-1.0 Video/Source | grep -A 10 "$device"
    
    echo -e "\n5. Capability Test:"
    echo "Testing basic capture..."
    if gst-launch-1.0 v4l2src device="$device" num-buffers=10 ! videoconvert ! fakesink >/dev/null 2>&1; then
        echo "✅ Basic capture works"
    else
        echo "❌ Basic capture failed"
    fi
    
    echo -e "\n6. Format Testing:"
    # Test common formats
    local formats=("YUY2" "MJPG" "H264")
    for format in "${formats[@]}"; do
        echo "Testing $format format..."
        if v4l2-ctl -d "$device" --list-formats | grep -q "$format"; then
            echo "✅ $format supported"
        else
            echo "❌ $format not supported"
        fi
    done
}

# Usage
analyze_video_device "/dev/video0"
```

### Optimal Pipeline Generator
```bash
#!/bin/bash

generate_optimal_pipeline() {
    local device="${1:-/dev/video0}"
    local stream_name="${2:-webcam-stream}"
    
    echo "Analyzing device $device for optimal pipeline..."
    
    # Get device capabilities
    local caps_output=$(gst-device-monitor-1.0 Video/Source 2>/dev/null | grep -A 5 "$device")
    
    # Check for MJPEG support (most efficient)
    if echo "$caps_output" | grep -q "image/jpeg"; then
        local resolution=$(echo "$caps_output" | grep "image/jpeg" | head -1 | sed -n 's/.*width=(int)\([0-9]*\).*height=(int)\([0-9]*\).*/\1x\2/p')
        local framerate=$(echo "$caps_output" | grep "image/jpeg" | head -1 | sed -n 's/.*framerate=(fraction)\([0-9]*\)\/\([0-9]*\).*/\1\/\2/p')
        
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
        echo "  x264enc bitrate=3000 tune=zerolatency ! \\"
        echo "  h264parse ! \\"
        echo "  kvssink stream-name=\"$stream_name\" aws-region=\"us-east-1\""
    else
        echo "⚠️  Using generic pipeline (may not be optimal)"
        echo "gst-launch-1.0 \\"
        echo "  v4l2src device=$device ! \\"
        echo "  videoconvert ! \\"
        echo "  x264enc bitrate=2000 ! \\"
        echo "  h264parse ! \\"
        echo "  kvssink stream-name=\"$stream_name\" aws-region=\"us-east-1\""
    fi
}

# Usage
generate_optimal_pipeline "/dev/video0" "my-webcam-stream"
```

## Common Device Issues and Solutions

### Issue 1: Device Permission Denied
```bash
# Problem: Permission denied accessing /dev/video0
# Solution: Add user to video group
sudo usermod -a -G video $USER
# Then logout and login again

# Alternative: Temporary permission
sudo chmod 666 /dev/video0
```

### Issue 2: Device Busy
```bash
# Problem: Device busy (another application using it)
# Solution: Find and stop the process
lsof /dev/video0
sudo kill -9 <PID>

# Or use fuser
sudo fuser -k /dev/video0
```

### Issue 3: No Supported Formats
```bash
# Problem: GStreamer can't negotiate format
# Solution: Use videoconvert for format conversion
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! autovideosink

# Or specify supported format explicitly
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,format=YUY2 ! videoconvert ! autovideosink
```

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
6. **Test pipeline incrementally** - start simple, add complexity
7. **Monitor performance** and adjust bitrates/formats accordingly
8. **Handle device permissions** properly in production environments

This comprehensive approach ensures optimal webcam integration with minimal debugging time.
