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
- Video capture: avfvideosrc
- Audio capture: osxaudiosrc
- Hardware acceleration: vtenc*, vtdec*

### Windows
- Video capture: ksvideosrc, mfvideosrc
- Audio capture: wasapisrc
- Hardware acceleration: mfh264enc, nvenc*

## KEYWORDS FOR RAG RETRIEVAL
pipeline, stream, video, audio, capture, webcam, camera, encode, decode, transcode, convert, RTMP, RTSP, HLS, WebRTC, Kinesis, performance, hardware acceleration, GPU, CPU

---

