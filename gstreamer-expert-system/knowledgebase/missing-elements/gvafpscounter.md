# gvafpscounter

**Category:** OpenVINO DL Streamer - Performance Monitoring  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Measures and reports frames per second (FPS) and other performance metrics for GStreamer pipelines with OpenVINO inference. Essential for performance optimization and monitoring.

## Properties
- **interval** (uint): Reporting interval in seconds (default: 1)
- **starting-frame** (uint): Frame number to start counting from (default: 0)
- **log-level** (string): Logging level (INFO, DEBUG, WARNING, ERROR)

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Basic FPS Monitoring
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvafpscounter interval=2 ! \
  fakesink
```

### Performance Profiling Pipeline
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvafpscounter starting-frame=30 ! \
  gvadetect model=face-detection.xml device=GPU ! \
  gvafpscounter ! \
  gvaclassify model=age-gender.xml ! \
  gvafpscounter ! \
  autovideosink
```

### Batch Processing Performance
```bash
gst-launch-1.0 \
  filesrc location=test-video.mp4 ! \
  decodebin ! \
  gvadetect model=yolo-v5.xml batch-size=4 ! \
  gvafpscounter interval=5 log-level=INFO ! \
  gvatrack tracking-type=short-term ! \
  gvafpscounter ! \
  fakesink
```

### Comparative Performance Testing
```bash
# CPU inference
gst-launch-1.0 \
  filesrc location=benchmark.mp4 ! \
  decodebin ! \
  gvadetect model=detection.xml device=CPU ! \
  gvafpscounter ! \
  fakesink

# GPU inference  
gst-launch-1.0 \
  filesrc location=benchmark.mp4 ! \
  decodebin ! \
  gvadetect model=detection.xml device=GPU ! \
  gvafpscounter ! \
  fakesink
```

## Output Metrics

### Standard Metrics
- **FPS**: Frames processed per second
- **Frame Count**: Total frames processed
- **Elapsed Time**: Processing duration
- **Average FPS**: Overall average performance

### Example Output
```
[INFO] gvafpscounter: fps=25.3, frames=253, elapsed_time=10.0s, avg_fps=25.3
[INFO] gvafpscounter: fps=24.8, frames=501, elapsed_time=20.0s, avg_fps=25.05
```

## Performance Analysis Patterns

### Pipeline Bottleneck Detection
```bash
source → fpscounter → detect → fpscounter → classify → fpscounter → sink
```
Compare FPS at each stage to identify bottlenecks.

### Device Performance Comparison
```bash
# Test different devices
device=CPU → fpscounter
device=GPU → fpscounter  
device=MYRIAD → fpscounter
```

### Batch Size Optimization
```bash
# Test different batch sizes
batch-size=1 → fpscounter
batch-size=2 → fpscounter
batch-size=4 → fpscounter
```

## Integration with Monitoring

### Log File Output
```bash
gst-launch-1.0 ... gvafpscounter ! ... 2>&1 | tee performance.log
```

### Real-time Monitoring
```bash
gst-launch-1.0 ... gvafpscounter interval=1 ! ... | grep fps
```

## Common Use Cases
- Performance benchmarking
- Pipeline optimization
- Resource utilization monitoring
- Regression testing
- Production monitoring

## Performance Tips
- Place counters at key pipeline stages
- Use appropriate intervals (1-5 seconds)
- Consider starting-frame for warm-up periods
- Monitor both instantaneous and average FPS

## Troubleshooting Performance Issues

### Low FPS Indicators
- High model complexity
- Insufficient hardware resources
- Suboptimal batch sizes
- Memory bandwidth limitations

### Optimization Strategies
- Reduce model complexity
- Increase batch size
- Use hardware acceleration
- Optimize preprocessing

## Related Elements
- **gvadetect**: Object detection performance
- **gvaclassify**: Classification performance
- **gvainference**: Generic inference performance
- **gvatrack**: Tracking performance
- **gvawatermark**: Visualization overhead
