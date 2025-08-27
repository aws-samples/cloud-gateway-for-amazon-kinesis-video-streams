gst-launch-1.0 -v rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink num-buffers=1

# 3. Debug RTSP negotiation if needed
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink num-buffers=1
```
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! h264parse ! kvssink stream-name="stream"

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

# 3. Test basic demuxing
gst-launch-1.0 filesrc location=/path/to/file ! decodebin ! fakesink num-buffers=10
```

### Container-Specific Analysis
```bash
# For MKV files
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! fakesink

# For MP4 files  
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink

# For AVI files
gst-launch-1.0 filesrc location=file.avi ! avidemux ! fakesink

# For WebM files
gst-launch-1.0 filesrc location=file.webm ! matroskademux ! fakesink
```

### Pipeline Decision Tree Based on Discovery
```bash
# IF H.264 in MP4 → Direct passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# IF H.264 in MKV → Extract and passthrough
gst-launch-1.0 filesrc location=h264.mkv ! matroskademux ! h264parse ! kvssink

# IF other codec → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

## Webcam/Device Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with device discovery
gst-device-monitor-1.0 Video/Source

# 2. Check V4L2 capabilities (Linux)
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Test basic capture
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

### Device Capability Analysis
```bash
# Example gst-device-monitor-1.0 output:
# Device found:
#   name  : HD Pro Webcam C920
#   class : Video/Source
#   caps  : video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, framerate=(fraction)30/1
#           image/jpeg, width=(int)1920, height=(int)1080, framerate=(fraction)30/1

# This tells you:
# - Device: /dev/video0 (usually)
# - Formats: YUY2 (raw) and MJPEG (compressed)
# - Resolution: 1920x1080
# - Framerate: 30fps
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

# 2. Test audio capture (ALSA)
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10

# 3. Test audio capture (PulseAudio)
gst-launch-1.0 pulsesrc ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10
```

## Hardware Acceleration Discovery

### Check Available Hardware Encoders/Decoders
```bash
# Check for NVIDIA acceleration
gst-inspect-1.0 | grep -i nv

# Check for Intel VAAPI
gst-inspect-1.0 | grep -i vaapi

# Check for Intel QuickSync
gst-inspect-1.0 | grep -i qsv

# Check for ARM OMX
gst-inspect-1.0 | grep -i omx
```

### Test Hardware Acceleration
```bash
# Test NVIDIA H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! nvh264enc ! fakesink

# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash
# Analyze DASH stream
gst-discoverer-1.0 "https://example.com/stream.mpd"

# Test DASH playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.mpd" ! dashdemux ! fakesink
```

## Debugging Commands

### General Pipeline Debugging
```bash
# Enable general debugging
GST_DEBUG=*:3 gst-launch-1.0 [pipeline]

# Debug caps negotiation
GST_DEBUG=caps:5 gst-launch-1.0 [pipeline]

# Debug performance
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 [pipeline]
```

### Source-Specific Debugging
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="rtsp://url" ! fakesink

# V4L2 debugging
GST_DEBUG=v4l2:5 gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink

# File source debugging
GST_DEBUG=filesrc:5,qtdemux:5 gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink
```

## Complete Introspection Workflow Script

```bash
#!/bin/bash

introspect_media_source() {
    local source="$1"
    
    echo "=== GStreamer Media Introspection ==="
    echo "Source: $source"
    echo ""
    
    # Determine source type
    if [[ "$source" =~ ^rtsp:// ]]; then
        echo "🎥 RTSP Stream detected"
        echo "1. Running stream discovery..."
        gst-discoverer-1.0 "$source"
        
        echo -e "\n2. Testing RTSP connectivity..."
        gst-launch-1.0 rtspsrc location="$source" num-buffers=1 ! fakesink
        
    elif [[ "$source" =~ ^/dev/video ]]; then
        echo "📹 Video device detected"
        echo "1. Discovering video devices..."
        gst-device-monitor-1.0 Video/Source
        
        echo -e "\n2. Checking V4L2 capabilities..."
        v4l2-ctl -d "$source" --list-formats-ext
        
        echo -e "\n3. Testing device capture..."
        gst-launch-1.0 v4l2src device="$source" num-buffers=10 ! videoconvert ! fakesink
        
    elif [[ -f "$source" ]]; then
        echo "📁 File source detected"
        echo "1. Analyzing file..."
        gst-discoverer-1.0 "$source"
        
        echo -e "\n2. Testing file demuxing..."
        gst-launch-1.0 filesrc location="$source" ! decodebin ! fakesink num-buffers=10
        
    elif [[ "$source" =~ ^https?:// ]]; then
        echo "🌐 Network stream detected"
        echo "1. Analyzing network stream..."
        gst-discoverer-1.0 "$source"
        
    else
        echo "❓ Unknown source type, using generic analysis..."
        gst-discoverer-1.0 "$source"
    fi
    
    echo -e "\n✅ Introspection complete!"
    echo "Now you can build an optimal GStreamer pipeline based on the discovered characteristics."
}

# Usage: introspect_media_source "rtsp://camera:554/stream"
# Usage: introspect_media_source "/dev/video0"  
# Usage: introspect_media_source "/path/to/video.mkv"
```

## Mandatory Introspection Checklist

Before building ANY GStreamer pipeline, ensure you have:

- [ ] **Identified source type** (RTSP, file, device, network)
- [ ] **Run gst-discoverer-1.0** or appropriate introspection command
- [ ] **Analyzed container format** (MP4, MKV, AVI, etc.)
- [ ] **Identified video codec** (H.264, H.265, MJPEG, VP9, etc.)
- [ ] **Identified audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- [ ] **Noted resolution and framerate**
- [ ] **Checked hardware acceleration** availability
- [ ] **Tested basic connectivity** with fakesink
- [ ] **Planned transcoding strategy** if needed
- [ ] **Considered performance implications**

## Remember: Introspection First, Pipeline Second!

**5 minutes of introspection saves hours of debugging.**

Never assume codec formats, container types, or device capabilities. Always verify with the appropriate introspection commands before building your GStreamer pipeline.
