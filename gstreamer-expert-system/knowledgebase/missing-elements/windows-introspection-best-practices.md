# Windows GStreamer Introspection Best Practices

## Windows Environment Setup

### Environment Variables
```cmd
# Set GStreamer debug level
set GST_DEBUG=3

# Set plugin path
set GST_PLUGIN_PATH=C:\gstreamer\1.0\x86_64\lib\gstreamer-1.0

# Set registry location
set GST_REGISTRY=C:\Users\%USERNAME%\AppData\Local\gstreamer-registry.bin
```

### Windows-Specific Debugging
```cmd
# Debug DirectShow issues
set GST_DEBUG=dshow*:5,directsound*:4

# Debug WASAPI audio issues
set GST_DEBUG=wasapi*:5

# Debug Media Foundation issues
set GST_DEBUG=mf*:5,mfvideosrc*:5
```

## Device Discovery Best Practices

### Camera Discovery
```bash
# Use gst-device-monitor for reliable device detection
gst-device-monitor-1.0 Video/Source

# Test camera with DirectShow
gst-launch-1.0 dshowvideosrc ! videoconvert ! autovideosink

# Test camera with Media Foundation
gst-launch-1.0 mfvideosrc ! videoconvert ! autovideosink
```

### Audio Device Testing
```bash
# Test WASAPI audio input
gst-launch-1.0 wasapisrc ! audioconvert ! autoaudiosink

# Test DirectSound audio
gst-launch-1.0 directsoundsrc ! audioconvert ! autoaudiosink
```

## Windows-Specific Performance Tips

### Process Priority
```cmd
# Run GStreamer with high priority
start /high gst-launch-1.0 ...
```

### Memory Management
- Use Windows heap optimizations
- Configure virtual memory settings
- Monitor memory usage with Task Manager

### Threading Optimization
- Use Windows-specific thread scheduling
- Configure multimedia class scheduler service
- Set thread priorities appropriately

## Common Windows Pitfalls

### Camera Access Issues
- Check Windows privacy settings
- Verify camera is not in use by other applications
- Test with Windows Camera app first

### Audio Latency Problems
- Use WASAPI instead of DirectSound for low latency
- Configure exclusive mode when possible
- Check Windows audio enhancements settings

### Codec Issues
- Install Windows codec packs
- Use Windows Media Feature Pack on N/KN editions
- Verify codec licensing requirements

## Windows-Specific Tools

### GraphEdit (DirectShow)
- Use for DirectShow filter graph analysis
- Available in Windows SDK
- Helps debug DirectShow pipeline issues

### Windows Performance Toolkit
- Use for detailed performance analysis
- Configure ETW tracing for GStreamer
- Analyze CPU and memory usage patterns

### Process Monitor
- Monitor file and registry access
- Debug plugin loading issues
- Track resource usage

## Registry Management
```cmd
# Clear GStreamer registry
del "%LOCALAPPDATA%\gstreamer-registry.bin"

# Force registry rebuild
gst-inspect-1.0 --print-all > nul
```
