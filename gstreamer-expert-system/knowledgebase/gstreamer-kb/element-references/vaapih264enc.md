
# Use hardware encoding when available
gst-launch-1.0 \
  filesrc location=input.mkv ! matroskademux ! \
  h264parse ! avdec_h264 ! \
  vaapih264enc bitrate=4000 ! h264parse ! \
  kvssink stream-name="hw-accelerated"
```

### Memory and CPU Optimization
```bash
# Add queues for better performance
gst-launch-1.0 \
  filesrc location=large_file.mkv ! \
  matroskademux name=demux \
  demux.video_0 ! queue max-size-buffers=100 ! \
  h264parse ! kvssink stream-name="buffered-stream"

# Use multiple threads for encoding
gst-launch-1.0 \
  filesrc location=input.avi ! avidemux ! \
  jpegdec ! videoconvert ! \
  x264enc threads=4 bitrate=4000 ! h264parse ! \
  kvssink stream-name="multithreaded"
```

