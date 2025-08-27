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
```bash
# For MKV files
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! fakesink

# For MP4 files  
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink

# For AVI files
gst-launch-1.0 filesrc location=file.avi ! avidemux ! fakesink

# For WebM files
gst-launch-1.0 filesrc location=file.webm ! matroskademux ! fakesink
```

### Pipeline Decision Tree Based on Discovery
```bash
# IF H.264 in MP4 → Direct passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# IF H.264 in MKV → Extract and passthrough
gst-launch-1.0 filesrc location=h264.mkv ! matroskademux ! h264parse ! kvssink

# IF other codec → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

## Webcam/Device Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with device discovery
gst-device-monitor-1.0 Video/Source

--

# V4L2 debugging
GST_DEBUG=v4l2:5 gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink

# File source debugging
GST_DEBUG=filesrc:5,qtdemux:5 gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink
```

## Complete Introspection Workflow Script

```bash
#!/bin/bash

introspect_media_source() {
    local source="$1"
    
    echo "=== GStreamer Media Introspection ==="
    echo "Source: $source"
    echo ""
    
    # Determine source type

---

