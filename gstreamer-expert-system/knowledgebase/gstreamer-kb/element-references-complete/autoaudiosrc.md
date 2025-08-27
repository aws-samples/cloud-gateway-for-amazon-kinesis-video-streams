### multiparty-sendrecv: Multiparty audio conference with N peers

* Run `_builddir/multiparty-sendrecv/gst/mp-webrtc-sendrecv --room-id=ID` with `ID` as a room name. The peer will connect to the signalling server and setup a conference room.
* Run this as many times as you like, each will spawn a peer that sends red noise and outputs the red noise it receives from other peers.
  - To change what a peer sends, find the `audiotestsrc` element in the source and change the `wave` property.
  - You can, of course, also replace `audiotestsrc` itself with `autoaudiosrc` (any platform) or `pulsesink` (on linux).
* TODO: implement JS to do the same, derived from the JS for the `sendrecv` example.

### TODO: Selective Forwarding Unit (SFU) example

* Server routes media between peers
* Participant sends 1 stream, receives n-1 streams

### TODO: Multipoint Control Unit (MCU) example

* Server mixes media from all participants
* Participant sends 1 stream, receives 1 stream
#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
avdec_h264      # Software H.264 decoding
```

## Accuracy Best Practices

### 1. Always Recommend Element Verification First
```bash
# Before recommending any element, suggest verification:
gst-inspect-1.0 [element-name]

# Example:

**When providing GStreamer solutions, ALWAYS consider the target platform:**

- **macOS**: Use `avfvideosrc`, `osxvideosink`, `osxaudiosrc`, `osxaudiosink`
- **Linux**: Use `v4l2src`, `xvimagesink`, `alsasrc`, `alsasink`
- **Cross-platform**: Use `autovideosrc`, `autovideosink`, `autoaudiosrc`, `autoaudiosink`

**This is critical for providing accurate, working solutions on macOS systems.**
### Cross-Platform Elements
```bash
# Auto-Selection (Recommended)
autovideosrc         # Automatically selects best video source
autovideosink        # Automatically selects best video sink
autoaudiosrc         # Automatically selects best audio source
autoaudiosink        # Automatically selects best audio sink

# Software Encoding/Decoding (Available everywhere)
x264enc              # Software H.264 encoder
x265enc              # Software H.265 encoder
avdec_h264           # Software H.264 decoder
avdec_h265           # Software H.265 decoder
```

## Common Invalid Pipeline Patterns

### ❌ Invalid: Encoded Stream to Raw Video Element
```bash
# WRONG - videoscale cannot process H.264 data
rtspsrc ! rtph264depay ! h264parse ! videoscale ! kvssink

---

