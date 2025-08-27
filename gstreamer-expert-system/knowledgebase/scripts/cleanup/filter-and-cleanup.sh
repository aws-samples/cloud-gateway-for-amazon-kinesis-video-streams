#!/bin/bash

# Knowledge Base Content Filtering and Cleanup Script
# Filters raw sources to keep only high-value content for the KB

set -e

echo "🧹 Filtering and cleaning knowledge base content..."
echo "================================================="

# Configuration
RAW_SOURCES_DIR="../../raw-sources"
STAGING_DIR="../../staging"
FILTERED_DIR="$STAGING_DIR/filtered"
PROCESSED_DIR="$STAGING_DIR/processed"

# Create staging directories
mkdir -p "$FILTERED_DIR"/{gstreamer-core,aws-kvs,openvino,hardware-accel,tutorials}
mkdir -p "$PROCESSED_DIR"

echo "🔍 Phase 1: Analyzing raw content..."
echo "-----------------------------------"

# Count and analyze raw content
if [ -d "$RAW_SOURCES_DIR/docs" ]; then
    TOTAL_DOCS=$(find "$RAW_SOURCES_DIR/docs" -name "*.md" | wc -l)
    echo "  Total markdown files: $TOTAL_DOCS"
fi

if [ -d "$RAW_SOURCES_DIR/repos" ]; then
    TOTAL_REPOS=$(find "$RAW_SOURCES_DIR/repos" -name ".git" -type d | wc -l)
    echo "  Total repositories: $TOTAL_REPOS"
fi

echo "🎯 Phase 2: Filtering high-value content..."
echo "------------------------------------------"

# Filter GStreamer core documentation
echo "  Filtering GStreamer core content..."
if [ -d "$RAW_SOURCES_DIR/docs/gstreamer-core" ]; then
    # Keep production-ready, non-deprecated content
    find "$RAW_SOURCES_DIR/docs/gstreamer-core" -name "*.md" | while read file; do
        # Skip deprecated, legacy, or test content
        if ! grep -q -E "(deprecated|legacy|obsolete|test|example)" "$file" 2>/dev/null; then
            # Check for high-value keywords
            if grep -q -E "(gstreamer|pipeline|element|plugin|streaming)" "$file" 2>/dev/null; then
                cp "$file" "$FILTERED_DIR/gstreamer-core/"
            fi
        fi
    done
    echo "    ✅ GStreamer core content filtered"
fi

# Filter AWS KVS content
echo "  Filtering AWS KVS content..."
if [ -d "$RAW_SOURCES_DIR/docs" ]; then
    find "$RAW_SOURCES_DIR/docs" -name "*.md" | while read file; do
        # Focus on GStreamer integration and production content
        if grep -q -E "(gstreamer|kvs|kinesis|streaming|webrtc)" "$file" 2>/dev/null; then
            if ! grep -q -E "(deprecated|test|example)" "$file" 2>/dev/null; then
                cp "$file" "$FILTERED_DIR/aws-kvs/"
            fi
        fi
    done
    echo "    ✅ AWS KVS content filtered"
fi

# Filter OpenVINO content
echo "  Filtering OpenVINO content..."
if [ -d "$RAW_SOURCES_DIR/docs/openvino" ]; then
    find "$RAW_SOURCES_DIR/docs/openvino" -name "*.md" | while read file; do
        # Focus on GStreamer integration
        if grep -q -E "(gstreamer|dlstreamer|inference|pipeline)" "$file" 2>/dev/null; then
            cp "$file" "$FILTERED_DIR/openvino/"
        fi
    done
    echo "    ✅ OpenVINO content filtered"
fi

# Extract valuable content from repositories
echo "  Extracting valuable repository content..."
if [ -d "$RAW_SOURCES_DIR/repos" ]; then
    find "$RAW_SOURCES_DIR/repos" -name "docs" -type d | while read docs_dir; do
        repo_name=$(basename "$(dirname "$docs_dir")")
        echo "    Processing $repo_name documentation..."
        
        find "$docs_dir" -name "*.md" | while read file; do
            # Copy high-value documentation
            if grep -q -E "(gstreamer|streaming|pipeline)" "$file" 2>/dev/null; then
                mkdir -p "$FILTERED_DIR/repos/$repo_name"
                cp "$file" "$FILTERED_DIR/repos/$repo_name/"
            fi
        done
    done
    echo "    ✅ Repository documentation extracted"
fi

echo "🔧 Phase 3: Processing and optimizing content..."
echo "-----------------------------------------------"

# Remove duplicate content
echo "  Removing duplicate files..."
find "$FILTERED_DIR" -name "*.md" -exec md5sum {} \; | sort | uniq -d -w32 | while read hash file; do
    echo "    Removing duplicate: $(basename "$file")"
    rm -f "$file"
done

# Optimize file sizes
echo "  Optimizing content..."
find "$FILTERED_DIR" -name "*.md" | while read file; do
    # Remove excessive whitespace and empty lines
    sed -i '' '/^[[:space:]]*$/N;/^\n$/d' "$file" 2>/dev/null || true
done

echo "📊 Phase 4: Generating content manifest..."
echo "-----------------------------------------"

# Generate manifest of filtered content
cat > "../../manifests/filtered-content-manifest.md" << MANIFEST_EOF
# Filtered Knowledge Base Content Manifest

**Generated**: $(date)
**Source**: Knowledge base content filtering process

## Content Summary

### GStreamer Core Documentation
- **Location**: staging/filtered/gstreamer-core/
- **Files**: $(find "$FILTERED_DIR/gstreamer-core" -name "*.md" 2>/dev/null | wc -l)
- **Focus**: Production-ready GStreamer documentation

### AWS Kinesis Video Streams
- **Location**: staging/filtered/aws-kvs/
- **Files**: $(find "$FILTERED_DIR/aws-kvs" -name "*.md" 2>/dev/null | wc -l)
- **Focus**: GStreamer integration with KVS

### OpenVINO Integration
- **Location**: staging/filtered/openvino/
- **Files**: $(find "$FILTERED_DIR/openvino" -name "*.md" 2>/dev/null | wc -l)
- **Focus**: GStreamer + OpenVINO integration

### Repository Documentation
- **Location**: staging/filtered/repos/
- **Repositories**: $(find "$FILTERED_DIR/repos" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l)
- **Focus**: Extracted high-value documentation

## Filtering Criteria Applied

### Included Content
- Production-ready documentation
- GStreamer pipeline and element documentation
- AWS service integration guides
- Hardware acceleration documentation
- OpenVINO GStreamer plugin documentation

### Excluded Content
- Deprecated or legacy documentation
- Test and example files (unless high-value)
- Duplicate content
- Development-only documentation

## Next Steps
1. Review filtered content in staging/filtered/
2. Run processing script for final optimization
3. Upload to S3 knowledge base
4. Trigger knowledge base re-indexing

MANIFEST_EOF

echo "✅ Content filtering complete!"
echo ""
echo "📊 Filtering Results:"
echo "  - Filtered content: $FILTERED_DIR"
echo "  - Content manifest: ../../manifests/filtered-content-manifest.md"
echo ""
echo "📁 Ready for next steps:"
echo "1. Review filtered content"
echo "2. Run staging script"
echo "3. Sync with S3"
