vaapih264enc    # Intel hardware encoding
nvh264enc       # NVIDIA hardware encoding

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
### `gst-launch`

`gst-launch` is a simple script-like commandline application that can be
used to test pipelines. For example, the command `gst-launch
audiotestsrc ! audioconvert !
audio/x-raw,channels=2 ! alsasink` will run a pipeline which generates a
sine-wave audio stream and plays it to your ALSA audio card.
`gst-launch` also allows the use of threads (will be used automatically
as required or as queue elements are inserted in the pipeline) and bins
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

  /* create audio output */
  audio = gst_bin_new ("audiobin");
  conv = gst_element_factory_make ("audioconvert", "aconv");
  audiopad = gst_element_get_static_pad (conv, "sink");
  sink = gst_element_factory_make ("alsasink", "sink");
  gst_bin_add_many (GST_BIN (audio), conv, sink, NULL);
  gst_element_link (conv, sink);
  gst_element_add_pad (audio,
      gst_ghost_pad_new ("sink", audiopad));
  gst_object_unref (audiopad);
  gst_bin_add (GST_BIN (pipeline), audio);

  /* run */
  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  g_main_loop_run (loop);

  /* cleanup */
  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));

GStreamer provides a basic set of elements that are useful when
integrating with Linux or a UNIX-like operating system.

  - For audio input and output, GStreamer provides input and output
    elements for several audio subsystems. Amongst others, GStreamer
    includes elements for ALSA (alsasrc, alsasink), OSS (osssrc,
    osssink) Pulesaudio (pulsesrc, pulsesink) and Sun audio
    (sunaudiosrc, sunaudiomixer, sunaudiosink).

  - For video input, GStreamer contains source elements for Video4linux2
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.

## Pipeline Examples

The examples below assume that you have the correct plug-ins available.
In general, "pulsesink" can be substituted with another audio output
plug-in such as "alsasink", "osxaudiosink", or "wasapisink"

Likewise, `xvimagesink` can be substituted with `d3dvideosink`,
`ximagesink`, `sdlvideosink`, `osxvideosink`, or `aasink`.

Keep in mind though that different sinks might accept different formats and
even the same sink might accept different formats on different machines, so
you might need to add converter elements like `audioconvert` and `audioresample`
for audio or `videoconvertscale` in front of the sink to make things work.

### Audio playback

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and

---

