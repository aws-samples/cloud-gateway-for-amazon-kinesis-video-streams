# gvaclassify

**Category:** OpenVINO DL Streamer - Classification  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Performs classification on detected objects or entire frames using OpenVINO inference engine. Typically used after object detection to classify detected regions.

## Properties
- **model** (string): Path to OpenVINO model file (.xml)
- **model-proc** (string): Path to model processing configuration file
- **device** (string): Target device (CPU, GPU, MYRIAD, HDDL)
- **batch-size** (uint): Number of objects to classify in batch (default: 1)
- **nireq** (uint): Number of inference requests (default: 1)
- **object-class** (string): Object class to classify (if empty, classifies all)
- **labels** (string): Path to labels file
- **pre-process-backend** (string): Pre-processing backend (opencv, openvino)

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Vehicle Classification After Detection
```bash
gst-launch-1.0 \
  filesrc location=traffic.mp4 ! \
  decodebin ! \
  gvadetect model=vehicle-detection.xml ! \
  gvaclassify model=vehicle-attributes.xml object-class=vehicle ! \
  gvametaconvert format=json ! \
  filesink location=classifications.json
```

### Age-Gender Classification on Faces
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvadetect model=face-detection.xml ! \
  gvaclassify model=age-gender-recognition.xml object-class=face ! \
  gvawatermark ! \
  autovideosink
```

### Multi-stage Classification Pipeline
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=person-detection.xml ! \
  gvaclassify model=person-attributes.xml object-class=person ! \
  gvaclassify model=emotion-recognition.xml object-class=face ! \
  gvametaconvert format=json-lines ! \
  filesink location=results.jsonl
```

## Common Use Cases
- Facial attribute recognition (age, gender, emotion)
- Vehicle attribute classification (color, type, make)
- Person attribute analysis (clothing, pose)
- Product classification in retail
- Medical image classification

## Performance Tips
- Use GPU device for complex classification models
- Set object-class to filter specific detections
- Increase batch-size for multiple objects per frame
- Chain multiple gvaclassify elements for multi-attribute analysis

## Model Requirements
- Input: Cropped object regions from detection
- Output: Classification probabilities/labels
- Format: OpenVINO IR format (.xml + .bin)

## Related Elements
- **gvadetect**: Object detection (typically used before)
- **gvainference**: Generic inference
- **gvatrack**: Object tracking
- **gvametaconvert**: Metadata conversion
- **gvawatermark**: Visualization overlay
