2.4 Use `gst-launch-1.0` command to upload file that contains both *audio and video*. Note that video should be H264 encoded and audio should be AAC encoded.

###### Running the `gst-launch-1.0` command to upload [MKV](https://www.matroska.org/) file that contains both *audio and video*.

```
gst-launch-1.0 -v filesrc location="YourAudioVideo.mkv" ! matroskademux name=demux ! queue ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MP4 file that contains both *audio and video*.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.mp4" ! qtdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MPEG2TS file that contains both *audio and video*.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.ts" ! tsdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

3. You can also run the the sample application by executing the following command which will send video to Kinesis Video Streams.
    * Change your current working directory to Release directory first.
      * ` cd C:\Users\<myuser>\Downloads\amazon-kinesis-video-streams-producer-sdk-cpp\build`
      * export your access key and secret key by doing:

      ```
      set AWS_ACCESS_KEY_ID=YourAccessKeyId
      set AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
      ```

      * Run the demo
          * **Example**:
            * Run the sample demo application for sending **webcam video** by executing ` kvs_gstreamer_sample.exe my-test-stream `  or
```

###### Running the `gst-launch-1.0` command to upload [MKV](https://www.matroska.org/) file that contains both *audio and video* in **Raspberry-PI**. Note that video should be H264 encoded and audio should be AAC encoded.

```
gst-launch-1.0 -v filesrc location="YourAudioVideo.mkv" ! matroskademux name=demux ! queue ! h264parse ! kvssink name=sink stream-name="my_stream_name" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MP4 file that contains both *audio and video*:

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.mp4" ! qtdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

###### Running the `gst-launch-1.0` command to upload MPEG2TS file that contains both *audio and video*:

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.ts" ! tsdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```
##### Running the `gst-launch-1.0` command with Iot-certificate and different stream-names than the thing-name

**Note:** Supply a the matching iot-thing-name (that the certificate points to) and we can stream to multiple stream-names (without the stream-name needing to be the same as the thing-name) using the same certificate credentials. iot-thing-name and stream-name can be completely different as long as there is a policy that allows the thing to write to the kinesis stream
```
$ gst-launch-1.0 -v rtspsrc location="rtsp://YourCameraRtspUrl" short-header=TRUE ! rtph264depay ! video/x-h264, format=avc,alignment=au !
 h264parse ! kvssink name=aname storage-size=512 iot-certificate="iot-certificate,endpoint=xxxxx.credentials.iot.ap-southeast-2.amazonaws.com,cert-path=/greengrass/v2/thingCert.crt,key-path=/greengrass/v2/privKey.key,ca-path=/greengrass/v2/rootCA.pem,role-aliases=KvsCameraIoTRoleAlias,iot-thing-name=myThingName123" aws-region="ap-southeast-2" log-config="/etc/mtdata/kvssink-log.config" stream-name=myThingName123-video1
```

##### Running the GStreamer sample application to upload a *audio and video* file

`kinesis_video_gstreamer_audio_video_sample_app` supports uploading a video that is either MKV, MPEGTS, or MP4. The sample application expects the video is encoded in H264 and audio is encoded in AAC format. Note: If your media uses a different format, then you can revise the pipeline elements in the sample application to suit your media format.

Change your current working directory to `build`. Launch the sample application with a stream name and a path to the file and it will start streaming.



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
gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
  rtspsrc. ! \
  rtpmp4adepay ! aacparse ! \
  tee name=audio_tee \
  video_tee. ! queue ! avdec_h264 ! videoconvert ! autovideosink \
  audio_tee. ! queue ! avdec_aac ! audioconvert ! autoaudiosink
```

### File Pipeline Design

```bash
# After discovering MKV with H.264 video + Vorbis audio:
gst-launch-1.0 \
  filesrc location="video.mkv" ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! avdec_h264 ! videoconvert ! autovideosink \
  demux.audio_0 ! vorbisparse ! vorbisdec ! audioconvert ! autoaudiosink
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

###### Running the `gst-launch-1.0` command to upload MPEG2TS file that contains both *audio and video*.

```
gst-launch-1.0 -v  filesrc location="YourAudioVideo.ts" ! tsdemux name=demux ! queue ! h264parse ! video/x-h264,stream-format=avc,alignment=au ! kvssink name=sink stream-name="audio-video-file" access-key="YourAccessKeyId" secret-key="YourSecretAccessKey" streaming-type=offline demux. ! queue ! aacparse ! sink.
```

3. You can also run the the sample application by executing the following command which will send video to Kinesis Video Streams.
    * Change your current working directory to Release directory first.
      * ` cd C:\Users\<myuser>\Downloads\amazon-kinesis-video-streams-producer-sdk-cpp\build`
      * export your access key and secret key by doing:

      ```
      set AWS_ACCESS_KEY_ID=YourAccessKeyId
      set AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
      ```

      * Run the demo
          * **Example**:
            * Run the sample demo application for sending **webcam video** by executing ` kvs_gstreamer_sample.exe my-test-stream `  or

---

