#!/bin/bash

# GStreamer Documentation Collection Script
set -e

source config.env

echo "Collecting GStreamer documentation and source materials..."

# Create directory structure
mkdir -p docs/{gstreamer-core,kinesis-video-streams,openvino,nvidia,samples}
mkdir -p repos

# Function to download GStreamer docs tarball
download_gstreamer_docs() {
    echo "Downloading GStreamer documentation tarball..."
    cd docs/gstreamer-core
    
    # Get the latest tarball from the GStreamer docs releases
    echo "Fetching latest GStreamer docs tarball..."
    wget -O gstreamer-docs-latest.tar.xz "https://gstreamer.freedesktop.org/src/gstreamer-docs/gstreamer-docs-1.27.1.tar.xz" || \
    wget -O gstreamer-docs-latest.tar.xz "https://gstreamer.freedesktop.org/src/gstreamer-docs/gstreamer-docs-1.24.7.tar.xz" || \
    wget -O gstreamer-docs-latest.tar.xz "https://gstreamer.freedesktop.org/src/gstreamer-docs/gstreamer-docs-1.24.6.tar.xz" || \
    echo "Could not download specific version, trying generic latest"
    
    # Extract the tarball
    if [ -f "gstreamer-docs-latest.tar.xz" ]; then
        echo "Extracting GStreamer documentation..."
        tar -xf gstreamer-docs-latest.tar.xz --strip-components=1
        rm gstreamer-docs-latest.tar.xz
    else
        echo "Warning: Could not download GStreamer docs tarball, will rely on GitHub repository"
    fi
    
    cd ../..
}

# Clone source repositories for code examples
clone_repos() {
    echo "Cloning source repositories..."
    
    # GStreamer main repository (contains documentation as subproject)
    if [ ! -d "repos/gstreamer" ]; then
        echo "Cloning GStreamer main repository..."
        git clone --depth 1 https://github.com/GStreamer/gstreamer.git repos/gstreamer
        
        # Extract documentation and examples from the repository
        echo "Extracting GStreamer documentation from repository..."
        if [ -d "repos/gstreamer/subprojects/gst-docs" ]; then
            cp -r repos/gstreamer/subprojects/gst-docs/* docs/gstreamer-core/ 2>/dev/null || true
        fi
        
        # Copy examples from various subprojects
        find repos/gstreamer -name "examples" -type d -exec cp -r {} docs/gstreamer-core/ \; 2>/dev/null || true
        find repos/gstreamer -name "*.md" -exec cp {} docs/gstreamer-core/ \; 2>/dev/null || true
        
        # Copy plugin documentation
        find repos/gstreamer -path "*/docs/*" -name "*.md" -exec cp {} docs/gstreamer-core/ \; 2>/dev/null || true
    fi
    
    # Kinesis Video Streams Producer SDK
    if [ ! -d "repos/amazon-kinesis-video-streams-producer-sdk-cpp" ]; then
        echo "Cloning Kinesis Video Streams Producer SDK..."
        git clone --depth 1 https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git \
            repos/amazon-kinesis-video-streams-producer-sdk-cpp
        
        # Extract documentation
        mkdir -p docs/kinesis-video-streams
        cp -r repos/amazon-kinesis-video-streams-producer-sdk-cpp/docs/* docs/kinesis-video-streams/ 2>/dev/null || true
        cp repos/amazon-kinesis-video-streams-producer-sdk-cpp/README.md docs/kinesis-video-streams/ 2>/dev/null || true
        
        # Copy GStreamer plugin specific files
        find repos/amazon-kinesis-video-streams-producer-sdk-cpp -name "*gstreamer*" -type f \
            -exec cp {} docs/kinesis-video-streams/ \; 2>/dev/null || true
        find repos/amazon-kinesis-video-streams-producer-sdk-cpp -name "*kvs*" -type f -name "*.md" \
            -exec cp {} docs/kinesis-video-streams/ \; 2>/dev/null || true
    fi
    
    # OpenVINO DLStreamer
    if [ ! -d "repos/dlstreamer" ]; then
        echo "Cloning OpenVINO DLStreamer..."
        git clone --depth 1 https://github.com/open-edge-platform/edge-ai-libraries repos/dlstreamer
        
        # Extract documentation
        mkdir -p docs/openvino
        cp -r repos/dlstreamer/libraries/dl-streamer/* docs/openvino/ 2>/dev/null || true
        cp repos/dlstreamer/README.md docs/openvino/ 2>/dev/null || true
        
        # Copy examples and samples
        find repos/dlstreamer -name "samples" -type d -exec cp -r {} docs/openvino/ \; 2>/dev/null || true
        find repos/dlstreamer -name "examples" -type d -exec cp -r {} docs/openvino/ \; 2>/dev/null || true
        find repos/dlstreamer -name "*.md" -exec cp {} docs/openvino/ \; 2>/dev/null || true
    fi
    
    # Create NVIDIA documentation placeholder (since we can't easily download DeepStream docs)
    echo "Creating NVIDIA DeepStream documentation placeholder..."
    mkdir -p docs/nvidia
    
    cat > docs/nvidia/README.md << EOF
# NVIDIA DeepStream and GStreamer Plugins

This section contains information about NVIDIA's GStreamer plugins and DeepStream SDK.

## Key NVIDIA GStreamer Plugins

### Hardware Acceleration Plugins
- **nvenc**: NVIDIA hardware video encoder
- **nvdec**: NVIDIA hardware video decoder  
- **nvstreammux**: Stream multiplexer for DeepStream
- **nvinfer**: TensorRT inference plugin
- **nvtracker**: Multi-object tracker
- **nvvideoconvert**: Hardware-accelerated video format conversion
- **nvdsosd**: On-screen display for metadata overlay

### Common Pipeline Patterns

#### Basic Hardware Encoding
\`\`\`bash
gst-launch-1.0 videotestsrc ! nvvideoconvert ! nvenc_h264 ! h264parse ! mp4mux ! filesink location=output.mp4
\`\`\`

#### DeepStream Inference Pipeline
\`\`\`bash
gst-launch-1.0 filesrc location=input.mp4 ! decodebin ! nvstreammux ! nvinfer config-file-path=config.txt ! nvvideoconvert ! nvdsosd ! nvegldisplay
\`\`\`

## Documentation Sources
- NVIDIA Developer Documentation: https://docs.nvidia.com/metropolis/deepstream/
- DeepStream SDK Reference: https://docs.nvidia.com/metropolis/deepstream/dev-guide/
- GStreamer Plugin Guide: https://docs.nvidia.com/metropolis/deepstream/plugin-manual/

## Hardware Requirements
- NVIDIA GPU with compute capability 6.0+
- CUDA Toolkit 11.0+
- TensorRT 8.0+
- DeepStream SDK 6.0+
EOF
}

echo "Starting documentation collection..."

# Download GStreamer docs tarball
download_gstreamer_docs

# Clone repositories and extract documentation
clone_repos

# Create a comprehensive index file
cat > docs/README.md << EOF
# GStreamer Expert Knowledge Base

This knowledge base contains comprehensive documentation for:

## GStreamer Core
- Complete GStreamer framework documentation (from official tarball)
- Plugin references and examples
- Pipeline development guides
- Source: https://github.com/GStreamer/gstreamer
- Docs: https://gstreamer.freedesktop.org/src/gstreamer-docs/

## Amazon Kinesis Video Streams
- Producer SDK for C++ documentation
- GStreamer plugin integration
- Streaming examples and best practices
- Source: https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp

## OpenVINO DLStreamer
- AI inference with GStreamer
- Model integration examples
- Performance optimization guides
- Source: https://github.com/openvinotoolkit/dlstreamer

## NVIDIA DeepStream
- Hardware-accelerated video processing
- AI inference pipelines
- CUDA integration examples
- Source: NVIDIA Developer Documentation

Generated on: $(date)
EOF

echo "Documentation collection complete!"
echo "Collected documentation in docs/ directory:"
find docs/ -type f \( -name "*.md" -o -name "*.html" -o -name "*.txt" -o -name "*.rst" \) | wc -l | xargs echo "Total documentation files:"
echo "Next: Run upload-to-s3.sh to upload to your S3 bucket"
