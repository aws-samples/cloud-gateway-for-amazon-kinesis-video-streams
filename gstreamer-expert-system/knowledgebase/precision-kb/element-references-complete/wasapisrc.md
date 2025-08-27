        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}"
                wasapi.device.description = "Microphone\ Array\ \(Conexant\ ISST\ Audio\)"
        gst-launch-1.0 wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! ...


Device found:

        name  : Speakers (Conexant ISST Audio)
        class : Audio/Sink
        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.0.00000000\}.\{42dfdea4-9253-459c-80a0-c6c107ac5def\}"
                wasapi.device.description = "Speakers\ \(Conexant\ ISST\ Audio\)"
```

Start sample application to send video stream to KVS using gstreamer plugin by executing the following command:

--
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
        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}"
                wasapi.device.description = "Microphone\ Array\ \(Conexant\ ISST\ Audio\)"
        gst-launch-1.0 wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! ...


Device found:

        name  : Speakers (Conexant ISST Audio)
        class : Audio/Sink
        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.0.00000000\}.\{42dfdea4-9253-459c-80a0-c6c107ac5def\}"
                wasapi.device.description = "Speakers\ \(Conexant\ ISST\ Audio\)"
```

Start sample application to send video stream to KVS using gstreamer plugin by executing the following command:

--
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
#### macOS
- **osxaudiosrc**: Core Audio capture
- **osxaudiosink**: Core Audio playback

#### Windows  
- **wasapisrc**: Windows Audio Session API capture
- **directsoundsrc**: DirectSound capture (older)

### HARDWARE ACCELERATION ELEMENTS

#### NVIDIA (Cross-platform)
- **nvh264enc, nvh265enc**: NVIDIA hardware encoding
- **nvh264dec, nvh265dec**: NVIDIA hardware decoding
- **Availability**: Systems with NVIDIA GPUs and drivers
- **Requirements**: CUDA toolkit, proper drivers

#### Intel Hardware Acceleration

**Linux/Windows**:
- **qsvh264enc, qsvh265enc**: Intel Quick Sync encoding
- **qsvh264dec, qsvh265dec**: Intel Quick Sync decoding
--
- **WRONG**: Always recommending nvenc
- **RIGHT**: Ask about hardware, verify availability

#### Using deprecated elements:
- **WRONG**: directsoundsrc on modern Windows
- **RIGHT**: wasapisrc for modern Windows audio

### RESPONSE PATTERN FOR PLATFORM-SPECIFIC REQUESTS

1. **ASK FOR PLATFORM**: "What operating system are you using?"
2. **PROVIDE PLATFORM-SPECIFIC SOLUTION**: Use appropriate elements
3. **EXPLAIN PLATFORM DIFFERENCES**: Why different elements are needed
4. **OFFER ALTERNATIVES**: Suggest cross-platform alternatives when available

Example:
"I see you want to capture video. What operating system are you using? 
- Linux: I'll use v4l2src
- macOS: I'll use avfvideosrc  
- Windows: I'll use ksvideosrc
Each platform has different video capture systems, so the element needs to match your OS."

### 1. PLATFORM AND OPERATING SYSTEM
- **Question**: "What operating system are you using? (Linux, macOS, Windows)"
- **Why**: Different platforms have different video capture elements:
  - Linux: v4l2src, alsasrc
  - macOS: avfvideosrc, osxaudiosrc  
  - Windows: ksvideosrc, wasapisrc

### 2. HARDWARE CAPABILITIES
- **Question**: "What hardware do you have available for acceleration? (CPU only, NVIDIA GPU, Intel GPU, AMD GPU)"
- **Why**: Hardware acceleration elements vary significantly:
  - NVIDIA: nvenc, nvdec, nvh264enc, nvh265enc
  - Intel: vaapi, qsvenc, qsvdec
  - AMD: vaapi elements
  - CPU only: software encoders (x264enc, x265enc)

### 3. IMPLEMENTATION APPROACH
- **Question**: "Do you need a command-line pipeline (gst-launch-1.0) or code implementation? (CLI, C/C++, Python)"
- **Why**: Different approaches have different syntax and error handling requirements

### 4. GSTREAMER VERSION
- **Question**: "What version of GStreamer are you using?"
--
- Audio capture: osxaudiosrc
- Hardware acceleration: vtenc*, vtdec*

### Windows
- Video capture: ksvideosrc, mfvideosrc
- Audio capture: wasapisrc
- Hardware acceleration: mfh264enc, nvenc*

## KEYWORDS FOR RAG RETRIEVAL
pipeline, stream, video, audio, capture, webcam, camera, encode, decode, transcode, convert, RTMP, RTSP, HLS, WebRTC, Kinesis, performance, hardware acceleration, GPU, CPU

---

