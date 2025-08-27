#!/bin/bash

# Create new agent version with precision KB
# Uses existing infrastructure but with precision content

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KB_DIR="$(dirname "$SCRIPT_DIR")"

# Load configuration
source "$KB_DIR/../current-config/config.env"

# Precision KB bucket (already created)
PRECISION_BUCKET_NAME="gstreamer-precision-kb-1756157992"

echo "🎯 Creating Precision Agent Version"
echo "=================================="
echo "Using existing agent: $AGENT_ID"
echo "Precision bucket: $PRECISION_BUCKET_NAME"
echo "Original KB: $KB_ID"

echo ""
echo "📋 Step 1: Create Precision Data Source in Existing KB"
echo "====================================================="

# Add precision content as new data source to existing KB
PRECISION_DS_RESPONSE=$(aws bedrock-agent create-data-source \
    --knowledge-base-id "$KB_ID" \
    --name "precision-gstreamer-content" \
    --description "Precision GStreamer content - high-value only (508K)" \
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
echo "📋 Step 2: Start Precision Content Ingestion"
echo "==========================================="

# Start ingestion for precision content
PRECISION_INGESTION_RESPONSE=$(aws bedrock-agent start-ingestion-job \
    --knowledge-base-id "$KB_ID" \
    --data-source-id "$PRECISION_DS_ID" \
    --profile malone-aws)

PRECISION_INGESTION_JOB_ID=$(echo "$PRECISION_INGESTION_RESPONSE" | jq -r '.ingestionJob.ingestionJobId')
echo "✅ Started Precision Ingestion: $PRECISION_INGESTION_JOB_ID"

echo ""
echo "📋 Step 3: Monitor Ingestion Progress"
echo "===================================="

echo "Monitoring precision content ingestion..."
while true; do
    STATUS=$(aws bedrock-agent get-ingestion-job \
        --knowledge-base-id "$KB_ID" \
        --data-source-id "$PRECISION_DS_ID" \
        --ingestion-job-id "$PRECISION_INGESTION_JOB_ID" \
        --profile malone-aws | jq -r '.ingestionJob.status')
    
    echo "Precision Ingestion Status: $STATUS"
    
    if [ "$STATUS" = "COMPLETE" ]; then
        echo "✅ Precision Content Ingestion Complete!"
        break
    elif [ "$STATUS" = "FAILED" ]; then
        echo "❌ Precision Content Ingestion Failed!"
        aws bedrock-agent get-ingestion-job \
            --knowledge-base-id "$KB_ID" \
            --data-source-id "$PRECISION_DS_ID" \
            --ingestion-job-id "$PRECISION_INGESTION_JOB_ID" \
            --profile malone-aws | jq '.ingestionJob.failureReasons'
        exit 1
    else
        echo "⏳ Still processing... waiting 20 seconds"
        sleep 20
    fi
done

echo ""
echo "📋 Step 4: Create Precision Agent Version"
echo "========================================"

# Create new agent version with precision-focused instructions
PRECISION_INSTRUCTIONS="You are a GStreamer expert agent with access to precision-curated knowledge base containing high-value GStreamer content. You have embedded expertise for common queries and access to detailed documentation for complex scenarios.

## PRECISION KNOWLEDGE BASE ACCESS
Your knowledge base contains:
- Working pipeline examples (28 files)
- Element property references (20 priority elements)
- Platform-specific implementations (macOS, Linux, Windows)
- Integration patterns (AWS KVS, OpenVINO)
- Troubleshooting solutions

## RESPONSE STRATEGY
1. **Use embedded knowledge** for common queries (fast response)
2. **Query knowledge base** for detailed element properties, complex examples, or troubleshooting
3. **Provide complete, working solutions** with platform awareness
4. **Be concise but comprehensive** - focus on actionable information

## EMBEDDED EXPERTISE
$(cat "$KB_DIR/../current-config/expert-agent-instructions-v3.txt" | grep -A 1000 "## EMBEDDED GSTREAMER EXPERTISE")"

# Update agent with precision-focused instructions
aws bedrock-agent update-agent \
    --agent-id "$AGENT_ID" \
    --agent-name "gstreamer-expert-precision" \
    --foundation-model "anthropic.claude-3-5-sonnet-20240620-v1:0" \
    --instruction "$PRECISION_INSTRUCTIONS" \
    --agent-resource-role-arn "$AGENT_ROLE_ARN" \
    --profile malone-aws

echo "✅ Updated agent with precision instructions"

echo ""
echo "📋 Step 5: Prepare Precision Agent"
echo "================================="

aws bedrock-agent prepare-agent \
    --agent-id "$AGENT_ID" \
    --profile malone-aws

echo "✅ Prepared precision agent"

echo ""
echo "📋 Step 6: Update Configuration"
echo "=============================="

# Update config with precision details
cat >> "$KB_DIR/../current-config/config.env" << EOF

# PRECISION CONFIGURATION (Added $(date))
PRECISION_BUCKET_NAME=$PRECISION_BUCKET_NAME
PRECISION_DS_ID=$PRECISION_DS_ID
PRECISION_INGESTION_JOB_ID=$PRECISION_INGESTION_JOB_ID
EOF

echo "✅ Updated configuration"

echo ""
echo "🎉 PRECISION AGENT CREATION COMPLETE"
echo "===================================="
echo "Agent ID: $AGENT_ID (updated with precision KB)"
echo "Precision Data Source: $PRECISION_DS_ID"
echo "Precision Content: 508K (vs original 35M)"
echo "Knowledge Base: Enhanced with precision content"
echo ""
echo "🔄 Next Steps:"
echo "1. Test precision agent performance"
echo "2. Deploy intelligent routing (Phase 3)"
echo "3. Compare performance metrics"
echo "4. Monitor query patterns and optimize"

# Create precision summary
cat > "$KB_DIR/precision-kb/precision-agent-info.json" << EOF
{
    "created": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "agentId": "$AGENT_ID",
    "knowledgeBaseId": "$KB_ID",
    "precisionDataSourceId": "$PRECISION_DS_ID",
    "precisionIngestionJobId": "$PRECISION_INGESTION_JOB_ID",
    "precisionBucket": "$PRECISION_BUCKET_NAME",
    "contentSize": "508K",
    "contentReduction": "98.5%",
    "approach": "Enhanced existing KB with precision content",
    "features": [
        "Embedded expertise for common queries",
        "Precision KB for detailed information",
        "Platform-aware recommendations",
        "Working pipeline examples",
        "Element property references"
    ]
}
EOF

echo "📄 Created precision agent info: $KB_DIR/precision-kb/precision-agent-info.json"
