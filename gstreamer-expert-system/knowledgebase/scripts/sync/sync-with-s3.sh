#!/bin/bash

# Knowledge Base S3 Synchronization Script
# Handles bidirectional sync between local staging and S3

set -e

# Configuration
KB_STAGING_DIR="knowledge-base-staging"
S3_BUCKET="your-knowledge-base-bucket"  # Update with actual bucket
S3_PREFIX="gstreamer-expert-docs"

echo "🔄 Syncing Knowledge Base with S3..."
echo "===================================="

# Check if staging directory exists
if [ ! -d "$KB_STAGING_DIR" ]; then
    echo "❌ Staging directory not found. Run collect-all-documentation.sh first."
    exit 1
fi

echo "📤 Phase 1: Upload new/updated content to S3"
echo "--------------------------------------------"

# Upload staged content to S3
aws s3 sync "$KB_STAGING_DIR" "s3://$S3_BUCKET/$S3_PREFIX" \
    --profile malone-aws \
    --delete \
    --exclude "*.git*" \
    --exclude "*.DS_Store" \
    --exclude "*.tmp"

echo "📥 Phase 2: Download S3 content for local reference"
echo "--------------------------------------------------"

# Create local reference copy
mkdir -p "documentation/s3-reference"
aws s3 sync "s3://$S3_BUCKET/$S3_PREFIX" "documentation/s3-reference" \
    --profile malone-aws

echo "🔍 Phase 3: Generate sync report"
echo "-------------------------------"

# Generate sync report
cat > "reports/knowledge-base-sync-$(date +%Y%m%d-%H%M%S).md" << SYNC_EOF
# Knowledge Base S3 Sync Report

**Sync Date**: $(date)
**S3 Location**: s3://$S3_BUCKET/$S3_PREFIX

## Upload Summary
- Local staging files: $(find "$KB_STAGING_DIR" -type f | wc -l)
- Total size uploaded: $(du -sh "$KB_STAGING_DIR" | cut -f1)

## S3 Content Summary
- S3 files after sync: $(aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX" --recursive --profile malone-aws | wc -l)

## Next Steps
1. Trigger knowledge base re-indexing in Bedrock
2. Test agent with updated knowledge base
3. Monitor accuracy improvements

SYNC_EOF

echo "✅ Knowledge base sync complete!"
echo "📋 Sync report: reports/knowledge-base-sync-$(date +%Y%m%d-%H%M%S).md"
