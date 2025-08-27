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

Play an AVI movie with an external text subtitle stream using playbin:
and the element will then use this window handle to draw on
rather than creating a new toplevel window. This is useful to embed
video in video players.

This interface is implemented by, amongst others, the `Video4linux2`
elements and by `glimagesink`, `ximagesink`, `xvimagesink` and `sdlvideosink`.

## Other interfaces

There are quite a few other interfaces provided by GStreamer and implemented by
some of its elements. Among them:

* `GstChildProxy` For access to internal element's properties on multi-child elements
* `GstNavigation` For the sending and parsing of navigation events
* `GstPreset` For handling element presets
* `GstRTSPExtension` An RTSP Extension interface
* `GstStreamVolume` Interface to provide access and control stream volume levels
* `GstTagSetter` For handling media metadata
* `GstTagXmpWriter` For elements that provide XMP serialization
* `GstTocSetter` For setting and retrieval of TOC-like data
* `GstTuner` For elements providing RF tunning operations
and the element will then use this window handle to draw on
rather than creating a new toplevel window. This is useful to embed
video in video players.

This interface is implemented by, amongst others, the `Video4linux2`
elements and by `glimagesink`, `ximagesink`, `xvimagesink` and `sdlvideosink`.

## Other interfaces

There are quite a few other interfaces provided by GStreamer and implemented by
some of its elements. Among them:

* `GstChildProxy` For access to internal element's properties on multi-child elements
* `GstNavigation` For the sending and parsing of navigation events
* `GstPreset` For handling element presets
* `GstRTSPExtension` An RTSP Extension interface
* `GstStreamVolume` Interface to provide access and control stream volume levels
* `GstTagSetter` For handling media metadata
* `GstTagXmpWriter` For elements that provide XMP serialization
* `GstTocSetter` For setting and retrieval of TOC-like data
* `GstTuner` For elements providing RF tunning operations
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

Play an AVI movie with an external text subtitle stream using playbin:

---

