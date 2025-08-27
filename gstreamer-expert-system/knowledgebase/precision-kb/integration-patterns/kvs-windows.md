Start sample application to send video stream to KVS using gstreamer plugin by executing the following command:

1.  Before running the demo applications, set the environment by following the instructions below.

```
set GST_PLUGIN_PATH=C:\Users\<myuser>\Downloads\amazon-kinesis-video-streams-producer-sdk-cpp\build
```

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
            * Run the sample application for sending **IP camera video** by executing  `kvs_gstreamer_sample.exe my-test-rtsp-stream <rtsp_url>`
            * Run the sample application for sending **MKV File** by executing  `kvs_gstreamer_sample.exe my-test-stream <path/to/file.mkv>`
            * Can also use `kvssink_gstreamer_sample.exe` to upload video.
               * `kvssink_gstreamer_sample.exe` uses kvssink to upload to kvs while `kvs_gstreamer_sample.exe` uses appsink

4. You can also run the the sample application by executing the following command which will send audio and video to Kinesis Video Streams.
    * Change your current working directory to Release directory first.
      * ` cd C:\Users\<myuser>\Downloads\amazon-kinesis-video-streams-producer-sdk-cpp\build `
      * export your access key and secret key by doing:

      ```
      set AWS_ACCESS_KEY_ID=YourAccessKeyId
      set AWS_SECRET_ACCESS_KEY=YourSecretAccessKey
      ```

      * Figure out what your audio device is by running `gst-device-monitor-1.0` and export it as environment variable like such:

        `set AWS_KVS_AUDIO_DEVICE='{0.0.1.00000000}.{f1245929-0c97-4389-9c28-1ca9cb01576b}'`

        You can also choose to use other video devices by doing

        `set AWS_KVS_VIDEO_DEVICE='\\?\usb#vid_05c8&pid_038e&mi_00#6&20a8b444&0&0000#{6994ad05-93ef-11d0-a3cc-00a0c9223196}\global'`

