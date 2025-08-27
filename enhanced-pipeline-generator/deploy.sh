#!/bin/bash

# Enhanced GStreamer Pipeline Generator Deployment Script
# Phase 7: Cloud Gateway Integration

set -e

echo "🚀 Enhanced GStreamer Pipeline Generator Deployment"
echo "=================================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is required but not installed"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Set Docker to use legacy builder (required for Lambda compatibility)
echo "🐳 Configuring Docker for Lambda compatibility..."
export DOCKER_BUILDKIT=0

# Bootstrap CDK if needed
echo "🏗️  Bootstrapping CDK (if needed)..."
npx cdk bootstrap

# Deploy the stack
echo "🚀 Deploying Enhanced Pipeline Generator Stack..."
npm run deploy

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📊 Stack Outputs:"
npx cdk list --long

echo ""
echo "🎯 Next Steps:"
echo "1. Test the enhanced API endpoints"
echo "2. Verify knowledge base integration"
echo "3. Test OpenCV frame extraction"
echo "4. Update frontend to use enhanced capabilities"
echo ""
echo "📚 Documentation: See README.md for usage examples"
