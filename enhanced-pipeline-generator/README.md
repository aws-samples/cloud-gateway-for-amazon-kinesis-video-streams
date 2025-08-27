# Enhanced GStreamer Pipeline Generator

**Phase 7: Cloud Gateway Integration - Production-Ready Serverless GStreamer Expert System**

This enhanced pipeline generator combines the sophisticated GStreamer expertise from the `bedrock-gstreamer` project with the serverless RTSP analysis capabilities of the original `cloud-gateway` project, creating a world-class solution for GStreamer pipeline generation.

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

### 1. Deploy the Enhanced Stack

```bash
cd enhanced-pipeline-generator

# One-command deployment
./deploy.sh
```

### 2. Alternative Manual Deployment

```bash
# Install dependencies
npm install

# Deploy with Docker legacy builder (required for Lambda)
DOCKER_BUILDKIT=0 npm run deploy
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
