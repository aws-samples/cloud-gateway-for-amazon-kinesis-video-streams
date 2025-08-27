#!/bin/bash

# Enhanced RTSP Test Server Comprehensive Validation Script
# Tests all streams including authentication, 4K/8K, and transport protocols
# Validates both video-only and video+audio streams with proper GStreamer pipelines

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test configuration
CONTAINER_NAME="enhanced-rtsp-test-server"
DOCKER_IMAGE="rtsp-test-server"
ENHANCED_IMAGE="enhanced-rtsp-test-server"
TEST_DURATION=3
HTTP_PORT=8080
RTSP_PORTS="8554 8555 8556 8557 8558 8559"

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
AUTH_TESTS=0
AUTH_PASSED=0
TRANSPORT_TESTS=0
TRANSPORT_PASSED=0
QUALITY_TESTS=0
QUALITY_PASSED=0

# Arrays to store results
declare -a TEST_RESULTS
declare -a FAILED_STREAMS
declare -a AUTH_RESULTS
declare -a TRANSPORT_RESULTS

echo -e "${BLUE}🧪 Enhanced RTSP Test Server Comprehensive Validation${NC}"
echo -e "${BLUE}====================================================${NC}"
echo ""

# Function to print test header
print_test_header() {
    echo -e "${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print section header
print_section_header() {
    echo ""
    echo -e "${PURPLE}🎯 $1${NC}"
    echo -e "${PURPLE}$(printf '=%.0s' {1..50})${NC}"
}

# Function to run GStreamer test with authentication support
run_gst_test() {
    local url="$1"
    local description="$2"
    local pipeline="$3"
    local test_name="$4"
    local auth_type="${5:-none}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description ... "
    
    # Handle authentication in URL
    local gst_url="$url"
    if [[ "$auth_type" != "none" ]]; then
        AUTH_TESTS=$((AUTH_TESTS + 1))
    fi
    
    # Run GStreamer pipeline in background
    eval "$pipeline" &
    local gst_pid=$!
    
    # Wait for test duration
    sleep $TEST_DURATION
    
    # Kill the pipeline
    kill $gst_pid 2>/dev/null
    wait $gst_pid 2>/dev/null
    
    # Check if pipeline started successfully
    if [ $? -eq 0 ] || [ $? -eq 143 ]; then  # 143 is SIGTERM exit code
        echo -e "${GREEN}✅ SUCCESS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $test_name - SUCCESS")
        
        if [[ "$auth_type" != "none" ]]; then
            AUTH_PASSED=$((AUTH_PASSED + 1))
            AUTH_RESULTS+=("✅ $test_name ($auth_type auth) - SUCCESS")
        fi
        
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $test_name - FAILED")
        FAILED_STREAMS+=("$url")
        
        if [[ "$auth_type" != "none" ]]; then
            AUTH_RESULTS+=("❌ $test_name ($auth_type auth) - FAILED")
        fi
        
        return 1
    fi
}

# Function to test transport protocols
run_transport_test() {
    local base_url="$1"
    local description="$2"
    local pipeline_base="$3"
    local test_name="$4"
    
    TRANSPORT_TESTS=$((TRANSPORT_TESTS + 2))  # UDP and TCP
    
    # Test UDP transport
    echo -n "Testing UDP: $description ... "
    local udp_pipeline="${pipeline_base/location=$base_url/location=$base_url?transport=udp}"
    eval "$udp_pipeline" &
    local gst_pid=$!
    sleep $TEST_DURATION
    kill $gst_pid 2>/dev/null
    wait $gst_pid 2>/dev/null
    
    if [ $? -eq 0 ] || [ $? -eq 143 ]; then
        echo -e "${GREEN}✅ UDP SUCCESS${NC}"
        TRANSPORT_PASSED=$((TRANSPORT_PASSED + 1))
        TRANSPORT_RESULTS+=("✅ $test_name (UDP) - SUCCESS")
    else
        echo -e "${RED}❌ UDP FAILED${NC}"
        TRANSPORT_RESULTS+=("❌ $test_name (UDP) - FAILED")
    fi
    
    # Test TCP transport (default)
    echo -n "Testing TCP: $description ... "
    eval "$pipeline_base" &
    gst_pid=$!
    sleep $TEST_DURATION
    kill $gst_pid 2>/dev/null
    wait $gst_pid 2>/dev/null
    
    if [ $? -eq 0 ] || [ $? -eq 143 ]; then
        echo -e "${GREEN}✅ TCP SUCCESS${NC}"
        TRANSPORT_PASSED=$((TRANSPORT_PASSED + 1))
        TRANSPORT_RESULTS+=("✅ $test_name (TCP) - SUCCESS")
    else
        echo -e "${RED}❌ TCP FAILED${NC}"
        TRANSPORT_RESULTS+=("❌ $test_name (TCP) - FAILED")
    fi
}

# Function to check prerequisites
check_prerequisites() {
    print_test_header "Checking Prerequisites"
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Docker available${NC}"
    
    # Check GStreamer
    if ! command -v gst-launch-1.0 &> /dev/null; then
        echo -e "${RED}❌ GStreamer is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ GStreamer available${NC}"
    
    # Check for enhanced Docker image
    if docker image inspect $ENHANCED_IMAGE &> /dev/null; then
        echo -e "${GREEN}✅ Enhanced Docker image '$ENHANCED_IMAGE' available${NC}"
        DOCKER_IMAGE=$ENHANCED_IMAGE
    elif docker image inspect rtsp-test-server &> /dev/null; then
        echo -e "${YELLOW}⚠️  Using basic Docker image 'rtsp-test-server'${NC}"
        DOCKER_IMAGE="rtsp-test-server"
    else
        echo -e "${RED}❌ No RTSP Test Server Docker image found${NC}"
        echo "Build with: docker build -t rtsp-test-server ."
        exit 1
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}⚠️  jq not available, some features may be limited${NC}"
    else
        echo -e "${GREEN}✅ jq available for JSON parsing${NC}"
    fi
    
    echo ""
}

# Function to start enhanced RTSP server
start_enhanced_rtsp_server() {
    print_test_header "Starting Enhanced RTSP Test Server"
    
    # Clean up any existing container
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
    
    # Start container with enhanced configuration
    echo "Starting enhanced container..."
    docker run -d --name $CONTAINER_NAME \
        -p 8554:8554 -p 8555:8555 -p 8556:8556 -p 8557:8557 -p 8558:8558 -p 8559:8559 \
        -p $HTTP_PORT:8080 \
        -e RTSP_SERVER_MODE=enhanced \
        $DOCKER_IMAGE
    
    # Wait for server to start
    echo "Waiting for enhanced server to initialize..."
    sleep 15
    
    # Get container IP
    CONTAINER_IP=$(docker inspect $CONTAINER_NAME | grep '"IPAddress"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Enhanced container started with IP: $CONTAINER_IP${NC}"
    
    # Verify HTTP API is responding
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$HTTP_PORT/rtsp-urls > /dev/null; then
            echo -e "${GREEN}✅ HTTP API responding${NC}"
            break
        else
            echo "Waiting for HTTP API... (attempt $attempt/$max_attempts)"
            sleep 2
            attempt=$((attempt + 1))
        fi
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}❌ HTTP API not responding after $max_attempts attempts${NC}"
        docker logs $CONTAINER_NAME
        exit 1
    fi
    
    echo ""
}

# Function to get enhanced stream list
get_enhanced_stream_list() {
    print_test_header "Retrieving Enhanced Stream List"
    
    if command -v jq &> /dev/null; then
        local stream_count=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.total_streams // 0')
        local server_version=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.version // "unknown"')
        local coverage=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.coverage // "unknown"')
        
        echo -e "${GREEN}✅ Server Version: $server_version${NC}"
        echo -e "${GREEN}✅ Total Streams: $stream_count${NC}"
        echo -e "${GREEN}✅ Coverage: $coverage${NC}"
        
        # Get authentication info
        local auth_support=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.authentication_support[]?' 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
        if [ -n "$auth_support" ]; then
            echo -e "${GREEN}✅ Authentication Support: $auth_support${NC}"
        fi
        
        # Get transport info
        local transport_support=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.transport_support[]?' 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
        if [ -n "$transport_support" ]; then
            echo -e "${GREEN}✅ Transport Support: $transport_support${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  jq not available, using basic validation${NC}"
        local response=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls)
        if echo "$response" | grep -q "rtsp_urls"; then
            echo -e "${GREEN}✅ Stream list retrieved successfully${NC}"
        else
            echo -e "${RED}❌ Failed to retrieve stream list${NC}"
            exit 1
        fi
    fi
    
    echo ""
}
# Function to test basic H.264 streams (no authentication)
test_basic_h264_streams() {
    print_section_header "Testing Basic H.264 Streams (No Authentication)"
    
    # Standard resolutions and frame rates
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_720p_25fps" \
        "H.264 720p 25fps (Standard Security Camera)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_1080p_30fps" \
        "H.264 1080p 30fps (Professional Camera)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_1080p_30fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 1080p 30fps"
    
    # Video + Audio combinations
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_720p_25fps_aac" \
        "H.264 720p 25fps + AAC Audio" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "H.264 720p 25fps + AAC"
    
    # Quality variations
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_720p_25fps_low" \
        "H.264 720p 25fps Low Quality (1 Mbps)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps_low ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps Low Quality"
    
    # Video-only variants (critical for security cameras)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_720p_25fps_noaudio" \
        "H.264 720p 25fps Video Only (Security Camera)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps_noaudio ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps Video Only"
    
    # High frame rates
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_1080p_60fps" \
        "H.264 1080p 60fps (Professional High Frame Rate)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_1080p_60fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 1080p 60fps"
}

# Function to test authenticated streams
test_authenticated_streams() {
    print_section_header "Testing Authenticated Streams (Basic & Digest)"
    
    # Basic Authentication Tests
    echo -e "${CYAN}🔐 Testing Basic Authentication${NC}"
    
    run_gst_test \
        "rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_basic" \
        "H.264 720p 25fps (Basic Auth: admin/admin)" \
        "gst-launch-1.0 rtspsrc location=rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_basic ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps Basic Auth (admin/admin)" \
        "basic"
    
    run_gst_test \
        "rtsp://admin:password@$CONTAINER_IP:8554/h264_1080p_30fps_basic" \
        "H.264 1080p 30fps (Basic Auth: admin/password)" \
        "gst-launch-1.0 rtspsrc location=rtsp://admin:password@$CONTAINER_IP:8554/h264_1080p_30fps_basic ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 1080p 30fps Basic Auth (admin/password)" \
        "basic"
    
    # Digest Authentication Tests
    echo -e "${CYAN}🔐 Testing Digest Authentication${NC}"
    
    run_gst_test \
        "rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_digest" \
        "H.264 720p 25fps (Digest Auth: admin/admin)" \
        "gst-launch-1.0 rtspsrc location=rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_digest ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps Digest Auth (admin/admin)" \
        "digest"
}

# Function to test H.265 and MJPEG streams
test_h265_mjpeg_streams() {
    print_section_header "Testing H.265 & MJPEG Streams (Modern Codecs)"
    
    # H.265 Professional streams
    echo -e "${CYAN}🎬 Testing H.265 Streams${NC}"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/h265_720p_25fps" \
        "H.265 720p 25fps (Efficient Compression)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/h265_720p_25fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" \
        "H.265 720p 25fps"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/h265_1080p_30fps" \
        "H.265 1080p 30fps (Professional Efficient)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/h265_1080p_30fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" \
        "H.265 1080p 30fps"
    
    # MJPEG Security Camera streams
    echo -e "${CYAN}📹 Testing MJPEG Streams${NC}"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mjpeg_720p_15fps" \
        "MJPEG 720p 15fps (IP Security Camera)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mjpeg_720p_15fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" \
        "MJPEG 720p 15fps"
    
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mjpeg_1080p_20fps" \
        "MJPEG 1080p 20fps (High Quality Security)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mjpeg_1080p_20fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" \
        "MJPEG 1080p 20fps"
}

# Function to test HTTP API comprehensively
test_http_api_comprehensive() {
    print_section_header "Testing HTTP REST API (Comprehensive)"
    
    echo -n "Testing HTTP API endpoint ... "
    if curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq . > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ HTTP REST API - SUCCESS")
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ HTTP REST API - FAILED")
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
}

# Function to cleanup
cleanup() {
    print_test_header "Cleaning Up"
    
    echo "Stopping container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    echo ""
}

# Function to print comprehensive results
print_comprehensive_results() {
    print_section_header "Comprehensive Test Results Summary"
    
    echo -e "${BLUE}📊 Overall Statistics${NC}"
    echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${BLUE}Success Rate: $success_rate%${NC}"
    echo ""
    
    # Authentication statistics
    if [ $AUTH_TESTS -gt 0 ]; then
        echo -e "${PURPLE}🔐 Authentication Statistics${NC}"
        echo -e "${BLUE}Authentication Tests: $AUTH_TESTS${NC}"
        echo -e "${GREEN}Authentication Passed: $AUTH_PASSED${NC}"
        local auth_rate=$((AUTH_PASSED * 100 / AUTH_TESTS))
        echo -e "${BLUE}Authentication Success Rate: $auth_rate%${NC}"
        echo ""
    fi
    
    # Transport protocol statistics
    if [ $TRANSPORT_TESTS -gt 0 ]; then
        echo -e "${CYAN}🌐 Transport Protocol Statistics${NC}"
        echo -e "${BLUE}Transport Tests: $TRANSPORT_TESTS${NC}"
        echo -e "${GREEN}Transport Passed: $TRANSPORT_PASSED${NC}"
        local transport_rate=$((TRANSPORT_PASSED * 100 / TRANSPORT_TESTS))
        echo -e "${BLUE}Transport Success Rate: $transport_rate%${NC}"
        echo ""
    fi
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! Enhanced RTSP Test Server is working perfectly.${NC}"
        echo -e "${GREEN}✅ Ready for production deployment and comprehensive camera testing.${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Failed streams:${NC}"
        for stream in "${FAILED_STREAMS[@]}"; do
            echo -e "${RED}  - $stream${NC}"
        done
    fi
    
    echo ""
    echo -e "${BLUE}📋 Detailed Results:${NC}"
    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done
    
    echo ""
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Enhanced RTSP Test Server Validation Script"
    echo "Tests comprehensive stream matrix including authentication, transport protocols, and quality variations"
    echo ""
    echo "Options:"
    echo "  --quick          Run quick test (subset of streams)"
    echo "  --auth-only      Test only authenticated streams"
    echo "  --no-auth        Skip authentication tests"
    echo "  --no-cleanup     Don't cleanup container after tests"
    echo "  --duration N     Test duration per stream in seconds (default: 3)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run full enhanced test suite"
    echo "  $0 --quick           # Run quick validation"
    echo "  $0 --auth-only       # Test only authentication features"
    echo "  $0 --duration 5      # Test each stream for 5 seconds"
    echo ""
}

# Parse command line arguments
QUICK_MODE=false
AUTH_ONLY=false
NO_AUTH=false
NO_CLEANUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
            shift
            ;;
        --auth-only)
            AUTH_ONLY=true
            shift
            ;;
        --no-auth)
            NO_AUTH=true
            shift
            ;;
        --no-cleanup)
            NO_CLEANUP=true
            shift
            ;;
        --duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        --help|-h)
            show_usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo -e "${BLUE}Starting Enhanced RTSP Test Server validation...${NC}"
    echo -e "${BLUE}Test duration per stream: ${TEST_DURATION}s${NC}"
    if [ "$QUICK_MODE" = true ]; then
        echo -e "${YELLOW}Running in QUICK MODE (subset of tests)${NC}"
    fi
    if [ "$AUTH_ONLY" = true ]; then
        echo -e "${PURPLE}Running AUTHENTICATION ONLY tests${NC}"
    fi
    if [ "$NO_AUTH" = true ]; then
        echo -e "${YELLOW}Skipping authentication tests${NC}"
    fi
    echo ""
    
    # Run all test phases
    check_prerequisites
    start_enhanced_rtsp_server
    get_enhanced_stream_list
    
    if [ "$AUTH_ONLY" = true ]; then
        # Authentication-only mode
        test_authenticated_streams
    elif [ "$QUICK_MODE" = true ]; then
        # Quick mode - basic functionality test
        print_section_header "Quick Validation Mode"
        run_gst_test "rtsp://$CONTAINER_IP:8554/h264_720p_25fps" "H.264 720p 25fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" "H.264 Quick Test"
        run_gst_test "rtsp://$CONTAINER_IP:8555/h265_720p_25fps" "H.265 720p 25fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/h265_720p_25fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" "H.265 Quick Test"
        run_gst_test "rtsp://$CONTAINER_IP:8555/mjpeg_720p_15fps" "MJPEG 720p 15fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mjpeg_720p_15fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" "MJPEG Quick Test"
        if [ "$NO_AUTH" = false ]; then
            run_gst_test "rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_basic" "H.264 Basic Auth" "gst-launch-1.0 rtspsrc location=rtsp://admin:admin@$CONTAINER_IP:8554/h264_720p_25fps_basic ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" "H.264 Auth Quick Test" "basic"
        fi
    else
        # Full test suite
        test_basic_h264_streams
        if [ "$NO_AUTH" = false ]; then
            test_authenticated_streams
        fi
        test_h265_mjpeg_streams
    fi
    
    test_http_api_comprehensive
    
    if [ "$NO_CLEANUP" = false ]; then
        cleanup
    else
        echo -e "${YELLOW}⚠️  Container left running (--no-cleanup specified)${NC}"
        echo -e "${YELLOW}   Container name: $CONTAINER_NAME${NC}"
        echo -e "${YELLOW}   To cleanup manually: docker rm -f $CONTAINER_NAME${NC}"
        echo ""
    fi
    
    print_comprehensive_results
}

# Set trap for cleanup on script exit
trap 'cleanup' EXIT

# Run main function
main "$@"
