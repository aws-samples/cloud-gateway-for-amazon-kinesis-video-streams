
#### Linux Elements (Use on Linux)
```bash
# Video
v4l2src         # Camera source
xvimagesink     # Video display
vaapih264enc    # Intel hardware encoding
nvh264enc       # NVIDIA hardware encoding

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
--
# For camera capture:
# macOS:
gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink

# Linux:
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink

# Cross-platform:
gst-launch-1.0 autovideosrc ! videoconvert ! autovideosink
```

### 3. Include Element Property Verification
```bash
# Don't assume properties exist - recommend checking:
gst-inspect-1.0 x264enc | grep bitrate
gst-inspect-1.0 kvssink | grep stream-name
```

### 4. Recommend Testing with Minimal Pipelines First
```bash
# Start simple, then build complexity:
--
## Common Accuracy Issues and Solutions

### Issue 1: Wrong Element Names
```bash
# ❌ WRONG - Assuming Linux elements work on macOS
gst-launch-1.0 v4l2src ! xvimagesink

# ✅ CORRECT - Platform-specific recommendation
# On macOS:
gst-launch-1.0 avfvideosrc ! osxvideosink
# On Linux:
gst-launch-1.0 v4l2src ! xvimagesink
# Cross-platform:
gst-launch-1.0 autovideosrc ! autovideosink
```

### Issue 2: Incorrect Property Names
```bash
# ❌ WRONG - Assuming properties without verification
gst-launch-1.0 x264enc quality=high ! kvssink

# ✅ CORRECT - Verify properties first
# Check available properties:
gst-inspect-1.0 x264enc | grep -E "(bitrate|quality|preset)"
# Then use correct property names:
gst-launch-1.0 x264enc bitrate=4000 speed-preset=ultrafast ! kvssink
```
In the inactive state, all the buffers that are returned to the pool will
automatically be freed by the pool and new allocations will fail.

## Use cases

### `videotestsrc ! xvimagesink`

* Before videotestsrc can output a buffer, it needs to negotiate caps and
a bufferpool with the downstream peer pad.

* First it will negotiate a suitable format with downstream according to the
normal rules. It will send a `CAPS` event downstream with the negotiated
configuration.

* Then it does an `ALLOCATION` query. It will use the returned bufferpool or
configures its own bufferpool with the returned parameters. The bufferpool is
initially in the inactive state.

* The `ALLOCATION` query lists the desired configuration of the downstream
xvimagesink, which can have specific alignment and/or min/max amount of
buffers.

* videotestsrc updates the configuration of the bufferpool, it will likely set
the min buffers to 1 and the size of the desired buffers. It then updates the
bufferpool configuration with the new properties.

* When the configuration is successfully updated, videotestsrc sets the
bufferpool to the active state. This preallocates the buffers in the pool (if
needed). This operation can fail when there is not enough memory available.
Since the bufferpool is provided by xvimagesink, it will allocate buffers
backed by an XvImage and pointing to shared memory with the X server.

* If the bufferpool is successfully activated, videotestsrc can acquire
a buffer from the pool, fill in the data and push it out to xvimagesink.

* xvimagesink can know that the buffer originated from its pool by following
the pool member.

* when shutting down, videotestsrc will set the pool to the inactive state,
this will cause further allocations to fail and currently allocated buffers to
be freed. videotestsrc will then free the pool and stop streaming.

### `videotestsrc ! queue ! myvideosink`

* In this second use case we have a videosink that can at most allocate 3 video
buffers.

* Again videotestsrc will have to negotiate a bufferpool with the peer element.
For this it will perform the `ALLOCATION` query which queue will proxy to its
downstream peer element.

as required or as queue elements are inserted in the pipeline) and bins
(using brackets, so “(” and “)”). You can use dots to imply padnames on
elements, or even omit the padname to automatically select a pad. Using
all this, the pipeline `gst-launch filesrc location=file.ogg ! oggdemux
name=d
d. ! queue ! theoradec ! videoconvert ! xvimagesink
d. ! queue ! vorbisdec ! audioconvert ! audioresample ! alsasink
` will play an Ogg file containing a Theora video-stream and a Vorbis
audio-stream. You can also use autopluggers such as decodebin on the
commandline. See the manual page of `gst-launch` for more information.

### `gst-inspect`

`gst-inspect` can be used to inspect all properties, signals, dynamic
parameters and the object hierarchy of an element. This can be very
useful to see which `GObject` properties or which signals (and using
what arguments) an element supports. Run `gst-inspect fakesrc` to get an
idea of what it does. See the manual page of `gst-inspect` for more
information.

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
  GstElement *pipeline;

---

