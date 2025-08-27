# Enhanced Pipeline Lambda

**Purpose**: AI-powered GStreamer pipeline generation with RTSP analysis and OpenCV frame extraction  
**Language**: Python 3.11  
**Runtime**: AWS Lambda (3GB memory, 10-minute timeout)  

## 📋 **Component Files**

### **Core Lambda Function**
- **`enhanced_lambda_function.py`** - Main Lambda handler
  - API endpoint routing and request handling
  - Integration with GStreamer expert system
  - RTSP analysis coordination
  - OpenCV frame extraction orchestration
  - Error handling and response formatting

### **Expert System Engine**
- **`gstreamer_expert.py`** - GStreamer expertise engine
  - 324-document knowledge base integration
  - Claude Opus 4.1 AI model integration
  - 7 specialized tools for different use cases
  - Context-aware pipeline generation
  - Platform-specific optimizations (macOS, Linux, Windows)

### **RTSP Analysis Engine**
- **`rtsp_analysis.py`** - Real-time RTSP stream analysis
  - SDP (Session Description Protocol) parsing
  - Codec detection and stream characteristics
  - Authentication handling (Basic/Digest)
  - TCP transport with proper connection management
  - OpenCV frame extraction and processing
  - Intelligent image resizing and optimization

### **Dependencies & Deployment**
- **`requirements.txt`** - Python package dependencies
- **`Dockerfile`** - Container image for Lambda deployment

## 🎯 **Functionality**

### **API Endpoints Handled**
- **`/v1/generate-pipeline`** - Generate optimized GStreamer pipelines
- **`/v1/characteristics`** - Extract RTSP stream characteristics
- **`/v1/tools/search-elements`** - Search GStreamer elements
- **`/v1/tools/get-documentation`** - Get element documentation
- **`/v1/tools/troubleshoot`** - Troubleshoot pipeline issues
- **`/v1/tools/optimize`** - Optimize pipeline performance
- **`/v1/tools/validate`** - Validate pipeline compatibility

### **Core Capabilities**
1. **Intelligent Pipeline Generation**
   - AI-powered analysis of RTSP streams
   - Platform-specific optimizations
   - Hardware acceleration recommendations
   - Quality issue diagnosis and solutions

2. **Real-Time RTSP Analysis**
   - Live stream introspection with SDP parsing
   - Codec detection (H.264, H.265, MJPEG, etc.)
   - Authentication handling for secured streams
   - Stream characteristics extraction

3. **OpenCV Frame Extraction**
   - Real-time frame capture from RTSP streams
   - JPEG encoding with quality optimization
   - Base64 conversion for API responses
   - Intelligent resizing and metadata collection

4. **Expert System Integration**
   - 324-document knowledge base queries
   - Context-aware recommendations
   - Progressive complexity solutions
   - Comprehensive error diagnosis

## 🚀 **Deployment**

### **Lambda Configuration**
- **Memory**: 3GB (required for OpenCV and AI processing)
- **Timeout**: 10 minutes (for complex stream analysis)
- **Runtime**: Python 3.11
- **Architecture**: x86_64

### **Environment Variables**
```bash
# AWS Bedrock Configuration
BEDROCK_REGION=us-east-1
BEDROCK_AGENT_ID=L60IDME1CM
BEDROCK_AGENT_ALIAS_ID=LOZ5ZB4MAS

# Knowledge Base Configuration
KNOWLEDGE_BASE_ID=5CGJIOV1QM

# Lambda Configuration
AWS_LAMBDA_FUNCTION_MEMORY_SIZE=3008
AWS_LAMBDA_FUNCTION_TIMEOUT=600
```

### **Dependencies**
```python
# Core dependencies from requirements.txt
opencv-python-headless==4.8.1.78
requests==2.31.0
boto3==1.34.131
Pillow==10.0.1
numpy==1.24.4
```

## 🔧 **Local Development**

### **Setup**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export BEDROCK_REGION=us-east-1
export BEDROCK_AGENT_ID=L60IDME1CM
# ... other environment variables
```

### **Testing**
```bash
# Test RTSP analysis
python3 -c "
from rtsp_analysis import analyze_rtsp_stream
result = analyze_rtsp_stream('rtsp://your-test-stream')
print(result)
"

# Test pipeline generation
python3 -c "
from enhanced_lambda_function import lambda_handler
event = {
    'httpMethod': 'POST',
    'path': '/v1/generate-pipeline',
    'body': '{\"rtsp_url\": \"rtsp://test-stream\"}'
}
result = lambda_handler(event, None)
print(result)
"
```

## 📊 **Performance Characteristics**

### **Resource Usage**
- **Memory**: 1.5-2.5GB typical usage (3GB allocated)
- **CPU**: High during OpenCV processing and AI inference
- **Network**: Moderate for RTSP stream analysis
- **Storage**: Minimal (temporary frame processing)

### **Response Times**
- **Simple Pipeline Generation**: 2-5 seconds
- **RTSP Analysis with Frame Extraction**: 5-15 seconds
- **Complex Multi-Tool Queries**: 10-30 seconds
- **Knowledge Base Queries**: 3-8 seconds

### **Optimization Features**
- **Intelligent Caching**: Reduces repeated analysis
- **Efficient Frame Processing**: Optimized OpenCV operations
- **Smart Resizing**: Maintains quality while reducing data transfer
- **Connection Pooling**: Efficient RTSP connection management

## 🧠 **AI Integration**

### **Bedrock Agent Integration**
- **Model**: Claude Opus 4.1 (primary)
- **Fallback Models**: Claude 3.5 Sonnet, Claude 3 Haiku
- **Knowledge Base**: 324 curated GStreamer documents
- **Context Window**: Large context for complex pipeline analysis

### **Expert System Tools**
1. **Element Search**: Find GStreamer elements by capability
2. **Documentation Retrieval**: Get detailed element documentation
3. **Pipeline Patterns**: Search working pipeline examples
4. **Issue Troubleshooting**: Diagnose and fix pipeline problems
5. **Performance Optimization**: Tune pipelines for specific requirements
6. **Compatibility Validation**: Check element chain compatibility
7. **Comprehensive Analysis**: Multi-tool orchestration for complex queries

## 🔍 **Monitoring & Debugging**

### **CloudWatch Metrics**
- **Invocation Count**: Track usage patterns
- **Duration**: Monitor performance trends
- **Error Rate**: Track failure patterns
- **Memory Utilization**: Monitor resource usage

### **Logging**
- **Structured Logging**: JSON format for easy parsing
- **Request Tracing**: Full request/response logging
- **Error Details**: Comprehensive error information
- **Performance Metrics**: Timing for different operations

### **Debug Mode**
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Detailed RTSP analysis
result = analyze_rtsp_stream(url, debug=True)
```

## 🛠️ **Troubleshooting**

### **Common Issues**
- **Memory Errors**: Increase Lambda memory allocation
- **Timeout Issues**: Optimize OpenCV processing or increase timeout
- **RTSP Connection Failures**: Check network connectivity and authentication
- **AI Model Errors**: Verify Bedrock permissions and model availability

### **Performance Optimization**
- **Frame Processing**: Reduce frame size for faster processing
- **Connection Reuse**: Implement connection pooling for multiple requests
- **Caching**: Cache analysis results for repeated streams
- **Parallel Processing**: Use threading for independent operations

---

**Note**: This Lambda function provides the core intelligence of the unified streaming platform, combining AI-powered expertise with real-time stream analysis capabilities.
