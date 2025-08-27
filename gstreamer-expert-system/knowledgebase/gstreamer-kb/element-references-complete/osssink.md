integrating with Linux or a UNIX-like operating system.

  - For audio input and output, GStreamer provides input and output
    elements for several audio subsystems. Amongst others, GStreamer
    includes elements for ALSA (alsasrc, alsasink), OSS (osssrc,
    osssink) Pulesaudio (pulsesrc, pulsesink) and Sun audio
    (sunaudiosrc, sunaudiomixer, sunaudiosink).

  - For video input, GStreamer contains source elements for Video4linux2
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for
syntax.

A simple commandline looks like:

```
gst-launch filesrc location=hello.mp3 ! mad ! audioresample ! osssink

```

A more complex pipeline looks like:

```
gst-launch filesrc location=redpill.vob ! dvddemux name=demux \
 demux.audio_00 ! queue ! a52dec ! audioconvert ! audioresample ! osssink \
 demux.video_00 ! queue ! mpeg2dec ! videoconvert ! xvimagesink

```

You can also use the parser in you own code. GStreamer provides a
function gst\_parse\_launch () that you can use to construct a pipeline.
The following program lets you create an MP3 pipeline using the
gst\_parse\_launch () function:

``` c
#include <gst/gst.h>

int
main (int argc, char *argv[])
{
--
  if (argc != 2) {
    g_print ("usage: %s <filename>\n", argv[0]);
    return -1;
  }

  pipeline = gst_parse_launch ("filesrc name=my_filesrc ! mad ! osssink", &error);
  if (!pipeline) {
    g_print ("Parse error: %s\n", error->message);
    exit (1);
  }

  filesrc = gst_bin_get_by_name (GST_BIN (pipeline), "my_filesrc");
  g_object_set (filesrc, "location", argv[1], NULL);
  g_object_unref (filesrc);

  gst_element_set_state (pipeline, GST_STATE_PLAYING);

  bus = gst_element_get_bus (pipeline);

  /* wait until we either get an EOS or an ERROR message. Note that in a real
   * program you would probably not use gst_bus_poll(), but rather set up an
--
```
gst-inspect mad

```

Below is the output of a query for the osssink element:

```

Factory Details:
  Rank:         secondary (128)
  Long-name:            Audio Sink (OSS)
  Klass:                Sink/Audio
  Description:          Output to a sound card via OSS
  Author:               Erik Walthinsen <omega@cse.ogi.edu>, Wim Taymans <wim.taymans@chello.be>

Plugin Details:
  Name:                 ossaudio
  Description:          OSS (Open Sound System) support for GStreamer
  Filename:             /home/wim/gst/head/gst-plugins-good/sys/oss/.libs/libgstossaudio.so
  Version:              1.0.0.1
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
gst-launch-1.0 videotestsrc ! xvimagesink
```

### Automatic linking

You can use the "decodebin3" element to automatically select the right

  - `pulsesink` for Pulseaudio output

  - `alsasink` for ALSA output

  - `osssink` and `oss4sink` for OSS/OSSv4 output

  - `jackaudiosink` for JACK output

  - `autoaudiosink` for automatic audio output selection

First of all, run gst-inspect-1.0 on the output plug-in you want to use
to make sure you have it installed. For example, if you use Pulseaudio,
run

```
$ gst-inspect-1.0 pulsesink
```
and see if that prints out a bunch of properties for the plug-in.

Then try to play the sine tone by
integrating with Linux or a UNIX-like operating system.

  - For audio input and output, GStreamer provides input and output
    elements for several audio subsystems. Amongst others, GStreamer
    includes elements for ALSA (alsasrc, alsasink), OSS (osssrc,
    osssink) Pulesaudio (pulsesrc, pulsesink) and Sun audio
    (sunaudiosrc, sunaudiomixer, sunaudiosink).

  - For video input, GStreamer contains source elements for Video4linux2
    (v4l2src, v4l2element, v4l2sink).

  - For video output, GStreamer provides elements for output to
    X-windows (ximagesink), Xv-windows (xvimagesink; for
    hardware-accelerated video), direct-framebuffer (dfbimagesink) and
    openGL image contexts (glsink).

## GNOME desktop

GStreamer has been the media backend of the
[GNOME](http://www.gnome.org/) desktop since GNOME-2.2 onwards.
Nowadays, a whole bunch of GNOME applications make use of GStreamer for

---

