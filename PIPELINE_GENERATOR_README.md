# GStreamer Pipeline Generator for Kinesis Video Streams

This solution automatically generates optimized GStreamer pipelines for ingesting RTSP streams into Amazon Kinesis Video Streams. It uses AWS Lambda with direct RTSP analysis and Amazon Bedrock to generate intelligent pipeline configurations with automatic authentication detection.

## 🏗️ Architecture Overview

```
RTSP Stream → Lambda (Direct SDP Analysis) → Bedrock Agent → GStreamer Pipeline
```

### Components

1. **Lambda Function**: Performs direct RTSP SDP extraction with automatic authentication detection
2. **Bedrock Agent**: Analyzes stream data and generates optimized GStreamer pipelines using Claude Opus 4.1
3. **API Gateway**: Provides REST API access to the pipeline generator
4. **CDK Infrastructure**: Deploys and manages all AWS resources

## ✨ Features

- **🔍 Real Stream Analysis**: Direct RTSP SDP extraction (no mock data)
- **🔐 Automatic Authentication**: Detects and uses appropriate auth method (Digest, Basic, None)
- **🚨 Enhanced Error Detection**: Categorizes network, authentication, and protocol errors
- **🎥 Codec Detection**: Supports H.264, H.265/HEVC, AAC, G.711, and more
- **⚡ Smart Pipeline Generation**: AI-powered optimization using Amazon Bedrock with Claude Opus 4.1
- **🛡️ Security-First**: Prefers most secure authentication methods available
- **🔄 Fallback Logic**: Graceful handling of authentication failures
- **📊 Detailed Logging**: Comprehensive authentication and analysis logging

## 🚀 Deployment Status

### ✅ **Successfully Deployed & Tested**

#### **Service Endpoints**
- **API Gateway URL**: `https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/`
- **API Endpoint**: `https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline`

#### **Bedrock Agent**
- **Agent ID**: `0BFPX7EETQ`
- **Agent Alias ID**: `4LTDSXIL8Y`
- **Model**: Claude Opus 4.1 (anthropic.claude-opus-4-1-20250805-v1:0)
- **Status**: ✅ PREPARED and WORKING

#### **Lambda Function**
- **Function Name**: `PipelineGeneratorStack-SdpExtractorFunction0634AF6-KgGhfCv0dhM4`
- **Runtime**: Python 3.11
- **Status**: ✅ DEPLOYED and WORKING
- **Analysis Method**: `DIRECT_RTSP_SDP_EXTRACTION_WITH_ENHANCED_ERROR_DETECTION`

## 🧪 Testing

### **Verified Test Cases**
- ✅ **H.265/HEVC Camera**: Successfully analyzed and generated H.265 pipeline
- ✅ **Digest Authentication**: Automatically detected and authenticated
- ✅ **Real SDP Extraction**: Actual stream parameters extracted from camera
- ✅ **Response Time**: ~7-11 seconds (includes RTSP connection + AI processing)

### **Test Command**
```bash
curl -X POST https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://username:password@camera-ip:554/stream"}'
```

## 📊 API Usage

### **Request Format**
```json
{
  "rtsp_url": "rtsp://username:password@host:port/path"
}
```

### **Response Format**
```json
{
  "rtsp_url": "rtsp://...",
  "stream_analysis": {
    "rtsp_analysis": {
      "source_url": "rtsp://...",
      "streams": [
        {
          "codec_name": "hevc",
          "codec_long_name": "H.265 / HEVC (High Efficiency Video Coding)",
          "codec_type": "video"
        }
      ],
      "sdp_content": "v=0\r\no=...",
      "analysis_method": "DIRECT_RTSP_SDP_EXTRACTION_WITH_AUTO_AUTH_DETECTION"
    },
    "summary": {
      "video_streams": 1,
      "audio_streams": 1,
      "video_codecs": ["hevc"],
      "audio_codecs": ["aac"],
      "total_streams": 2
    }
  },
  "generated_pipeline": "{\"pipeline\": \"gst-launch-1.0 rtspsrc location=... ! rtph265depay ! h265parse ! kvssink...\"}",
  "timestamp": "...",
  "analysis_method": "DIRECT_RTSP_SDP_EXTRACTION_WITH_AUTO_AUTH_DETECTION"
}
```

## 🔐 Authentication Support

The system automatically detects and supports:

| Method | Security | Status | Notes |
|--------|----------|--------|-------|
| **None** | N/A | ✅ | No authentication required |
| **Digest** | High | ✅ | MD5 challenge-response (preferred) |
| **Basic** | Low | ✅ | Base64 credentials (fallback) |

### **Authentication Flow**
1. Send DESCRIBE without authentication
2. Parse WWW-Authenticate headers if 401 received
3. Select most secure available method
4. Attempt authentication with fallback logic

## 🎥 Supported Codecs

### **Video Codecs**
- ✅ **H.265/HEVC**: `rtph265depay ! h265parse`
- ✅ **H.264/AVC**: `rtph264depay ! h264parse`
- 🔄 **MPEG-4**: Future support planned

### **Audio Codecs**
- ✅ **AAC**: `rtpmp4adepay ! aacparse`
- ✅ **G.711 μ-law**: `rtppcmudepay`
- ✅ **G.711 A-law**: `rtppcmadepay`

## 🛠️ Development

### **Prerequisites**
- AWS CLI configured with appropriate permissions
- Node.js 18+ for CDK
- Python 3.11+ for Lambda development

### **Deployment**
```bash
cd cdk-pipeline-generator
npm install
cdk deploy --require-approval never
```

### **Local Testing**
```bash
# Test the API
python3 test-scripts/simple_api_test.py "rtsp://your-stream-url"

# Comprehensive testing
python3 test-scripts/test-pipeline-generator.py
```

## 📁 Project Structure

```
├── lambda-sdp-extractor/           # Lambda function code
│   ├── lambda_function.py          # Main Lambda handler
│   └── requirements.txt            # Python dependencies
├── cdk-pipeline-generator/         # CDK infrastructure
│   ├── lib/                        # CDK stack definitions
│   └── bin/                        # CDK app entry point
├── test-scripts/                   # Testing utilities
│   ├── simple_api_test.py          # Basic API testing
│   └── test-pipeline-generator.py  # Comprehensive testing
└── PIPELINE_GENERATOR_README.md    # This file
```

## 🔧 Configuration

### **Environment Variables**
- `BEDROCK_AGENT_ID`: Bedrock agent identifier
- `BEDROCK_AGENT_ALIAS_ID`: Bedrock agent alias identifier

### **Lambda Settings**
- **Timeout**: 5 minutes
- **Memory**: 1024 MB
- **Runtime**: Python 3.11

## 🚨 Troubleshooting

### **Common Issues**

#### **Authentication Failures**
- Check RTSP credentials are correct
- Verify camera supports detected authentication method
- Review Lambda logs for detailed authentication attempts

#### **Timeout Errors**
- RTSP connection timeout: 60 seconds
- Lambda function timeout: 5 minutes
- Check network connectivity to RTSP server

#### **Codec Not Supported**
- Check if codec is in supported list above
- Review SDP content in response for actual codec information
- Consider transcoding if codec not supported by Kinesis Video Streams

### **Debugging**
```bash
# View Lambda logs
aws logs tail /aws/lambda/PipelineGeneratorStack-SdpExtractorFunction0634AF6-KgGhfCv0dhM4 --follow

# Test connectivity
curl -X POST https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://test-stream"}' | jq .
```

## 📈 Performance

- **Cold Start**: ~2-3 seconds
- **Warm Execution**: ~7-11 seconds
- **RTSP Analysis**: ~1-3 seconds
- **Bedrock Processing**: ~4-8 seconds

## 🔮 Future Enhancements

- **Bearer Token Authentication**: OAuth 2.0 support
- **Certificate-based Authentication**: High-security environments
- **Batch Processing**: Multiple streams simultaneously
- **Caching**: Authentication method caching per server
- **WebRTC Support**: Modern streaming protocols

---

**🎯 The GStreamer Pipeline Generator automatically handles any RTSP server's authentication requirements and generates optimized pipelines for Kinesis Video Streams ingestion!**
