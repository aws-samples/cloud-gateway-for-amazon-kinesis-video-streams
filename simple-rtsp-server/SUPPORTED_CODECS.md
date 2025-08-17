# Comprehensive Video Codecs Support

## 🎥 **Currently Implemented Video Codecs**

### **Modern Codecs (Server Port 8554)**
| Codec | Standard | RTP PT | Encoder | Payloader | Description |
|-------|----------|--------|---------|-----------|-------------|
| **H.264** | ITU-T H.264/AVC | 96 | x264enc | rtph264pay | Advanced Video Coding - Most common modern codec |
| **H.265** | ITU-T H.265/HEVC | 96 | x265enc | rtph265pay | High Efficiency Video Coding - Next-gen codec |

### **Legacy Codecs (Server Port 8555)**
| Codec | Standard | RTP PT | Encoder | Payloader | Description |
|-------|----------|--------|---------|-----------|-------------|
| **H.263** | ITU-T H.263 | 34 | avenc_h263 | rtph263pay | Video coding for low bit rate communication |
| **H.263+** | ITU-T H.263v2 | 96 | avenc_h263p | rtph263ppay | Enhanced H.263 with improved features |
| **H.261** | ITU-T H.261 | 31 | avenc_h261 | rtph261pay | Video codec for ISDN - First ITU standard |
| **MPEG-4** | ISO MPEG-4 Part 2 | 96 | avenc_mpeg4 | rtpmp4vpay | MPEG-4 Visual - DivX/Xvid compatible |
| **MPEG-2** | ISO MPEG-2 Video | 32 | avenc_mpeg2video | rtpmpvpay | DVD/Broadcast standard |
| **MPEG-1** | ISO MPEG-1 Video | 32 | avenc_mpeg1video | rtpmpvpay | First MPEG video standard - VCD quality |

### **Image/Motion Codecs (Server Port 8556)**
| Codec | Standard | RTP PT | Encoder | Payloader | Description |
|-------|----------|--------|---------|-----------|-------------|
| **MJPEG** | Motion JPEG | 26 | jpegenc | rtpjpegpay | Sequential JPEG frames - IP camera standard |
| **JPEG 2000** | ISO JPEG 2000 | 96 | openjpegenc | rtpj2kpay | Wavelet-based image compression |

### **Open Source Codecs (Server Port 8557)**
| Codec | Standard | RTP PT | Encoder | Payloader | Description |
|-------|----------|--------|---------|-----------|-------------|
| **Theora** | Xiph.Org Theora | 96 | theoraenc | rtptheorapay | Open source video codec |
| **VP8** | Google VP8 | 96 | vp8enc | rtpvp8pay | Google's open video codec |
| **VP9** | Google VP9 | 96 | vp9enc | rtpvp9pay | Successor to VP8, more efficient |

## 📊 **Codec Categories & Use Cases**

### **Modern High-Efficiency Codecs**
- **H.264/AVC**: Universal compatibility, excellent quality/bitrate ratio
- **H.265/HEVC**: 50% better compression than H.264, 4K/8K ready

### **Legacy/Compatibility Codecs**
- **H.263/H.263+**: Older video conferencing, mobile devices
- **H.261**: Very old ISDN video conferencing
- **MPEG-4**: DivX/Xvid compatibility, older streaming
- **MPEG-2**: Broadcast TV, DVD compatibility
- **MPEG-1**: VCD, very basic streaming

### **Specialized Image Codecs**
- **MJPEG**: IP cameras, simple streaming, frame-by-frame
- **JPEG 2000**: High-quality image sequences, professional video

### **Open Source/Web Codecs**
- **Theora**: Open source alternative to MPEG-4
- **VP8**: WebM standard, web streaming
- **VP9**: YouTube, modern web streaming

## 🔧 **Technical Implementation Details**

### **RTP Payload Types (PT)**
- **Static PT**: Standardized (H.261=31, MPEG-2=32, H.263=34, MJPEG=26)
- **Dynamic PT**: Negotiated (H.264, H.265, VP8, VP9, etc. = 96-127)

### **Bitrate Calculations**
- **H.264**: `pixels × framerate × 0.1 / 1000` (500-8000 kbps)
- **H.265**: `H.264 bitrate × 0.6` (40% reduction)
- **Legacy**: `pixels × framerate × 0.05 / 1000` (200-2000 kbps)
- **MPEG-2**: `pixels × framerate × 0.15 / 1000` (800-10000 kbps)
- **VP9**: `VP8 bitrate × 0.7` (30% more efficient than VP8)

### **Resolution Support by Codec**
- **Modern (H.264/H.265)**: 240p → 1080p+ (up to 4K)
- **Legacy (H.263/H.261)**: 240p → 480p (limited by standard)
- **MPEG (1/2/4)**: 240p → 1080p
- **Image (MJPEG/J2K)**: 240p → 1080p+
- **Web (VP8/VP9)**: 240p → 1080p+ (VP9 supports 4K+)

## 🚀 **Additional Codecs Available in GStreamer**

### **Potentially Supportable (Not Yet Implemented)**
| Codec | Encoder | Payloader | Notes |
|-------|---------|-----------|-------|
| **AV1** | av1enc | rtpav1pay | Next-gen open codec (if available) |
| **DV** | dvenc | rtpdvpay | Digital Video format |
| **Raw Video** | identity | rtpvrawpay | Uncompressed video |
| **FFV1** | avenc_ffv1 | rtpgstpay | Lossless video codec |

### **Proprietary/Specialized**
- **Windows Media Video (WMV)**: Available via avenc_wmv*
- **RealVideo**: Legacy streaming format
- **Sorenson**: QuickTime codec
- **Cinepak**: Old multimedia codec

## 🎯 **Current Implementation Status**

✅ **Fully Implemented**: 13 video codecs across 4 server categories
✅ **Multiple resolutions**: 240p, 360p, 480p, 720p, 1080p
✅ **Variable framerates**: 10, 15, 20, 25, 30 fps
✅ **Audio support**: AAC, G.711, G.726, G.722, G.729
✅ **RTP payload types**: Both static and dynamic PT support
✅ **Bitrate optimization**: Codec-specific calculations

## 🔍 **Testing Commands**

```bash
# Modern codecs
ffprobe rtsp://localhost:8554/h264_720p_25fps
ffprobe rtsp://localhost:8554/h265_720p_25fps

# Legacy codecs  
ffprobe rtsp://localhost:8555/h263_360p_15fps
ffprobe rtsp://localhost:8555/mpeg4_480p_20fps
ffprobe rtsp://localhost:8555/mpeg2_720p_25fps

# Image codecs
ffprobe rtsp://localhost:8556/mjpeg_360p_15fps
ffprobe rtsp://localhost:8556/jpeg2000_480p_20fps

# Open source codecs
ffprobe rtsp://localhost:8557/theora_720p_25fps
ffprobe rtsp://localhost:8557/vp8_720p_25fps
ffprobe rtsp://localhost:8557/vp9_720p_25fps
```

This comprehensive implementation covers virtually all video codecs commonly used in RTSP streaming, from modern high-efficiency codecs to legacy compatibility formats.
