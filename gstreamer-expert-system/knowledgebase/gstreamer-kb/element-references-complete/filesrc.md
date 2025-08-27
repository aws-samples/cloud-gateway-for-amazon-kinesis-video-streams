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
```

### Issue 3: Missing Plugin Dependencies
```bash
# ❌ WRONG - Assuming all plugins are installed
gst-launch-1.0 filesrc location=video.mp4 ! qtdemux ! h264parse ! kvssink

# ✅ CORRECT - Check plugin availability and provide alternatives
# Check if qtdemux is available:
gst-inspect-1.0 qtdemux
# If not available, suggest installation or alternative:
# Alternative: use decodebin for automatic demuxing
gst-launch-1.0 filesrc location=video.mp4 ! decodebin ! videoconvert ! x264enc ! kvssink
```

### Issue 4: Hardware Acceleration Assumptions
```bash
# ❌ WRONG - Assuming hardware acceleration is available
gst-launch-1.0 avfvideosrc ! nvh264enc ! kvssink

# ✅ CORRECT - Check availability and provide fallbacks
# Check for hardware encoders:
gst-inspect-1.0 vtenc_h264    # macOS VideoToolbox
gst-inspect-1.0 nvh264enc     # NVIDIA
gst-inspect-1.0 vaapih264enc  # Intel VAAPI

# Provide fallback:
# Try hardware first, fallback to software:

---

