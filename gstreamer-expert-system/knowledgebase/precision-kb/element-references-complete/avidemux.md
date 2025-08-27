
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
#### Container-Specific Demuxers
```bash
# Choose demuxer based on container analysis:
# Matroska/WebM → matroskademux
# MP4/MOV → qtdemux  
# AVI → avidemux
# Generic → decodebin (automatic)
```

#### Optimization Strategies
```bash
# H.264 in MP4 → Passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# Other codecs → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

### Webcams and Devices

#### Essential Commands
--
```bash
# Building pipelines without introspection
gst-launch-1.0 rtspsrc location="rtsp://unknown" ! h264parse ! kvssink

# Assuming codec formats
gst-launch-1.0 filesrc location=video.avi ! avidemux ! h264parse ! kvssink

# Using generic elements when specific ones exist
gst-launch-1.0 v4l2src ! decodebin ! videoconvert ! x264enc ! kvssink

# Ignoring hardware capabilities
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! avdec_h265 ! kvssink
```

### ✅ Do This Instead
```bash
# Always introspect first
gst-discoverer-1.0 "rtsp://camera:554/stream"
# → Discovered H.264, build appropriate pipeline:
gst-launch-1.0 rtspsrc location="rtsp://camera:554/stream" ! rtph264depay ! h264parse ! kvssink

# Analyze file characteristics
gst-discoverer-1.0 video.avi
# → Discovered MJPEG, build transcoding pipeline:
gst-launch-1.0 filesrc location=video.avi ! avidemux ! jpegdec ! x264enc ! kvssink

# Check device capabilities
gst-device-monitor-1.0 Video/Source
# → Discovered MJPEG support, use efficient pipeline:
gst-launch-1.0 v4l2src ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# Use hardware acceleration when available
gst-inspect-1.0 nvh265dec
# → Hardware decoder available, use it:
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! nvh265dec ! nvh264enc ! kvssink
```

## Automation and Scripting

### Introspection Script Template
  - `--gst-debug-level=LEVEL` will set the default debug level (which
    can range from 0 (no output) to 9 (everything)).

  - `--gst-debug=LIST` takes a comma-separated list of
    category\_name:level pairs to set specific levels for the individual
    categories. Example: `GST_AUTOPLUG:5,avidemux:3`. Alternatively, you
    can also set the `GST_DEBUG` environment variable, which has the
    same effect.

  - `--gst-debug-no-color` will disable color debugging. You can also
    set the GST\_DEBUG\_NO\_COLOR environment variable to 1 if you want
    to disable colored debug output permanently. Note that if you are
    disabling color purely to avoid messing up your pager output, try
    using `less -R`.

  - `--gst-debug-color-mode=MODE` will change debug log coloring mode.
    MODE can be one of the following: `on`, `off`, `auto`, `disable`,
    `unix`. You can also set the GST\_DEBUG\_COLOR\_MODE environment
    variable if you want to change colored debug output permanently.
    Note that if you are disabling color purely to avoid messing up your
    pager output, try using `less -R`.

  - avidemuxer and identity expose an (g) - (l) connection, a thread is
    created to call the sinkpad loop function.

  - identity knows the srcpad is getrange based and uses the thread from
    avidemux to getrange data from filesrc.

```
+---------+    +----------+    +------------+    +----------+
| filesrc |    | identity |    | oggdemuxer |    | fakesink |
|        src--sink       src--sink         src--sink        |
+---------+    +----------+    +------------+    +----------+
        (l-g) (c)        ()   (l-c)        ()   (c)
```

  - fakesink has a chain function and the peer pad has no loop function,
    no scheduling is done.

  - oggdemuxer and identity expose an () - (l-c) connection, oggdemux
    has to operate in chain mode.


  - plug id3demux \! apedemux

  - avi with vorbis audio

  - plug avidemux

  - new pad → audio/vorbis

  - plug vorbisdec or special vorbiscomment reader

## Additional Thoughts

  - would it make sense to have 2-phase tag-reading (property on tagbin
    and/or tagread elements)

  - 1st phase: get tag-data that are directly embedded in the data

  - 2nd phase: get tag-data that has to be generated

  - e.g. album-art via web, video-thumbnails

---

