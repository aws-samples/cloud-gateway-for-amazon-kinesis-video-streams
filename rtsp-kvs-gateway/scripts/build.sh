#!/bin/bash

# RTSP KVS Gateway C++ - Build Script
# Modern C++ build script with advanced options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
BUILD_TYPE="Release"
CV_FRAMEWORK="opencv"
CLEAN_BUILD=false
INSTALL=false
VERBOSE=false
PARALLEL_JOBS=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 4)
ENABLE_TESTING=false
ENABLE_BENCHMARKING=false
ENABLE_COVERAGE=false
ENABLE_SANITIZERS=false
ENABLE_PROMETHEUS=false
USE_CCACHE=true
USE_NINJA=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --build-type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        --cv-framework)
            CV_FRAMEWORK="$2"
            shift 2
            ;;
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --install)
            INSTALL=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --jobs|-j)
            PARALLEL_JOBS="$2"
            shift 2
            ;;
        --enable-testing)
            ENABLE_TESTING=true
            shift
            ;;
        --enable-benchmarking)
            ENABLE_BENCHMARKING=true
            shift
            ;;
        --enable-coverage)
            ENABLE_COVERAGE=true
            BUILD_TYPE="Debug"  # Coverage requires debug build
            shift
            ;;
        --enable-sanitizers)
            ENABLE_SANITIZERS=true
            BUILD_TYPE="Debug"  # Sanitizers work best with debug build
            shift
            ;;
        --enable-prometheus)
            ENABLE_PROMETHEUS=true
            shift
            ;;
        --no-ccache)
            USE_CCACHE=false
            shift
            ;;
        --ninja)
            USE_NINJA=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Build Options:"
            echo "  --build-type TYPE         Build type (Debug, Release, RelWithDebInfo, MinSizeRel)"
            echo "  --cv-framework FRAMEWORK  Computer vision framework (opencv, tensorflow-lite, onnx, openvino, custom)"
            echo "  --clean                   Clean build directory before building"
            echo "  --install                 Install after building"
            echo "  --verbose                 Verbose build output"
            echo "  --jobs, -j N              Number of parallel build jobs (default: auto-detect)"
            echo ""
            echo "Feature Options:"
            echo "  --enable-testing          Enable unit testing with Google Test"
            echo "  --enable-benchmarking     Enable performance benchmarking"
            echo "  --enable-coverage         Enable code coverage (implies Debug build)"
            echo "  --enable-sanitizers       Enable runtime sanitizers (implies Debug build)"
            echo "  --enable-prometheus       Enable Prometheus metrics"
            echo ""
            echo "Advanced Options:"
            echo "  --no-ccache               Disable ccache compilation cache"
            echo "  --ninja                   Use Ninja build system instead of Make"
            echo "  --help                    Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Basic release build with OpenCV"
            echo "  $0 --cv-framework onnx --clean       # Clean build with ONNX Runtime"
            echo "  $0 --build-type Debug --enable-testing --enable-coverage"
            echo "  $0 --ninja --jobs 8 --verbose        # Fast build with Ninja"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate build type
case $BUILD_TYPE in
    Debug|Release|RelWithDebInfo|MinSizeRel)
        ;;
    *)
        log_error "Invalid build type: $BUILD_TYPE"
        log_error "Valid options: Debug, Release, RelWithDebInfo, MinSizeRel"
        exit 1
        ;;
esac

# Validate CV framework
case $CV_FRAMEWORK in
    opencv|tensorflow-lite|onnx|openvino|custom)
        ;;
    *)
        log_error "Invalid CV framework: $CV_FRAMEWORK"
        log_error "Valid options: opencv, tensorflow-lite, onnx, openvino, custom"
        exit 1
        ;;
esac

log_info "Building RTSP KVS Gateway C++"
log_info "Project Root: $PROJECT_ROOT"
log_info "Build Type: $BUILD_TYPE"
log_info "CV Framework: $CV_FRAMEWORK"
log_info "Parallel Jobs: $PARALLEL_JOBS"

# Check for required tools
check_dependencies() {
    local missing_deps=()
    
    if ! command -v cmake &> /dev/null; then
        missing_deps+=("cmake")
    fi
    
    if ! command -v g++ &> /dev/null && ! command -v clang++ &> /dev/null; then
        missing_deps+=("g++ or clang++")
    fi
    
    if ! pkg-config --exists gstreamer-1.0; then
        missing_deps+=("gstreamer-1.0")
    fi
    
    if [ "$USE_NINJA" = true ] && ! command -v ninja &> /dev/null; then
        missing_deps+=("ninja")
    fi
    
    if [ "$USE_CCACHE" = true ] && ! command -v ccache &> /dev/null; then
        log_warn "ccache not found, disabling compilation cache"
        USE_CCACHE=false
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_error "Please run: ./scripts/install_deps.sh"
        exit 1
    fi
}

# Setup build environment
setup_build_env() {
    # Setup ccache if available
    if [ "$USE_CCACHE" = true ]; then
        export CC="ccache gcc"
        export CXX="ccache g++"
        log_info "Using ccache for compilation caching"
    fi
    
    # Setup build directory
    BUILD_DIR="$PROJECT_ROOT/build"
    if [ "$CLEAN_BUILD" = true ]; then
        log_info "Cleaning build directory..."
        rm -rf "$BUILD_DIR"
    fi
    
    mkdir -p "$BUILD_DIR"
    cd "$BUILD_DIR"
}

# Configure CMake
configure_cmake() {
    log_info "Configuring with CMake..."
    
    # Base CMake arguments
    CMAKE_ARGS=(
        "-DCMAKE_BUILD_TYPE=$BUILD_TYPE"
        "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
    )
    
    # Generator selection
    if [ "$USE_NINJA" = true ]; then
        CMAKE_ARGS+=("-GNinja")
        log_info "Using Ninja build system"
    else
        log_info "Using Make build system"
    fi
    
    # Computer Vision framework selection
    case $CV_FRAMEWORK in
        opencv)
            CMAKE_ARGS+=("-DUSE_OPENCV=ON")
            ;;
        tensorflow-lite)
            CMAKE_ARGS+=("-DUSE_TENSORFLOW_LITE=ON")
            ;;
        onnx)
            CMAKE_ARGS+=("-DUSE_ONNX_RUNTIME=ON")
            ;;
        openvino)
            CMAKE_ARGS+=("-DUSE_OPENVINO=ON")
            ;;
        custom)
            CMAKE_ARGS+=("-DUSE_CUSTOM_CV=ON")
            ;;
    esac
    
    # Feature flags
    if [ "$ENABLE_TESTING" = true ]; then
        CMAKE_ARGS+=("-DENABLE_TESTING=ON")
    fi
    
    if [ "$ENABLE_BENCHMARKING" = true ]; then
        CMAKE_ARGS+=("-DENABLE_BENCHMARKING=ON")
    fi
    
    if [ "$ENABLE_COVERAGE" = true ]; then
        CMAKE_ARGS+=("-DENABLE_COVERAGE=ON")
    fi
    
    if [ "$ENABLE_SANITIZERS" = true ]; then
        CMAKE_ARGS+=("-DENABLE_SANITIZERS=ON")
    fi
    
    if [ "$ENABLE_PROMETHEUS" = true ]; then
        CMAKE_ARGS+=("-DENABLE_PROMETHEUS=ON")
    fi
    
    # Run CMake configuration
    log_debug "CMake command: cmake ${CMAKE_ARGS[*]} $PROJECT_ROOT"
    cmake "${CMAKE_ARGS[@]}" "$PROJECT_ROOT"
}

# Build the project
build_project() {
    log_info "Building project..."
    
    if [ "$USE_NINJA" = true ]; then
        if [ "$VERBOSE" = true ]; then
            ninja -v
        else
            ninja -j "$PARALLEL_JOBS"
        fi
    else
        if [ "$VERBOSE" = true ]; then
            make VERBOSE=1 -j "$PARALLEL_JOBS"
        else
            make -j "$PARALLEL_JOBS"
        fi
    fi
}

# Run tests if enabled
run_tests() {
    if [ "$ENABLE_TESTING" = true ]; then
        log_info "Running tests..."
        if command -v ctest &> /dev/null; then
            ctest --output-on-failure --parallel "$PARALLEL_JOBS"
        else
            log_warn "ctest not found, skipping tests"
        fi
    fi
}

# Generate coverage report if enabled
generate_coverage() {
    if [ "$ENABLE_COVERAGE" = true ]; then
        log_info "Generating coverage report..."
        if [ "$USE_NINJA" = true ]; then
            ninja coverage
        else
            make coverage
        fi
    fi
}

# Install if requested
install_project() {
    if [ "$INSTALL" = true ]; then
        log_info "Installing project..."
        if [ "$USE_NINJA" = true ]; then
            sudo ninja install
        else
            sudo make install
        fi
    fi
}

# Print build summary
print_summary() {
    local build_time_end=$(date +%s)
    local build_duration=$((build_time_end - build_time_start))
    
    log_info "Build completed successfully!"
    log_info "Build time: ${build_duration}s"
    log_info "Executable: $BUILD_DIR/rtsp-kvs-gateway"
    
    if [ -f "$BUILD_DIR/rtsp-kvs-gateway" ]; then
        local binary_size=$(du -h "$BUILD_DIR/rtsp-kvs-gateway" | cut -f1)
        log_info "Binary size: $binary_size"
    fi
    
    echo ""
    log_info "Next steps:"
    log_info "1. Configure AWS credentials:"
    log_info "   export AWS_ACCESS_KEY_ID=your_access_key"
    log_info "   export AWS_SECRET_ACCESS_KEY=your_secret_key"
    log_info "   export AWS_DEFAULT_REGION=us-east-1"
    echo ""
    log_info "2. Run the application:"
    log_info "   cd $BUILD_DIR"
    log_info "   ./rtsp-kvs-gateway --config ../config/default_config.json"
    echo ""
    
    if [ "$ENABLE_COVERAGE" = true ]; then
        log_info "3. View coverage report:"
        log_info "   open $BUILD_DIR/coverage/index.html"
        echo ""
    fi
    
    if [ "$ENABLE_TESTING" = true ]; then
        log_info "Run tests with: ctest --test-dir $BUILD_DIR"
    fi
}

# Main build function
main() {
    local build_time_start=$(date +%s)
    
    check_dependencies
    setup_build_env
    configure_cmake
    build_project
    run_tests
    generate_coverage
    install_project
    print_summary
}

# Run main function
main
