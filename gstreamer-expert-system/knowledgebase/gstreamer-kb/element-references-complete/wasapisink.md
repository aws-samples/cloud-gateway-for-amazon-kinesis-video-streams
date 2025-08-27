
## Pipeline Examples

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
rescaling and filtering of the scaled image to alleviate aliasing. It
implements the VideoOverlay interface, so the video window can be
re-parented (embedded inside other windows). This element is not recommended
in most cases.

### `wasapisink` and `wasapi2sink`

Those elements are the default audio sink elements on Windows, based on
[WASAPI](https://docs.microsoft.com/en-us/windows/win32/coreaudio/wasapi),
which is available on Vista or more recent. Note that `wasapi2sink` is
a replacement of `wasapisink` and `wasapi2sink` is default for Windows 8 or
more recent. Otherwise `wasapisink` will be default audio sink element.

### `directsoundsink (deprecated)`

This audio sink element is based on
[DirectSound](http://en.wikipedia.org/wiki/DirectSound), which is available in
all Windows versions.

### `dshowdecwrapper`

[Direct Show](http://en.wikipedia.org/wiki/Direct_Show) is a multimedia
framework similar to GStreamer. They are different enough, though, so
that their pipelines cannot be interconnected. However, through this
element, GStreamer can benefit from the decoding elements present in
Direct Show. `dshowdecwrapper` wraps multiple Direct Show decoders so
they can be embedded in a GStreamer pipeline. Use the `gst-inspect-1.0` tool
rescaling and filtering of the scaled image to alleviate aliasing. It
implements the VideoOverlay interface, so the video window can be
re-parented (embedded inside other windows). This element is not recommended
in most cases.

### `wasapisink` and `wasapi2sink`

Those elements are the default audio sink elements on Windows, based on
[WASAPI](https://docs.microsoft.com/en-us/windows/win32/coreaudio/wasapi),
which is available on Vista or more recent. Note that `wasapi2sink` is
a replacement of `wasapisink` and `wasapi2sink` is default for Windows 8 or
more recent. Otherwise `wasapisink` will be default audio sink element.

### `directsoundsink (deprecated)`

This audio sink element is based on
[DirectSound](http://en.wikipedia.org/wiki/DirectSound), which is available in
all Windows versions.

### `dshowdecwrapper`

[Direct Show](http://en.wikipedia.org/wiki/Direct_Show) is a multimedia
framework similar to GStreamer. They are different enough, though, so
that their pipelines cannot be interconnected. However, through this
element, GStreamer can benefit from the decoding elements present in
Direct Show. `dshowdecwrapper` wraps multiple Direct Show decoders so
they can be embedded in a GStreamer pipeline. Use the `gst-inspect-1.0` tool

## Pipeline Examples

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

---

