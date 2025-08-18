# Quick Stream Tester

A simplified version of the RTSP Stream Tester that provides easy access to test our demo RTSP streams.

## Features

### 🚀 **Simplified Interface**
- **Single Dropdown Selection**: Choose from 24 pre-configured test streams
- **No Manual Input Required**: All test server URLs are pre-populated
- **One-Click Testing**: Just select and click "Test Stream"

### 📺 **Available Test Streams**

The Quick Tester includes all streams from our RTSP test server:

#### **H.264 Streams**
- H.264 360p 15fps (No Audio)
- H.264 360p 15fps + AAC Audio
- H.264 480p 20fps (No Audio)
- H.264 720p 25fps (No Audio)

#### **H.265/HEVC Streams**
- H.265 360p 15fps (No Audio)
- H.265 360p 15fps + AAC Audio
- H.265 480p 20fps (No Audio)
- H.265 720p 25fps (No Audio)

#### **MPEG-2 Streams**
- MPEG-2 360p 15fps (No Audio)
- MPEG-2 360p 15fps + AAC Audio
- MPEG-2 480p 20fps (No Audio)
- MPEG-2 720p 25fps (No Audio)

#### **MPEG-4 Streams**
- MPEG-4 360p 15fps (No Audio)
- MPEG-4 360p 15fps + AAC Audio
- MPEG-4 480p 20fps (No Audio)
- MPEG-4 720p 25fps (No Audio)

#### **MJPEG Streams**
- MJPEG 360p 10fps (No Audio)
- MJPEG 360p 10fps + G.711 Audio
- MJPEG 480p 15fps (No Audio)
- MJPEG 720p 20fps (No Audio)

#### **Theora Streams**
- Theora 360p 15fps (No Audio)
- Theora 360p 15fps + AAC Audio
- Theora 480p 20fps (No Audio)
- Theora 720p 25fps (No Audio)

### 🔍 **Analysis Results**

For each selected stream, the Quick Tester provides:

1. **📹 Video Stream Analysis**
   - Codec detection (H.264, H.265, MPEG-2, MPEG-4, MJPEG, Theora)
   - Frame rate information
   - Bitrate details
   - Profile information (when available)

2. **🔊 Audio Stream Analysis**
   - Audio codec detection (AAC, G.711)
   - Sample rate information
   - Channel configuration

3. **🔗 Connection Details**
   - Authentication method
   - Connection timing
   - Error and warning counts

4. **📸 Frame Capture**
   - Live frame extraction from the stream
   - Visual preview of the video content
   - Frame metadata (resolution, size, format)

5. **⚙️ GStreamer Pipeline Recommendation**
   - AI-generated optimized pipeline
   - Ready-to-use GStreamer command
   - Optimized for the specific stream characteristics

### 🎯 **Use Cases**

- **Quick Testing**: Rapidly test different codec combinations
- **Codec Comparison**: Compare performance across different video codecs
- **Pipeline Generation**: Get optimized GStreamer pipelines for various formats
- **Demo Purposes**: Showcase the system capabilities with known-good streams
- **Development**: Test new features against a variety of stream types

### 🔧 **Technical Details**

- **Component**: `QuickStreamTester.tsx`
- **Location**: `frontend-app/src/components/`
- **Integration**: Added as new tab in main application
- **API Calls**: Uses same backend as full RTSP Stream Tester
- **Modes**: Supports both 'characteristics' and 'pipeline' analysis modes

### 🚀 **Getting Started**

1. Navigate to the "🚀 Quick Tester" tab in the application
2. Select a test stream from the dropdown menu
3. Click "🧪 Test Stream" to analyze the selected stream
4. View the comprehensive analysis results
5. Copy the generated GStreamer pipeline for your use

### 📊 **Differences from Full RTSP Stream Tester**

| Feature | Full Tester | Quick Tester |
|---------|-------------|--------------|
| RTSP URL Input | ✅ Manual entry | ❌ Dropdown only |
| Camera Name | ✅ Required field | ❌ Not needed |
| Stream Retention | ✅ Configurable | ❌ Not applicable |
| Custom URLs | ✅ Any RTSP URL | ❌ Pre-defined only |
| Test Server URLs | ✅ Supported | ✅ Primary focus |
| Analysis Results | ✅ Full analysis | ✅ Same analysis |
| Pipeline Generation | ✅ AI-powered | ✅ Same AI-powered |
| Frame Capture | ✅ Optional | ✅ Always enabled |

The Quick Tester is perfect for demonstrations, testing, and getting familiar with the system's capabilities using our reliable test streams.
