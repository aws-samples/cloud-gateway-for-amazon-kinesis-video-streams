# PLATFORM-SPECIFIC GSTREAMER ELEMENTS

## CRITICAL: ALWAYS CHECK PLATFORM BEFORE RECOMMENDING ELEMENTS

### VIDEO CAPTURE ELEMENTS

#### Linux
- **v4l2src**: Video4Linux2 video capture
  ```bash
  v4l2src device=/dev/video0 ! video/x-raw,width=1920,height=1080,framerate=30/1
  ```
- **Availability**: Linux only
- **Common devices**: /dev/video0, /dev/video1

#### macOS  
- **avfvideosrc**: AVFoundation video capture
  ```bash
  avfvideosrc device-index=0 ! video/x-raw,width=1920,height=1080,framerate=30/1
  ```
- **Availability**: macOS only
- **Device selection**: device-index property

#### Windows
- **ksvideosrc**: Kernel Streaming video capture
  ```bash
  ksvideosrc ! video/x-raw,width=1920,height=1080,framerate=30/1
  ```
- **mfvideosrc**: Media Foundation video capture (newer)
- **Availability**: Windows only

### AUDIO CAPTURE ELEMENTS

#### Linux
- **alsasrc**: ALSA audio capture
- **pulsesrc**: PulseAudio capture
- **jackaudiosrc**: JACK audio capture

#### macOS
- **osxaudiosrc**: Core Audio capture
- **osxaudiosink**: Core Audio playback

#### Windows  
- **wasapisrc**: Windows Audio Session API capture
- **directsoundsrc**: DirectSound capture (older)

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

#### Check hardware acceleration availability:
```bash
# NVIDIA
gst-inspect-1.0 | grep nv

# Intel
gst-inspect-1.0 | grep -E "(qsv|vaapi)"

# Apple
gst-inspect-1.0 | grep vt
```

### COMMON PLATFORM MISTAKES

#### Using Linux elements on other platforms:
- **WRONG**: v4l2src on macOS/Windows
- **RIGHT**: Ask platform first, then recommend appropriate element

#### Assuming hardware acceleration availability:
- **WRONG**: Always recommending nvenc
- **RIGHT**: Ask about hardware, verify availability

#### Using deprecated elements:
- **WRONG**: directsoundsrc on modern Windows
- **RIGHT**: wasapisrc for modern Windows audio

### RESPONSE PATTERN FOR PLATFORM-SPECIFIC REQUESTS

1. **ASK FOR PLATFORM**: "What operating system are you using?"
2. **PROVIDE PLATFORM-SPECIFIC SOLUTION**: Use appropriate elements
3. **EXPLAIN PLATFORM DIFFERENCES**: Why different elements are needed
4. **OFFER ALTERNATIVES**: Suggest cross-platform alternatives when available

Example:
"I see you want to capture video. What operating system are you using? 
- Linux: I'll use v4l2src
- macOS: I'll use avfvideosrc  
- Windows: I'll use ksvideosrc
Each platform has different video capture systems, so the element needs to match your OS."

## KEYWORDS FOR RAG RETRIEVAL
platform, Linux, macOS, Windows, v4l2src, avfvideosrc, ksvideosrc, capture, hardware acceleration, NVIDIA, Intel, AMD, cross-platform, compatibility, operating system
