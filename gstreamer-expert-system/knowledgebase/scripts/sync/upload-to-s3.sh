#!/bin/bash

# Upload documentation to S3
set -e

source config.env

echo "Uploading documentation to S3 bucket: $BUCKET_NAME"

# Upload documentation with proper organization
aws s3 sync docs/ s3://$BUCKET_NAME/docs/ \
    --exclude "*.git*" \
    --exclude "*.DS_Store" \
    --include "*.html" \
    --include "*.md" \
    --include "*.txt" \
    --include "*.pdf" \
    --include "*.cpp" \
    --include "*.c" \
    --include "*.h" \
    --include "*.py" \
    --profile malone-aws

# Upload source repositories (filtered for documentation and examples)
aws s3 sync repos/ s3://$BUCKET_NAME/repos/ \
    --exclude "*" \
    --include "*/README*" \
    --include "*/docs/*" \
    --include "*/examples/*" \
    --include "*/samples/*" \
    --include "*.md" \
    --include "*.cpp" \
    --include "*.c" \
    --include "*.h" \
    --include "*.py" \
    --profile malone-aws

echo "Upload complete!"
echo "S3 bucket contents:"
aws s3 ls s3://$BUCKET_NAME/ --recursive --human-readable --profile malone-aws
