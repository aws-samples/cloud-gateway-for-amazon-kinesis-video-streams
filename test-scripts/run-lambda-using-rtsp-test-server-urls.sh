#!/bin/bash

# Comprehensive Lambda Function Testing Script
# This script runs the comprehensive lambda testing with automatic test-results directory creation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
LAMBDA_FUNCTION="PipelineGeneratorStack-SdpExtractorFunction0634AF6-vPvkrlpMQnAP"
SERVER_IP="44.215.108.66"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --lambda-function)
            LAMBDA_FUNCTION="$2"
            shift 2
            ;;
        --server-ip)
            SERVER_IP="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [--lambda-function FUNCTION_NAME] [--server-ip IP_ADDRESS]"
            echo ""
            echo "Options:"
            echo "  --lambda-function  Lambda function name (default: $LAMBDA_FUNCTION)"
            echo "  --server-ip        RTSP server IP address (default: $SERVER_IP)"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🧪 Comprehensive Lambda Function Testing${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""
echo -e "Lambda Function: ${GREEN}$LAMBDA_FUNCTION${NC}"
echo -e "Server IP: ${GREEN}$SERVER_IP${NC}"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed${NC}"
    exit 1
fi

# Check if required Python packages are available
echo -e "${YELLOW}📦 Checking Python dependencies...${NC}"
python3 -c "import boto3, requests" 2>/dev/null || {
    echo -e "${RED}❌ Required Python packages missing. Install with:${NC}"
    echo -e "${YELLOW}pip3 install boto3 requests${NC}"
    exit 1
}
echo -e "${GREEN}✓ Python dependencies OK${NC}"

# Check AWS credentials
echo -e "${YELLOW}🔐 Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured or invalid${NC}"
    echo -e "${YELLOW}Configure with: aws configure${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials OK${NC}"

# Check if server is reachable
echo -e "${YELLOW}🌐 Checking server connectivity...${NC}"
if ! curl -s --connect-timeout 5 "http://$SERVER_IP:8080/streams" > /dev/null; then
    echo -e "${RED}❌ Cannot reach server at $SERVER_IP:8080${NC}"
    echo -e "${YELLOW}Make sure the simple-rtsp-server is running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Server connectivity OK${NC}"

echo ""
echo -e "${BLUE}🚀 Starting comprehensive test...${NC}"
echo ""

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the Python test script
python3 "$SCRIPT_DIR/test-lambda-using-rtsp-test-server-urls.py" \
    --lambda-function "$LAMBDA_FUNCTION" \
    --server-ip "$SERVER_IP"

# Capture exit code
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
else
    echo -e "${RED}❌ Some tests failed. Check the results for details.${NC}"
fi

echo ""
echo -e "${BLUE}📁 Test results saved in: $(dirname "$SCRIPT_DIR")/test-results/${NC}"

exit $EXIT_CODE
