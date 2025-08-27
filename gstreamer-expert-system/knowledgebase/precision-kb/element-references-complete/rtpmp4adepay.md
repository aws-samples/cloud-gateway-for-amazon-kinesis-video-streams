gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! avdec_h264 ! videoconvert ! autovideosink \
  audio_tee. ! queue ! avdec_aac ! audioconvert ! autoaudiosink
```

### File Pipeline Design

```bash
# After discovering MKV with H.264 video + Vorbis audio:
gst-launch-1.0 \
  filesrc location="video.mkv" ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! avdec_h264 ! videoconvert ! autovideosink \
  demux.audio_0 ! vorbisparse ! vorbisdec ! audioconvert ! autoaudiosink
```
gst-launch-1.0 \
  rtspsrc location="rtsp://admin:password@192.168.1.100:554/stream1" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! kvssink stream-name="camera1-video" \
  audio_tee. ! queue ! kvssink stream-name="camera1-audio"
```

### Example 2: Security Camera with MJPEG
```bash
# Discovery command
gst-discoverer-1.0 "rtsp://user:pass@192.168.1.101:554/mjpeg"

# Typical output:
# Stream information:
#   container: Multipart
#     video: Motion JPEG
#       Width: 1280

---

