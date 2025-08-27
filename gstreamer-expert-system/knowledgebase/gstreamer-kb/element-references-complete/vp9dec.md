
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
```bash
# H.264 in MP4 → Passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# Other codecs → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

### Webcams and Devices

#### Essential Commands
```bash
# 1. Device discovery
gst-device-monitor-1.0 Video/Source

# 2. V4L2 capabilities (Linux)
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Basic capture test
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

# Pipeline with VP9 to H.264 transcoding:
gst-launch-1.0 \
  filesrc location=sample.webm ! \
  matroskademux name=demux \
  demux.video_0 ! vp9dec ! videoconvert ! \
  x264enc bitrate=6000 tune=zerolatency ! h264parse ! \
  mux.video_0 \
  demux.audio_0 ! opusdec ! audioconvert ! \
  voaacenc bitrate=128000 ! aacparse ! \
  mux.audio_0 \
  mp4mux name=mux ! \
  kvssink stream-name="webm-transcoded"
```

## Container-Specific Analysis

### Matroska/MKV Files
```bash
# Detailed MKV analysis
gst-discoverer-1.0 -v file.mkv | grep -E "(codec|container|bitrate|resolution)"
--
### VP8/VP9 Files
```bash
# VP8/VP9 requires transcoding for KVS
gst-launch-1.0 \
  filesrc location=video.webm ! matroskademux ! \
  vp9dec ! videoconvert ! \
  x264enc bitrate=4000 ! h264parse ! \
  kvssink stream-name="vp9-transcoded"
```

## Performance Optimization

### Hardware Acceleration Detection
```bash
# Check for hardware encoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|qsv|omx)"

# Use hardware encoding when available
gst-launch-1.0 \
  filesrc location=input.mkv ! matroskademux ! \
  h264parse ! avdec_h264 ! \

---

