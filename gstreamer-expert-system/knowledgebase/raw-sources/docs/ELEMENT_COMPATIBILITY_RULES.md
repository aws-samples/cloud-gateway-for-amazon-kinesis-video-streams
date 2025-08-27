# GSTREAMER ELEMENT COMPATIBILITY RULES

## CRITICAL: ELEMENT INPUT/OUTPUT REQUIREMENTS

### VIDEO PROCESSING ELEMENTS

#### videoscale
- **INPUT REQUIRED**: video/x-raw (raw, uncompressed video)
- **OUTPUT**: video/x-raw (scaled raw video)
- **CANNOT PROCESS**: Any encoded format (H.264, H.265, VP8, VP9, MJPEG)
- **COMMON ERROR**: Connecting encoded source directly to videoscale

**CORRECT USAGE**:
```bash
# WRONG: rtspsrc ! videoscale ! sink
# RIGHT: rtspsrc ! decodebin ! videoscale ! encoder ! sink
```

#### videoconvert
- **INPUT REQUIRED**: video/x-raw
- **OUTPUT**: video/x-raw (different pixel format)
- **PURPOSE**: Convert between pixel formats (I420, NV12, RGB, etc.)

#### Video Encoders (x264enc, x265enc, nvh264enc, etc.)
- **INPUT REQUIRED**: video/x-raw
- **OUTPUT**: Encoded video (video/x-h264, video/x-h265, etc.)
- **ALWAYS CREATES**: New codec private data

#### Video Decoders (avdec_h264, nvh264dec, etc.)
- **INPUT REQUIRED**: Encoded video
- **OUTPUT**: video/x-raw

### AUDIO PROCESSING ELEMENTS

#### audioconvert
- **INPUT REQUIRED**: audio/x-raw
- **OUTPUT**: audio/x-raw (different format)

#### audioresample  
- **INPUT REQUIRED**: audio/x-raw
- **OUTPUT**: audio/x-raw (different sample rate)

#### Audio Encoders (lamemp3enc, faac, etc.)
- **INPUT REQUIRED**: audio/x-raw
- **OUTPUT**: Encoded audio

### SOURCE ELEMENTS

#### v4l2src (Linux only)
- **OUTPUT**: video/x-raw or encoded formats (depending on device)
- **PLATFORM**: Linux only
- **REPLACEMENT**: avfvideosrc (macOS), ksvideosrc (Windows)

#### avfvideosrc (macOS only)
- **OUTPUT**: video/x-raw
- **PLATFORM**: macOS only

#### rtspsrc
- **OUTPUT**: Encoded streams (usually)
- **REQUIRES**: Demuxer/decoder for processing
- **COMMON PATTERN**: rtspsrc ! decodebin ! processing ! encoder ! sink

#### filesrc
- **OUTPUT**: Raw file data
- **REQUIRES**: Demuxer for media files
- **PATTERN**: filesrc ! demuxer ! decoder ! processing ! encoder ! sink

### SINK ELEMENTS

#### kvssink (Kinesis Video Streams)
- **INPUT REQUIRED**: Encoded video (H.264 or H.265)
- **CANNOT ACCEPT**: Raw video (video/x-raw)
- **COMMON ERROR**: Sending raw video without encoding

#### hlssink2
- **INPUT REQUIRED**: Encoded video and audio
- **OUTPUT**: HLS segments and playlist
- **NOTE**: Not "hlssink" (doesn't exist)

### COMPATIBILITY CHECKING

#### Before Creating Pipelines:
1. **Check element existence**:
   ```bash
   gst-inspect-1.0 elementname
   ```

2. **Check pad capabilities**:
   ```bash
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
source ! decoder ! videoconvert ! encoder ! muxer ! sink
```

### DEBUGGING COMPATIBILITY ISSUES

#### Use GST_DEBUG for detailed information:
```bash
GST_DEBUG=3 gst-launch-1.0 your-pipeline
```

#### Check negotiated caps:
```bash
gst-launch-1.0 -v your-pipeline
```

#### Common Error Messages:
- "not-negotiated": Incompatible caps between elements
- "no-more-pads": Source element finished pad creation
- "could-not-link": Elements cannot be connected

## KEYWORDS FOR RAG RETRIEVAL
element, compatibility, caps, negotiation, input, output, raw, encoded, videoscale, videoconvert, encoder, decoder, source, sink, platform, Linux, macOS, Windows
