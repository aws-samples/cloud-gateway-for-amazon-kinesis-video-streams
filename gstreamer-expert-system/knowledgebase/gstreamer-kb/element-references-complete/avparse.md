
- **h264parse** - Parses H.264 streams
- **h265parse** - Parses H.265/HEVC streams
- **vp8parse** - Parses VP8 streams
- **vp9parse** - Parses VP9 streams
- **avparse** - Generic parser

### Encoders (Input: raw video, Output: encoded stream)
These elements require raw video input:

- **x264enc** - Software H.264 encoding
- **x265enc** - Software H.265/HEVC encoding
- **vp8enc** - VP8 encoding
- **vp9enc** - VP9 encoding
- **vtenc_h264** - macOS VideoToolbox H.264 encoding
- **vtenc_h265** - macOS VideoToolbox H.265 encoding
- **nvh264enc** - NVIDIA H.264 encoding
- **vaapih264enc** - Intel VAAPI H.264 encoding

### Decoders (Input: encoded stream, Output: raw video)
These elements convert encoded streams to raw video:

---

