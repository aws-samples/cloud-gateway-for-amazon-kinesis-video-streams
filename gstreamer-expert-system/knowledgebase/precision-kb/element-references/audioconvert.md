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
```
* **A.** If **resolution is provided** then the sample will try to check if the camera supports that resolution. If it does detect that the camera can support the resolution supplied in command line, then streaming starts; else, it will fail with an error message `Resolution not supported`.
* **B.** If **no resolution is specified**, the sample application will try to use these three resolutions **640x480, 1280x720 and 1920x1080** and will **start streaming** once the camera supported resolution is detected.

##### Running the GStreamer RTSP sample application
