# gvadetect

**Category:** OpenVINO DL Streamer - Object Detection  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Performs object detection using OpenVINO inference engine. Detects objects in video frames using pre-trained deep learning models.

## Properties
- **model** (string): Path to OpenVINO model file (.xml)
- **model-proc** (string): Path to model processing configuration file
- **device** (string): Target device (CPU, GPU, MYRIAD, HDDL)
- **batch-size** (uint): Number of frames to process in batch (default: 1)
- **nireq** (uint): Number of inference requests (default: 1)
- **threshold** (double): Detection confidence threshold (0.0-1.0, default: 0.5)
- **labels** (string): Path to labels file
- **pre-process-backend** (string): Pre-processing backend (opencv, openvino)

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Basic Object Detection
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-vehicle-bike-detection.xml device=CPU ! \
  gvametaconvert format=json ! \
  filesink location=detections.json
```

### GPU Acceleration with Custom Threshold
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvadetect model=face-detection.xml device=GPU threshold=0.7 ! \
  gvawatermark ! \
  autovideosink
```

### Batch Processing
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=yolo-v3.xml batch-size=4 nireq=2 ! \
  gvatrack ! \
  fakesink
```

## Common Use Cases
- Real-time object detection in video streams
- Security and surveillance applications
- Autonomous vehicle perception
- Retail analytics
- Industrial quality control

## Performance Tips
- Use GPU device for better performance with complex models
- Increase batch-size for higher throughput (at cost of latency)
- Use NIREQ > 1 for better CPU utilization
- Consider model optimization with OpenVINO Model Optimizer

## Related Elements
- **gvaclassify**: Object classification
- **gvainference**: Generic inference
- **gvatrack**: Object tracking
- **gvametaconvert**: Metadata conversion
- **gvawatermark**: Visualization overlay
