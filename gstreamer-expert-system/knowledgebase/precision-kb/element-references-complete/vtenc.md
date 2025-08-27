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
```bash
# Debug macOS-specific elements
GST_DEBUG=avfvideosrc:5,osxvideosink:5 gst-launch-1.0 avfvideosrc ! osxvideosink

# Debug VideoToolbox
GST_DEBUG=vtenc:5 gst-launch-1.0 avfvideosrc ! vtenc_h264 ! fakesink
```

### Check Available Elements
```bash
# List all available elements (macOS-specific will be included)
gst-inspect-1.0 | grep -E "(osx|avf|vt)"

# Check specific element properties
gst-inspect-1.0 avfvideosrc
gst-inspect-1.0 osxaudiosink
gst-inspect-1.0 vtenc_h264
```

## Best Practices for macOS GStreamer Development

- Hardware acceleration: vaapi*, nvenc*, qsv*

### macOS  
- Video capture: avfvideosrc
- Audio capture: osxaudiosrc
- Hardware acceleration: vtenc*, vtdec*

### Windows
- Video capture: ksvideosrc, mfvideosrc
- Audio capture: wasapisrc
- Hardware acceleration: mfh264enc, nvenc*

## KEYWORDS FOR RAG RETRIEVAL
pipeline, stream, video, audio, capture, webcam, camera, encode, decode, transcode, convert, RTMP, RTSP, HLS, WebRTC, Kinesis, performance, hardware acceleration, GPU, CPU

---

