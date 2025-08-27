#!/usr/bin/env python3

import boto3
import json
import time
import uuid

def test_gstreamer_agent():
    """Test the enhanced GStreamer agent with challenging scenarios"""
    
    # Create session with profile, then create client
    session = boto3.Session(profile_name='malone-aws')
    client = session.client('bedrock-agent-runtime', region_name='us-east-1')
    
    agent_id = 'L60IDME1CM'
    alias_id = 'LOZ5ZB4MAS'
    
    # Test scenarios that exposed previous accuracy issues
    test_scenarios = [
        {
            "name": "Context Gathering Test",
            "description": "Should ask for platform, hardware, and implementation details",
            "question": "I want to stream webcam video to RTMP server with the best performance possible.",
            "expected_behaviors": [
                "Ask for operating system",
                "Ask for hardware details (CPU/GPU)",
                "Ask for implementation approach (CLI vs code)",
                "Ask for GStreamer version"
            ]
        },
        {
            "name": "Element Compatibility Test", 
            "description": "Should correctly identify videoscale cannot process encoded streams",
            "question": "I have an H.265 RTSP stream that I want to scale down from 4K to 1080p using videoscale before sending to kvssink. What's the pipeline?",
            "expected_behaviors": [
                "Explain videoscale requires raw video input",
                "Show proper decode→scale→encode pipeline",
                "Mention codec private data implications"
            ]
        },
        {
            "name": "Codec Private Data Reality Test",
            "description": "Should explain codec private data preservation is impossible",
            "question": "My HLS playback works with the original stream but fails after x265enc transcoding. How can I configure x265enc to preserve the original codec private data for HLS compatibility?",
            "expected_behaviors": [
                "Clearly state this is technically impossible",
                "Explain why encoders always create new codec private data",
                "Suggest valid alternatives (passthrough vs accepting new codec data)"
            ]
        },
        {
            "name": "Non-Existent Element Test",
            "description": "Should correct hlssink to hlssink2",
            "question": "Show me a GStreamer pipeline using hlssink to create HLS segments from an RTSP stream.",
            "expected_behaviors": [
                "Correct hlssink to hlssink2",
                "Provide working HLS pipeline",
                "Not reference fictional elements"
            ]
        },
        {
            "name": "Platform-Specific Element Test",
            "description": "Should ask for platform and provide appropriate elements",
            "question": "Create a pipeline to capture video using v4l2src and encode with hardware acceleration.",
            "expected_behaviors": [
                "Ask what platform/OS they're using",
                "Explain v4l2src is Linux-specific",
                "Provide platform-appropriate alternatives"
            ]
        },
        {
            "name": "Complex Multi-Issue Test",
            "description": "Should identify and correct multiple technical issues",
            "question": "I'm on macOS and need a pipeline that uses v4l2src to capture 4K video, then uses videoscale directly on the H.265 encoded stream to reduce to 1080p, and finally uses hlssink with preserved original codec private data for HLS compatibility.",
            "expected_behaviors": [
                "Correct v4l2src to avfvideosrc for macOS",
                "Explain videoscale cannot process encoded streams",
                "Correct hlssink to hlssink2",
                "Explain codec private data preservation is impossible",
                "Provide valid alternative pipeline"
            ]
        }
    ]
    
    print("🧪 TESTING ENHANCED GSTREAMER AGENT ACCURACY")
    print("=" * 60)
    print()
    
    results = []
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"🔬 Test {i}/{len(test_scenarios)}: {scenario['name']}")
        print(f"📝 Description: {scenario['description']}")
        print(f"❓ Question: {scenario['question']}")
        print()
        
        session_id = str(uuid.uuid4())
        
        try:
            # Invoke the agent
            response = client.invoke_agent(
                agentId=agent_id,
                agentAliasId=alias_id,
                sessionId=session_id,
                inputText=scenario['question']
            )
            
            # Collect the response
            response_text = ""
            for event in response['completion']:
                if 'chunk' in event:
                    chunk = event['chunk']
                    if 'bytes' in chunk:
                        response_text += chunk['bytes'].decode('utf-8')
            
            print("🤖 Agent Response:")
            print("-" * 40)
            print(response_text)
            print("-" * 40)
            print()
            
            # Analyze response against expected behaviors
            print("✅ Expected Behaviors Check:")
            behavior_results = []
            for behavior in scenario['expected_behaviors']:
                # Simple keyword-based analysis (could be enhanced)
                behavior_found = any(keyword.lower() in response_text.lower() 
                                   for keyword in behavior.split()[:3])  # Check first 3 words
                status = "✅ FOUND" if behavior_found else "❌ MISSING"
                print(f"   {status}: {behavior}")
                behavior_results.append(behavior_found)
            
            success_rate = sum(behavior_results) / len(behavior_results) * 100
            print(f"📊 Success Rate: {success_rate:.1f}%")
            print()
            
            results.append({
                'scenario': scenario['name'],
                'success_rate': success_rate,
                'response': response_text,
                'behaviors': behavior_results
            })
            
        except Exception as e:
            print(f"❌ Error testing scenario: {e}")
            results.append({
                'scenario': scenario['name'],
                'success_rate': 0,
                'error': str(e)
            })
        
        print("=" * 60)
        print()
        
        # Brief pause between tests
        time.sleep(2)
    
    # Summary
    print("📊 OVERALL TEST RESULTS:")
    print()
    
    total_success = sum(r.get('success_rate', 0) for r in results) / len(results)
    print(f"🎯 Overall Success Rate: {total_success:.1f}%")
    print()
    
    for result in results:
        rate = result.get('success_rate', 0)
        status = "✅ PASS" if rate >= 75 else "⚠️ PARTIAL" if rate >= 50 else "❌ FAIL"
        print(f"{status} {result['scenario']}: {rate:.1f}%")
    
    print()
    print("💡 RECOMMENDATIONS:")
    if total_success >= 80:
        print("   🎉 Agent accuracy significantly improved!")
        print("   ✅ Ready for production use")
    elif total_success >= 60:
        print("   📈 Good improvement, minor adjustments needed")
        print("   🔧 Consider additional instruction refinements")
    else:
        print("   🚨 Major issues still present")
        print("   🔄 Requires further instruction updates or Knowledge Base changes")
    
    return results

if __name__ == "__main__":
    results = test_gstreamer_agent()
