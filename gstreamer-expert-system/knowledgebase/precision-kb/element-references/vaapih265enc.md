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

#### Linux
- **ximagesink**: X11 video display
- **xvimagesink**: X11 with XVideo extension
- **waylandsink**: Wayland display
- **glimagesink**: OpenGL display

#### macOS
- **osxvideosink**: macOS native video display
- **glimagesink**: OpenGL display

#### Windows
- **d3dvideosink**: Direct3D video display
- **glimagesink**: OpenGL display

### NETWORK ELEMENTS (Cross-platform)
- **rtspsrc, rtspsink**: RTSP streaming
