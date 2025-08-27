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

  - Can optionally render visualizations when there is no video input.

  - Configurable sink elements.

  - Configurable audio/video sync offset to fine-tune synchronization in
    badly muxed files.

  - Support for taking a snapshot of the last video frame.

Below is an example of how you can use playsink. We use a uridecodebin
element to decode into raw audio and video streams which we then link to
the playsink request pads. We only link the first audio and video pads,
you could use an input-selector to link all pads.

``` c


#include <gst/gst.h>


[.. my_bus_callback goes here ..]





GstElement *pipeline, *sink;
--
  dec = gst_element_factory_make ("uridecodebin", "source");
  g_object_set (G_OBJECT (dec), "uri", argv[1], NULL);
  g_signal_connect (dec, "pad-added", G_CALLBACK (cb_pad_added), NULL);

  /* create audio output */
  sink = gst_element_factory_make ("playsink", "sink");
  gst_util_set_object_arg (G_OBJECT (sink), "flags",
      "soft-colorbalance+soft-volume+vis+text+audio+video");
  gst_bin_add_many (GST_BIN (pipeline), dec, sink, NULL);

  /* run */
  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  g_main_loop_run (loop);

  /* cleanup */
  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));

  return 0;
}


 - combination of a source to handle the given uri, an optional
   queueing element and one or more decodebin2 elements to decode the
   non-raw streams.

### playsink

 - handles display of audio/video/text.
 - has request audio/video/text input pad. There is only one sinkpad
   per type. The requested pads define the configuration of the
   internal pipeline.
 - allows for setting audio/video sinks or does automatic
   sink selection.
 - allows for configuration of visualisation element.
 - allows for enable/disable of visualisation, audio and video.

### playbin

 - combination of one or more uridecodebin elements to read the uri and
   subtitle uri.
 - support for queuing new media to support gapless playback.
 - handles stream selection.
 - uses playsink to display.
 - selection of sinks and configuration of uridecodebin with raw
   output formats.

## Gapless playback feature

playbin has an `about-to-finish` signal. The application should
configure a new uri (and optional suburi) in the callback. When the
current media finishes, this new media will be played next.
  a separate subtitle file).

* `uridecodebin3` wraps `urisourcebin`s and `decodebin3` for any use-cases where
  one wishes to have decoded streams from given URIs.

* Finally `playbin3` combines `uridecodebin3` and `playsink` for providing a
  high-level convenience pipeline for playing back content.


This design has received many improvements over time:

* `decodebin3` was able to detect input changes (caps changes) and reconfigure
  the associated `parsebin` if incompatible. This allows use-cases where
  upstream is an HLS/DASH stream where codecs are different across bitrates. The
  playback remains seamless if the decoders are compatible.

* `decodebin3` was able to bypass the usage of `parsebin` altogether if the
  incoming stream is pull-based, provides a `GstStreamCollection` and is
  compatible with the decoders or output caps.

* `urisourcebin` can handle sources that handle buffering internally, avoiding
--
    potentially being 100% compatible (ex: going from h264/aac to h264/aac).

* Gapless playback (i.e. automatically switching from one source to another, and
  removing any potential gap in the data arriving to the sinks) was implemented by
  pre-rolling a full `uridecodebin3` for the next item to play and switching the
  inputs to `playsink` when the original `uridecodebin3` was EOS.
  * This meant that none of the existing elements (demuxers, parsers, decoders,
    ..) contained in the original `uridecodebin3` were re-used.

Those two use-cases are the same thing: We want to change the URI
(i.e. `urisourcebin`) but re-use as much as possible of existing elements
(i.e. `decodebin3` and `playsink`). The only difference between the two
use-cases is that changing URI should happen instantaneously in the first case,
whereas in the second case it happens when the initial source is done (EOS).

Fixing this will allow:

* Reducing memory and cpu usage (no duplicate elements)

* Lowering latency (no longer re-instantiate/reconfigure elements and re-use
  compatible ones as fast as possible).

Another issue which is related, is figuring out the *optimal* time at which the
next item should be prepared so that it has enough data to playback immediately:
* This shouldn't be too early, some URIs expire after a given time, or the user
  might change their mind in between
* This shouldn't be too late, otherwise we risk not having enough data to
--


## Only use a single uridecodebin3 in playbin3

Only a single `uridecodebin3` is in use in `playbin3` and the source pads it
provides are directly linked to `playsink`.

There can only be at most one stream of each stream type (audio, video, text) on
the output side of `uridecodebin3`. The exception to this is if the user/application
configured a specific multi-sinkpad combiner element for a given stream type,
in which case all streams of that given stream type are linked to that.

All uri-related properties are forwarded directly to `uridecodebin3`, which will
handle switching the sources to the single `decodebin3` it contains.


## uridecodebin3 URI and source handling

The URI for a given entry are handled in a `GstPlayItem` structure which
controls (via intermediary structures):

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

  - Can optionally render visualizations when there is no video input.

  - Configurable sink elements.

  - Configurable audio/video sync offset to fine-tune synchronization in
    badly muxed files.

  - Support for taking a snapshot of the last video frame.

Below is an example of how you can use playsink. We use a uridecodebin
element to decode into raw audio and video streams which we then link to
the playsink request pads. We only link the first audio and video pads,
you could use an input-selector to link all pads.

``` c


#include <gst/gst.h>


[.. my_bus_callback goes here ..]





GstElement *pipeline, *sink;
--
  dec = gst_element_factory_make ("uridecodebin", "source");
  g_object_set (G_OBJECT (dec), "uri", argv[1], NULL);
  g_signal_connect (dec, "pad-added", G_CALLBACK (cb_pad_added), NULL);

  /* create audio output */
  sink = gst_element_factory_make ("playsink", "sink");
  gst_util_set_object_arg (G_OBJECT (sink), "flags",
      "soft-colorbalance+soft-volume+vis+text+audio+video");
  gst_bin_add_many (GST_BIN (pipeline), dec, sink, NULL);

  /* run */
  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  g_main_loop_run (loop);

  /* cleanup */
  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));

  return 0;
}


 - combination of a source to handle the given uri, an optional
   queueing element and one or more decodebin2 elements to decode the
   non-raw streams.

### playsink

 - handles display of audio/video/text.
 - has request audio/video/text input pad. There is only one sinkpad
   per type. The requested pads define the configuration of the
   internal pipeline.
 - allows for setting audio/video sinks or does automatic
   sink selection.
 - allows for configuration of visualisation element.
 - allows for enable/disable of visualisation, audio and video.

### playbin

 - combination of one or more uridecodebin elements to read the uri and
   subtitle uri.
 - support for queuing new media to support gapless playback.
 - handles stream selection.
 - uses playsink to display.
 - selection of sinks and configuration of uridecodebin with raw
   output formats.

## Gapless playback feature

playbin has an `about-to-finish` signal. The application should
configure a new uri (and optional suburi) in the callback. When the
current media finishes, this new media will be played next.

---

