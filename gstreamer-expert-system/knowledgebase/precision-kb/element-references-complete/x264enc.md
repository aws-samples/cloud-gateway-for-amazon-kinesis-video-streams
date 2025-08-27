#### Installing GStreamer
Install GStreamer and GStreamer development from https://gstreamer.freedesktop.org/download/

Make sure when install that you do a full install, the standard install is missing important elements like `x264enc`

##### Discovering available devices:

Run the command `gst-device-monitor-1.0` to discover available devices. A sample output of the command looks like following:

```
Probing devices...


Device found:

        name  : HP Wide Vision HD
        class : Video/Source
        caps  : video/x-raw, format=(string)YUY2, width=(int)640, height=(int)480, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
                video/x-raw, format=(string)YUY2, width=(int)176, height=(int)144, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)12/11;
--
2.1  Use `gst-launch-1.0` to send video to Kinesis Video Streams

**Example:**

```
gst-launch-1.0 ksvideosrc do-timestamp=TRUE ! video/x-raw,width=640,height=480,framerate=30/1 ! videoconvert ! x264enc bframes=0 key-int-max=45 bitrate=512 ! video/x-h264,profile=baseline,stream-format=avc,alignment=au ! kvssink stream-name="stream-name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey"
```

**Note:** If you are using IoT credentials then you can pass them as parameters to the gst-launch-1.0 command

```
gst-launch-1.0 rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
```

2.2 Use `gst-launch-1.0` to send audio and raw video to Kinesis Video Streams

```
gst-launch-1.0 -v ksvideosrc ! videoconvert ! x264enc bframes=0 key-int-max=45 bitrate=512 tune=zerolatency ! video/x-h264,profile=baseline,stream-format=avc,alignment=au ! kvssink name=sink stream-name="stream-name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! audioconvert ! avenc_aac ! queue ! sink.
```

2.3 Use `gst-launch-1.0` to send audio and h264 encoded video to Kinesis Video Streams

```
gst-launch-1.0 -v ksvideosrc ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="stream-name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! audioconvert ! avenc_aac ! queue ! sink.
```

2.4 Use `gst-launch-1.0` command to upload file that contains both *audio and video*. Note that video should be H264 encoded and audio should be AAC encoded.

###### Running the `gst-launch-1.0` command to upload [MKV](https://www.matroska.org/) file that contains both *audio and video*.

```
gst-launch-1.0 -v filesrc location="YourAudioVideo.mkv" ! matroskademux name=demux ! queue ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```
  Sample GStreamer pipeline that generates test video with timestamp overlay to send to Kinesis Video Streams:
  ```sh
  gst-launch-1.0 -v videotestsrc is-live=true \
    ! video/x-raw,framerate=10/1,width=640,height=480 \
    ! clockoverlay time-format="%a %B %d, %Y %I:%M:%S %p" \
    ! x264enc bframes=0 key-int-max=10 \
    ! h264parse \
    ! kvssink stream-name="YourStreamName" aws-region="us-west-2" access-key="YourAccessKey" secret-key="YourSecretKey"
  ```

</details>

### How to run sample applications for sending media to KVS using [GStreamer](https://gstreamer.freedesktop.org/):

##### Setting credentials in environment variables
Define AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables with the AWS access key id and secret key:

```
$ export AWS_ACCESS_KEY_ID=YourAccessKeyId
$ export AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
```
--
```
You can find the RTSP URL from your IP camera manual or manufacturers product page. For more information on how to set up IoT/role policies and role-aliases, please refer to [iot-based-credential-provider](auth.md#iot-based-credential-provider) and https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/how-iot.html.

###### Running the `gst-launch-1.0` command to start streaming from USB camera source in **Ubuntu**.
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```
###### Running the `gst-launch-1.0` command to start streaming from USB camera source which has h264 encoded stream already:
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

then you can use the following following command to find the capture card and device number.

--
```

The audio recording device is represented by `hw:card_number,device_number`. So to use the second device in the example, use `hw:3,0` as the device in `gst-launch-1.0` command.

```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! h264parse ! video/x-h264,stream-format=avc,alignment=au,profile=baseline ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

if your camera supports outputting h264 encoded stream directly, then you can use this command:

```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

##### Running the `gst-launch-1.0` command with Iot-certificate and different stream-names than the thing-name

**Note:** Supply a the matching iot-thing-name (that the certificate points to) and we can stream to multiple stream-names (without the stream-name needing to be the same as the thing-name) using the same certificate credentials. iot-thing-name and stream-name can be completely different as long as there is a policy that allows the thing to write to the kinesis stream
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! video/x-h264, format=avc,alignment=au !
 h264parse ! kvssink name=aname storage-size=512 iot-certificate="iot-certificate,endpoint=xxxxx.credentials.iot.ap-southeast-2.amazonaws.com,cert-path=/greengrass/v2/thingCert.crt,key-path=/greengrass/v2/privKey.key,ca-path=/greengrass/v2/rootCA.pem,role-aliases=KvsCameraIoTRoleAlias,iot-thing-name=myThingName123" aws-region="ap-southeast-2" log-config="/etc/mtdata/kvssink-log.config" stream-name=myThingName123-video1
```
```
$ gst-launch-1.0 -v v4l2src do-timestamp=TRUE device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! omxh264enc periodicty-idr=45 inline-header=FALSE ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName access-key="YourAccessKey" secret-key="YourSecretKey"
```
or use a different encoder
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! x264enc  bframes=0 key-int-max=45 bitrate=500 tune=zerolatency ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

**Note:** If you are using **Raspberry PI with Bullseye** you have to use another encoder as well as `libcamerasrc` instead of `v4l2src device=/dev/video0`

```
$ gst-launch-1.0 libcamerasrc ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! videoconvert ! v4l2h264enc extra-controls="controls,repeat_sequence_header=1" ! video/x-h264,level='(string)4' ! h264parse ! video/x-h264,stream-format=avc, alignment=au,width=640,height=480,framerate=30/1 ! kvssink stream-name="test-stream" access-key="YourAccessKey" secret-key="YourSecretKey" aws-region="YourRegion"
```


###### Running the `gst-launch-1.0` command to start streaming both audio and video:

Please ensure that audio drivers are installed first by running

`apt-get install libasound2-dev`

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
gst-inspect-1.0 avfvideosrc    # Check if available on macOS
gst-inspect-1.0 v4l2src        # Check if available on Linux
```

--
```

### 3. Include Element Property Verification
```bash
# Don't assume properties exist - recommend checking:
gst-inspect-1.0 x264enc | grep bitrate
gst-inspect-1.0 kvssink | grep stream-name
```

### 4. Recommend Testing with Minimal Pipelines First
```bash
# Start simple, then build complexity:

# Step 1: Test source
gst-launch-1.0 avfvideosrc ! fakesink

# Step 2: Test source + conversion
gst-launch-1.0 avfvideosrc ! videoconvert ! fakesink

# Step 3: Test full pipeline
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! kvssink stream-name="test"
```

## Common Accuracy Issues and Solutions

### Issue 1: Wrong Element Names
```bash
# ❌ WRONG - Assuming Linux elements work on macOS
gst-launch-1.0 v4l2src ! xvimagesink

# ✅ CORRECT - Platform-specific recommendation
# On macOS:
gst-launch-1.0 avfvideosrc ! osxvideosink
# On Linux:
gst-launch-1.0 v4l2src ! xvimagesink
# Cross-platform:
--
```

### Issue 2: Incorrect Property Names
```bash
# ❌ WRONG - Assuming properties without verification
gst-launch-1.0 x264enc quality=high ! kvssink

# ✅ CORRECT - Verify properties first
# Check available properties:
gst-inspect-1.0 x264enc | grep -E "(bitrate|quality|preset)"
# Then use correct property names:
gst-launch-1.0 x264enc bitrate=4000 speed-preset=ultrafast ! kvssink
```

### Issue 3: Missing Plugin Dependencies
```bash
# ❌ WRONG - Assuming all plugins are installed
gst-launch-1.0 filesrc location=video.mp4 ! qtdemux ! h264parse ! kvssink

# ✅ CORRECT - Check plugin availability and provide alternatives
# Check if qtdemux is available:
gst-inspect-1.0 qtdemux
# If not available, suggest installation or alternative:
# Alternative: use decodebin for automatic demuxing
gst-launch-1.0 filesrc location=video.mp4 ! decodebin ! videoconvert ! x264enc ! kvssink
```

### Issue 4: Hardware Acceleration Assumptions
```bash
# ❌ WRONG - Assuming hardware acceleration is available
gst-launch-1.0 avfvideosrc ! nvh264enc ! kvssink

# ✅ CORRECT - Check availability and provide fallbacks
# Check for hardware encoders:
gst-inspect-1.0 vtenc_h264    # macOS VideoToolbox
gst-inspect-1.0 nvh264enc     # NVIDIA
gst-inspect-1.0 vaapih264enc  # Intel VAAPI

# Provide fallback:
# Try hardware first, fallback to software:
gst-launch-1.0 avfvideosrc ! vtenc_h264 ! kvssink
# If hardware not available:
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! kvssink
```

## Improved Recommendation Template

When providing GStreamer solutions, use this template:

```markdown
## Platform Considerations
**Target Platform**: [macOS/Linux/Windows/Cross-platform]

## Element Verification
First, verify these elements are available:
```bash
gst-inspect-1.0 [element1]
gst-inspect-1.0 [element2]

# IF H.265 video detected → Transcode to H.264
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph265depay ! h265parse ! nvh265dec ! nvh264enc ! kvssink

# IF MJPEG detected → Decode and encode
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! kvssink

# IF unknown codec → Use decodebin
gst-launch-1.0 rtspsrc location="rtsp://url" ! decodebin ! videoconvert ! x264enc ! kvssink
```

## File Source Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with file discovery
gst-discoverer-1.0 /path/to/video.mkv

# 2. Get JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/video.mp4

# 3. Test basic demuxing
gst-launch-1.0 filesrc location=/path/to/file ! decodebin ! fakesink num-buffers=10
```
--

# IF H.264 in MKV → Extract and passthrough
gst-launch-1.0 filesrc location=h264.mkv ! matroskademux ! h264parse ! kvssink

# IF other codec → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

## Webcam/Device Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with device discovery
gst-device-monitor-1.0 Video/Source

# 2. Check V4L2 capabilities (Linux)
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Test basic capture
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
--
```

### Pipeline Decision Tree Based on Discovery
```bash
# IF MJPEG supported → Use MJPEG (most efficient)
gst-launch-1.0 v4l2src device=/dev/video0 ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# IF YUY2 only → Use raw format
gst-launch-1.0 v4l2src device=/dev/video0 ! video/x-raw,format=YUY2,width=1920,height=1080 ! videoconvert ! x264enc ! kvssink

# IF unknown formats → Use generic approach
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! x264enc ! kvssink
```

## Audio Device Introspection

### Essential Commands
```bash
# 1. Discover audio sources
gst-device-monitor-1.0 Audio/Source

# 2. Test audio capture (ALSA)
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10

# 3. Test audio capture (PulseAudio)
gst-launch-1.0 pulsesrc ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10
```

---

