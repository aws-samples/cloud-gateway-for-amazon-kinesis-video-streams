#!/bin/bash

# Knowledge Base Staging Script
# Prepares filtered content for S3 upload

set -e

echo "📦 Staging content for knowledge base upload..."
echo "=============================================="

# Configuration
FILTERED_DIR="../../staging/filtered"
READY_DIR="../../staging/ready-for-upload"
MANIFESTS_DIR="../../manifests"

# Create ready directory
mkdir -p "$READY_DIR"

echo "🔄 Phase 1: Organizing content for upload..."
echo "-------------------------------------------"

# Copy filtered content to staging area
if [ -d "$FILTERED_DIR" ]; then
    echo "  Copying filtered content..."
    cp -r "$FILTERED_DIR"/* "$READY_DIR/"
    echo "    ✅ Content copied to staging area"
fi

echo "🔄 Phase 2: Adding metadata and structure..."
echo "-------------------------------------------"

# Add knowledge base metadata to files
find "$READY_DIR" -name "*.md" | while read file; do
    # Add KB metadata header if not present
    if ! grep -q "<!-- KB-METADATA" "$file"; then
        temp_file=$(mktemp)
        {
            echo "<!-- KB-METADATA"
            echo "Source: GStreamer Expert Knowledge Base"
            echo "Category: $(basename "$(dirname "$file")")"
            echo "Processed: $(date)"
            echo "-->"
            echo ""
            cat "$file"
        } > "$temp_file"
        mv "$temp_file" "$file"
    fi
done

echo "🔄 Phase 3: Generating upload manifest..."
echo "----------------------------------------"

# Generate upload manifest
cat > "$MANIFESTS_DIR/upload-manifest.json" << UPLOAD_EOF
{
  "upload_manifest": {
    "generated": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "total_files": $(find "$READY_DIR" -name "*.md" | wc -l),
    "total_size": "$(du -sh "$READY_DIR" | cut -f1)",
    "categories": {
      "gstreamer_core": $(find "$READY_DIR/gstreamer-core" -name "*.md" 2>/dev/null | wc -l),
      "aws_kvs": $(find "$READY_DIR/aws-kvs" -name "*.md" 2>/dev/null | wc -l),
      "openvino": $(find "$READY_DIR/openvino" -name "*.md" 2>/dev/null | wc -l),
      "hardware_accel": $(find "$READY_DIR/hardware-accel" -name "*.md" 2>/dev/null | wc -l),
      "repositories": $(find "$READY_DIR/repos" -name "*.md" 2>/dev/null | wc -l)
    },
    "ready_for_upload": true,
    "s3_destination": "s3://your-knowledge-base-bucket/gstreamer-expert-docs"
  }
}
UPLOAD_EOF

echo "✅ Content staging complete!"
echo ""
echo "📊 Upload Ready:"
echo "  - Staged files: $(find "$READY_DIR" -name "*.md" | wc -l)"
echo "  - Total size: $(du -sh "$READY_DIR" | cut -f1)"
echo "  - Upload manifest: $MANIFESTS_DIR/upload-manifest.json"
echo ""
echo "🚀 Ready for S3 upload!"
