#!/bin/bash

# GStreamer Knowledge Base Upload Helper
# Uploads content to S3 and triggers ingestion

set -e

# Configuration
BUCKET="gstreamer-precision-kb-1756157992"
KB_ID="5CGJIOV1QM"
DATA_SOURCE_ID="L80DJLYRON"
AWS_PROFILE="malone-aws"

echo "📤 GStreamer Knowledge Base Upload Helper"
echo "========================================="
echo ""

# Check arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <relative-path-to-file>"
    echo ""
    echo "Examples:"
    echo "  $0 elements/nvh264enc.md"
    echo "  $0 integration-patterns/kvs-auth.md"
    echo "  $0 working-examples/webcam-streaming.pipeline.md"
    echo ""
    exit 1
fi

file_path=$1

# Validate file exists
if [ ! -f "gstreamer-kb/${file_path}" ]; then
    echo "❌ File not found: gstreamer-kb/${file_path}"
    echo ""
    echo "Available files:"
    find gstreamer-kb -name "*.md" -type f | head -10
    exit 1
fi

# Extract filename for description
filename=$(basename "${file_path}")
directory=$(dirname "${file_path}")

echo "📁 File: ${filename}"
echo "📂 Directory: ${directory}"
echo "🪣 Bucket: s3://${BUCKET}/gstreamer-kb/"
echo ""

# Confirm upload
read -p "Upload this file to the knowledge base? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Upload cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting upload process..."

# Upload to S3
echo "📤 Uploading to S3..."
s3_path="s3://${BUCKET}/gstreamer-kb/${file_path}"

aws s3 cp "gstreamer-kb/${file_path}" "${s3_path}" --profile "${AWS_PROFILE}"

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
else
    echo "❌ Upload failed!"
    exit 1
fi

echo ""
echo "🔄 Starting knowledge base ingestion..."

# Start ingestion job
ingestion_result=$(aws bedrock-agent start-ingestion-job \
    --knowledge-base-id "${KB_ID}" \
    --data-source-id "${DATA_SOURCE_ID}" \
    --description "Added: ${filename} in ${directory}/" \
    --profile "${AWS_PROFILE}" 2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Ingestion job started successfully!"
    
    # Extract job ID from result
    job_id=$(echo "${ingestion_result}" | grep -o '"ingestionJobId": "[^"]*"' | cut -d'"' -f4)
    
    if [ -n "${job_id}" ]; then
        echo "📋 Job ID: ${job_id}"
        echo ""
        echo "🔍 Monitor progress with:"
        echo "aws bedrock-agent get-ingestion-job \\"
        echo "  --knowledge-base-id ${KB_ID} \\"
        echo "  --data-source-id ${DATA_SOURCE_ID} \\"
        echo "  --ingestion-job-id ${job_id} \\"
        echo "  --profile ${AWS_PROFILE}"
    fi
else
    echo "❌ Ingestion job failed to start!"
    echo "Error: ${ingestion_result}"
    exit 1
fi

echo ""
echo "🎉 Upload complete!"
echo ""
echo "📊 Summary:"
echo "   File: ${filename}"
echo "   Location: gstreamer-kb/${file_path}"
echo "   S3 Path: ${s3_path}"
echo "   Status: Uploaded and ingestion started"
echo ""
echo "⏳ The knowledge base will be updated in a few minutes."
echo "   You can test the new content once ingestion completes."
echo ""
