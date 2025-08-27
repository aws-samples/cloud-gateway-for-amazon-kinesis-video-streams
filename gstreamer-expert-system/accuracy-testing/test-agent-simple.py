#!/usr/bin/env python3
"""
Simple test script for GStreamer Bedrock Agent with single query.
"""

import boto3
import json
import uuid

# Configuration
AGENT_ID = "L60IDME1CM"
ALIAS_ID = "LOZ5ZB4MAS"  # Final working alias with Claude 3 Haiku
REGION = "us-east-1"

def main():
    print("🚀 Testing GStreamer Bedrock Agent (Simple Test)")
    print(f"🤖 Agent ID: {AGENT_ID}")
    print(f"🏷️  Alias ID: {ALIAS_ID}")
    
    # Initialize client with profile
    session = boto3.Session(profile_name='malone-aws')
    client = session.client('bedrock-agent-runtime', region_name=REGION)
    
    # Simple test query
    query = "Create a simple GStreamer pipeline to stream webcam video to a file"
    session_id = str(uuid.uuid4())
    
    print(f"\n🔍 Query: {query}")
    print(f"📋 Session: {session_id}")
    print("=" * 80)
    
    try:
        response = client.invoke_agent(
            agentId=AGENT_ID,
            agentAliasId=ALIAS_ID,
            sessionId=session_id,
            inputText=query
        )
        
        # Process streaming response
        print("📝 Response:")
        for event in response.get('completion', []):
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    chunk_text = chunk['bytes'].decode('utf-8')
                    print(chunk_text, end='', flush=True)
        
        print(f"\n\n✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    main()
