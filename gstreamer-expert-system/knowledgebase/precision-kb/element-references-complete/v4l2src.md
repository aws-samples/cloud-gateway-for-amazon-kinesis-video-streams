		v4l2.device.card = "H264\ USB\ Camera:\ USB\ Camera"
		v4l2.device.bus_info = usb-3f980000.usb-1.3
		v4l2.device.version = 265767 (0x00040e27)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video4 ! ...
```

###### Running the `gst-launch-1.0` command to start streaming from a RTSP camera source.
```
$ gst-launch-1.0 -v rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name=YourStreamName storage-size=128
```

**Note:** If you are using **IoT credentials** then you can pass them as parameters to the gst-launch-1.0 command
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
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

`arecord -l (or arecord --list-devices)`

the output should look like the following:

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

##### Running the GStreamer webcam sample application
The sample application `kvs_gstreamer_sample` in the `build` directory uses GStreamer pipeline to get video data from the camera. Launch it with a stream name and it will start streaming from the camera. The user can also supply a streaming resolution (width and height) through command line arguments.

```
Usage: AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my_stream_name> -w <width> -h <height> -f <framerate> -b <bitrateInKBPS>
		v4l2.device.card = "H264\ USB\ Camera:\ USB\ Camera"
		v4l2.device.bus_info = usb-3f980000.usb-1.3
		v4l2.device.version = 265767 (0x00040e27)
		v4l2.device.capabilities = 2216689665 (0x84200001)
		v4l2.device.device_caps = 69206017 (0x04200001)
	gst-launch-1.0 v4l2src device=/dev/video4 ! ...
```

###### Running the `gst-launch-1.0` command to start streaming from a RTSP camera source.
```
$ gst-launch-1.0 -v rtspsrc location=rtsp://YourCameraRtspUrl short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name=YourStreamName storage-size=128
```

**Note:** If you are using **IoT credentials** then you can pass them as parameters to the gst-launch-1.0 command
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! h264parse ! kvssink stream-name="iot-stream" iot-certificate="iot-certificate,endpoint=endpoint,cert-path=/path/to/certificate,key-path=/path/to/private/key,ca-path=/path/to/ca-cert,role-aliases=role-aliases"
```
You can find the RTSP URL from your IP camera manual or manufacturers product page.

###### Running the `gst-launch-1.0` command to start streaming from USB camera source which has h264 encoded stream already:
```
$ gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
```

###### Running the `gst-launch-1.0` command to start streaming from camera source:

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

then you can use the following following command to find the capture card and device number.

`arecord -l (or arecord --list-devices)`
--
```

The audio recording device is represented by `hw:card_number,device_numer`. So to use the second device in the example, use `hw:3,0` as the device in `gst-launch-1.0` command.

```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! videoconvert ! video/x-raw,width=640,height=480,framerate=30/1,format=I420 ! omxh264enc periodicty-idr=45 inline-header=FALSE ! h264parse ! video/x-h264,stream-format=avc,alignment=au,profile=baseline ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

if your camera supports outputting h264 encoded stream directly, then you can use this command:
```
gst-launch-1.0 -v v4l2src device=/dev/video0 ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="my-stream-name" access-key="YourAccessKey" secret-key="YourSecretKey" alsasrc device=hw:1,0 ! audioconvert ! avenc_aac ! queue ! sink.
```

##### Running the GStreamer webcam sample application
The sample application `kvs_gstreamer_sample` in the `build` directory uses GStreamer pipeline to get video data from the camera. Launch it with a stream name and it will start streaming from the camera. The user can also supply a streaming resolution (width and height) through command line arguments.

```
Usage: AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my_stream_name> -w <width> -h <height> -f <framerate> -b <bitrateInKBPS>
```
* **A.** If **resolution is provided** then the sample will try to check if the camera supports that resolution. If it does detect that the camera can support the resolution supplied in command line, then streaming starts; else, it will fail with an error message `Resolution not supported`.
* **B.** If **no resolution is specified**, the sample application will try to use these three resolutions **640x480, 1280x720 and 1920x1080** and will **start streaming** once the camera supported resolution is detected.

##### Running the GStreamer RTSP sample application
`kvs_gstreamer_sample` supports sending video from a RTSP URL (IP camera). You can find the RTSP URL from your IP camera manual or manufacturers product page. Change your current working direcctory to `build` directory. Launch it with a stream name and `rtsp_url`  and it will start streaming.

```
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
pulsesink       # PulseAudio output
```

#### Cross-Platform Elements (Safe for all platforms)
```bash
# Auto-detection elements
autovideosrc    # Automatically selects appropriate video source
--
# Before recommending any element, suggest verification:
gst-inspect-1.0 [element-name]

# Example:
gst-inspect-1.0 avfvideosrc    # Check if available on macOS
gst-inspect-1.0 v4l2src        # Check if available on Linux
```

### 2. Provide Platform-Specific Alternatives
```bash
# Instead of just one solution, provide alternatives:

# For camera capture:
# macOS:
gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink

# Linux:
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink

# Cross-platform:
gst-launch-1.0 autovideosrc ! videoconvert ! autovideosink
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
--
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
gst-launch-1.0 autovideosrc ! autovideosink
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
# 2. Check V4L2 capabilities (Linux)
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Test basic capture
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

### Device Capability Analysis
```bash
# Example gst-device-monitor-1.0 output:
# Device found:
#   name  : HD Pro Webcam C920
#   class : Video/Source
#   caps  : video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, framerate=(fraction)30/1
#           image/jpeg, width=(int)1920, height=(int)1080, framerate=(fraction)30/1

# This tells you:
# - Device: /dev/video0 (usually)
# - Formats: YUY2 (raw) and MJPEG (compressed)
# - Resolution: 1920x1080
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
--
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="rtsp://url" ! fakesink

# V4L2 debugging
GST_DEBUG=v4l2:5 gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink

# File source debugging
GST_DEBUG=filesrc:5,qtdemux:5 gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink
```

## Complete Introspection Workflow Script

```bash
#!/bin/bash

introspect_media_source() {
    local source="$1"
    
    echo "=== GStreamer Media Introspection ==="
    echo "Source: $source"
--
        
        echo -e "\n2. Checking V4L2 capabilities..."
        v4l2-ctl -d "$source" --list-formats-ext
        
        echo -e "\n3. Testing device capture..."
        gst-launch-1.0 v4l2src device="$source" num-buffers=10 ! videoconvert ! fakesink
        
    elif [[ -f "$source" ]]; then
        echo "📁 File source detected"
        echo "1. Analyzing file..."
        gst-discoverer-1.0 "$source"
        
        echo -e "\n2. Testing file demuxing..."
        gst-launch-1.0 filesrc location="$source" ! decodebin ! fakesink num-buffers=10
        
    elif [[ "$source" =~ ^https?:// ]]; then
        echo "🌐 Network stream detected"
        echo "1. Analyzing network stream..."
        gst-discoverer-1.0 "$source"
        
    else

# 2. V4L2 capabilities (Linux)
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Basic capture test
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

#### Format Selection Strategy
```bash
# Priority order for efficiency:
# 1. MJPEG (hardware compressed)
gst-launch-1.0 v4l2src ! image/jpeg ! jpegdec ! videoconvert ! x264enc ! kvssink

# 2. YUY2 (uncompressed but efficient)
gst-launch-1.0 v4l2src ! video/x-raw,format=YUY2 ! videoconvert ! x264enc ! kvssink

# 3. RGB (least efficient, avoid if possible)
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! kvssink
```

## Hardware Acceleration Integration

### Discovery Process
```bash
# 1. Check available hardware encoders/decoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|nvdec|qsv|omx)"

# 2. Test hardware capability
gst-launch-1.0 videotestsrc num-buffers=10 ! vaapih264enc ! fakesink

# 3. Integrate into pipeline based on codec analysis
# If H.264 input detected:
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! nvh264dec ! nvh264enc ! kvssink
--

# Assuming codec formats
gst-launch-1.0 filesrc location=video.avi ! avidemux ! h264parse ! kvssink

# Using generic elements when specific ones exist
gst-launch-1.0 v4l2src ! decodebin ! videoconvert ! x264enc ! kvssink

# Ignoring hardware capabilities
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! avdec_h265 ! kvssink
```

### ✅ Do This Instead
```bash
# Always introspect first
gst-discoverer-1.0 "rtsp://camera:554/stream"
# → Discovered H.264, build appropriate pipeline:
gst-launch-1.0 rtspsrc location="rtsp://camera:554/stream" ! rtph264depay ! h264parse ! kvssink

# Analyze file characteristics
gst-discoverer-1.0 video.avi
# → Discovered MJPEG, build transcoding pipeline:
gst-launch-1.0 filesrc location=video.avi ! avidemux ! jpegdec ! x264enc ! kvssink

# Check device capabilities
gst-device-monitor-1.0 Video/Source
# → Discovered MJPEG support, use efficient pipeline:
gst-launch-1.0 v4l2src ! image/jpeg,width=1920,height=1080 ! jpegdec ! x264enc ! kvssink

# Use hardware acceleration when available
gst-inspect-1.0 nvh265dec
# → Hardware decoder available, use it:
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! nvh265dec ! nvh264enc ! kvssink
```

## Automation and Scripting

### Introspection Script Template
```bash
#!/bin/bash

introspect_and_build_pipeline() {
    local source="$1"

---

