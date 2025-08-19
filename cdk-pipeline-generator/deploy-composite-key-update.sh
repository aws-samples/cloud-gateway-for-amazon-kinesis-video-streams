#!/bin/bash

# Deploy Composite Key Update for Camera Management System
# This script deploys the updated DynamoDB schema and Lambda functions

set -e

echo "🚀 Deploying Composite Key Update for Camera Management System"
echo "=============================================================="

# Check if we're in the right directory
if [ ! -f "cdk.json" ]; then
    echo "❌ Error: Please run this script from the cdk-pipeline-generator directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

# Build the TypeScript code
echo "🔨 Building CDK application..."
npm run build

# Deploy the stack
echo "🚀 Deploying CDK stack with composite key changes..."
npx cdk deploy CameraManagementStack --require-approval never

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Summary of Changes:"
echo "======================"
echo "1. ✅ DynamoDB primary key changed from 'camera_id' to 'composite_key' (UUID#owner_id)"
echo "2. ✅ Added CameraIdIndex GSI for querying by camera_id"
echo "3. ✅ Updated Lambda functions to use composite key for all CRUD operations"
echo "4. ✅ Enhanced ownership validation through composite key structure"
echo "5. ✅ Added Camera List component to frontend navigation"
echo ""
echo "🔧 Next Steps:"
echo "=============="
echo "1. Update your frontend environment variables with the new API Gateway URL"
echo "2. Test the camera management functionality"
echo "3. Verify that existing cameras are migrated properly (if any)"
echo ""
echo "⚠️  Important Notes:"
echo "==================="
echo "- This update changes the DynamoDB table structure"
echo "- Existing camera data will need to be migrated to the new schema"
echo "- The composite key format is: {camera_id}#{owner_id}"
echo "- All camera operations now enforce ownership at the database level"
echo ""
echo "🧪 Testing:"
echo "==========="
echo "Run the test script to verify functionality:"
echo "./test-camera-api.py"
echo ""
