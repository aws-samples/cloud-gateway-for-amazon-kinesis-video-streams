```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash
# Analyze DASH stream
gst-discoverer-1.0 "https://example.com/stream.mpd"

# Test DASH playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.mpd" ! dashdemux ! fakesink
```

## Debugging Commands

### General Pipeline Debugging
```bash
# Enable general debugging
GST_DEBUG=*:3 gst-launch-1.0 [pipeline]

# Debug caps negotiation
GST_DEBUG=caps:5 gst-launch-1.0 [pipeline]

# Debug performance
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 [pipeline]
```
```

#### Method 2: Direct pipeline analysis
```bash
# HLS stream analysis
gst-launch-1.0 -v souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink

# HTTP stream analysis
gst-launch-1.0 -v souphttpsrc location="http://example.com/stream" ! decodebin ! fakesink
```

## Introspection Workflow Examples

### Complete RTSP Analysis Workflow

```bash
#!/bin/bash
RTSP_URL="rtsp://camera-ip:554/stream"

echo "=== RTSP Stream Analysis ==="
echo "URL: $RTSP_URL"

# Step 1: Basic connectivity test
echo "1. Testing RTSP connectivity..."
This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.video_0 ! matroskamux ! filesink location=sintel_video.mkv
```

This fetches a media file from the internet using `souphttpsrc`, which
is in webm format (a special kind of Matroska container, see [](tutorials/basic/concepts.md)). We
then open the container using `matroskademux`. This media contains both
audio and video, so `matroskademux` will create two output Pads, named
`video_0` and `audio_0`. We link `video_0` to a `matroskamux` element
to re-pack the video stream into a new container, and finally link it to
a `filesink`, which will write the stream into a file named
"sintel\_video.mkv" (the `location` property specifies the name of the
file).

All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
--

Consider the following
pipeline:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! filesink location=test
```

This is the same media file and demuxer as in the previous example. The
input Pad Caps of `filesink` are `ANY`, meaning that it can accept any
kind of media. Which one of the two output pads of `matroskademux` will
be linked against the filesink? `video_0` or `audio_0`? You cannot
know.

You can remove this ambiguity, though, by using named pads, as in the
previous sub-section, or by using **Caps
Filters**:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! video/x-vp8 ! matroskamux ! filesink location=sintel_video.mkv
```

A Caps Filter behaves like a pass-through element which does nothing and
only accepts media with the given Caps, effectively resolving the
ambiguity. In this example, between `matroskademux` and `matroskamux` we
added a `video/x-vp8` Caps Filter to specify that we are interested in
the output pad of `matroskademux` which can produce this kind of video.

To find out the Caps an element accepts and produces, use the
`gst-inspect-1.0` tool. To find out the Caps contained in a particular file,
use the `gst-discoverer-1.0` tool. To find out the Caps an element is
producing for a particular pipeline, run `gst-launch-1.0` as usual, with the
`–v` option to print Caps information.

### Examples
--
A fully operation playback pipeline, with audio and video (more or less
the same pipeline that `playbin` will create
internally):

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d ! queue ! vp8dec ! videoconvert ! autovideosink d. ! queue ! vorbisdec ! audioconvert ! audioresample ! autoaudiosink
```

A transcoding pipeline, which opens the webm container and decodes both
streams (via uridecodebin), then re-encodes the audio and video branches
with different codecs (H.264 + AAC), and puts them back together into an
MP4 container (just for the sake of it). Because of the way the x264enc
encoder behaves by default (consuming multiple seconds of video input before
outputtingi anything), we have to increase the size of the queue in the audio
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```
Line 20 lists the plugins you want statically linked into
`libgstreamer_android.so`. Listing only the ones you need makes your
application smaller.

Line 21 is required to have HTTPS/TLS support from GStreamer, through the
`souphttpsrc` element.

Line 22 defines which GStreamer libraries your application requires.

Finally, line 24 includes the make files which perform the rest of the
magic.

Listing all desired plugins can be cumbersome, so they have been grouped
into categories, which can be used by including the `plugins.mk` file,
and used as follows:

    include $(GSTREAMER_NDK_BUILD_PATH)/plugins.mk
    GSTREAMER_PLUGINS  := $(GSTREAMER_PLUGINS_CORE) $(GSTREAMER_PLUGINS_CODECS) playbin souphttpsrc

#### List of categories and included plugins

| Category                       | Included plugins                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|--------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GSTREAMER_PLUGINS_CORE`       | coreelements adder app audioconvert audiorate audioresample audiotestsrc gio pango typefindfunctions videoconvert videorate videoscale videotestsrc volume autodetect videofilter |
| `GSTREAMER_PLUGINS_PLAYBACK`   | playback |
| `GSTREAMER_PLUGINS_VIS`        | libvisual goom goom2k1 audiovisualizers |
| `GSTREAMER_PLUGINS_EFFECTS`    | alpha alphacolor audiofx cairo cutter debug deinterlace dtmf effectv equalizer gdkpixbuf imagefreeze interleave level multifile replaygain shapewipe smpte spectrum videobox videocrop videomixer accurip aiff audiofxbad autoconvert bayer coloreffects debugutilsbad fieldanalysis freeverb frei0r gaudieffects geometrictransform inter interlace ivtc rawparse removesilence segmentclip smooth speed soundtouch videofiltersbad audiomixer compositor webrtcdsp |
| `GSTREAMER_PLUGINS_NET`        | tcp rtsp rtp rtpmanager soup udp dataurisrc sdp srtp rtspclientsink |
| `GSTREAMER_PLUGINS_NET_RESTRICTED` | rtmp |
| `GSTREAMER_PLUGINS_CODECS`     | subparse ogg theora vorbis opus alaw apetag audioparsers auparse avi dv flac flv flxdec icydemux id3demux isomp4 jpeg matroska mulaw multipart png speex taglib vpx wavenc wavpack wavparse y4m adpcmdec adpcmenc dashdemux dvbsuboverlay dvdspu hls id3tag kate midi mxf openh264 opusparse pcapparse pnm rfbsrc schro gstsiren smoothstreaming subenc videoparsersbad jpegformat gdp rsvg openjpeg spandsp sbc androidmedia |
| `GSTREAMER_PLUGINS_CODECS_GPL` | assrender |
| `GSTREAMER_PLUGINS_CODECS_RESTRICTED` | asfmux dtsdec faad mpegpsdemux mpegpsmux mpegtsdemux mpegtsmux voaacenc a52dec amrnb amrwbdec asf dvdsub dvdlpcmdec mad mpeg2dec xingmux realmedia x264 lame mpg123 libav |
| `GSTREAMER_PLUGINS_SYS`        | opensles opengl |
This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.video_0 ! matroskamux ! filesink location=sintel_video.mkv
```

This fetches a media file from the internet using `souphttpsrc`, which
is in webm format (a special kind of Matroska container, see [](tutorials/basic/concepts.md)). We
then open the container using `matroskademux`. This media contains both
audio and video, so `matroskademux` will create two output Pads, named
`video_0` and `audio_0`. We link `video_0` to a `matroskamux` element
to re-pack the video stream into a new container, and finally link it to
a `filesink`, which will write the stream into a file named
"sintel\_video.mkv" (the `location` property specifies the name of the
file).

All in all, we took a webm file, stripped it of audio, and generated a
new matroska file with the video. If we wanted to keep only the
audio:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d d.audio_0 ! vorbisparse ! matroskamux ! filesink location=sintel_audio.mka
```

The `vorbisparse` element is required to extract some information from
the stream and put it in the Pad Caps, so the next element,
`matroskamux`, knows how to deal with the stream. In the case of video
this was not necessary, because `matroskademux` already extracted this
information and added it to the Caps.

Note that in the above two examples no media has been decoded or played.
We have just moved from one container to another (demultiplexing and
re-multiplexing again).

### Caps filters

When an element has more than one output pad, it might happen that the
--

Consider the following
pipeline:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! filesink location=test
```

This is the same media file and demuxer as in the previous example. The
input Pad Caps of `filesink` are `ANY`, meaning that it can accept any
kind of media. Which one of the two output pads of `matroskademux` will
be linked against the filesink? `video_0` or `audio_0`? You cannot
know.

You can remove this ambiguity, though, by using named pads, as in the
previous sub-section, or by using **Caps
Filters**:

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux ! video/x-vp8 ! matroskamux ! filesink location=sintel_video.mkv
```

A Caps Filter behaves like a pass-through element which does nothing and
only accepts media with the given Caps, effectively resolving the
ambiguity. In this example, between `matroskademux` and `matroskamux` we
added a `video/x-vp8` Caps Filter to specify that we are interested in
the output pad of `matroskademux` which can produce this kind of video.

To find out the Caps an element accepts and produces, use the
`gst-inspect-1.0` tool. To find out the Caps contained in a particular file,
use the `gst-discoverer-1.0` tool. To find out the Caps an element is
producing for a particular pipeline, run `gst-launch-1.0` as usual, with the
`–v` option to print Caps information.

### Examples
--
A fully operation playback pipeline, with audio and video (more or less
the same pipeline that `playbin` will create
internally):

```
gst-launch-1.0 souphttpsrc location=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! matroskademux name=d ! queue ! vp8dec ! videoconvert ! autovideosink d. ! queue ! vorbisdec ! audioconvert ! audioresample ! autoaudiosink
```

A transcoding pipeline, which opens the webm container and decodes both
streams (via uridecodebin), then re-encodes the audio and video branches
with different codecs (H.264 + AAC), and puts them back together into an
MP4 container (just for the sake of it). Because of the way the x264enc
encoder behaves by default (consuming multiple seconds of video input before
outputtingi anything), we have to increase the size of the queue in the audio
branch to make sure the pipeline can preroll and start up. Another solution
would be to use `x264enc tune=zerolatency` but that results in lower quality
and is more suitable for live streaming scenarios.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm name=d ! queue ! videoconvert ! x264enc ! video/x-h264,profile=high ! mp4mux name=m ! filesink location=sintel.mp4 d. ! queue max-size-time=5000000000 max-size-bytes=0 max-size-buffers=0 ! audioconvert ! audioresample ! voaacenc ! m.
```

---

