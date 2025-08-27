# gvainference

**Category:** OpenVINO DL Streamer - Generic Inference  
**Plugin:** gst-plugins-intel-openvino  
**Rank:** None  

## Description
Generic inference element for running any OpenVINO model. More flexible than gvadetect/gvaclassify but requires more configuration. Suitable for custom models and specialized inference tasks.

## Properties
- **model** (string): Path to OpenVINO model file (.xml)
- **model-proc** (string): Path to model processing configuration file
- **device** (string): Target device (CPU, GPU, MYRIAD, HDDL)
- **batch-size** (uint): Number of frames/objects to process in batch (default: 1)
- **nireq** (uint): Number of inference requests (default: 1)
- **inference-region** (string): Region to run inference on (full-frame, roi-list)
- **labels** (string): Path to labels file
- **pre-process-backend** (string): Pre-processing backend (opencv, openvino)
- **model-instance-id** (string): Unique identifier for model instance

## Pad Templates
**Sink:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }  
**Source:** video/x-raw, format=(string){ BGRx, BGRA, BGR, NV12, I420 }

## Usage Examples

### Custom Segmentation Model
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvainference model=semantic-segmentation.xml \
              model-proc=segmentation-proc.json \
              device=GPU ! \
  gvametaconvert format=json ! \
  filesink location=segmentation.json
```

### Pose Estimation
```bash
gst-launch-1.0 \
  v4l2src device=/dev/video0 ! \
  videoconvert ! \
  gvainference model=human-pose-estimation.xml \
              inference-region=full-frame \
              device=CPU ! \
  gvawatermark ! \
  autovideosink
```

### Custom Object Detection with ROI
```bash
gst-launch-1.0 \
  filesrc location=input.mp4 ! \
  decodebin ! \
  gvadetect model=roi-detection.xml ! \
  gvainference model=custom-classifier.xml \
              inference-region=roi-list \
              model-instance-id=custom-1 ! \
  gvametaconvert format=json-lines ! \
  filesink location=results.jsonl
```

## Model Processing Configuration
The model-proc file defines input/output processing:

```json
{
  "input_preproc": {
    "color_format": "BGR",
    "resize": "aspect-ratio",
    "normalization": {
      "mean": [123.675, 116.28, 103.53],
      "std": [58.395, 57.12, 57.375]
    }
  },
  "output_postproc": {
    "converter": "tensor_to_bbox",
    "labels": ["person", "car", "bike"],
    "confidence_threshold": 0.5
  }
}
```

## Common Use Cases
- Custom trained models
- Specialized computer vision tasks
- Research and development
- Model prototyping and testing
- Non-standard inference workflows

## Performance Tips
- Use model-proc files for optimal pre/post-processing
- Set appropriate batch-size based on model complexity
- Use GPU for compute-intensive models
- Consider model quantization for edge deployment

## Advanced Features
- Support for multi-input/multi-output models
- Custom post-processing through model-proc
- Region-based inference (ROI processing)
- Model instance management for complex pipelines

## Related Elements
- **gvadetect**: Specialized object detection
- **gvaclassify**: Specialized classification
- **gvatrack**: Object tracking
- **gvametaconvert**: Metadata conversion
- **gvawatermark**: Visualization overlay
