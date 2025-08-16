#!/usr/bin/env python3
"""
Simple test script for the GStreamer Pipeline Generator API
"""

import requests
import json
import sys

def test_pipeline_api(rtsp_url):
    """Test the pipeline generator API with a given RTSP URL"""
    
    api_endpoint = "https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline"
    
    payload = {
        "rtsp_url": rtsp_url
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"🚀 Testing Pipeline Generator API")
    print(f"📹 RTSP URL: {rtsp_url}")
    print(f"🌐 API Endpoint: {api_endpoint}")
    print("-" * 60)
    
    try:
        # Make the API request
        response = requests.post(api_endpoint, json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ SUCCESS!")
            print(f"📊 Response Status: {response.status_code}")
            print("-" * 60)
            
            # Print stream analysis summary
            if 'stream_analysis' in result and 'summary' in result['stream_analysis']:
                summary = result['stream_analysis']['summary']
                print("📊 STREAM ANALYSIS:")
                print(f"   Video Streams: {summary.get('video_streams', 0)}")
                print(f"   Audio Streams: {summary.get('audio_streams', 0)}")
                print(f"   Video Codecs: {', '.join(summary.get('video_codecs', []))}")
                print(f"   Audio Codecs: {', '.join(summary.get('audio_codecs', []))}")
                print(f"   Resolutions: {', '.join(summary.get('resolutions', []))}")
                print()
            
            # Parse and display the generated pipeline
            if 'generated_pipeline' in result:
                try:
                    pipeline_data = json.loads(result['generated_pipeline'])
                    
                    print("🔧 GENERATED PIPELINE:")
                    print("-" * 40)
                    print(f"Pipeline: {pipeline_data.get('pipeline', 'N/A')}")
                    print()
                    
                    if 'explanation' in pipeline_data:
                        exp = pipeline_data['explanation']
                        print("📝 EXPLANATION:")
                        print(f"   Video: {exp.get('video_handling', 'N/A')}")
                        if exp.get('audio_handling'):
                            print(f"   Audio: {exp.get('audio_handling', 'N/A')}")
                        print()
                        
                        if 'optimizations' in exp and exp['optimizations']:
                            print("⚡ OPTIMIZATIONS:")
                            for opt in exp['optimizations']:
                                print(f"   • {opt}")
                            print()
                    
                    if 'alternative_pipelines' in pipeline_data and pipeline_data['alternative_pipelines']:
                        print("🔄 ALTERNATIVES:")
                        for alt in pipeline_data['alternative_pipelines']:
                            print(f"   • {alt.get('name', 'Alternative')}")
                            print(f"     Pipeline: {alt.get('pipeline', 'N/A')}")
                            print(f"     Use Case: {alt.get('use_case', 'N/A')}")
                        print()
                    
                    if 'testing_commands' in pipeline_data and pipeline_data['testing_commands']:
                        print("🧪 TESTING COMMANDS:")
                        for cmd in pipeline_data['testing_commands']:
                            print(f"   {cmd}")
                        print()
                
                except json.JSONDecodeError:
                    print("🔧 GENERATED PIPELINE (Raw):")
                    print(result['generated_pipeline'])
            
            # Show full JSON response if needed
            print("📄 FULL JSON RESPONSE:")
            print(json.dumps(result, indent=2))
            
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ ERROR: Request timed out")
    except requests.exceptions.RequestException as e:
        print(f"❌ ERROR: Request failed - {e}")
    except Exception as e:
        print(f"❌ ERROR: {e}")

def main():
    # Test URLs - you can modify these
    test_urls = [
        "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov",  # Public test stream
        "rtsp://your-camera-ip:554/stream",  # Replace with your camera
        "rtsp://admin:password@192.168.1.100:554/stream1"  # Example with auth
    ]
    
    if len(sys.argv) > 1:
        # Use URL from command line argument
        rtsp_url = sys.argv[1]
        test_pipeline_api(rtsp_url)
    else:
        # Use the first test URL
        print("No RTSP URL provided, using default test stream...")
        test_pipeline_api(test_urls[0])
        
        print("\n" + "="*60)
        print("💡 TIP: You can test with your own RTSP URL:")
        print(f"python3 {sys.argv[0]} 'rtsp://your-camera-ip:554/stream'")

if __name__ == "__main__":
    main()
