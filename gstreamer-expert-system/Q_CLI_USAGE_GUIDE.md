# 🎯 Enhanced GStreamer Expert - Q CLI Usage Guide

## 🚀 Getting Started

Start Q CLI and begin asking GStreamer questions:
```bash
q chat
```

## 🛠️ Available Tools

### 1. **Comprehensive GStreamer Expert**
Ask any GStreamer question for complete solutions:
```
How do I create an RTSP to KVS pipeline with audio and video?
Help me optimize my pipeline for low latency streaming
I need to add object detection to my webcam pipeline
```

### 2. **Element Search**
Find specific GStreamer elements:
```
Search for NVIDIA H.264 encoders
Find elements for audio conversion
What elements can I use for RTSP streaming?
```

### 3. **Element Documentation**
Get detailed information about specific elements:
```
Get documentation for kvssink
Show me properties of x264enc
What caps does rtspsrc support?
```

### 4. **Pipeline Patterns**
Find working pipeline examples:
```
Find RTSP to KVS pipeline patterns
Show me webcam recording examples
Search for multi-output tee patterns
```

### 5. **Troubleshooting**
Diagnose pipeline issues:
```
My pipeline has pixelation issues: gst-launch-1.0 rtspsrc ! rtph264depay ! h264parse ! x264enc bitrate=100 ! kvssink
Troubleshoot green screen artifacts in my RTSP pipeline
My pipeline uses too much CPU, how can I optimize it?
```

## 🎯 Example Conversations

### Basic Pipeline Creation
**You**: "How do I stream from my macOS webcam to Kinesis Video Streams?"

**Expert**: Provides immediate working solution with platform-specific optimizations

### Quality Issues
**You**: "My RTSP stream has green screen artifacts, how do I fix this?"

**Expert**: Diagnoses color space issues and provides specific solutions

### Performance Optimization
**You**: "My pipeline uses too much CPU, can you optimize it for hardware acceleration?"

**Expert**: Analyzes pipeline and suggests platform-specific hardware acceleration

### Complex Scenarios
**You**: "I need to add OpenVINO object detection to my RTSP to KVS pipeline"

**Expert**: Provides complete multi-branch pipeline with ML inference integration

## 🔧 Advanced Features

### Multi-Tool Workflow
The system automatically uses the most appropriate tool for your question:
- **Simple element questions** → Element search/documentation tools
- **Pipeline issues** → Troubleshooting tools  
- **Complex scenarios** → Comprehensive expert with all tools combined

### Intelligent Context Analysis
The system automatically detects:
- Source types (RTSP, webcam, file)
- Destination types (KVS, display, file)
- Platform (macOS, Linux, Windows)
- Issues (quality, performance, initialization)
- Complexity level (basic, advanced, ML inference)

### Knowledge Base Integration
All responses are backed by:
- 324 comprehensive GStreamer documents
- Tested pipeline examples
- Platform-specific optimizations
- Hardware acceleration guides

## 🎯 Tips for Best Results

1. **Be Specific**: Include pipeline commands, error messages, or specific requirements
2. **Mention Platform**: Specify macOS, Linux, or Windows for optimized recommendations
3. **Describe Issues**: Use specific terms like "pixelation", "green screen", "high CPU"
4. **Ask Follow-ups**: The system maintains context for iterative improvements

## 🚨 Troubleshooting Q CLI Integration

If tools aren't working:
1. Check MCP server status: Look for "enhanced-gstreamer-expert" in available tools
2. Restart Q CLI session: Exit and run `q chat` again
3. Check server logs: Look for any startup errors
4. Verify configuration: Ensure MCP configuration is correct

## 📊 Quality Assurance

The system includes automated testing for:
- Pipeline accuracy validation
- Element compatibility checking
- Quality issue diagnosis
- Performance optimization recommendations

All responses are continuously validated against real-world scenarios.
