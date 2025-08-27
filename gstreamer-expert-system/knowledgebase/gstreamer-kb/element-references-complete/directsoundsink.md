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
(see [](tutorials/basic/gstreamer-tools.md)) to see the
available decoders.
involves going to the audio control panel and activating a checkbox
reading “Digital Audio Output” or similar.

The main GStreamer audio sinks for each platform, Pulse Audio
(`pulsesink`) for Linux, `osxaudiosink` for OS X and Direct Sound
(`directsoundsink`) for Windows, detect when digital audio output is
available and change their input caps accordingly to accept encoded
data. For example, these elements typically accept `audio/x-raw` data:
when digital audio output is enabled in the system, they may also
accept `audio/mpeg`, `audio/x-ac3`, `audio/x-eac3` or `audio/x-dts`.

Then, when `playbin` builds the decoding pipeline, it realizes that the
audio sink can be directly connected to the encoded data (typically
coming out of a demuxer), so there is no need for a decoder. This
process is automatic and does not need any action from the application.

On Linux, there exist other audio sinks, like Alsa (`alsasink`) which
work differently (a “digital device” needs to be manually selected
through the `device` property of the sink). Pulse Audio, though, is the
commonly preferred audio sink on Linux.

--
no mechanism to query an external audio decoder which formats are
supported, and, in fact, the cable can even be disconnected during this
process.

For example, after enabling Digital Audio Output in the system’s Control
Panel,  `directsoundsink`  will automatically expose `audio/x-ac3`,
`audio/x-eac3` and `audio/x-dts` caps in addition to `audio/x-raw`.
However, one particular external decoder might only understand raw
integer streams and would try to play the compressed data as such (a
painful experience for your ears, rest assured).

Solving this issue requires user intervention, since only the user knows
the formats supported by the external decoder.

On some systems, the simplest solution is to inform the operating system
of the formats that the external audio decoder can accept. In this way,
the GStreamer audio sinks will only offer these formats. The acceptable
audio formats are commonly selected from the operating system’s audio
configuration panel, from the same place where Digital Audio Output is
enabled, but, unfortunately, this option is not available in all audio
drivers.
involves going to the audio control panel and activating a checkbox
reading “Digital Audio Output” or similar.

The main GStreamer audio sinks for each platform, Pulse Audio
(`pulsesink`) for Linux, `osxaudiosink` for OS X and Direct Sound
(`directsoundsink`) for Windows, detect when digital audio output is
available and change their input caps accordingly to accept encoded
data. For example, these elements typically accept `audio/x-raw` data:
when digital audio output is enabled in the system, they may also
accept `audio/mpeg`, `audio/x-ac3`, `audio/x-eac3` or `audio/x-dts`.

Then, when `playbin` builds the decoding pipeline, it realizes that the
audio sink can be directly connected to the encoded data (typically
coming out of a demuxer), so there is no need for a decoder. This
process is automatic and does not need any action from the application.

On Linux, there exist other audio sinks, like Alsa (`alsasink`) which
work differently (a “digital device” needs to be manually selected
through the `device` property of the sink). Pulse Audio, though, is the
commonly preferred audio sink on Linux.

--
no mechanism to query an external audio decoder which formats are
supported, and, in fact, the cable can even be disconnected during this
process.

For example, after enabling Digital Audio Output in the system’s Control
Panel,  `directsoundsink`  will automatically expose `audio/x-ac3`,
`audio/x-eac3` and `audio/x-dts` caps in addition to `audio/x-raw`.
However, one particular external decoder might only understand raw
integer streams and would try to play the compressed data as such (a
painful experience for your ears, rest assured).

Solving this issue requires user intervention, since only the user knows
the formats supported by the external decoder.

On some systems, the simplest solution is to inform the operating system
of the formats that the external audio decoder can accept. In this way,
the GStreamer audio sinks will only offer these formats. The acceptable
audio formats are commonly selected from the operating system’s audio
configuration panel, from the same place where Digital Audio Output is
enabled, but, unfortunately, this option is not available in all audio
drivers.
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
(see [](tutorials/basic/gstreamer-tools.md)) to see the
available decoders.

---

