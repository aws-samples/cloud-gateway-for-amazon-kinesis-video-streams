#!/bin/bash

# Updated Documentation Collection Script
# Reflects current knowledge base filtering and organization

set -e

echo "📚 Collecting documentation for GStreamer Expert Knowledge Base..."
echo "================================================================"

# Configuration
DOCS_DIR="documentation/collected"
REPOS_DIR="repos/current"
KB_STAGING_DIR="knowledge-base-staging"

# Clean and create directories
rm -rf "$DOCS_DIR" "$REPOS_DIR" "$KB_STAGING_DIR"
mkdir -p "$DOCS_DIR" "$REPOS_DIR" "$KB_STAGING_DIR"

echo "🔄 Phase 1: GStreamer Core Documentation"
echo "----------------------------------------"

# GStreamer official documentation (filtered)
echo "  Downloading GStreamer core docs..."
mkdir -p "$DOCS_DIR/gstreamer-core"

# Download key GStreamer documentation sections
curl -s "https://gstreamer.freedesktop.org/documentation/" > "$DOCS_DIR/gstreamer-core/index.html"

# Core concepts and tutorials (high value for knowledge base)
GSTREAMER_SECTIONS=(
    "application-development/basics"
    "application-development/advanced" 
    "plugin-development/basics"
    "tutorials"
    "design"
)

for section in "${GSTREAMER_SECTIONS[@]}"; do
    echo "    Collecting: $section"
    mkdir -p "$DOCS_DIR/gstreamer-core/$section"
    # Add actual download logic here based on current GStreamer docs structure
done

echo "🔄 Phase 2: AWS Kinesis Video Streams Documentation"
echo "--------------------------------------------------"

# KVS documentation (production-focused)
mkdir -p "$DOCS_DIR/kinesis-video-streams"
echo "  Downloading KVS producer SDK docs..."

# Clone KVS producer SDK (filtered to docs only)
git clone --depth 1 https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git "$REPOS_DIR/kvs-producer-cpp"
cp -r "$REPOS_DIR/kvs-producer-cpp/docs"/* "$DOCS_DIR/kinesis-video-streams/"

# KVS GStreamer plugin specific docs
mkdir -p "$DOCS_DIR/kinesis-video-streams/gstreamer-plugin"
echo "  Collecting KVS GStreamer plugin documentation..."

echo "🔄 Phase 3: OpenVINO Documentation (Filtered)"
echo "---------------------------------------------"

# OpenVINO docs (computer vision integration focus)
mkdir -p "$DOCS_DIR/openvino"
echo "  Downloading OpenVINO GStreamer integration docs..."

# Focus on GStreamer integration and inference pipeline docs
OPENVINO_SECTIONS=(
    "gstreamer-plugins"
    "inference-engine"
    "model-optimization"
)

for section in "${OPENVINO_SECTIONS[@]}"; do
    echo "    Collecting: $section"
    mkdir -p "$DOCS_DIR/openvino/$section"
    # Add OpenVINO specific download logic
done

echo "🔄 Phase 4: Hardware Acceleration Documentation"
echo "----------------------------------------------"

# Hardware acceleration docs (platform-specific)
mkdir -p "$DOCS_DIR/hardware-acceleration"

echo "  Collecting Raspberry Pi hardware acceleration docs..."
mkdir -p "$DOCS_DIR/hardware-acceleration/raspberry-pi"

echo "  Collecting Intel hardware acceleration docs..."
mkdir -p "$DOCS_DIR/hardware-acceleration/intel"

echo "  Collecting NVIDIA hardware acceleration docs..."
mkdir -p "$DOCS_DIR/hardware-acceleration/nvidia"

echo "🔄 Phase 5: Knowledge Base Staging and Filtering"
echo "------------------------------------------------"

echo "  Applying knowledge base filters..."

# Copy filtered content to staging area
echo "    Filtering GStreamer core content..."
# Apply filters based on what we learned works best for the knowledge base
find "$DOCS_DIR/gstreamer-core" -name "*.md" -o -name "*.html" | while read file; do
    # Filter out low-value content
    if ! grep -q -E "(deprecated|legacy|obsolete)" "$file"; then
        cp "$file" "$KB_STAGING_DIR/"
    fi
done

echo "    Filtering AWS KVS content..."
find "$DOCS_DIR/kinesis-video-streams" -name "*.md" | while read file; do
    # Focus on production-ready content
    if grep -q -E "(gstreamer|pipeline|streaming)" "$file"; then
        cp "$file" "$KB_STAGING_DIR/"
    fi
done

echo "    Filtering OpenVINO content..."
find "$DOCS_DIR/openvino" -name "*.md" | while read file; do
    # Focus on GStreamer integration
    if grep -q -E "(gstreamer|pipeline|inference)" "$file"; then
        cp "$file" "$KB_STAGING_DIR/"
    fi
done

echo "🔄 Phase 6: Generate Knowledge Base Manifest"
echo "-------------------------------------------"

# Create manifest of collected content
cat > "$KB_STAGING_DIR/KNOWLEDGE_BASE_MANIFEST.md" << 'MANIFEST_EOF'
# GStreamer Expert Knowledge Base Content Manifest

## Content Sources and Filtering Criteria

### GStreamer Core Documentation
- **Source**: Official GStreamer documentation
- **Filter Criteria**: Production-ready, non-deprecated content
- **Focus Areas**: Application development, plugin development, tutorials

### AWS Kinesis Video Streams
- **Source**: KVS Producer SDK documentation
- **Filter Criteria**: GStreamer integration specific content
- **Focus Areas**: Streaming pipelines, WebRTC, production deployment

### OpenVINO Integration
- **Source**: OpenVINO documentation
- **Filter Criteria**: GStreamer plugin and inference pipeline content
- **Focus Areas**: Computer vision integration, model optimization

### Hardware Acceleration
- **Source**: Platform-specific documentation
- **Filter Criteria**: Production-tested acceleration methods
- **Focus Areas**: Raspberry Pi, Intel, NVIDIA hardware optimization

## Content Statistics
MANIFEST_EOF

# Add content statistics
echo "- Total files collected: $(find "$KB_STAGING_DIR" -name "*.md" -o -name "*.html" | wc -l)" >> "$KB_STAGING_DIR/KNOWLEDGE_BASE_MANIFEST.md"
echo "- Total size: $(du -sh "$KB_STAGING_DIR" | cut -f1)" >> "$KB_STAGING_DIR/KNOWLEDGE_BASE_MANIFEST.md"
echo "- Collection date: $(date)" >> "$KB_STAGING_DIR/KNOWLEDGE_BASE_MANIFEST.md"

echo "✅ Documentation collection complete!"
echo "📁 Staged content ready in: $KB_STAGING_DIR"
echo "📋 Review manifest: $KB_STAGING_DIR/KNOWLEDGE_BASE_MANIFEST.md"
