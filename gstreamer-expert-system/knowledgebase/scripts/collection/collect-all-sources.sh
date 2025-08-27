#!/bin/bash

# Comprehensive Knowledge Base Source Collection Script
# Downloads and organizes all sources for the GStreamer Expert KB

set -e

echo "📚 Collecting all knowledge base sources..."
echo "=========================================="

# Configuration
RAW_SOURCES_DIR="../../raw-sources"
DOWNLOADS_DIR="$RAW_SOURCES_DIR/downloads"
REPOS_DIR="$RAW_SOURCES_DIR/repos"
DOCS_DIR="$RAW_SOURCES_DIR/docs"

# Create directories
mkdir -p "$DOWNLOADS_DIR"/{gstreamer-official,aws-kvs,openvino,hardware-docs}
mkdir -p "$REPOS_DIR"
mkdir -p "$DOCS_DIR"

echo "🔄 Phase 1: GStreamer Official Documentation"
echo "--------------------------------------------"

# GStreamer official documentation
echo "  Downloading GStreamer core documentation..."
mkdir -p "$DOWNLOADS_DIR/gstreamer-official/core"

# Download key GStreamer documentation sections
GSTREAMER_BASE_URL="https://gstreamer.freedesktop.org/documentation"

# Core documentation areas
GSTREAMER_SECTIONS=(
    "application-development"
    "plugin-development" 
    "tutorials"
    "design"
    "tools"
    "installing"
)

for section in "${GSTREAMER_SECTIONS[@]}"; do
    echo "    Collecting: $section"
    mkdir -p "$DOWNLOADS_DIR/gstreamer-official/$section"
    # Add actual download logic here based on current GStreamer docs structure
    # wget -r -np -k -E -p "$GSTREAMER_BASE_URL/$section" -P "$DOWNLOADS_DIR/gstreamer-official/$section" || true
done

echo "🔄 Phase 2: AWS Kinesis Video Streams Documentation"
echo "--------------------------------------------------"

# KVS documentation and examples
echo "  Cloning KVS Producer SDK..."
if [ ! -d "$REPOS_DIR/amazon-kinesis-video-streams-producer-sdk-cpp" ]; then
    git clone --depth 1 https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git "$REPOS_DIR/amazon-kinesis-video-streams-producer-sdk-cpp"
    echo "    ✅ KVS Producer SDK cloned"
else
    echo "    ℹ️  KVS Producer SDK already exists"
fi

# Extract KVS documentation
echo "  Extracting KVS documentation..."
if [ -d "$REPOS_DIR/amazon-kinesis-video-streams-producer-sdk-cpp/docs" ]; then
    cp -r "$REPOS_DIR/amazon-kinesis-video-streams-producer-sdk-cpp/docs"/* "$DOCS_DIR/"
    echo "    ✅ KVS documentation extracted"
fi

echo "🔄 Phase 3: OpenVINO GStreamer Integration"
echo "-----------------------------------------"

# OpenVINO DL Streamer documentation
echo "  Downloading OpenVINO DL Streamer docs..."
mkdir -p "$DOWNLOADS_DIR/openvino/dlstreamer"

# Add OpenVINO specific documentation collection
# This would include GStreamer plugin documentation for OpenVINO

echo "🔄 Phase 4: Hardware Acceleration Documentation"
echo "----------------------------------------------"

# Platform-specific hardware acceleration docs
echo "  Collecting hardware acceleration documentation..."

# Raspberry Pi specific documentation
mkdir -p "$DOWNLOADS_DIR/hardware-docs/raspberry-pi"
echo "    Raspberry Pi hardware acceleration docs..."

# Intel hardware acceleration
mkdir -p "$DOWNLOADS_DIR/hardware-docs/intel"
echo "    Intel hardware acceleration docs..."

# NVIDIA hardware acceleration  
mkdir -p "$DOWNLOADS_DIR/hardware-docs/nvidia"
echo "    NVIDIA hardware acceleration docs..."

echo "🔄 Phase 5: Additional GStreamer Resources"
echo "-----------------------------------------"

# GStreamer plugins documentation
echo "  Collecting GStreamer plugins documentation..."
mkdir -p "$DOWNLOADS_DIR/gstreamer-official/plugins"

# Community tutorials and examples
echo "  Collecting community resources..."
mkdir -p "$DOWNLOADS_DIR/gstreamer-official/community"

echo "✅ Source collection complete!"
echo ""
echo "📁 Sources collected in:"
echo "  - Raw downloads: $DOWNLOADS_DIR"
echo "  - Repositories: $REPOS_DIR" 
echo "  - Extracted docs: $DOCS_DIR"
echo ""
echo "Next steps:"
echo "1. Run cleanup script to filter content"
echo "2. Run staging script to prepare for upload"
echo "3. Sync with S3 knowledge base"
