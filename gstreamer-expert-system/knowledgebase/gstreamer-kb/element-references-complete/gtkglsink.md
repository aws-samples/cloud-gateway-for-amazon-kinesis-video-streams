
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

---

