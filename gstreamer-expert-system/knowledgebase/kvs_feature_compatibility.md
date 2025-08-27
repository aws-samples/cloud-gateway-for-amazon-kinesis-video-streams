# AWS Kinesis Video Streams Feature Compatibility Guide

## Overview

AWS Kinesis Video Streams supports multiple playback and processing features, each with specific requirements for media format, codecs, and track configuration. This guide provides comprehensive compatibility information based on official AWS documentation.

## Supported Features and Requirements

### HLS (HTTP Live Streaming) Playback

#### HLS MP4 Format Support
| Track 1 | Track 1 Codec | Track 2 | Track 2 Codec | Status |
|---------|---------------|---------|---------------|--------|
| H.264 video | V_MPEG/ISO/AVC | N/A | N/A | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | AAC audio | A_AAC | ✅ Supported |
| AAC audio | A_AAC | N/A | N/A | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | N/A | N/A | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | AAC audio | A_AAC | ✅ Supported |

#### HLS TS Format Support
| Track 1 | Track 1 Codec | Track 2 | Track 2 Codec | Status |
|---------|---------------|---------|---------------|--------|
| H.264 video | V_MPEG/ISO/AVC | N/A | N/A | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | AAC audio | A_AAC | ✅ Supported |
| AAC audio | A_AAC | N/A | N/A | ✅ Supported |

#### GStreamer Pipeline Examples for HLS
```bash
# H.264 + AAC for HLS playback (MP4 format)
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! kvssink name=sink stream-name=hls-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# H.265 + AAC for HLS playback (MP4 format)
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! kvssink name=sink stream-name=hls-h265-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# Audio-only HLS stream
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! \
  kvssink stream-name=audio-only-hls

# Video-only HLS stream
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  kvssink stream-name=video-only-hls
```

### DASH (Dynamic Adaptive Streaming) Playback

#### DASH Format Support
| Track 1 | Track 1 Codec | Track 2 | Track 2 Codec | Status |
|---------|---------------|---------|---------------|--------|
| H.264 video | V_MPEG/ISO/AVC | N/A | N/A | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | AAC audio | A_AAC | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | G.711 A-Law | A_MS/ACM | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | G.711 U-Law | A_MS/ACM | ✅ Supported |
| AAC audio | A_AAC | N/A | N/A | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | N/A | N/A | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | AAC audio | A_AAC | ✅ Supported |

#### GStreamer Pipeline Examples for DASH
```bash
# H.264 + AAC for DASH playback
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! kvssink name=sink stream-name=dash-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# H.265 + AAC for DASH playback
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! kvssink name=sink stream-name=dash-h265-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# G.711 audio with H.264 video for DASH
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! kvssink name=sink stream-name=dash-g711-test \
  src. ! application/x-rtp,media=audio,encoding-name=PCMA ! queue ! rtppcmadepay ! sink.
```

### GetClip API

#### GetClip Format Support
| Track 1 | Track 1 Codec | Track 2 | Track 2 Codec | Status |
|---------|---------------|---------|---------------|--------|
| H.264 video | V_MPEG/ISO/AVC | N/A | N/A | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | AAC audio | A_AAC | ✅ Supported |
| H.264 video | V_MPEG/ISO/AVC | G.711 A-Law | A_MS/ACM | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | N/A | N/A | ✅ Supported |
| H.265 video | V_MPEGH/ISO/HEVC | AAC audio | A_AAC | ✅ Supported |

#### GStreamer Pipeline Examples for GetClip
```bash
# H.264 + AAC optimized for GetClip API
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! \
  kvssink name=sink stream-name=getclip-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# H.265 + AAC for GetClip API
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! \
  kvssink name=sink stream-name=getclip-h265-test \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# Video-only for GetClip API
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  kvssink stream-name=getclip-video-only
```

## Critical Requirements and Limitations

### Codec Private Data (CPD) Consistency
**Requirement**: Codec parameters must remain consistent throughout the stream
**Impact**: Affects all playback features (HLS, DASH, GetClip)

```bash
# Ensure consistent encoder settings
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  x264enc bitrate=2000 key-int-max=30 ! h264parse ! \
  kvssink stream-name=consistent-params

# Avoid dynamic parameter changes
# ❌ BAD: Changing bitrate mid-stream
# ✅ GOOD: Fixed encoder parameters
```

### Track Consistency
**Requirement**: Track structure must remain consistent (no switching between audio+video and video-only)
**Impact**: Streaming will fail if track structure changes

```bash
# ✅ GOOD: Consistent multi-track throughout
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! kvssink name=sink \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.

# ✅ GOOD: Consistent single-track throughout  
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  kvssink stream-name=video-only

# ❌ BAD: Cannot switch between single and multi-track mid-stream
```

### Unsupported Codecs
**VP8/VP9/AV1**: Not supported by HLS/DASH/GetClip playback features

```bash
# ❌ NOT SUPPORTED for playback features
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtpvp8depay ! vp8parse ! \
  kvssink stream-name=vp8-stream  # Will ingest but won't play back

# ✅ SUPPORTED alternatives
gst-launch-1.0 rtspsrc location=rtsp://camera ! \
  application/x-rtp,media=video ! rtph264depay ! h264parse ! \
  kvssink stream-name=h264-stream  # Will ingest and play back
```

## Feature-Specific Optimization

### HLS Playback Optimization
```bash
# Optimize for HLS with consistent GOP structure
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! \
  x264enc bitrate=2000 key-int-max=30 bframes=0 ! h264parse ! \
  kvssink name=sink stream-name=hls-optimized \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.
```

### DASH Playback Optimization
```bash
# Optimize for DASH with adaptive bitrate considerations
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! \
  x264enc bitrate=1500 key-int-max=60 ! h264parse ! \
  kvssink name=sink stream-name=dash-optimized \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.
```

### GetClip API Optimization
```bash
# Optimize for GetClip with precise timestamps
gst-launch-1.0 rtspsrc location=rtsp://camera name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph264depay ! h264parse ! \
  x264enc bitrate=2000 key-int-max=30 ! h264parse ! \
  kvssink name=sink stream-name=getclip-optimized \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! sink.
```

## Troubleshooting Common Issues

### HLS/DASH Playback Failures
**Symptom**: Stream ingests successfully but won't play in browser
**Common Causes**:
1. Unsupported codec (VP8/VP9/AV1)
2. Inconsistent codec parameters
3. Track structure changes

**Diagnostic Commands**:
```bash
# Check stream format
aws kinesisvideo describe-stream --stream-name your-stream-name

# Test HLS endpoint
curl -I "$(aws kinesisvideo get-data-endpoint --stream-name your-stream-name --api-name GET_HLS_STREAMING_SESSION_URL --query DataEndpoint --output text)/hls/v1/getHLSMasterPlaylist.m3u8"
```

### GetClip API Failures
**Symptom**: GetClip requests return errors or incomplete clips
**Common Causes**:
1. Inconsistent timestamps
2. Missing keyframes
3. Codec parameter changes

**Diagnostic Commands**:
```bash
# Test GetClip API
aws kinesis-video-archived-media get-clip \
  --stream-name your-stream-name \
  --clip-fragment-selector FragmentSelectorType=SERVER_TIMESTAMP,TimestampRange='{StartTimestamp=2023-01-01T00:00:00Z,EndTimestamp=2023-01-01T00:01:00Z}' \
  output.mp4
```

This comprehensive guide ensures GStreamer pipelines are properly configured for all KVS playback features based on official AWS documentation.
