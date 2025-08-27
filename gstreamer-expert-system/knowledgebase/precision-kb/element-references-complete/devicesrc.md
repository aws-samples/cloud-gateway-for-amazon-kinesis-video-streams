**Running the `kvssink` Intermittent Sample**

The intermittent `kvssink` sample will stream video for 20 seconds, then pause for 40 seconds, and repeat until an interrupt signal is received. To manually adjust the streaming and paused intervals, you can change the `KVS_INTERMITTENT_PLAYING_INTERVAL_SECONDS` and `KVS_INTERMITTENT_PAUSED_INTERVAL_SECONDS` values in the *kvssink_intermittent_sample.cpp* file.

```bash
./kvssink_intermittent_sample <stream-name> <testsrc or devicesrc (optional)>
```
Setting the source to `testsrc` will use [videotestsrc](https://gstreamer.freedesktop.org/documentation/videotestsrc/?gi-language=c) and to `devicesrc` will use [autovideosrc](https://gstreamer.freedesktop.org/documentation/autodetect/autovideosrc.html?gi-language=c). By default, `kvssink` uses "DEFAULT_STREAM" as the stream name, and the sample uses videotestsrc as the source. If a KVS stream with the provided or default name does not exist, the stream will automatically be created.

<br>

### Viewing the Sample Footage
Check the ingested video stream to confirm successful streaming using either the [AWS KVS Console](https://console.aws.amazon.com/kinesisvideo/home/#/streams/) or the [KVS Media Viewer](https://aws-samples.github.io/amazon-kinesis-video-streams-media-viewer/).

If playback issues are encountered, pleaser refer to the playback requirements under [GetHLSStreamingSessionURL](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_GetHLSStreamingSessionURL.html) or [GetDASHStreamingSessionURL](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_GetDASHStreamingSessionURL.html) and to the [Troubleshooting HLS Issues](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/hls-playback.html#how-hls-ex1-ts) guide.

<br>

### Using `putEventMetadata` for Events and S3 Image Generation

The image generation feature is available in the _kvs_gstreamer_audio_video_sample.cpp_ sample. To enable it, include the argument `-e <event_option>` where `<event option>` is a string that can be:

- `notification` - for a notification event
**Running the `kvssink` Intermittent Sample**

The intermittent `kvssink` sample will stream video for 20 seconds, then pause for 40 seconds, and repeat until an interrupt signal is received. To manually adjust the streaming and paused intervals, you can change the `KVS_INTERMITTENT_PLAYING_INTERVAL_SECONDS` and `KVS_INTERMITTENT_PAUSED_INTERVAL_SECONDS` values in the *kvssink_intermittent_sample.cpp* file.

```bash
./kvssink_intermittent_sample <stream-name> <testsrc or devicesrc (optional)>
```
Setting the source to `testsrc` will use [videotestsrc](https://gstreamer.freedesktop.org/documentation/videotestsrc/?gi-language=c) and to `devicesrc` will use [autovideosrc](https://gstreamer.freedesktop.org/documentation/autodetect/autovideosrc.html?gi-language=c). By default, `kvssink` uses "DEFAULT_STREAM" as the stream name, and the sample uses videotestsrc as the source. If a KVS stream with the provided or default name does not exist, the stream will automatically be created.

<br>

### Viewing the Sample Footage
Check the ingested video stream to confirm successful streaming using either the [AWS KVS Console](https://console.aws.amazon.com/kinesisvideo/home/#/streams/) or the [KVS Media Viewer](https://aws-samples.github.io/amazon-kinesis-video-streams-media-viewer/).

If playback issues are encountered, pleaser refer to the playback requirements under [GetHLSStreamingSessionURL](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_GetHLSStreamingSessionURL.html) or [GetDASHStreamingSessionURL](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_GetDASHStreamingSessionURL.html) and to the [Troubleshooting HLS Issues](https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/hls-playback.html#how-hls-ex1-ts) guide.

<br>

### Using `putEventMetadata` for Events and S3 Image Generation

The image generation feature is available in the _kvs_gstreamer_audio_video_sample.cpp_ sample. To enable it, include the argument `-e <event_option>` where `<event option>` is a string that can be:

- `notification` - for a notification event

---

