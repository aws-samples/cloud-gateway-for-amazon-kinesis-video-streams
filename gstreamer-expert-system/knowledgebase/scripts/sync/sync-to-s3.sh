#!/bin/bash

# Enhanced S3 Knowledge Base Sync Script
# Syncs staged content to S3 with comprehensive reporting

set -e

echo "☁️  Syncing knowledge base content to S3..."
echo "=========================================="

# Configuration
READY_DIR="../../staging/ready-for-upload"
REPORTS_DIR="../../reports"
S3_BUCKET="${KB_S3_BUCKET:-your-knowledge-base-bucket}"
S3_PREFIX="${KB_S3_PREFIX:-gstreamer-expert-docs}"
AWS_PROFILE="${AWS_PROFILE:-malone-aws}"

# Validate configuration
if [ "$S3_BUCKET" = "your-knowledge-base-bucket" ]; then
    echo "❌ Error: Please set KB_S3_BUCKET environment variable"
    echo "   Example: export KB_S3_BUCKET=your-actual-bucket-name"
    exit 1
fi

if [ ! -d "$READY_DIR" ]; then
    echo "❌ Error: Staged content not found. Run stage-for-upload.sh first."
    exit 1
fi

echo "📊 Pre-sync analysis..."
echo "----------------------"

# Count files to upload
TOTAL_FILES=$(find "$READY_DIR" -name "*.md" | wc -l)
TOTAL_SIZE=$(du -sh "$READY_DIR" | cut -f1)

echo "  Files to upload: $TOTAL_FILES"
echo "  Total size: $TOTAL_SIZE"
echo "  S3 destination: s3://$S3_BUCKET/$S3_PREFIX"
echo "  AWS profile: $AWS_PROFILE"

echo ""
echo "🔄 Uploading to S3..."
echo "--------------------"

# Sync to S3 with detailed logging
aws s3 sync "$READY_DIR" "s3://$S3_BUCKET/$S3_PREFIX" \
    --profile "$AWS_PROFILE" \
    --delete \
    --exclude "*.git*" \
    --exclude "*.DS_Store" \
    --exclude "*.tmp" \
    --exclude ".*" \
    2>&1 | tee "$REPORTS_DIR/s3-sync-$(date +%Y%m%d-%H%M%S).log"

echo ""
echo "📊 Post-sync verification..."
echo "---------------------------"

# Verify upload
S3_FILE_COUNT=$(aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX" --recursive --profile "$AWS_PROFILE" | wc -l)
echo "  Files in S3: $S3_FILE_COUNT"

# Generate sync report
SYNC_REPORT="$REPORTS_DIR/kb-sync-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$SYNC_REPORT" << SYNC_EOF
# Knowledge Base S3 Sync Report

**Sync Date**: $(date)
**S3 Location**: s3://$S3_BUCKET/$S3_PREFIX

## Upload Summary
- **Local files**: $TOTAL_FILES
- **Local size**: $TOTAL_SIZE
- **S3 files after sync**: $S3_FILE_COUNT
- **AWS Profile**: $AWS_PROFILE

## Sync Status
$(if [ "$TOTAL_FILES" -eq "$S3_FILE_COUNT" ]; then echo "✅ **SUCCESS**: All files uploaded successfully"; else echo "⚠️  **WARNING**: File count mismatch - verify sync"; fi)

## Next Steps
1. **Trigger Knowledge Base Re-indexing**: 
   - Go to AWS Bedrock console
   - Navigate to Knowledge Base
   - Trigger manual sync/re-indexing

2. **Test Agent Performance**:
   - Run accuracy tests to validate improvements
   - Monitor agent responses for enhanced knowledge

3. **Monitor Usage**:
   - Check CloudWatch metrics for embedding invocations
   - Monitor agent query patterns

## S3 Sync Log
See: s3-sync-$(date +%Y%m%d-%H%M%S).log

SYNC_EOF

echo "✅ S3 sync complete!"
echo ""
echo "📋 Sync Report: $SYNC_REPORT"
echo ""
echo "🔄 Next Steps:"
echo "1. Trigger knowledge base re-indexing in AWS console"
echo "2. Run accuracy tests to validate improvements"
echo "3. Monitor agent performance metrics"
