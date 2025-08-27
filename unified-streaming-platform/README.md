# Unified GStreamer Pipeline & Camera Management System

**Version**: 3.0 - Unified System  
**Status**: Production Ready  
**Architecture**: Serverless with Complete Feature Set  

This unified system consolidates all GStreamer pipeline generation and camera management functionality into a single, comprehensive serverless solution.

## 🚀 **Unified Features**

### **🧠 GStreamer Expert System**
- **7 Specialized Tools**: Element search, troubleshooting, optimization, validation, and comprehensive assistance
- **324-Document Knowledge Base**: Comprehensive GStreamer expertise with Claude Opus 4.1
- **Shared Core Logic**: Identical functionality with MCP server for consistency

### **📡 RTSP Stream Analysis**
- **Real-time Analysis**: Live stream introspection with SDP parsing
- **Authentication Support**: Automatic detection and handling of DIGEST, Basic, and no-auth streams
- **Codec Detection**: Automatic video/audio codec identification
- **Performance Metrics**: Connection timing and stream characteristics

### **🖼️ OpenCV Frame Extraction**
- **Real-time Capture**: Extract frames from live RTSP streams
- **Intelligent Processing**: Automatic resizing and optimization
- **Base64 Encoding**: Web-ready format for frontend integration
- **Comprehensive Metadata**: Timing, dimensions, and quality information

### **📹 Camera Management**
- **Complete CRUD Operations**: Create, read, update, delete camera configurations
- **Secure Credential Storage**: RTSP credentials in AWS Secrets Manager
- **User Authentication**: Cognito-based authorization and user isolation
- **Metadata Management**: Stream characteristics and preview images

## 🏗️ **Unified Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    Unified API Gateway                          │
├─────────────────────────────────────────────────────────────────┤
│  Pipeline Generation Endpoints                                  │
│  ├── /v1/generate-pipeline (Enhanced pipeline generation)       │
│  ├── /v1/characteristics (RTSP analysis + frame capture)        │
│  ├── /v1/tools/search-elements (Element search)                 │
│  ├── /v1/tools/troubleshoot (Pipeline troubleshooting)          │
│  ├── /v1/tools/optimize (Performance optimization)              │
│  ├── /v1/tools/validate (Compatibility validation)              │
│  └── /v1/tools/expert (Comprehensive assistance)                │
├─────────────────────────────────────────────────────────────────┤
│  Camera Management Endpoints                                    │
│  ├── /cameras (List cameras - GET)                              │
│  ├── /cameras (Create camera - POST)                            │
│  ├── /cameras/{id} (Get camera - GET)                           │
│  ├── /cameras/{id} (Update camera - PUT)                        │
│  └── /cameras/{id} (Delete camera - DELETE)                     │
├─────────────────────────────────────────────────────────────────┤
│  Lambda Functions                                               │
│  ├── Enhanced Pipeline Function (3GB, 10min timeout)            │
│  │   ├── GStreamer Expert System                                │
│  │   ├── RTSP Analysis Module                                   │
│  │   └── OpenCV Frame Extraction                                │
│  └── Camera Management Function (512MB, 30s timeout)            │
│      ├── DynamoDB Operations                                    │
│      └── Secrets Manager Integration                            │
├─────────────────────────────────────────────────────────────────┤
│  AWS Services                                                   │
│  ├── Bedrock Knowledge Base (5CGJIOV1QM - 324 documents)        │
│  ├── Claude Opus 4.1 Model                                      │
│  ├── DynamoDB (Camera configurations)                           │
│  ├── Secrets Manager (RTSP credentials)                         │
│  ├── Cognito (User authentication)                              │
│  └── CloudWatch (Logging and monitoring)                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 **One-Command Deployment**

```bash
cd enhanced-pipeline-generator

# Deploy the complete unified system
./deploy.sh
```

## 🔧 **Complete API Reference**

### **Enhanced Pipeline Generation**

Generate optimized GStreamer pipelines with expert analysis:

```bash
curl -X POST https://your-api-endpoint/v1/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "mode": "pipeline",
    "analyze_stream": true,
    "capture_frame": true
  }'
```

### **RTSP Stream Analysis with Frame Capture**

```bash
curl -X POST https://your-api-endpoint/v1/characteristics \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "capture_frame": true
  }'
```

### **Specialized Expert Tools**

```bash
# Element search
curl -X POST https://your-api-endpoint/v1/tools/search-elements \
  -H "Content-Type: application/json" \
  -d '{"query": "NVIDIA hardware encoders"}'

# Pipeline troubleshooting
curl -X POST https://your-api-endpoint/v1/tools/troubleshoot \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "gst-launch-1.0 rtspsrc location=rtsp://... ! kvssink",
    "issue": "Pipeline fails with green screen artifacts"
  }'

# Performance optimization
curl -X POST https://your-api-endpoint/v1/tools/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "gst-launch-1.0 rtspsrc location=rtsp://... ! kvssink",
    "goals": "minimize latency and improve quality"
  }'
```

### **Camera Management** (Requires Authentication)

```bash
# Create camera configuration
curl -X POST https://your-api-endpoint/cameras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_COGNITO_TOKEN" \
  -d '{
    "camera_name": "Front Door Camera",
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "make_model": "Hikvision DS-2CD2143G0-I",
    "installation_location": "Front entrance",
    "retention_hours": 168,
    "ml_model": "person-detection"
  }'

# List user cameras
curl -X GET https://your-api-endpoint/cameras \
  -H "Authorization: Bearer YOUR_COGNITO_TOKEN"

# Get specific camera
curl -X GET https://your-api-endpoint/cameras/{camera-id} \
  -H "Authorization: Bearer YOUR_COGNITO_TOKEN"
```

## 📊 **System Capabilities**

### **Performance Specifications**
- **RTSP Analysis**: < 5 seconds for most streams
- **Frame Extraction**: < 10 seconds including capture
- **Pipeline Generation**: < 15 seconds for complex analysis
- **Expert Tool Queries**: < 3 seconds for knowledge base queries
- **Camera Management**: < 1 second for CRUD operations

### **Scalability**
- **Concurrent Executions**: AWS Lambda default limits
- **API Gateway**: 10,000 requests per second
- **DynamoDB**: On-demand auto-scaling
- **Knowledge Base**: Bedrock service limits

### **Security**
- **Public Endpoints**: Pipeline generation (no auth required)
- **Protected Endpoints**: Camera management (Cognito auth required)
- **Data Encryption**: At rest and in transit
- **Credential Security**: AWS Secrets Manager integration

## 🧪 **Testing the Unified System**

### **Test Pipeline Generation**
```bash
# Test basic RTSP analysis
python3 -c "
import requests
response = requests.post('https://your-api-endpoint/v1/characteristics', 
    json={'rtsp_url': 'rtsp://test-stream', 'capture_frame': True})
print(response.json())
"
```

### **Test Expert System**
```bash
# Test element search
python3 -c "
import requests
response = requests.post('https://your-api-endpoint/v1/tools/search-elements',
    json={'query': 'kvssink properties'})
print(response.json())
"
```

## 🔄 **Migration from Previous Systems**

### **What Was Consolidated**
- ✅ **Enhanced Pipeline Generator**: Core system (kept and enhanced)
- ✅ **Camera Management**: Integrated from CDK pipeline generator
- ❌ **CDK Pipeline Generator**: Deprecated (Bedrock Agent approach removed)
- ❌ **lambda-sdp-extractor**: Redundant (functionality integrated)

### **Backward Compatibility**
- All existing API endpoints maintained
- Response formats preserved with additional fields
- Frontend integration requires no changes
- Gradual migration supported

## 🎯 **Benefits of Unified System**

### **Simplified Architecture**
- **Single Deployment**: One CDK stack for everything
- **Unified API**: All endpoints in one API Gateway
- **Consistent Monitoring**: Single CloudWatch log group
- **Reduced Complexity**: No duplicate functionality

### **Cost Optimization**
- **Eliminated Bedrock Agent**: Direct knowledge base access is more efficient
- **Consolidated Resources**: Shared API Gateway and monitoring
- **Optimized Lambda Functions**: Right-sized for specific tasks

### **Enhanced Functionality**
- **Complete Feature Set**: All capabilities in one system
- **Consistent Experience**: Same expert system logic as MCP server
- **Improved Performance**: Optimized for unified workflows

## 🚀 **Next Steps**

1. **Deploy Unified System**: Use `./deploy.sh` for complete deployment
2. **Test All Endpoints**: Validate pipeline generation and camera management
3. **Update Frontend**: Point to new unified API endpoints
4. **Monitor Performance**: Use CloudWatch for system monitoring
5. **Clean Up Old Systems**: Remove deprecated CDK pipeline generator

---

**🎯 The unified system provides world-class GStreamer pipeline generation with comprehensive camera management in a single, production-ready serverless architecture!**

## 🚀 Features

### **Core Capabilities**
- **🧠 Expert System Integration**: 324-document knowledge base with Claude Opus 4.1
- **📡 RTSP Stream Analysis**: Automatic codec detection and stream characteristics
- **🖼️ OpenCV Frame Extraction**: Real-time frame capture and analysis
- **⚡ Serverless Architecture**: AWS Lambda + API Gateway for scalability
- **🔧 7 Specialized Tools**: Element search, troubleshooting, optimization, and more

### **Enhanced Pipeline Generation**
- **Context-Aware**: Analyzes RTSP streams and generates optimized pipelines
- **Platform-Specific**: Automatic detection and optimization for Linux, macOS, Windows
- **Quality-Focused**: Comprehensive troubleshooting and performance optimization
- **KVS-Optimized**: Specialized for Amazon Kinesis Video Streams integration

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                Enhanced Pipeline Generator                  │
├─────────────────────────────────────────────────────────────┤
│  API Gateway Endpoints                                      │
│  ├── /v1/generate-pipeline (enhanced pipeline generation)   │
│  ├── /v1/characteristics (RTSP stream analysis)            │
│  ├── /v1/tools/search-elements (element search)            │
│  ├── /v1/tools/troubleshoot (pipeline troubleshooting)     │
│  ├── /v1/tools/optimize (performance optimization)         │
│  └── /v1/tools/expert (comprehensive assistance)           │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Lambda Function                                   │
│  ├── RTSP Analysis Module (rtsp_analysis.py)               │
│  ├── GStreamer Expert System (gstreamer_expert.py)         │
│  ├── OpenCV Frame Extraction                               │
│  └── Knowledge Base Integration (KB: 5CGJIOV1QM)           │
├─────────────────────────────────────────────────────────────┤
│  AWS Services                                               │
│  ├── Bedrock Knowledge Base (324 documents)                │
│  ├── Claude Opus 4.1 Model                                 │
│  └── CloudWatch Logging & Monitoring                       │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- **AWS CLI** configured with appropriate permissions
- **AWS CDK v2** installed (`npm install -g aws-cdk`)
- **Docker** installed and running
- **Node.js 18+** (Node 20+ recommended)
- **Python 3.11+** for local testing

## 🚀 Quick Deployment

### 1. Deploy the Unified Platform

```bash
cd unified-streaming-platform

# Deploy unified platform only
./deploy.sh

# Deploy with optional RTSP Test Server for testing
./deploy.sh --with-rtsp-test-server
```

### 2. Alternative Manual Deployment

```bash
# Install dependencies
npm install

# Deploy unified platform only
DOCKER_BUILDKIT=0 cdk deploy --parameters DeployRtspTestServer=false

# Deploy with RTSP Test Server
DOCKER_BUILDKIT=0 cdk deploy --parameters DeployRtspTestServer=true
```

## 🔧 API Usage

### **Enhanced Pipeline Generation**

Generate optimized GStreamer pipelines with expert system analysis:

```bash
curl -X POST https://your-api-endpoint/v1/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "mode": "pipeline",
    "analyze_stream": true
  }'
```

**Response:**
```json
{
  "pipeline_response": "Complete optimized GStreamer pipeline with explanations...",
  "context": {
    "source_type": "rtsp",
    "destinations": ["kvs"],
    "platform": "linux",
    "video_codec": "H264",
    "audio_codec": "AAC"
  },
  "stream_analysis": {
    "video": {"codec": "H264", "bitrate": "Variable"},
    "audio": {"codec": "AAC", "sample_rate": "48000"}
  },
  "enhanced": true
}
```

### **RTSP Stream Analysis**

Analyze RTSP streams with OpenCV frame extraction:

```bash
curl -X POST https://your-api-endpoint/v1/characteristics \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "capture_frame": true
  }'
```

### **Element Search**

Search for GStreamer elements with expert knowledge:

```bash
curl -X POST https://your-api-endpoint/v1/tools/search-elements \
  -H "Content-Type: application/json" \
  -d '{
    "query": "NVIDIA hardware encoders"
  }'
```

### **Pipeline Troubleshooting**

Get expert troubleshooting assistance:

```bash
curl -X POST https://your-api-endpoint/v1/tools/troubleshoot \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "gst-launch-1.0 rtspsrc location=rtsp://... ! rtph264depay ! h264parse ! kvssink",
    "issue": "Pipeline fails with green screen artifacts"
  }'
```

### **Performance Optimization**

Optimize pipelines for specific goals:

```bash
curl -X POST https://your-api-endpoint/v1/tools/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "gst-launch-1.0 rtspsrc location=rtsp://... ! kvssink",
    "goals": "minimize latency and improve quality"
  }'
```

## 🧪 Testing

### **Test Enhanced Capabilities**

```bash
# Test basic pipeline generation
python3 test_enhanced_pipeline.py

# Test all specialized tools
python3 test_all_tools.py

# Test RTSP analysis with frame extraction
python3 test_rtsp_analysis.py
```

### **Performance Testing**

```bash
# Test response times and accuracy
python3 performance_test.py

# Load testing
python3 load_test.py
```

## 🔍 Monitoring & Debugging

### **CloudWatch Logs**

Monitor Lambda execution:
```bash
aws logs tail /aws/lambda/EnhancedPipelineGeneratorStack-EnhancedPipelineFunction --follow
```

### **API Gateway Logs**

Enable API Gateway logging for detailed request/response debugging.

### **Performance Metrics**

- **Cold Start**: ~8-12 seconds (includes OpenCV and expert system initialization)
- **Warm Start**: ~200-500ms for pipeline generation
- **Frame Extraction**: 2-10 seconds depending on stream quality
- **Memory Usage**: ~512MB-1GB peak usage

## 🔐 Security & Permissions

### **Required IAM Permissions**

The Lambda function requires:
- `bedrock:InvokeModel` - For Claude Opus 4.1 access
- `bedrock:Retrieve` - For knowledge base queries
- `logs:*` - For CloudWatch logging

### **Network Security**

- Lambda function can access internet for RTSP connections
- No VPC configuration required for basic functionality
- Consider VPC deployment for private network access

## 🎯 Integration with Existing Systems

### **Backward Compatibility**

The enhanced system maintains full backward compatibility with the original cloud-gateway API:

- Existing `/generate-pipeline` endpoint enhanced with expert capabilities
- Original response format preserved with additional `enhanced: true` flag
- All existing test scripts and frontend integrations continue to work

### **Frontend Integration**

Update your frontend to use enhanced capabilities:

```javascript
// Enhanced pipeline generation with stream analysis
const response = await fetch('/v1/generate-pipeline', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rtsp_url: 'rtsp://camera/stream',
    mode: 'pipeline',
    analyze_stream: true,
    capture_frame: true
  })
});

const result = await response.json();
console.log('Enhanced pipeline:', result.pipeline_response);
console.log('Stream analysis:', result.stream_analysis);
```

## 📊 Performance Optimization

### **Provisioned Concurrency**

For consistent performance, enable provisioned concurrency:

```bash
aws lambda put-provisioned-concurrency-config \
  --function-name EnhancedPipelineGeneratorStack-EnhancedPipelineFunction \
  --provisioned-concurrency-config AllocatedConcurrency=5
```

### **Memory Optimization**

Adjust Lambda memory based on usage patterns:
- **Basic pipeline generation**: 1024MB
- **With frame extraction**: 2048MB
- **Heavy optimization tasks**: 3008MB

## 🔄 Migration from Original Cloud Gateway

### **Gradual Migration**

1. **Deploy Enhanced System**: Deploy alongside existing system
2. **Test Endpoints**: Validate all enhanced capabilities
3. **Update Frontend**: Gradually migrate to enhanced endpoints
4. **Monitor Performance**: Ensure acceptable response times
5. **Full Migration**: Switch all traffic to enhanced system

### **Rollback Strategy**

The original cloud-gateway system remains available for rollback if needed.

## 🚀 Advanced Usage

### **Custom Knowledge Base Queries**

The system uses the existing knowledge base (5CGJIOV1QM) from the bedrock-gstreamer project. To update or enhance the knowledge base, use the tools in the `gstreamer-expert-system/knowledgebase/` directory.

### **Batch Processing**

Process multiple streams concurrently:

```python
import asyncio
import aiohttp

async def process_streams(rtsp_urls):
    async with aiohttp.ClientSession() as session:
        tasks = []
        for url in rtsp_urls:
            task = session.post(api_endpoint, json={
                "rtsp_url": url,
                "mode": "pipeline",
                "analyze_stream": True
            })
            tasks.append(task)
        
        responses = await asyncio.gather(*tasks)
        return [await r.json() for r in responses]
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Update documentation
5. Submit a pull request

## 🐛 Troubleshooting

### **Common Issues**

1. **Docker Manifest Error**
   ```
   Solution: Always use DOCKER_BUILDKIT=0 for Lambda deployment
   ```

2. **Knowledge Base Access Error**
   ```
   Solution: Verify IAM permissions for bedrock:Retrieve
   ```

3. **OpenCV Import Error**
   ```
   Solution: Ensure container includes all OpenCV dependencies
   ```

4. **High Cold Start Times**
   ```
   Solution: Enable provisioned concurrency or optimize container size
   ```

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Acknowledgments

This enhanced system builds upon:
- **Original Cloud Gateway Project**: Serverless RTSP analysis and OpenCV integration
- **Bedrock GStreamer Expert**: Sophisticated knowledge base and expert system
- **AWS Bedrock**: Claude Opus 4.1 and knowledge base services
- **GStreamer Community**: Comprehensive multimedia framework

---

**🎯 Ready to generate world-class GStreamer pipelines? Deploy the enhanced system and experience the power of AI-driven pipeline generation!**
