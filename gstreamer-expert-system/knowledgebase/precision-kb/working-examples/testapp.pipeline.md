a setting as possible. Usually, `gst-launch-1.0` is a good first step at
testing a plugin. If you have not installed your plugin in a directory
that GStreamer searches, then you will need to set the plugin path.
Either set GST\_PLUGIN\_PATH to the directory containing your plugin, or
use the command-line option --gst-plugin-path. If you based your plugin
off of the gst-plugin template, then this will look something like `
gst-launch-1.0 --gst-plugin-path=$HOME/gst-template/gst-plugin/src/.libs
TESTPIPELINE
` However, you will often need more testing features than gst-launch-1.0
can provide, such as seeking, events, interactivity and more. Writing
your own small testing program is the easiest way to accomplish this.
This section explains - in a few words - how to do that. For a complete
application development guide, see the [Application Development
Manual](application-development/index.md).

At the start, you need to initialize the GStreamer core library by
calling `gst_init ()`. You can alternatively call
`gst_init_get_option_group ()`, which will return a pointer to
GOptionGroup. You can then use GOption to handle the initialization, and
this will finish the GStreamer initialization.
