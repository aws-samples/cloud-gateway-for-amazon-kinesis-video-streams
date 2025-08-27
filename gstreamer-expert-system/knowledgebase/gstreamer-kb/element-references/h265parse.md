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
