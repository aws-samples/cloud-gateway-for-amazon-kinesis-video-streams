#!/bin/bash -xe

# Update with optional user data that will run on instance start.
# Learn more about user-data: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html


KVS_SDK_VERSION=v3.2.0
cd /opt/
sudo git clone --depth 1 --branch $KVS_SDK_VERSION https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
sudo mkdir -p /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
cd /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
sudo cmake .. -DBUILD_GSTREAMER_PLUGIN=ON -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON -DBUILD_DEPENDENCIES=FALSE
sudo make