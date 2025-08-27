# gvawatermark

**Category:** OpenVINO DL Streamer - Visualization  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Renders detection results, classifications, and tracking information as visual overlays on video frames. Essential for debugging and demonstration of inference results.

## Properties
- **device** (string): Rendering device (CPU, GPU)
- **labels** (string): Path to labels file for class names
- **show-fps** (boolean): Display FPS counter (default: false)
- **font-scale** (double): Text font scale factor (default: 0.5)
- **font-thickness** (uint): Text line thickness (default: 1)
- **font-color** (string): Text color in BGR format (default: "255,255,255")

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Basic Detection Visualization
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvawatermark labels=coco-labels.txt ! \
  autovideosink
```

### Tracking Visualization with FPS
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvadetect model=face-detection.xml ! \
  gvatrack tracking-type=short-term ! \
  gvawatermark show-fps=true font-scale=0.7 ! \
  autovideosink
```

### Classification Results Display
```bash
gst-launch-1.0 \
  filesrc location=vehicles.mp4 ! \
  decodebin ! \
  gvadetect model=vehicle-detection.xml ! \
  gvaclassify model=vehicle-attributes.xml ! \
  gvawatermark labels=vehicle-labels.txt \
               font-color="0,255,0" \
               font-thickness=2 ! \
  filesink location=annotated.mp4
```

### Multi-stage Pipeline Visualization
```bash
gst-launch-1.0 \
  filesrc location=crowd.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvaclassify model=age-gender.xml ! \
  gvatrack tracking-type=short-term ! \
  gvawatermark show-fps=true labels=person-labels.txt ! \
  x264enc ! \
  mp4mux ! \
  filesink location=analyzed.mp4
```

## Visualization Features

### Bounding Boxes
- Colored rectangles around detected objects
- Different colors for different classes
- Confidence scores displayed

### Object IDs
- Unique tracking IDs for persistent objects
- Trajectory lines (if tracking enabled)
- Object state indicators

### Classification Labels
- Class names and confidence scores
- Multiple attributes per object
- Customizable text formatting

### Performance Metrics
- FPS counter
- Processing time indicators
- Memory usage (if available)

## Customization Options

### Color Schemes
```bash
# Green text
font-color="0,255,0"

# Red text  
font-color="0,0,255"

# Yellow text
font-color="0,255,255"
```

### Text Formatting
```bash
# Large, bold text
font-scale=1.0 font-thickness=3

# Small, thin text
font-scale=0.3 font-thickness=1
```

## Performance Impact
- Minimal CPU overhead for basic overlays
- GPU acceleration available for complex scenes
- Consider disabling for production pipelines

## Common Use Cases
- Development and debugging
- Demo and presentation videos
- Quality assurance testing
- Real-time monitoring displays
- Training data validation

## Integration Patterns

### Debug Pipeline
```bash
source → detect → classify → track → watermark → display
```

### Production with Optional Visualization
```bash
source → detect → track → tee → [watermark → display]
                              → [metadata → analytics]
```

## Related Elements
- **gvadetect**: Provides detection metadata
- **gvaclassify**: Provides classification metadata  
- **gvatrack**: Provides tracking metadata
- **gvametaconvert**: Alternative metadata output
- **gvafpscounter**: Performance monitoring
