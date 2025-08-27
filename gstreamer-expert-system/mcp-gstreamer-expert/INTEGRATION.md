# Amazon Q CLI Integration Guide

## Quick Setup

1. **Copy the MCP configuration:**
   ```bash
   # Copy the configuration to your Q CLI config directory
   mkdir -p ~/.config/amazon-q
   cp q-cli-config.json ~/.config/amazon-q/mcp-config.json
   ```

2. **Or manually add to existing configuration:**
   If you already have an MCP configuration file, add this server to your existing `mcpServers` section:
   ```json
   {
     "mcpServers": {
       "gstreamer-expert": {
         "command": "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/venv/bin/python",
         "args": ["/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/server.py"],
         "env": {
           "AWS_PROFILE": "malone-aws"
         }
       }
     }
   }
   ```

3. **Restart Amazon Q CLI:**
   ```bash
   # Exit current Q session and restart
   q chat
   ```

## Verification

Once integrated, you should be able to ask Amazon Q Developer questions like:

- "Create a GStreamer pipeline to convert MP4 to WebM"
- "How do I stream webcam video to Kinesis Video Streams?"
- "Show me NVIDIA hardware acceleration for H.264 encoding"
- "Integrate OpenVINO object detection in GStreamer"

Amazon Q Developer will automatically use the GStreamer expert agent when it detects GStreamer-related questions.

## Troubleshooting

### MCP Server Not Loading
- Check that the virtual environment path is correct
- Verify AWS profile `malone-aws` is configured
- Check Q CLI logs for error messages

### Agent Not Responding
- Test the server directly: `cd /path/to/mcp-gstreamer-expert && source venv/bin/activate && python test_server.py`
- Verify Bedrock agent is in "PREPARED" state
- Check AWS credentials and permissions

### Configuration Issues
- Ensure JSON syntax is valid
- Check file paths are absolute
- Verify environment variables are set correctly

## Advanced Configuration

### Custom Session Management
The MCP server supports session IDs for maintaining conversation context:
```json
{
  "question": "Create a GStreamer pipeline for video processing",
  "session_id": "my-custom-session-123"
}
```

### Debug Mode
Enable debug logging by setting environment variables in the configuration:
```json
{
  "mcpServers": {
    "gstreamer-expert": {
      "command": "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/venv/bin/python",
      "args": ["/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/server.py"],
      "env": {
        "AWS_PROFILE": "malone-aws",
        "LOG_LEVEL": "DEBUG"
      }
    }
  }
}
```
