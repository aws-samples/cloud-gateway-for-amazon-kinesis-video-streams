#!/bin/bash

# Precision Knowledge Base Creation Script
# Extracts high-value content from 35M KB to create focused 5-10M KB

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_DIR="$(dirname "$SCRIPT_DIR")"
PRECISION_DIR="$KB_DIR/precision-kb"
RAW_SOURCES="$KB_DIR/raw-sources"

echo "🎯 Creating Precision Knowledge Base"
echo "Source: $RAW_SOURCES"
echo "Target: $PRECISION_DIR"
echo "Goal: Extract highest-value GStreamer content (5-10M target)"

# Create precision KB directory structure
mkdir -p "$PRECISION_DIR"/{working-examples,element-references,platform-specifics,integration-patterns,troubleshooting}

echo ""
echo "📋 Phase 1: Extract Working Pipeline Examples"
echo "=============================================="

# Extract working examples with complete pipelines
find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -l "gst-launch-1.0" | \
head -50 | \
while read file; do
    echo "Processing: $(basename "$file")"
    # Extract sections with working pipelines
    awk '/gst-launch-1.0/{p=1} p&&/^$/{if(++n==2) p=0} p' "$file" > "$PRECISION_DIR/working-examples/$(basename "$file" | sed 's/\.[^.]*$/.pipeline.md/')" 2>/dev/null || true
done

echo ""
echo "📋 Phase 2: Extract Element Property References"
echo "=============================================="

# Extract element-specific documentation
PRIORITY_ELEMENTS=(
    "vtenc_h264" "vtenc_h265" "vtdec"
    "vaapih264enc" "vaapih265enc" "vaapidecodebin"
    "nvh264enc" "nvh265enc" "nvdec"
    "rtspsrc" "kvssink" "matroskamux"
    "rtph264depay" "rtph265depay" "rtpopusdepay"
    "h264parse" "h265parse" "aacparse"
    "queue" "tee" "audioconvert" "videoconvert"
)

for element in "${PRIORITY_ELEMENTS[@]}"; do
    echo "Extracting: $element"
    find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
    xargs grep -l "$element" | \
    head -10 | \
    while read file; do
        # Extract element-specific sections
        grep -A 20 -B 5 "$element" "$file" > "$PRECISION_DIR/element-references/${element}.md" 2>/dev/null || true
    done
done

echo ""
echo "📋 Phase 3: Extract Platform-Specific Information"
echo "=============================================="

# macOS/VideoToolbox content
find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -l -i "videotoolbox\|vtenc\|vtdec\|macos\|osx" | \
head -20 | \
while read file; do
    echo "Processing macOS content: $(basename "$file")"
    grep -A 10 -B 5 -i "videotoolbox\|vtenc\|vtdec" "$file" > "$PRECISION_DIR/platform-specifics/macos-$(basename "$file")" 2>/dev/null || true
done

# Linux/VAAPI content
find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -l -i "vaapi\|nvenc\|nvdec\|linux" | \
head -20 | \
while read file; do
    echo "Processing Linux content: $(basename "$file")"
    grep -A 10 -B 5 -i "vaapi\|nvenc\|nvdec" "$file" > "$PRECISION_DIR/platform-specifics/linux-$(basename "$file")" 2>/dev/null || true
done

echo ""
echo "📋 Phase 4: Extract Integration Patterns"
echo "=============================================="

# AWS KVS integration
find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -l -i "kvssink\|kinesis\|aws" | \
head -15 | \
while read file; do
    echo "Processing KVS integration: $(basename "$file")"
    grep -A 15 -B 5 -i "kvssink\|kinesis" "$file" > "$PRECISION_DIR/integration-patterns/kvs-$(basename "$file")" 2>/dev/null || true
done

# OpenVINO integration
find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -l -i "openvino\|inference" | \
head -10 | \
while read file; do
    echo "Processing OpenVINO integration: $(basename "$file")"
    grep -A 15 -B 5 -i "openvino\|inference" "$file" > "$PRECISION_DIR/integration-patterns/openvino-$(basename "$file")" 2>/dev/null || true
done

echo ""
echo "📋 Phase 5: Extract Troubleshooting Patterns"
echo "=============================================="

# Common error patterns
ERROR_PATTERNS=(
    "caps negotiation failed"
    "could not link"
    "no decoder available"
    "format not supported"
    "buffer underrun"
    "pipeline stalled"
)

for pattern in "${ERROR_PATTERNS[@]}"; do
    echo "Extracting error pattern: $pattern"
    find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
    xargs grep -l -i "$pattern" | \
    head -5 | \
    while read file; do
        grep -A 10 -B 5 -i "$pattern" "$file" > "$PRECISION_DIR/troubleshooting/$(echo "$pattern" | tr ' ' '_').md" 2>/dev/null || true
    done
done

echo ""
echo "📋 Phase 6: Clean and Optimize Content"
echo "=============================================="

# Remove empty files
find "$PRECISION_DIR" -type f -empty -delete

# Remove files smaller than 100 bytes (likely not useful)
find "$PRECISION_DIR" -type f -size -100c -delete

# Create content summary
echo "📊 Precision KB Content Summary" > "$PRECISION_DIR/README.md"
echo "===============================" >> "$PRECISION_DIR/README.md"
echo "" >> "$PRECISION_DIR/README.md"
echo "Generated: $(date)" >> "$PRECISION_DIR/README.md"
echo "Source: $RAW_SOURCES" >> "$PRECISION_DIR/README.md"
echo "" >> "$PRECISION_DIR/README.md"

for dir in working-examples element-references platform-specifics integration-patterns troubleshooting; do
    count=$(find "$PRECISION_DIR/$dir" -type f | wc -l)
    size=$(du -sh "$PRECISION_DIR/$dir" 2>/dev/null | cut -f1 || echo "0B")
    echo "- $dir: $count files, $size" >> "$PRECISION_DIR/README.md"
done

total_size=$(du -sh "$PRECISION_DIR" 2>/dev/null | cut -f1 || echo "0B")
echo "" >> "$PRECISION_DIR/README.md"
echo "Total Size: $total_size" >> "$PRECISION_DIR/README.md"

echo ""
echo "✅ Precision KB Creation Complete"
echo "=================================="
echo "Location: $PRECISION_DIR"
echo "Total Size: $total_size"
echo ""
echo "Content Structure:"
find "$PRECISION_DIR" -type d | sort | while read dir; do
    if [ "$dir" != "$PRECISION_DIR" ]; then
        count=$(find "$dir" -maxdepth 1 -type f | wc -l)
        echo "  $(basename "$dir"): $count files"
    fi
done

echo ""
echo "🔄 Next Steps:"
echo "1. Review extracted content quality"
echo "2. Upload to S3 for new knowledge base"
echo "3. Create new KB with precision content"
echo "4. Test performance improvements"
