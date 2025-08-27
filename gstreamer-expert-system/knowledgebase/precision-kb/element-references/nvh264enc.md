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

echo "=== RTSP SDP Analysis ==="
echo "URL: $RTSP_URL"
echo ""

# Get SDP content
