#!/bin/bash

# Create Bedrock Knowledge Base
set -e

source config.env

echo "Creating Bedrock Knowledge Base..."

# First, let's try creating with a different vector index name
VECTOR_INDEX_NAME="bedrock-knowledge-base-default-index"

# Create the knowledge base
KB_RESPONSE=$(aws bedrock-agent create-knowledge-base \
    --name "gstreamer-expert-kb" \
    --description "Comprehensive GStreamer, Kinesis Video Streams, OpenVINO, and NVIDIA documentation" \
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
            "vectorIndexName": "'$VECTOR_INDEX_NAME'",
            "fieldMapping": {
                "vectorField": "bedrock-knowledge-base-default-vector",
                "textField": "AMAZON_BEDROCK_TEXT_CHUNK",
                "metadataField": "AMAZON_BEDROCK_METADATA"
            }
        }
    }' \
    --profile malone-aws)

KB_ID=$(echo $KB_RESPONSE | jq -r '.knowledgeBase.knowledgeBaseId')
echo "Knowledge Base created with ID: $KB_ID"

# Wait for knowledge base to be active
echo "Waiting for knowledge base to be active..."
while true; do
    STATUS=$(aws bedrock-agent get-knowledge-base --knowledge-base-id $KB_ID --query 'knowledgeBase.status' --output text --profile malone-aws)
    if [ "$STATUS" = "ACTIVE" ]; then
        break
    fi
    echo "Knowledge base status: $STATUS. Waiting..."
    sleep 30
done

# Create data source for GStreamer documentation
echo "Creating data source..."
DS_RESPONSE=$(aws bedrock-agent create-data-source \
    --knowledge-base-id "$KB_ID" \
    --name "gstreamer-documentation" \
    --description "GStreamer comprehensive documentation and source examples" \
    --data-source-configuration '{
        "type": "S3",
        "s3Configuration": {
            "bucketArn": "arn:aws:s3:::'$BUCKET_NAME'",
            "inclusionPrefixes": ["docs/", "repos/"]
        }
    }' \
    --profile malone-aws)

DS_ID=$(echo $DS_RESPONSE | jq -r '.dataSource.dataSourceId')
echo "Data source created with ID: $DS_ID"

# Start ingestion job
echo "Starting ingestion job..."
INGESTION_RESPONSE=$(aws bedrock-agent start-ingestion-job \
    --knowledge-base-id "$KB_ID" \
    --data-source-id "$DS_ID" \
    --profile malone-aws)

INGESTION_JOB_ID=$(echo $INGESTION_RESPONSE | jq -r '.ingestionJob.ingestionJobId')
echo "Ingestion job started with ID: $INGESTION_JOB_ID"

# Save knowledge base info
echo "KB_ID=$KB_ID" >> config.env
echo "DS_ID=$DS_ID" >> config.env
echo "INGESTION_JOB_ID=$INGESTION_JOB_ID" >> config.env

echo "Knowledge base setup complete!"
echo "Monitor ingestion progress with: aws bedrock-agent get-ingestion-job --knowledge-base-id $KB_ID --data-source-id $DS_ID --ingestion-job-id $INGESTION_JOB_ID --profile malone-aws"
