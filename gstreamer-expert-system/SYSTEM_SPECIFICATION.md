# GStreamer Expert System - Comprehensive Specification

**Version**: 2.0  
**Last Updated**: 2025-08-27  
**Status**: In Development - Enhanced Architecture Phase

## 🎯 System Overview

An advanced AI-powered GStreamer assistance system that provides intelligent, context-aware solutions for multimedia pipeline development, troubleshooting, and optimization. The system combines intelligent context inference, immediate working solutions, and advanced model reasoning to handle complex GStreamer scenarios.

### **Core Use Cases & Goals**

**1. Pipeline Construction**
- **"Just works" solutions**: Immediate, working pipeline commands
- **Complex scenarios**: Multi-track processing, ML inference, multi-output tee configurations
- **Platform optimization**: Hardware acceleration recommendations (macOS, Linux, Windows)
- **Progressive complexity**: Basic → Optimized → Extended pipeline support

**2. Comprehensive Troubleshooting** ⭐ **ENHANCED**
- **Initialization failures**: Pipelines that fail to start or negotiate caps
- **Performance optimization**: CPU usage, memory management, latency reduction
- **Media quality issues**: Pixelation, compression artifacts, quality loss
- **Encoding artifacts**: Gray/green scenes, color space issues, format problems
- **Synchronization problems**: Audio/video sync, timing issues
- **Hardware acceleration**: GPU utilization, codec compatibility

**3. Advanced Pipeline Development**
- **ML inference integration**: OpenVINO, NVIDIA DeepStream
- **Multi-output configurations**: Tee-based branching to multiple destinations
- **Real-time processing**: Low-latency streaming, live video processing
- **Cloud integration**: AWS KVS, streaming services, WebRTC

## 🏗️ Architecture Design

### **Core Philosophy**
- **Solution-First Approach**: Always provide immediate, working solutions
- **Intelligent Context Inference**: Automatically detect platform, codecs, issues from user input
- **Layered Complexity**: Basic → Optimized → Extended pipeline support
- **Platform-Aware**: macOS, Linux, Windows specific optimizations
- **Progressive Enhancement**: Immediate fix + advanced analysis

### **System Components**

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (Q CLI)                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Enhanced MCP Server                            │
│  ┌─────────────────┬─────────────────┬─────────────────────┐ │
│  │ Context Analysis│ Solution Engine │ Model Orchestration │ │
│  └─────────────────┴─────────────────┴─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                AWS Bedrock Services                         │
│  ┌─────────────────┬─────────────────┬─────────────────────┐ │
│  │ Claude Opus 4.1 │ Knowledge Base  │ Fallback Models     │ │
│  │ (Primary)       │ (324 docs)      │ (Claude Sonnet 4)   │ │
│  └─────────────────┴─────────────────┴─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🧠 Intelligent Context Analysis

### **Automatic Detection Capabilities**

**Source Type Detection:**
- RTSP streams (`rtspsrc`, `rtsp://` URLs)
- Webcam/Camera (`v4l2src`, `avfvideosrc`, `ksvideosrc`)
- File playback (`filesrc`, file paths)
- Screen capture (desktop, screen keywords)

**Destination Analysis:**
- Kinesis Video Streams (`kvs`, `kinesis`, `kvssink`)
- Display output (`display`, `videosink`, `autovideosink`)
- File recording (`filesink`, `record`)
- RTSP server (`rtsp server`, streaming)
- WebRTC (`webrtc`)
- Multi-output (`tee`, `multiple`, `simultaneous`)

**Platform Intelligence:**
- **macOS**: `avfvideosrc`, `osxaudiosrc`, `vtenc`, `vtdec`
- **Linux**: `v4l2src`, `alsasrc`, `vaapi`, `nvenc`, `nvdec`
- **Windows**: `ksvideosrc`, `wasapi`, `mf`
- **Cross-platform**: `autovideosrc`, `x264enc`, `glimagesink`

**Codec Recognition:**
- **Video**: H.264, H.265/HEVC, VP8, VP9
- **Audio**: AAC, Opus, MP3
- **Container formats**: Matroska, MP4, WebM

**Issue Detection:**
- Initialization failures
- Caps negotiation problems
- Performance issues
- Audio synchronization
- Missing elements/plugins

**Complexity Assessment:**
- **Basic**: Simple source-to-sink pipelines
- **Multi-track**: Audio + video processing
- **Multi-output**: Tee-based branching
- **ML Inference**: OpenVINO, NVIDIA DeepStream
- **Optimization**: Hardware acceleration focus

## 🔧 Solution Engine

### **Immediate Solution Patterns**

**RTSP to KVS (Most Common Issue):**
```bash
# Multi-track (Audio + Video)
gst-launch-1.0 rtspsrc location="rtsp://..." name=src \
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! matroskamux name=mux ! kvssink stream-name="stream" aws-region="us-east-1" \
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,mpegversion=4,stream-format=raw ! mux.

# Video-only
gst-launch-1.0 rtspsrc location="rtsp://..." ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! kvssink stream-name="stream" aws-region="us-east-1"
```

**Platform-Specific Webcam:**
```bash
# macOS
gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink

# Linux
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink

# Cross-platform
gst-launch-1.0 autovideosrc ! videoconvert ! autovideosink
```

**Multi-Output Tee Pattern:**
```bash
gst-launch-1.0 autovideosrc ! videoconvert ! tee name=t \
  t. ! queue ! x264enc ! mp4mux ! filesink location=output.mp4 \
  t. ! queue ! videoconvert ! autovideosink
```

### **Hardware Acceleration Mapping**

| Platform | Video Encoder | Video Decoder | Audio |
|----------|---------------|---------------|-------|
| **macOS** | `vtenc_h264`, `vtenc_h265` | `vtdec` | `osxaudiosrc/sink` |
| **Linux + NVIDIA** | `nvh264enc`, `nvh265enc` | `nvh264dec`, `nvh265dec` | `alsasrc/sink` |
| **Linux + Intel** | `vaapih264enc`, `vaapih265enc` | `vaapih264dec` | `alsasrc/sink` |
| **Windows** | `mfh264enc` | `mfh264dec` | `wasapisrc/sink` |

## 🤖 Model Orchestration

### **Primary Model: Claude Opus 4.1**
- **Model ID**: `us.anthropic.claude-opus-4-1-20250805-v1:0` (inference profile)
- **Capabilities**: Advanced reasoning, complex pipeline design, optimization strategies
- **Token Management**: Chunked prompts, conservative limits (3000 tokens)

### **Fallback Hierarchy**
1. **Claude Sonnet 4**: `anthropic.claude-sonnet-4-20250514-v1:0`
2. **Claude 3.7 Sonnet**: `anthropic.claude-3-7-sonnet-20250219-v1:0`
3. **Nova Premier**: `amazon.nova-premier-v1:0`
4. **Local Analysis**: Context-based recommendations

### **Knowledge Base Integration**
- **KB ID**: `5CGJIOV1QM`
- **Content**: 324 comprehensive GStreamer documents
- **Query Strategy**: Context-aware, intelligent query construction
- **Search Type**: Semantic vector search

## 📚 Knowledge Base Content

### **Documentation Coverage**
- **GStreamer Core**: Elements, plugins, pipeline construction (1.18-1.24)
- **AWS Integration**: Kinesis Video Streams, kvssink configuration
- **OpenVINO**: DL Streamer elements (gvadetect, gvaclassify, gvainference)
- **NVIDIA**: DeepStream integration, hardware acceleration
- **Platform Guides**: macOS, Linux, Windows specific implementations
- **Performance**: Hardware acceleration, optimization techniques

### **Content Structure**
```
gstreamer-kb/
├── elements/           # 269 GStreamer element references
├── integration-patterns/ # 16 common pipeline patterns
├── platform-guides/    # 10 OS-specific guides
├── working-examples/    # 28 tested pipeline examples
└── troubleshooting/     # 1 comprehensive troubleshooting guide
```

## 🛠️ Enhanced Multi-Tool Architecture (v2.0)

### **Tool Suite Design (AWS Documentation Pattern)**

Following the AWS documentation MCP server pattern with specialized tools for accuracy and performance:

**Core Tools:**
1. **`search_gstreamer_elements`** - Find elements by capability, name, or use case
2. **`get_element_documentation`** - Detailed element properties, caps, and usage
3. **`search_pipeline_patterns`** - Find tested, working pipeline examples
4. **`validate_pipeline_compatibility`** - Check element chain compatibility
5. **`troubleshoot_pipeline_issues`** - Diagnose quality, performance, and error issues
6. **`optimize_pipeline_performance`** - Hardware acceleration and performance tuning
7. **`gstreamer_expert`** - Comprehensive solution orchestration (existing)

### **Accuracy-First Workflow**

**Phase 1: Intelligent Component Validation**
```python
# Instead of guessing element properties:
async def validate_pipeline_components(elements):
    validated_elements = []
    for element in elements:
        element_doc = await get_element_documentation(element)
        validated_elements.append({
            'element': element,
            'caps': element_doc.supported_caps,
            'properties': element_doc.key_properties,
            'platform_support': element_doc.platform_availability
        })
    return check_compatibility_chain(validated_elements)
```

**Phase 2: Pattern-Based Solution Building**
```python
# Build from proven patterns:
async def build_solution_from_patterns(context):
    # Find similar working pipelines
    patterns = await search_pipeline_patterns(context.scenario)
    
    # Validate each component in the pattern
    validated_pattern = await validate_pipeline_compatibility(patterns[0])
    
    # Adapt to user's specific requirements
    return adapt_pattern_to_context(validated_pattern, context)
```

**Phase 3: Quality & Troubleshooting Focus**
```python
# Targeted troubleshooting:
async def diagnose_pipeline_issues(pipeline, symptoms):
    issue_type = classify_symptoms(symptoms)  # pixelation, artifacts, performance
    
    # Query KB for specific issue patterns
    solutions = await search_troubleshooting_patterns(issue_type)
    
    # Generate targeted fixes
    return generate_quality_improvements(pipeline, issue_type, solutions)
```

### **Core Server: `bedrock_gstreamer_expert.py`**

**Key Classes:**
- `BedrockGStreamerExpert`: Main orchestration class
- Context analysis methods
- Solution generation engine
- Model query management
- Token optimization

**Available Tools:**
1. **`gstreamer_expert`**: General GStreamer assistance
2. **`analyze_pipeline`**: Pipeline analysis and optimization
3. **`extend_pipeline`**: Add advanced features (ML, multi-output)

### **Response Structure**
```
┌─────────────────────────────────────────┐
│        IMMEDIATE SOLUTION               │
│  ✅ Working pipeline command            │
│  🎯 Key fixes applied                   │
│  ❌ Why original failed                 │
│  🛠️ Debugging steps                    │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│      ENHANCED ANALYSIS                  │
│  🚀 Advanced model reasoning           │
│  🔧 Platform optimizations             │
│  📈 Performance recommendations        │
│  🎯 Extension possibilities            │
└─────────────────────────────────────────┘
                    │
┌─────────────────────────────────────────┐
│       CONTEXT & SOURCES                 │
│  📊 Intelligent context analysis       │
│  📚 Knowledge base sources used        │
│  🔍 Debugging information              │
└─────────────────────────────────────────┘
```

## 🎯 Use Case Coverage

### **Supported Scenarios**

**1. Basic Pipeline Construction**
- Webcam to display
- File playback
- RTSP streaming
- Screen capture

**2. Troubleshooting & Fixes**
- Caps negotiation failures
- Initialization problems
- Performance issues
- Audio synchronization
- Missing elements

**3. Multi-Track Processing**
- RTSP with audio + video
- Synchronized playback
- Container format handling
- Codec compatibility

**4. Advanced Features**
- **ML Inference**: OpenVINO integration, NVIDIA DeepStream
- **Multi-Output**: Tee-based branching to multiple sinks
- **Hardware Acceleration**: Platform-specific optimization
- **Cloud Integration**: AWS KVS, streaming services

**5. Performance Optimization**
- Hardware encoder/decoder selection
- Memory management
- Latency reduction
- Throughput maximization

### **Complex Pipeline Examples**

**RTSP → Multiple Outputs with ML:**
```bash
gst-launch-1.0 rtspsrc location=rtsp://camera ! tee name=input_tee \
  input_tee. ! queue ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! \
    gvadetect model=detection.xml ! videoconvert ! \
    x264enc ! h264parse ! matroskamux ! filesink location=analyzed.mkv \
  input_tee. ! queue ! rtph264depay ! h264parse ! avdec_h264 ! videoconvert ! autovideosink
```

**Multi-Camera Composition:**
```bash
gst-launch-1.0 \
  videomixer name=mix sink_0::xpos=0 sink_1::xpos=640 ! videoconvert ! autovideosink \
  autovideosrc ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! mix.sink_0 \
  autovideosrc device=/dev/video1 ! videoconvert ! videoscale ! video/x-raw,width=640,height=480 ! mix.sink_1
```

## 🚀 Current Implementation Status

### **✅ Completed Components**
- [x] Intelligent context analysis engine
- [x] Immediate solution generation
- [x] Knowledge base integration
- [x] Claude Opus 4.1 access setup
- [x] Platform-specific element mapping
- [x] Core MCP server structure
- [x] Multi-tool support (expert, analyze, extend)

### **🚧 In Progress**
- [ ] **Token management for Claude Opus 4.1** (chunking, optimization)
- [ ] **Fallback model hierarchy** (Sonnet 4 → 3.7 → Nova Premier)
- [ ] **Q CLI integration** (configuration, testing)

### **📋 Pending**
- [ ] Advanced ML inference patterns
- [ ] Real-time performance monitoring
- [ ] Extended hardware acceleration support
- [ ] Multi-platform testing validation

## 🔧 Technical Configuration

### **AWS Resources**
- **Region**: us-east-1
- **Profile**: malone-aws
- **Agent ID**: L60IDME1CM
- **Knowledge Base**: 5CGJIOV1QM
- **S3 Bucket**: gstreamer-expert-knowledge-base-1755726919

### **Model Configuration**
```python
# Primary model (with inference profile)
claude_opus_model = "us.anthropic.claude-opus-4-1-20250805-v1:0"

# Fallback hierarchy
fallback_models = [
    "anthropic.claude-sonnet-4-20250514-v1:0",      # Claude Sonnet 4
    "anthropic.claude-3-7-sonnet-20250219-v1:0",   # Claude 3.7 Sonnet  
    "amazon.nova-premier-v1:0"                      # Nova Premier
]
```

### **Token Limits**
- **Claude Opus 4.1**: 3000 tokens (conservative)
- **Fallback Models**: 2000-4000 tokens
- **Prompt Optimization**: Chunked documentation, concise context

## 🎯 Success Metrics

### **Functional Requirements Met**
- ✅ **"Just Works" Solutions**: Immediate, working pipeline commands
- ✅ **Platform Intelligence**: Automatic OS/hardware detection
- ✅ **Issue Resolution**: Caps negotiation, initialization fixes
- ✅ **Complex Scenarios**: Multi-track, ML inference, multi-output
- ✅ **Performance Optimization**: Hardware acceleration recommendations

### **Quality Indicators**
- **Context Analysis Accuracy**: >95% correct detection
- **Solution Effectiveness**: Working pipelines on first attempt
- **Response Completeness**: Immediate + enhanced + debugging info
- **Knowledge Integration**: Relevant documentation retrieval
- **Fallback Reliability**: Graceful degradation when primary model fails

## 🔄 Development Workflow

### **Testing Strategy**
1. **Unit Tests**: Context analysis, solution generation
2. **Integration Tests**: Full pipeline with KB and models
3. **Real-world Validation**: User scenarios, complex pipelines
4. **Performance Tests**: Token usage, response times

### **Deployment Process**
1. **Local Development**: MCP server testing
2. **Q CLI Integration**: Configuration and validation
3. **Production Deployment**: Full system testing
4. **Monitoring**: Usage patterns, error rates, success metrics

---

**This specification serves as the definitive reference for the GStreamer Expert System architecture, ensuring consistency across development sessions and providing clear guidance for implementation and enhancement.**
