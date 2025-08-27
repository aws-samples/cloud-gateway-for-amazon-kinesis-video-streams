reasonable cutoff for using `orc_memcpy()` instead of `memcpy()` is if the
number of bytes is generally greater than 100. **DO NOT** use `orc_memcpy()`
if the typical is size is less than 20 bytes, especially if the size is
known at compile time, as these cases are inlined by the compiler.

(Example: sys/ximage/ximagesink.c)

Add $(ORC\_CFLAGS) to libgstximagesink\_la\_CFLAGS and $(ORC\_LIBS) to
libgstximagesink\_la\_LIBADD. Then, in the source file, add:

\#ifdef HAVE\_ORC \#include <orc/orc.h> \#else \#define
orc\_memcpy(a,b,c) memcpy(a,b,c) \#endif

Then switch relevant uses of `memcpy()` to `orc_memcpy()`.

The above example works whether or not Orc is enabled at compile time.

## Normal Usage

The following lines are added near the top of Makefile.am for plugins
that use Orc code in .orc files (this is for the volume plugin):

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
media-processing, including (but not limited to)
[Rhythmbox](http://www.rhythmbox.org/),
[Videos](https://wiki.gnome.org/Apps/Videos) and [Sound
Juicer](https://wiki.gnome.org/Apps/SoundJuicer).

Most of these GNOME applications make use of some specific techniques to
integrate as closely as possible with the GNOME desktop:
The examples below assume that you have the correct plug-ins available.
In general, "pulsesink" can be substituted with another audio output
plug-in such as "alsasink", "osxaudiosink", or "wasapisink"

Likewise, `xvimagesink` can be substituted with `d3dvideosink`,
`ximagesink`, `sdlvideosink`, `osxvideosink`, or `aasink`.

Keep in mind though that different sinks might accept different formats and
even the same sink might accept different formats on different machines, so
you might need to add converter elements like `audioconvert` and `audioresample`
for audio or `videoconvertscale` in front of the sink to make things work.

### Audio playback

**Note:** For audio/video playback it's best to use the `playbin3` or
`uridecodebin3` elements, these are just example pipelines.

Play the mp3 music file "music.mp3" using a libmpg123-based plug-in and
output it to an audio device via PulseAudio (or PipeWire).

```
--
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
elements to get a working pipeline.

Play any supported audio format:

```
gst-launch-1.0 filesrc location=musicfile ! decodebin3 ! audioconvert ! audioresample ! pulsesink
`glupload ! glcolorconvert ! glimagesinkelement` to insert further OpenGL
hardware accelerated processing into the pipeline.

## Linux

### `ximagesink`

A standard RGB only X-based video sink. It implements the VideoOverlay
interface, so the video window can be re-parented (embedded inside
other windows). It does not support scaling or color formats other
than RGB; it has to be performed by different means (using the
`videoscale` element, for example).

### `xvimagesink`

An X-based video sink, using the [X Video
Extension](http://en.wikipedia.org/wiki/X_video_extension) (Xv). It
implements the VideoOverlay interface, so the video window can be
re-parented (embedded inside other windows). It can perform scaling
efficiently, on the GPU. It is only available if the hardware and
corresponding drivers support the Xv extension.
reasonable cutoff for using `orc_memcpy()` instead of `memcpy()` is if the
number of bytes is generally greater than 100. **DO NOT** use `orc_memcpy()`
if the typical is size is less than 20 bytes, especially if the size is
known at compile time, as these cases are inlined by the compiler.

(Example: sys/ximage/ximagesink.c)

Add $(ORC\_CFLAGS) to libgstximagesink\_la\_CFLAGS and $(ORC\_LIBS) to
libgstximagesink\_la\_LIBADD. Then, in the source file, add:

\#ifdef HAVE\_ORC \#include <orc/orc.h> \#else \#define
orc\_memcpy(a,b,c) memcpy(a,b,c) \#endif

Then switch relevant uses of `memcpy()` to `orc_memcpy()`.

The above example works whether or not Orc is enabled at compile time.

## Normal Usage

The following lines are added near the top of Makefile.am for plugins
that use Orc code in .orc files (this is for the volume plugin):

---

