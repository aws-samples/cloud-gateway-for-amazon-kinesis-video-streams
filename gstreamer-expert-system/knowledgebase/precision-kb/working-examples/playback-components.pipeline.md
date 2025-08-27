using the command “gst-launch-1.0 playbin uri=file:///path/to/file”.

## Decodebin
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

  - The buffer-duration property allows you to configure a maximum size
    in time for the buffer element. The time will be estimated based on
    the bitrate of the network.

  - With the download property you can enable the download buffering method
    as described in [Download buffering][download-buffering]. Setting this
    option to TRUE will only enable download buffering for selected
    formats such as quicktime, flash video, avi and webm.

  - You can also enable buffering on the parsed/demuxed data with the
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

static void
cb_pad_added (GstElement *dec,
          GstPad     *pad,
          gpointer    data)
{
  GstCaps *caps;
  GstStructure *str;
  const gchar *name;
  GstPadTemplate *templ;
  GstElementClass *klass;

  /* check media type */
  caps = gst_pad_query_caps (pad, NULL);
  str = gst_caps_get_structure (caps, 0);
  name = gst_structure_get_name (str);

  klass = GST_ELEMENT_GET_CLASS (sink);

  if (g_str_has_prefix (name, "audio")) {
    templ = gst_element_class_get_pad_template (klass, "audio_sink");
  } else if (g_str_has_prefix (name, "video")) {
    templ = gst_element_class_get_pad_template (klass, "video_sink");
  } else if (g_str_has_prefix (name, "text")) {
    templ = gst_element_class_get_pad_template (klass, "text_sink");
  } else {
    templ = NULL;
  }

  if (templ) {
    GstPad *sinkpad;

    sinkpad = gst_element_request_pad (sink, templ, NULL, NULL);

    if (!gst_pad_is_linked (sinkpad))
      gst_pad_link (pad, sinkpad);

    gst_object_unref (sinkpad);
  }

  gst_clear_caps (&caps);
}

gint
main (gint   argc,
      gchar *argv[])
{
  GMainLoop *loop;
  GstElement *dec;
  GstBus *bus;

  /* init GStreamer */
  gst_init (&argc, &argv);
  loop = g_main_loop_new (NULL, FALSE);

  /* make sure we have input */
  if (argc != 2) {
    g_print ("Usage: %s <uri>\n", argv[0]);
    return -1;
  }

  /* setup */
  pipeline = gst_pipeline_new ("pipeline");

  bus = gst_pipeline_get_bus (GST_PIPELINE (pipeline));
  gst_bus_add_watch (bus, my_bus_callback, loop);
  gst_object_unref (bus);

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



```

This example will show audio and video depending on what you give it.
Try this example on an audio file and you will see that it shows
visualizations. You can change the visualization at runtime by changing
the vis-plugin property.
