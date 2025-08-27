
# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash
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

#### AMD Hardware Acceleration
- **vaapih264enc, vaapih265enc**: VA-API encoding (Linux)
- **amfh264enc, amfh265enc**: AMD Media Framework (Windows)

### DISPLAY/OUTPUT ELEMENTS


---

