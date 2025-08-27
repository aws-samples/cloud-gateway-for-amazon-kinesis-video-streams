```bash
# After discovering H.264 video + AAC audio from SDP:
gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
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
### This tutorial

This tutorial expands [](tutorials/basic/multithreading-and-pad-availability.md) in
two ways: firstly, the `audiotestsrc` is replaced by an `appsrc` that
will generate the audio data. Secondly, a new branch is added to the
`tee` so data going into the audio sink and the wave display is also
replicated into an `appsink`. The `appsink` uploads the information back
into the application, which then just notifies the user that data has
been received, but it could obviously perform more complex tasks.

![](images/tutorials/basic-tutorial-8.png)

## A crude waveform generator

Copy this code into a text file named `basic-tutorial-8.c` (or find it
in your GStreamer installation).

``` c
#include <gst/gst.h>
#include <gst/audio/audio.h>
#include <string.h>
--
#define CHUNK_SIZE 1024   /* Amount of bytes we are sending in each buffer */
#define SAMPLE_RATE 44100 /* Samples per second we are sending */

/* Structure to contain all our information, so we can pass it to callbacks */
typedef struct _CustomData {
  GstElement *pipeline, *app_source, *tee, *audio_queue, *audio_convert1, *audio_resample, *audio_sink;
  GstElement *video_queue, *audio_convert2, *visual, *video_convert, *video_sink;
  GstElement *app_queue, *app_sink;

  guint64 num_samples;   /* Number of samples generated so far (for timestamp generation) */
  gfloat a, b, c, d;     /* For waveform generation */

  guint sourceid;        /* To control the GSource */

  GMainLoop *main_loop;  /* GLib's Main Loop */
} CustomData;

/* This method is called by the idle GSource in the mainloop, to feed CHUNK_SIZE bytes into appsrc.
 * The idle handler is added to the mainloop when appsrc requests us to start sending data (need-data signal)
 * and is removed when appsrc has enough data (enough-data signal).
 */
--
  /* Initialize GStreamer */
  gst_init (&argc, &argv);

  /* Create the elements */
  data.app_source = gst_element_factory_make ("appsrc", "audio_source");
  data.tee = gst_element_factory_make ("tee", "tee");
  data.audio_queue = gst_element_factory_make ("queue", "audio_queue");
  data.audio_convert1 = gst_element_factory_make ("audioconvert", "audio_convert1");
  data.audio_resample = gst_element_factory_make ("audioresample", "audio_resample");
  data.audio_sink = gst_element_factory_make ("autoaudiosink", "audio_sink");
  data.video_queue = gst_element_factory_make ("queue", "video_queue");
  data.audio_convert2 = gst_element_factory_make ("audioconvert", "audio_convert2");
  data.visual = gst_element_factory_make ("wavescope", "visual");
  data.video_convert = gst_element_factory_make ("videoconvert", "video_convert");
  data.video_sink = gst_element_factory_make ("autovideosink", "video_sink");
  data.app_queue = gst_element_factory_make ("queue", "app_queue");
  data.app_sink = gst_element_factory_make ("appsink", "app_sink");

  /* Create the empty pipeline */
  data.pipeline = gst_pipeline_new ("test-pipeline");

  if (!data.pipeline || !data.app_source || !data.tee || !data.audio_queue || !data.audio_convert1 ||
      !data.audio_resample || !data.audio_sink || !data.video_queue || !data.audio_convert2 || !data.visual ||
      !data.video_convert || !data.video_sink || !data.app_queue || !data.app_sink) {
    g_printerr ("Not all elements could be created.\n");
    return -1;
  }

  /* Configure wavescope */
  g_object_set (data.visual, "shader", 0, "style", 0, NULL);

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (data.app_source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (data.app_source, "need-data", G_CALLBACK (start_feed), &data);
  g_signal_connect (data.app_source, "enough-data", G_CALLBACK (stop_feed), &data);
--
  g_object_set (data.app_sink, "emit-signals", TRUE, "caps", audio_caps, NULL);
  g_signal_connect (data.app_sink, "new-sample", G_CALLBACK (new_sample), &data);
  gst_caps_unref (audio_caps);

  /* Link all elements that can be automatically linked because they have "Always" pads */
  gst_bin_add_many (GST_BIN (data.pipeline), data.app_source, data.tee, data.audio_queue, data.audio_convert1, data.audio_resample,
      data.audio_sink, data.video_queue, data.audio_convert2, data.visual, data.video_convert, data.video_sink, data.app_queue,
      data.app_sink, NULL);
  if (gst_element_link_many (data.app_source, data.tee, NULL) != TRUE ||
      gst_element_link_many (data.audio_queue, data.audio_convert1, data.audio_resample, data.audio_sink, NULL) != TRUE ||
      gst_element_link_many (data.video_queue, data.audio_convert2, data.visual, data.video_convert, data.video_sink, NULL) != TRUE ||
      gst_element_link_many (data.app_queue, data.app_sink, NULL) != TRUE) {
    g_printerr ("Elements could not be linked.\n");
    gst_object_unref (data.pipeline);
    return -1;
  }

  /* Manually link the Tee, which has "Request" pads */
  tee_audio_pad = gst_element_request_pad_simple (data.tee, "src_%u");
  g_print ("Obtained request pad %s for audio branch.\n", gst_pad_get_name (tee_audio_pad));
  queue_audio_pad = gst_element_get_static_pad (data.audio_queue, "sink");
  tee_video_pad = gst_element_request_pad_simple (data.tee, "src_%u");
  g_print ("Obtained request pad %s for video branch.\n", gst_pad_get_name (tee_video_pad));
  queue_video_pad = gst_element_get_static_pad (data.video_queue, "sink");
  tee_app_pad = gst_element_request_pad_simple (data.tee, "src_%u");
  g_print ("Obtained request pad %s for app branch.\n", gst_pad_get_name (tee_app_pad));
  queue_app_pad = gst_element_get_static_pad (data.app_queue, "sink");
  if (gst_pad_link (tee_audio_pad, queue_audio_pad) != GST_PAD_LINK_OK ||
      gst_pad_link (tee_video_pad, queue_video_pad) != GST_PAD_LINK_OK ||
      gst_pad_link (tee_app_pad, queue_app_pad) != GST_PAD_LINK_OK) {
    g_printerr ("Tee could not be linked\n");
    gst_object_unref (data.pipeline);
    return -1;
  }
  gst_object_unref (queue_audio_pad);
  gst_object_unref (queue_video_pad);
  gst_object_unref (queue_app_pad);

  /* Instruct the bus to emit signals for each received message, and connect to the interesting signals */
  bus = gst_element_get_bus (data.pipeline);
--
  /* Create a GLib Main Loop and set it to run */
  data.main_loop = g_main_loop_new (NULL, FALSE);
  g_main_loop_run (data.main_loop);

  /* Release the request pads from the Tee, and unref them */
  gst_element_release_request_pad (data.tee, tee_audio_pad);
  gst_element_release_request_pad (data.tee, tee_video_pad);
  gst_element_release_request_pad (data.tee, tee_app_pad);
  gst_object_unref (tee_audio_pad);
  gst_object_unref (tee_video_pad);
  gst_object_unref (tee_app_pad);

  /* Free resources */
  gst_element_set_state (data.pipeline, GST_STATE_NULL);
  gst_object_unref (data.pipeline);
  return 0;
}
```

> ![Information](images/icons/emoticons/information.svg)
> Need help?
>
> If you need help to compile this code, refer to the **Building the tutorials**  section for your platform: [Linux](installing/on-linux.md#InstallingonLinux-Build), [Mac OS X](installing/on-mac-osx.md#InstallingonMacOSX-Build) or [Windows](installing/on-windows.md#InstallingonWindows-Build), or use this specific command on Linux:
--

The code to create the pipeline (Lines 131 to 205) is an enlarged
version of [Basic tutorial 7: Multithreading and Pad
Availability](tutorials/basic/multithreading-and-pad-availability.md).
It involves instantiating all the elements, link the elements with
Always Pads, and manually link the Request Pads of the `tee` element.

Regarding the configuration of the `appsrc` and `appsink` elements:

``` c
/* Configure appsrc */
gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
audio_caps = gst_audio_info_to_caps (&info);
g_object_set (data.app_source, "caps", audio_caps, NULL);
g_signal_connect (data.app_source, "need-data", G_CALLBACK (start_feed), &data);
g_signal_connect (data.app_source, "enough-data", G_CALLBACK (stop_feed), &data);
```

The first property that needs to be set on the `appsrc` is `caps`. It
specifies the kind of data that the element is going to produce, so
GStreamer can check if linking with downstream elements is possible
--
the data and the size of the data in bytes. Don't forget to `gst_buffer_unmap()`
the buffer again when done with the data.

Remember that this buffer does not have to match the buffer that we produced in
the `push_data` function, any element in the path could have altered the
buffers in any way (Not in this example: there is only a `tee` in the
path between `appsrc` and `appsink`, and the `tee` does not change the content
of the buffers).

We then `gst_sample_unref()` the retrieved sample, and this tutorial is done.

## Conclusion

This tutorial has shown how applications can:

  - Inject data into a pipeline using the `appsrc`element.
  - Retrieve data from a pipeline using the `appsink` element.
  - Manipulate this data by accessing the `GstBuffer`.

In a playbin-based pipeline, the same goals are achieved in a slightly
different way. [](tutorials/playback/short-cutting-the-pipeline.md) shows
how to do it.

This is an advanced element. It is found inside `decodebin`, but you
will rarely need to instantiate it yourself in a normal playback
application.

### `tee`

[](tutorials/basic/multithreading-and-pad-availability.md) already
showed how to use a `tee` element, which splits data to multiple pads.
Splitting the data flow is useful, for example, when capturing a video
where the video is shown on the screen and also encoded and written to a
file. Another example is playing music and hooking up a visualization
module.

One needs to use separate `queue` elements in each branch to provide
separate threads for each branch. Otherwise a blocked dataflow in one
branch would stall the other
branches.

```
gst-launch-1.0 audiotestsrc ! tee name=t ! queue ! audioconvert ! autoaudiosink t. ! queue ! wavescope ! videoconvert ! autovideosink
```

## Capabilities

### `capsfilter`
[](tutorials/basic/gstreamer-tools.md) already
explained how to use Caps filters with `gst-launch-1.0`. When building a
pipeline programmatically, Caps filters are implemented with
the `capsfilter` element. This element does not modify data as such,
but enforces limitations on the data format.

``` bash
gst-launch-1.0 videotestsrc ! video/x-raw, format=GRAY8 ! videoconvert ! autovideosink
```


---

