#!/bin/bash

# Unified GStreamer Pipeline & Camera Management System Deployment
# Deploys complete system with all functionality consolidated

set -e

# AWS Profile Configuration
AWS_PROFILE="malone-aws"
export AWS_PROFILE

# Parse command line arguments
DEPLOY_RTSP_TEST_SERVER="true"
DEPLOY_FRONTEND="true"

while [[ $# -gt 0 ]]; do
  case $1 in
    --with-rtsp-test-server)
      DEPLOY_RTSP_TEST_SERVER="true"
      shift
      ;;
    --no-rtsp-test-server)
      DEPLOY_RTSP_TEST_SERVER="false"
      shift
      ;;
    --with-frontend)
      DEPLOY_FRONTEND="true"
      shift
      ;;
    --no-frontend)
      DEPLOY_FRONTEND="false"
      shift
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --with-rtsp-test-server    Deploy RTSP Test Server component (default)"
      echo "  --no-rtsp-test-server      Skip RTSP Test Server deployment"
      echo "  --with-frontend            Deploy React frontend application (default)"
      echo "  --no-frontend              Skip frontend deployment"
      echo "  --help, -h                 Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                         Deploy complete platform (frontend + RTSP server)"
      echo "  $0 --no-rtsp-test-server   Deploy platform without RTSP Test Server"
      echo "  $0 --no-frontend           Deploy backend and RTSP server only"
      echo "  $0 --no-frontend --no-rtsp-test-server  Deploy backend only"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo "🚀 Deploying Unified GStreamer Pipeline & Camera Management System"
echo "=================================================================="
if [[ "$DEPLOY_RTSP_TEST_SERVER" == "true" ]]; then
    echo "📡 RTSP Test Server: ENABLED (default)"
else
    echo "📡 RTSP Test Server: DISABLED (use --no-rtsp-test-server was specified)"
fi

if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
    echo "🎨 React Frontend: ENABLED (default)"
else
    echo "🎨 React Frontend: DISABLED (--no-frontend was specified)"
fi
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is required but not installed"
    exit 1
fi

# Check CDK
if ! command -v cdk &> /dev/null; then
    echo "❌ AWS CDK is required but not installed"
    echo "Install with: npm install -g aws-cdk"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

echo "✅ All prerequisites satisfied"
echo ""

# Install dependencies
echo "📦 Installing CDK dependencies..."
cd cdk-infrastructure/
npm install
cd ..
echo "✅ CDK dependencies installed"
echo ""

# Set Docker to use legacy builder (required for Lambda compatibility)
echo "🐳 Configuring Docker for Lambda compatibility..."
export DOCKER_BUILDKIT=0
echo "✅ Docker configured with legacy builder"
echo ""

# Bootstrap CDK if needed
echo "🏗️  Checking CDK bootstrap status..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    echo "Please configure AWS CLI with: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=$(aws configure get region || echo "us-east-1")

echo "📍 Deploying to Account: $ACCOUNT_ID, Region: $REGION"

# Check if CDK is bootstrapped
if ! aws cloudformation describe-stacks --stack-name CDKToolkit --region $REGION &> /dev/null; then
    echo "🔧 Bootstrapping CDK..."
    cdk bootstrap aws://$ACCOUNT_ID/$REGION
    echo "✅ CDK bootstrapped"
else
    echo "✅ CDK already bootstrapped"
fi
echo ""

# Deploy the unified stack
echo "🚀 Deploying unified system..."
echo "This deployment includes:"
echo "  • Enhanced Pipeline Generator Lambda (GStreamer expert + RTSP analysis)"
echo "  • Camera Management Lambda (CRUD operations)"
echo "  • Unified API Gateway (all endpoints)"
echo "  • DynamoDB table for camera configurations"
echo "  • Secrets Manager integration"
echo "  • Cognito authentication"
echo "  • CloudWatch logging and monitoring"
if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
    echo "  • React Frontend Application (S3 + CloudFront) - ENABLED"
else
    echo "  • React Frontend Application - DISABLED"
fi
if [[ "$DEPLOY_RTSP_TEST_SERVER" == "true" ]]; then
    echo "  • RTSP Test Server (50+ streams, 85% camera coverage) - ENABLED"
else
    echo "  • RTSP Test Server - DISABLED"
fi
echo ""

# Build frontend if enabled
if [[ "$DEPLOY_FRONTEND" == "true" ]]; then
    echo "🎨 Building React frontend..."
    cd frontend/
    
    # Check if node_modules exists, install if not
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing frontend dependencies..."
        npm install
    fi
    
    # Build the React application
    echo "🔨 Building React application..."
    npm run build
    
    if [ ! -d "dist" ]; then
        echo "❌ Frontend build failed - dist directory not created"
        exit 1
    fi
    
    echo "✅ Frontend built successfully"
    cd ..
    echo ""
fi

# Deploy with Docker legacy builder
cd cdk-infrastructure/
DOCKER_BUILDKIT=0 cdk deploy --require-approval never \
    --parameters DeployRtspTestServer=$DEPLOY_RTSP_TEST_SERVER \
    --parameters DeployFrontend=$DEPLOY_FRONTEND
cd ..

echo ""
echo "🎉 Deployment Complete!"
echo "======================"
echo ""

# Get stack outputs
echo "📋 System Information:"
API_ENDPOINT=$(aws cloudformation describe-stacks \
    --stack-name EnhancedPipelineGeneratorStack \
    --query 'Stacks[0].Outputs[?OutputKey==`UnifiedApiEndpoint`].OutputValue' \
    --output text \
    --region $REGION 2>/dev/null || echo "Not available")

ENHANCED_LAMBDA=$(aws cloudformation describe-stacks \
    --stack-name EnhancedPipelineGeneratorStack \
    --query 'Stacks[0].Outputs[?OutputKey==`EnhancedLambdaFunctionName`].OutputValue' \
    --output text \
    --region $REGION 2>/dev/null || echo "Not available")

CAMERA_LAMBDA=$(aws cloudformation describe-stacks \
    --stack-name EnhancedPipelineGeneratorStack \
    --query 'Stacks[0].Outputs[?OutputKey==`CameraLambdaFunctionName`].OutputValue' \
    --output text \
    --region $REGION 2>/dev/null || echo "Not available")

CAMERAS_TABLE=$(aws cloudformation describe-stacks \
    --stack-name EnhancedPipelineGeneratorStack \
    --query 'Stacks[0].Outputs[?OutputKey==`CamerasTableName`].OutputValue' \
    --output text \
    --region $REGION 2>/dev/null || echo "Not available")

echo "🌐 API Endpoint: $API_ENDPOINT"
echo "⚡ Enhanced Lambda: $ENHANCED_LAMBDA"
echo "📹 Camera Lambda: $CAMERA_LAMBDA"
echo "🗄️  Cameras Table: $CAMERAS_TABLE"
echo ""

echo "🔧 Available Endpoints:"
echo "  Pipeline Generation:"
echo "    POST $API_ENDPOINT/v1/generate-pipeline"
echo "    POST $API_ENDPOINT/v1/characteristics"
echo "    POST $API_ENDPOINT/v1/tools/search-elements"
echo "    POST $API_ENDPOINT/v1/tools/troubleshoot"
echo "    POST $API_ENDPOINT/v1/tools/optimize"
echo "    POST $API_ENDPOINT/v1/tools/validate"
echo "    POST $API_ENDPOINT/v1/tools/expert"
echo ""
echo "  Camera Management (requires Cognito auth):"
echo "    GET/POST $API_ENDPOINT/cameras"
echo "    GET/PUT/DELETE $API_ENDPOINT/cameras/{id}"
echo ""

echo "🧪 Test the system:"
echo "  # Test RTSP analysis"
echo "  curl -X POST $API_ENDPOINT/v1/characteristics \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"rtsp_url\": \"rtsp://test-stream\", \"capture_frame\": true}'"
echo ""
echo "  # Test expert system"
echo "  curl -X POST $API_ENDPOINT/v1/tools/search-elements \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"query\": \"kvssink properties\"}'"
echo ""

echo "📊 Monitor the system:"
echo "  aws logs tail /aws/lambda/$ENHANCED_LAMBDA --follow"
echo "  aws logs tail /aws/lambda/$CAMERA_LAMBDA --follow"
echo ""

echo "✅ Unified GStreamer Pipeline & Camera Management System is ready!"
echo "🎯 All functionality consolidated into a single, production-ready system"
