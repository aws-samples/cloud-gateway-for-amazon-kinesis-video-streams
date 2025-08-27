Use `gst-launch-1.0 --gst-debug-help` to obtain the list of all
registered categories. Bear in mind that each plugin registers its own
categories, so, when installing or removing plugins, this list can
change.

Use `GST_DEBUG` when the error information posted on the GStreamer bus
does not help you nail down a problem. It is common practice to redirect
the output log to a file, and then examine it later, searching for
specific messages.
folder where you want the files to be placed. `gst-launch-1.0` will create
a `.dot` file at each state change, so you can see the evolution of the
caps negotiation. Unset the variable to disable this facility. From
within your application, you can use the
`GST_DEBUG_BIN_TO_DOT_FILE()` and
`GST_DEBUG_BIN_TO_DOT_FILE_WITH_TS()` macros to generate `.dot` files
at your convenience.

Here you have an example of the kind of pipelines that playbin
generates. It is very complex because `playbin` can handle many
different cases: Your manual pipelines normally do not need to be this
long. If your manual pipeline is starting to get very big, consider
using `playbin`.

![](images/playbin.png)

To download the full-size picture, use the attachments link at the top
of this page (It's the paperclip icon).

## Conclusion

This tutorial has shown:

  - How to get more debug information from GStreamer using the
    `GST_DEBUG` environment variable.
  - How to print your own debug information into the GStreamer log with
    the `GST_ERROR()` macro and relatives.
  - How to get pipeline graphs with the
    `GST_DEBUG_DUMP_DOT_DIR` environment variable.

It has been a pleasure having you here, and see you soon!
