#!/bin/bash

# Cleanup Existing Bedrock Resources
# Use this script to remove existing agent and knowledge base before recreating

set -e

echo "🧹 Cleaning up existing Bedrock resources..."
echo "============================================"

# Load configuration
source current-config/config.env

echo "📋 Current Configuration:"
echo "   Agent ID: ${AGENT_ID:-'Not set'}"
echo "   Alias ID: ${ALIAS_ID:-'Not set'}"
echo "   Knowledge Base ID: ${KB_ID:-'Not set'}"
echo "   Data Source ID: ${DS_ID:-'Not set'}"
echo ""

read -p "⚠️  This will DELETE existing resources. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleanup cancelled."
    exit 0
fi

# Cleanup Agent (if exists)
if [ ! -z "$AGENT_ID" ]; then
    echo "🤖 Cleaning up agent..."
    
    # Delete agent alias (if exists)
    if [ ! -z "$ALIAS_ID" ]; then
        echo "   Deleting agent alias: $ALIAS_ID"
        aws bedrock-agent delete-agent-alias \
            --agent-id "$AGENT_ID" \
            --agent-alias-id "$ALIAS_ID" \
            --profile malone-aws || echo "   ⚠️  Alias deletion failed (may not exist)"
    fi
    
    # Delete agent
    echo "   Deleting agent: $AGENT_ID"
    aws bedrock-agent delete-agent \
        --agent-id "$AGENT_ID" \
        --skip-resource-in-use-check \
        --profile malone-aws || echo "   ⚠️  Agent deletion failed (may not exist)"
    
    echo "✅ Agent cleanup completed"
else
    echo "ℹ️  No agent ID found - skipping agent cleanup"
fi

# Cleanup Knowledge Base (if exists)
if [ ! -z "$KB_ID" ]; then
    echo "📚 Cleaning up knowledge base..."
    
    # Delete data source (if exists)
    if [ ! -z "$DS_ID" ]; then
        echo "   Deleting data source: $DS_ID"
        aws bedrock-agent delete-data-source \
            --knowledge-base-id "$KB_ID" \
            --data-source-id "$DS_ID" \
            --profile malone-aws || echo "   ⚠️  Data source deletion failed (may not exist)"
    fi
    
    # Delete knowledge base
    echo "   Deleting knowledge base: $KB_ID"
    aws bedrock-agent delete-knowledge-base \
        --knowledge-base-id "$KB_ID" \
        --profile malone-aws || echo "   ⚠️  Knowledge base deletion failed (may not exist)"
    
    echo "✅ Knowledge base cleanup completed"
else
    echo "ℹ️  No knowledge base ID found - skipping KB cleanup"
fi

# Create backup of current config
echo "💾 Creating backup of current configuration..."
cp current-config/config.env current-config/config.env.backup.$(date +%Y%m%d_%H%M%S)

# Clear the IDs from config.env (but keep other settings)
echo "🔧 Clearing resource IDs from config.env..."
sed -i.bak '/^AGENT_ID=/d; /^ALIAS_ID=/d; /^KB_ID=/d; /^DS_ID=/d; /^INGESTION_JOB_ID=/d; /^NEW_AGENT_ID=/d; /^NEW_ALIAS_ID=/d' current-config/config.env

echo ""
echo "🎉 Cleanup Complete!"
echo "==================="
echo ""
echo "📝 Actions Taken:"
echo "   ✅ Existing agent deleted (if found)"
echo "   ✅ Existing knowledge base deleted (if found)"
echo "   ✅ Resource IDs cleared from config.env"
echo "   💾 Configuration backed up"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run ./setup-complete-system.sh to recreate everything"
echo "   2. Or run individual scripts:"
echo "      - knowledgebase/scripts/create-knowledge-base.sh"
echo "      - current-config/create-bedrock-agent.sh"
echo ""
echo "⚠️  Note: It may take a few minutes for AWS to fully process the deletions"
echo "   If you get 'resource in use' errors, wait 5-10 minutes and try again"
