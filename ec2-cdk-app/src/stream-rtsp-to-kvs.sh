#!/bin/bash

TOKEN=`curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600"`
PAYLOAD=`curl -s -H "X-aws-ec2-metadata-token: $TOKEN" curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/kvsCloudGatewayInstanceRole`

export AWS_ACCESS_KEY_ID=`echo $PAYLOAD | jq -r .AccessKeyId`
export AWS_SECRET_ACCESS_KEY=`echo $PAYLOAD | jq -r .SecretAccessKey`
export AWS_SESSION_TOKEN=`echo $PAYLOAD | jq -r .Token`

export LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/

export AWS_DEFAULT_REGION=us-east-1 

STREAM_NAME=CloudGatewayStream
RTSP_URL="rtsp://username:password@your-camera-ip:554/stream"
 
# below pipeline is specific to h264 encoded media, and does not process audio
gst-launch-1.0 -v rtspsrc location=$RTSP_URL short-header=TRUE \
    ! rtph264depay \
    ! h264parse \
    ! kvssink stream-name=$STREAM_NAME storage-size=128