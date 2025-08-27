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
