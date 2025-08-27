# MANDATORY CONTEXT GATHERING FOR ALL GSTREAMER REQUESTS

## CRITICAL: PRIORITY 2 - CONTEXT GATHERING (AFTER MEDIA INTROSPECTION)

**IMPORTANT**: Context gathering is PRIORITY 2, after media introspection challenge (Priority 1).

Before providing ANY GStreamer pipeline or solution, you MUST:
1. **FIRST**: Challenge user to introspect their media source (see RESPONSE_PRIORITY_HIERARCHY.md)
2. **SECOND**: Gather the following context information:

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
- **Why**: Element availability and properties change between versions

### 5. SPECIFIC REQUIREMENTS
- **Question**: "What are your specific requirements for resolution, framerate, bitrate, and latency?"
- **Why**: These affect element selection and configuration

## PRIORITY 2 RESPONSE PATTERN

After requesting media introspection (Priority 1), gather context with this pattern:

"While you're running the introspection command, I also need some environment details to provide the best solution:

1. **Platform**: What operating system are you using? (Linux, macOS, Windows)
2. **Hardware**: What hardware do you have for acceleration? (CPU only, NVIDIA GPU, Intel GPU, AMD GPU)  
3. **Implementation**: Do you need a command-line pipeline or code implementation?
4. **GStreamer Version**: What version of GStreamer are you using?
5. **Specific Requirements**: What are your requirements for resolution, framerate, and quality?

This information ensures I provide a pipeline optimized for your specific environment."

## PLATFORM-SPECIFIC ELEMENTS

### Linux
- Video capture: v4l2src
- Audio capture: alsasrc, pulsesrc
- Hardware acceleration: vaapi*, nvenc*, qsv*

### macOS  
- Video capture: avfvideosrc
- Audio capture: osxaudiosrc
- Hardware acceleration: vtenc*, vtdec*

### Windows
- Video capture: ksvideosrc, mfvideosrc
- Audio capture: wasapisrc
- Hardware acceleration: mfh264enc, nvenc*

## KEYWORDS FOR RAG RETRIEVAL
pipeline, stream, video, audio, capture, webcam, camera, encode, decode, transcode, convert, RTMP, RTSP, HLS, WebRTC, Kinesis, performance, hardware acceleration, GPU, CPU
