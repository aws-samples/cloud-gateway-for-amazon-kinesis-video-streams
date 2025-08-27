# File Source Introspection Examples

## Essential File Analysis Commands

### 1. GStreamer Discovery (Primary Method)
```bash
# Basic file analysis
gst-discoverer-1.0 /path/to/video.mkv

# Verbose output with detailed information
gst-discoverer-1.0 -v /path/to/video.mkv

# JSON output for programmatic parsing
gst-discoverer-1.0 /path/to/video.mkv --format=json

# Example output interpretation:
# Duration: 0:02:30.045000000
# Seekable: yes
# Live: no
# Tags: 
#   video codec: H.264 / AVC
#   audio codec: Vorbis
#   container format: Matroska
# Stream information:
#   container: Matroska
#     video: H.264 (High Profile)
#       Width: 1920, Height: 1080
#       Framerate: 30/1
#       Bitrate: 5000000
#     audio: Vorbis
#       Channels: 2 (front-left, front-right)
#       Sample rate: 48000
```

### 2. MediaInfo Analysis (if available)
```bash
# Comprehensive media information
mediainfo /path/to/video.mkv

# JSON output
mediainfo --Output=JSON /path/to/video.mkv

# XML output
mediainfo --Output=XML /path/to/video.mkv

# Custom output template
mediainfo --Inform="Video;%Format% %Width%x%Height% %FrameRate%fps %BitRate%bps" /path/to/video.mkv
```

### 3. FFprobe Analysis (if available)
```bash
# Stream information
ffprobe -v quiet -print_format json -show_format -show_streams /path/to/video.mkv

# Specific stream info
ffprobe -v quiet -select_streams v:0 -show_entries stream=codec_name,width,height,r_frame_rate /path/to/video.mkv
```

## Real-World File Examples

### Example 1: MKV with H.264 + Vorbis Audio
```bash
# Discovery command
gst-discoverer-1.0 sample.mkv

# Typical output:
# Duration: 0:05:23.456000000
# Seekable: yes
# Stream information:
#   container: Matroska
#     video: H.264 (High Profile)
#       Width: 1920, Height: 1080
#       Framerate: 24/1
#       Bitrate: 8000000
#     audio: Vorbis
#       Channels: 2
#       Sample rate: 48000
#       Bitrate: 320000

# Optimal pipeline based on discovery:
gst-launch-1.0 \
  filesrc location=sample.mkv ! \
  matroskademux name=demux \
  demux.video_0 ! h264parse ! \
  kvssink stream-name="mkv-video" aws-region="us-east-1" \
  demux.audio_0 ! vorbisparse ! vorbisdec ! \
  audioconvert ! voaacenc bitrate=128000 ! aacparse ! \
  kvssink stream-name="mkv-audio" aws-region="us-east-1"
```

### Example 2: MP4 with H.264 + AAC
```bash
# Discovery shows:
# container: Quicktime
#   video: H.264 (Main Profile)
#     Width: 1280, Height: 720
#     Framerate: 30/1
#   audio: MPEG-4 AAC
#     Channels: 2
#     Sample rate: 44100

# Optimal pipeline (direct passthrough):
gst-launch-1.0 \
  filesrc location=sample.mp4 ! \
  qtdemux name=demux \
  demux.video_0 ! h264parse ! \
  kvssink stream-name="mp4-stream" aws-region="us-east-1"
```

### Example 3: AVI with MJPEG + PCM Audio
```bash
# Discovery shows:
# container: AVI
#   video: Motion JPEG
#     Width: 640, Height: 480
#     Framerate: 15/1
#   audio: PCM
#     Channels: 1
#     Sample rate: 22050

# Pipeline with transcoding needed:
gst-launch-1.0 \
  filesrc location=sample.avi ! \
  avidemux name=demux \
  demux.video_0 ! jpegdec ! videoconvert ! \
  x264enc bitrate=1500 ! h264parse ! \
  mux.video_0 \
  demux.audio_0 ! audioconvert ! \
  voaacenc bitrate=64000 ! aacparse ! \
  mux.audio_0 \
  mp4mux name=mux ! \
  kvssink stream-name="avi-transcoded"
```

### Example 4: WebM with VP9 + Opus
```bash
# Discovery shows:
# container: WebM
#   video: VP9
#     Width: 1920, Height: 1080
#     Framerate: 60/1
#   audio: Opus
#     Channels: 2
#     Sample rate: 48000

# Pipeline with VP9 to H.264 transcoding:
gst-launch-1.0 \
  filesrc location=sample.webm ! \
  matroskademux name=demux \
  demux.video_0 ! vp9dec ! videoconvert ! \
  x264enc bitrate=6000 tune=zerolatency ! h264parse ! \
  mux.video_0 \
  demux.audio_0 ! opusdec ! audioconvert ! \
  voaacenc bitrate=128000 ! aacparse ! \
  mux.audio_0 \
  mp4mux name=mux ! \
  kvssink stream-name="webm-transcoded"
```

## Container-Specific Analysis

### Matroska/MKV Files
```bash
# Detailed MKV analysis
gst-discoverer-1.0 -v file.mkv | grep -E "(codec|container|bitrate|resolution)"

# Test demuxing
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! fakesink

# Check for multiple video/audio tracks
gst-launch-1.0 -v filesrc location=file.mkv ! matroskademux name=d d. ! fakesink d. ! fakesink
```

### MP4/MOV Files
```bash
# MP4 structure analysis
gst-discoverer-1.0 file.mp4

# Test QuickTime demuxing
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! fakesink

# Check for fragmented MP4
mediainfo file.mp4 | grep -i fragment
```

### AVI Files
```bash
# AVI analysis (often has compatibility issues)
gst-discoverer-1.0 file.avi

# Test AVI demuxing
gst-launch-1.0 filesrc location=file.avi ! avidemux ! fakesink

# Check for AVI index issues
gst-launch-1.0 filesrc location=file.avi ! avidemux ! videoconvert ! fakesink
```

### WebM Files
```bash
# WebM analysis
gst-discoverer-1.0 file.webm

# Test WebM demuxing (uses Matroska demuxer)
gst-launch-1.0 filesrc location=file.webm ! matroskademux ! fakesink
```

## Automated File Analysis Scripts

### Comprehensive File Analyzer
```bash
#!/bin/bash

analyze_media_file() {
    local file_path="$1"
    
    if [ ! -f "$file_path" ]; then
        echo "❌ File not found: $file_path"
        return 1
    fi
    
    echo "=== Media File Analysis: $(basename "$file_path") ==="
    
    # Basic file info
    echo "1. File Information:"
    file "$file_path"
    ls -lh "$file_path"
    
    echo -e "\n2. GStreamer Discovery:"
    gst-discoverer-1.0 "$file_path"
    
    echo -e "\n3. Container Test:"
    echo "Testing container demuxing..."
    if gst-launch-1.0 filesrc location="$file_path" ! decodebin ! fakesink num-buffers=10 >/dev/null 2>&1; then
        echo "✅ Container demuxing works"
    else
        echo "❌ Container demuxing failed"
    fi
    
    echo -e "\n4. Codec Analysis:"
    local discovery_output=$(gst-discoverer-1.0 "$file_path" 2>/dev/null)
    
    # Extract video codec
    local video_codec=$(echo "$discovery_output" | grep -i "video.*:" | head -1)
    if [ -n "$video_codec" ]; then
        echo "Video: $video_codec"
    fi
    
    # Extract audio codec  
    local audio_codec=$(echo "$discovery_output" | grep -i "audio.*:" | head -1)
    if [ -n "$audio_codec" ]; then
        echo "Audio: $audio_codec"
    fi
    
    echo -e "\n5. MediaInfo (if available):"
    if command -v mediainfo >/dev/null 2>&1; then
        mediainfo "$file_path" | head -20
    else
        echo "MediaInfo not available"
    fi
}

# Usage
analyze_media_file "$1"
```

### Pipeline Generator Based on File Analysis
```bash
#!/bin/bash

generate_file_pipeline() {
    local file_path="$1"
    local stream_name="${2:-file-stream}"
    local output_type="${3:-kvs}"  # kvs, file, display
    
    echo "Analyzing file: $file_path"
    
    # Get file analysis
    local discovery_output=$(gst-discoverer-1.0 "$file_path" 2>/dev/null)
    
    # Extract container type
    local container=$(echo "$discovery_output" | grep "container:" | head -1 | awk '{print $2}')
    
    # Extract video codec
    local video_codec=$(echo "$discovery_output" | grep -i "video.*:" | head -1)
    
    # Extract audio codec
    local audio_codec=$(echo "$discovery_output" | grep -i "audio.*:" | head -1)
    
    echo "Detected:"
    echo "  Container: $container"
    echo "  Video: $video_codec"
    echo "  Audio: $audio_codec"
    echo ""
    
    # Generate appropriate demuxer
    local demuxer=""
    case "$container" in
        "Matroska"|"WebM")
            demuxer="matroskademux"
            ;;
        "Quicktime"|"MP4")
            demuxer="qtdemux"
            ;;
        "AVI")
            demuxer="avidemux"
            ;;
        *)
            demuxer="decodebin"
            ;;
    esac
    
    # Generate pipeline based on codecs and output type
    echo "Generated Pipeline:"
    
    if echo "$video_codec" | grep -qi "h.264\|avc" && [ "$output_type" = "kvs" ]; then
        # H.264 passthrough to KVS
        echo "# H.264 passthrough (optimal for KVS)"
        echo "gst-launch-1.0 \\"
        echo "  filesrc location=\"$file_path\" ! \\"
        echo "  $demuxer name=demux \\"
        echo "  demux.video_0 ! h264parse ! \\"
        echo "  kvssink stream-name=\"$stream_name\" aws-region=\"us-east-1\""
        
    elif echo "$video_codec" | grep -qi "h.265\|hevc" && [ "$output_type" = "kvs" ]; then
        # H.265 to H.264 transcoding for KVS
        echo "# H.265 to H.264 transcoding"
        echo "gst-launch-1.0 \\"
        echo "  filesrc location=\"$file_path\" ! \\"
        echo "  $demuxer name=demux \\"
        echo "  demux.video_0 ! h265parse ! avdec_h265 ! \\"
        echo "  videoconvert ! x264enc bitrate=4000 ! h264parse ! \\"
        echo "  kvssink stream-name=\"$stream_name\" aws-region=\"us-east-1\""
        
    elif [ "$output_type" = "display" ]; then
        # Simple playback
        echo "# Playback pipeline"
        echo "gst-launch-1.0 \\"
        echo "  filesrc location=\"$file_path\" ! \\"
        echo "  decodebin ! videoconvert ! autovideosink"
        
    else
        # Generic transcoding pipeline
        echo "# Generic transcoding pipeline"
        echo "gst-launch-1.0 \\"
        echo "  filesrc location=\"$file_path\" ! \\"
        echo "  decodebin name=decode \\"
        echo "  decode. ! videoconvert ! x264enc bitrate=3000 ! h264parse ! \\"
        echo "  mux.video_0 \\"
        echo "  decode. ! audioconvert ! voaacenc bitrate=128000 ! aacparse ! \\"
        echo "  mux.audio_0 \\"
        echo "  mp4mux name=mux ! \\"
        echo "  filesink location=\"transcoded_$(basename "$file_path" .${file_path##*.}).mp4\""
    fi
}

# Usage examples:
# generate_file_pipeline "video.mkv" "my-stream" "kvs"
# generate_file_pipeline "video.avi" "test-stream" "display"
# generate_file_pipeline "video.webm" "transcode-stream" "file"
```

## Format-Specific Considerations

### H.264 Files
```bash
# Check H.264 profile and level
gst-discoverer-1.0 file.mp4 | grep -i profile

# Test H.264 parsing
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! h264parse ! fakesink

# Direct H.264 to KVS (most efficient)
gst-launch-1.0 filesrc location=file.mp4 ! qtdemux ! h264parse ! kvssink stream-name="h264-stream"
```

### MJPEG Files
```bash
# MJPEG requires decoding for KVS
gst-launch-1.0 \
  filesrc location=mjpeg.avi ! avidemux ! \
  jpegdec ! videoconvert ! \
  x264enc bitrate=2000 ! h264parse ! \
  kvssink stream-name="mjpeg-transcoded"
```

### VP8/VP9 Files
```bash
# VP8/VP9 requires transcoding for KVS
gst-launch-1.0 \
  filesrc location=video.webm ! matroskademux ! \
  vp9dec ! videoconvert ! \
  x264enc bitrate=4000 ! h264parse ! \
  kvssink stream-name="vp9-transcoded"
```

## Performance Optimization

### Hardware Acceleration Detection
```bash
# Check for hardware encoders
gst-inspect-1.0 | grep -E "(vaapi|nvenc|qsv|omx)"

# Use hardware encoding when available
gst-launch-1.0 \
  filesrc location=input.mkv ! matroskademux ! \
  h264parse ! avdec_h264 ! \
  vaapih264enc bitrate=4000 ! h264parse ! \
  kvssink stream-name="hw-accelerated"
```

### Memory and CPU Optimization
```bash
# Add queues for better performance
gst-launch-1.0 \
  filesrc location=large_file.mkv ! \
  matroskademux name=demux \
  demux.video_0 ! queue max-size-buffers=100 ! \
  h264parse ! kvssink stream-name="buffered-stream"

# Use multiple threads for encoding
gst-launch-1.0 \
  filesrc location=input.avi ! avidemux ! \
  jpegdec ! videoconvert ! \
  x264enc threads=4 bitrate=4000 ! h264parse ! \
  kvssink stream-name="multithreaded"
```

## Common File Issues and Solutions

### Issue 1: Unsupported Container
```bash
# Problem: Unknown container format
# Solution: Use decodebin for automatic detection
gst-launch-1.0 filesrc location=unknown.file ! decodebin ! videoconvert ! autovideosink
```

### Issue 2: Codec Not Supported
```bash
# Problem: Missing codec plugins
# Solution: Install additional plugins
sudo apt-get install gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly gstreamer1.0-libav

# Check available decoders
gst-inspect-1.0 | grep -i decoder
```

### Issue 3: Seeking Issues
```bash
# Problem: File not seekable or corrupted index
# Solution: Use progressive download or re-index
gst-launch-1.0 filesrc location=file.avi ! avidemux ! videoconvert ! autovideosink

# For streaming without seeking
gst-launch-1.0 filesrc location=file.mkv ! matroskademux ! h264parse ! kvssink stream-name="no-seek"
```

### Issue 4: Large File Performance
```bash
# Problem: High memory usage with large files
# Solution: Use appropriate buffer sizes
gst-launch-1.0 \
  filesrc location=large_file.mkv blocksize=65536 ! \
  queue max-size-bytes=1048576 ! \
  matroskademux ! h264parse ! \
  kvssink stream-name="optimized-large-file"
```

## Best Practices Summary

1. **ALWAYS analyze files first** with gst-discoverer-1.0
2. **Check container format** to choose appropriate demuxer
3. **Identify codecs** to determine if transcoding is needed
4. **Test demuxing** before building complex pipelines
5. **Use passthrough** when possible (H.264 → KVS)
6. **Consider hardware acceleration** for transcoding
7. **Add appropriate queues** for performance
8. **Handle audio streams** appropriately for your use case
9. **Test with sample files** before production deployment
10. **Monitor performance** and adjust buffer sizes as needed

This comprehensive file introspection approach ensures optimal pipeline construction and minimal transcoding overhead.
