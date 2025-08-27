# 🎯 GStreamer Expert Tools - Prompting Techniques Guide

## 📋 Tool Overview
- **gstreamer_expert** - Comprehensive assistance
- **search_gstreamer_elements** - Find elements by capability
- **get_element_documentation** - Element details & properties
- **search_pipeline_patterns** - Working pipeline examples
- **troubleshoot_pipeline_issues** - Diagnose problems

---

## 🔧 Tool 1: `search_gstreamer_elements`

### Zero-Shot Prompting (Basic)
```
Find H.264 encoders
```

### One-Shot Prompting (With Example)
```
Search for NVIDIA encoders like nvh264enc
```

### Few-Shot Prompting (Multiple Examples)
```
Find hardware encoders similar to:
- nvh264enc (NVIDIA)
- vtenc_h264 (VideoToolbox)
- vaapih264enc (Intel)
```

### Chain-of-Thought Prompting
```
I need to encode H.264 video on Linux with GPU acceleration. 
First, search for NVIDIA encoder elements, then I'll check which ones support my specific GPU model.
```

### Advanced Context Prompting
```
Search for H.264 encoders that support:
- Hardware acceleration on Linux
- Low-latency encoding for real-time streaming
- Bitrate control for adaptive streaming
- B-frame configuration for quality optimization
```

### Constraint-Based Prompting
```
Find video encoders with these requirements:
- MUST: Support H.264 baseline profile
- MUST: Available on Ubuntu 22.04
- PREFER: Hardware acceleration
- AVOID: Software-only encoders for performance reasons
```

---

## 📚 Tool 2: `get_element_documentation`

### Zero-Shot Prompting
```
Get documentation for kvssink
```

### Specific Property Focus
```
Show me kvssink documentation, especially the stream-name and aws-region properties
```

### Use-Case Driven Prompting
```
Get kvssink documentation for setting up multi-track audio+video streaming to AWS KVS
```

### Troubleshooting-Focused Prompting
```
Get kvssink documentation to understand why my pipeline fails with "negotiation error"
```

### Comparative Analysis Prompting
```
Get documentation for kvssink and explain how it differs from filesink for cloud streaming
```

### Advanced Configuration Prompting
```
Get kvssink documentation with focus on:
- Authentication methods (IAM roles vs access keys)
- Buffer management for network resilience
- Error handling and retry mechanisms
- Performance tuning parameters
```

---

## 🔍 Tool 3: `search_pipeline_patterns`

### Zero-Shot Prompting
```
Find RTSP to KVS patterns
```

### Source-Destination Specific
```
Search for pipeline patterns from webcam to file recording
```

### Complexity-Based Prompting
```
Find advanced pipeline patterns with tee for simultaneous recording and streaming
```

### Problem-Solution Prompting
```
Find pipeline patterns that solve audio-video synchronization issues in RTSP streams
```

### Feature-Specific Prompting
```
Search for pipeline patterns that include:
- OpenVINO object detection
- Multi-camera input
- Real-time processing
- Cloud streaming output
```

### Production-Ready Prompting
```
Find enterprise-grade pipeline patterns for:
- High-availability RTSP ingestion
- Automatic failover mechanisms  
- Quality monitoring and adaptation
- Scalable cloud deployment
```

---

## 🔧 Tool 4: `troubleshoot_pipeline_issues`

### Zero-Shot Prompting
```
My pipeline has green screen artifacts
Pipeline: gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! autovideosink
```

### Detailed Symptom Description
```
Troubleshoot pixelation issues in my RTSP pipeline:
Pipeline: gst-launch-1.0 rtspsrc location=rtsp://192.168.1.100/stream ! rtph264depay ! h264parse ! x264enc bitrate=500000 ! kvssink
Symptoms: Video shows severe pixelation and blocking artifacts, especially during motion scenes
```

### Multi-Issue Prompting
```
Diagnose multiple issues in my pipeline:
Pipeline: gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! x264enc ! rtph264pay ! udpsink
Issues: 
1. High CPU usage (>80%)
2. Occasional frame drops
3. Audio-video sync problems
4. Memory usage keeps increasing
```

### Context-Rich Prompting
```
Troubleshoot performance issues:
Pipeline: gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! nvh264dec ! nvh264enc bitrate=2000000 ! kvssink
Environment: Ubuntu 20.04, NVIDIA RTX 3080, 32GB RAM
Symptoms: Pipeline starts fine but CPU usage spikes to 100% after 10 minutes, then pipeline stalls
Previous attempts: Tried different bitrates, checked GPU memory usage
```

### Comparative Troubleshooting
```
Compare these two pipelines and diagnose why Pipeline B fails:
Pipeline A (works): gst-launch-1.0 videotestsrc ! x264enc ! kvssink
Pipeline B (fails): gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! kvssink
Error: "Internal data stream error" after 30 seconds
```

### Advanced Diagnostic Prompting
```
Perform comprehensive diagnosis:
Pipeline: [complex multi-branch pipeline with tee, ML inference, and multiple outputs]
Symptoms: Intermittent green screen artifacts only on one output branch
Environment: macOS Monterey, M1 Pro, VideoToolbox acceleration enabled
Debug info: GST_DEBUG=3 shows caps negotiation warnings
Network: RTSP source is on unstable WiFi connection
Requirements: Must maintain <100ms latency for real-time application
```

---

## 🎯 Tool 5: `gstreamer_expert` (Comprehensive)

### Zero-Shot Prompting
```
Create an RTSP to KVS pipeline
```

### Goal-Oriented Prompting
```
I need to stream my security camera (RTSP) to AWS Kinesis Video Streams for cloud storage and analysis
```

### Constraint-Driven Prompting
```
Create an RTSP to KVS pipeline with these requirements:
- Must include both audio and video
- Optimize for macOS with M1 chip
- Minimize latency (<200ms)
- Handle network interruptions gracefully
```

### Step-by-Step Prompting
```
Help me build a complete streaming solution:
1. First, create basic RTSP to KVS pipeline
2. Then, add object detection with OpenVINO
3. Finally, optimize for production deployment
4. Include monitoring and error handling
```

### Problem-Solution Chain Prompting
```
I have an existing pipeline that works but needs enhancement:
Current: gst-launch-1.0 rtspsrc ! rtph264depay ! h264parse ! kvssink
Problems: No audio, high CPU usage, occasional crashes
Goals: Add audio support, enable hardware acceleration, improve stability
Platform: Linux with NVIDIA GPU
```

### Architecture-Level Prompting
```
Design a complete GStreamer architecture for:
- Multi-camera surveillance system (8 RTSP cameras)
- Real-time object detection and tracking
- Cloud storage with AWS KVS
- Local recording backup
- Web dashboard for monitoring
- Automatic quality adaptation based on network conditions
- Failover mechanisms for camera outages
Platform: Ubuntu server with multiple NVIDIA GPUs
```

---

## 🚀 Advanced Multi-Tool Workflows

### Sequential Tool Usage
```
1. "Search for NVIDIA encoders" (search_gstreamer_elements)
2. "Get documentation for nvh264enc" (get_element_documentation)  
3. "Find RTSP to KVS patterns using NVIDIA encoding" (search_pipeline_patterns)
4. "Create optimized RTSP to KVS pipeline with nvh264enc for low latency" (gstreamer_expert)
```

### Iterative Refinement
```
1. "Create basic webcam recording pipeline" (gstreamer_expert)
2. "Troubleshoot high CPU usage in my webcam pipeline: [pipeline]" (troubleshoot_pipeline_issues)
3. "Search for hardware encoder elements for webcam" (search_gstreamer_elements)
4. "Get documentation for vtenc_h264 properties" (get_element_documentation)
5. "Create optimized webcam pipeline with VideoToolbox acceleration" (gstreamer_expert)
```

### Comparative Analysis Workflow
```
1. "Find H.264 encoder elements" (search_gstreamer_elements)
2. "Get documentation for x264enc" (get_element_documentation)
3. "Get documentation for nvh264enc" (get_element_documentation)
4. "Compare x264enc vs nvh264enc for real-time streaming performance" (gstreamer_expert)
```

---

## 💡 Prompting Best Practices

### 🎯 Specificity Levels
- **Basic**: "Find encoders"
- **Better**: "Find H.264 encoders"  
- **Best**: "Find hardware H.264 encoders for Linux with low-latency support"

### 🔧 Context Inclusion
- **Platform**: Specify macOS, Linux, Windows
- **Hardware**: Mention GPU, CPU architecture
- **Use Case**: Real-time, recording, streaming
- **Constraints**: Latency, quality, resource usage

### 📋 Information Hierarchy
1. **What** you want to achieve
2. **Why** you need it (use case)
3. **Where** it will run (platform/hardware)
4. **How** it should perform (constraints)
5. **When** issues occur (timing/conditions)

### 🔄 Iterative Approach
- Start simple, add complexity
- Use tool outputs to inform next queries
- Build on previous responses
- Refine based on results

### 🎪 Advanced Techniques
- **Chain multiple tools** for comprehensive solutions
- **Use conditional logic** ("If X, then try Y")
- **Include error context** from previous attempts
- **Specify success criteria** for validation

---

## 📊 Example Progressive Conversation

### Beginner Level
```
User: "Help with RTSP streaming"
→ Basic pipeline provided

User: "Add audio to the pipeline"  
→ Multi-track solution provided
```

### Intermediate Level
```
User: "Create RTSP to KVS pipeline for macOS with hardware acceleration"
→ Platform-optimized solution with VideoToolbox

User: "Troubleshoot green screen artifacts in this pipeline: [pipeline]"
→ Color space diagnosis with specific fixes
```

### Expert Level
```
User: "Design scalable architecture for 50 RTSP cameras with ML inference, cloud storage, and edge processing failover"
→ Complete enterprise architecture with multiple tools integration
```

This guide demonstrates how different prompting techniques can unlock the full potential of each specialized tool in the GStreamer expert system.
