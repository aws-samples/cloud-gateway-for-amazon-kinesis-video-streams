#!/bin/bash

# Check if ECS container credentials are available (Fargate/ECS specific endpoint)
# ECS containers have a special endpoint for credentials
# https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v4.html
# https://docs.aws.amazon.com/sdkref/latest/guide/feature-container-credentials.html
TASK_ROLE_NAME=${TASK_ROLE_NAME:-kvsCloudGatewayInstanceRole}
ECS_CONTAINER_METADATA_URI_V4=${ECS_CONTAINER_METADATA_URI_V4:-"http://169.254.170.2"}

if [ -n "$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI" ]; then
  echo "Using ECS task IAM role credentials endpoint"
  PAYLOAD=`curl --connect-timeout 2 --max-time 5 -s "${ECS_CONTAINER_METADATA_URI_V4}${AWS_CONTAINER_CREDENTIALS_RELATIVE_URI}"`
else
  echo "Requesting IMDSv2 token..."
  TOKEN=`curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`

  if [ -z "$TOKEN" ]; then
    echo "ERROR: Failed to obtain IMDSv2 token (empty response)"
    exit 1
  else
    echo "Token received (first 5 chars): ${TOKEN:0:5}..."
  fi

  echo "Requesting credentials for role $TASK_ROLE_NAME..."  
  PAYLOAD=`curl -s -H "X-aws-ec2-metadata-token: $TOKEN" curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/$TASK_ROLE_NAME`
fi

if [ -z "$PAYLOAD" ]; then
  echo "ERROR: Empty response from metadata service"
    
  # Show available roles for troubleshooting
  echo "Checking available roles..."
  AVAILABLE_ROLES=`curl --connect-timeout 2 --max-time 5 -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/`
  echo "Available roles: $AVAILABLE_ROLES"
  
  echo "All credential retrieval methods failed. Attempting to proceed with AWS SDK default credential provider chain."
  echo "Setting AWS_SDK_LOAD_CONFIG=1 to ensure SDK checks all credential sources"
  export AWS_SDK_LOAD_CONFIG=1
  
  # Set default region if not already set
  export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-"us-east-1"}
  echo "Using AWS region: $AWS_DEFAULT_REGION"
  
  # Continue execution and let the AWS SDK handle credentials
  echo "Proceeding with AWS SDK credential provider chain"
fi
  
export AWS_ACCESS_KEY_ID=`echo $PAYLOAD | jq -r .AccessKeyId`
export AWS_SECRET_ACCESS_KEY=`echo $PAYLOAD | jq -r .SecretAccessKey`
export AWS_SESSION_TOKEN=`echo $PAYLOAD | jq -r .Token`

export LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/

export AWS_DEFAULT_REGION=us-east-1 

STREAM_NAME=CloudGatewayStream
RTSP_URL="rtsp://kvsedge:stream1234@your-ip-cam:554/"
 
# below pipeline is specific to h264 encoded media, and does not process audio
gst-launch-1.0 -v rtspsrc location=$RTSP_URL short-header=TRUE \
    ! rtph264depay \
    ! h264parse \
    ! kvssink stream-name=$STREAM_NAME storage-size=128