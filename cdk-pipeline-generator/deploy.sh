#!/bin/bash

# CDK Deployment Script with Docker BuildKit disabled
# This ensures OpenCV Lambda container builds correctly

set -e

echo "🚀 Deploying CDK Pipeline Generator Stack"
echo "=========================================="

# Set required environment variables
export DOCKER_BUILDKIT=0
# Use AWS_PROFILE environment variable if set, otherwise use default profile
# export AWS_PROFILE=your-profile-name

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   - DOCKER_BUILDKIT: $DOCKER_BUILDKIT"
echo "   - AWS_PROFILE: $AWS_PROFILE"
echo ""

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile $AWS_PROFILE >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: AWS CLI not configured for profile '$AWS_PROFILE'${NC}"
    echo "   Please run: aws configure --profile $AWS_PROFILE"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    echo "   Please start Docker Desktop"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build TypeScript
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm run build

# Deploy with CDK
echo -e "${YELLOW}🚀 Deploying CDK stack...${NC}"
cdk deploy --require-approval never

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${YELLOW}📋 Stack Outputs:${NC}"
aws cloudformation describe-stacks \
    --stack-name PipelineGeneratorStack \
    --profile $AWS_PROFILE \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
    --output text 2>/dev/null | sed 's/^/   API Endpoint: /'

echo ""
echo -e "${GREEN}✅ Ready to test RTSP streams!${NC}"
