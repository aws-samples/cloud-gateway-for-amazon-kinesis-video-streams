#     Framerate: 30/1

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
--
    
    # Video path
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
    echo "Pipeline test completed"
}

