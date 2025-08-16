# GStreamer Pipeline Generator with OpenCV Frame Extraction

This CDK application deploys a serverless pipeline generator that analyzes RTSP video streams and generates optimized GStreamer pipelines for Amazon Kinesis Video Streams ingestion. The system now includes **OpenCV-powered frame extraction** capabilities running in AWS Lambda.

## 🚀 Features

### Core Capabilities
- **RTSP Stream Analysis**: Automatic detection of video/audio codecs, bitrates, and stream characteristics
- **Authentication Support**: Automatic detection and handling of DIGEST, Basic, and no-auth RTSP streams
- **GStreamer Pipeline Generation**: AI-powered pipeline generation using Amazon Bedrock agents
- **OpenCV Frame Extraction**: Real-time frame capture and analysis from RTSP streams
- **Serverless Architecture**: Fully serverless using AWS Lambda, API Gateway, and Amazon Bedrock
- **CORS-Enabled API**: Properly configured for frontend integration with localhost development

### New OpenCV Integration
- **Frame Capture**: Extract frames from live RTSP streams using OpenCV
- **Image Processing**: Automatic resizing and optimization for analysis
- **Format Support**: JPEG encoding with base64 output for easy integration
- **Performance Optimized**: Efficient frame extraction with configurable timeouts
- **Container-Based**: OpenCV runs in AWS Lambda using container images

### Frontend Integration
- **React Frontend**: Complete RTSP stream testing interface (see `../frontend-app/`)
- **CORS Support**: API Gateway configured for localhost development
- **Real-time Preview**: Frame extraction with visual preview capabilities

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   API Gateway   │───▶│  Lambda Function │───▶│ Amazon Bedrock  │
│                 │    │  (OpenCV + SDP)  │    │     Agent       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  RTSP Stream    │
                       │   Analysis      │
                       └─────────────────┘
```

## 📋 Prerequisites

- AWS CLI configured with appropriate permissions
- AWS CDK v2 installed
- Docker installed and running
- Node.js 18+ (though Node 20+ recommended)
- Python 3.11+ for local testing

## 🚀 Deployment

### 1. Install Dependencies
```bash
cd cdk-pipeline-generator
npm install
```

### 2. Deploy the Stack
```bash
# IMPORTANT: Set Docker to use legacy builder for Lambda compatibility
# This is required to avoid multi-platform manifest issues with AWS Lambda
export DOCKER_BUILDKIT=0

# Deploy with your AWS profile
AWS_PROFILE=your-profile cdk deploy --require-approval never

# Alternative one-liner:
DOCKER_BUILDKIT=0 AWS_PROFILE=your-profile cdk deploy --require-approval never
```

### 3. Note the Outputs
The deployment will output:
- `ApiEndpoint`: The API Gateway endpoint for pipeline generation
- `BedrockAgentId`: The Bedrock agent ID for pipeline generation
- `LambdaFunctionName`: The Lambda function name for direct invocation

## 🔧 Usage

### Stream Characteristics Analysis
```bash
curl -X POST https://your-api-endpoint/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "mode": "characteristics",
    "capture_frame": true
  }'
```

### Response Format
```json
{
  "stream_characteristics": {
    "video": {
      "codec": "H.265/HEVC",
      "bitrate": "500 kbps",
      "framerate": "25.0 fps",
      "resolution_info": "Available in SPS/PPS"
    },
    "audio": {
      "codec": "AAC",
      "sample_rate": "16000 Hz",
      "bitrate": "256 kbps"
    },
    "connection": {
      "authentication_method": "DIGEST",
      "connection_time": "0.16s"
    },
    "frame_capture": {
      "width": 640,
      "height": 180,
      "format": "JPEG",
      "size_bytes": 44361,
      "capture_time_ms": 5480.2,
      "original_width": 7680,
      "original_height": 2160,
      "extraction_method": "OpenCV",
      "frame_data": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQ..."
    }
  }
}
```

### GStreamer Pipeline Generation
```bash
curl -X POST https://your-api-endpoint/prod/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "mode": "pipeline"
  }'
```

## 🐳 Container Architecture

The Lambda function uses a custom container image that includes:

### Base Image
- `public.ecr.aws/lambda/python:3.11` - AWS Lambda Python runtime

### System Dependencies
- **OpenCV Dependencies**: mesa-libGL, glib2, libSM, libXext, libXrender, libgomp
- **Python Libraries**: opencv-python-headless, boto3, botocore

### Build Process
- Uses legacy Docker builder (`DOCKER_BUILDKIT=0`) for Lambda compatibility
- Optimized for cold start performance
- Includes comprehensive error handling and logging

## 🔍 OpenCV Frame Extraction

### Features
- **Real-time Capture**: Extract frames from live RTSP streams
- **Automatic Resizing**: Configurable output dimensions (default: 640px width)
- **Format Optimization**: JPEG compression with quality settings
- **Error Handling**: Graceful fallback when frame extraction fails
- **Performance Monitoring**: Detailed timing and size metrics

### Configuration
Frame extraction can be customized through environment variables:
- `FRAME_WIDTH`: Output frame width (default: 640)
- `FRAME_TIMEOUT`: Capture timeout in seconds (default: 30)
- `JPEG_QUALITY`: JPEG compression quality 1-100 (default: 85)

## 🧪 Testing

### Run Test Scripts
```bash
# Test basic functionality
./test-scripts/test-basic-functionality.sh

# Test frame extraction
./test-scripts/test-frame-extraction.sh

# Test authentication methods
./test-scripts/test-authentication.sh
```

### Local Testing
```bash
# Test the deployed function
python3 test-scripts/test-opencv-integration.py
```

## 🔧 Troubleshooting

### Common Issues

1. **Docker Manifest Error**
   ```
   Solution: Use DOCKER_BUILDKIT=0 before deployment
   ```

2. **OpenCV Import Error**
   ```
   Solution: Ensure system dependencies are installed in container
   ```

3. **Frame Extraction Timeout**
   ```
   Solution: Increase Lambda timeout or reduce frame capture timeout
   ```

4. **Authentication Failures**
   ```
   Solution: Verify RTSP credentials and authentication method
   ```

### Debugging
- Check CloudWatch logs: `/aws/lambda/PipelineGeneratorStack-SdpExtractorFunction*`
- Enable API Gateway logging for detailed request/response debugging
- Use direct Lambda invocation for testing without API Gateway

## 📊 Performance

### Metrics
- **Cold Start**: ~5.8 seconds (includes OpenCV initialization)
- **Warm Start**: ~150ms for stream analysis
- **Frame Extraction**: 2-8 seconds depending on stream quality
- **Memory Usage**: ~104MB peak usage

### Optimization Tips
- Use provisioned concurrency for consistent performance
- Configure appropriate Lambda timeout (600s recommended)
- Monitor CloudWatch metrics for optimization opportunities

## 🔐 Security

### IAM Permissions
The Lambda function requires:
- `bedrock:InvokeAgent` - For pipeline generation
- `logs:CreateLogGroup`, `logs:CreateLogStream`, `logs:PutLogEvents` - For logging

### Network Security
- Lambda function can access internet for RTSP connections
- No VPC configuration required for basic functionality
- Consider VPC deployment for private network access

## 🚀 Advanced Usage

### Custom Pipeline Templates
Modify the Bedrock agent knowledge base to include custom pipeline templates for specific camera models or use cases.

### Batch Processing
Use the frame extraction capability to process multiple streams:
```python
import requests
import concurrent.futures

def process_stream(rtsp_url):
    response = requests.post(api_endpoint, json={
        "rtsp_url": rtsp_url,
        "mode": "characteristics",
        "capture_frame": True
    })
    return response.json()

# Process multiple streams concurrently
with concurrent.futures.ThreadPoolExecutor() as executor:
    results = list(executor.map(process_stream, rtsp_urls))
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
