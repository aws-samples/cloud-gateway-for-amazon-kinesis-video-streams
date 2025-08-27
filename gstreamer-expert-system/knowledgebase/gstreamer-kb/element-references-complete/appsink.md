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

AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_sample <my-stream> </path/to/file>
```

##### Running the GStreamer sample application to upload h264 *video* with kvssink

`kvs_gstreamer_sample` is functionally identical to `kvs_gstreamer_sample` except it uses kvssink instead of appsink.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvssink_gstreamer_sample <my-stream> <my_rtsp_url OR /path/to/file>
```

##### Running the GStreamer sample application to upload a *audio and video* file

`kvs_gstreamer_audio_video_sample` supports uploading a video that is either MKV, MPEGTS, or MP4. The sample application expects the video is encoded in H264 and audio is encoded in AAC format. Note: If your media uses a different format, then you can revise the pipeline elements in the sample application to suit your media format.

Change your current working directory to `build`. Launch the sample application with a stream name and a path to the file and it will start streaming.

```
AWS_ACCESS_KEY_ID=YourAccessKeyId AWS_SECRET_ACCESS_KEY=YourSecretAccessKey ./kvs_gstreamer_audio_video_sample <my-stream> -f </path/to/file>
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
```

<br>

### Run the Samples
Included are sample applications for streaming and ingesting to a KVS stream. To stream to KVS, the GStreamer samples use an implemented `appsink` sink element, and the "kvssink" samples use the custom `kvssink` sink element.
> [!TIP]
> More on [GStreamer elements](https://gstreamer.freedesktop.org/documentation/application-development/basics/elements.html?gi-language=c).

#### AWS Authentication
In your terminal, export AWS credentials for your IAM user or role and the region your stream is located in. The samples will default to us-west-2 if the region is not specified. The sample applications do not support IMDS credentials.

```
export AWS_ACCESS_KEY_ID=YourAccessKey
export AWS_SECRET_ACCESS_KEY=YourSecretKey

export AWS_DEFAULT_REGION=YourAWSRegion
```

If you're using temporary AWS credentials, also export your session token:

--
export AWS_SESSION_TOKEN=YourSessionToken
```

<br>

#### GStreamer `appsink` Samples
To stream media from the device's camera and microphone sources, create a stream in the [AWS KVS console](https://console.aws.amazon.com/kinesisvideo/home) and run the following sample:
```bash
./kvs_gstreamer_audio_video_sample <your-stream-name>
```

<br>

#### `kvssink` Samples
The SDK comes with two programmatic GStreamer samples: `kvssink_gstreamer_sample` and `kvssink_intermittent_sample`. For more use cases, see the CLI pipeline examples at [Example: Kinesis Video Streams Producer SDK GStreamer Plugin](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/examples-gstreamer-plugin.html).

The programmatic samples require the AWS region to be set with the `AWS_DEFAULT_REGION` environment variable. For example:
```bash
export AWS_DEFAULT_REGION=us-west-2
```

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


---

