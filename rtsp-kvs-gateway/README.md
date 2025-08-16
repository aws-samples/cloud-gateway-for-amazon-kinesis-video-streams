# RTSP to Kinesis Video Streams Gateway with Computer Vision

A modern C++ multi-threaded application that integrates RTSP camera streams with Amazon Kinesis Video Streams, featuring real-time computer vision processing and WebRTC streaming capabilities.

## Overview

This application serves as an intelligent video gateway that:
- Ingests multiple RTSP streams simultaneously using modern C++ threading
- Processes video streams through GStreamer pipelines with RAII resource management
- Applies computer vision algorithms in real-time using industry-standard frameworks
- Stores processed video in Amazon Kinesis Video Streams with native C++ SDK integration
- Enables WebRTC streaming for real-time viewing
- Responds to MQTT commands for dynamic stream management

## Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│   RTSP Cameras  │───▶│  RTSP KVS Gateway    │───▶│  Kinesis Video      │
│                 │    │  (C++ Application)   │    │  Streams            │
└─────────────────┘    │                      │    └─────────────────────┘
                       │  ┌─────────────────┐ │              │
┌─────────────────┐    │  │ Stream Manager  │ │              │
│   MQTT Broker   │───▶│  │ (Thread Pool)   │ │              ▼
│                 │    │  └─────────────────┘ │    ┌─────────────────────┐
└─────────────────┘    │           │          │    │  WebRTC Signaling   │
                       │           ▼          │    │  Server             │
                       │  ┌─────────────────┐ │    └─────────────────────┘
                       │  │ GStreamer       │ │              │
                       │  │ Pipeline Mgr    │ │              ▼
                       │  └─────────────────┘ │    ┌─────────────────────┐
                       │           │          │    │  WebRTC Clients     │
                       │           ▼          │    └─────────────────────┘
                       │  ┌─────────────────┐ │
                       │  │ Computer Vision │ │
                       │  │ Processor       │ │
                       │  └─────────────────┘ │
                       └──────────────────────┘
```

## Key Components

### 1. Modern C++ Stream Manager
- **Thread Pool**: `std::thread` based worker pool for concurrent processing
- **Stream Registry**: Thread-safe `std::unordered_map` for active streams
- **RAII Resource Management**: Automatic cleanup with smart pointers
- **Exception Safety**: Robust error handling throughout the pipeline

### 2. GStreamer Pipeline Engine (C++ Wrapped)
- **Pipeline Factory**: Template-based pipeline creation
- **RAII Wrappers**: Automatic `gst_object_unref()` management
- **Event Handling**: Modern callback system with `std::function`
- **State Management**: Thread-safe pipeline state tracking

### 3. MQTT Command Interface
- **Async Client**: Non-blocking MQTT operations
- **JSON Processing**: Modern JSON parsing with nlohmann/json
- **Command Pattern**: Extensible command processing system
- **Status Publishing**: Real-time metrics and health reporting

### 4. Computer Vision Integration
- **Framework Abstraction**: Plugin-based CV framework support
- **Pipeline Integration**: Native GStreamer element integration
- **Model Management**: Dynamic model loading and switching
- **Result Processing**: Structured metadata output

### 5. AWS KVS Integration (Native C++)
- **Producer SDK**: Direct C++ SDK integration
- **WebRTC Support**: Native signaling and streaming
- **Credential Management**: AWS credential provider integration
- **Stream Lifecycle**: Automatic stream creation and management

## Design Goals

### Modern C++ Practices
- **C++17 Standard**: Modern language features and STL
- **RAII Everywhere**: Automatic resource management
- **Smart Pointers**: Memory safety with `std::unique_ptr`/`std::shared_ptr`
- **Move Semantics**: Efficient resource transfers
- **Exception Safety**: Strong exception guarantees

### Performance & Scalability
- **Lock-free Queues**: High-performance inter-thread communication
- **Thread Pool**: Efficient worker thread management
- **Memory Pools**: Optimized buffer management
- **Zero-copy Operations**: Minimize data copying where possible

### Reliability & Monitoring
- **Structured Logging**: spdlog-based logging system
- **Health Monitoring**: Comprehensive metrics collection
- **Graceful Degradation**: Fault-tolerant stream processing
- **Recovery Mechanisms**: Automatic pipeline restart

## MQTT Message Format

### Stream Control Messages
```json
{
  "command": "start|stop|configure|status",
  "stream_id": "camera_001",
  "rtsp_url": "rtsp://192.168.1.100:554/stream1",
  "kvs_stream_name": "security-camera-001",
  "cv_config": {
    "enabled": true,
    "framework": "opencv",
    "model": "yolov5s",
    "confidence_threshold": 0.6,
    "classes_filter": ["person", "car", "bicycle"]
  },
  "webrtc_config": {
    "enabled": true,
    "signaling_channel": "camera-001-webrtc",
    "ice_servers": ["stun:stun.l.google.com:19302"]
  },
  "pipeline_config": {
    "resolution": "1920x1080",
    "framerate": 30,
    "bitrate_kbps": 2048,
    "gop_size": 30
  },
  "metadata": {
    "location": "Building A - Entrance",
    "camera_type": "Fixed Dome",
    "installation_date": "2025-08-14"
  }
}
```

### Status Response Messages
```json
{
  "stream_id": "camera_001",
  "status": "running|stopped|error|starting",
  "timestamp": "2025-08-14T15:20:23.989Z",
  "uptime_seconds": 3600,
  "performance_metrics": {
    "fps_input": 29.8,
    "fps_output": 29.8,
    "bitrate_kbps": 2045,
    "cpu_usage_percent": 12.5,
    "memory_mb": 156,
    "gpu_usage_percent": 8.2
  },
  "cv_results": {
    "objects_detected": 2,
    "last_detections": [
      {"class": "person", "confidence": 0.89, "bbox": [100, 200, 150, 300]},
      {"class": "car", "confidence": 0.76, "bbox": [400, 300, 600, 500]}
    ],
    "inference_time_ms": 45
  },
  "pipeline_health": {
    "state": "PLAYING",
    "errors": [],
    "warnings": ["High CPU usage detected"]
  }
}
```

## Dependencies

### Core C++ Dependencies
- **C++17 Compiler**: GCC 8+ or Clang 7+
- **CMake**: Build system (≥3.16)
- **GStreamer**: Media framework (≥1.18)
- **AWS SDK C++**: Kinesis Video Streams integration
- **nlohmann/json**: Modern JSON processing
- **spdlog**: High-performance logging
- **fmt**: String formatting library

### Computer Vision Options
Choose one during build configuration:

#### Option 1: OpenCV 4.x (Recommended)
```bash
cmake -DUSE_OPENCV=ON ..
```
- Comprehensive computer vision library
- Excellent GStreamer integration
- Wide model format support (ONNX, TensorFlow, Darknet)

#### Option 2: TensorFlow Lite C++
```bash
cmake -DUSE_TENSORFLOW_LITE=ON ..
```
- Optimized for edge inference
- Small memory footprint
- Mobile/embedded focused

#### Option 3: ONNX Runtime
```bash
cmake -DUSE_ONNX_RUNTIME=ON ..
```
- Framework agnostic model support
- Optimized inference engine
- Cross-platform compatibility

#### Option 4: Intel OpenVINO
```bash
cmake -DUSE_OPENVINO=ON ..
```
- Intel hardware optimization
- Excellent performance on CPU/GPU/VPU
- Pre-optimized model zoo

#### Option 5: Custom GStreamer Elements
```bash
cmake -DUSE_CUSTOM_CV=ON ..
```
- Native GStreamer integration
- Minimal overhead
- Custom processing algorithms

## Project Structure

```
rtsp-kvs-gateway/
├── CMakeLists.txt                 # Modern CMake configuration
├── README.md                      # This file
├── src/
│   ├── main.cpp                   # Application entry point
│   ├── stream_manager.cpp         # Multi-threaded stream management
│   ├── gstreamer_pipeline.cpp     # GStreamer C++ wrappers
│   ├── mqtt_client.cpp            # MQTT integration
│   ├── cv_processor.cpp           # Computer vision processing
│   ├── kvs_integration.cpp        # AWS KVS integration
│   └── utils/
│       ├── logger.cpp             # Logging utilities
│       ├── config.cpp             # Configuration management
│       └── metrics.cpp            # Performance metrics
├── include/
│   ├── stream_manager.hpp
│   ├── gstreamer_pipeline.hpp
│   ├── mqtt_client.hpp
│   ├── cv_processor.hpp
│   ├── kvs_integration.hpp
│   └── utils/
│       ├── logger.hpp
│       ├── config.hpp
│       ├── metrics.hpp
│       └── common.hpp
├── config/
│   ├── default_config.json        # Default configuration
│   └── production_config.json     # Production settings
├── scripts/
│   ├── install_deps.sh            # Dependency installation
│   ├── build.sh                   # Build script
│   └── docker/
│       ├── Dockerfile             # Container build
│       └── docker-compose.yml     # Multi-service setup
├── tests/
│   ├── unit_tests.cpp             # Unit tests with Google Test
│   ├── integration_tests.cpp      # Integration tests
│   └── performance_tests.cpp      # Performance benchmarks
├── docs/
│   ├── API.md                     # API documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── PERFORMANCE.md             # Performance tuning
│   └── TROUBLESHOOTING.md         # Common issues
└── third_party/                   # External dependencies
    ├── aws-sdk-cpp/               # AWS SDK (if not system-installed)
    └── models/                    # Pre-trained CV models
```

## Getting Started

### 1. Install Dependencies
```bash
./scripts/install_deps.sh --cv-framework opencv
```

### 2. Build Application
```bash
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DUSE_OPENCV=ON ..
make -j$(nproc)
```

### 3. Configure AWS Credentials
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 4. Run Application
```bash
./rtsp-kvs-gateway --config ../config/default_config.json
```

## Configuration

The application uses JSON configuration with the following sections:

- **Application Settings**: Logging, threading, performance
- **MQTT Configuration**: Broker connection, topics, security
- **AWS Settings**: Credentials, regions, KVS configuration
- **GStreamer Settings**: Pipeline templates, buffer management
- **Computer Vision**: Model paths, inference parameters
- **Monitoring**: Metrics collection, health checks

## Advanced Features

### Docker Support
```bash
docker build -t rtsp-kvs-gateway .
docker run -d --name gateway \
  -v $(pwd)/config:/app/config \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  rtsp-kvs-gateway
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/deployment.yaml
```

### Performance Monitoring
- Prometheus metrics endpoint
- Grafana dashboard templates
- AWS CloudWatch integration
- Custom alerting rules

## Development

### Building with Different CV Frameworks
```bash
# OpenCV
cmake -DUSE_OPENCV=ON ..

# TensorFlow Lite
cmake -DUSE_TENSORFLOW_LITE=ON ..

# ONNX Runtime
cmake -DUSE_ONNX_RUNTIME=ON ..

# Intel OpenVINO
cmake -DUSE_OPENVINO=ON ..

# Custom elements
cmake -DUSE_CUSTOM_CV=ON ..
```

### Running Tests
```bash
make test
# or
ctest --verbose
```

### Code Coverage
```bash
cmake -DCMAKE_BUILD_TYPE=Debug -DENABLE_COVERAGE=ON ..
make coverage
```

## License

MIT License - See LICENSE file for details

## Contributing

Please read CONTRIBUTING.md for development guidelines and code standards.

## Authors

- Your Name - Initial C++ implementation

## Acknowledgments

- AWS Kinesis Video Streams team for the C++ Producer SDK
- GStreamer community for the multimedia framework
- OpenCV team for computer vision capabilities
- nlohmann for the excellent JSON library
