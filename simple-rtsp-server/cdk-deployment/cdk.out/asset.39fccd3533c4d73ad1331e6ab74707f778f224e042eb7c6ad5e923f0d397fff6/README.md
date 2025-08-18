# Simple RTSP Server

A lightweight RTSP server that provides multiple test streams with different codecs for testing video streaming applications.

## Features

- **Multiple RTSP streams** on different ports (8554-8557)
- **Various codecs**: H.264, H.265, MPEG-4, MJPEG, Theora
- **Health monitoring** with built-in health checks
- **AWS deployment ready** with serverless CDK stack
- **Docker support** for easy containerization

## Quick Start

### Local Development

1. **Run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Test the streams:**
   ```bash
   # Test H.264/H.265 stream
   ffplay rtsp://localhost:8554/
   
   # Test MPEG-4 stream  
   ffplay rtsp://localhost:8555/
   
   # Test MJPEG stream
   ffplay rtsp://localhost:8556/
   
   # Test Theora stream
   ffplay rtsp://localhost:8557/
   ```

### AWS Deployment (Serverless)

The CDK stack uses:
- **No VPC management** (AWS managed networking)
- **Automatic container build** (no separate ECR steps)
- **Serverless Fargate** with auto-scaling
- **Node.js/TypeScript CDK** (consistent with project)

1. **Deploy to AWS:**
   ```bash
   ./deploy.sh
   ```

2. **Clean up when done:**
   ```bash
   ./cleanup.sh
   ```

## RTSP Stream Endpoints

| Port | Codec | Description |
|------|-------|-------------|
| 8554 | H.264/H.265 | Modern video codecs |
| 8555 | MPEG-4/MPEG-2 | Legacy video codecs |
| 8556 | MJPEG | Motion JPEG streams |
| 8557 | Theora | Open source codec |

## Architecture

The serverless AWS deployment creates:
- **ECS Fargate service** in AWS managed infrastructure
- **Application Load Balancer** for public access
- **CloudWatch logs** for monitoring
- **Automatic Docker image build** from source

## Health Monitoring

The server includes comprehensive health checks:
- **Container health check**: Tests RTSP port availability
- **ECS health check**: Monitors service health
- **Load balancer health check**: Ensures traffic routing

## Requirements

- **Local**: Docker and Docker Compose
- **AWS**: AWS CLI configured with "malone-aws" profile, Node.js 22, CDK installed
- **Testing**: FFmpeg or VLC for stream playback

## Troubleshooting

- **View logs**: `aws logs tail /aws/ecs/serverless-rtsp-server --follow --profile malone-aws`
- **Check service**: AWS ECS Console → serverless-rtsp-server service
- **Test connectivity**: Use `ffprobe` or `vlc` to test RTSP URLs

## Development

The CDK project structure follows the same pattern as other CDK stacks in this repository:
- **TypeScript/Node.js** for consistency
- **Standard CDK patterns** with constructs
- **Automated deployment** with npm scripts
