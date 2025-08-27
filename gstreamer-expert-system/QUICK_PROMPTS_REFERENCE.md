# ⚡ Quick Prompts Reference Card

## 🔍 search_gstreamer_elements

### Most Effective Prompts:
```
✅ "Find NVIDIA H.264 encoders for Linux"
✅ "Search for hardware video decoders on macOS" 
✅ "Find audio conversion elements with resampling"
✅ "Search for RTSP source elements with authentication"
✅ "Find muxer elements that support both audio and video"
```

### Avoid:
```
❌ "Find stuff" (too vague)
❌ "Video things" (not specific)
```

---

## 📚 get_element_documentation

### Most Effective Prompts:
```
✅ "Get kvssink documentation for AWS authentication setup"
✅ "Show rtspsrc properties for handling network timeouts"
✅ "Get x264enc documentation focusing on bitrate control"
✅ "Document vtenc_h264 properties for real-time encoding"
✅ "Show tee element usage for multi-output pipelines"
```

### Avoid:
```
❌ "Tell me about kvssink" (too general)
❌ "How does this work?" (no element specified)
```

---

## 🔧 search_pipeline_patterns

### Most Effective Prompts:
```
✅ "Find RTSP to KVS patterns with audio and video"
✅ "Search for webcam recording patterns on macOS"
✅ "Find multi-camera composition pipeline examples"
✅ "Search for tee-based simultaneous recording and streaming"
✅ "Find OpenVINO object detection pipeline patterns"
```

### Avoid:
```
❌ "Show me pipelines" (no specific scenario)
❌ "Find examples" (too broad)
```

---

## 🩺 troubleshoot_pipeline_issues

### Most Effective Prompts:
```
✅ "Troubleshoot pixelation in: gst-launch-1.0 rtspsrc ! rtph264depay ! x264enc bitrate=100000 ! kvssink"
✅ "Diagnose green screen artifacts: [full pipeline] - happens only with RTSP input"
✅ "Fix high CPU usage: [pipeline] - spikes to 100% after 5 minutes on Ubuntu"
✅ "Resolve caps negotiation error: [pipeline] - fails at h264parse ! kvssink connection"
```

### Include:
- ✅ Full pipeline command
- ✅ Specific symptoms
- ✅ Platform/environment
- ✅ When issue occurs

### Avoid:
```
❌ "My pipeline doesn't work" (no details)
❌ "Fix this" (no pipeline or symptoms)
```

---

## 🎯 gstreamer_expert (Comprehensive)

### Most Effective Prompts:
```
✅ "Create RTSP to KVS pipeline for macOS M1 with hardware acceleration and audio"
✅ "Build webcam recording pipeline with simultaneous streaming to RTMP server"
✅ "Design multi-camera surveillance system with OpenVINO object detection"
✅ "Optimize existing pipeline for <100ms latency: [current pipeline]"
✅ "Create production-ready pipeline with error handling and automatic reconnection"
```

### Advanced Prompts:
```
✅ "Build complete streaming architecture for:
    - 4 RTSP cameras
    - Real-time object detection  
    - AWS KVS storage
    - Local backup recording
    - Web dashboard integration
    Platform: Ubuntu with NVIDIA RTX 4090"
```

---

## 🚀 Multi-Tool Workflow Examples

### Workflow 1: New Pipeline Development
```
1. "Find NVIDIA encoders for real-time streaming" 
   → search_gstreamer_elements

2. "Get nvh264enc documentation for low-latency settings"
   → get_element_documentation

3. "Find RTSP streaming patterns using NVIDIA encoding"
   → search_pipeline_patterns

4. "Create optimized RTSP to RTMP pipeline with nvh264enc for <50ms latency"
   → gstreamer_expert
```

### Workflow 2: Troubleshooting Existing Pipeline
```
1. "Troubleshoot green screen: gst-launch-1.0 rtspsrc ! rtph264depay ! autovideosink"
   → troubleshoot_pipeline_issues

2. "Find color conversion elements"
   → search_gstreamer_elements

3. "Get videoconvert documentation for color space handling"
   → get_element_documentation

4. "Fix color space issues in RTSP pipeline with proper conversion"
   → gstreamer_expert
```

### Workflow 3: Platform Migration
```
1. "Find macOS equivalent elements for Linux pipeline: [pipeline]"
   → search_gstreamer_elements

2. "Get vtenc_h264 documentation for VideoToolbox acceleration"
   → get_element_documentation

3. "Find macOS-optimized pipeline patterns"
   → search_pipeline_patterns

4. "Convert Linux pipeline to macOS with VideoToolbox: [original pipeline]"
   → gstreamer_expert
```

---

## 💡 Pro Tips

### 🎯 Specificity Wins
- Include platform (macOS, Linux, Windows)
- Mention hardware (NVIDIA, Intel, M1)
- Specify use case (real-time, recording, streaming)
- Add constraints (latency, quality, CPU usage)

### 🔄 Build Iteratively  
- Start with basic query
- Use results to ask more specific questions
- Chain tools for comprehensive solutions
- Refine based on testing results

### 📋 Context is King
- Always include full pipeline commands for troubleshooting
- Mention environment details (OS, hardware, GStreamer version)
- Describe symptoms precisely (when, how often, conditions)
- Include previous attempts and their results

### 🎪 Advanced Techniques
- Use conditional logic: "If NVIDIA available, use nvh264enc, otherwise x264enc"
- Chain requirements: "First optimize for quality, then for latency"
- Include success criteria: "Must achieve <100ms latency with 1080p@30fps"
- Reference previous conversations: "Building on the pipeline from earlier..."
