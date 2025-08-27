# Windows Media Introspection Guide

## Windows-Specific Media Discovery

### DirectShow Device Enumeration
```bash
# List DirectShow video devices
gst-device-monitor-1.0 Video/Source

# List DirectShow audio devices  
gst-device-monitor-1.0 Audio/Source
```

### WASAPI Device Discovery
```bash
# List WASAPI audio devices
gst-inspect-1.0 wasapisrc
gst-inspect-1.0 wasapisink

# Test WASAPI audio capture
gst-launch-1.0 wasapisrc ! audioconvert ! wavenc ! filesink location=test.wav
```

### Windows Media Foundation
```bash
# List Media Foundation video sources
gst-inspect-1.0 mfvideosrc

# Test MF camera capture
gst-launch-1.0 mfvideosrc ! videoconvert ! autovideosink
```

### Hardware Acceleration Detection
```bash
# Check Intel QSV availability
gst-inspect-1.0 qsvh264enc

# Check NVIDIA NVENC availability  
gst-inspect-1.0 nvh264enc

# Check AMD AMF availability
gst-inspect-1.0 amfh264enc
```

### Windows-Specific Debugging
```bash
# Enable DirectShow debug logging
set GST_DEBUG=dshow*:5

# Enable WASAPI debug logging
set GST_DEBUG=wasapi*:5

# Enable Media Foundation debug logging
set GST_DEBUG=mf*:5
```

### Registry and Codec Information
```bash
# List Windows-specific plugins
gst-inspect-1.0 | findstr /i "directshow wasapi mediafoundation"

# Check codec availability
gst-inspect-1.0 | findstr /i "wmv asf wma"
```

### Performance Monitoring
```bash
# Monitor Windows performance counters
gst-launch-1.0 ... ! fpsdisplaysink

# Use Windows Performance Toolkit for detailed analysis
# Configure ETW (Event Tracing for Windows) for GStreamer
```

### Common Windows Media Formats
- **Video**: WMV, ASF, MP4, AVI
- **Audio**: WMA, WAV, MP3, AAC
- **Containers**: ASF, WMV, MP4

### Troubleshooting Windows Issues
- Check Windows codec installation
- Verify camera/microphone permissions
- Test with Windows Media Player first
- Check DirectShow filter graph
