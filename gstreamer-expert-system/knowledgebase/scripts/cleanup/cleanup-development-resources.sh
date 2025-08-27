#!/bin/bash

# Cleanup Development Resources from Knowledge Base
# Removes CI/CD, build tools, IDE configs, and other development-only files

set -e

BUCKET_NAME="gstreamer-expert-knowledge-base-1755726919"
AWS_PROFILE="malone-aws"

echo "🧹 Cleaning up development-only resources from Knowledge Base..."
echo "📦 Bucket: $BUCKET_NAME"
echo "👤 Profile: $AWS_PROFILE"
echo ""

# Function to remove files by pattern
remove_by_pattern() {
    local pattern=$1
    local description=$2
    echo "🗑️  Removing $description..."
    
    aws s3 rm "s3://$BUCKET_NAME/" \
        --recursive \
        --exclude "*" \
        --include "$pattern" \
        --profile "$AWS_PROFILE" \
        --quiet
    
    echo "   ✅ Removed $description"
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

echo "🔧 REMOVING CI/CD AND BUILD INFRASTRUCTURE:"
echo ""

# Remove CI/CD directories and files
remove_directory "repos/gstreamer/ci/" "CI/CD pipeline configurations and scripts"
remove_directory "repos/gstreamer/.gitlab/" "GitLab issue templates and configs"
remove_directory "repos/gstreamer/.devcontainer/" "Development container configurations"
remove_directory "repos/gstreamer/.vscode/" "Visual Studio Code workspace settings"

# Remove CI/CD files from subprojects
echo "🗑️  Removing CI/CD files from all subprojects..."
aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/ci/*" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed CI/CD files from subprojects"

echo ""
echo "📝 REMOVING VERSION CONTROL AND DEVELOPMENT FILES:"
echo ""

# Git-related files
remove_by_pattern "*/.git*" "Git configuration files (.gitignore, .gitattributes, etc.)"
remove_by_pattern "*/.pre-commit*" "Pre-commit hook configurations"

# IDE and editor configurations
remove_by_pattern "*/.vscode/*" "Visual Studio Code configurations"
remove_by_pattern "*/.devcontainer/*" "Development container configurations"
remove_by_pattern "*/.editorconfig" "Editor configuration files"
remove_by_pattern "*/.clang-format" "Code formatting configurations"

# Build and dependency management
remove_by_pattern "*/Cargo.lock" "Rust dependency lock files"
remove_by_pattern "*/package-lock.json" "NPM dependency lock files"
remove_by_pattern "*/yarn.lock" "Yarn dependency lock files"
remove_by_pattern "*/.dockerignore" "Docker ignore files"

echo ""
echo "🧪 REMOVING TEST AND DEVELOPMENT UTILITIES:"
echo ""

# Test-related directories that don't contain useful examples
remove_directory "repos/gstreamer/tests/" "Top-level test configurations"

# Remove fuzzing and testing infrastructure
echo "🗑️  Removing fuzzing and testing infrastructure..."
aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/fuzzing/*" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed fuzzing infrastructure"

# Remove test reference files (large JSON files with test vectors)
echo "🗑️  Removing test vector reference files..."
aws s3 rm "s3://$BUCKET_NAME/" \
    --recursive \
    --exclude "*" \
    --include "*/test_suites/*" \
    --profile "$AWS_PROFILE" \
    --quiet
echo "   ✅ Removed test vector files"

echo ""
echo "🏗️ REMOVING BUILD ARTIFACTS AND TEMPORARY FILES:"
echo ""

# Build artifacts and temporary files
remove_by_pattern "*/.stamp" "Build timestamp files"
remove_by_pattern "*/build/*" "Build output directories"
remove_by_pattern "*/target/*" "Rust build output directories"
remove_by_pattern "*/.cache/*" "Cache directories"
remove_by_pattern "*/tmp/*" "Temporary directories"
remove_by_pattern "*/*.tmp" "Temporary files"
remove_by_pattern "*/*.log" "Log files"
remove_by_pattern "*/*.bak" "Backup files"
remove_by_pattern "*/*.orig" "Original files from merges"

# Development and debugging files
remove_by_pattern "*/.indent*" "Code indentation configuration files"
remove_by_pattern "*/.ignore" "Ignore configuration files"
remove_by_pattern "*/.gitlint" "Git linting configuration"

echo ""
echo "📊 REMOVING SECURITY ADVISORIES AND METADATA:"
echo ""

# Security advisories (useful for security teams but not for GStreamer usage)
remove_directory "repos/gstreamer/security-advisories/" "Security advisory documents"

# Remove metadata that doesn't help with GStreamer usage
remove_by_pattern "*/.doap" "DOAP (Description of a Project) metadata files"
remove_by_pattern "*/PATENTS*" "Patent information files"
remove_by_pattern "*/AUTHORS*" "Author listing files"

echo ""
echo "🔍 ANALYZING REMAINING DEVELOPMENT FILES:"
echo ""

# Check for any remaining development files
echo "📋 Checking for remaining development patterns..."
remaining_dev_files=$(aws s3 ls "s3://$BUCKET_NAME/" --recursive --profile "$AWS_PROFILE" | \
    awk '{print $4}' | \
    grep -E '\.(git|vscode|devcontainer|gitlab|ci|test|spec|lock|cache|tmp|log|bak|orig|rej|diff|patch|stamp)' | \
    wc -l || echo "0")

echo "   📊 Remaining development files: $remaining_dev_files"

# Check for remaining CI/build directories
remaining_ci_dirs=$(aws s3 ls "s3://$BUCKET_NAME/" --recursive --profile "$AWS_PROFILE" | \
    awk '{print $4}' | \
    grep -E '/(ci|build|target|cache|tmp)/' | \
    wc -l || echo "0")

echo "   📊 Remaining CI/build directory files: $remaining_ci_dirs"

echo ""
echo "📊 CLEANUP SUMMARY:"
echo "   ✅ Removed CI/CD pipeline configurations"
echo "   ✅ Removed IDE and editor configurations"
echo "   ✅ Removed version control files"
echo "   ✅ Removed build artifacts and temporary files"
echo "   ✅ Removed test infrastructure and reference files"
echo "   ✅ Removed security advisories and metadata"
echo "   ✅ Removed development container configurations"
echo ""
echo "🎯 EXPECTED IMPACT:"
echo "   • Significant reduction in file count"
echo "   • Improved Knowledge Base focus on actual GStreamer usage"
echo "   • Faster ingestion with fewer irrelevant files"
echo "   • Better retrieval accuracy by removing development noise"
echo ""
echo "📈 NEXT STEPS:"
echo "   1. Check final file count and types"
echo "   2. Start new ingestion job with cleaned dataset"
echo "   3. Monitor for improved success rate"
echo ""
echo "✅ Development resources cleanup completed successfully!"
