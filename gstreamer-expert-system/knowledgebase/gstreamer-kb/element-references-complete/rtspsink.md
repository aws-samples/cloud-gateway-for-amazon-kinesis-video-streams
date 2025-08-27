
### 4. NON-EXISTENT ELEMENTS

**COMMON MISTAKES**:
- `hlssink` → Correct: `hlssink2`
- `rtspsink` → Correct: `udpsink` or custom RTSP server
- `webrtcsink` → Correct: `webrtcbin` (more complex setup required)

**VERIFICATION**: Always verify element existence with:
```bash
gst-inspect-1.0 elementname
```

## RESPONSE PATTERN FOR IMPOSSIBLE REQUESTS

When a user asks for something technically impossible:

1. **CLEARLY STATE IT'S IMPOSSIBLE**: "This is technically impossible because..."
2. **EXPLAIN WHY**: Provide the technical reason
3. **OFFER ALTERNATIVES**: Suggest valid approaches that achieve similar goals
4. **PROVIDE WORKING EXAMPLE**: Show a correct pipeline
#### Windows
- **d3dvideosink**: Direct3D video display
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

---

