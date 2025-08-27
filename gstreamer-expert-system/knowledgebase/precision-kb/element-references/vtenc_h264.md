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
- **waylandsink**: Wayland display
- **glimagesink**: OpenGL display

#### macOS
- **osxvideosink**: macOS native video display
- **glimagesink**: OpenGL display

#### Windows
--
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

**For macOS users**:
```bash
gst-launch-1.0 avfvideosrc ! videoconvert ! vtenc_h264 ! rtmpsink location=rtmp://server/stream
```

**For Windows users**:
```bash
gst-launch-1.0 ksvideosrc ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

### ELEMENT AVAILABILITY CHECKING

#### Verify element exists:
```bash
gst-inspect-1.0 elementname
```

#### List available elements by category:
```bash
gst-inspect-1.0 | grep -i video
gst-inspect-1.0 | grep -i audio
```

