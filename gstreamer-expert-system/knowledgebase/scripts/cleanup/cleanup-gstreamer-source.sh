#!/bin/bash

# Remove Redundant GStreamer Source Code
# Keeps only examples and bindings, removes internal implementation

set -e

BUCKET_NAME="gstreamer-expert-knowledge-base-1755726919"
AWS_PROFILE="malone-aws"

echo "🧹 Removing redundant GStreamer source code from Knowledge Base..."
echo "📦 Bucket: $BUCKET_NAME"
echo "👤 Profile: $AWS_PROFILE"
echo ""

echo "🎯 STRATEGY:"
echo "   ✅ KEEP: gst-examples/ (working application examples)"
echo "   ✅ KEEP: gst-python/ (Python bindings and examples)"
echo "   ✅ KEEP: gstreamer-sharp/ (C# bindings and examples)"
echo "   ❌ REMOVE: All plugin source code (internal implementation)"
echo "   ❌ REMOVE: Core library source code (internal implementation)"
echo "   ❌ REMOVE: Build system files (.wrap files)"
echo ""

# Function to remove directory
remove_directory() {
    local dir_path=$1
    local description=$2
    echo "🗑️  Removing: $dir_path ($description)..."
    
    aws s3 rm "s3://$BUCKET_NAME/$dir_path" \
        --recursive \
        --profile "$AWS_PROFILE" \
        --quiet
    
    echo "   ✅ Removed $dir_path"
}

echo "🗑️  REMOVING PLUGIN SOURCE CODE (Internal Implementation):"
echo ""

# Remove all plugin source code - users don't need internal implementation
remove_directory "repos/gstreamer/subprojects/gst-plugins-bad/" "Bad plugins source code"
remove_directory "repos/gstreamer/subprojects/gst-plugins-good/" "Good plugins source code"
remove_directory "repos/gstreamer/subprojects/gst-plugins-base/" "Base plugins source code"
remove_directory "repos/gstreamer/subprojects/gst-plugins-ugly/" "Ugly plugins source code"

echo ""
echo "🗑️  REMOVING CORE LIBRARY SOURCE CODE (Internal Implementation):"
echo ""

# Remove core GStreamer library source - users don't need internal implementation
remove_directory "repos/gstreamer/subprojects/gstreamer/" "Core GStreamer library source"
remove_directory "repos/gstreamer/subprojects/gst-libav/" "FFmpeg wrapper source"
remove_directory "repos/gstreamer/subprojects/gst-rtsp-server/" "RTSP server source"
remove_directory "repos/gstreamer/subprojects/gst-editing-services/" "Video editing source"

echo ""
echo "🗑️  REMOVING DEVELOPMENT TOOLS AND TEST SUITES:"
echo ""

# Remove development tools and test suites
remove_directory "repos/gstreamer/subprojects/gst-devtools/" "Development tools source"
remove_directory "repos/gstreamer/subprojects/gst-integration-testsuites/" "Integration test suites"

echo ""
echo "🗑️  REMOVING DOCUMENTATION (Duplicates docs/gstreamer-core):"
echo ""

# Remove gst-docs as it likely duplicates our curated docs/gstreamer-core
remove_directory "repos/gstreamer/subprojects/gst-docs/" "Documentation (duplicates docs/)"

echo ""
echo "🗑️  REMOVING BUILD SYSTEM FILES:"
echo ""

# Remove all .wrap files (build system dependencies)
echo "🗑️  Removing build dependency files (.wrap files)..."
aws s3 rm "s3://$BUCKET_NAME/repos/gstreamer/subprojects/" \
    --recursive \
    --exclude "*" \
    --include "*.wrap" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed .wrap files"

# Remove other build-related directories
remove_directory "repos/gstreamer/subprojects/macos-bison-binary/" "macOS build tools"

echo ""
echo "📊 CLEANUP SUMMARY:"
echo "   ✅ Removed plugin source code (gst-plugins-*)"
echo "   ✅ Removed core library source code"
echo "   ✅ Removed development tools and test suites"
echo "   ✅ Removed duplicate documentation"
echo "   ✅ Removed build system files"
echo ""
echo "   ✅ KEPT: gst-examples/ (working application examples)"
echo "   ✅ KEPT: gst-python/ (Python bindings and examples)"
echo "   ✅ KEPT: gstreamer-sharp/ (C# bindings and examples)"
echo ""

# Check what's left
echo "📋 Checking remaining files in repos/gstreamer..."
remaining_files=$(aws s3 ls "s3://$BUCKET_NAME/repos/gstreamer/" --recursive --profile "$AWS_PROFILE" | wc -l || echo "0")
echo "   📊 Remaining files: $remaining_files"

echo ""
echo "🎯 EXPECTED IMPACT:"
echo "   • Removed ~7,822 files (85.7% of repos/gstreamer)"
echo "   • Kept ~1,307 files (examples and bindings)"
echo "   • Knowledge Base now focused on USER-FACING content"
echo "   • Better retrieval accuracy for application development"
echo "   • Faster ingestion with higher success rate"
echo ""
echo "💡 RATIONALE:"
echo "   GStreamer expert agent should help users BUILD applications,"
echo "   not understand internal GStreamer implementation details."
echo ""
echo "   Users need:"
echo "   • Working examples and tutorials"
echo "   • Language bindings (Python, C#)"
echo "   • Best practices and patterns"
echo ""
echo "   Users DON'T need:"
echo "   • Plugin source code internals"
echo "   • Core library implementation"
echo "   • Build system dependencies"
echo ""
echo "✅ GStreamer source cleanup completed successfully!"
