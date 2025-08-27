#!/usr/bin/env python3

import boto3
import json
import uuid
from datetime import datetime

def load_config():
    """Load configuration from config.env file"""
    config = {}
    try:
        with open('config.env', 'r') as f:
            for line in f:
                if '=' in line and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    config[key] = value
    except FileNotFoundError:
        print("Error: config.env file not found. Run setup scripts first.")
        exit(1)
    return config

def test_agent(agent_id, alias_id, test_query):
    """Test the Bedrock agent with a query"""
    client = boto3.client('bedrock-agent-runtime', profile_name='malone-aws')
    session_id = str(uuid.uuid4())
    
    print(f"Testing agent with query: {test_query}")
    print("=" * 60)
    
    try:
        response = client.invoke_agent(
            agentId=agent_id,
            agentAliasId=alias_id,
            sessionId=session_id,
            inputText=test_query
        )
        
        # Process streaming response
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    text = chunk['bytes'].decode('utf-8')
                    print(text, end='', flush=True)
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"Error invoking agent: {e}")

def main():
    config = load_config()
    
    required_keys = ['AGENT_ID', 'ALIAS_ID']
    for key in required_keys:
        if key not in config:
            print(f"Error: {key} not found in config.env")
            exit(1)
    
    agent_id = config['AGENT_ID']
    alias_id = config['ALIAS_ID']
    
    print(f"GStreamer Expert Agent Test")
    print(f"Agent ID: {agent_id}")
    print(f"Alias ID: {alias_id}")
    print(f"Time: {datetime.now()}")
    print()
    
    # Test queries
    test_queries = [
        "Create a GStreamer pipeline to stream webcam video to Amazon Kinesis Video Streams",
        "Write a C++ application that uses OpenVINO to detect objects in a video stream",
        "Show me how to use NVIDIA hardware acceleration for H.264 encoding in GStreamer",
        "Create a Python script that captures video from a camera and applies real-time filters",
        "How do I debug GStreamer pipeline issues and check element capabilities?"
    ]
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n{'='*20} Test {i} {'='*20}")
        test_agent(agent_id, alias_id, query)
        
        if i < len(test_queries):
            input("\nPress Enter to continue to next test...")

if __name__ == "__main__":
    main()
