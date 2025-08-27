
#### macOS Elements (Use on macOS)
```bash
# Video
avfvideosrc     # Camera source
osxvideosink    # Video display
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
--
```bash
# Instead of just one solution, provide alternatives:

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

--
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
and is therefore easier to use and offers more advanced features. It has
been known to be unstable on some older Linux distributions, though.

## Mac OS X

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
and is therefore easier to use and offers more advanced features. It has
been known to be unstable on some older Linux distributions, though.

## Mac OS X

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

---

