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
--
    information regarding that element.

Let's see an example of the third mode:

```
gst-inspect-1.0 vp8dec

Factory Details:
  Rank                     primary (256)
  Long-name                On2 VP8 Decoder
  Klass                    Codec/Decoder/Video
  Description              Decode VP8 video streams
  Author                   David Schleef <ds@entropywave.com>, Sebastian Dröge <sebastian.droege@collabora.co.uk>

Plugin Details:
  Name                     vpx
  Description              VP8 plugin
  Filename                 /usr/lib64/gstreamer-1.0/libgstvpx.so
  Version                  1.6.4
  License                  LGPL
  Source module            gst-plugins-good
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
--
    information regarding that element.

Let's see an example of the third mode:

```
gst-inspect-1.0 vp8dec

Factory Details:
  Rank                     primary (256)
  Long-name                On2 VP8 Decoder
  Klass                    Codec/Decoder/Video
  Description              Decode VP8 video streams
  Author                   David Schleef <ds@entropywave.com>, Sebastian Dröge <sebastian.droege@collabora.co.uk>

Plugin Details:
  Name                     vpx
  Description              VP8 plugin
  Filename                 /usr/lib64/gstreamer-1.0/libgstvpx.so
  Version                  1.6.4
  License                  LGPL
  Source module            gst-plugins-good
available, auto-plugging elements like `playbin3` are free to use
hardware acceleration to build their pipelines; the application does not
need to do anything special to enable it. Almost:

When `playbin3` has to choose among different equally valid elements,
like conventional software decoding (through `vp8dec`, for example) or
hardware accelerated decoding (through `vavp8dec`, for example), it uses
their *rank* to decide. The rank is a property of each element that
indicates its priority; `playbin3` will simply select the element that
is able to build a complete pipeline and has the highest rank.

So, whether `playbin3` will use hardware acceleration or not will depend
on the relative ranks of all elements capable of dealing with that media
type. Therefore, the easiest way to make sure hardware acceleration is
enabled or disabled is by changing the rank of the associated element
via the environment variable `GST_PLUGIN_FEATURE_RANK` (see “Running and
debugging GStreamer Applications” in documentation for more
information). Another way is by setting the rank in your application as
shown in this code:

``` c
available, auto-plugging elements like `playbin3` are free to use
hardware acceleration to build their pipelines; the application does not
need to do anything special to enable it. Almost:

When `playbin3` has to choose among different equally valid elements,
like conventional software decoding (through `vp8dec`, for example) or
hardware accelerated decoding (through `vavp8dec`, for example), it uses
their *rank* to decide. The rank is a property of each element that
indicates its priority; `playbin3` will simply select the element that
is able to build a complete pipeline and has the highest rank.

So, whether `playbin3` will use hardware acceleration or not will depend
on the relative ranks of all elements capable of dealing with that media
type. Therefore, the easiest way to make sure hardware acceleration is
enabled or disabled is by changing the rank of the associated element
via the environment variable `GST_PLUGIN_FEATURE_RANK` (see “Running and
debugging GStreamer Applications” in documentation for more
information). Another way is by setting the rank in your application as
shown in this code:

``` c

---

