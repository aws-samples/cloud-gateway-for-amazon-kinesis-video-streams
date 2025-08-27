vtenc_h264      # Hardware H.264 encoding
vtdec           # Hardware decoding

# Audio  
osxaudiosrc     # Audio input
osxaudiosink    # Audio output
```

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
### `osxvideosink`

This is the  video sink available to GStreamer on Mac OS X. It is also
possible to draw using `glimagesink` using OpenGL.

### `osxaudiosink`

This is the only audio sink available to GStreamer on Mac OS X.

## Windows

### `d3d11videosink`

This video sink is based on [Direct3D11](https://en.wikipedia.org/wiki/Direct3D#Direct3D_11)
and is the recommended element on Windows.
It supports VideoOverlay interface and rescaling/colorspace conversion
in [zero-copy](https://en.wikipedia.org/wiki/Zero-copy) manner. This element
is the most performant and featureful video sink element on Windows.

### `d3dvideosink`

--
This video source can capture from the cameras on Android devices, it is part
of the androidmedia plugin and uses the [android.hardware.Camera API](https://developer.android.com/reference/android/hardware/Camera.html).

## iOS

### `osxaudiosink`

This is the only audio sink available to GStreamer on iOS.

### `iosassetsrc`

Source element to read iOS assets, this is, documents stored in the
Library (like photos, music and videos). It can be instantiated
automatically by `playbin` when URIs use the
`assets-library://` scheme.

### `iosavassetsrc`

Source element to read and decode iOS audiovisual assets, this is,
documents stored in the Library (like photos, music and videos). It can
be instantiated automatically by `playbin` when URIs use the
method to achieve this depend on the operating system, but it generally
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
method to achieve this depend on the operating system, but it generally
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

---

