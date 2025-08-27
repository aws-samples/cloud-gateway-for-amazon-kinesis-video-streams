# 2. Test hardware capability
gst-launch-1.0 videotestsrc num-buffers=10 ! vaapih264enc ! fakesink

# 3. Integrate into pipeline based on codec analysis
# If H.264 input detected:
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! nvh264dec ! nvh264enc ! kvssink
```

### Hardware Selection Logic
```bash
# NVIDIA GPUs → nvenc/nvdec
# Intel iGPU → vaapi
# Intel QuickSync → qsv  
# ARM SoCs → omx (if available)
```

## Error Handling and Debugging

### Progressive Testing Approach
```bash
# 1. Test source connectivity
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
- **avdec_h264** - H.264 decoder
- **avdec_h265** - H.265/HEVC decoder
- **avdec_vp8** - VP8 decoder
- **avdec_vp9** - VP9 decoder
- **vtdec** - macOS VideoToolbox decoder
- **nvh264dec** - NVIDIA H.264 decoder
- **vaapih264dec** - Intel VAAPI H.264 decoder

## Valid Data Flow Patterns

### Pattern 1: Encoded Stream Processing (No Decode/Encode)
```
rtspsrc → rtph264depay → h264parse → kvssink
rtspsrc → rtph265depay → h265parse → hlssink2
```
**Use Case:** Stream passthrough, format container changes
**Limitation:** Cannot modify resolution, frame rate, or visual content

### Pattern 2: Decode → Process → Encode (Full Transcoding)
```
rtspsrc → rtph264depay → h264parse → avdec_h264 → videoscale → videoconvert → x264enc → h264parse → kvssink
--
glimagesink          # OpenGL video display

# Hardware Encoding/Decoding
vaapih264enc         # Intel VAAPI H.264 encoder
nvh264enc            # NVIDIA H.264 encoder
nvh264dec            # NVIDIA H.264 decoder

# Audio
alsasrc              # ALSA audio input
alsasink             # ALSA audio output
pulsesrc             # PulseAudio input
pulsesink            # PulseAudio output
```

### Cross-Platform Elements
```bash
# Auto-Selection (Recommended)
autovideosrc         # Automatically selects best video source
autovideosink        # Automatically selects best video sink
autoaudiosrc         # Automatically selects best audio source
autoaudiosink        # Automatically selects best audio sink

### HARDWARE ACCELERATION ELEMENTS

#### NVIDIA (Cross-platform)
- **nvh264enc, nvh265enc**: NVIDIA hardware encoding
- **nvh264dec, nvh265dec**: NVIDIA hardware decoding
- **Availability**: Systems with NVIDIA GPUs and drivers
- **Requirements**: CUDA toolkit, proper drivers

#### Intel Hardware Acceleration

**Linux/Windows**:
- **qsvh264enc, qsvh265enc**: Intel Quick Sync encoding
- **qsvh264dec, qsvh265dec**: Intel Quick Sync decoding
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
- **vaapih264dec, vaapih265dec**: VA-API decoding (Linux)

#### Apple Hardware Acceleration (macOS)
- **vtenc_h264, vtenc_h265**: VideoToolbox encoding
- **vtdec_h264, vtdec_h265**: VideoToolbox decoding
- **Availability**: macOS only

---

