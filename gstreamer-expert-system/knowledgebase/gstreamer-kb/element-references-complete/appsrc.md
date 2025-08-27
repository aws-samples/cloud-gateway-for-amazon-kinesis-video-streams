
## Goal

[](tutorials/basic/short-cutting-the-pipeline.md) showed
how an application can manually extract or inject data into a pipeline
by using two special elements called `appsrc` and `appsink`.
`playbin` allows using these elements too, but the method to connect
them is different. To connect an `appsink` to `playbin` see [](tutorials/playback/custom-playbin-sinks.md).
This tutorial shows:

  - How to connect `appsrc` with `playbin`
  - How to configure the `appsrc`

## A playbin waveform generator

Copy this code into a text file named `playback-tutorial-3.c`.

**playback-tutorial-3.c**

``` c
#include <gst/gst.h>
#include <gst/audio/audio.h>
#include <string.h>

#define CHUNK_SIZE 1024   /* Amount of bytes we are sending in each buffer */
#define SAMPLE_RATE 44100 /* Samples per second we are sending */

--
  guint sourceid;        /* To control the GSource */

  GMainLoop *main_loop;  /* GLib's Main Loop */
} CustomData;

/* This method is called by the idle GSource in the mainloop, to feed CHUNK_SIZE bytes into appsrc.
 * The ide handler is added to the mainloop when appsrc requests us to start sending data (need-data signal)
 * and is removed when appsrc has enough data (enough-data signal).
 */
static gboolean push_data (CustomData *data) {
  GstBuffer *buffer;
  GstFlowReturn ret;
  int i;
  GstMapInfo map;
  gint16 *raw;
  gint num_samples = CHUNK_SIZE / 2; /* Because each sample is 16 bits */
  gfloat freq;

  /* Create a new empty buffer */
  buffer = gst_buffer_new_and_alloc (CHUNK_SIZE);

  /* Set its timestamp and duration */
  GST_BUFFER_TIMESTAMP (buffer) = gst_util_uint64_scale (data->num_samples, GST_SECOND, SAMPLE_RATE);
--
    raw[i] = (gint16)(500 * data->a);
  }
  gst_buffer_unmap (buffer, &map);
  data->num_samples += num_samples;

  /* Push the buffer into the appsrc */
  g_signal_emit_by_name (data->app_source, "push-buffer", buffer, &ret);

  /* Free the buffer now that we are done with it */
  gst_buffer_unref (buffer);

  if (ret != GST_FLOW_OK) {
    /* We got some error, stop sending data */
    return FALSE;
  }

  return TRUE;
}

/* This signal callback triggers when appsrc needs data. Here, we add an idle handler
 * to the mainloop to start pushing data into the appsrc */
static void start_feed (GstElement *source, guint size, CustomData *data) {
  if (data->sourceid == 0) {
    g_print ("Start feeding\n");
    data->sourceid = g_idle_add ((GSourceFunc) push_data, data);
  }
}

/* This callback triggers when appsrc has enough data and we can stop sending.
 * We remove the idle handler from the mainloop */
static void stop_feed (GstElement *source, CustomData *data) {
  if (data->sourceid != 0) {
    g_print ("Stop feeding\n");
    g_source_remove (data->sourceid);
    data->sourceid = 0;
  }
}

/* This function is called when an error message is posted on the bus */
static void error_cb (GstBus *bus, GstMessage *msg, CustomData *data) {
  GError *err;
  gchar *debug_info;

  /* Print error details on the screen */
--
  g_free (debug_info);

  g_main_loop_quit (data->main_loop);
}

/* This function is called when playbin has created the appsrc element, so we have
 * a chance to configure it. */
static void source_setup (GstElement *pipeline, GstElement *source, CustomData *data) {
  GstAudioInfo info;
  GstCaps *audio_caps;

  g_print ("Source has been created. Configuring.\n");
  data->app_source = source;

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (source, "need-data", G_CALLBACK (start_feed), data);
  g_signal_connect (source, "enough-data", G_CALLBACK (stop_feed), data);
  gst_caps_unref (audio_caps);
}

int main(int argc, char *argv[]) {
  CustomData data;
  GstBus *bus;

  /* Initialize custom data structure */
  memset (&data, 0, sizeof (data));
  data.b = 1; /* For waveform generation */
--

  /* Initialize GStreamer */
  gst_init (&argc, &argv);

  /* Create the playbin element */
  data.pipeline = gst_parse_launch ("playbin uri=appsrc://", NULL);
  g_signal_connect (data.pipeline, "source-setup", G_CALLBACK (source_setup), &data);

  /* Instruct the bus to emit signals for each received message, and connect to the interesting signals */
  bus = gst_element_get_bus (data.pipeline);
  gst_bus_add_signal_watch (bus);
  g_signal_connect (G_OBJECT (bus), "message::error", (GCallback)error_cb, &data);
  gst_object_unref (bus);

  /* Start playing the pipeline */
  gst_element_set_state (data.pipeline, GST_STATE_PLAYING);

  /* Create a GLib Main Loop and set it to run */
  data.main_loop = g_main_loop_new (NULL, FALSE);
  g_main_loop_run (data.main_loop);

--
> your network connection is fast enough
>
> Required libraries: `gstreamer-1.0` `gstreamer-audio-1.0`


To use an `appsrc` as the source for the pipeline, simply instantiate a
`playbin` and set its URI to `appsrc://`

``` c
/* Create the playbin element */
data.pipeline = gst_parse_launch ("playbin uri=appsrc://", NULL);
```

`playbin` will create an internal `appsrc` element and fire the
`source-setup` signal to allow the application to configure
it:

``` c
g_signal_connect (data.pipeline, "source-setup", G_CALLBACK (source_setup), &data);
```

In particular, it is important to set the caps property of `appsrc`,
since, once the signal handler returns, `playbin` will instantiate the
next element in the pipeline according to these
caps:

``` c
/* This function is called when playbin has created the appsrc element, so we have
 * a chance to configure it. */
static void source_setup (GstElement *pipeline, GstElement *source, CustomData *data) {
  GstAudioInfo info;
  GstCaps *audio_caps;

  g_print ("Source has been created. Configuring.\n");
  data->app_source = source;

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (source, "need-data", G_CALLBACK (start_feed), data);
  g_signal_connect (source, "enough-data", G_CALLBACK (stop_feed), data);
  gst_caps_unref (audio_caps);
}
```

The configuration of the `appsrc` is exactly the same as in
[](tutorials/basic/short-cutting-the-pipeline.md):
the caps are set to `audio/x-raw`, and two callbacks are registered,
so the element can tell the application when it needs to start and stop
pushing data. See [](tutorials/basic/short-cutting-the-pipeline.md)
for more details.

From this point onwards, `playbin` takes care of the rest of the
pipeline, and the application only needs to worry about generating more
data when told so.

To learn how data can be extracted from `playbin` using the
`appsink` element, see [](tutorials/playback/custom-playbin-sinks.md).

## Conclusion

This tutorial applies the concepts shown in
[](tutorials/basic/short-cutting-the-pipeline.md) to
`playbin`. In particular, it has shown:

  - How to connect `appsrc` with `playbin` using the special
    URI `appsrc://`
  - How to configure the `appsrc` using the `source-setup` signal

It has been a pleasure having you here, and see you soon!
# Using appsink/appsrc in Qt

## Goal

For those times when you need to stream data into or out of GStreamer
through your application, GStreamer includes two helpful elements:

  - `appsink` - Allows applications to easily extract data from a
    GStreamer pipeline
  - `appsrc` - Allows applications to easily stream data into a
    GStreamer pipeline

This tutorial will demonstrate how to use both of them by constructing a
pipeline to decode an audio file, stream it into an application's code,
then stream it back into your audio output device. All this, using
QtGStreamer.

## Steps

First, the files. These are also available in the
`examples/appsink-src` directory of the QGstreamer SDK.

**CMakeLists.txt**

```
--
    pipeline1 = QGst::Parse::launch(pipe1Descr).dynamicCast<QGst::Pipeline>();
    m_sink.setElement(pipeline1->getElementByName("mysink"));
    QGlib::connect(pipeline1->bus(), "message::error", this, &Player::onBusMessage);
    pipeline1->bus()->addSignalWatch();
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
    /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
}
Player::~Player()
{
    pipeline1->setState(QGst::StateNull);
    pipeline2->setState(QGst::StateNull);
}
void Player::onBusMessage(const QGst::MessagePtr & message)
{
--

**Second Pipeline**

``` c
    /* sink pipeline */
    QString pipe2Descr = QString("appsrc name=\"mysrc\" caps=\"%1\" ! autoaudiosink").arg(caps);
    pipeline2 = QGst::Parse::launch(pipe2Descr).dynamicCast<QGst::Pipeline>();
    m_src.setElement(pipeline2->getElementByName("mysrc"));
    QGlib::connect(pipeline2->bus(), "message", this, &Player::onBusMessage);
    pipeline2->bus()->addSignalWatch();
```

Finally, the pipeline is started:

**Starting the pipeline**

``` c
 /* start playing */
    pipeline1->setState(QGst::StatePlaying);
    pipeline2->setState(QGst::StatePlaying);
```
--
        return QGst::FlowOk;
    }
```

Our implementation takes the new buffer and pushes it into the
`appsrc` element, which got assigned in the `Player` constructor:

**Player::Player()**

``` c
Player::Player(int argc, char **argv)
    : QCoreApplication(argc, argv), m_sink(&m_src)
```

From there, buffers flow into the `autoaudiosink` element, which
automatically figures out a way to send it to your speakers.

## Conclusion

You should now have an understanding of how to push and pull arbitrary
data into and out of a GStreamer pipeline.
Applications can interact with the data flowing through a GStreamer
pipeline in several ways. This tutorial describes the easiest one, since
it uses elements that have been created for this sole purpose.

The element used to inject application data into a GStreamer pipeline is
`appsrc`, and its counterpart, used to extract GStreamer data back to
the application is `appsink`. To avoid confusing the names, think of it
from GStreamer's point of view: `appsrc` is just a regular source, that
provides data magically fallen from the sky (provided by the
application, actually). `appsink` is a regular sink, where the data
flowing through a GStreamer pipeline goes to die (it is recovered by the
application, actually).

`appsrc` and `appsink` are so versatile that they offer their own API
(see their documentation), which can be accessed by linking against the
`gstreamer-app` library. In this tutorial, however, we will use a
simpler approach and control them through signals.

`appsrc` can work in a variety of modes: in **pull** mode, it requests
data from the application every time it needs it. In **push** mode, the
application pushes data at its own pace. Furthermore, in push mode, the
application can choose to be blocked in the push function when enough
data has already been provided, or it can listen to the
`enough-data` and `need-data` signals to control flow. This example
implements the latter approach. Information regarding the other methods
can be found in the `appsrc` documentation.

### Buffers

Data travels through a GStreamer pipeline in chunks called **buffers**.
Since this example produces and consumes data, we need to know about
`GstBuffer`s.

Source Pads produce buffers, that are consumed by Sink Pads; GStreamer
takes these buffers and passes them from element to element.

A buffer simply represents a unit of data, do not assume that all
buffers will have the same size, or represent the same amount of time.
Neither should you assume that if a single buffer enters an element, a
single buffer will come out. Elements are free to do with the received
buffers as they please. `GstBuffer`s may also contain more than one
--
when should that frame be displayed.

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
--
  guint sourceid;        /* To control the GSource */

  GMainLoop *main_loop;  /* GLib's Main Loop */
} CustomData;

/* This method is called by the idle GSource in the mainloop, to feed CHUNK_SIZE bytes into appsrc.
 * The idle handler is added to the mainloop when appsrc requests us to start sending data (need-data signal)
 * and is removed when appsrc has enough data (enough-data signal).
 */
static gboolean push_data (CustomData *data) {
  GstBuffer *buffer;
  GstFlowReturn ret;
  int i;
  GstMapInfo map;
  gint16 *raw;
  gint num_samples = CHUNK_SIZE / 2; /* Because each sample is 16 bits */
  gfloat freq;

  /* Create a new empty buffer */
  buffer = gst_buffer_new_and_alloc (CHUNK_SIZE);

  /* Set its timestamp and duration */
  GST_BUFFER_TIMESTAMP (buffer) = gst_util_uint64_scale (data->num_samples, GST_SECOND, SAMPLE_RATE);
--
    raw[i] = (gint16)(500 * data->a);
  }
  gst_buffer_unmap (buffer, &map);
  data->num_samples += num_samples;

  /* Push the buffer into the appsrc */
  g_signal_emit_by_name (data->app_source, "push-buffer", buffer, &ret);

  /* Free the buffer now that we are done with it */
  gst_buffer_unref (buffer);

  if (ret != GST_FLOW_OK) {
    /* We got some error, stop sending data */
    return FALSE;
  }

  return TRUE;
}

/* This signal callback triggers when appsrc needs data. Here, we add an idle handler
 * to the mainloop to start pushing data into the appsrc */
static void start_feed (GstElement *source, guint size, CustomData *data) {
  if (data->sourceid == 0) {
    g_print ("Start feeding\n");
    data->sourceid = g_idle_add ((GSourceFunc) push_data, data);
  }
}

/* This callback triggers when appsrc has enough data and we can stop sending.
 * We remove the idle handler from the mainloop */
static void stop_feed (GstElement *source, CustomData *data) {
  if (data->sourceid != 0) {
    g_print ("Stop feeding\n");
    g_source_remove (data->sourceid);
    data->sourceid = 0;
  }
}

/* The appsink has received a buffer */
static GstFlowReturn new_sample (GstElement *sink, CustomData *data) {
  GstSample *sample;

  /* Retrieve the buffer */
  g_signal_emit_by_name (sink, "pull-sample", &sample);
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
--
  }

  /* Configure wavescope */
  g_object_set (data.visual, "shader", 0, "style", 0, NULL);

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (data.app_source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (data.app_source, "need-data", G_CALLBACK (start_feed), &data);
  g_signal_connect (data.app_source, "enough-data", G_CALLBACK (stop_feed), &data);

  /* Configure appsink */
  g_object_set (data.app_sink, "emit-signals", TRUE, "caps", audio_caps, NULL);
  g_signal_connect (data.app_sink, "new-sample", G_CALLBACK (new_sample), &data);
  gst_caps_unref (audio_caps);

  /* Link all elements that can be automatically linked because they have "Always" pads */
  gst_bin_add_many (GST_BIN (data.pipeline), data.app_source, data.tee, data.audio_queue, data.audio_convert1, data.audio_resample,
      data.audio_sink, data.video_queue, data.audio_convert2, data.visual, data.video_convert, data.video_sink, data.app_queue,
      data.app_sink, NULL);
--
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
(this is, if the downstream elements will understand this kind of data).
This property must be a `GstCaps` object, which is easily built from a
string with `gst_caps_from_string()`.

We then connect to the `need-data` and `enough-data` signals. These are
fired by `appsrc` when its internal queue of data is running low or
almost full, respectively. We will use these signals to start and stop
(respectively) our signal generation process.

``` c
/* Configure appsink */
g_object_set (data.app_sink, "emit-signals", TRUE, "caps", audio_caps, NULL);
g_signal_connect (data.app_sink, "new-sample", G_CALLBACK (new_sample), &data);
gst_caps_unref (audio_caps);
```

Regarding the `appsink` configuration, we connect to the
`new-sample` signal, which is emitted every time the sink receives a
buffer. Also, the signal emission needs to be enabled through the
`emit-signals` property, because, by default, it is disabled.

Starting the pipeline, waiting for messages and final cleanup is done as
usual. Let's review the callbacks we have just
registered:

``` c
/* This signal callback triggers when appsrc needs data. Here, we add an idle handler
 * to the mainloop to start pushing data into the appsrc */
static void start_feed (GstElement *source, guint size, CustomData *data) {
  if (data->sourceid == 0) {
    g_print ("Start feeding\n");
    data->sourceid = g_idle_add ((GSourceFunc) push_data, data);
  }
}
```

This function is called when the internal queue of `appsrc` is about to
starve (run out of data). The only thing we do here is register a GLib
idle function with `g_idle_add()` that feeds data to `appsrc` until it
is full again. A GLib idle function is a method that GLib will call from
its main loop whenever it is “idle”, this is, when it has no
higher-priority tasks to perform. It requires a GLib `GMainLoop` to be
instantiated and running, obviously.

This is only one of the multiple approaches that `appsrc` allows. In
particular, buffers do not need to be fed into `appsrc` from the main
thread using GLib, and you do not need to use the `need-data` and
`enough-data` signals to synchronize with `appsrc` (although this is
allegedly the most convenient).

We take note of the sourceid that `g_idle_add()` returns, so we can
disable it
later.

``` c
/* This callback triggers when appsrc has enough data and we can stop sending.
 * We remove the idle handler from the mainloop */
static void stop_feed (GstElement *source, CustomData *data) {
  if (data->sourceid != 0) {
    g_print ("Stop feeding\n");
    g_source_remove (data->sourceid);
    data->sourceid = 0;
  }
}
```

This function is called when the internal queue of `appsrc` is full
enough so we stop pushing data. Here we simply remove the idle function
by using `g_source_remove()` (The idle function is implemented as a
`GSource`).

``` c
/* This method is called by the idle GSource in the mainloop, to feed CHUNK_SIZE bytes into appsrc.
 * The ide handler is added to the mainloop when appsrc requests us to start sending data (need-data signal)
 * and is removed when appsrc has enough data (enough-data signal).
 */
static gboolean push_data (CustomData *data) {
  GstBuffer *buffer;
  GstFlowReturn ret;
  GstMapInfo map;
  int i;
  gint num_samples = CHUNK_SIZE / 2; /* Because each sample is 16 bits */
  gfloat freq;

  /* Create a new empty buffer */
  buffer = gst_buffer_new_and_alloc (CHUNK_SIZE);

  /* Set its timestamp and duration */
  GST_BUFFER_TIMESTAMP (buffer) = gst_util_uint64_scale (data->num_samples, GST_SECOND, SAMPLE_RATE);
  GST_BUFFER_DURATION (buffer) = gst_util_uint64_scale (num_samples, GST_SECOND, SAMPLE_RATE);
--
    /* unmap buffer when done */
    gst_buffer_unmap (buf, &map);
  }
```

This is the function that feeds `appsrc`. It will be called by GLib at
times and rates which are out of our control, but we know that we will
disable it when its job is done (when the queue in `appsrc` is full).

Its first task is to create a new buffer with a given size (in this
example, it is arbitrarily set to 1024 bytes) with
`gst_buffer_new_and_alloc()`.

We count the number of samples that we have generated so far with the
`CustomData.num_samples` variable, so we can time-stamp this buffer
using the `GST_BUFFER_TIMESTAMP` macro in `GstBuffer`.

Since we are producing buffers of the same size, their duration is the
same and is set using the `GST_BUFFER_DURATION` in `GstBuffer`.

`gst_util_uint64_scale()` is a utility function that scales (multiply
and divide) numbers which can be large, without fear of overflows.

--
We will skip over the waveform generation, since it is outside the scope
of this tutorial (it is simply a funny way of generating a pretty
psychedelic wave).

``` c
/* Push the buffer into the appsrc */
g_signal_emit_by_name (data->app_source, "push-buffer", buffer, &ret);

/* Free the buffer now that we are done with it */
gst_buffer_unref (buffer);
```

Note that there is also `gst_app_src_push_buffer()` as part of the
`gstreamer-app-1.0` library, which is perhaps a better function to use
to push a buffer into appsrc than the signal emission above, because it has
a proper type signature so it's harder to get wrong. However, be aware
that if you use `gst_app_src_push_buffer()` it will take ownership of the
buffer passed instead, so in that case you won't have to unref it after pushing. 

Once we have the buffer ready, we pass it to `appsrc` with the
`push-buffer` action signal (see information box at the end of [](tutorials/playback/playbin-usage.md)), and then
`gst_buffer_unref()` it since we no longer need it.

``` c
/* The appsink has received a buffer */
static GstFlowReturn new_sample (GstElement *sink, CustomData *data) {
  GstSample *sample;
  /* Retrieve the buffer */
  g_signal_emit_by_name (sink, "pull-sample", &sample);
  if (sample) {
    /* The only thing we do in this example is print a * to indicate a received buffer */
    g_print ("*");
    gst_sample_unref (sample);
    return GST_FLOW_OK;
  }
--
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

It has been a pleasure having you here, and see you soon!

## Goal

[](tutorials/basic/short-cutting-the-pipeline.md) showed
how an application can manually extract or inject data into a pipeline
by using two special elements called `appsrc` and `appsink`.
`playbin` allows using these elements too, but the method to connect
them is different. To connect an `appsink` to `playbin` see [](tutorials/playback/custom-playbin-sinks.md).
This tutorial shows:

  - How to connect `appsrc` with `playbin`
  - How to configure the `appsrc`

## A playbin waveform generator

Copy this code into a text file named `playback-tutorial-3.c`.

**playback-tutorial-3.c**

``` c
#include <gst/gst.h>
#include <gst/audio/audio.h>
#include <string.h>

#define CHUNK_SIZE 1024   /* Amount of bytes we are sending in each buffer */
#define SAMPLE_RATE 44100 /* Samples per second we are sending */

--
  guint sourceid;        /* To control the GSource */

  GMainLoop *main_loop;  /* GLib's Main Loop */
} CustomData;

/* This method is called by the idle GSource in the mainloop, to feed CHUNK_SIZE bytes into appsrc.
 * The ide handler is added to the mainloop when appsrc requests us to start sending data (need-data signal)
 * and is removed when appsrc has enough data (enough-data signal).
 */
static gboolean push_data (CustomData *data) {
  GstBuffer *buffer;
  GstFlowReturn ret;
  int i;
  GstMapInfo map;
  gint16 *raw;
  gint num_samples = CHUNK_SIZE / 2; /* Because each sample is 16 bits */
  gfloat freq;

  /* Create a new empty buffer */
  buffer = gst_buffer_new_and_alloc (CHUNK_SIZE);

  /* Set its timestamp and duration */
  GST_BUFFER_TIMESTAMP (buffer) = gst_util_uint64_scale (data->num_samples, GST_SECOND, SAMPLE_RATE);
--
    raw[i] = (gint16)(500 * data->a);
  }
  gst_buffer_unmap (buffer, &map);
  data->num_samples += num_samples;

  /* Push the buffer into the appsrc */
  g_signal_emit_by_name (data->app_source, "push-buffer", buffer, &ret);

  /* Free the buffer now that we are done with it */
  gst_buffer_unref (buffer);

  if (ret != GST_FLOW_OK) {
    /* We got some error, stop sending data */
    return FALSE;
  }

  return TRUE;
}

/* This signal callback triggers when appsrc needs data. Here, we add an idle handler
 * to the mainloop to start pushing data into the appsrc */
static void start_feed (GstElement *source, guint size, CustomData *data) {
  if (data->sourceid == 0) {
    g_print ("Start feeding\n");
    data->sourceid = g_idle_add ((GSourceFunc) push_data, data);
  }
}

/* This callback triggers when appsrc has enough data and we can stop sending.
 * We remove the idle handler from the mainloop */
static void stop_feed (GstElement *source, CustomData *data) {
  if (data->sourceid != 0) {
    g_print ("Stop feeding\n");
    g_source_remove (data->sourceid);
    data->sourceid = 0;
  }
}

/* This function is called when an error message is posted on the bus */
static void error_cb (GstBus *bus, GstMessage *msg, CustomData *data) {
  GError *err;
  gchar *debug_info;

  /* Print error details on the screen */
--
  g_free (debug_info);

  g_main_loop_quit (data->main_loop);
}

/* This function is called when playbin has created the appsrc element, so we have
 * a chance to configure it. */
static void source_setup (GstElement *pipeline, GstElement *source, CustomData *data) {
  GstAudioInfo info;
  GstCaps *audio_caps;

  g_print ("Source has been created. Configuring.\n");
  data->app_source = source;

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (source, "need-data", G_CALLBACK (start_feed), data);
  g_signal_connect (source, "enough-data", G_CALLBACK (stop_feed), data);
  gst_caps_unref (audio_caps);
}

int main(int argc, char *argv[]) {
  CustomData data;
  GstBus *bus;

  /* Initialize custom data structure */
  memset (&data, 0, sizeof (data));
  data.b = 1; /* For waveform generation */
--

  /* Initialize GStreamer */
  gst_init (&argc, &argv);

  /* Create the playbin element */
  data.pipeline = gst_parse_launch ("playbin uri=appsrc://", NULL);
  g_signal_connect (data.pipeline, "source-setup", G_CALLBACK (source_setup), &data);

  /* Instruct the bus to emit signals for each received message, and connect to the interesting signals */
  bus = gst_element_get_bus (data.pipeline);
  gst_bus_add_signal_watch (bus);
  g_signal_connect (G_OBJECT (bus), "message::error", (GCallback)error_cb, &data);
  gst_object_unref (bus);

  /* Start playing the pipeline */
  gst_element_set_state (data.pipeline, GST_STATE_PLAYING);

  /* Create a GLib Main Loop and set it to run */
  data.main_loop = g_main_loop_new (NULL, FALSE);
  g_main_loop_run (data.main_loop);

--
> your network connection is fast enough
>
> Required libraries: `gstreamer-1.0` `gstreamer-audio-1.0`


To use an `appsrc` as the source for the pipeline, simply instantiate a
`playbin` and set its URI to `appsrc://`

``` c
/* Create the playbin element */
data.pipeline = gst_parse_launch ("playbin uri=appsrc://", NULL);
```

`playbin` will create an internal `appsrc` element and fire the
`source-setup` signal to allow the application to configure
it:

``` c
g_signal_connect (data.pipeline, "source-setup", G_CALLBACK (source_setup), &data);
```

In particular, it is important to set the caps property of `appsrc`,
since, once the signal handler returns, `playbin` will instantiate the
next element in the pipeline according to these
caps:

``` c
/* This function is called when playbin has created the appsrc element, so we have
 * a chance to configure it. */
static void source_setup (GstElement *pipeline, GstElement *source, CustomData *data) {
  GstAudioInfo info;
  GstCaps *audio_caps;

  g_print ("Source has been created. Configuring.\n");
  data->app_source = source;

  /* Configure appsrc */
  gst_audio_info_set_format (&info, GST_AUDIO_FORMAT_S16, SAMPLE_RATE, 1, NULL);
  audio_caps = gst_audio_info_to_caps (&info);
  g_object_set (source, "caps", audio_caps, "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (source, "need-data", G_CALLBACK (start_feed), data);
  g_signal_connect (source, "enough-data", G_CALLBACK (stop_feed), data);
  gst_caps_unref (audio_caps);
}
```

The configuration of the `appsrc` is exactly the same as in
[](tutorials/basic/short-cutting-the-pipeline.md):
the caps are set to `audio/x-raw`, and two callbacks are registered,
so the element can tell the application when it needs to start and stop
pushing data. See [](tutorials/basic/short-cutting-the-pipeline.md)
for more details.

From this point onwards, `playbin` takes care of the rest of the
pipeline, and the application only needs to worry about generating more
data when told so.

To learn how data can be extracted from `playbin` using the
`appsink` element, see [](tutorials/playback/custom-playbin-sinks.md).

## Conclusion

This tutorial applies the concepts shown in
[](tutorials/basic/short-cutting-the-pipeline.md) to
`playbin`. In particular, it has shown:

  - How to connect `appsrc` with `playbin` using the special
    URI `appsrc://`
  - How to configure the `appsrc` using the `source-setup` signal

It has been a pleasure having you here, and see you soon!
plugin and have the base class manage it. See the Plugin Writer's Guide for more
information on this topic. Additionally, review the next section, which explains
how to statically embed plugins in your application.

There are two possible elements that you can use for the above-mentioned
purposes: `appsrc` (an imaginary source) and `appsink` (an imaginary sink). The
same method applies to these elements. We will discuss how to use them to insert
(using `appsrc`) or to grab (using `appsink`) data from a pipeline, and how to set
negotiation.

Both `appsrc` and `appsink` provide 2 sets of API. One API uses standard
`GObject` (action) signals and properties. The same API is also available
as a regular C API. The C API is more performant but requires you to
link to the app library in order to use the elements.

### Inserting data with appsrc

Let's take a look at `appsrc` and how to insert application data into the
pipeline.

`appsrc` has some configuration options that control the way it operates. You
should decide about the following:

  - Will `appsrc` operate in push or pull mode. The `stream-type`
    property can be used to control this. A `random-access` `stream-type`
    will make `appsrc` activate pull mode scheduling while the other
    `stream-types` activate push mode.

  - The caps of the buffers that `appsrc` will push out. This needs to be
    configured with the `caps` property. This property must be set to a fixed
    caps and will be used to negotiate a format downstream.

  - Whether `appsrc` operates in live mode or not. This is configured
    with the `is-live` property. When operating in live-mode it is
    also important to set the `min-latency` and `max-latency` properties.
    `min-latency` should be set to the amount of time it takes between
    capturing a buffer and when it is pushed inside `appsrc`. In live
    mode, you should timestamp the buffers with the pipeline `running-time`
    when the first byte of the buffer was captured before feeding them to
    `appsrc`. You can let `appsrc` do the timestamping with
    the `do-timestamp` property, but then the `min-latency` must be set to 0
    because `appsrc` timestamps based on what was the `running-time` when it got
    a given buffer.

  - The format of the SEGMENT event that `appsrc` will push. This format
    has implications for how the buffers' `running-time` will be calculated,
    so you must be sure you understand this. For live sources
    you probably want to set the format property to `GST_FORMAT_TIME`.
    For non-live sources, it depends on the media type that you are
    handling. If you plan to timestamp the buffers, you should probably
    use `GST_FORMAT_TIME` as format, if you don't, `GST_FORMAT_BYTES` might
    be appropriate.

  - If `appsrc` operates in random-access mode, it is important to
    configure the size property with the number of bytes in the stream. This
    will allow downstream elements to know the size of the media and seek to the
    end of the stream when needed.

The main way of handling data to `appsrc` is by using the
`gst_app_src_push_buffer ()` function or by emitting the `push-buffer` action
signal. This will put the buffer onto a queue from which `appsrc` will
read in its streaming thread. It's important to note that data
transport will not happen from the thread that performed the `push-buffer`
call.

The `max-bytes` property controls how much data can be queued in `appsrc`
before `appsrc` considers the queue full. A filled internal queue will
always signal the `enough-data` signal, which signals the application
that it should stop pushing data into `appsrc`. The `block` property will
cause `appsrc` to block the `push-buffer` method until free data becomes
available again.

When the internal queue is running out of data, the `need-data` signal
is emitted, which signals the application that it should start pushing
more data into `appsrc`.

In addition to the `need-data` and `enough-data` signals, `appsrc` can
emit `seek-data` when the `stream-mode` property is set to
`seekable` or `random-access`. The signal argument will contain the
new desired position in the stream expressed in the unit set with the
`format` property. After receiving the `seek-data` signal, the
application should push buffers from the new position.

When the last byte is pushed into `appsrc`, you must call
`gst_app_src_end_of_stream ()` to make it send an `EOS` downstream.

These signals allow the application to operate `appsrc` in push and pull
mode as will be explained next.

#### Using appsrc in push mode

When `appsrc` is configured in push mode (`stream-type` is stream or
seekable), the application repeatedly calls the `push-buffer` method with
a new buffer. Optionally, the queue size in the `appsrc` can be controlled
with the `enough-data` and `need-data` signals by respectively
stopping/starting the `push-buffer` calls. The value of the `min-percent`
property defines how empty the internal `appsrc` queue needs to be before
the `need-data` signal is issued. You can set this to some positive value
to avoid completely draining the queue.

Don't forget to implement a `seek-data` callback when the `stream-type` is
set to `GST_APP_STREAM_TYPE_SEEKABLE`.

Use this mode when implementing various network protocols or hardware
devices.

#### Using appsrc in pull mode

In pull mode, data is fed to `appsrc` from the `need-data` signal
handler. You should push exactly the amount of bytes requested in the
`need-data` signal. You are only allowed to push less bytes when you are
at the end of the stream.

Use this mode for file access or other randomly accessible sources.

#### Appsrc example

This example application will generate black/white (it switches every
second) video to an Xv-window output by using `appsrc` as a source with
caps to force a format. We use a colorspace conversion element to make
sure that we feed the right format to the X server. We configure a
video stream with a variable framerate (0/1) and we set the timestamps
on the outgoing buffers in such a way that we play 2 frames per second.

Note how we use the pull mode method of pushing new buffers into `appsrc`
although `appsrc` is running in push mode.

``` c
#include <gst/gst.h>

static GMainLoop *loop;

static void
cb_need_data (GstElement *appsrc,
          guint       unused_size,
          gpointer    user_data)
{
  static gboolean white = FALSE;
  static GstClockTime timestamp = 0;
  GstBuffer *buffer;
  guint size;
  GstFlowReturn ret;

  size = 385 * 288 * 2;

  buffer = gst_buffer_new_allocate (NULL, size, NULL);

  /* this makes the image black/white */
  gst_buffer_memset (buffer, 0, white ? 0xff : 0x0, size);
--
  GST_BUFFER_PTS (buffer) = timestamp;
  GST_BUFFER_DURATION (buffer) = gst_util_uint64_scale_int (1, GST_SECOND, 2);

  timestamp += GST_BUFFER_DURATION (buffer);

  g_signal_emit_by_name (appsrc, "push-buffer", buffer, &ret);
  gst_buffer_unref (buffer);

  if (ret != GST_FLOW_OK) {
    /* something wrong, stop pushing */
    g_main_loop_quit (loop);
  }
}

gint
main (gint   argc,
      gchar *argv[])
{
  GstElement *pipeline, *appsrc, *conv, *videosink;

  /* init GStreamer */
  gst_init (&argc, &argv);
  loop = g_main_loop_new (NULL, FALSE);

  /* setup pipeline */
  pipeline = gst_pipeline_new ("pipeline");
  appsrc = gst_element_factory_make ("appsrc", "source");
  conv = gst_element_factory_make ("videoconvert", "conv");
  videosink = gst_element_factory_make ("xvimagesink", "videosink");

  /* setup */
  g_object_set (G_OBJECT (appsrc), "caps",
        gst_caps_new_simple ("video/x-raw",
                     "format", G_TYPE_STRING, "RGB16",
                     "width", G_TYPE_INT, 384,
                     "height", G_TYPE_INT, 288,
                     "framerate", GST_TYPE_FRACTION, 0, 1,
                     NULL), NULL);
  gst_bin_add_many (GST_BIN (pipeline), appsrc, conv, videosink, NULL);
  gst_element_link_many (appsrc, conv, videosink, NULL);

  /* setup appsrc */
  g_object_set (G_OBJECT (appsrc),
        "stream-type", 0,
        "format", GST_FORMAT_TIME, NULL);
  g_signal_connect (appsrc, "need-data", G_CALLBACK (cb_need_data), NULL);

  /* play */
  gst_element_set_state (pipeline, GST_STATE_PLAYING);
  g_main_loop_run (loop);

  /* clean up */
  gst_element_set_state (pipeline, GST_STATE_NULL);
  gst_object_unref (GST_OBJECT (pipeline));
  g_main_loop_unref (loop);

  return 0;
}
```

### Grabbing data with appsink

Unlike `appsrc`, `appsink` is a little easier to use. It also supports
pull and push-based modes for getting data from the pipeline.

The normal way of retrieving samples from appsink is by using the
`gst_app_sink_pull_sample()` and `gst_app_sink_pull_preroll()` methods
or by using the `pull-sample` and `pull-preroll` signals. These methods
block until a sample becomes available in the sink or when the sink is
shut down or reaches `EOS`.

`appsink` will internally use a queue to collect buffers from the
streaming thread. If the application is not pulling samples fast enough,
this queue will consume a lot of memory over time. The `max-buffers`
property can be used to limit the queue size. The `drop` property
controls whether the streaming thread blocks or if older buffers are
dropped when the maximum queue size is reached. Note that blocking the
streaming thread can negatively affect real-time performance and should

---

