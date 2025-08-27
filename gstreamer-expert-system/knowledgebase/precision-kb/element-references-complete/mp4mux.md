branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

A rescaling pipeline. The `videoscale` element performs a rescaling
operation whenever the frame size is different in the input and the
output caps. The output caps are set by the Caps Filter to
320x200.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! queue ! videoscale ! video/x-raw,width=320,height=200 ! videoconvert ! autovideosink
```

This short description of `gst-launch-1.0` should be enough to get you
started. Remember that you have the [complete documentation available
here](tools/gst-launch.md).


**-e, --eos-on-shutdown**

Force an EOS event on sources before shutting the pipeline down. This is
useful to make sure muxers create readable files when a muxing pipeline is
shut down forcefully via Control-C (especially in case of `mp4mux` and `qtmux`
where the created file will be unreadable if the file has not been finalised
properly).

**-f, --no\_fault**

Do not install a segfault handler

**--no-position**

Do not print the current position of pipeline.

If this option is unspecified, the position will be printed when stdout is a TTY.
To enable printing position when stdout is not a TTY,
use the "--force-position" option.

branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

A rescaling pipeline. The `videoscale` element performs a rescaling
operation whenever the frame size is different in the input and the
output caps. The output caps are set by the Caps Filter to
320x200.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! queue ! videoscale ! video/x-raw,width=320,height=200 ! videoconvert ! autovideosink
```

This short description of `gst-launch-1.0` should be enough to get you
started. Remember that you have the [complete documentation available
here](tools/gst-launch.md).


**-e, --eos-on-shutdown**

Force an EOS event on sources before shutting the pipeline down. This is
useful to make sure muxers create readable files when a muxing pipeline is
shut down forcefully via Control-C (especially in case of `mp4mux` and `qtmux`
where the created file will be unreadable if the file has not been finalised
properly).

**-f, --no\_fault**

Do not install a segfault handler

**--no-position**

Do not print the current position of pipeline.

If this option is unspecified, the position will be printed when stdout is a TTY.
To enable printing position when stdout is not a TTY,
use the "--force-position" option.

  alsasrc device=hw:0,0 ! \
  audio/x-raw,rate=48000,channels=2 ! \
  audioconvert ! \
  voaacenc bitrate=128000 ! aacparse ! \
  mux.audio_0 \
  mp4mux name=mux ! \
  filesink location=webcam_recording.mp4
```

## Device Capability Testing Scripts

### Comprehensive Device Analysis Script
```bash
#!/bin/bash

analyze_video_device() {
    local device="${1:-/dev/video0}"
    
    echo "=== Video Device Analysis: $device ==="
    
    # Check if device exists

---

