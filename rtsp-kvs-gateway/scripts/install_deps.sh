#!/bin/bash

# RTSP KVS Gateway C++ - Dependency Installation Script
# This script installs all required dependencies for the modern C++ application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Detect OS and architecture
detect_system() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/debian_version ]; then
            OS="debian"
            DISTRO=$(lsb_release -si 2>/dev/null || echo "Unknown")
        elif [ -f /etc/redhat-release ]; then
            OS="redhat"
            DISTRO=$(cat /etc/redhat-release | cut -d' ' -f1)
        else
            OS="linux"
            DISTRO="Unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        DISTRO="macOS $(sw_vers -productVersion)"
    else
        log_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
    
    ARCH=$(uname -m)
    log_info "Detected system: $DISTRO ($OS) on $ARCH"
}

# Check if running as root (not recommended)
check_root() {
    if [ "$EUID" -eq 0 ]; then
        log_warn "Running as root is not recommended for development"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Install system dependencies
install_system_deps() {
    log_info "Installing system dependencies..."
    
    case $OS in
        "debian")
            sudo apt-get update
            sudo apt-get install -y \
                build-essential \
                cmake \
                pkg-config \
                git \
                curl \
                wget \
                ca-certificates \
                gnupg \
                lsb-release \
                software-properties-common \
                libgstreamer1.0-dev \
                libgstreamer-plugins-base1.0-dev \
                libgstreamer-plugins-good1.0-dev \
                libgstreamer-plugins-bad1.0-dev \
                gstreamer1.0-plugins-ugly \
                gstreamer1.0-libav \
                gstreamer1.0-tools \
                gstreamer1.0-rtsp \
                libmosquitto-dev \
                libmosquittopp-dev \
                libssl-dev \
                libcurl4-openssl-dev \
                liblog4cplus-dev \
                libjson-c-dev \
                libgtest-dev \
                libgmock-dev \
                libbenchmark-dev \
                default-jdk \
                python3-dev \
                python3-pip \
                ninja-build \
                ccache
            
            # Install modern GCC if needed
            GCC_VERSION=$(gcc -dumpversion | cut -d. -f1)
            if [ "$GCC_VERSION" -lt 8 ]; then
                log_info "Installing modern GCC..."
                sudo apt-get install -y gcc-9 g++-9
                sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-9 90
                sudo update-alternatives --install /usr/bin/g++ g++ /usr/bin/g++-9 90
            fi
            ;;
            
        "redhat")
            # Enable EPEL repository
            sudo yum install -y epel-release
            sudo yum groupinstall -y "Development Tools"
            sudo yum install -y \
                cmake3 \
                pkgconfig \
                git \
                curl \
                wget \
                ca-certificates \
                gstreamer1-devel \
                gstreamer1-plugins-base-devel \
                gstreamer1-plugins-good \
                gstreamer1-plugins-bad-free \
                gstreamer1-plugins-ugly-free \
                gstreamer1-rtsp \
                mosquitto-devel \
                openssl-devel \
                libcurl-devel \
                log4cplus-devel \
                json-c-devel \
                gtest-devel \
                gmock-devel \
                java-11-openjdk-devel \
                python3-devel \
                python3-pip \
                ninja-build \
                ccache
            
            # Create cmake symlink if needed
            if [ ! -f /usr/bin/cmake ]; then
                sudo ln -s /usr/bin/cmake3 /usr/bin/cmake
            fi
            ;;
            
        "macos")
            # Check if Homebrew is installed
            if ! command -v brew &> /dev/null; then
                log_error "Homebrew is required but not installed."
                log_info "Install Homebrew from: https://brew.sh"
                exit 1
            fi
            
            # Update Homebrew
            brew update
            
            # Install dependencies
            brew install \
                cmake \
                pkg-config \
                git \
                curl \
                wget \
                gstreamer \
                gst-plugins-base \
                gst-plugins-good \
                gst-plugins-bad \
                gst-plugins-ugly \
                gst-libav \
                gst-rtsp-server \
                mosquitto \
                openssl \
                log4cplus \
                json-c \
                googletest \
                google-benchmark \
                openjdk@11 \
                python@3.11 \
                ninja \
                ccache \
                llvm
            
            # Set up environment for OpenSSL
            echo 'export PATH="/opt/homebrew/opt/openssl@3/bin:$PATH"' >> ~/.zshrc
            echo 'export LDFLAGS="-L/opt/homebrew/opt/openssl@3/lib"' >> ~/.zshrc
            echo 'export CPPFLAGS="-I/opt/homebrew/opt/openssl@3/include"' >> ~/.zshrc
            ;;
    esac
    
    log_info "System dependencies installed successfully"
}

# Install modern C++ libraries
install_cpp_libs() {
    log_info "Installing modern C++ libraries..."
    
    # Create third_party directory
    mkdir -p ../third_party
    cd ../third_party
    
    # Install nlohmann/json (header-only)
    if [ ! -d "json" ]; then
        log_info "Installing nlohmann/json..."
        git clone --depth 1 --branch v3.11.2 https://github.com/nlohmann/json.git
    fi
    
    # Install spdlog
    if [ ! -d "spdlog" ]; then
        log_info "Installing spdlog..."
        git clone --depth 1 --branch v1.12.0 https://github.com/gabime/spdlog.git
        cd spdlog
        mkdir -p build && cd build
        cmake -DCMAKE_BUILD_TYPE=Release -DSPDLOG_BUILD_SHARED=ON ..
        make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
        sudo make install
        cd ../..
    fi
    
    # Install fmt (dependency of spdlog)
    if [ ! -d "fmt" ]; then
        log_info "Installing fmt..."
        git clone --depth 1 --branch 9.1.0 https://github.com/fmtlib/fmt.git
        cd fmt
        mkdir -p build && cd build
        cmake -DCMAKE_BUILD_TYPE=Release -DFMT_DOC=OFF -DFMT_TEST=OFF ..
        make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
        sudo make install
        cd ../..
    fi
    
    cd ..
    log_info "Modern C++ libraries installed successfully"
}

# Install AWS SDK C++
install_aws_sdk() {
    log_info "Installing AWS SDK C++..."
    
    cd ../third_party
    
    # Clone AWS SDK C++
    if [ ! -d "aws-sdk-cpp" ]; then
        log_info "Cloning AWS SDK C++..."
        git clone --recurse-submodules --depth 1 --branch 1.11.0 https://github.com/aws/aws-sdk-cpp.git
    else
        log_info "AWS SDK already cloned, updating..."
        cd aws-sdk-cpp
        git pull
        git submodule update --init --recursive
        cd ..
    fi
    
    # Build AWS SDK C++
    cd aws-sdk-cpp
    mkdir -p build
    cd build
    
    log_info "Configuring AWS SDK C++ (this may take a while)..."
    cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_ONLY="core;kinesisvideo;kinesis-video-webrtc-storage" \
        -DENABLE_TESTING=OFF \
        -DBUILD_SHARED_LIBS=ON \
        -DCMAKE_INSTALL_PREFIX=/usr/local \
        -DUSE_OPENSSL=ON
    
    log_info "Building AWS SDK C++ (this will take several minutes)..."
    make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
    
    # Install if requested
    if [ "$1" = "--install-sdk" ]; then
        log_info "Installing AWS SDK C++ system-wide..."
        sudo make install
        sudo ldconfig 2>/dev/null || true
    fi
    
    cd ../../..
    log_info "AWS SDK C++ build completed"
}

# Install Kinesis Video Streams Producer SDK
install_kvs_producer_sdk() {
    log_info "Installing Kinesis Video Streams Producer SDK..."
    
    cd ../third_party
    
    # Clone KVS Producer SDK
    if [ ! -d "amazon-kinesis-video-streams-producer-sdk-cpp" ]; then
        log_info "Cloning KVS Producer SDK..."
        git clone --recursive https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
    else
        log_info "KVS Producer SDK already cloned, updating..."
        cd amazon-kinesis-video-streams-producer-sdk-cpp
        git pull
        git submodule update --init --recursive
        cd ..
    fi
    
    # Build KVS Producer SDK
    cd amazon-kinesis-video-streams-producer-sdk-cpp
    mkdir -p build
    cd build
    
    log_info "Building KVS Producer SDK with GStreamer plugin..."
    cmake .. \
        -DCMAKE_BUILD_TYPE=Release \
        -DBUILD_GSTREAMER_PLUGIN=ON \
        -DBUILD_JNI=OFF \
        -DBUILD_DEPENDENCIES=OFF \
        -DUSE_OPENSSL=ON \
        -DUSE_MBEDTLS=OFF
    
    make -j$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
    
    # Install if requested
    if [ "$1" = "--install-sdk" ]; then
        log_info "Installing KVS Producer SDK system-wide..."
        sudo make install
        sudo ldconfig 2>/dev/null || true
        
        # Copy GStreamer plugin
        GST_PLUGIN_DIR=$(pkg-config --variable=pluginsdir gstreamer-1.0)
        if [ -n "$GST_PLUGIN_DIR" ]; then
            sudo cp libgstkvssink.so "$GST_PLUGIN_DIR/"
            log_info "GStreamer KVS plugin installed to $GST_PLUGIN_DIR"
        fi
    fi
    
    cd ../../..
    log_info "KVS Producer SDK build completed"
}

# Install computer vision dependencies
install_cv_deps() {
    local cv_framework=$1
    
    case $cv_framework in
        "opencv")
            log_info "Installing OpenCV 4.x..."
            case $OS in
                "debian")
                    sudo apt-get install -y \
                        libopencv-dev \
                        libopencv-contrib-dev \
                        python3-opencv
                    ;;
                "redhat")
                    sudo yum install -y opencv-devel opencv-contrib-devel
                    ;;
                "macos")
                    brew install opencv
                    ;;
            esac
            
            # Verify OpenCV installation
            if pkg-config --exists opencv4; then
                OPENCV_VERSION=$(pkg-config --modversion opencv4)
                log_info "OpenCV $OPENCV_VERSION installed successfully"
            else
                log_warn "OpenCV installation verification failed"
            fi
            ;;
            
        "tensorflow-lite")
            log_info "Installing TensorFlow Lite C++..."
            cd ../third_party
            
            if [ ! -d "tensorflow" ]; then
                git clone --depth 1 --branch v2.13.0 https://github.com/tensorflow/tensorflow.git
            fi
            
            cd tensorflow
            
            # Install Bazel (required for TensorFlow build)
            case $OS in
                "debian")
                    curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor > bazel.gpg
                    sudo mv bazel.gpg /etc/apt/trusted.gpg.d/
                    echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk1.8" | sudo tee /etc/apt/sources.list.d/bazel.list
                    sudo apt-get update && sudo apt-get install -y bazel
                    ;;
                "macos")
                    brew install bazel
                    ;;
            esac
            
            # Build TensorFlow Lite C++ library
            bazel build -c opt //tensorflow/lite:libtensorflowlite.so
            bazel build -c opt //tensorflow/lite/c:libtensorflowlite_c.so
            
            cd ../..
            ;;
            
        "onnx")
            log_info "Installing ONNX Runtime..."
            cd ../third_party
            
            # Download pre-built ONNX Runtime
            ONNX_VERSION="1.15.1"
            case $OS in
                "linux")
                    if [ "$ARCH" = "x86_64" ]; then
                        wget -q https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/onnxruntime-linux-x64-${ONNX_VERSION}.tgz
                        tar -xzf onnxruntime-linux-x64-${ONNX_VERSION}.tgz
                        mv onnxruntime-linux-x64-${ONNX_VERSION} onnxruntime
                    else
                        log_error "ONNX Runtime pre-built binaries not available for $ARCH"
                        return 1
                    fi
                    ;;
                "macos")
                    if [ "$ARCH" = "x86_64" ]; then
                        wget -q https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/onnxruntime-osx-x86_64-${ONNX_VERSION}.tgz
                        tar -xzf onnxruntime-osx-x86_64-${ONNX_VERSION}.tgz
                        mv onnxruntime-osx-x86_64-${ONNX_VERSION} onnxruntime
                    elif [ "$ARCH" = "arm64" ]; then
                        wget -q https://github.com/microsoft/onnxruntime/releases/download/v${ONNX_VERSION}/onnxruntime-osx-arm64-${ONNX_VERSION}.tgz
                        tar -xzf onnxruntime-osx-arm64-${ONNX_VERSION}.tgz
                        mv onnxruntime-osx-arm64-${ONNX_VERSION} onnxruntime
                    fi
                    ;;
            esac
            
            cd ..
            log_info "ONNX Runtime installed successfully"
            ;;
            
        "openvino")
            log_info "Installing Intel OpenVINO..."
            case $OS in
                "debian"|"redhat")
                    # Download OpenVINO
                    OPENVINO_VERSION="2023.0.1"
                    wget -q https://storage.openvinotoolkit.org/repositories/openvino/packages/2023.0/linux/l_openvino_toolkit_ubuntu20_${OPENVINO_VERSION}.11005.fa1c41994f3_x86_64.tgz
                    tar -xzf l_openvino_toolkit_ubuntu20_${OPENVINO_VERSION}.11005.fa1c41994f3_x86_64.tgz
                    
                    # Install OpenVINO
                    cd l_openvino_toolkit_ubuntu20_${OPENVINO_VERSION}.11005.fa1c41994f3_x86_64
                    sudo ./install_dependencies/install_openvino_dependencies.sh
                    
                    log_info "OpenVINO installed. Please source the environment:"
                    log_info "source /opt/intel/openvino_2023/setupvars.sh"
                    ;;
                "macos")
                    log_warn "OpenVINO installation on macOS requires manual setup"
                    log_info "Please visit: https://docs.openvino.ai/latest/openvino_docs_install_guides_installing_openvino_macos.html"
                    ;;
            esac
            ;;
            
        *)
            log_info "Using custom GStreamer elements for computer vision"
            ;;
    esac
}

# Verify installation
verify_installation() {
    log_info "Verifying installation..."
    
    local errors=0
    
    # Check C++ compiler
    if ! command -v g++ &> /dev/null; then
        log_error "C++ compiler not found"
        ((errors++))
    else
        CXX_VERSION=$(g++ --version | head -n1)
        log_info "C++ compiler: $CXX_VERSION"
    fi
    
    # Check CMake
    if ! command -v cmake &> /dev/null; then
        log_error "CMake not found"
        ((errors++))
    else
        CMAKE_VERSION=$(cmake --version | head -n1)
        log_info "CMake: $CMAKE_VERSION"
    fi
    
    # Check GStreamer
    if ! pkg-config --exists gstreamer-1.0; then
        log_error "GStreamer not found"
        ((errors++))
    else
        GST_VERSION=$(pkg-config --modversion gstreamer-1.0)
        log_info "GStreamer: $GST_VERSION"
    fi
    
    # Check MQTT library
    if ! pkg-config --exists libmosquittopp; then
        if ! pkg-config --exists libmosquitto; then
            log_error "Mosquitto library not found"
            ((errors++))
        else
            log_info "Mosquitto C library found"
        fi
    else
        log_info "Mosquitto C++ library found"
    fi
    
    # Check for modern C++ libraries
    if [ -d "../third_party/json" ]; then
        log_info "nlohmann/json: Available"
    else
        log_warn "nlohmann/json not found in third_party"
    fi
    
    if [ -d "../third_party/spdlog" ]; then
        log_info "spdlog: Available"
    else
        log_warn "spdlog not found in third_party"
    fi
    
    if [ $errors -eq 0 ]; then
        log_info "All core dependencies verified successfully"
        return 0
    else
        log_error "$errors critical dependencies missing"
        return 1
    fi
}

# Download sample models
download_sample_models() {
    log_info "Downloading sample computer vision models..."
    
    mkdir -p ../models
    cd ../models
    
    # Download YOLOv5s ONNX model
    if [ ! -f "yolov5s.onnx" ]; then
        log_info "Downloading YOLOv5s model..."
        wget -q https://github.com/ultralytics/yolov5/releases/download/v7.0/yolov5s.onnx
    fi
    
    # Download COCO class names
    if [ ! -f "coco.names" ]; then
        log_info "Downloading COCO class names..."
        wget -q https://raw.githubusercontent.com/pjreddie/darknet/master/data/coco.names
    fi
    
    cd ..
    log_info "Sample models downloaded"
}

# Main installation function
main() {
    log_info "Starting dependency installation for RTSP KVS Gateway C++"
    
    # Parse command line arguments
    CV_FRAMEWORK="opencv"
    INSTALL_SDK=false
    DOWNLOAD_MODELS=false
    SKIP_SYSTEM=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --cv-framework)
                CV_FRAMEWORK="$2"
                shift 2
                ;;
            --install-sdk)
                INSTALL_SDK=true
                shift
                ;;
            --download-models)
                DOWNLOAD_MODELS=true
                shift
                ;;
            --skip-system)
                SKIP_SYSTEM=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --cv-framework FRAMEWORK  Computer vision framework (opencv, tensorflow-lite, onnx, openvino, custom)"
                echo "  --install-sdk             Install AWS SDK system-wide"
                echo "  --download-models         Download sample CV models"
                echo "  --skip-system             Skip system package installation"
                echo "  --help                    Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # System detection and checks
    detect_system
    check_root
    
    # Installation steps
    if [ "$SKIP_SYSTEM" = false ]; then
        install_system_deps
    fi
    
    install_cpp_libs
    
    if [ "$INSTALL_SDK" = true ]; then
        install_aws_sdk --install-sdk
        install_kvs_producer_sdk --install-sdk
    else
        install_aws_sdk
        install_kvs_producer_sdk
    fi
    
    if [ "$CV_FRAMEWORK" != "custom" ]; then
        install_cv_deps "$CV_FRAMEWORK"
    fi
    
    if [ "$DOWNLOAD_MODELS" = true ]; then
        download_sample_models
    fi
    
    # Verification
    if verify_installation; then
        log_info "Dependency installation completed successfully!"
        echo ""
        log_info "Next steps:"
        log_info "1. Build the application:"
        log_info "   mkdir build && cd build"
        log_info "   cmake -DCMAKE_BUILD_TYPE=Release -DUSE_${CV_FRAMEWORK^^}=ON .."
        log_info "   make -j\$(nproc)"
        echo ""
        log_info "2. Configure AWS credentials:"
        log_info "   export AWS_ACCESS_KEY_ID=your_access_key"
        log_info "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
        log_info "   export AWS_DEFAULT_REGION=us-east-1"
        echo ""
        log_info "3. Run the application:"
        log_info "   ./rtsp-kvs-gateway --config ../config/default_config.json"
    else
        log_error "Installation completed with errors. Please check the output above."
        exit 1
    fi
}

# Run main function
main "$@"
