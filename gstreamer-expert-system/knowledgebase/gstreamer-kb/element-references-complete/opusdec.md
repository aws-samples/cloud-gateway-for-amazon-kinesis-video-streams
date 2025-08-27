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

# Test demuxing
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! fakesink

---

