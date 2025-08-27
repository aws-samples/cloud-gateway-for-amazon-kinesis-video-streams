# GStreamer Expert MCP Server

An MCP (Model Context Protocol) server that provides Amazon Q Developer with access to a comprehensive GStreamer Expert Bedrock Agent.

## Overview

This MCP server enables Amazon Q Developer to query a specialized Bedrock Agent with extensive knowledge of:

- **GStreamer Core Framework**: Complete documentation and all plugin categories
- **Amazon Kinesis Video Streams**: Producer SDK for C++ integration
- **OpenVINO Integration**: GStreamer plugins and DLStreamer
- **NVIDIA Acceleration**: GStreamer plugins and DeepStream SDK
- **Production Code Generation**: Complete, ready-to-use solutions

## Features

### 🎯 Expert Knowledge Base
- 17,353 optimized documentation files
- Comprehensive GStreamer ecosystem coverage
- Real-world code examples and sample applications
- Hardware acceleration guidance (VAAPI, NVENC, NVDEC)

### 🚀 Capabilities
- Generate production-ready GStreamer pipelines
- Create complete C/C++ and Python applications
- Provide hardware acceleration recommendations
- Debug and optimize existing implementations
- Integrate with cloud services (Kinesis Video Streams)
- AI inference integration (OpenVINO, NVIDIA)

### 💰 Cost Optimized
- S3 Vectors backend (99.97% cost reduction vs OpenSearch)
- Sub-second query performance
- Focused on technical documentation content

## Setup

1. **Run the setup script:**
   ```bash
   cd /Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert
   ./setup.sh
   ```

2. **Test the server:**
   ```bash
   source venv/bin/activate
   python server_final.py
   ```

## Integration with Amazon Q CLI

Add this MCP server to your Amazon Q CLI configuration:

```json
{
  "mcpServers": {
    "gstreamer-expert": {
      "command": "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/venv/bin/python",
      "args": ["/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/server_final.py"],
      "env": {
        "AWS_PROFILE": "malone-aws"
      }
    }
  }
}
```

## Usage Examples

Once integrated, Amazon Q Developer can use the GStreamer expert for queries like:

### Basic Pipeline Creation
- "Create a GStreamer pipeline to convert MP4 to WebM"
- "Show me how to capture webcam video and save to file"

### Cloud Integration
- "Stream video to Amazon Kinesis Video Streams with authentication"
- "Create a pipeline that uploads processed video to S3"

### AI Integration
- "Use OpenVINO to detect objects in a video stream"
- "Create a DeepStream pipeline for real-time inference"

### Hardware Acceleration
- "Use NVIDIA NVENC for hardware-accelerated encoding"
- "Implement VAAPI acceleration on Intel hardware"

### Debugging and Optimization
- "How do I debug GStreamer pipeline issues?"
- "Optimize this pipeline for low latency streaming"

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Amazon Q      │───▶│   MCP Server     │───▶│ Bedrock Agent   │
│   Developer     │    │ (This Tool)      │    │ (L60IDME1CM)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AWS Profile    │    │ Knowledge Base  │
                       │  (malone-aws)    │    │ (S3 Vectors)    │
                       └──────────────────┘    └─────────────────┘
```

## Agent Details

- **Agent ID**: L60IDME1CM
- **Alias ID**: LOZ5ZB4MAS
- **Region**: us-east-1
- **AWS Profile**: malone-aws

## Troubleshooting

### Common Issues

1. **AWS Profile Not Found**
   - Ensure `malone-aws` profile is configured in `~/.aws/credentials`
   - Verify profile has necessary Bedrock permissions

2. **Agent Not Responding**
   - Check agent status in AWS Bedrock console
   - Verify agent is in "PREPARED" state

3. **Import Errors**
   - Run `./setup.sh` to install dependencies
   - Activate virtual environment: `source venv/bin/activate`

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export PYTHONPATH=/path/to/mcp-gstreamer-expert
export LOG_LEVEL=DEBUG
python server_final.py
```

## Contributing

To extend the MCP server:

1. Modify `server_final.py` to add new tools or resources
2. Update `requirements.txt` if adding dependencies
3. Test with Amazon Q CLI integration
4. Update this README with new capabilities

## License

This MCP server is provided as-is for integration with the GStreamer Expert Bedrock Agent. Ensure compliance with all relevant software licenses for GStreamer, OpenVINO, NVIDIA software, and AWS services.
