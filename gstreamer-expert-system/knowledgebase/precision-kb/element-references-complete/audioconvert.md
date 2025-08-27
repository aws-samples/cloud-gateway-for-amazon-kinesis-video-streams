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

###### Running the `gst-launch-1.0` command to upload MP4 file that contains both *audio and video*.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.mp4" ! qtdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```
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

list(APPEND CMAKE_MODULE_PATH "${GSTREAMER_ROOT}/share/cmake")

set(GSTREAMER_NDK_BUILD_PATH  "${GSTREAMER_ROOT}/share/gst-android/ndk-build/")
include("${GSTREAMER_NDK_BUILD_PATH}/plugins.cmake")
set(GSTREAMER_PLUGINS_CORE_CUSTOM coreelements app audioconvert audiorate audioresample videorate videoconvertscale videotestsrc audiotestsrc volume autodetect)
set(GSTREAMER_PLUGINS_CODECS_CUSTOM videoparsersbad vpx opus audioparsers opusparse androidmedia)
set(GSTREAMER_PLUGINS_NET_CUSTOM soup tcp rtsp rtp rtpmanager udp srtp webrtc dtls nice)
set(GSTREAMER_PLUGINS         ${GSTREAMER_PLUGINS_CORE_CUSTOM} ${GSTREAMER_PLUGINS_CODECS_CUSTOM} ${GSTREAMER_PLUGINS_NET_CUSTOM} ${GSTREAMER_PLUGINS_ENCODING} ${GSTREAMER_PLUGINS_SYS} ${GSTREAMER_PLUGINS_PLAYBACK})
set(GStreamer_EXTRA_DEPS gstreamer-webrtc-1.0 gstreamer-sdp-1.0 gstreamer-video-1.0 libsoup-3.0 json-glib-1.0 glib-2.0)
set(G_IO_MODULES openssl)
find_library(ANDROID_LIB android REQUIRED)
find_library(LOG_LIB log REQUIRED)
find_package(GStreamerMobile COMPONENTS ${GSTREAMER_PLUGINS} fonts ca_certificates REQUIRED)

add_library(gstwebrtc SHARED webrtc.c dummy.cpp)
target_link_libraries(gstwebrtc
    PUBLIC
        GStreamer::mobile
        ${ANDROID_LIB}
        ${LOG_LIB}

---

