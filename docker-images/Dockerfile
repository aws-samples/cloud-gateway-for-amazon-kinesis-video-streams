# Build docker with
# docker build -t kvs-dlstreamer:v1 .
#
FROM intel/dlstreamer:2025.1.2-ubuntu24

USER root
ENV DEBIAN_FRONTEND=noninteractive

#apt-get install tzdata noninteractive. Without the next line, one will be prompted during build to select timezone.
RUN apt-get update && apt-get install -y --no-install-recommends tzdata

RUN apt-get install -y --no-install-recommends \
        git \
        cmake \
        pkgconf \
        m4 \
        libssl-dev \
        libcurl4-openssl-dev \
        liblog4cplus-dev \
        libgstreamer1.0-dev \
        libgstreamer-plugins-base1.0-dev \
        gstreamer1.0-plugins-base-apps \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-ugly \
        gstreamer1.0-tools \
        build-essential \
        && rm -rf /var/lib/apt/lists/*

ENV KVS_SDK_VERSION=v3.5.0

WORKDIR /opt/
RUN git clone --single-branch --branch $KVS_SDK_VERSION https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
WORKDIR /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/

RUN cmake .. -DBUILD_GSTREAMER_PLUGIN=ON -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON -DBUILD_DEPENDENCIES=FALSE && \
    make

ENV LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib:/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/dependency/libkvscproducer/kvscproducer-src/:$LD_LIBRARY_PATH
ENV GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/:$GST_PLUGIN_PATH

# Run gst-inspect in non-interactive mode
RUN gst-inspect-1.0 kvssink || true