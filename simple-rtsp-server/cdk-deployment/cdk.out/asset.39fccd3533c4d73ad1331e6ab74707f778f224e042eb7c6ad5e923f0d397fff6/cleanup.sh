#!/bin/bash

# Cleanup script for serverless RTSP server CDK stack
set -e

echo "🧹 Cleaning up Serverless RTSP Server deployment..."

# Set AWS profile
export AWS_PROFILE=malone-aws
echo "🔧 Using AWS profile: $AWS_PROFILE"

# Set up Node.js version 22 via nvm
echo "🔧 Setting Node.js version to 22 via nvm..."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm use 22
echo "✅ Node.js version: $(node --version)"

# Change to the CDK directory
cd cdk-deployment

# Destroy the stack
echo "💥 Destroying serverless CDK stack..."
npm run destroy

echo "✅ Cleanup complete!"
echo ""
echo "💡 Note: The Docker images built during deployment may still exist in ECR."
echo "   You can manually delete them from the AWS Console if needed."
