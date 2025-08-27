  export GST_PLUGIN_PATH=`pwd`
  ```

  Sample GStreamer pipeline that generates test video with timestamp overlay to send to Kinesis Video Streams:
  ```sh
  gst-launch-1.0 -v videotestsrc is-live=true \
    ! video/x-raw,framerate=10/1,width=640,height=480 \
    ! clockoverlay time-format="%a %B %d, %Y %I:%M:%S %p" \
    ! x264enc bframes=0 key-int-max=10 \
    ! h264parse \
    ! kvssink stream-name="YourStreamName" aws-region="us-west-2" access-key="YourAccessKey" secret-key="YourSecretKey"
  ```

</details>

### How to run sample applications for sending media to KVS using [GStreamer](https://gstreamer.freedesktop.org/):

##### Setting credentials in environment variables
Define AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables with the AWS access key id and secret key:

```
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

After setting up [binfmt] to use wine for windows binaries,
you can run GStreamer tools under wine by running:

```
gst-launch-1.0.exe videotestsrc ! glimagesink
```

[binfmt]: http://man7.org/linux/man-pages/man5/binfmt.d.5.html

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
```

### Test Hardware Acceleration
```bash
# Test NVIDIA H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! nvh264enc ! fakesink

# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash

---

