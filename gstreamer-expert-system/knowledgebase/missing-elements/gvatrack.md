# gvatrack

**Category:** OpenVINO DL Streamer - Object Tracking  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Tracks detected objects across video frames, assigning unique IDs and maintaining object trajectories. Essential for video analytics applications requiring object persistence.

## Properties
- **tracking-type** (string): Tracking algorithm (short-term, zero-term, short-term-imageless)
- **device** (string): Target device for tracking computations (CPU, GPU)
- **tracking-per-class** (boolean): Track objects separately per class (default: true)
- **max-num-objects** (uint): Maximum number of objects to track (default: 1000)
- **objects-history-size** (uint): Number of frames to keep in history (default: 10)

## Tracking Types
- **short-term**: Uses visual features for robust tracking
- **zero-term**: Simple overlap-based tracking (fastest)
- **short-term-imageless**: Feature-based without storing image patches

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Basic Object Tracking
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvatrack tracking-type=short-term ! \
  gvametaconvert format=json ! \
  filesink location=tracking.json
```

### Multi-class Tracking with Classification
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvadetect model=person-vehicle-detection.xml ! \
  gvaclassify model=vehicle-attributes.xml object-class=vehicle ! \
  gvatrack tracking-type=short-term tracking-per-class=true ! \
  gvawatermark ! \
  autovideosink
```

### High-Performance Zero-Term Tracking
```bash
gst-launch-1.0 \
  filesrc location=crowded-scene.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvatrack tracking-type=zero-term max-num-objects=500 ! \
  gvafpscounter ! \
  fakesink
```

### Tracking with History Analysis
```bash
gst-launch-1.0 \
  filesrc location=surveillance.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvatrack tracking-type=short-term objects-history-size=30 ! \
  gvametaconvert format=json-lines ! \
  filesink location=trajectories.jsonl
```

## Tracking Metadata
gvatrack adds tracking information to GVA metadata:
- **object_id**: Unique identifier for tracked object
- **tracking_status**: NEW, TRACKED, LOST
- **trajectory**: Historical positions (if enabled)

## Performance Considerations
- **zero-term**: Fastest, suitable for high frame rates
- **short-term**: More accurate, handles occlusions better
- **short-term-imageless**: Balance of speed and accuracy

## Common Use Cases
- People counting and flow analysis
- Vehicle tracking in traffic monitoring
- Sports analytics and player tracking
- Security and surveillance systems
- Retail customer behavior analysis

## Integration Patterns

### Detection → Tracking → Analytics
```bash
gvadetect → gvatrack → gvametaconvert → analytics
```

### Detection → Classification → Tracking
```bash
gvadetect → gvaclassify → gvatrack → visualization
```

## Troubleshooting
- High object loss: Increase objects-history-size
- Performance issues: Use zero-term tracking
- ID switching: Use short-term with appropriate max-num-objects

## Related Elements
- **gvadetect**: Object detection (required input)
- **gvaclassify**: Object classification
- **gvametaconvert**: Metadata extraction
- **gvawatermark**: Trajectory visualization
- **gvafpscounter**: Performance monitoring
