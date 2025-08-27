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
All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
link to the next element is ambiguous: the next element may have more
than one compatible input pad, or its input pad may be compatible with
the Pad Caps of all the output pads. In these cases GStreamer will link
All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
link to the next element is ambiguous: the next element may have more
than one compatible input pad, or its input pad may be compatible with
the Pad Caps of all the output pads. In these cases GStreamer will link

```
decoder-audio/x-vorbis
element-vorbisdec
element-vorbisenc
element-vorbisparse
element-vorbistag
encoder-audio/x-vorbis
```

BUT could also be like this (from the faad element in this case):

```
decoder-audio/mpeg, mpegversion=(int){ 2, 4 }
```

NOTE that this does not exactly match the caps string that the installer
will get from the application. The application will always ever ask for
one of

```

```
decoder-audio/x-vorbis
element-vorbisdec
element-vorbisenc
element-vorbisparse
element-vorbistag
encoder-audio/x-vorbis
```

BUT could also be like this (from the faad element in this case):

```
decoder-audio/mpeg, mpegversion=(int){ 2, 4 }
```

NOTE that this does not exactly match the caps string that the installer
will get from the application. The application will always ever ask for
one of

```

---

