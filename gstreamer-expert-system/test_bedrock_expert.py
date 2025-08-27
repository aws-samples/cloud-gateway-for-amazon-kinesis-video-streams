#!/usr/bin/env python3
"""
Test the enhanced Bedrock GStreamer Expert functionality
"""

import asyncio
import sys
import os

# Add the mcp-gstreamer-expert directory to path
sys.path.append('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert')

from bedrock_gstreamer_expert import BedrockGStreamerExpert

async def test_kvs_pipeline_issue():
    """Test with the user's specific KVS pipeline issue"""
    
    user_query = '''This GStreamer pipeline fails to initialize when trying to stream both audio and video from RTSP to Kinesis Video Streams:

gst-launch-1.0 rtspsrc location="rtsp://rtspgateway:qOjicr6ro7ER@192.168.4.119/Preview_05_main" name=src \\
src. ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! kvssink name=sink stream-name="rtsp-test-stream-final" aws-region="us-east-1" \\
src. ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,stream-format=raw ! sink.

The pipeline fails to initialize. How do I fix this to properly stream both video and audio to KVS?'''

    print("🧪 TESTING ENHANCED BEDROCK GSTREAMER EXPERT")
    print("=" * 60)
    
    # Initialize expert
    expert = BedrockGStreamerExpert()
    
    # Test context analysis
    print("\n🔍 CONTEXT ANALYSIS:")
    print("-" * 30)
    context = expert.analyze_context(user_query)
    
    for key, value in context.items():
        print(f"  {key}: {value}")
    
    # Test immediate solution generation
    print("\n🔧 IMMEDIATE SOLUTION:")
    print("-" * 30)
    immediate_solution = expert.generate_immediate_solution(context, user_query)
    print(immediate_solution)
    
    # Test knowledge base querying
    print("\n📚 KNOWLEDGE BASE QUERY:")
    print("-" * 30)
    try:
        relevant_docs = await expert.query_knowledge_base(context, user_query)
        print(f"Retrieved {len(relevant_docs)} relevant documents")
        
        if relevant_docs:
            print("\nTop 3 most relevant:")
            for i, doc in enumerate(relevant_docs[:3]):
                print(f"  {i+1}. Score: {doc['score']:.3f} - {doc['content'][:100]}...")
        else:
            print("No relevant documents found")
            
    except Exception as e:
        print(f"KB query failed: {e}")
    
    # Test Claude Opus query
    print("\n🚀 CLAUDE OPUS 4.1 QUERY:")
    print("-" * 30)
    try:
        relevant_docs = await expert.query_knowledge_base(context, user_query)
        claude_response = await expert.query_claude_opus(user_query, context, relevant_docs[:3])
        print("Claude Opus Response:")
        print(claude_response[:500] + "..." if len(claude_response) > 500 else claude_response)
        
    except Exception as e:
        print(f"Claude Opus query failed: {e}")
    
    # Test comprehensive solution
    print("\n🎯 COMPREHENSIVE SOLUTION:")
    print("-" * 30)
    try:
        comprehensive_solution = await expert.get_comprehensive_solution(user_query)
        print("Comprehensive solution generated successfully!")
        print(f"Length: {len(comprehensive_solution)} characters")
        
        # Show first part
        print("\nFirst 800 characters:")
        print(comprehensive_solution[:800] + "...")
        
    except Exception as e:
        print(f"Comprehensive solution failed: {e}")
        import traceback
        traceback.print_exc()

async def test_simple_query():
    """Test with a simple query"""
    
    print("\n" + "=" * 60)
    print("🧪 TESTING SIMPLE WEBCAM QUERY")
    print("=" * 60)
    
    simple_query = "How do I create a simple GStreamer pipeline to display webcam video on macOS?"
    
    expert = BedrockGStreamerExpert()
    
    # Test context analysis
    context = expert.analyze_context(simple_query)
    print(f"\nContext: {context}")
    
    # Test immediate solution
    immediate_solution = expert.generate_immediate_solution(context, simple_query)
    print(f"\nImmediate Solution:\n{immediate_solution}")

if __name__ == "__main__":
    # Set AWS profile
    os.environ['AWS_PROFILE'] = 'malone-aws'
    os.environ['AWS_REGION'] = 'us-east-1'
    
    print("🚀 Starting Enhanced Bedrock GStreamer Expert Tests")
    
    # Run tests
    asyncio.run(test_kvs_pipeline_issue())
    asyncio.run(test_simple_query())
    
    print("\n✅ Testing complete!")
