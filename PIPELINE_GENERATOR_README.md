# GStreamer Pipeline Generator for Kinesis Video Streams

This solution provides **dual-mode functionality** for RTSP stream analysis and GStreamer pipeline generation. It uses AWS Lambda with direct RTSP analysis and Amazon Bedrock to generate intelligent pipeline configurations with automatic authentication detection.

## 🏗️ Architecture Overview

```
RTSP Stream → Lambda (Dual-Mode Analysis) → Mode 1: Bedrock Agent → GStreamer Pipeline
                                         → Mode 2: Stream Characteristics → UI Integration
```

### Components

1. **Lambda Function**: Dual-mode RTSP analysis with comprehensive SDP extraction
2. **Bedrock Agent**: Analyzes stream data and generates optimized GStreamer pipelines using Claude Opus 4.1
3. **API Gateway**: Provides REST API access to both pipeline generation and stream analysis
4. **CDK Infrastructure**: Deploys and manages all AWS resources

## ✨ Features

### 🔄 **Dual-Mode Operation**
- **Mode 1 (Pipeline)**: Full GStreamer pipeline generation for existing workflows
- **Mode 2 (Characteristics)**: Fast stream validation and characteristics for UI integration

### 🔍 **Enhanced Stream Analysis**
- **Real Stream Analysis**: Direct RTSP SDP extraction (no mock data)
- **Comprehensive Codec Detection**: H.264, H.265/HEVC, AAC, G.711, and more
- **Detailed Stream Characteristics**: Framerates, bitrates, sample rates, profiles
- **Stream Metadata**: Title, description, server information extraction
- **Raw SDP Content**: Complete SDP data for advanced analysis

### 🔐 **Advanced Authentication**
- **Automatic Detection**: Real-time authentication method detection and reporting
- **Multi-Method Support**: None, Basic, Digest with security preference
- **Authentication Reporting**: Shows actual method used (None, Basic, Digest)

### 🚨 **Enhanced Error Detection**
- **Categorized Errors**: Network, authentication, and protocol error classification
- **Specific Suggestions**: Actionable error resolution guidance
- **Comprehensive Logging**: Detailed authentication and analysis logging

### ⚡ **Performance Optimized**
- **Mode 1**: 15s response time with full pipeline generation
- **Mode 2**: 0.3s response time for fast stream validation
- **Smart Pipeline Generation**: AI-powered optimization using Amazon Bedrock with Claude Opus 4.1

## 🚀 Deployment Status

### ✅ **Successfully Deployed & Tested**

#### **Service Endpoints**
- **API Gateway URL**: `https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/`
- **Pipeline Generation**: `https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline`
- **Stream Analysis**: Same endpoint with `"mode": "characteristics"` parameter

#### **Bedrock Agent**
- **Agent ID**: `0BFPX7EETQ`
- **Agent Alias ID**: `4LTDSXIL8Y`
- **Model**: Claude Opus 4.1 (anthropic.claude-opus-4-1-20250805-v1:0)
- **Status**: ✅ PREPARED and WORKING

#### **Lambda Function**
- **Function Name**: `PipelineGeneratorStack-SdpExtractorFunction0634AF6-KgGhfCv0dhM4`
- **Runtime**: Python 3.11
- **Status**: ✅ DEPLOYED and WORKING
- **Analysis Methods**: 
  - Mode 1: `DIRECT_RTSP_SDP_EXTRACTION_WITH_AUTO_AUTH_DETECTION`
  - Mode 2: `COMPREHENSIVE_RTSP_SDP_ANALYSIS_WITH_ENHANCED_PARSING`

## 🚀 API Usage

### **Mode 1: Pipeline Generation (Original)**
Generate GStreamer pipelines for existing workflows:

```bash
curl -X POST https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://user:pass@host/stream"}'
```

**Response**: Full GStreamer pipeline with stream analysis (~15s)

### **Mode 2: Stream Characteristics (New)**
Fast stream validation and characteristics for UI integration:

```bash
curl -X POST https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://user:pass@host/stream",
    "mode": "characteristics",
    "capture_frame": false
  }'
```

**Response**: Detailed stream characteristics with authentication method (~0.3s)

```json
{
  "stream_characteristics": {
    "video": {
      "codec": "H.265/HEVC",
      "framerate": "25.0 fps",
      "bitrate": "500 kbps",
      "clock_rate": "90000 Hz"
    },
    "audio": {
      "codec": "AAC",
      "sample_rate": "16000 Hz",
      "bitrate": "256 kbps"
    },
    "connection": {
      "authentication_method": "DIGEST"
    },
    "raw_sdp": "v=0\r\no=- 1754805623440865 1 IN IP4..."
  }
}
```

## 🧪 Testing

## 🧪 Testing

### **Available Test Scripts**

#### **1. Dual-Mode Comprehensive Test**
```bash
python3 test-scripts/test_dual_mode.py "rtsp://user:pass@host/stream"
```
Tests both pipeline generation and stream characteristics modes.

#### **2. Detailed Characteristics Test**
```bash
python3 test-scripts/test_characteristics_detailed.py "rtsp://user:pass@host/stream"
```
Comprehensive stream characteristics analysis with detailed output.

#### **3. Simple API Test**
```bash
python3 test-scripts/simple_api_test.py "rtsp://user:pass@host/stream"
```
Basic pipeline generation test (Mode 1 only).

#### **4. Advanced Pipeline Test**
```bash
python3 test-scripts/test-pipeline-generator.py --rtsp-url "rtsp://user:pass@host/stream" --test-type api
```
Advanced testing with multiple test types (lambda, api, agent).

### **Verified Test Cases**
- ✅ **H.265/HEVC Camera**: Successfully analyzed and generated H.265 pipeline
- ✅ **Digest Authentication**: Automatically detected and authenticated
- ✅ **Real SDP Extraction**: Actual stream parameters extracted from camera
- ✅ **Dual-Mode Operation**: Both pipeline generation and characteristics working
- ✅ **Performance**: Mode 1 (~15s), Mode 2 (~0.3s)
- ✅ **Authentication Detection**: Real-time method detection (None, Basic, Digest)
- ✅ **Raw SDP Inclusion**: Complete SDP content available for analysis

### **Test Results Summary**
```
🎯 DUAL-MODE TEST RESULTS
Pipeline Generation: ✅ SUCCESS (15.2s)
Stream Characteristics: ✅ SUCCESS (0.3s)

📊 Stream Analysis:
• Video: H.265/HEVC @ 25.0 fps, 500 kbps
• Audio: AAC @ 16000 Hz, 256 kbps
• Authentication: DIGEST
• Raw SDP: 863 characters included
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
