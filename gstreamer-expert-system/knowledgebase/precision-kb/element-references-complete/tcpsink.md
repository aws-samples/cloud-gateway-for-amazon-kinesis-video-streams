- **glimagesink**: OpenGL display

### NETWORK ELEMENTS (Cross-platform)
- **rtspsrc, rtspsink**: RTSP streaming
- **udpsrc, udpsink**: UDP streaming  
- **tcpsrc, tcpsink**: TCP streaming
- **webrtcbin**: WebRTC (complex setup)

### PLATFORM DETECTION IN PIPELINES

#### Ask User for Platform First:
"What operating system are you using? (Linux, macOS, Windows)"

#### Provide Platform-Appropriate Elements:

**For Linux users**:
```bash
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

**For macOS users**:

---

