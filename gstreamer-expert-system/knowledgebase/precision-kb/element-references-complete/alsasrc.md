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

As an example:

 * `-Dgst-full-plugins=coreelements;typefindfunctions;alsa;pbtypes`:
 Enable only `coreelements`, `typefindfunctions`, `alsa`, `pbtypes` plugins.
 * `-Dgst-full-elements=coreelements:filesrc,fakesink,identity;alsa:alsasrc`:
 Enable only `filesrc`, `identity` and `fakesink` elements from `coreelements`
 plugin and `alsasrc` element from `alsa` plugin.
 * `-Dgst-full-typefind-functions=typefindfunctions:wav,flv`:
 Enable only typefind func `wav` and `flv` from `typefindfunctions`
 * `-Dgst-full-device-providers=alsa:alsadeviceprovider`:
 Enable `alsadeviceprovider` from `alsa` plugin.
 * `-Dgst-full-dynamic-types=pbtypes:video_multiview_flagset`:
 Enable `video_multiview_flagset` from `pbtypes`.

All features from the `playback` plugin will be enabled and the other plugins
will be restricted to the specific features requested.

All the selected features will be registered into a dedicated `NULL`
plugin name.

This will cause the features/plugins that are not registered to not be included
in the final gstreamer-full library.
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
autovideosink   # Automatically selects appropriate video sink
autoaudiosrc    # Automatically selects appropriate audio source
autoaudiosink   # Automatically selects appropriate audio sink

# Software codecs (available everywhere)
x264enc         # Software H.264 encoding
```bash
# 1. Discover audio sources
gst-device-monitor-1.0 Audio/Source

# 2. Test audio capture (ALSA)
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10

# 3. Test audio capture (PulseAudio)
gst-launch-1.0 pulsesrc ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10
```

## Hardware Acceleration Discovery

### Check Available Hardware Encoders/Decoders
```bash
# Check for NVIDIA acceleration
gst-inspect-1.0 | grep -i nv

# Check for Intel VAAPI
gst-inspect-1.0 | grep -i vaapi


---

