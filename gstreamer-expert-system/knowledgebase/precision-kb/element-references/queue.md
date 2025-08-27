
Named elements are referred to using their name followed by a
dot.

```
gst-launch-1.0 videotestsrc ! videoconvert ! tee name=t ! queue ! autovideosink t. ! queue ! autovideosink
```

You should see two video windows, showing the same sample video pattern.
If you see only one, try to move it, since it is probably on top of the
second window.

This example instantiates a `videotestsrc`, linked to a
`videoconvert`, linked to a `tee` (Remember from [](tutorials/basic/multithreading-and-pad-availability.md) that
a `tee` copies to each of its output pads everything coming through its
input pad). The `tee` is named simply ‘t’ (using the `name` property)
and then linked to a `queue` and an `autovideosink`. The same `tee` is
referred to using ‘t.’ (mind the dot) and then linked to a second
`queue` and a second `autovideosink`.

To learn why the queues are necessary read [](tutorials/basic/multithreading-and-pad-availability.md).

### Pads

Instead of letting GStreamer choose which Pad to use when linking two
elements, you may want to specify the Pads directly. You can do this by
adding a dot plus the Pad name after the name of the element (it must be
a named element). Learn the names of the Pads of an element by using
the `gst-inspect-1.0` tool.

This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.video_0 ! matroskamux ! filesink location=sintel_video.mkv
```

This fetches a media file from the internet using `souphttpsrc`, which
is in webm format (a special kind of Matroska container, see [](tutorials/basic/concepts.md)). We
then open the container using `matroskademux`. This media contains both
--
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

## `gst-inspect-1.0`

This tool has three modes of operation:

  - Without arguments, it lists all available elements types, this is,
    the types you can use to instantiate new elements.
  - With a file name as an argument, it treats the file as a GStreamer
    plugin, tries to open it, and lists all the elements described
    inside.
  - With a GStreamer element name as an argument, it lists all
    information regarding that element.

Let's see an example of the third mode:

