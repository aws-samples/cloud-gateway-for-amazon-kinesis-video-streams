                image/jpeg, width=(int)176, height=(int)144, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)12/11;
                image/jpeg, width=(int)320, height=(int)240, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
                image/jpeg, width=(int)352, height=(int)288, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)12/11;
                image/jpeg, width=(int)640, height=(int)360, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
                image/jpeg, width=(int)1280, height=(int)720, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
        gst-launch-1.0 ksvideosrc device-path="\\\\\?\\usb\#vid_05c8\&pid_038e\&mi_00\#6\&20a8b444\&0\&0000\#\{6994ad05-93ef-11d0-a3cc-00a0c9223196\}\\global" ! ...


Device found:

        name  : Microphone Array (Conexant ISST Audio)
        class : Audio/Source
        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}"
                wasapi.device.description = "Microphone\ Array\ \(Conexant\ ISST\ Audio\)"
        gst-launch-1.0 wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! ...


Device found:
--
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
                image/jpeg, width=(int)176, height=(int)144, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)12/11;
                image/jpeg, width=(int)320, height=(int)240, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
                image/jpeg, width=(int)352, height=(int)288, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)12/11;
                image/jpeg, width=(int)640, height=(int)360, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
                image/jpeg, width=(int)1280, height=(int)720, framerate=(fraction)30/1, pixel-aspect-ratio=(fraction)1/1;
        gst-launch-1.0 ksvideosrc device-path="\\\\\?\\usb\#vid_05c8\&pid_038e\&mi_00\#6\&20a8b444\&0\&0000\#\{6994ad05-93ef-11d0-a3cc-00a0c9223196\}\\global" ! ...


Device found:

        name  : Microphone Array (Conexant ISST Audio)
        class : Audio/Source
        caps  : audio/x-raw, format=(string)F32LE, layout=(string)interleaved, rate=(int)48000, channels=(int)2, channel-mask=(bitmask)0x0000000000000003;
        properties:
                device.api = wasapi
                device.strid = "\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}"
                wasapi.device.description = "Microphone\ Array\ \(Conexant\ ISST\ Audio\)"
        gst-launch-1.0 wasapisrc device="\{0.0.1.00000000\}.\{f1245929-0c97-4389-9c28-1ca9cb01576b\}" ! ...


Device found:
--
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
### SOURCE ELEMENTS

#### v4l2src (Linux only)
- **OUTPUT**: video/x-raw or encoded formats (depending on device)
- **PLATFORM**: Linux only
- **REPLACEMENT**: avfvideosrc (macOS), ksvideosrc (Windows)

#### avfvideosrc (macOS only)
- **OUTPUT**: video/x-raw
- **PLATFORM**: macOS only

#### rtspsrc
- **OUTPUT**: Encoded streams (usually)
- **REQUIRES**: Demuxer/decoder for processing
- **COMMON PATTERN**: rtspsrc ! decodebin ! processing ! encoder ! sink

#### filesrc
- **OUTPUT**: Raw file data
- **REQUIRES**: Demuxer for media files
- **PATTERN**: filesrc ! demuxer ! decoder ! processing ! encoder ! sink

--
   ```

3. **Verify platform availability**:
   - Linux: v4l2src, vaapi elements
   - macOS: avfvideosrc, vtenc/vtdec elements  
   - Windows: ksvideosrc, mf elements

#### Common Pipeline Patterns:

**Raw Processing**:
```
source ! decoder ! videoconvert ! videoscale ! encoder ! sink
```

**Encoded Passthrough**:
```
source ! demuxer ! parser ! sink
```

**Format Conversion**:
```
  ```
- **Availability**: macOS only
- **Device selection**: device-index property

#### Windows
- **ksvideosrc**: Kernel Streaming video capture
  ```bash
  ksvideosrc ! video/x-raw,width=1920,height=1080,framerate=30/1
  ```
- **mfvideosrc**: Media Foundation video capture (newer)
- **Availability**: Windows only

### AUDIO CAPTURE ELEMENTS

#### Linux
- **alsasrc**: ALSA audio capture
- **pulsesrc**: PulseAudio capture
- **jackaudiosrc**: JACK audio capture

#### macOS
- **osxaudiosrc**: Core Audio capture
- **osxaudiosink**: Core Audio playback

--
gst-launch-1.0 avfvideosrc ! videoconvert ! vtenc_h264 ! rtmpsink location=rtmp://server/stream
```

**For Windows users**:
```bash
gst-launch-1.0 ksvideosrc ! videoconvert ! x264enc ! rtmpsink location=rtmp://server/stream
```

### ELEMENT AVAILABILITY CHECKING

#### Verify element exists:
```bash
gst-inspect-1.0 elementname
```

#### List available elements by category:
```bash
gst-inspect-1.0 | grep -i video
gst-inspect-1.0 | grep -i audio
```

--

Example:
"I see you want to capture video. What operating system are you using? 
- Linux: I'll use v4l2src
- macOS: I'll use avfvideosrc  
- Windows: I'll use ksvideosrc
Each platform has different video capture systems, so the element needs to match your OS."

## KEYWORDS FOR RAG RETRIEVAL
platform, Linux, macOS, Windows, v4l2src, avfvideosrc, ksvideosrc, capture, hardware acceleration, NVIDIA, Intel, AMD, cross-platform, compatibility, operating system
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
- Video capture: avfvideosrc
- Audio capture: osxaudiosrc
- Hardware acceleration: vtenc*, vtdec*

### Windows
- Video capture: ksvideosrc, mfvideosrc
- Audio capture: wasapisrc
- Hardware acceleration: mfh264enc, nvenc*

## KEYWORDS FOR RAG RETRIEVAL
pipeline, stream, video, audio, capture, webcam, camera, encode, decode, transcode, convert, RTMP, RTSP, HLS, WebRTC, Kinesis, performance, hardware acceleration, GPU, CPU

---

