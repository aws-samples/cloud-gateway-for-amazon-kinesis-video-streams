
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

