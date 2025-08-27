
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

and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

### `d3dvideosink`

This video sink is based on
[Direct3D9](https://en.wikipedia.org/wiki/Direct3D#Direct3D_9).
It supports rescaling and filtering of the scaled image to alleviate aliasing.
It implements the VideoOverlay interface, so the video window can be re-parented (embedded inside other windows).
This element is not recommended for applications targetting Windows 8 or more recent.


### `dshowvideosink (deprecated)`

This video sink is based on [Direct
Show](http://en.wikipedia.org/wiki/Direct_Show).  It can use different
rendering back-ends, like
[EVR](http://en.wikipedia.org/wiki/Enhanced_Video_Renderer),
[VMR9](http://en.wikipedia.org/wiki/Direct_Show#Video_rendering_filters)
$ gst-launch-1.0 videotestsrc ! videoconvert ! autovideosink
```

If `autovideosink` doesn't work, try an element that's specific for your
operating system and windowing system, such as `ximagesink` or `glimagesink`
or (on windows) `d3dvideosink`.

## Can my system play sound through GStreamer?

You can test this by trying to play a sine tone. For this, you
need to link the audiotestsrc element to an output element that matches
your hardware. A (non-complete) list of output plug-ins for audio is

  - `pulsesink` for Pulseaudio output

  - `alsasink` for ALSA output

  - `osssink` and `oss4sink` for OSS/OSSv4 output

  - `jackaudiosink` for JACK output

and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

### `d3dvideosink`

This video sink is based on
[Direct3D9](https://en.wikipedia.org/wiki/Direct3D#Direct3D_9).
It supports rescaling and filtering of the scaled image to alleviate aliasing.
It implements the VideoOverlay interface, so the video window can be re-parented (embedded inside other windows).
This element is not recommended for applications targetting Windows 8 or more recent.


### `dshowvideosink (deprecated)`

This video sink is based on [Direct
Show](http://en.wikipedia.org/wiki/Direct_Show).  It can use different
rendering back-ends, like
[EVR](http://en.wikipedia.org/wiki/Enhanced_Video_Renderer),
[VMR9](http://en.wikipedia.org/wiki/Direct_Show#Video_rendering_filters)

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


---

