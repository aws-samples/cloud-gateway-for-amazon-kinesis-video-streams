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
--
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

---

