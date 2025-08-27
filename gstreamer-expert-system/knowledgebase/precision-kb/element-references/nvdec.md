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

