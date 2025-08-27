```

### Memory Optimization
Use appropriate color formats and resolutions:
```bash
videoscale ! video/x-raw,width=416,height=416 ! gvadetect
```

## Debugging

### Enable Debug Output
```bash
export GST_DEBUG=gva*:4
```

### Model Information
```bash
gst-inspect-1.0 gvadetect
gst-inspect-1.0 gvaclassify
gst-inspect-1.0 gvainference
```

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

Typical transform elements include:

  - audio convertors (audioconvert, audioresample,…)

  - video convertors (colorspace, videoscale, …)

  - filters (capsfilter, volume, colorbalance, …)

The implementation of the transform element has to take care of the
following things:

  - efficient negotiation both up and downstream

  - efficient buffer alloc and other buffer management

Some transform elements can operate in different modes:

  - passthrough (no changes are done on the input buffers)

  - in-place (changes made directly to the incoming buffers without

* If at some point, the decoder wants to switch to a lower resolution again, it
can choose to use the current pool (which has buffers that are larger than the
required size) or it can choose to renegotiate a new bufferpool.

### `.. ! myvideodecoder ! videoscale ! myvideosink`

* myvideosink is providing a bufferpool for upstream elements and wants to
change the resolution.

* myvideosink sends a `RECONFIGURE` event upstream to notify upstream that a new
format is desirable. Upstream elements try to negotiate a new format and
bufferpool before pushing out a new buffer. The old bufferpools are drained in
the regular way.
  - `--gst-debug-disable` disables debugging altogether.

## Conversion plugins

GStreamer contains a bunch of conversion plugins that most applications
will find useful. Specifically, those are videoscalers (videoscale),
colorspace convertors (videoconvert), audio format convertors and
channel resamplers (audioconvert) and audio samplerate convertors
(audioresample). Those convertors don't do anything when not required,
they will act in passthrough mode. They will activate when the hardware
doesn't support a specific request, though. All applications are
recommended to use those elements.

## Utility applications provided with GStreamer

GStreamer comes with a default set of command-line utilities that can
help in application development. We will discuss only `gst-launch` and
`gst-inspect` here.

### `gst-launch`


---

