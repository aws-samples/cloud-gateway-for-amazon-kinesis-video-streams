	name  : HD Pro Webcam C920
	class : Audio/Source
	caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)16000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
	        audio/x-raw, format=(string){ S8, U8, S16LE, S16BE, U16LE, U16BE, S24_32LE, S24_32BE, U24_32LE, U24_32BE, S32LE, S32BE, U32LE, U32BE, S24LE, S24BE, U24LE, U24BE, S20LE, S20BE, U20LE, U20BE, S18LE, S18BE, U18LE, U18BE, F32LE, F32BE, F64LE, F64BE }, layout=(string)interleaved, rate=(int)16000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
	        audio/x-raw, format=(string){ S8, U8, S16LE, S16BE, U16LE, U16BE, S24_32LE, S24_32BE, U24_32LE, U24_32BE, S32LE, S32BE, U32LE, U32BE, S24LE, S24BE, U24LE, U24BE, S20LE, S20BE, U20LE, U20BE, S18LE, S18BE, U18LE, U18BE, F32LE, F32BE, F64LE, F64BE }, layout=(string)interleaved, rate=(int)16000, channels=(int)1;
	gst-launch-1.0 osxaudiosrc device=67 ! ...
```

----
###### Running the `gst-launch-1.0` command to start streaming from RTSP camera source.

```
$ gst-launch-1.0 rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

**Note:** If you are using **IoT credentials** then you can pass them as parameters to the gst-launch-1.0 command

```
$ gst-launch-1.0 rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
```
You can find the RTSP URL from your IP camera manual or manufacturers product page.
--
```

###### Running the `gst-launch-1.0` command to start streaming both audio and raw video in **Mac-OS**.

```
gst-launch-1.0 -v avfvideosrc ! videoconvert ! vtenc_h264_hw allow-frame-reordering=FALSE realtime=TRUE max-keyframe-interval=45 ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc ! audioconvert ! avenc_aac ! queue ! sink.
```

###### Running the `gst-launch-1.0` command to start streaming both audio and h264 encoded video in **Mac-OS**.

```
gst-launch-1.0 -v avfvideosrc device-index=1 ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc ! audioconvert ! avenc_aac ! queue ! sink.
```

The pipeline above uses default video and audio source on a Mac. If you have an audio enable webcam plugged in, you can first use `gst-device-monitor-1.0` command mentioned above to find out the index for webcam's microphone. The example audio video pipeline using the webcam looks like follows:

```
gst-launch-1.0 -v avfvideosrc device-index=1 ! videoconvert ! vtenc_h264_hw allow-frame-reordering=FALSE realtime=TRUE max-keyframe-interval=45 ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc device=67 ! audioconvert ! avenc_aac ! queue ! sink.
```

##### Running the `gst-launch-1.0` command with Iot-certificate and different stream-names than the thing-name

**Note:** Supply a the matching iot-thing-name (that the certificate points to) and we can stream to multiple stream-names (without the stream-name needing to be the same as the thing-name) using the same certificate credentials. iot-thing-name and stream-name can be completely different as long as there is a policy that allows the thing to write to the kinesis stream
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! video/x-h264, format=avc,alignment=au !
 h264parse ! kvssink name=aname storage-size=512 iot-certificate="iot-certificate,endpoint=xxxxx.credentials.iot.ap-southeast-2.amazonaws.com,cert-path=/greengrass/v2/thingCert.crt,key-path=/greengrass/v2/privKey.key,ca-path=/greengrass/v2/rootCA.pem,role-aliases=KvsCameraIoTRoleAlias,iot-thing-name=myThingName123" aws-region="ap-southeast-2" log-config="/etc/mtdata/kvssink-log.config" stream-name=myThingName123-video1
```

##### Running the GStreamer webcam sample application
The sample application `kinesis_video_gstreamer_sample_app` in the `build` directory uses GStreamer pipeline to get video data from the camera. Launch it with a stream name and it will start streaming from the camera. The user can also supply a streaming resolution (width and height) through command line arguments.

```
Usage: AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my_stream_name> -w <width> -h <height> -f <framerate> -b <bitrateInKBPS>
osxvideosink    # Video display
vtenc_h264      # Hardware H.264 encoding
vtdec           # Hardware decoding

# Audio  
osxaudiosrc     # Audio input
osxaudiosink    # Audio output
```

#### Linux Elements (Use on Linux)
```bash
# Video
v4l2src         # Camera source
xvimagesink     # Video display
vaapih264enc    # Intel hardware encoding
nvh264enc       # NVIDIA hardware encoding

# Audio
alsasrc         # ALSA audio input
alsasink        # ALSA audio output
pulsesrc        # PulseAudio input
	name  : HD Pro Webcam C920
	class : Audio/Source
	caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)16000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
	        audio/x-raw, format=(string){ S8, U8, S16LE, S16BE, U16LE, U16BE, S24_32LE, S24_32BE, U24_32LE, U24_32BE, S32LE, S32BE, U32LE, U32BE, S24LE, S24BE, U24LE, U24BE, S20LE, S20BE, U20LE, U20BE, S18LE, S18BE, U18LE, U18BE, F32LE, F32BE, F64LE, F64BE }, layout=(string)interleaved, rate=(int)16000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
	        audio/x-raw, format=(string){ S8, U8, S16LE, S16BE, U16LE, U16BE, S24_32LE, S24_32BE, U24_32LE, U24_32BE, S32LE, S32BE, U32LE, U32BE, S24LE, S24BE, U24LE, U24BE, S20LE, S20BE, U20LE, U20BE, S18LE, S18BE, U18LE, U18BE, F32LE, F32BE, F64LE, F64BE }, layout=(string)interleaved, rate=(int)16000, channels=(int)1;
	gst-launch-1.0 osxaudiosrc device=67 ! ...
```

----
###### Running the `gst-launch-1.0` command to start streaming from RTSP camera source.

```
$ gst-launch-1.0 rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

**Note:** If you are using **IoT credentials** then you can pass them as parameters to the gst-launch-1.0 command

```
$ gst-launch-1.0 rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
```
You can find the RTSP URL from your IP camera manual or manufacturers product page.
--
```

###### Running the `gst-launch-1.0` command to start streaming both audio and raw video in **Mac-OS**.

```
gst-launch-1.0 -v avfvideosrc ! videoconvert ! vtenc_h264_hw allow-frame-reordering=FALSE realtime=TRUE max-keyframe-interval=45 ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc ! audioconvert ! avenc_aac ! queue ! sink.
```

###### Running the `gst-launch-1.0` command to start streaming both audio and h264 encoded video in **Mac-OS**.

```
gst-launch-1.0 -v avfvideosrc device-index=1 ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc ! audioconvert ! avenc_aac ! queue ! sink.
```

The pipeline above uses default video and audio source on a Mac. If you have an audio enable webcam plugged in, you can first use `gst-device-monitor-1.0` command mentioned above to find out the index for webcam's microphone. The example audio video pipeline using the webcam looks like follows:

```
gst-launch-1.0 -v avfvideosrc device-index=1 ! videoconvert ! vtenc_h264_hw allow-frame-reordering=FALSE realtime=TRUE max-keyframe-interval=45 ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" osxaudiosrc device=67 ! audioconvert ! avenc_aac ! queue ! sink.
```

##### Running the `gst-launch-1.0` command with Iot-certificate and different stream-names than the thing-name

**Note:** Supply a the matching iot-thing-name (that the certificate points to) and we can stream to multiple stream-names (without the stream-name needing to be the same as the thing-name) using the same certificate credentials. iot-thing-name and stream-name can be completely different as long as there is a policy that allows the thing to write to the kinesis stream
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! video/x-h264, format=avc,alignment=au !
 h264parse ! kvssink name=aname storage-size=512 iot-certificate="iot-certificate,endpoint=xxxxx.credentials.iot.ap-southeast-2.amazonaws.com,cert-path=/greengrass/v2/thingCert.crt,key-path=/greengrass/v2/privKey.key,ca-path=/greengrass/v2/rootCA.pem,role-aliases=KvsCameraIoTRoleAlias,iot-thing-name=myThingName123" aws-region="ap-southeast-2" log-config="/etc/mtdata/kvssink-log.config" stream-name=myThingName123-video1
```

##### Running the GStreamer webcam sample application
The sample application `kinesis_video_gstreamer_sample_app` in the `build` directory uses GStreamer pipeline to get video data from the camera. Launch it with a stream name and it will start streaming from the camera. The user can also supply a streaming resolution (width and height) through command line arguments.

```
Usage: AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my_stream_name> -w <width> -h <height> -f <framerate> -b <bitrateInKBPS>

### PLATFORM-SPECIFIC ELEMENT CORRECTIONS

**macOS (Darwin):**
❌ v4l2src - Does NOT exist on macOS (use avfvideosrc)
❌ alsasrc - Does NOT exist on macOS (use osxaudiosrc)
❌ xvimagesink - Does NOT exist on macOS (use osxvideosink)

**Linux:**
❌ avfvideosrc - Does NOT exist on Linux (use v4l2src)
❌ osxaudiosrc - Does NOT exist on Linux (use alsasrc or pulsesrc)
❌ osxvideosink - Does NOT exist on Linux (use xvimagesink)

## MANDATORY PIPELINE VALIDATION RULES

### RULE 1: DATA FLOW VALIDATION
Before suggesting any pipeline, verify:
1. Each element can process the data type from the previous element
2. Raw video elements only connect after decoders
3. Encoders only connect after raw video processing
4. Parsers work with encoded data, not raw video

### RULE 2: ELEMENT EXISTENCE VALIDATION
Before suggesting any element:
1. Verify the element exists in GStreamer
2. Check platform compatibility (macOS vs Linux)
# ❌ WRONG - Linux elements
alsasrc
pulsesrc

# ✅ CORRECT - macOS elements
osxaudiosrc
```

## Video Elements (macOS vs Linux)

### Video Sinks
```bash
# ❌ WRONG - Linux-specific
xvimagesink
ximagesink

# ✅ CORRECT - macOS compatible
osxvideosink
glimagesink
autovideosink  # Automatically selects appropriate sink
```
--
```

### Audio Recording (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 osxaudiosrc ! audioconvert ! wavenc ! filesink location=recording.wav

# ❌ WRONG - Linux pipeline
gst-launch-1.0 alsasrc ! audioconvert ! wavenc ! filesink location=recording.wav
```

### Camera to File (macOS)
```bash
# ✅ CORRECT macOS pipeline
gst-launch-1.0 \
  avfvideosrc ! \
  video/x-raw,width=1280,height=720,framerate=30/1 ! \
  videoconvert ! \
  x264enc ! \
  mp4mux ! \
  filesink location=output.mp4
--
# List available audio devices on macOS
gst-device-monitor-1.0 Audio/Source
gst-device-monitor-1.0 Audio/Sink

# Test audio capture
gst-launch-1.0 osxaudiosrc ! audioconvert ! osxaudiosink
```

## Common macOS GStreamer Issues and Solutions

### Issue 1: "No such element" errors
```bash
# Problem: Using Linux elements on macOS
gst-launch-1.0 v4l2src ! xvimagesink
# Error: no element "v4l2src"

# Solution: Use macOS elements
gst-launch-1.0 avfvideosrc ! osxvideosink
```

### Issue 2: Camera permission issues
--

### Issue 3: Audio device not found
```bash
# Problem: Default audio device issues
# Solution: Specify device explicitly
gst-launch-1.0 osxaudiosrc device=0 ! audioconvert ! osxaudiosink
```

### Issue 4: Hardware acceleration differences
```bash
# macOS hardware acceleration options:
# - VideoToolbox (Apple's hardware acceleration)
# - OpenGL-based elements

# ✅ Use VideoToolbox when available
gst-launch-1.0 avfvideosrc ! vtenc_h264 ! h264parse ! kvssink

# ✅ Fallback to software encoding
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! h264parse ! kvssink
```

--

## REMEMBER: Platform-Specific Element Usage

**When providing GStreamer solutions, ALWAYS consider the target platform:**

- **macOS**: Use `avfvideosrc`, `osxvideosink`, `osxaudiosrc`, `osxaudiosink`
- **Linux**: Use `v4l2src`, `xvimagesink`, `alsasrc`, `alsasink`
- **Cross-platform**: Use `autovideosrc`, `autovideosink`, `autoaudiosrc`, `autoaudiosink`

**This is critical for providing accurate, working solutions on macOS systems.**

---

