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

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
window:

```
gst-launch-1.0 filesrc location=flflfj.vob ! dvddemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink
```

Play both video and audio portions of an MPEG movie:

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \
demuxer. ! queue ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an AVI movie with an external text subtitle stream:

This example shows how to refer to specific pads by name if an
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```
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

Display the video portion of a .vob file (used on DVDs), outputting to an SDL
window:

```
gst-launch-1.0 filesrc location=flflfj.vob ! dvddemux ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink
```

Play both video and audio portions of an MPEG movie:

```
gst-launch-1.0 filesrc location=movie.mpg ! dvddemux name=demuxer  \
\
demuxer. ! queue ! mpegvideoparse ! mpeg2dec ! videoconvert ! sdlvideosink \
demuxer. ! queue ! mpegaudioparse ! mpg123audiodec ! audioconvert ! audioresample ! pulsesink
```

Play an AVI movie with an external text subtitle stream:

This example shows how to refer to specific pads by name if an
element (here: textoverlay) has multiple sink or source pads:

```
gst-launch-1.0 textoverlay name=overlay ! videoconvert ! videoscale ! autovideosink \
filesrc location=movie.avi ! decodebin3 !  videoconvert ! overlay.video_sink \
filesrc location=movie.srt ! subparse ! overlay.text_sink
```

---

