#!/usr/bin/env python3

import boto3
import json
import time
import uuid

def test_priority_hierarchy():
    """Test that the agent follows the correct priority hierarchy"""
    
    # Create session with profile, then create client
    session = boto3.Session(profile_name='malone-aws')
    client = session.client('bedrock-agent-runtime', region_name='us-east-1')
    
    agent_id = 'L60IDME1CM'
    alias_id = 'LOZ5ZB4MAS'
    
    # Test scenario that should trigger priority hierarchy
    test_scenario = {
        "name": "Priority Hierarchy Test",
        "description": "Should follow: 1) Media introspection challenge, 2) Context gathering, 3) Solution",
        "question": "I want to stream my RTSP camera to YouTube Live using the best quality possible.",
        "expected_behaviors": [
            "Request media introspection first (gst-discoverer-1.0 or similar)",
            "Ask for platform/hardware context second", 
            "Promise optimized solution after receiving information",
            "NOT provide immediate pipeline without introspection"
        ]
    }
    
    print(f"🧪 TESTING PRIORITY HIERARCHY")
    print("=" * 60)
    print(f"\n🔬 Test: {test_scenario['name']}")
    print(f"📝 Description: {test_scenario['description']}")
    print(f"❓ Question: {test_scenario['question']}")
    
    try:
        # Invoke the agent
        response = client.invoke_agent(
            agentId=agent_id,
            agentAliasId=alias_id,
            sessionId=str(uuid.uuid4()),
            inputText=test_scenario['question']
        )
        
        # Collect the response
        agent_response = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    agent_response += chunk['bytes'].decode('utf-8')
        
        print(f"\n🤖 Agent Response:")
        print("-" * 40)
        print(agent_response)
        print("-" * 40)
        
        # Analyze response for priority hierarchy
        response_lower = agent_response.lower()
        
        # Check for Priority 1: Media introspection challenge
        priority1_indicators = [
            "gst-discoverer-1.0",
            "introspect",
            "analyze",
            "understand your",
            "first",
            "before",
            "let's first",
            "characteristics",
            "discover",
            "rtsp stream"
        ]
        
        # Check for Priority 2: Context gathering  
        priority2_indicators = [
            "platform",
            "operating system",
            "hardware",
            "while you're running",
            "also need",
            "environment",
            "context"
        ]
        
        # Check for Priority 3: Solution promise (not immediate solution)
        priority3_indicators = [
            "once i have",
            "after",
            "then i'll",
            "optimized solution",
            "based on",
            "i'll provide"
        ]
        
        # Check for anti-patterns (immediate solutions without introspection)
        antipattern_indicators = [
            "gst-launch-1.0 rtspsrc",
            "use this pipeline",
            "here's the pipeline",
            "rtmpsink location="
        ]
        
        # Score the response
        priority1_score = sum(1 for indicator in priority1_indicators if indicator in response_lower)
        priority2_score = sum(1 for indicator in priority2_indicators if indicator in response_lower)  
        priority3_score = sum(1 for indicator in priority3_indicators if indicator in response_lower)
        antipattern_score = sum(1 for indicator in antipattern_indicators if indicator in response_lower)
        
        print(f"\n✅ Priority Analysis:")
        print(f"   🥇 Priority 1 (Media Introspection): {priority1_score} indicators found")
        print(f"   🥈 Priority 2 (Context Gathering): {priority2_score} indicators found")
        print(f"   🥉 Priority 3 (Solution Promise): {priority3_score} indicators found")
        print(f"   ❌ Anti-patterns (Immediate Solutions): {antipattern_score} found")
        
        # Calculate success rate
        success_criteria = [
            priority1_score >= 2,  # Strong introspection challenge
            priority2_score >= 2,  # Context gathering request
            priority3_score >= 1,  # Promise of optimized solution
            antipattern_score == 0  # No immediate solutions
        ]
        
        success_rate = (sum(success_criteria) / len(success_criteria)) * 100
        
        print(f"\n📊 Detailed Analysis:")
        for i, (criterion, met) in enumerate(zip([
            "Strong media introspection challenge",
            "Context gathering request", 
            "Promise of optimized solution",
            "No immediate pipeline solutions"
        ], success_criteria), 1):
            status = "✅ PASS" if met else "❌ FAIL"
            print(f"   {status} Priority {i}: {criterion}")
        
        print(f"\n📊 Priority Hierarchy Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 75:
            print("🎉 EXCELLENT: Agent follows proper priority hierarchy!")
        elif success_rate >= 50:
            print("⚠️ PARTIAL: Agent partially follows hierarchy, needs improvement")
        else:
            print("❌ POOR: Agent does not follow priority hierarchy")
            
        return success_rate
        
    except Exception as e:
        print(f"❌ Error testing agent: {e}")
        return 0.0

if __name__ == "__main__":
    success_rate = test_priority_hierarchy()
    print(f"\n🎯 Final Priority Hierarchy Score: {success_rate:.1f}%")
