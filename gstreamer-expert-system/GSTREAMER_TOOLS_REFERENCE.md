# 🛠️ Enhanced GStreamer Expert Tools - Quick Reference

## 🎯 Tool Overview

| Tool | Purpose | Best For |
|------|---------|----------|
| **gstreamer_expert** | Comprehensive assistance | Complex pipelines, full solutions |
| **search_gstreamer_elements** | Find elements by capability | "What encoder should I use?" |
| **get_element_documentation** | Element details & properties | "How does kvssink work?" |
| **search_pipeline_patterns** | Working pipeline examples | "Show me RTSP to KVS examples" |
| **troubleshoot_pipeline_issues** | Diagnose problems | Quality issues, performance problems |

## 🚀 Quick Commands

### Find Elements
```
Search for NVIDIA encoders
Find H.264 decoders for Linux
What elements handle RTSP streaming?
```

### Get Element Info
```
Get documentation for kvssink
Show me x264enc properties
What caps does rtspsrc support?
```

### Find Working Patterns
```
Find RTSP to KVS pipeline examples
Show me webcam recording patterns
Search for multi-output tee configurations
```

### Troubleshoot Issues
```
My pipeline has pixelation: [paste your pipeline]
Diagnose green screen artifacts in RTSP stream
Pipeline uses too much CPU, help optimize
```

### Comprehensive Solutions
```
Create RTSP to KVS pipeline with audio and video
Add OpenVINO object detection to webcam stream
Optimize pipeline for low-latency streaming on macOS
```

## 🎯 Issue-Specific Queries

### Quality Problems
- "Fix pixelation in my video stream"
- "Green screen artifacts in RTSP pipeline"
- "Audio and video out of sync"
- "Blurry video after encoding"

### Performance Issues
- "Pipeline uses too much CPU"
- "Reduce memory usage in GStreamer"
- "Optimize for real-time streaming"
- "Enable hardware acceleration"

### Platform Optimization
- "Best encoders for macOS"
- "NVIDIA acceleration on Linux"
- "Windows MediaFoundation integration"

### Complex Scenarios
- "Multi-camera composition pipeline"
- "RTSP with machine learning inference"
- "Simultaneous recording and streaming"
- "WebRTC integration with GStreamer"

## 🔧 Advanced Features

### Automatic Context Detection
The system automatically detects:
- **Platform**: macOS, Linux, Windows
- **Source Type**: RTSP, webcam, file
- **Destination**: KVS, display, file, streaming
- **Issues**: Quality, performance, initialization
- **Complexity**: Basic, advanced, ML inference

### Knowledge Base Integration
- **324 documents** of GStreamer expertise
- **Tested pipeline examples** from real deployments
- **Platform-specific optimizations**
- **Hardware acceleration guides**

### Intelligent Troubleshooting
- **Quality issues**: Pixelation, artifacts, color problems
- **Performance**: CPU, memory, latency optimization
- **Compatibility**: Element caps negotiation
- **Platform-specific**: Hardware acceleration recommendations

## 📊 Success Indicators

Good responses include:
- ✅ **Working pipeline commands**
- ✅ **Specific element recommendations**
- ✅ **Platform-optimized solutions**
- ✅ **Troubleshooting steps**
- ✅ **Performance optimization tips**

## 🎯 Example Workflows

### 1. Building a New Pipeline
```
You: "Create RTSP to KVS pipeline for macOS"
→ Gets comprehensive solution with VideoToolbox acceleration

You: "Get documentation for vtenc_h264"  
→ Gets detailed element properties and usage examples

You: "Find similar RTSP pipeline patterns"
→ Gets tested pipeline examples from knowledge base
```

### 2. Troubleshooting Existing Pipeline
```
You: "My pipeline has green screen: gst-launch-1.0 rtspsrc ! ..."
→ Diagnoses color space conversion issues

You: "Search for color conversion elements"
→ Finds videoconvert, colorspace elements

You: "Get documentation for videoconvert"
→ Gets properties for color space handling
```

### 3. Performance Optimization
```
You: "Optimize this pipeline for low CPU: [pipeline]"
→ Suggests hardware acceleration and buffer optimization

You: "Find NVIDIA encoder elements"
→ Lists nvh264enc, nvh265enc with capabilities

You: "Get documentation for nvh264enc"
→ Gets NVIDIA-specific properties and settings
```

## 🚨 Tips for Best Results

1. **Include Pipeline Commands**: Paste actual gst-launch commands for troubleshooting
2. **Specify Platform**: Mention macOS, Linux, or Windows for optimized recommendations  
3. **Describe Symptoms**: Use specific terms like "pixelation", "green screen", "high CPU"
4. **Ask Follow-ups**: Build on previous responses for iterative improvements
5. **Use Specific Element Names**: Reference exact GStreamer element names when possible

## 🔄 Continuous Improvement

The system includes:
- **Automated testing** of all recommendations
- **Knowledge base updates** with new patterns
- **Performance validation** of suggested optimizations
- **Real-world scenario testing** for accuracy

All tools are continuously validated against actual GStreamer deployments and user scenarios.
