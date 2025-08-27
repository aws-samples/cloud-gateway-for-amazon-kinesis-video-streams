#!/bin/bash

# Cleanup Failed Files from Knowledge Base
# Based on analysis of ingestion job failures

set -e

BUCKET_NAME="gstreamer-expert-knowledge-base-1755726919"
AWS_PROFILE="malone-aws"

echo "🧹 Cleaning up failed file types from Knowledge Base..."
echo "📦 Bucket: $BUCKET_NAME"
echo "👤 Profile: $AWS_PROFILE"
echo ""

# Function to remove files by extension
remove_by_extension() {
    local ext=$1
    local description=$2
    echo "🗑️  Removing .$ext files ($description)..."
    
    aws s3 rm "s3://$BUCKET_NAME/" \
        --recursive \
        --exclude "*" \
        --include "*.$ext" \
        --profile "$AWS_PROFILE" \
        --quiet
    
    echo "   ✅ Removed .$ext files"
}

# Function to remove directory
remove_directory() {
    local dir_path=$1
    local description=$2
    echo "🗑️  Removing directory: $dir_path ($description)..."
    
    aws s3 rm "s3://$BUCKET_NAME/$dir_path" \
        --recursive \
        --profile "$AWS_PROFILE" \
        --quiet
    
    echo "   ✅ Removed $dir_path"
}

echo "📊 REMOVING PROBLEMATIC FILE EXTENSIONS:"
echo "   These file types consistently fail ingestion and provide no value to the agent"
echo ""

# Remove binary and media files that fail ingestion
remove_by_extension "jar" "Java archives - binary files"
remove_by_extension "mp4" "Video files - binary media"
remove_by_extension "ogg" "Audio files - binary media"
remove_by_extension "wav" "Audio files - binary media"
remove_by_extension "mts" "Video transport stream - binary media"
remove_by_extension "m4f" "Media fragment files - binary media"

# Remove development/build files that aren't useful for GStreamer guidance
remove_by_extension "patch" "Git patch files - not useful for agent"
remove_by_extension "hook" "Git hook scripts - not useful for agent"
remove_by_extension "filters" "Visual Studio filter files - IDE specific"
remove_by_extension "xcscheme" "Xcode scheme files - IDE specific"

# Remove Python and shell scripts that fail format validation
# Note: These are failing because Bedrock doesn't recognize them as valid code
echo ""
echo "⚠️  REMOVING PYTHON AND SHELL SCRIPTS:"
echo "   These are failing Bedrock's format validation despite being text files"
echo "   Most are old examples, test scripts, or build utilities"
echo ""

remove_by_extension "py" "Python scripts - failing format validation"
remove_by_extension "sh" "Shell scripts - failing format validation"

echo ""
echo "📁 REMOVING PROBLEMATIC DIRECTORIES:"
echo "   These directories contain mostly failed files and low-value content"
echo ""

# Remove specific directories with high failure rates
remove_directory "repos/gstreamer/subprojects/gst-python/old_examples/" "Old Python examples - all failing"
remove_directory "repos/gstreamer/scripts/" "Build/utility scripts - all failing"

# Remove test files directories (contain binary test media)
echo "🗑️  Removing test file directories (contain binary media)..."
aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/tests/files/*" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed test files directories"

# Remove Android-specific files that have no text content
echo "🗑️  Removing Android layout and manifest files (no text content)..."
aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/android/*/res/layout/*.xml" \
    --profile "$AWS_PROFILE" \
    --quiet

aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/android/AndroidManifest.xml" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed Android XML files"

echo ""
echo "📊 CLEANUP SUMMARY:"
echo "   ✅ Removed binary files (JAR, MP4, OGG, WAV, MTS, M4F)"
echo "   ✅ Removed development files (patch, hook, filters, xcscheme)"
echo "   ✅ Removed failing scripts (Python, Shell)"
echo "   ✅ Removed problematic directories"
echo "   ✅ Removed test media files"
echo ""
echo "🎯 EXPECTED IMPACT:"
echo "   • Should eliminate most of the 2,018 failed files"
echo "   • Reduces Knowledge Base size and noise"
echo "   • Improves ingestion success rate"
echo "   • Focuses content on documentation and C/C++ source code"
echo ""
echo "📈 NEXT STEPS:"
echo "   1. Wait for current ingestion job to complete"
echo "   2. Start new ingestion job to process cleaned dataset"
echo "   3. Monitor for reduced failure rate"
echo ""
echo "✅ Cleanup completed successfully!"
