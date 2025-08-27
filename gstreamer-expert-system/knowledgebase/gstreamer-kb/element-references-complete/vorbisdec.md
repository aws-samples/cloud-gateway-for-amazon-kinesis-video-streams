# After discovering MKV with H.264 video + Vorbis audio:
gst-launch-1.0 \
  filesrc location="video.mkv" ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! avdec_h264 ! videoconvert ! autovideosink \
  demux.audio_0 ! vorbisparse ! vorbisdec ! audioconvert ! autoaudiosink
```

### Device Pipeline Design

```bash
# After discovering webcam capabilities (1920x1080, MJPEG):
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! autovideosink
```

## Hardware Acceleration Selection

### Based on Codec Discovery
A fully operation playback pipeline, with audio and video (more or less
the same pipeline that `playbin` will create
internally):

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d ! queue ! vp8dec ! videoconvert ! autovideosink d. ! queue ! vorbisdec ! audioconvert ! audioresample ! autoaudiosink
```

A transcoding pipeline, which opens the webm container and decodes both
streams (via uridecodebin), then re-encodes the audio and video branches
with different codecs (H.264 + AAC), and puts them back together into an
MP4 container (just for the sake of it). Because of the way the x264enc
encoder behaves by default (consuming multiple seconds of video input before
outputtingi anything), we have to increase the size of the queue in the audio
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```
(using brackets, so “(” and “)”). You can use dots to imply padnames on
elements, or even omit the padname to automatically select a pad. Using
all this, the pipeline `gst-launch filesrc location=file.ogg ! oggdemux
name=d
d. ! queue ! theoradec ! videoconvert ! xvimagesink
d. ! queue ! vorbisdec ! audioconvert ! audioresample ! alsasink
` will play an Ogg file containing a Theora video-stream and a Vorbis
audio-stream. You can also use autopluggers such as decodebin on the
commandline. See the manual page of `gst-launch` for more information.

### `gst-inspect`

`gst-inspect` can be used to inspect all properties, signals, dynamic
parameters and the object hierarchy of an element. This can be very
useful to see which `GObject` properties or which signals (and using
what arguments) an element supports. Run `gst-inspect fakesrc` to get an
idea of what it does. See the manual page of `gst-inspect` for more
information.
```

Play an Ogg Vorbis format file:

```
gst-launch-1.0 filesrc location=music.ogg ! oggdemux ! vorbisdec ! audioconvert ! audioresample ! pulsesink
```

Play an mp3 file or an http stream using GIO:

```
gst-launch-1.0 giosrc location=music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! pulsesink
```

```
gst-launch-1.0 giosrc location=http://domain.com/music.mp3 ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Use GIO to play an mp3 file located on an SMB server:

```
A fully operation playback pipeline, with audio and video (more or less
the same pipeline that `playbin` will create
internally):

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d ! queue ! vp8dec ! videoconvert ! autovideosink d. ! queue ! vorbisdec ! audioconvert ! audioresample ! autoaudiosink
```

A transcoding pipeline, which opens the webm container and decodes both
streams (via uridecodebin), then re-encodes the audio and video branches
with different codecs (H.264 + AAC), and puts them back together into an
MP4 container (just for the sake of it). Because of the way the x264enc
encoder behaves by default (consuming multiple seconds of video input before
outputtingi anything), we have to increase the size of the queue in the audio
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

---

