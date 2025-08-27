#!/usr/bin/env python3
"""
Quick test script to verify both agent configurations are working.
This runs a simple test query against both the original agent and the KB-enabled agent.
"""

import boto3
import json
import uuid
import sys
import os

def load_config(config_file='config.env'):
    """Load configuration from environment file."""
    config = {}
    try:
        with open(config_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    config[key] = value
        return config
    except FileNotFoundError:
        print(f"❌ Configuration file {config_file} not found!")
        return None

def test_agent(bedrock_agent, agent_id, alias_id, query, alias_name):
    """Test a single agent configuration."""
    print(f"\n🔄 Testing {alias_name} (Alias: {alias_id})")
    print(f"Query: {query}")
    print("-" * 50)
    
    try:
        response = bedrock_agent.invoke_agent(
            agentId=agent_id,
            agentAliasId=alias_id,
            sessionId=str(uuid.uuid4()),
            inputText=query
        )
        
        # Collect the streaming response
        full_response = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    full_response += chunk['bytes'].decode('utf-8')
        
        print("✅ Response received:")
        print(full_response[:300] + "..." if len(full_response) > 300 else full_response)
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    print("🧪 Quick Agent Configuration Test")
    print("=" * 40)
    
    # Set AWS profile
    os.environ['AWS_PROFILE'] = 'malone-aws'
    
    # Load configuration
    config = load_config()
    if not config:
        sys.exit(1)
    
    # Check required configuration
    required_keys = ['REGION', 'AGENT_ID', 'ALIAS_ID']
    missing_keys = [key for key in required_keys if key not in config]
    
    if missing_keys:
        print(f"❌ Missing required configuration: {', '.join(missing_keys)}")
        sys.exit(1)
    
    # Initialize Bedrock client
    try:
        bedrock_agent = boto3.client('bedrock-agent-runtime', region_name=config['REGION'])
        print(f"✅ Connected to Bedrock in region: {config['REGION']}")
    except Exception as e:
        print(f"❌ Failed to connect to Bedrock: {str(e)}")
        sys.exit(1)
    
    # Simple test query
    test_query = "Create a simple GStreamer pipeline to play an MP4 file"
    
    # Test original agent (without KB)
    success_without_kb = test_agent(
        bedrock_agent, 
        config['AGENT_ID'], 
        config['ALIAS_ID'], 
        test_query,
        "Agent WITHOUT Knowledge Base"
    )
    
    # Test KB-enabled agent if available
    success_with_kb = False
    if 'KB_ALIAS_ID' in config:
        success_with_kb = test_agent(
            bedrock_agent, 
            config['AGENT_ID'], 
            config['KB_ALIAS_ID'], 
            test_query,
            "Agent WITH Knowledge Base"
        )
    else:
        print(f"\n⚠️  KB_ALIAS_ID not found in config.")
        print("   Knowledge Base setup is still needed.")
    
    # Summary
    print("\n" + "=" * 50)
    print("📋 TEST SUMMARY")
    print("=" * 50)
    
    if success_without_kb:
        print("✅ Agent without KB: Working")
    else:
        print("❌ Agent without KB: Failed")
    
    if 'KB_ALIAS_ID' in config:
        if success_with_kb:
            print("✅ Agent with KB: Working")
        else:
            print("❌ Agent with KB: Failed")
    else:
        print("⚠️  Agent with KB: Not configured yet")
    
    if success_without_kb and success_with_kb:
        print("\n🎉 Both agents are working! Ready for comparison testing.")
        print("   Run: python3 compare-agent-performance.py --detailed")
    elif success_without_kb and 'KB_ALIAS_ID' not in config:
        print("\n📚 Original agent working. Knowledge Base setup still needed.")
        print("   We'll work on the KB setup next.")
    elif success_without_kb:
        print("\n⚠️  Original agent working, but KB agent has issues.")
        print("   Check Knowledge Base configuration and ingestion status.")
    else:
        print("\n❌ Issues detected. Check AWS credentials and agent configuration.")

if __name__ == "__main__":
    main()
