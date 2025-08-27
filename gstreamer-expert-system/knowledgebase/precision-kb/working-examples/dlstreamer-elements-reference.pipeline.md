gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! gvadetect model=person-detection.xml device=CPU ! gvawatermark ! videoconvert ! autovideosink
```

### gvaclassify  
Classification element for detected objects.
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! gvadetect model=face-detection.xml ! gvaclassify model=age-gender.xml object-class=face ! gvawatermark ! videoconvert ! autovideosink
```

### gvainference
Generic inference element for custom models.

**Properties:**
- model: Path to the inference model
- device: Inference device
- pre-process-backend: Preprocessing backend (opencv, gstreamer, vaapi)
- inference-region: Region for inference (full-frame, roi-list)

### gvatrack
Multi-object tracking element.

**Properties:**
- tracking-type: Tracking algorithm (short-term, zero-term)
- device: Device for tracking computations

### gvawatermark
Visualization element for drawing bounding boxes and labels.

**Properties:**
- device: Device for rendering

### gvametaconvert
Converts GVA metadata to JSON format.

**Properties:**
- format: Output format (json, json-lines)
- source: Metadata source

### gvametapublish
Publishes inference results to external systems.

**Properties:**
- method: Publishing method (mqtt, kafka, file)
- address: Target address/file path
- topic: Topic name (for MQTT/Kafka)

## Pipeline Patterns

### Basic Object Detection
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-vehicle-bike-detection.xml device=CPU ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Detection + Classification
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=face-detection.xml device=CPU ! \
  gvaclassify model=age-gender.xml object-class=face ! \
  gvaclassify model=emotions.xml object-class=face ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Multi-Stream Processing
```bash
gst-launch-1.0 \
  uridecodebin uri=rtsp://camera1 name=src1 ! \
  gvadetect model=person-detection.xml device=CPU ! \
  gvatrack ! \
  gvawatermark ! \
  videoconvert ! \
  autovideosink
```

### Metadata Publishing
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvametaconvert format=json ! \
  gvametapublish method=file file-path=results.json ! \
  fakesink
```

## Model Requirements

### Detection Models
- Input: BGR image
- Output: Detection results in SSD format
- Supported formats: OpenVINO IR (.xml/.bin)

### Classification Models  
- Input: Cropped object regions
- Output: Classification probabilities
- Supported formats: OpenVINO IR (.xml/.bin)

### Custom Models
Use gvainference for models with custom input/output formats.

## Performance Optimization

### Device Selection
- CPU: Good compatibility, moderate performance
- GPU: Higher performance for complex models
- MYRIAD/HDDL: Low power inference
- MULTI: Automatic device selection

### Batch Processing
Configure batch-size property for better throughput:
```bash
gvadetect model=model.xml batch-size=4
```

### Memory Optimization
Use appropriate color formats and resolutions:
```bash
videoscale ! video/x-raw,width=416,height=416 ! gvadetect
```

## Debugging

### Enable Debug Output
```bash
export GST_DEBUG=gva*:4
```

### Model Information
```bash
gst-inspect-1.0 gvadetect
gst-inspect-1.0 gvaclassify
gst-inspect-1.0 gvainference
```

### Pipeline Visualization
```bash
export GST_DEBUG_DUMP_DOT_DIR=/tmp
# Pipeline will generate .dot files for visualization
```

For complete documentation, visit: https://dlstreamer.github.io/
