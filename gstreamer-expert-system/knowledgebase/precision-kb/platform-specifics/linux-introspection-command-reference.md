### Check Available Hardware Encoders/Decoders
```bash
# Check for NVIDIA acceleration
gst-inspect-1.0 | grep -i nv

# Check for Intel VAAPI
gst-inspect-1.0 | grep -i vaapi

# Check for Intel QuickSync
gst-inspect-1.0 | grep -i qsv

# Check for ARM OMX
gst-inspect-1.0 | grep -i omx
```

### Test Hardware Acceleration
```bash
# Test NVIDIA H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! nvh264enc ! fakesink

# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
