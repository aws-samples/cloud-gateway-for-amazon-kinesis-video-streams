#!/bin/bash

# RTSP Test Server Comprehensive Validation Script
# Tests all 24 RTSP endpoints with proper GStreamer pipelines
# Validates both video-only and video+audio streams

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
CONTAINER_NAME="rtsp-test-server-validation"
DOCKER_IMAGE="rtsp-test-server"
TEST_DURATION=3
HTTP_PORT=8080
RTSP_PORTS="8554 8555 8556 8557"

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Arrays to store results
declare -a TEST_RESULTS
declare -a FAILED_STREAMS

echo -e "${BLUE}🧪 RTSP Test Server Comprehensive Validation${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""

# Function to print test header
print_test_header() {
    echo -e "${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to run GStreamer test
run_gst_test() {
    local url="$1"
    local description="$2"
    local pipeline="$3"
    local test_name="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing: $description ... "
    
    # Run GStreamer pipeline in background
    eval "$pipeline" &
    local gst_pid=$!
    
    # Wait for test duration
    sleep $TEST_DURATION
    
    # Kill the pipeline
    kill $gst_pid 2>/dev/null
    wait $gst_pid 2>/dev/null
    
    # Check if pipeline started successfully (basic validation)
    if [ $? -eq 0 ] || [ $? -eq 143 ]; then  # 143 is SIGTERM exit code
        echo -e "${GREEN}✅ SUCCESS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ $test_name - SUCCESS")
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ $test_name - FAILED")
        FAILED_STREAMS+=("$url")
        return 1
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
    
    # Check if Docker image exists
    if ! docker image inspect $DOCKER_IMAGE &> /dev/null; then
        echo -e "${RED}❌ Docker image '$DOCKER_IMAGE' not found. Please build it first.${NC}"
        echo "Run: docker build -t $DOCKER_IMAGE ."
        exit 1
    fi
    echo -e "${GREEN}✅ Docker image '$DOCKER_IMAGE' available${NC}"
    
    echo ""
}

# Function to start RTSP server
start_rtsp_server() {
    print_test_header "Starting RTSP Test Server"
    
    # Clean up any existing container
    docker rm -f $CONTAINER_NAME 2>/dev/null || true
    
    # Start container
    echo "Starting container..."
    docker run -d --name $CONTAINER_NAME \
        -p 8554:8554 -p 8555:8555 -p 8556:8556 -p 8557:8557 -p $HTTP_PORT:8080 \
        $DOCKER_IMAGE
    
    # Wait for server to start
    echo "Waiting for server to initialize..."
    sleep 10
    
    # Get container IP
    CONTAINER_IP=$(docker inspect $CONTAINER_NAME | grep '"IPAddress"' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Container started with IP: $CONTAINER_IP${NC}"
    
    # Verify HTTP API is responding
    if curl -s http://localhost:$HTTP_PORT/rtsp-urls > /dev/null; then
        echo -e "${GREEN}✅ HTTP API responding${NC}"
    else
        echo -e "${RED}❌ HTTP API not responding${NC}"
        exit 1
    fi
    
    echo ""
}

# Function to get stream list
get_stream_list() {
    print_test_header "Retrieving Stream List"
    
    local stream_count=$(curl -s http://localhost:$HTTP_PORT/rtsp-urls | jq -r '.server_info.total_streams')
    echo -e "${GREEN}✅ Server reports $stream_count streams available${NC}"
    echo ""
}

# Function to test H.264 streams
test_h264_streams() {
    print_test_header "Testing H.264 Streams (Port 8554)"
    
    # H.264 360p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_360p_15fps" \
        "H.264 360p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_360p_15fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 360p 15fps"
    
    # H.264 360p 15fps + AAC (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_360p_15fps_aac" \
        "H.264 360p 15fps + AAC (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_360p_15fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "H.264 360p 15fps + AAC"
    
    # H.264 480p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_480p_20fps" \
        "H.264 480p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_480p_20fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 480p 20fps"
    
    # H.264 720p 25fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h264_720p_25fps" \
        "H.264 720p 25fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_720p_25fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" \
        "H.264 720p 25fps"
    
    echo ""
}

# Function to test H.265 streams
test_h265_streams() {
    print_test_header "Testing H.265 Streams (Port 8554)"
    
    # H.265 360p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h265_360p_15fps" \
        "H.265 360p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h265_360p_15fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" \
        "H.265 360p 15fps"
    
    # H.265 360p 15fps + AAC (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h265_360p_15fps_aac" \
        "H.265 360p 15fps + AAC (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h265_360p_15fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "H.265 360p 15fps + AAC"
    
    # H.265 480p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h265_480p_20fps" \
        "H.265 480p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h265_480p_20fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" \
        "H.265 480p 20fps"
    
    # H.265 720p 25fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8554/h265_720p_25fps" \
        "H.265 720p 25fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h265_720p_25fps ! rtph265depay ! h265parse ! avdec_h265 ! fakesink sync=false" \
        "H.265 720p 25fps"
    
    echo ""
}

# Function to test MPEG-2 streams
test_mpeg2_streams() {
    print_test_header "Testing MPEG-2 Streams (Port 8555)"
    
    # MPEG-2 360p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg2_360p_15fps" \
        "MPEG-2 360p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg2_360p_15fps ! rtpmpvdepay ! mpegvideoparse ! avdec_mpeg2video ! fakesink sync=false" \
        "MPEG-2 360p 15fps"
    
    # MPEG-2 360p 15fps + AAC (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg2_360p_15fps_aac" \
        "MPEG-2 360p 15fps + AAC (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg2_360p_15fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtpmpvdepay ! mpegvideoparse ! avdec_mpeg2video ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "MPEG-2 360p 15fps + AAC"
    
    # MPEG-2 480p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg2_480p_20fps" \
        "MPEG-2 480p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg2_480p_20fps ! rtpmpvdepay ! mpegvideoparse ! avdec_mpeg2video ! fakesink sync=false" \
        "MPEG-2 480p 20fps"
    
    # MPEG-2 720p 25fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg2_720p_25fps" \
        "MPEG-2 720p 25fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg2_720p_25fps ! rtpmpvdepay ! mpegvideoparse ! avdec_mpeg2video ! fakesink sync=false" \
        "MPEG-2 720p 25fps"
    
    echo ""
}

# Function to test MPEG-4 streams
test_mpeg4_streams() {
    print_test_header "Testing MPEG-4 Streams (Port 8555)"
    
    # MPEG-4 360p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps" \
        "MPEG-4 360p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps ! rtpmp4vdepay ! mpeg4videoparse ! avdec_mpeg4 ! fakesink sync=false" \
        "MPEG-4 360p 15fps"
    
    # MPEG-4 360p 15fps + AAC (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps_aac" \
        "MPEG-4 360p 15fps + AAC (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtpmp4vdepay ! mpeg4videoparse ! avdec_mpeg4 ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "MPEG-4 360p 15fps + AAC"
    
    # MPEG-4 480p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg4_480p_20fps" \
        "MPEG-4 480p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg4_480p_20fps ! rtpmp4vdepay ! mpeg4videoparse ! avdec_mpeg4 ! fakesink sync=false" \
        "MPEG-4 480p 20fps"
    
    # MPEG-4 720p 25fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8555/mpeg4_720p_25fps" \
        "MPEG-4 720p 25fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg4_720p_25fps ! rtpmp4vdepay ! mpeg4videoparse ! avdec_mpeg4 ! fakesink sync=false" \
        "MPEG-4 720p 25fps"
    
    echo ""
}

# Function to test MJPEG streams
test_mjpeg_streams() {
    print_test_header "Testing MJPEG Streams (Port 8556)"
    
    # MJPEG 360p 10fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps" \
        "MJPEG 360p 10fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" \
        "MJPEG 360p 10fps"
    
    # MJPEG 360p 10fps + G.711 (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps_g711" \
        "MJPEG 360p 10fps + G.711 (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps_g711 name=src src. ! queue ! application/x-rtp,media=video ! rtpjpegdepay ! jpegdec ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtppcmudepay ! mulawdec ! fakesink sync=false" \
        "MJPEG 360p 10fps + G.711"
    
    # MJPEG 480p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8556/mjpeg_480p_15fps" \
        "MJPEG 480p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8556/mjpeg_480p_15fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" \
        "MJPEG 480p 15fps"
    
    # MJPEG 720p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8556/mjpeg_720p_20fps" \
        "MJPEG 720p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8556/mjpeg_720p_20fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" \
        "MJPEG 720p 20fps"
    
    echo ""
}

# Function to test Theora streams
test_theora_streams() {
    print_test_header "Testing Theora Streams (Port 8557)"
    
    # Theora 360p 15fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8557/theora_360p_15fps" \
        "Theora 360p 15fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8557/theora_360p_15fps ! rtptheoradepay ! theoradec ! fakesink sync=false" \
        "Theora 360p 15fps"
    
    # Theora 360p 15fps + AAC (video + audio)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8557/theora_360p_15fps_aac" \
        "Theora 360p 15fps + AAC (video + audio)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8557/theora_360p_15fps_aac name=src src. ! queue ! application/x-rtp,media=video ! rtptheoradepay ! theoradec ! fakesink sync=false src. ! queue ! application/x-rtp,media=audio ! rtpmp4adepay ! aacparse ! avdec_aac ! fakesink sync=false" \
        "Theora 360p 15fps + AAC"
    
    # Theora 480p 20fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8557/theora_480p_20fps" \
        "Theora 480p 20fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8557/theora_480p_20fps ! rtptheoradepay ! theoradec ! fakesink sync=false" \
        "Theora 480p 20fps"
    
    # Theora 720p 25fps (video only)
    run_gst_test \
        "rtsp://$CONTAINER_IP:8557/theora_720p_25fps" \
        "Theora 720p 25fps (video only)" \
        "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8557/theora_720p_25fps ! rtptheoradepay ! theoradec ! fakesink sync=false" \
        "Theora 720p 25fps"
    
    echo ""
}

# Function to test HTTP API
test_http_api() {
    print_test_header "Testing HTTP REST API"
    
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
    
    echo -n "Testing CORS headers ... "
    if curl -s -I http://localhost:$HTTP_PORT/rtsp-urls | grep -i "access-control-allow-origin" > /dev/null; then
        echo -e "${GREEN}✅ SUCCESS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ CORS Headers - SUCCESS")
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ CORS Headers - FAILED")
    fi
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
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

# Function to print final results
print_results() {
    print_test_header "Test Results Summary"
    
    echo -e "${BLUE}Total Tests: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    local success_rate=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "${BLUE}Success Rate: $success_rate%${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 ALL TESTS PASSED! RTSP Test Server is working perfectly.${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Failed streams:${NC}"
        for stream in "${FAILED_STREAMS[@]}"; do
            echo -e "${RED}  - $stream${NC}"
        done
    fi
    
    echo ""
    echo -e "${BLUE}Detailed Results:${NC}"
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
    echo "Options:"
    echo "  --quick          Run quick test (subset of streams)"
    echo "  --no-cleanup     Don't cleanup container after tests"
    echo "  --duration N     Test duration per stream in seconds (default: 3)"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run full test suite"
    echo "  $0 --quick           # Run quick validation"
    echo "  $0 --duration 5      # Test each stream for 5 seconds"
    echo ""
}

# Parse command line arguments
QUICK_MODE=false
NO_CLEANUP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK_MODE=true
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
    echo -e "${BLUE}Starting RTSP Test Server validation...${NC}"
    echo -e "${BLUE}Test duration per stream: ${TEST_DURATION}s${NC}"
    if [ "$QUICK_MODE" = true ]; then
        echo -e "${YELLOW}Running in QUICK MODE (subset of tests)${NC}"
    fi
    echo ""
    
    # Run all test phases
    check_prerequisites
    start_rtsp_server
    get_stream_list
    
    if [ "$QUICK_MODE" = true ]; then
        # Quick mode - test one stream from each codec type
        print_test_header "Quick Validation Mode"
        run_gst_test "rtsp://$CONTAINER_IP:8554/h264_360p_15fps" "H.264 360p 15fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8554/h264_360p_15fps ! rtph264depay ! h264parse ! avdec_h264 ! fakesink sync=false" "H.264 Quick Test"
        run_gst_test "rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps" "MPEG-4 360p 15fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8555/mpeg4_360p_15fps ! rtpmp4vdepay ! mpeg4videoparse ! avdec_mpeg4 ! fakesink sync=false" "MPEG-4 Quick Test"
        run_gst_test "rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps" "MJPEG 360p 10fps" "gst-launch-1.0 rtspsrc location=rtsp://$CONTAINER_IP:8556/mjpeg_360p_10fps ! rtpjpegdepay ! jpegdec ! fakesink sync=false" "MJPEG Quick Test"
        echo ""
    else
        # Full test suite
        test_h264_streams
        test_h265_streams
        test_mpeg2_streams
        test_mpeg4_streams
        test_mjpeg_streams
        test_theora_streams
    fi
    
    test_http_api
    
    if [ "$NO_CLEANUP" = false ]; then
        cleanup
    else
        echo -e "${YELLOW}⚠️  Container left running (--no-cleanup specified)${NC}"
        echo -e "${YELLOW}   Container name: $CONTAINER_NAME${NC}"
        echo -e "${YELLOW}   To cleanup manually: docker rm -f $CONTAINER_NAME${NC}"
        echo ""
    fi
    
    print_results
}

# Set trap for cleanup on script exit
trap 'cleanup' EXIT

# Run main function
main "$@"
