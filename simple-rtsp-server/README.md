# 🎥 GStreamer RTSP Test Server

A containerized GStreamer-based RTSP test server that generates multiple codec streams for testing RTSP clients and Lambda functions.

## 🎯 **Features**

- **Pure GStreamer**: Native RTSP server using GStreamer RTSP Server library
- **Multiple Codecs**: H.264, H.265/HEVC with different resolutions and framerates
- **Audio Support**: H.264 + AAC audio streams
- **Visual Overlays**: Each stream shows codec info, resolution, and timestamp
- **Docker Ready**: Containerized for easy deployment
- **Tested**: All streams verified working with SDP extraction

## 📺 **Available Streams**

- `rtsp://localhost:8554/h264_720p_30fps` - H.264 720p 30fps
- `rtsp://localhost:8554/h264_480p_15fps_smpte` - H.264 480p 15fps SMPTE bars
- `rtsp://localhost:8554/h264_1080p_25fps` - H.264 1080p 25fps
- `rtsp://localhost:8554/h265_720p_30fps` - H.265 720p 30fps
- `rtsp://localhost:8554/h264_audio_720p` - H.264 + AAC Audio
- `rtsp://localhost:8554/h264_240p_15fps` - H.264 240p low-res

## 🚀 **Quick Start**

```bash
# Start the RTSP server
docker-compose up -d

# Test all streams
python3 test-rtsp-streams.py

# View with VLC
vlc rtsp://localhost:8554/h264_720p_30fps
```

## 🧪 **Testing**

The included `test-rtsp-streams.py` script uses the same SDP extraction approach as the Lambda function to verify all streams are working:

```bash
python3 test-rtsp-streams.py
```

This will test all 6 streams and report their status, codec information, and any issues.

## 🏗️ **Architecture**

- **Base**: Ubuntu 22.04 with GStreamer 1.20
- **Server**: Python GStreamer RTSP Server
- **Streams**: Generated using GStreamer test sources with text overlays
- **Port**: 8554 (standard RTSP port)

## 📋 **Files**

- `Dockerfile` - Container definition with GStreamer and dependencies
- `docker-compose.yml` - Service configuration
- `rtsp-server.py` - Python GStreamer RTSP server implementation
- `test-rtsp-streams.py` - Stream testing tool using SDP extraction
- `README.md` - This documentation

Perfect for testing Lambda functions that extract SDP information and perform OpenCV frame capture from RTSP streams!
