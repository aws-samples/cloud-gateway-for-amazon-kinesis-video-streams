
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
--

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

--
## Conclusion

This tutorial has shown:

  - How to output the video to a particular GTK Widget
    using the `gtksink` Element.

  - How to refresh the GUI periodically by registering a timeout
    callback with `g_timeout_add_seconds ()`.

  - How to convey information to the main thread by means of application
    messages through the bus with `gst_element_post_message()`.

  - How to be notified only of interesting messages by making the bus
    emit signals with `gst_bus_add_signal_watch()` and discriminating
    among all message types using the signal details.

This allows you to build a somewhat complete media player with a proper
Graphical User Interface.

The following basic tutorials keep focusing on other individual

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
--

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

--
## Conclusion

This tutorial has shown:

  - How to output the video to a particular GTK Widget
    using the `gtksink` Element.

  - How to refresh the GUI periodically by registering a timeout
    callback with `g_timeout_add_seconds ()`.

  - How to convey information to the main thread by means of application
    messages through the bus with `gst_element_post_message()`.

  - How to be notified only of interesting messages by making the bus
    emit signals with `gst_bus_add_signal_watch()` and discriminating
    among all message types using the signal details.

This allows you to build a somewhat complete media player with a proper
Graphical User Interface.

The following basic tutorials keep focusing on other individual

---

