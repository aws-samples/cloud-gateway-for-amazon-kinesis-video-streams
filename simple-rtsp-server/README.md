# Simple RTSP Server with REST API

A lightweight RTSP server that provides multiple test streams with different codecs, plus a REST API for stream discovery.

## Features

- **🎥 Multiple RTSP streams** on different ports (8554-8557)
- **🔧 Various codecs**: H.264, H.265, MPEG-4, MJPEG, Theora
- **🌐 REST API** for programmatic stream discovery (port 8080)
- **💊 Health monitoring** with built-in health checks
- **☁️ AWS deployment ready** with optimized CDK stack
- **🐳 Docker support** for easy containerization

## Quick Start

### Local Development

1. **Run with Docker:**
   ```bash
   docker build -t rtsp-server .
   docker run -p 8554-8557:8554-8557 -p 8080:8080 rtsp-server
   ```

2. **Discover available streams:**
   ```bash
   curl http://localhost:8080/rtsp-urls | jq .
   ```

3. **Test the streams:**
   ```bash
   # Test H.264 stream
   vlc rtsp://localhost:8554/h264_360p_15fps
   
   # Test MJPEG stream (good for debugging)
   vlc rtsp://localhost:8556/mjpeg_360p_10fps
   ```

### AWS Deployment (Optimized Serverless)

The CDK stack is optimized for cost and simplicity:
- **✅ Uses default VPC** (no custom networking)
- **✅ No NAT gateways** (~$90/month savings)
- **✅ Proper security groups** with RTSP + HTTP ports
- **✅ Automatic container build** and deployment
- **✅ Public IP assignment** for direct access

1. **Deploy to AWS:**
   ```bash
   cd cdk-deployment
   npm install
   npm run deploy
   ```

2. **Get container IP:**
   ```bash
   # Use the AWS CLI command from CDK output
   aws ecs describe-tasks --cluster [CLUSTER-NAME] --tasks [TASK-ARN] ...
   ```

3. **Clean up when done:**
   ```bash
   npm run destroy
   ```

## 🌐 REST API

### Endpoint
```
GET http://[CONTAINER-IP]:8080/rtsp-urls
```

### Response Format
```json
{
  "server_info": {
    "name": "Streamlined RTSP Test Server",
    "version": "1.0",
    "public_ip": "44.215.108.66",
    "total_streams": 24
  },
  "rtsp_urls": [
    {
      "url": "rtsp://44.215.108.66:8554/h264_360p_15fps",
      "description": "H.264/AVC 360p 15fps",
      "codec": "h264",
      "resolution": "360p",
      "framerate": 15,
      "audio": "none",
      "port": 8554,
      "path": "/h264_360p_15fps",
      "server": "modern"
    }
  ]
}
```

### Usage Examples
```bash
# Get all URLs
curl -s http://[IP]:8080/rtsp-urls | jq '.rtsp_urls[] | .url'

# Filter by codec
curl -s http://[IP]:8080/rtsp-urls | jq '.rtsp_urls[] | select(.codec=="h264") | .url'

# Get URLs with descriptions
curl -s http://[IP]:8080/rtsp-urls | jq '.rtsp_urls[] | {url, description}'
```

## 🎥 RTSP Stream Endpoints

### Port Layout
| Port | Server | Codecs | Description |
|------|--------|--------|-------------|
| 8554 | Modern | H.264, H.265 | Latest video codecs |
| 8555 | MPEG | MPEG-4, MPEG-2 | Legacy video codecs |
| 8556 | MJPEG | Motion JPEG | IP camera standard |
| 8557 | Open Source | Theora | Open source codec |

### Stream Patterns
All streams follow the pattern: `rtsp://[IP]:[PORT]/[codec]_[resolution]_[framerate]fps[_audio]`

**Examples:**
- `rtsp://[IP]:8554/h264_360p_15fps` - H.264 360p 15fps (no audio)
- `rtsp://[IP]:8554/h264_360p_15fps_aac` - H.264 360p 15fps with AAC audio
- `rtsp://[IP]:8556/mjpeg_720p_20fps` - MJPEG 720p 20fps
- `rtsp://[IP]:8557/theora_480p_20fps` - Theora 480p 20fps

### Available Resolutions & Framerates
- **Resolutions**: 360p, 480p, 720p, 1080p
- **Framerates**: 10fps, 15fps, 20fps, 25fps, 30fps
- **Audio**: none, aac, g711, g726

## 🏗️ Architecture

### AWS Deployment
- **ECS Fargate service** with public IP
- **Default VPC** (no custom networking overhead)
- **Security group** with ports 8554-8557, 8080 open
- **CloudWatch logs** for monitoring
- **No load balancer** (direct container access)

### Cost Optimization
- **No NAT gateways**: ~$90/month savings
- **No custom VPC**: Simplified networking
- **Single container**: Minimal compute costs (~$30/month)
- **Default VPC**: No additional networking charges

## 💊 Health Monitoring

The server includes multiple health check layers:
- **Container health check**: Tests RTSP port availability
- **ECS health check**: Monitors service health  
- **HTTP endpoint**: `/` returns same data as `/rtsp-urls`

**View logs:**
```bash
aws logs tail /aws/ecs/rtsp-server --follow
```

## 🔧 Development

### Project Structure
```
simple-rtsp-server/
├── rtsp-server-streamlined.py    # Main RTSP + HTTP server
├── health-check.py               # Comprehensive health checks
├── simple-health-check.py        # Basic health check
├── Dockerfile                    # Container definition
├── cdk-deployment/               # AWS CDK stack
│   ├── lib/simple-rtsp-server-stack.ts
│   ├── package.json
│   └── bin/simple-rtsp-server.ts
└── README.md                     # This file
```

### CDK Stack Features
- **TypeScript/Node.js** for consistency
- **Default VPC lookup** (no custom VPC creation)
- **Optimized security groups** with specific port rules
- **Container port mappings** for all RTSP + HTTP ports
- **CloudWatch integration** with log retention

### Requirements
- **Local**: Docker
- **AWS**: AWS CLI configured, Node.js 22, CDK installed
- **Testing**: VLC, FFmpeg, or curl for API testing

## 🚀 Quick Testing

### Test RTSP Streams
```bash
# Best compatibility (H.264)
vlc rtsp://[IP]:8554/h264_360p_15fps

# With audio
vlc rtsp://[IP]:8554/h264_360p_15fps_aac

# MJPEG (good for debugging)
vlc rtsp://[IP]:8556/mjpeg_360p_10fps
```

### Test REST API
```bash
# Get all streams
curl http://[IP]:8080/rtsp-urls

# Test connectivity
curl -I http://[IP]:8080/
```

## 🔍 Troubleshooting

### Common Issues
- **Connection refused**: Check security group has ports 8554-8557, 8080 open
- **Stream not playing**: Try MJPEG streams first (most compatible)
- **No audio**: Use streams with `_aac` or `_g711` suffix

### Debugging Commands
```bash
# Check container logs
aws logs tail /aws/ecs/rtsp-server --follow

# Test RTSP connectivity
telnet [IP] 8554

# Test HTTP API
curl -v http://[IP]:8080/rtsp-urls

# Validate stream with ffprobe
ffprobe rtsp://[IP]:8554/h264_360p_15fps
```

### AWS Console Locations
- **ECS Service**: ECS → Clusters → [cluster-name] → rtsp-server
- **Logs**: CloudWatch → Log Groups → /aws/ecs/rtsp-server
- **Security Groups**: EC2 → Security Groups → [security-group-id]
