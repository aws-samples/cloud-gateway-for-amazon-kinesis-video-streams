```bash
# H.264 with NVIDIA acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  nvh264dec ! nvvideoconvert ! autovideosink

# H.264 with VAAPI acceleration (Intel)
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  vaapih264dec ! vaapipostproc ! autovideosink

# H.265 with hardware acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph265depay ! h265parse ! \
  nvh265dec ! nvvideoconvert ! autovideosink
```

## Common Introspection Patterns

### Pattern 1: Unknown Source Analysis
```bash
# Universal discovery approach
gst-discoverer-1.0 "$SOURCE_URI"
```

### Pattern 2: Capability Testing
```bash
# Test if specific codec is supported
gst-launch-1.0 $SOURCE ! $DECODER ! fakesink num-buffers=1
```

# Pipeline with H.265 support:
gst-launch-1.0 \
  rtspsrc location="rtsp://admin:admin123@192.168.1.102:554/h265" ! \
  rtph265depay ! h265parse ! \
  nvh265dec ! nvvideoconvert ! \
  nvh264enc bitrate=8000 ! h264parse ! \
  kvssink stream-name="4k-ptz-camera"
```

## SDP Analysis Examples

### Complete SDP Analysis Script
```bash
#!/bin/bash
RTSP_URL="$1"

if [ -z "$RTSP_URL" ]; then
    echo "Usage: $0 <rtsp_url>"
    exit 1
fi

---

