# Build docker with
# docker build -t kinesis-video-producer-sdk-cpp-amazon-linux .
#
ARG BUILDPLATFORM="linux/amd64"
FROM --platform=${BUILDPLATFORM} ubuntu:22.04
#apt-get install tzdata noninteractive. Without the next line, one will be prompted during build to select timezone.
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata
RUN apt-get install -y \
        libssl-dev \
        git \
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
        autoconf \
        automake  \
        bison \
        bzip2 \
        cmake \
        curl \
        diffutils \
        flex \
        jq \
        make

ENV KVS_SDK_VERSION v3.2.0

WORKDIR /opt/
RUN git clone --depth 1 --branch $KVS_SDK_VERSION https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
WORKDIR /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/

#changed cmake3 to cmake
RUN cmake .. -DBUILD_GSTREAMER_PLUGIN=ON -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON -DBUILD_DEPENDENCIES=FALSE && \
    make

ENV LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
ENV GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/:$GST_PLUGIN_PATH


#Make directories and copy script files. Note: We don’t use systemctl due to it being a container.

RUN mkdir -p /home/ubuntu/
COPY stream-rtsp-to-kvs.sh   /home/ubuntu/stream-rtsp-to-kvs.sh

RUN chmod a+x /home/ubuntu/stream-rtsp-to-kvs.sh

CMD ["/bin/bash", "-c", "source /home/ubuntu/stream-rtsp-to-kvs.sh"]