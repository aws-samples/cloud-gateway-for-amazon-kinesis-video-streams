
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
```

**Linux/Windows**:
- **qsvh264enc, qsvh265enc**: Intel Quick Sync encoding
- **qsvh264dec, qsvh265dec**: Intel Quick Sync decoding
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
- **vaapih264dec, vaapih265dec**: VA-API decoding (Linux)

#### Apple Hardware Acceleration (macOS)
- **vtenc_h264, vtenc_h265**: VideoToolbox encoding
- **vtdec_h264, vtdec_h265**: VideoToolbox decoding
- **Availability**: macOS only

#### AMD Hardware Acceleration
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
- **amfh264enc, amfh265enc**: AMD Media Framework (Windows)

### DISPLAY/OUTPUT ELEMENTS

#### Linux
- **ximagesink**: X11 video display
- **xvimagesink**: X11 with XVideo extension

---

