this will cause further allocations to fail and currently allocated buffers to
be freed. videotestsrc will then free the pool and stop streaming.

### `videotestsrc ! queue ! myvideosink`

* In this second use case we have a videosink that can at most allocate 3 video
buffers.

* Again videotestsrc will have to negotiate a bufferpool with the peer element.
For this it will perform the `ALLOCATION` query which queue will proxy to its
downstream peer element.

* The bufferpool returned from myvideosink will have a `max_buffers` set to 3.
queue and videotestsrc can operate with this upper limit because none of those
elements require more than that amount of buffers for temporary storage.

* Myvideosink's bufferpool will then be configured with the size of the buffers
for the negotiated format and according to the padding and alignment rules.
When videotestsrc sets the pool to active, the 3 video buffers will be
preallocated in the pool.

``` yaml
# This is the default tool so it is not mandatory for the `gst-validate` tool
tool = "gst-validate-$(gst_api_version)",
args = {
    # pipeline description
    videotestrc num-buffers=2 ! $(videosink),
    # Random extra argument
    --set-media-info $(test-dir)/some.media_info
}
```

## Variables

Validate testfile will define some variables to make those files relocable:

* `$(test_dir)`: The directory where the `.validatetest` file is in.

* `$(test_name)`: The name of the test file (without extension).

* `$(test_name_dir)`: The name of the test directory (test_name with folder
                      separator instead of `.`).
--
* `$(validateflow)`: The validateflow structure name with the default/right
                     values for the `expectations-dir` and `actual-results-dir`
                     fields. See [validateflow](gst-validate-flow.md) for more
                     information.

* `$(videosink)`: The GStreamer videosink to use if the test can work with
                  different sinks for the video. It allows the tool to use
                  fakesinks when the user doesn't want to have visual feedback
                  for example.

* `$(audiosink)`: The GStreamer audiosink to use if the test can work with
                  different sinks for the audio. It allows the tool to use
                  fakesinks when the user doesn't want to have audio feedback
                  for example.
**ges-launch-1.0**  [-l <path>|--load=<path>] [-s <path>|--save=<path>]
  [-p <path>|--sample-path=<path>] [-r <path>|--sample-path-recurse=<path>]
  [-o <uri>|--outputuri=<uri>] [-f <profile>|--format=<profile>]
  [-e <profile-name>|--encoding-profile=<profile-name>]
  [-t <track-types>|--track-types=<track-types>]
  [-v <videosink>|--videosink=<videosink>]
  [-a <audiosink>---audiosink=<audiosink>]
  [-m|--mute] [--inspect-action-type[=<action-type>]]
  [--list-transitions] [--disable-mixing]
  [-r <times>|--repeat=<times>] [--set-scenario=<scenario-name]

## Define a timeline through the command line

The `ges-launch-1.0` tool allows you to simply build a timeline through a dedicated set of commands:

### +clip

Adds a clip to the timeline.

See documentation for the --track-types option to ges-launch-1.0, as it
will affect the result of this command.
--
Specify the track types to be created. When loading a project, only relevant
tracks will be added to the timeline.

### Playback options

__-v --videosink=<videosink>:__

Set the videosink used for playback.

__-a --audiosink=<audiosink>:__

Set the audiosink used for playback.


__-m --mute:__

Mute playback output. This has no effect when rendering.


### Helpful options

__--inspect-action-type=<action-type>:__


int main(int argc, char *argv[]) {
  CustomData data;
  GstStateChangeReturn ret;
  GstBus *bus;
  GstElement *gtkglsink, *videosink;

  /* Initialize GTK */
  gtk_init (&argc, &argv);

  /* Initialize GStreamer */
  gst_init (&argc, &argv);

  /* Initialize our data structure */
  memset (&data, 0, sizeof (data));
  data.duration = GST_CLOCK_TIME_NONE;

  /* Create the elements */
  data.playbin = gst_element_factory_make ("playbin", "playbin");
  videosink = gst_element_factory_make ("glsinkbin", "glsinkbin");
  gtkglsink = gst_element_factory_make ("gtkglsink", "gtkglsink");

  /* Here we create the GTK Sink element which will provide us with a GTK widget where
   * GStreamer will render the video at and we can add to our UI.
   * Try to create the OpenGL version of the video sink, and fallback if that fails */
  if (gtkglsink != NULL && videosink != NULL) {
    g_printerr ("Successfully created GTK GL Sink");

    g_object_set (videosink, "sink", gtkglsink, NULL);

    /* The gtkglsink creates the gtk widget for us. This is accessible through a property.
     * So we get it and use it later to add it to our gui. */
    g_object_get (gtkglsink, "widget", &data.sink_widget, NULL);
  } else {
    g_printerr ("Could not create gtkglsink, falling back to gtksink.\n");

    videosink = gst_element_factory_make ("gtksink", "gtksink");
    g_object_get (videosink, "widget", &data.sink_widget, NULL);
  }

  if (!data.playbin || !videosink) {
    g_printerr ("Not all elements could be created.\n");
    return -1;
  }

  /* Set the URI to play */
  g_object_set (data.playbin, "uri", "https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm", NULL);

  /* Set the video-sink  */
  g_object_set (data.playbin, "video-sink", videosink, NULL);

  /* Connect to interesting signals in playbin */
  g_signal_connect (G_OBJECT (data.playbin), "video-tags-changed", (GCallback) tags_cb, &data);
  g_signal_connect (G_OBJECT (data.playbin), "audio-tags-changed", (GCallback) tags_cb, &data);
  g_signal_connect (G_OBJECT (data.playbin), "text-tags-changed", (GCallback) tags_cb, &data);

  /* Create the GUI */
  create_ui (&data);

  /* Instruct the bus to emit signals for each received message, and connect to the interesting signals */
  bus = gst_element_get_bus (data.playbin);
  gst_bus_add_signal_watch (bus);
  g_signal_connect (G_OBJECT (bus), "message::error", (GCallback)error_cb, &data);
  g_signal_connect (G_OBJECT (bus), "message::eos", (GCallback)eos_cb, &data);
  g_signal_connect (G_OBJECT (bus), "message::state-changed", (GCallback)state_changed_cb, &data);
--
  /* Start playing */
  ret = gst_element_set_state (data.playbin, GST_STATE_PLAYING);
  if (ret == GST_STATE_CHANGE_FAILURE) {
    g_printerr ("Unable to set the pipeline to the playing state.\n");
    gst_object_unref (data.playbin);
    gst_object_unref (videosink);
    return -1;
  }

  /* Register a function that GLib will call every second */
  g_timeout_add_seconds (1, (GSourceFunc)refresh_ui, &data);

  /* Start the GTK main loop. We will not regain control until gtk_main_quit is called. */
  gtk_main ();

  /* Free resources */
  gst_element_set_state (data.playbin, GST_STATE_NULL);
  gst_object_unref (data.playbin);
  gst_object_unref (videosink);

  return 0;
}

```

> ![Information](images/icons/emoticons/information.svg)
> Need help?
>
> If you need help to compile this code, refer to the **Building the tutorials**  section for your platform: [Linux](installing/on-linux.md#InstallingonLinux-Build), [Mac OS X](installing/on-mac-osx.md#InstallingonMacOSX-Build) or [Windows](installing/on-windows.md#InstallingonWindows-Build), or use this specific command on Linux:
>
> ``gcc basic-tutorial-5.c -o basic-tutorial-5 `pkg-config --cflags --libs  gtk+-3.0 gstreamer-1.0` ``
>
>If you need help to run this code, refer to the **Running the tutorials** section for your platform: [Linux](installing/on-linux.md#InstallingonLinux-Run), [Mac OS X](installing/on-mac-osx.md#InstallingonMacOSX-Run) or [Windows](installing/on-windows.md#InstallingonWindows-Run).
>
--
``` c
int main(int argc, char *argv[]) {
  CustomData data;
  GstStateChangeReturn ret;
  GstBus *bus;
  GstElement *gtkglsink, *videosink;

  /* Initialize GTK */
  gtk_init (&argc, &argv);

  /* Initialize GStreamer */
  gst_init (&argc, &argv);

  /* Initialize our data structure */
  memset (&data, 0, sizeof (data));
  data.duration = GST_CLOCK_TIME_NONE;

  /* Create the elements */
  data.playbin = gst_element_factory_make ("playbin", "playbin");
  videosink = gst_element_factory_make ("glsinkbin", "glsinkbin");
  gtkglsink = gst_element_factory_make ("gtkglsink", "gtkglsink");

  /* Here we create the GTK Sink element which will provide us with a GTK widget where
   * GStreamer will render the video at and we can add to our UI.
   * Try to create the OpenGL version of the video sink, and fallback if that fails */
  if ((gtkglsink) && (videosink)) {
    g_printerr ("Successfully created GTK GL Sink");

    g_object_set (videosink, "sink", gtkglsink, NULL);

    /* The gtkglsink creates the gtk widget for us. This is accessible through a property.
     * So we get it and use it later to add it to our gui. */
    g_object_get (gtkglsink, "widget", &data.sink_widget, NULL);
  } else {
    g_printerr ("Could not create gtkglsink, falling back to gtksink.\n");

    videosink = gst_element_factory_make ("gtksink", "gtksink");
    g_object_get (videosink, "widget", &data.sink_widget, NULL);
  }

  if ((!data.playbin) || (!videosink)) {
    g_printerr ("Not all elements could be created.\n");
    return -1;
  }

  /* Set the URI to play */
  g_object_set (data.playbin, "uri", "https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm", NULL);

  /* Set the video-sink  */
  g_object_set (data.playbin, "video-sink", videosink, NULL);
```

Standard GStreamer initialization and playbin pipeline creation, along
with GTK initialization. We also create our video sink element which will render
into a GTK Widget. We will use this widget in our UI later on."

``` c
  /* Connect to interesting signals in playbin */
  g_signal_connect (G_OBJECT (data.playbin), "video-tags-changed", (GCallback) tags_cb, &data);
  g_signal_connect (G_OBJECT (data.playbin), "audio-tags-changed", (GCallback) tags_cb, &data);
  g_signal_connect (G_OBJECT (data.playbin), "text-tags-changed", (GCallback) tags_cb, &data);
```

We are interested in being notified when new tags (metadata) appears on
the stream. For simplicity, we are going to handle all kinds of tags
this will cause further allocations to fail and currently allocated buffers to
be freed. videotestsrc will then free the pool and stop streaming.

### `videotestsrc ! queue ! myvideosink`

* In this second use case we have a videosink that can at most allocate 3 video
buffers.

* Again videotestsrc will have to negotiate a bufferpool with the peer element.
For this it will perform the `ALLOCATION` query which queue will proxy to its
downstream peer element.

* The bufferpool returned from myvideosink will have a `max_buffers` set to 3.
queue and videotestsrc can operate with this upper limit because none of those
elements require more than that amount of buffers for temporary storage.

* Myvideosink's bufferpool will then be configured with the size of the buffers
for the negotiated format and according to the padding and alignment rules.
When videotestsrc sets the pool to active, the 3 video buffers will be
preallocated in the pool.


---

