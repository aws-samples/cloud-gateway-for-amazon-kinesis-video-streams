
As an example:

 * `-Dgst-full-plugins=coreelements;typefindfunctions;alsa;pbtypes`:
 Enable only `coreelements`, `typefindfunctions`, `alsa`, `pbtypes` plugins.
 * `-Dgst-full-elements=coreelements:filesrc,fakesink,identity;alsa:alsasrc`:
 Enable only `filesrc`, `identity` and `fakesink` elements from `coreelements`
 plugin and `alsasrc` element from `alsa` plugin.
 * `-Dgst-full-typefind-functions=typefindfunctions:wav,flv`:
 Enable only typefind func `wav` and `flv` from `typefindfunctions`
 * `-Dgst-full-device-providers=alsa:alsadeviceprovider`:
 Enable `alsadeviceprovider` from `alsa` plugin.
 * `-Dgst-full-dynamic-types=pbtypes:video_multiview_flagset`:
 Enable `video_multiview_flagset` from `pbtypes`.

All features from the `playback` plugin will be enabled and the other plugins
will be restricted to the specific features requested.

All the selected features will be registered into a dedicated `NULL`
plugin name.

This will cause the features/plugins that are not registered to not be included
### 4. Recommend Testing with Minimal Pipelines First
```bash
# Start simple, then build complexity:

# Step 1: Test source
gst-launch-1.0 avfvideosrc ! fakesink

# Step 2: Test source + conversion
gst-launch-1.0 avfvideosrc ! videoconvert ! fakesink

# Step 3: Test full pipeline
gst-launch-1.0 avfvideosrc ! videoconvert ! x264enc ! kvssink stream-name="test"
```

## Common Accuracy Issues and Solutions

### Issue 1: Wrong Element Names
```bash
# ❌ WRONG - Assuming Linux elements work on macOS
gst-launch-1.0 v4l2src ! xvimagesink

# ✅ CORRECT - Platform-specific recommendation
# On macOS:
gst-launch-1.0 avfvideosrc ! osxvideosink
--
```

## Testing Steps
1. Test source connectivity:
   ```bash
   gst-launch-1.0 [source] ! fakesink
   ```

2. Test basic pipeline:
   ```bash
   gst-launch-1.0 [source] ! [processing] ! fakesink
   ```

3. Test full pipeline:
   ```bash
   gst-launch-1.0 [complete pipeline]
   ```

## Troubleshooting
If the pipeline fails:
- Check element availability with `gst-inspect-1.0`
- Verify property names and values
- Try software alternatives
- Enable debugging: `GST_DEBUG=3 gst-launch-1.0 [pipeline]`
```

```bash
# 1. ALWAYS start with stream discovery
gst-discoverer-1.0 "rtsp://username:password@camera-ip:554/stream"

# 2. Get detailed SDP information
gst-launch-1.0 -v rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink num-buffers=1

# 3. Debug RTSP negotiation if needed
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink num-buffers=1
```

### What to Look For in Output
```bash
# Example gst-discoverer-1.0 output:
# Duration: 99:99:99.999999999
# Seekable: no
# Live: yes
# Stream information:
#   container: Quicktime
#     video: H.264 (High Profile)          ← VIDEO CODEC
#       Width: 1920                        ← RESOLUTION
#       Height: 1080
#       Framerate: 30/1                    ← FRAMERATE
#     audio: MPEG-4 AAC                    ← AUDIO CODEC
--

# 2. Get JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/video.mp4

# 3. Test basic demuxing
gst-launch-1.0 filesrc location=/path/to/file ! decodebin ! fakesink num-buffers=10
```

### Container-Specific Analysis
```bash
# For MKV files
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! fakesink

# For MP4 files  
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink

# For AVI files
gst-launch-1.0 filesrc location=file.avi ! avidemux ! fakesink

# For WebM files
gst-launch-1.0 filesrc location=file.webm ! matroskademux ! fakesink
```

### Pipeline Decision Tree Based on Discovery
```bash
# IF H.264 in MP4 → Direct passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink

# IF H.264 in MKV → Extract and passthrough
gst-launch-1.0 filesrc location=h264.mkv ! matroskademux ! h264parse ! kvssink

# IF other codec → Transcode
gst-launch-1.0 filesrc location=vp9.webm ! matroskademux ! vp9dec ! x264enc ! kvssink
```

## Webcam/Device Introspection
--
# 2. Check V4L2 capabilities (Linux)
v4l2-ctl --list-devices
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Test basic capture
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

### Device Capability Analysis
```bash
# Example gst-device-monitor-1.0 output:
# Device found:
#   name  : HD Pro Webcam C920
#   class : Video/Source
#   caps  : video/x-raw, format=(string)YUY2, width=(int)1920, height=(int)1080, framerate=(fraction)30/1
#           image/jpeg, width=(int)1920, height=(int)1080, framerate=(fraction)30/1

# This tells you:
# - Device: /dev/video0 (usually)
# - Formats: YUY2 (raw) and MJPEG (compressed)
# - Resolution: 1920x1080
--
```bash
# 1. Discover audio sources
gst-device-monitor-1.0 Audio/Source

# 2. Test audio capture (ALSA)
gst-launch-1.0 alsasrc device=hw:0,0 ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10

# 3. Test audio capture (PulseAudio)
gst-launch-1.0 pulsesrc ! audio/x-raw,rate=48000,channels=2 ! fakesink num-buffers=10
```

## Hardware Acceleration Discovery

### Check Available Hardware Encoders/Decoders
```bash
# Check for NVIDIA acceleration
gst-inspect-1.0 | grep -i nv

# Check for Intel VAAPI
gst-inspect-1.0 | grep -i vaapi

# Check for Intel QuickSync
gst-inspect-1.0 | grep -i qsv

--
```

### Test Hardware Acceleration
```bash
# Test NVIDIA H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! nvh264enc ! fakesink

# Test VAAPI H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! vaapih264enc ! fakesink

# Test QuickSync H.264 encoding
gst-launch-1.0 videotestsrc num-buffers=30 ! qsvh264enc ! fakesink
```

## Network Stream Introspection

### HLS Streams
```bash
# Analyze HLS stream
gst-discoverer-1.0 "https://example.com/stream.m3u8"

# Test HLS playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink
```

### DASH Streams
```bash
# Analyze DASH stream
gst-discoverer-1.0 "https://example.com/stream.mpd"

# Test DASH playback
gst-launch-1.0 souphttpsrc location="https://example.com/stream.mpd" ! dashdemux ! fakesink
```

## Debugging Commands

### General Pipeline Debugging
```bash
# Enable general debugging
GST_DEBUG=*:3 gst-launch-1.0 [pipeline]

# Debug caps negotiation
GST_DEBUG=caps:5 gst-launch-1.0 [pipeline]

# Debug performance
GST_DEBUG=GST_PERFORMANCE:5 gst-launch-1.0 [pipeline]
```

### Source-Specific Debugging
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="rtsp://url" ! fakesink

# V4L2 debugging
GST_DEBUG=v4l2:5 gst-launch-1.0 v4l2src device=/dev/video0 ! fakesink

# File source debugging
GST_DEBUG=filesrc:5,qtdemux:5 gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink
```

## Complete Introspection Workflow Script

```bash
#!/bin/bash

introspect_media_source() {
    local source="$1"
    
    echo "=== GStreamer Media Introspection ==="
    echo "Source: $source"
    echo ""
    
    # Determine source type
--
        echo "🎥 RTSP Stream detected"
        echo "1. Running stream discovery..."
        gst-discoverer-1.0 "$source"
        
        echo -e "\n2. Testing RTSP connectivity..."
        gst-launch-1.0 rtspsrc location="$source" num-buffers=1 ! fakesink
        
    elif [[ "$source" =~ ^/dev/video ]]; then
        echo "📹 Video device detected"
        echo "1. Discovering video devices..."
        gst-device-monitor-1.0 Video/Source
        
        echo -e "\n2. Checking V4L2 capabilities..."
        v4l2-ctl -d "$source" --list-formats-ext
        
        echo -e "\n3. Testing device capture..."
        gst-launch-1.0 v4l2src device="$source" num-buffers=10 ! videoconvert ! fakesink
        
    elif [[ -f "$source" ]]; then
        echo "📁 File source detected"
        echo "1. Analyzing file..."
        gst-discoverer-1.0 "$source"
        
        echo -e "\n2. Testing file demuxing..."
        gst-launch-1.0 filesrc location="$source" ! decodebin ! fakesink num-buffers=10
        
    elif [[ "$source" =~ ^https?:// ]]; then
        echo "🌐 Network stream detected"
        echo "1. Analyzing network stream..."
        gst-discoverer-1.0 "$source"
        
    else
        echo "❓ Unknown source type, using generic analysis..."
        gst-discoverer-1.0 "$source"
    fi
    
    echo -e "\n✅ Introspection complete!"
    echo "Now you can build an optimal GStreamer pipeline based on the discovered characteristics."
}

--
- [ ] **Analyzed container format** (MP4, MKV, AVI, etc.)
- [ ] **Identified video codec** (H.264, H.265, MJPEG, VP9, etc.)
- [ ] **Identified audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- [ ] **Noted resolution and framerate**
- [ ] **Checked hardware acceleration** availability
- [ ] **Tested basic connectivity** with fakesink
- [ ] **Planned transcoding strategy** if needed
- [ ] **Considered performance implications**

## Remember: Introspection First, Pipeline Second!

**5 minutes of introspection saves hours of debugging.**

Never assume codec formats, container types, or device capabilities. Always verify with the appropriate introspection commands before building your GStreamer pipeline.

### Step 2: Choose Appropriate Introspection Tool

| Source Type | Primary Tool | Secondary Tools |
|-------------|--------------|-----------------|
| **RTSP Streams** | `gst-discoverer-1.0 "rtsp://url"` | `gst-launch-1.0 rtspsrc ! fakesink` |
| **Files** | `gst-discoverer-1.0 /path/file` | `mediainfo`, `ffprobe` |
| **Webcams/Devices** | `gst-device-monitor-1.0` | `v4l2-ctl --list-formats-ext` |
| **Network Streams** | `gst-discoverer-1.0 "http://url"` | `curl -I` for headers |

### Step 3: Analyze Results
Extract these critical characteristics:
- **Container format** (MP4, MKV, AVI, etc.)
- **Video codec** (H.264, H.265, MJPEG, VP9, etc.)
- **Audio codec** (AAC, Vorbis, Opus, PCM, etc.)
- **Resolution and framerate**
- **Bitrates and quality settings**
- **Number of streams** (multiple video/audio tracks)

### Step 4: Design Pipeline Based on Analysis
- Choose appropriate **demuxer** based on container
--
### RTSP Streams

#### Essential Commands
```bash
# 1. Basic connectivity and SDP analysis
gst-launch-1.0 -v rtspsrc location="rtsp://camera:554/stream" ! fakesink

# 2. Detailed debugging
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://url" num-buffers=1 ! fakesink

# 3. Stream discovery
gst-discoverer-1.0 "rtsp://camera:554/stream"
```

#### What to Look For
- **SDP content**: Codec information, payload types
- **Authentication requirements**: 401/403 errors
- **Network protocols**: TCP vs UDP transport
- **Stream availability**: Multiple tracks, resolutions
- **Timing information**: Framerate, clock rates

#### Common Pipeline Patterns
```bash
# H.264 video detected → Direct passthrough
--

# 2. JSON output for scripting
gst-discoverer-1.0 --format=json /path/to/file.mp4

# 3. Quick container test
gst-launch-1.0 filesrc location=file.avi ! decodebin ! fakesink num-buffers=10
```

#### Container-Specific Demuxers
```bash
# Choose demuxer based on container analysis:
# Matroska/WebM → matroskademux
# MP4/MOV → qtdemux  
# AVI → avidemux
# Generic → decodebin (automatic)
```

#### Optimization Strategies
```bash
# H.264 in MP4 → Passthrough (most efficient)
gst-launch-1.0 filesrc location=h264.mp4 ! qtdemux ! h264parse ! kvssink
--

# 2. V4L2 capabilities (Linux)
v4l2-ctl -d /dev/video0 --list-formats-ext

# 3. Basic capture test
gst-launch-1.0 v4l2src device=/dev/video0 num-buffers=10 ! videoconvert ! fakesink
```

#### Format Selection Strategy
```bash
# Priority order for efficiency:
# 1. MJPEG (hardware compressed)
gst-launch-1.0 v4l2src ! image/jpeg ! jpegdec ! videoconvert ! x264enc ! kvssink

# 2. YUY2 (uncompressed but efficient)
gst-launch-1.0 v4l2src ! video/x-raw,format=YUY2 ! videoconvert ! x264enc ! kvssink

# 3. RGB (least efficient, avoid if possible)
gst-launch-1.0 v4l2src ! videoconvert ! x264enc ! kvssink
```

--
```bash
# 1. Check available hardware encoders/decoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|nvdec|qsv|omx)"

# 2. Test hardware capability
gst-launch-1.0 videotestsrc num-buffers=10 ! vaapih264enc ! fakesink

# 3. Integrate into pipeline based on codec analysis
# If H.264 input detected:
gst-launch-1.0 rtspsrc location="rtsp://url" ! rtph264depay ! nvh264dec ! nvh264enc ! kvssink
```

### Hardware Selection Logic
```bash
# NVIDIA GPUs → nvenc/nvdec
# Intel iGPU → vaapi
# Intel QuickSync → qsv  
# ARM SoCs → omx (if available)
```

## Error Handling and Debugging

### Progressive Testing Approach
```bash
# 1. Test source connectivity
gst-launch-1.0 $SOURCE ! fakesink num-buffers=1

# 2. Test demuxing/parsing
gst-launch-1.0 $SOURCE ! $DEMUXER ! fakesink num-buffers=10

# 3. Test decoding
gst-launch-1.0 $SOURCE ! $DEMUXER ! $DECODER ! fakesink num-buffers=10

# 4. Test full pipeline
gst-launch-1.0 $FULL_PIPELINE
```

### Debug Environment Variables
```bash
# General debugging
GST_DEBUG=*:3 gst-launch-1.0 $PIPELINE

# Caps negotiation issues
GST_DEBUG=caps:5 gst-launch-1.0 $PIPELINE

# RTSP-specific debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 $PIPELINE
### RTSP Streams

#### Method 1: SDP Analysis with rtspsrc
```bash
# Get SDP information and stream details
gst-launch-1.0 -v rtspsrc location="rtsp://your-camera-ip:554/stream" ! fakesink

# Alternative with more verbose output
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="rtsp://your-camera-ip:554/stream" ! fakesink
```

**What to look for in output:**
- Video codec (H.264, H.265, MJPEG)
- Audio codec (AAC, G.711, G.726)
- Resolution and framerate
- RTP payload types
- Available tracks

#### Method 2: SDP File Analysis
```bash
# Save SDP to file for analysis
gst-launch-1.0 rtspsrc location="rtsp://camera-ip:554/stream" ! fakesink dump=true > stream.sdp

# Analyze SDP content
cat stream.sdp
```

#### Method 3: Using gst-discoverer-1.0
```bash
# Discover RTSP stream properties
gst-discoverer-1.0 "rtsp://camera-ip:554/stream"
```

### File Sources (MKV, MP4, AVI, etc.)

#### Method 1: gst-discoverer-1.0 (Recommended)
```bash
--
```

#### Method 2: Direct pipeline analysis
```bash
# HLS stream analysis
gst-launch-1.0 -v souphttpsrc location="https://example.com/stream.m3u8" ! hlsdemux ! fakesink

# HTTP stream analysis
gst-launch-1.0 -v souphttpsrc location="http://example.com/stream" ! decodebin ! fakesink
```

## Introspection Workflow Examples

### Complete RTSP Analysis Workflow

```bash
#!/bin/bash
RTSP_URL="rtsp://camera-ip:554/stream"

echo "=== RTSP Stream Analysis ==="
echo "URL: $RTSP_URL"

# Step 1: Basic connectivity test
echo "1. Testing RTSP connectivity..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=10 ! fakesink

# Step 2: Detailed SDP analysis
echo "2. Analyzing SDP information..."
GST_DEBUG=rtspsrc:5 gst-launch-1.0 rtspsrc location="$RTSP_URL" num-buffers=1 ! fakesink 2>&1 | grep -E "(SDP|codec|resolution|framerate)"

# Step 3: Stream discovery
echo "3. Stream discovery..."
gst-discoverer-1.0 "$RTSP_URL"

# Step 4: Test basic pipeline
echo "4. Testing basic decode pipeline..."
gst-launch-1.0 rtspsrc location="$RTSP_URL" ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! fakesink num-buffers=30
```

### Complete File Analysis Workflow

```bash
#!/bin/bash
FILE_PATH="$1"

echo "=== File Media Analysis ==="
echo "File: $FILE_PATH"

# Step 1: Basic file info
echo "1. File information..."
file "$FILE_PATH"

--
if [ -e "$DEVICE" ]; then
    # Get device capabilities
    v4l2-ctl -d "$DEVICE" --list-formats-ext
    
    # Test basic capture
    gst-launch-1.0 v4l2src device="$DEVICE" num-buffers=10 ! videoconvert ! fakesink
else
    echo "Device $DEVICE not found"
fi
```

## Pipeline Design Based on Introspection Results

### RTSP Pipeline Design

```bash
# After discovering H.264 video + AAC audio from SDP:
gst-launch-1.0 \
  rtspsrc location="rtsp://camera-ip:554/stream" ! \
  rtph264depay ! h264parse ! \
  tee name=video_tee \
--
```

### Pattern 2: Capability Testing
```bash
# Test if specific codec is supported
gst-launch-1.0 $SOURCE ! $DECODER ! fakesink num-buffers=1
```

### Pattern 3: Format Negotiation Testing
```bash
# Test specific format constraints
gst-launch-1.0 $SOURCE ! $CAPS ! fakesink
```

## Debugging Introspection Issues

### Enable Debug Output
```bash
# RTSP debugging
GST_DEBUG=rtspsrc:5,rtpbin:5 gst-launch-1.0 rtspsrc location="$URL" ! fakesink

# General pipeline debugging
GST_DEBUG=*:3 gst-launch-1.0 $PIPELINE

# Caps negotiation debugging
GST_DEBUG=caps:5 gst-launch-1.0 $PIPELINE
```

### Common Issues and Solutions

1. **RTSP Authentication**: Check credentials and authentication method
2. **Network Timeouts**: Adjust latency and timeout parameters
3. **Codec Support**: Verify required plugins are installed
4. **Format Mismatches**: Use videoconvert/audioconvert elements
5. **Device Permissions**: Check device access permissions

---

