
#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
```

## Accuracy Best Practices

### 1. Always Recommend Element Verification First
```bash
# Before recommending any element, suggest verification:
gst-inspect-1.0 [element-name]

--

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

# Step 1: Test source
gst-launch-1.0 avfvideosrc ! fakesink
--
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

### Issue 3: Missing Plugin Dependencies
```

#### Method 3: Test with videotestsrc
```bash
# Test pipeline with known source
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! autovideosink
```

### Network Streams (HLS, DASH, HTTP)

#### Method 1: gst-discoverer-1.0
```bash
# Analyze network stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"
```

#### Method 2: Direct pipeline analysis
```bash
# HLS stream analysis
gst-launch-1.0 -v souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink

--
echo "2. GStreamer analysis..."
gst-discoverer-1.0 -v "$FILE_PATH"

# Step 3: Test playback
echo "3. Testing playback pipeline..."
gst-launch-1.0 filesrc location="$FILE_PATH" ! decodebin ! videoconvert ! autovideosink
```

### Complete Device Analysis Workflow

```bash
#!/bin/bash

echo "=== Device Discovery Workflow ==="

# Step 1: Discover all devices
echo "1. Available devices..."
gst-device-monitor-1.0

# Step 2: Test specific device
DEVICE="/dev/video0"
--
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! avdec_h264 ! videoconvert ! autovideosink \
  audio_tee. ! queue ! avdec_aac ! audioconvert ! autoaudiosink
```

### File Pipeline Design

```bash
# After discovering MKV with H.264 video + Vorbis audio:
gst-launch-1.0 \
  filesrc location="video.mkv" ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! avdec_h264 ! videoconvert ! autovideosink \
  demux.audio_0 ! vorbisparse ! vorbisdec ! audioconvert ! autoaudiosink
```

### Device Pipeline Design

```bash
# After discovering webcam capabilities (1920x1080, MJPEG):
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  image/jpeg,width=1920,height=1080,framerate=30/1 ! \
  jpegdec ! videoconvert ! autovideosink
```

## Hardware Acceleration Selection

### Based on Codec Discovery

```bash
# H.264 with NVIDIA acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  nvh264dec ! nvvideoconvert ! autovideosink

# H.264 with VAAPI acceleration (Intel)
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph264depay ! h264parse ! \
  vaapih264dec ! vaapipostproc ! autovideosink

# H.265 with hardware acceleration
gst-launch-1.0 \
  rtspsrc location="rtsp://camera" ! \
  rtph265depay ! h265parse ! \
  nvh265dec ! nvvideoconvert ! autovideosink
```

## Common Introspection Patterns

### Pattern 1: Unknown Source Analysis
```bash
# Universal discovery approach
gst-discoverer-1.0 "$SOURCE_URI"
```

### Pattern 2: Capability Testing
```bash
# Test if specific codec is supported
gst-launch-1.0 $SOURCE ! $DECODER ! fakesink num-buffers=1
```
- threshold: Detection confidence threshold
- labels: Path to labels file

**Example:**
```bash
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! gvadetect model=person-detection.xml device=CPU ! gvawatermark ! videoconvert ! autovideosink
```

### gvaclassify  
Classification element for detected objects.

**Properties:**
- model: Path to the classification model
- device: Inference device
- labels: Path to labels file
- object-class: Object class to classify

**Example:**
```bash
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! gvadetect model=face-detection.xml ! gvaclassify model=age-gender.xml object-class=face ! gvawatermark ! videoconvert ! autovideosink
```

### gvainference
Generic inference element for custom models.

**Properties:**
- model: Path to the inference model
- device: Inference device
- pre-process-backend: Preprocessing backend (opencv, gstreamer, vaapi)
- inference-region: Region for inference (full-frame, roi-list)

### gvatrack
Multi-object tracking element.

**Properties:**
--
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-vehicle-bike-detection.xml device=CPU ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Detection + Classification
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=face-detection.xml device=CPU ! \
  gvaclassify model=age-gender.xml object-class=face ! \
  gvaclassify model=emotions.xml object-class=face ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Multi-Stream Processing
```bash
gst-launch-1.0 \
  uridecodebin uri=rtsp://camera1 name=src1 ! \
  gvadetect model=person-detection.xml device=CPU ! \
  gvatrack ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Metadata Publishing
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvametaconvert format=json ! \
  gvametapublish method=file file-path=results.json ! \
  fakesink
```

## Model Requirements

In simple form, a PIPELINE-DESCRIPTION is a list of element types
separated by exclamation marks (!). Go ahead and type in the following
command:

```
gst-launch-1.0 videotestsrc ! videoconvert ! autovideosink
```

You should see a windows with an animated video pattern. Use CTRL+C on
the terminal to stop the program.

This instantiates a new element of type `videotestsrc` (an element which
generates a sample video pattern), an `videoconvert` (an element
which does raw video format conversion, making sure other elements can
understand each other), and an `autovideosink` (a window to which video
is rendered). Then, GStreamer tries to link the output of each element
to the input of the element appearing on its right in the description.
If more than one input or output Pad is available, the Pad Caps are used
to find two compatible Pads.

### Properties

Properties may be appended to elements, in the form
*property=value *(multiple properties can be specified, separated by
spaces). Use the `gst-inspect-1.0` tool (explained next) to find out the
available properties for an
element.

```
gst-launch-1.0 videotestsrc pattern=11 ! videoconvert ! autovideosink
```

You should see a static video pattern, made of circles.

### Named elements

Elements can be named using the `name` property, in this way complex
pipelines involving branches can be created. Names allow linking to
elements created previously in the description, and are indispensable to
use elements with multiple output pads, like demuxers or tees, for
example.

Named elements are referred to using their name followed by a
dot.

```
gst-launch-1.0 videotestsrc ! videoconvert ! tee name=t ! queue ! autovideosink t. ! queue ! autovideosink
```

You should see two video windows, showing the same sample video pattern.
If you see only one, try to move it, since it is probably on top of the
second window.

This example instantiates a `videotestsrc`, linked to a
`videoconvert`, linked to a `tee` (Remember from [](tutorials/basic/multithreading-and-pad-availability.md) that
a `tee` copies to each of its output pads everything coming through its
input pad). The `tee` is named simply ‘t’ (using the `name` property)
and then linked to a `queue` and an `autovideosink`. The same `tee` is
referred to using ‘t.’ (mind the dot) and then linked to a second
`queue` and a second `autovideosink`.

To learn why the queues are necessary read [](tutorials/basic/multithreading-and-pad-availability.md).

### Pads

Instead of letting GStreamer choose which Pad to use when linking two
elements, you may want to specify the Pads directly. You can do this by
adding a dot plus the Pad name after the name of the element (it must be
a named element). Learn the names of the Pads of an element by using
the `gst-inspect-1.0` tool.

This is useful, for example, when you want to retrieve one particular
stream out of a
demuxer:

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
--
operation whenever the frame size is different in the input and the
output caps. The output caps are set by the Caps Filter to
320x200.

```
gst-launch-1.0 uridecodebin uri=https://gstreamer.freedesktop.org/data/media/sintel_trailer-480p.webm ! queue ! videoscale ! video/x-raw,width=320,height=200 ! videoconvert ! autovideosink
```

This short description of `gst-launch-1.0` should be enough to get you
started. Remember that you have the [complete documentation available
here](tools/gst-launch.md).

## `gst-inspect-1.0`

This tool has three modes of operation:

  - Without arguments, it lists all available elements types, this is,
    the types you can use to instantiate new elements.
  - With a file name as an argument, it treats the file as a GStreamer
    plugin, tries to open it, and lists all the elements described
    inside.
`audioresample` is useful for converting between different audio sample rates,
similarly making sure that this example will work on any platform, since the
audio sample rate produced by the audio decoder might not be one that the audio
sink supports.

The `autoaudiosink` is the equivalent of `autovideosink` seen in the
previous tutorial, for audio. It will render the audio stream to the
audio card.

``` c
if (!gst_element_link_many (data.convert, data.resample, data.sink, NULL)) {
  g_printerr ("Elements could not be linked.\n");
  gst_object_unref (data.pipeline);
  return -1;
}
```

Here we link the elements converter, resample and sink, but we **DO NOT** link
them with the source, since at this point it contains no source pads. We
just leave this branch (converter + sink) unlinked, until later on.

--

## Exercise

Dynamic pad linking has traditionally been a difficult topic for a lot
of programmers. Prove that you have achieved its mastery by
instantiating an `autovideosink` (probably with an `videoconvert` in
front) and link it to the demuxer when the right pad appears. Hint: You
are already printing on screen the type of the video pads.

You should now see (and hear) the same movie as in [Basic tutorial 1:
Hello world!](tutorials/basic/hello-world.md). In
that tutorial you used `playbin`, which is a handy element that
automatically takes care of all the demuxing and pad linking for you.
Most of the [Playback tutorials](tutorials/playback/index.md) are devoted
to `playbin`.

## Conclusion

In this tutorial, you learned:

  - How to be notified of events using `GSignals`

---

