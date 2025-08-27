#!/bin/bash

# Create Precision Knowledge Base in AWS Bedrock
# Upload precision content and create new KB

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_DIR="$(dirname "$SCRIPT_DIR")"
PRECISION_DIR="$KB_DIR/precision-kb"

# Load configuration
source "$KB_DIR/../current-config/config.env"

# New precision KB configuration
PRECISION_BUCKET_NAME="gstreamer-precision-kb-$(date +%s)"
PRECISION_KB_NAME="gstreamer-precision-kb"
PRECISION_KB_DESCRIPTION="Precision GStreamer Knowledge Base - High-value content only (508K vs 35M)"

echo "🎯 Creating Precision Knowledge Base in AWS Bedrock"
echo "=================================================="
echo "Source: $PRECISION_DIR"
echo "Bucket: $PRECISION_BUCKET_NAME"
echo "KB Name: $PRECISION_KB_NAME"
echo "Region: $REGION"

# Check if precision content exists
if [ ! -d "$PRECISION_DIR" ]; then
    echo "❌ Precision KB content not found. Run create-precision-kb.sh first."
    exit 1
fi

echo ""
echo "📋 Step 1: Create S3 Bucket for Precision KB"
echo "============================================="

aws s3 mb "s3://$PRECISION_BUCKET_NAME" --region "$REGION" --profile malone-aws
echo "✅ Created bucket: $PRECISION_BUCKET_NAME"

echo ""
echo "📋 Step 2: Upload Precision Content to S3"
echo "=========================================="

# Upload precision content
aws s3 sync "$PRECISION_DIR" "s3://$PRECISION_BUCKET_NAME/precision-content/" \
    --region "$REGION" \
    --profile malone-aws \
    --exclude "*.DS_Store" \
    --exclude "README.md"

echo "✅ Uploaded precision content to S3"

# Show upload summary
echo ""
echo "📊 Upload Summary:"
aws s3 ls "s3://$PRECISION_BUCKET_NAME/precision-content/" --recursive --human-readable --summarize --profile malone-aws

echo ""
echo "📋 Step 3: Create Precision Knowledge Base"
echo "=========================================="

# Create the precision knowledge base
PRECISION_KB_RESPONSE=$(aws bedrock-agent create-knowledge-base \
    --name "$PRECISION_KB_NAME" \
    --description "$PRECISION_KB_DESCRIPTION" \
    --role-arn "$KB_ROLE_ARN" \
    --knowledge-base-configuration '{
        "type": "VECTOR",
        "vectorKnowledgeBaseConfiguration": {
            "embeddingModelArn": "arn:aws:bedrock:'$REGION'::foundation-model/amazon.titan-embed-text-v1"
        }
    }' \
    --storage-configuration '{
        "type": "OPENSEARCH_SERVERLESS",
        "opensearchServerlessConfiguration": {
            "collectionArn": "'$COLLECTION_ARN'",
            "vectorIndexName": "precision-gstreamer-index",
            "fieldMapping": {
                "vectorField": "precision-vector",
                "textField": "precision-text",
                "metadataField": "precision-metadata"
            }
        }
    }' \
    --profile malone-aws)

PRECISION_KB_ID=$(echo "$PRECISION_KB_RESPONSE" | jq -r '.knowledgeBase.knowledgeBaseId')
echo "✅ Created Precision Knowledge Base: $PRECISION_KB_ID"

echo ""
echo "📋 Step 4: Create Data Source for Precision KB"
echo "=============================================="

# Create data source
PRECISION_DS_RESPONSE=$(aws bedrock-agent create-data-source \
    --knowledge-base-id "$PRECISION_KB_ID" \
    --name "precision-gstreamer-docs" \
    --description "Precision GStreamer documentation - high-value content only" \
    --data-source-configuration '{
        "type": "S3",
        "s3Configuration": {
            "bucketArn": "arn:aws:s3:::'$PRECISION_BUCKET_NAME'",
            "inclusionPrefixes": ["precision-content/"]
        }
    }' \
    --profile malone-aws)

PRECISION_DS_ID=$(echo "$PRECISION_DS_RESPONSE" | jq -r '.dataSource.dataSourceId')
echo "✅ Created Precision Data Source: $PRECISION_DS_ID"

echo ""
echo "📋 Step 5: Start Ingestion Job"
echo "=============================="

# Start ingestion
PRECISION_INGESTION_RESPONSE=$(aws bedrock-agent start-ingestion-job \
    --knowledge-base-id "$PRECISION_KB_ID" \
    --data-source-id "$PRECISION_DS_ID" \
    --profile malone-aws)

PRECISION_INGESTION_JOB_ID=$(echo "$PRECISION_INGESTION_RESPONSE" | jq -r '.ingestionJob.ingestionJobId')
echo "✅ Started Precision Ingestion Job: $PRECISION_INGESTION_JOB_ID"

echo ""
echo "📋 Step 6: Monitor Ingestion Progress"
echo "===================================="

echo "Monitoring ingestion progress..."
while true; do
    STATUS=$(aws bedrock-agent get-ingestion-job \
        --knowledge-base-id "$PRECISION_KB_ID" \
        --data-source-id "$PRECISION_DS_ID" \
        --ingestion-job-id "$PRECISION_INGESTION_JOB_ID" \
        --profile malone-aws | jq -r '.ingestionJob.status')
    
    echo "Ingestion Status: $STATUS"
    
    if [ "$STATUS" = "COMPLETE" ]; then
        echo "✅ Precision KB Ingestion Complete!"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo "❌ Precision KB Ingestion Failed!"
        aws bedrock-agent get-ingestion-job \
            --knowledge-base-id "$PRECISION_KB_ID" \
            --data-source-id "$PRECISION_DS_ID" \
            --ingestion-job-id "$PRECISION_INGESTION_JOB_ID" \
            --profile malone-aws | jq '.ingestionJob.failureReasons'
        exit 1
    else
        echo "⏳ Still processing... waiting 30 seconds"
        sleep 30
    fi
done

echo ""
echo "📋 Step 7: Update Configuration"
echo "==============================="

# Update config with precision KB details
cat >> "$KB_DIR/../current-config/config.env" << EOF

# PRECISION KNOWLEDGE BASE CONFIGURATION
PRECISION_BUCKET_NAME=$PRECISION_BUCKET_NAME
PRECISION_KB_ID=$PRECISION_KB_ID
PRECISION_DS_ID=$PRECISION_DS_ID
PRECISION_INGESTION_JOB_ID=$PRECISION_INGESTION_JOB_ID
EOF

echo "✅ Updated configuration with precision KB details"

echo ""
echo "🎉 PRECISION KNOWLEDGE BASE CREATION COMPLETE"
echo "=============================================="
echo "Precision KB ID: $PRECISION_KB_ID"
echo "Precision Bucket: $PRECISION_BUCKET_NAME"
echo "Content Size: 508K (vs original 35M)"
echo "Reduction: 98.5%"
echo ""
echo "🔄 Next Steps:"
echo "1. Create new agent version with precision KB"
echo "2. Test precision KB performance"
echo "3. Deploy intelligent routing"
echo "4. Compare performance metrics"

# Create summary file
cat > "$PRECISION_DIR/precision-kb-info.json" << EOF
{
    "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "bucket": "$PRECISION_BUCKET_NAME",
    "knowledgeBaseId": "$PRECISION_KB_ID",
    "dataSourceId": "$PRECISION_DS_ID",
    "ingestionJobId": "$PRECISION_INGESTION_JOB_ID",
    "contentSize": "508K",
    "originalSize": "35M",
    "reduction": "98.5%",
    "contentStructure": {
        "working-examples": 28,
        "element-references": 20,
        "integration-patterns": 16,
        "platform-specifics": 7,
        "troubleshooting": 1
    }
}
EOF

echo "📄 Created precision KB info file: $PRECISION_DIR/precision-kb-info.json"
