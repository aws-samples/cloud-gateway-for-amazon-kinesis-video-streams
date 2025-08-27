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

Generate a pure sine tone to test the audio output:

```
gst-launch-1.0 audiotestsrc ! audioconvert ! audioresample ! osssink
```
    cairotimeoverlay : Mixer/Video/Text
    dvdec            : Decoder/Video
    dvdemux          : Demuxer
    goom             : Converter/Audio/Video
    id3demux         : Extracter/Metadata
    udpsrc           : Source/Network/Protocol/Device
    videomixer       : Mixer/Video
    videoconvert     : Filter/Video             (intended use to convert video with as little
                                                 visible change as possible)
    vertigotv        : Effect/Video             (intended use is to change the video)
    volume           : Effect/Audio             (intended use is to change the audio data)
    vorbisdec        : Decoder/Audio
    vorbisenc        : Encoder/Audio
    oggmux           : Muxer
    adder            : Mixer/Audio
    videobox         : Effect/Video
    alsamixer        : Control/Audio/Device
    audioconvert     : Filter/Audio
    audioresample    : Filter/Audio
    xvimagesink      : Sink/Video/Device
    navseek          : Filter/Debug

- boost the priority of the udp receiver streaming thread

```
.--------.    .-------.    .------.    .-------.
| udpsrc |    | depay |    | adec |    | asink |
|       src->sink    src->sink   src->sink     |
'--------'    '-------'    '------'    '-------'
```

- when going from `READY` to `PAUSED` state, udpsrc will require a
streaming thread for pushing data into the depayloader. It will
post a `STREAM_STATUS` message indicating its requirement for a
streaming thread.

- The application will usually react to the `STREAM_STATUS`
messages with a sync bus handler.

- The application can configure the `GstTask` with a custom
`GstTaskPool` to manage the streaming thread or it can ignore the
message which will make the element use its default `GstTaskPool`.

- The application can react to the `ENTER/LEAVE` stream status
message to configure the thread right before it is
started/stopped. This can be used to configure the thread
priority.



Note that many RTP elements assume they receive RTP buffers with
<a href="/data/doc/gstreamer/head/gstreamer-libs/html/gstreamer-libs-GstNetAddressMeta.html">GstNetAddressMeta</a>
meta data set on them (as udpsrc will produce).



Note that many RTP elements assume they receive RTP buffers with
<a href="/data/doc/gstreamer/head/gstreamer-libs/html/gstreamer-libs-GstNetAddressMeta.html">GstNetAddressMeta</a>
meta data set on them (as udpsrc will produce).

---

