
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

###### Running the `gst-launch-1.0` command to start streaming from camera source in **Mac-OS**.

```
$ gst-launch-1.0 autovideosrc ! videoconvert ! video/x-raw,format=I420,width=640,height=480,framerate=30/1 ! vtenc_h264_hw allow-frame-reordering=FALSE realtime=TRUE max-keyframe-interval=45 bitrate=500 ! h264parse ! video/x-h264,stream-format=avc,alignment=au,profile=baseline ! kvssink stream-name=YourStreamName storage-size=128 access-key="YourAccessKey" secret-key="YourSecretKey"
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
`kvs_gstreamer_sample` supports sending video from a RTSP URL (IP camera). You can find the RTSP URL from your IP camera manual or manufacturers product page. Change your current working direcctory to `build` directory. Launch it with a stream name and `rtsp_url`  and it will start streaming.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my-rtsp-stream> <my_rtsp_url>
```

##### Running the GStreamer sample application to upload a *video* file
--

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my-stream> </path/to/file>
```

##### Running the GStreamer sample application to upload h264 *video* with kvssink

`kvssink_gstreamer_sample` is functionally identical to `kvs_gstreamer_sample` except it uses kvssink instead of appsink.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvssink_gstreamer_sample <my-stream> <my_rtsp_url OR /path/to/file>
```


###### Running the `gst-launch-1.0` command to upload [MKV](https://www.matroska.org/) file that contains both *audio and video* in **Mac-OS**. Note that video should be H264 encoded and audio should be AAC encoded.

```
gst-launch-1.0 -v filesrc location="YourAudioVideo.mkv" ! matroskademux name=demux ! queue ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MP4 file that contains both *audio and video* in **Mac-OS**.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.mp4" ! qtdemux name=demux ! queue ! h264parse !  video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MPEG2TS file that contains both *audio and video* in **Mac-OS**.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.ts" ! tsdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

##### Running the GStreamer sample application to upload a *audio and video* file

`kvs_gstreamer_audio_video_sample` supports uploading a video that is either MKV, MPEGTS, or MP4. The sample application expects the video is encoded in H264 and audio is encoded in AAC format. Note: If your media uses a different format, then you can revise the pipeline elements in the sample application to suit your media format.

Change your current working directory to `build`. Launch the sample application with a stream name and a path to the file and it will start streaming.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_audio_video_sample <my-stream> </path/to/file>
```

##### Running the GStreamer sample application to stream audio and video from live source

`kvs_gstreamer_audio_video_sample` supports streaming audio and video from live sources such as a audio enabled webcam. First you need to figure out what your audio device is using the steps mentioned above and export it as environment variable like such:
--
```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_audio_video_sample <my-stream>
```

##### Additional examples
For additional examples on using Kinesis Video Streams Java SDK and  Kinesis Video Streams Parsing Library refer:

##### [Kinesis Video Streams Producer Java SDK](https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-java/blob/master/README.md)
##### [Kinesis Video Streams Parser Library](https://github.com/aws/amazon-kinesis-video-streams-parser-library/blob/master/README.md)
##### [Kinesis Video Streams Android SDK](https://github.com/awslabs/aws-sdk-android-samples/tree/master/AmazonKinesisVideoDemoApp)
-----

##### Running C++ unit tests

**Note:** Please set the credentials before running the unit tests:

```
$ export AWS_ACCESS_KEY_ID=YourAccessKeyId
$ export AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
optionally, set AWS_SESSION_TOKEN if integrating with temporary token and AWS_DEFAULT_REGION for the region other than us-west-2
```

The executable for **unit tests** will be built as `./tst/producer_test` inside the `build` directory. Launch it and it will run the unit test and kick off dummy frame streaming.

##### Running GStreamer Unit tests
