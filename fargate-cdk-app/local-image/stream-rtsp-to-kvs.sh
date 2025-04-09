#!/bin/bash

# Check if ECS container credentials are available (Fargate/ECS specific endpoint)
# ECS containers have a special endpoint for credentials
# https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-metadata-endpoint-v4.html
# https://docs.aws.amazon.com/sdkref/latest/guide/feature-container-credentials.html
TASK_ROLE_NAME=${TASK_ROLE_NAME:-kvsCloudGatewayInstanceRole}

# Let's check if we already have credentials -- this allows for testing the container locally with docker run
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  # If we don't have local creds, let's check if we are inside an ECS container
  if [ -n "$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI" ]; then
    echo "Using ECS task IAM role credentials endpoint"
    PAYLOAD=`curl --connect-timeout 2 --max-time 5 -s "http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"`
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
    echo "ERROR: Empty response from metadata service when trying to retrieve credentials."
    exit 1
  else
    # Extract credentials
    AWS_ACCESS_KEY_ID_TMP=`echo $PAYLOAD | jq -r .AccessKeyId 2>&1`
    AWS_SECRET_ACCESS_KEY_TMP=`echo $PAYLOAD | jq -r .SecretAccessKey 2>&1`
    AWS_SESSION_TOKEN_TMP=`echo $PAYLOAD | jq -r .Token 2>&1`
    
    # Check for parse errors
    if [[ "$AWS_ACCESS_KEY_ID_TMP" == *"parse error"* || "$AWS_SECRET_ACCESS_KEY_TMP" == *"parse error"* || "$AWS_SESSION_TOKEN_TMP" == *"parse error"* ]]; then
      echo "ERROR: JSON parsing failed. Full payload omitted for security reasons:"
      echo "${PAYLOAD:0:50}"
      
      exit 1
    fi
    
    export AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID_TMP"
    export AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY_TMP"
    export AWS_SESSION_TOKEN="$AWS_SESSION_TOKEN_TMP"

    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ] && [ -n "$AWS_SESSION_TOKEN" ]; then
      echo "Credentials retrieved successfully"
    else
      echo "Failed to retrieve all required credentials from metadata service"
      exit 1
    fi
  fi
fi

export LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/

export AWS_DEFAULT_REGION=us-east-1 

STREAM_NAME=${STREAM_NAME-CloudGatewayStream}
RTSP_URL=${RTSP_URL-rtsp://kvsedge:stream1234@your-ip-cam:554/}
echo "Using stream name: $STREAM_NAME | RTSP URL $RTSP_URL"
 
# below pipeline is specific to h264 encoded media, and does not process audio
gst-launch-1.0 -v rtspsrc location=$RTSP_URL short-header=TRUE \
    ! rtph264depay \
    ! h264parse \
    ! kvssink stream-name=$STREAM_NAME storage-size=128