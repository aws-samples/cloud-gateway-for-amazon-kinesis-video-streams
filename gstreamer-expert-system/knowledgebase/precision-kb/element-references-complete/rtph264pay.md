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

---

