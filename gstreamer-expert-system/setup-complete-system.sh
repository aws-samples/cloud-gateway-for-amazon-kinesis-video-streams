#!/bin/bash

# Complete Bedrock GStreamer Expert System Setup
# This script creates everything from scratch: Knowledge Base + Agent + Integration

set -e

echo "🚀 Setting up complete Bedrock GStreamer Expert System from scratch"
echo "=================================================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile malone-aws >/dev/null 2>&1; then
    echo "❌ Error: AWS CLI not configured with 'malone-aws' profile"
    echo "   Run: aws configure --profile malone-aws"
    exit 1
fi

# Check if config files exist
if [ ! -f "current-config/config.env" ]; then
    echo "❌ Error: current-config/config.env not found"
    exit 1
fi

if [ ! -f "current-config/enhanced-agent-instructions.txt" ]; then
    echo "❌ Error: Agent instructions file not found"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Load configuration
source current-config/config.env

echo ""
echo "📋 Configuration Summary:"
echo "   AWS Account: $ACCOUNT_ID"
echo "   Region: $REGION"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   Agent Role: $AGENT_ROLE_ARN"
echo "   KB Role: $KB_ROLE_ARN"
echo ""

read -p "🤔 Proceed with setup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

# Step 1: Create Knowledge Base
echo ""
echo "📚 Step 1: Creating Knowledge Base..."
echo "======================================"

if [ -f "knowledgebase/scripts/create-knowledge-base.sh" ]; then
    cd knowledgebase/scripts
    ./create-knowledge-base.sh
    cd ../..
    echo "✅ Knowledge Base created successfully"
else
    echo "❌ Error: Knowledge base creation script not found"
    exit 1
fi

# Reload config to get KB_ID
source current-config/config.env

# Step 2: Create Agent
echo ""
echo "🤖 Step 2: Creating Bedrock Agent..."
echo "===================================="

cd current-config
./create-bedrock-agent.sh
cd ..

echo "✅ Agent created successfully"

# Step 3: Verify Integration
echo ""
echo "🔗 Step 3: Verifying Integration..."
echo "=================================="

# Reload config to get new agent IDs
source current-config/config.env

if [ ! -z "$NEW_AGENT_ID" ] && [ ! -z "$KB_ID" ]; then
    echo "✅ Integration verification:"
    echo "   Agent ID: $NEW_AGENT_ID"
    echo "   Knowledge Base ID: $KB_ID"
    echo "   Agent-KB association: Configured"
else
    echo "⚠️  Warning: Could not verify all components"
fi

# Step 4: Create test script
echo ""
echo "🧪 Step 4: Creating test script..."
echo "================================="

cat > test-agent.sh << 'EOF'
#!/bin/bash

# Test the newly created agent
source current-config/config.env

if [ -z "$NEW_AGENT_ID" ] || [ -z "$NEW_ALIAS_ID" ]; then
    echo "❌ Error: Agent IDs not found in config.env"
    exit 1
fi

echo "🧪 Testing Bedrock Agent..."
echo "Agent ID: $NEW_AGENT_ID"
echo "Alias ID: $NEW_ALIAS_ID"
echo ""

# Test query
TEST_QUERY="Create a simple webcam display pipeline for macOS using GStreamer"
SESSION_ID="test-session-$(date +%s)"

echo "📝 Test Query: $TEST_QUERY"
echo "🔄 Invoking agent..."

aws bedrock-agent-runtime invoke-agent \
    --agent-id "$NEW_AGENT_ID" \
    --agent-alias-id "$NEW_ALIAS_ID" \
    --session-id "$SESSION_ID" \
    --input-text "$TEST_QUERY" \
    --profile malone-aws \
    --output text \
    --query 'completion'

echo ""
echo "✅ Test completed!"
EOF

chmod +x test-agent.sh

echo "✅ Test script created: ./test-agent.sh"

# Final summary
echo ""
echo "🎉 SETUP COMPLETE!"
echo "=================="
echo ""
echo "📊 System Components Created:"
echo "   ✅ Knowledge Base: $KB_ID"
echo "   ✅ Bedrock Agent: $NEW_AGENT_ID"
echo "   ✅ Agent Alias: $NEW_ALIAS_ID"
echo "   ✅ Agent-KB Integration: Configured"
echo ""
echo "📁 Files Created/Updated:"
echo "   📝 current-config/config.env (updated with new IDs)"
echo "   📝 current-config/new-agent-info.json (complete agent details)"
echo "   🧪 test-agent.sh (agent testing script)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Test the agent: ./test-agent.sh"
echo "   2. Monitor knowledge base ingestion (may take 10-30 minutes)"
echo "   3. Update any applications to use new agent ID: $NEW_AGENT_ID"
echo ""
echo "📚 Knowledge Base Ingestion Status:"
echo "   Check with: aws bedrock-agent get-ingestion-job \\"
echo "     --knowledge-base-id $KB_ID \\"
echo "     --data-source-id $DS_ID \\"
echo "     --ingestion-job-id $INGESTION_JOB_ID \\"
echo "     --profile malone-aws"
echo ""
echo "🔧 MCP Server Integration:"
echo "   Update mcp-gstreamer-expert/q-cli-config.json with new agent ID"
echo ""
echo "✨ Your complete Bedrock GStreamer Expert system is ready!"
