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
--
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
--
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
