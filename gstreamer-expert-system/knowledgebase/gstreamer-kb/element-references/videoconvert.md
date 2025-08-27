- threshold: Detection confidence threshold
- labels: Path to labels file

**Example:**
```bash
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! gvadetect model=person-detection.xml device=CPU ! gvawatermark ! videoconvert ! autovideosink
```

### gvaclassify  
Classification element for detected objects.

**Properties:**
- model: Path to the classification model
- device: Inference device
- labels: Path to labels file
- object-class: Object class to classify

**Example:**
```bash
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
--
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
