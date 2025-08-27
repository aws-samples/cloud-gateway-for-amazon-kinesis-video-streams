#!/bin/bash

# Extract ALL GStreamer elements from documentation
# Comprehensive element coverage for precision KB

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_DIR="$(dirname "$SCRIPT_DIR")"
PRECISION_DIR="$KB_DIR/precision-kb"
RAW_SOURCES="$KB_DIR/raw-sources"

echo "🔍 Extracting ALL GStreamer Elements from Documentation"
echo "====================================================="
echo "Source: $RAW_SOURCES"
echo "Target: $PRECISION_DIR/element-references-complete/"

# Create comprehensive element references directory
mkdir -p "$PRECISION_DIR/element-references-complete"

echo ""
echo "📋 Step 1: Discover All Elements in Documentation"
echo "================================================"

# Find all potential GStreamer elements in documentation
echo "Scanning for GStreamer elements..."
ALL_ELEMENTS=$(find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
xargs grep -ho "\b[a-z][a-z0-9]*src\b\|\b[a-z][a-z0-9]*sink\b\|\b[a-z][a-z0-9]*enc\b\|\b[a-z][a-z0-9]*dec\b\|\b[a-z][a-z0-9]*parse\b\|\b[a-z][a-z0-9]*depay\b\|\b[a-z][a-z0-9]*pay\b\|\b[a-z][a-z0-9]*mux\b\|\b[a-z][a-z0-9]*demux\b\|\bqueue\b\|\btee\b\|\b[a-z][a-z0-9]*convert\b\|\b[a-z][a-z0-9]*scale\b\|\b[a-z][a-z0-9]*filter\b" | \
sort | uniq)

echo "Found $(echo "$ALL_ELEMENTS" | wc -l) potential elements"

echo ""
echo "📋 Step 2: Extract Documentation for Each Element"
echo "================================================"

# Counter for progress
count=0
total=$(echo "$ALL_ELEMENTS" | wc -l)

echo "$ALL_ELEMENTS" | while read element; do
    if [ -n "$element" ]; then
        count=$((count + 1))
        echo "[$count/$total] Extracting: $element"
        
        # Find files containing this element
        files_with_element=$(find "$RAW_SOURCES" -name "*.md" -o -name "*.txt" -o -name "*.rst" | \
        xargs grep -l "\b$element\b" 2>/dev/null | head -5)
        
        if [ -n "$files_with_element" ]; then
            # Extract element-specific content
            echo "$files_with_element" | while read file; do
                if [ -f "$file" ]; then
                    # Extract context around element mentions
                    grep -A 15 -B 5 "\b$element\b" "$file" 2>/dev/null >> "$PRECISION_DIR/element-references-complete/${element}.md" || true
                fi
            done
            
            # Add separator between different files
            echo -e "\n---\n" >> "$PRECISION_DIR/element-references-complete/${element}.md" 2>/dev/null || true
        fi
    fi
done

echo ""
echo "📋 Step 3: Filter and Clean Element References"
echo "=============================================="

# Remove empty files
find "$PRECISION_DIR/element-references-complete" -type f -empty -delete

# Remove files that are too small (likely not useful)
find "$PRECISION_DIR/element-references-complete" -type f -size -200c -delete

# Count final results
final_count=$(find "$PRECISION_DIR/element-references-complete" -type f | wc -l)
total_size=$(du -sh "$PRECISION_DIR/element-references-complete" 2>/dev/null | cut -f1 || echo "0B")

echo ""
echo "✅ Comprehensive Element Extraction Complete"
echo "==========================================="
echo "Elements with documentation: $final_count"
echo "Total size: $total_size"
echo "Location: $PRECISION_DIR/element-references-complete/"

echo ""
echo "📊 Element Categories Found:"
find "$PRECISION_DIR/element-references-complete" -name "*src.md" | wc -l | xargs echo "Sources:"
find "$PRECISION_DIR/element-references-complete" -name "*sink.md" | wc -l | xargs echo "Sinks:"
find "$PRECISION_DIR/element-references-complete" -name "*enc.md" | wc -l | xargs echo "Encoders:"
find "$PRECISION_DIR/element-references-complete" -name "*dec.md" | wc -l | xargs echo "Decoders:"
find "$PRECISION_DIR/element-references-complete" -name "*parse.md" | wc -l | xargs echo "Parsers:"
find "$PRECISION_DIR/element-references-complete" -name "*mux.md" | wc -l | xargs echo "Muxers:"

echo ""
echo "🔄 Next Steps:"
echo "1. Review extracted elements for quality"
echo "2. Upload comprehensive element references to S3"
echo "3. Create new data source with complete element coverage"
echo "4. Re-ingest precision KB with comprehensive elements"

# Create summary file
cat > "$PRECISION_DIR/element-references-complete/README.md" << EOF
# Comprehensive GStreamer Element References

Generated: $(date)
Source: $RAW_SOURCES
Elements documented: $final_count
Total size: $total_size

## Coverage
- Sources: $(find "$PRECISION_DIR/element-references-complete" -name "*src.md" | wc -l)
- Sinks: $(find "$PRECISION_DIR/element-references-complete" -name "*sink.md" | wc -l)
- Encoders: $(find "$PRECISION_DIR/element-references-complete" -name "*enc.md" | wc -l)
- Decoders: $(find "$PRECISION_DIR/element-references-complete" -name "*dec.md" | wc -l)
- Parsers: $(find "$PRECISION_DIR/element-references-complete" -name "*parse.md" | wc -l)
- Muxers: $(find "$PRECISION_DIR/element-references-complete" -name "*mux.md" | wc -l)

## Usage
This directory contains comprehensive element documentation extracted from the raw sources.
Each file contains context and usage information for a specific GStreamer element.
EOF

echo "📄 Created summary: $PRECISION_DIR/element-references-complete/README.md"
