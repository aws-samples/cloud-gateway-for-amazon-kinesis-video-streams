    for format in "${formats[@]}"; do
        echo "Testing $format format..."
        if v4l2-ctl -d "$device" --list-formats | grep -q "$format"; then
            echo "✅ $format supported"
        else
            echo "❌ $format not supported"
        fi
    done
}

# Usage
analyze_video_device "/dev/video0"
```

### Optimal Pipeline Generator
```bash
