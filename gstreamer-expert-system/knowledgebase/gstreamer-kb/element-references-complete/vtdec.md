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

# Audio
   `androidmedia` plugin in gst-plugins-bad. This includes both encoding and
   decoding.

 - Apple VideoTool Box Framework: Apple's API to access hardware is available
  through the `applemedia` plugin which includes both encoding through
  the `vtenc` element and decoding through the `vtdec` element.

 - Video4Linux: Recent Linux kernels have a kernel API to expose
   hardware codecs in a standard way, this is now supported by the
   `v4l2` plugin in `gst-plugins-good`. This can support both decoding
   and encoding depending on the platform.

### Inner workings of hardware-accelerated video decoding plugins

These APIs generally offer a number of functionalities, like video
decoding, post-processing, or presentation of the decoded
frames. Correspondingly, plugins generally offer a different GStreamer
element for each of these functions, so pipelines can be built to
accommodate any need.

For example, the `va` plugin from `gst-plugins-bad` offers the
   `androidmedia` plugin in gst-plugins-bad. This includes both encoding and
   decoding.

 - Apple VideoTool Box Framework: Apple's API to access hardware is available
  through the `applemedia` plugin which includes both encoding through
  the `vtenc` element and decoding through the `vtdec` element.

 - Video4Linux: Recent Linux kernels have a kernel API to expose
   hardware codecs in a standard way, this is now supported by the
   `v4l2` plugin in `gst-plugins-good`. This can support both decoding
   and encoding depending on the platform.

### Inner workings of hardware-accelerated video decoding plugins

These APIs generally offer a number of functionalities, like video
decoding, post-processing, or presentation of the decoded
frames. Correspondingly, plugins generally offer a different GStreamer
element for each of these functions, so pipelines can be built to
accommodate any need.

For example, the `va` plugin from `gst-plugins-bad` offers the
   gst-inspect-1.0 elementname | grep -A 10 "Pad Templates"
   ```

3. **Verify platform availability**:
   - Linux: v4l2src, vaapi elements
   - macOS: avfvideosrc, vtenc/vtdec elements  
   - Windows: ksvideosrc, mf elements

#### Common Pipeline Patterns:

**Raw Processing**:
```
source ! decoder ! videoconvert ! videoscale ! encoder ! sink
```

**Encoded Passthrough**:
```
source ! demuxer ! parser ! sink
```

**Format Conversion**:
```

### VideoToolbox Decoders
```bash
# Available VideoToolbox decoders
vtdec           # Hardware decoding
```

### Example with Hardware Acceleration
```bash
# Hardware-accelerated pipeline on macOS
gst-launch-1.0 \
  avfvideosrc ! \
  video/x-raw,width=1920,height=1080,framerate=30/1 ! \
  vtenc_h264 bitrate=5000 ! \
  h264parse ! \
  kvssink stream-name="hw-accelerated-stream"
```

## REMEMBER: Platform-Specific Element Usage


---

