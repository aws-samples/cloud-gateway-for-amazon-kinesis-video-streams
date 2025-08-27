### `gst-inspect`

`gst-inspect` can be used to inspect all properties, signals, dynamic
parameters and the object hierarchy of an element. This can be very
useful to see which `GObject` properties or which signals (and using
what arguments) an element supports. Run `gst-inspect fakesrc` to get an
idea of what it does. See the manual page of `gst-inspect` for more
information.
mechanism for data flow. A sink pad that supports either mode of
operation might call `activate_mode(PULL)` if the SCHEDULING query
upstream contains the `#GST_PAD_MODE_PULL` scheduling mode, and
`activate_mode(PUSH)` otherwise.

Consider the case `fakesrc ! fakesink`, where fakesink is configured to
operate in PULL mode. State changes in the pipeline will start with
fakesink, which is the most downstream element. The core will call
`activate()` on fakesink’s sink pad. For fakesink to go into PULL mode, it
needs to implement a custom `activate()` function that will call
`activate_mode(PULL)` on its sink pad (because the default is to use PUSH
mode). `activate_mode(PULL)` is then responsible for starting the task
that pulls from fakesrc:src. Clearly, fakesrc needs to be notified that
fakesrc is about to pull on its src pad, even though the pipeline has
not yet changed fakesrc’s state. For this reason, GStreamer will first
call `activate_mode(PULL)` on fakesink:sink’s peer before calling
`activate_mode(PULL)` on fakesink:sinks.

In short, upstream elements operating in PULL mode must be ready to
produce data in READY, after having `activate_mode(PULL)` called on their
source pad. Also, a call to `activate_mode(PULL)` needs to propagate
through the pipeline to every pad that a `gst_pad_pull()` will reach. In
the case `fakesrc ! identity ! fakesink`, calling `activate_mode(PULL)`
on identity’s source pad would need to activate its sink pad in pull
mode as well, which should propagate all the way to fakesrc.

If, on the other hand, `fakesrc ! fakesink` is operating in PUSH mode,
the activation sequence is different. First, `activate()` on fakesink:sink
calls `activate_mode(PUSH)` on fakesink:sink. Then fakesrc’s pads are
activated: sources first, then sinks (of which fakesrc has none).
fakesrc:src’s activation function is then called.

Note that it does not make sense to set an activation function on a
source pad. The peer of a source pad is downstream, meaning it should
have been activated first. If it was activated in PULL mode, the source
pad should have already had `activate_mode(PULL)` called on it, and thus
needs no further activation. Otherwise it should be in PUSH mode, which
is the choice of the default activation function.

So, in the PUSH case, the default activation function chooses PUSH mode,
which calls `activate_mode(PUSH)`, which will then start a task on the
source pad and begin pushing. In this way PUSH scheduling is a bit
easier, because it follows the order of state changes in a pipeline.
fakesink is already in PAUSED with an active sink pad by the time
fakesrc starts pushing data.

## Deactivation

Pad deactivation occurs when its parent goes into the READY state or
when the pad is deactivated explicitly by the application or element.
`gst_pad_set_active()` is called with a FALSE argument, which then
calls `activate_mode(PUSH)` or `activate_mode(PULL)` with a FALSE
argument, depending on the current activation mode of the pad.

## Mode switching

Changing from push to pull modes needs a bit of thought. This is
actually possible and implemented but not yet documented here.

### Boost priority of a thread

```
.----------.    .----------.
| fakesrc  |    | fakesink |
|         src->sink        |
'----------'    '----------'

```

Let's look at the simple pipeline above. We would like to boost the
priority of the streaming thread. It will be the fakesrc element that
starts the streaming thread for generating the fake data pushing them to
the peer fakesink. The flow for changing the priority would go like
this:

  - When going from `READY` to `PAUSED` state, fakesrc will require a
    streaming thread for pushing data into the fakesink. It will post a
    `STREAM_STATUS` message indicating its requirement for a streaming
    thread.

  - The application will react to the `STREAM_STATUS` messages with a
    sync bus handler. It will then configure a custom `GstTaskPool` on
    the `GstTask` inside the message. The custom taskpool is responsible
    for creating the threads. In this example we will make a thread with
    a higher priority.

  - Alternatively, since the sync message is called in the thread
    context, you can use thread `ENTER`/`LEAVE` notifications to change the
    priority or scheduling policy of the current thread.

In a first step we need to implement a custom `GstTaskPool` that we can
--
the given function. More involved implementations might want to keep
some threads around in a pool because creating and destroying threads is
not always the fastest operation.

In a next step we need to actually configure the custom taskpool when
the fakesrc needs it. For this we intercept the `STREAM_STATUS` messages
with a sync handler.

``` c
static GMainLoop* loop;

static void
on_stream_status (GstBus     *bus,
                  GstMessage *message,
                  gpointer    user_data)
{
  GstStreamStatusType type;
  GstElement *owner;
  const GValue *val;
  GstTask *task = NULL;

--
}

int
main (int argc, char *argv[])
{
  GstElement *bin, *fakesrc, *fakesink;
  GstBus *bus;
  GstStateChangeReturn ret;

  gst_init (&argc, &argv);

  /* create a new bin to hold the elements */
  bin = gst_pipeline_new ("pipeline");
  g_assert (bin);

  /* create a source */
  fakesrc = gst_element_factory_make ("fakesrc", "fakesrc");
  g_assert (fakesrc);
  g_object_set (fakesrc, "num-buffers", 50, NULL);

  /* and a sink */
  fakesink = gst_element_factory_make ("fakesink", "fakesink");
  g_assert (fakesink);

  /* add objects to the main pipeline */
  gst_bin_add_many (GST_BIN (bin), fakesrc, fakesink, NULL);

  /* link the elements */
  gst_element_link (fakesrc, fakesink);

  loop = g_main_loop_new (NULL, FALSE);

  /* get the bus, we need to install a sync handler */
  bus = gst_pipeline_get_bus (GST_PIPELINE (bin));
  gst_bus_enable_sync_message_emission (bus);
  gst_bus_add_signal_watch (bus);

  g_signal_connect (bus, "sync-message::stream-status",
      (GCallback) on_stream_status, NULL);
  g_signal_connect (bus, "message::error",
      (GCallback) on_error, NULL);
  g_signal_connect (bus, "message::eos",
      (GCallback) on_eos, NULL);

  gst_init (&argc, &argv);

  /* create */
  pipeline = gst_pipeline_new ("my_pipeline");
  bin = gst_bin_new ("my_bin");
  source = gst_element_factory_make ("fakesrc", "source");
  sink = gst_element_factory_make ("fakesink", "sink");

  /* First add the elements to the bin */
  gst_bin_add_many (GST_BIN (bin), source, sink, NULL);
  /* add the bin to the pipeline */
  gst_bin_add (GST_BIN (pipeline), bin);

  /* link the elements */
  gst_element_link (source, sink);

[..]

}

```
### Diagnostic

Generate a null stream and ignore it (and print out details):

```
gst-launch-1.0 -v fakesrc num-buffers=16 ! fakesink silent=false
```

Generate a pure sine tone to test the audio output:

```
gst-launch-1.0 audiotestsrc ! audioconvert ! audioresample ! osssink
```

Generate a familiar test pattern to test the video output:

```
gst-launch-1.0 videotestsrc ! ximagesink
```

```

---

