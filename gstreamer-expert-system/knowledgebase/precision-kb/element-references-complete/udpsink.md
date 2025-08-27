payload header and a subbuffer of the original input H264 buffer. Since
the rtp headers and the h264 data don’t need to be contiguous in memory,
they are added to the buffer as separate `GstMemory` blocks and we can
avoid to memcpy the h264 data into contiguous memory.

A typical udpsink will then use something like sendmsg to send the
memory regions on the network inside one UDP packet. This will further
avoid having to memcpy data into contiguous memory.

Using bufferlists, the complete array of output buffers can be pushed in
one operation to the peer element.
Stream video using RTP and network elements

This command would be run on the transmitter:

```
gst-launch-1.0 v4l2src ! queue ! videoconvert ! x264enc tune=zerolatency key-int-max=15 ! video/x-h264,profile=main ! rtph264pay pt=96 config-interval=-1 ! udpsink host=192.168.1.1 port=5000
```

Use this command on the receiver:

```
gst-launch-1.0 udpsrc port=5000 ! application/x-rtp,clock-rate=90000,payload=96 ! rtpjitterbuffer ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! xvimagesink
```

### Diagnostic

Generate a null stream and ignore it (and print out details):

```
gst-launch-1.0 -v fakesrc num-buffers=16 ! fakesink silent=false
```
payload header and a subbuffer of the original input H264 buffer. Since
the rtp headers and the h264 data don’t need to be contiguous in memory,
they are added to the buffer as separate `GstMemory` blocks and we can
avoid to memcpy the h264 data into contiguous memory.

A typical udpsink will then use something like sendmsg to send the
memory regions on the network inside one UDP packet. This will further
avoid having to memcpy data into contiguous memory.

Using bufferlists, the complete array of output buffers can be pushed in
one operation to the peer element.
Stream video using RTP and network elements

This command would be run on the transmitter:

```
gst-launch-1.0 v4l2src ! queue ! videoconvert ! x264enc tune=zerolatency key-int-max=15 ! video/x-h264,profile=main ! rtph264pay pt=96 config-interval=-1 ! udpsink host=192.168.1.1 port=5000
```

Use this command on the receiver:

```
gst-launch-1.0 udpsrc port=5000 ! application/x-rtp,clock-rate=90000,payload=96 ! rtpjitterbuffer ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! xvimagesink
```

### Diagnostic

Generate a null stream and ignore it (and print out details):

```
gst-launch-1.0 -v fakesrc num-buffers=16 ! fakesink silent=false
```

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

---

