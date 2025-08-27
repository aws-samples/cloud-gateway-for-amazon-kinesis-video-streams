
The SDK also has some integration with "known" media pipelines in a form of GStreamer kvssink plugin, which takes care of the integration with the actual frames, similar to Android/Java MediaSource interface.

![GitHub Logo](/docs/Layering_and_Interfaces.png)

Many real-life devices and applications have their own custom media pipeline which can be integrated with the KVS Producer interface with relative ease, needing codec configuration and frame data from the media pipeline. SDK provides capabilities of extracting or generating the CPD (Codec Private Data) for some media types listed below.

The structures described below have their equivalents in different layers of the SDK but semantically they are the same across the layers as they get converted to the ones defined in PIC.


### High-level object abstractions: Client and Streams

KVS Producer SDKs have a single main object called "Client". This object represents the streaming device and is abstracted by a handle: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L458. 
Each client can have one or more Stream objects. Stream object represents the actual media stream the Client object will create, configure and start streaming. Stream object is abstracted by a stream handle: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L478

Public APIs operating on the client or the streams will take these handles that are returned upon successfull "Create" call.

During Streaming, each stream can have multiple logical streaming sessions, representing a single PutMedia call. The streaming sessions are created on token rotation or re-streaming case caused by an error or re-connect triggered by the application or higher-level logic in Continuous Retry Callback provider (default) as a response to latency pressures and when connection staleness is detected.


### Configuration and defaults
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph265depay ! h265parse ! nvh265dec ! nvh264enc ! kvssink

# IF MJPEG detected → Decode and encode
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtpjpegdepay ! jpegdec ! videoconvert ! x264enc ! kvssink

# IF unknown codec → Use decodebin
gst-launch-1.0 rtspsrc location="rtsp://url" ! decodebin ! videoconvert ! x264enc ! kvssink
```

## File Source Introspection

### Essential Commands (Run These First)
```bash
# 1. ALWAYS start with file discovery
gst-discoverer-1.0 /path/to/video.mkv

# 2. Get JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/video.mp4

# 3. Test basic demuxing
gst-launch-1.0 filesrc location=/path/to/file ! decodebin ! fakesink num-buffers=10
--
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

# 2. Check V4L2 capabilities (Linux)
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Test basic capture
--
Before building ANY GStreamer pipeline, ensure you have:

- [ ] **Identified source type** (RTSP, file, device, network)
- [ ] **Run gst-discoverer-1.0** or appropriate introspection command
- [ ] **Analyzed container format** (MP4, MKV, AVI, etc.)
- [ ] **Identified video codec** (H.264, H.265, MJPEG, VP9, etc.)
- [ ] **Identified audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- [ ] **Noted resolution and framerate**
- [ ] **Checked hardware acceleration** availability
- [ ] **Tested basic connectivity** with fakesink
- [ ] **Planned transcoding strategy** if needed
- [ ] **Considered performance implications**

## Remember: Introspection First, Pipeline Second!

**5 minutes of introspection saves hours of debugging.**

Never assume codec formats, container types, or device capabilities. Always verify with the appropriate introspection commands before building your GStreamer pipeline.
| **Network Streams** | `gst-discoverer-1.0 "http://url"` | `curl -I` for headers |

### Step 3: Analyze Results
Extract these critical characteristics:
- **Container format** (MP4, MKV, AVI, etc.)
- **Video codec** (H.264, H.265, MJPEG, VP9, etc.)
- **Audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- **Resolution and framerate**
- **Bitrates and quality settings**
- **Number of streams** (multiple video/audio tracks)

### Step 4: Design Pipeline Based on Analysis
- Choose appropriate **demuxer** based on container
- Select **decoder/encoder** based on codecs
- Determine if **transcoding** is needed
- Plan **hardware acceleration** if available
- Design **error handling** and **fallbacks**

### Step 5: Test and Validate
- Test basic connectivity/playback first
- Verify pipeline with limited buffers
- Monitor performance and resource usage
--
gst-inspect-1.0 | grep -E "(vaapi|nvenc|nvdec|qsv|omx)"

# 2. Test hardware capability
gst-launch-1.0 videotestsrc num-buffers=10 ! vaapih264enc ! fakesink

# 3. Integrate into pipeline based on codec analysis
# If H.264 input detected:
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! nvh264dec ! nvh264enc ! kvssink
```

### Hardware Selection Logic
```bash
# NVIDIA GPUs → nvenc/nvdec
# Intel iGPU → vaapi
# Intel QuickSync → qsv  
# ARM SoCs → omx (if available)
```

## Error Handling and Debugging

### Progressive Testing Approach
--
### ❌ Don't Do This
```bash
# Building pipelines without introspection
gst-launch-1.0 rtspsrc location="rtsp://unknown" ! h264parse ! kvssink

# Assuming codec formats
gst-launch-1.0 filesrc location=video.avi ! avidemux ! h264parse ! kvssink

# Using generic elements when specific ones exist
gst-launch-1.0 v4l2src ! decodebin ! videoconvert ! x264enc ! kvssink

# Ignoring hardware capabilities
gst-launch-1.0 rtspsrc location="rtsp://4k-camera" ! rtph265depay ! avdec_h265 ! kvssink
```

### ✅ Do This Instead
```bash
# Always introspect first
gst-discoverer-1.0 "rtsp://camera:554/stream"
# → Discovered H.264, build appropriate pipeline:
gst-launch-1.0 rtspsrc location="rtsp://camera:554/stream" ! rtph264depay ! h264parse ! kvssink
--
        echo "Pipeline: $source → h264parse → kvssink"
    elif echo "$analysis" | grep -qi "h.265\|hevc"; then
        echo "⚠️  H.265 detected - transcoding required"
        echo "Pipeline: $source → h265parse → nvh265dec → nvh264enc → kvssink"
    else
        echo "⚠️  Non-H.264 codec - transcoding required"
        echo "Pipeline: $source → decode → x264enc → kvssink"
    fi
}
```

## Summary Checklist

Before building any GStreamer pipeline, ensure you have:

- [ ] **Identified source type** (RTSP, file, device, network)
- [ ] **Run appropriate introspection tool** (gst-discoverer-1.0, gst-device-monitor-1.0, etc.)
- [ ] **Analyzed container format** and chosen correct demuxer
- [ ] **Identified video/audio codecs** and determined transcoding needs
- [ ] **Checked hardware acceleration** availability for detected codecs
- [ ] **Tested basic connectivity** before building complex pipeline
# Alternative with more verbose output
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://your-camera-ip:554/stream" ! fakesink
```

**What to look for in output:**
- Video codec (H.264, H.265, MJPEG)
- Audio codec (AAC, G.711, G.726)
- Resolution and framerate
- RTP payload types
- Available tracks

#### Method 2: SDP File Analysis
```bash
# Save SDP to file for analysis
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink dump=true > stream.sdp

# Analyze SDP content
cat stream.sdp
```

#### Method 3: Using gst-discoverer-1.0
```bash
--
echo "1. Testing RTSP connectivity..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=10 ! fakesink

# Step 2: Detailed SDP analysis
echo "2. Analyzing SDP information..."
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=1 ! fakesink 2>&1 | grep -E "(SDP|codec|resolution|framerate)"

# Step 3: Stream discovery
echo "3. Stream discovery..."
gst-discoverer-1.0 "$RTSP_URL"

# Step 4: Test basic pipeline
echo "4. Testing basic decode pipeline..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink num-buffers=30
```

### Complete File Analysis Workflow

```bash
#!/bin/bash
FILE_PATH="$1"
--
gst-discoverer-1.0 "$SOURCE_URI"
```

### Pattern 2: Capability Testing
```bash
# Test if specific codec is supported
gst-launch-1.0 $SOURCE ! $DECODER ! fakesink num-buffers=1
```

### Pattern 3: Format Negotiation Testing
```bash
# Test specific format constraints
gst-launch-1.0 $SOURCE ! $CAPS ! fakesink
```

## Debugging Introspection Issues

### Enable Debug Output
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="$URL" ! fakesink
--
5. **Device Permissions**: Check device access permissions

## Best Practices Summary

1. **ALWAYS** perform media introspection before building pipelines
2. **NEVER** assume codec, resolution, or format characteristics
3. **TEST** basic connectivity before building complex pipelines
4. **DOCUMENT** discovered characteristics for future reference
5. **OPTIMIZE** pipelines based on actual stream properties
6. **VALIDATE** pipeline functionality with limited buffer counts first
7. **DEBUG** with appropriate GST_DEBUG levels when issues occur

## Integration with Kinesis Video Streams

### RTSP to KVS with Introspection

```bash
# Step 1: Analyze RTSP stream
gst-discoverer-1.0 "rtsp://camera-ip:554/stream"

# Step 2: Build optimized pipeline based on discovery

The SDK also has some integration with "known" media pipelines in a form of GStreamer kvssink plugin, which takes care of the integration with the actual frames, similar to Android/Java MediaSource interface.

![GitHub Logo](/docs/Layering_and_Interfaces.png)

Many real-life devices and applications have their own custom media pipeline which can be integrated with the KVS Producer interface with relative ease, needing codec configuration and frame data from the media pipeline. SDK provides capabilities of extracting or generating the CPD (Codec Private Data) for some media types listed below.

The structures described below have their equivalents in different layers of the SDK but semantically they are the same across the layers as they get converted to the ones defined in PIC.


### High-level object abstractions: Client and Streams

KVS Producer SDKs have a single main object called "Client". This object represents the streaming device and is abstracted by a handle: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L458. 
Each client can have one or more Stream objects. Stream object represents the actual media stream the Client object will create, configure and start streaming. Stream object is abstracted by a stream handle: https://github.com/awslabs/amazon-kinesis-video-streams-pic/blob/master/src/client/include/com/amazonaws/kinesis/video/client/Include.h#L478

Public APIs operating on the client or the streams will take these handles that are returned upon successfull "Create" call.

During Streaming, each stream can have multiple logical streaming sessions, representing a single PutMedia call. The streaming sessions are created on token rotation or re-streaming case caused by an error or re-connect triggered by the application or higher-level logic in Continuous Retry Callback provider (default) as a response to latency pressures and when connection staleness is detected.


### Configuration and defaults

---

