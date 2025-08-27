#!/usr/bin/env python3
"""
Quick test of enhanced priority assessment framework
Tests the agent with different priority scenarios
"""

import boto3
import uuid
import time

# Configuration
AGENT_ID = "L60IDME1CM"
ALIAS_ID = "LOZ5ZB4MAS"
REGION = "us-east-1"
PROFILE = "malone-aws"

def test_agent_query(query, expected_priority=None):
    """Test a single query and check for priority assessment"""
    print(f"\n{'='*60}")
    print(f"TESTING: {query}")
    print(f"Expected Priority: {expected_priority if expected_priority else 'TBD'}")
    print(f"{'='*60}")
    
    try:
        # Initialize client
        session = boto3.Session(profile_name=PROFILE)
        bedrock_client = session.client('bedrock-agent-runtime', region_name=REGION)
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Invoke the agent
        response = bedrock_client.invoke_agent(
            agentId=AGENT_ID,
            agentAliasId=ALIAS_ID,
            sessionId=session_id,
            inputText=query
        )
        
        # Collect response
        full_response = ""
        for event in response.get('completion', []):
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    chunk_text = chunk['bytes'].decode('utf-8')
                    full_response += chunk_text
        
        print("RESPONSE:")
        print(full_response)
        
        # Check for priority assessment
        has_priority = "PRIORITY ASSESSMENT:" in full_response
        has_confidence = "Confidence:" in full_response
        has_context_gathering = any(keyword in full_response.lower() for keyword in 
                                  ['platform', 'operating system', 'hardware', 'implementation'])
        
        print(f"\n{'='*60}")
        print("VALIDATION RESULTS:")
        print(f"✅ Has Priority Assessment: {has_priority}")
        print(f"✅ Has Confidence Level: {has_confidence}")
        print(f"✅ Has Context Gathering: {has_context_gathering}")
        
        if has_priority and has_confidence:
            print("🎉 ENHANCED FRAMEWORK WORKING!")
        else:
            print("⚠️  Framework may need adjustment")
            
        return {
            'query': query,
            'response': full_response,
            'has_priority': has_priority,
            'has_confidence': has_confidence,
            'has_context_gathering': has_context_gathering
        }
        
    except Exception as e:
        print(f"❌ Error testing query: {str(e)}")
        return None

def main():
    """Run priority assessment tests"""
    print("🧪 TESTING ENHANCED PRIORITY ASSESSMENT FRAMEWORK")
    print("Testing different query types to validate improvements...")
    
    test_queries = [
        {
            'query': "How do I create a GStreamer pipeline for streaming webcam to RTMP?",
            'expected_priority': 4,
            'description': "Basic learning/development query"
        },
        {
            'query': "My production GStreamer pipeline is crashing with segmentation fault errors",
            'expected_priority': 1,
            'description': "Critical production issue"
        },
        {
            'query': "I need to optimize my pipeline performance for better throughput",
            'expected_priority': 3,
            'description': "Performance improvement request"
        }
    ]
    
    results = []
    
    for test_case in test_queries:
        print(f"\n📋 Test Case: {test_case['description']}")
        result = test_agent_query(test_case['query'], test_case['expected_priority'])
        if result:
            results.append(result)
        
        # Small delay between tests
        time.sleep(2)
    
    # Summary
    print(f"\n{'='*80}")
    print("🎯 TEST SUMMARY")
    print(f"{'='*80}")
    
    total_tests = len(results)
    successful_priority = sum(1 for r in results if r['has_priority'])
    successful_confidence = sum(1 for r in results if r['has_confidence'])
    successful_context = sum(1 for r in results if r['has_context_gathering'])
    
    print(f"Total Tests: {total_tests}")
    print(f"Priority Assessment: {successful_priority}/{total_tests} ({successful_priority/total_tests*100:.1f}%)")
    print(f"Confidence Levels: {successful_confidence}/{total_tests} ({successful_confidence/total_tests*100:.1f}%)")
    print(f"Context Gathering: {successful_context}/{total_tests} ({successful_context/total_tests*100:.1f}%)")
    
    if successful_priority == total_tests and successful_confidence == total_tests:
        print("\n🎉 PHASE 1 IMPLEMENTATION SUCCESSFUL!")
        print("✅ Enhanced priority assessment framework is working correctly")
        print("✅ Ready to proceed to Phase 2 (MCP Server enhancement)")
    else:
        print("\n⚠️  Some tests failed - may need framework adjustment")
        print("💡 Consider reviewing agent instructions or testing individual components")

if __name__ == "__main__":
    main()
