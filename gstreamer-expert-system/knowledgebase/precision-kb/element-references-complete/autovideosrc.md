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
avdec_h264      # Software H.264 decoding
```

## Accuracy Best Practices

### 1. Always Recommend Element Verification First
```bash
# Before recommending any element, suggest verification:
gst-inspect-1.0 [element-name]
--

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

# Step 1: Test source
gst-launch-1.0 avfvideosrc ! fakesink
--
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

### Issue 3: Missing Plugin Dependencies
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

---

