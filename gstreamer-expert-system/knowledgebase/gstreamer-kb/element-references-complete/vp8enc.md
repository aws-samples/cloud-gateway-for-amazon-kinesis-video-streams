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

- **avdec_h264** - H.264 decoder
- **avdec_h265** - H.265/HEVC decoder
- **avdec_vp8** - VP8 decoder
- **avdec_vp9** - VP9 decoder
- **vtdec** - macOS VideoToolbox decoder
- **nvh264dec** - NVIDIA H.264 decoder

---

