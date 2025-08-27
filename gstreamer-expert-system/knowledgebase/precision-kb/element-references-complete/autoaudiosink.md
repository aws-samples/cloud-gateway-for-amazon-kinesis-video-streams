```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
```

## Accuracy Best Practices

### 1. Always Recommend Element Verification First
```bash
# Before recommending any element, suggest verification:
gst-inspect-1.0 [element-name]

# Example:
gst-inspect-1.0 avfvideosrc    # Check if available on macOS
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

  /* Create the elements */
  data.source = gst_element_factory_make ("uridecodebin", "source");
  data.convert = gst_element_factory_make ("audioconvert", "convert");
  data.resample = gst_element_factory_make ("audioresample", "resample");
  data.sink = gst_element_factory_make ("autoaudiosink", "sink");

  /* Create the empty pipeline */
  data.pipeline = gst_pipeline_new ("test-pipeline");

  if (!data.pipeline || !data.source || !data.convert || !data.resample || !data.sink) {
    g_printerr ("Not all elements could be created.\n");
    return -1;
  }

  /* Build the pipeline. Note that we are NOT linking the source at this
   * point. We will do it later. */
  gst_bin_add_many (GST_BIN (data.pipeline), data.source, data.convert, data.resample, data.sink, NULL);
  if (!gst_element_link_many (data.convert, data.resample, data.sink, NULL)) {
    g_printerr ("Elements could not be linked.\n");
    gst_object_unref (data.pipeline);
--
``` c
/* Create the elements */
data.source = gst_element_factory_make ("uridecodebin", "source");
data.convert = gst_element_factory_make ("audioconvert", "convert");
data.resample = gst_element_factory_make ("audioresample", "resample");
data.sink = gst_element_factory_make ("autoaudiosink", "sink");
```

We create the elements as usual. `uridecodebin` will internally
instantiate all the necessary elements (sources, demuxers and decoders)
to turn a URI into raw audio and/or video streams. It does half the work
that `playbin` does. Since it contains demuxers, its source pads are
not initially available and we will need to link to them on the fly.

`audioconvert` is useful for converting between different audio formats,
making sure that this example will work on any platform, since the
format produced by the audio decoder might not be the same that the
audio sink expects.

`audioresample` is useful for converting between different audio sample rates,
similarly making sure that this example will work on any platform, since the
audio sample rate produced by the audio decoder might not be one that the audio
sink supports.

The `autoaudiosink` is the equivalent of `autovideosink` seen in the
previous tutorial, for audio. It will render the audio stream to the
audio card.

``` c
if (!gst_element_link_many (data.convert, data.resample, data.sink, NULL)) {
  g_printerr ("Elements could not be linked.\n");
  gst_object_unref (data.pipeline);
  return -1;
}
```

Here we link the elements converter, resample and sink, but we **DO NOT** link
them with the source, since at this point it contains no source pads. We
just leave this branch (converter + sink) unlinked, until later on.

--
```

Now we will check the type of data this new pad is going to output, because we
are only interested in pads producing audio. We have previously created a
piece of pipeline which deals with audio (an `audioconvert` linked with an
`audioresample` and an `autoaudiosink`), and we will not be able to link it to
a pad producing video, for example.

`gst_pad_get_current_caps()` retrieves the current *capabilities* of the pad
(that is, the kind of data it currently outputs), wrapped in a `GstCaps`
structure. All possible caps a pad can support can be queried with
`gst_pad_query_caps()`. A pad can offer many capabilities, and hence `GstCaps`
can contain many `GstStructure`, each representing a different capability. The
current caps on a pad will always have a single `GstStructure` and represent a
single media format, or if there are no current caps yet `NULL` will be
returned.

Since, in this case, we know that the pad we want only had one
capability (audio), we retrieve the first `GstStructure` with
`gst_caps_get_structure()`.


  - Overlaying subtitles over a decoded video stream.

Decodebin can be easily tested on the commandline, e.g. by using the
command `gst-launch-1.0 filesrc location=file.ogg ! decodebin
! audioconvert ! audioresample ! autoaudiosink`.

## URIDecodebin

The uridecodebin element is very similar to decodebin, only that it
automatically plugs a source plugin based on the protocol of the URI
given.

Uridecodebin will also automatically insert buffering elements when the
uri is a slow network source. The buffering element will post BUFFERING
messages that the application needs to handle as explained in
[Buffering][buffering]. The following properties can be used
to configure the buffering method:

  - The buffer-size property allows you to configure a maximum size in
    bytes for the buffer element.
--
    use-buffering property. This is interesting to enable buffering on
    slower random access media such as a network file server.

URIDecodebin can be easily tested on the commandline, e.g. by using the
command `gst-launch-1.0 uridecodebin uri=file:///file.ogg !
! audioconvert ! audioresample ! autoaudiosink`.

[buffering]: application-development/advanced/buffering.md
[download-buffering]: application-development/advanced/buffering.md#download-buffering

## Playsink

The playsink element is a powerful sink element. It has request pads for
raw decoded audio, video and text and it will configure itself to play
the media streams. It has the following features:

  - It exposes GstStreamVolume, GstVideoOverlay, GstNavigation and
    GstColorBalance interfaces and automatically plugs software elements
    to implement the interfaces when needed.

  - It will automatically plug conversion elements.

---

