#!/usr/bin/env python3
"""
Test script for dual-mode Lambda function
Tests both pipeline generation and stream characteristics analysis
"""

import requests
import json
import time
import sys

def test_pipeline_generation(rtsp_url, api_endpoint):
    """Test Mode 1: Pipeline Generation (original functionality)"""
    print("\n🔧 MODE 1: PIPELINE GENERATION")
    print("=" * 60)
    
    payload = {
        "rtsp_url": rtsp_url,
        "mode": "pipeline"
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        start_time = time.time()
        response = requests.post(f"{api_endpoint}/generate-pipeline", json=payload, headers=headers, timeout=120)
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ SUCCESS! ({elapsed_time:.1f}s)")
            print(f"📊 Analysis Method: {result.get('analysis_method', 'unknown')}")
            
            # Extract stream info
            stream_analysis = result.get('stream_analysis', {})
            summary = stream_analysis.get('summary', {})
            
            print(f"📺 Streams: {summary.get('total_streams', 0)} total")
            if summary.get('video_codecs'):
                print(f"🎥 Video: {', '.join(summary.get('video_codecs', []))}")
            if summary.get('audio_codecs'):
                print(f"🔊 Audio: {', '.join(summary.get('audio_codecs', []))}")
            
            # Show generated pipeline
            pipeline_data = result.get('generated_pipeline', '')
            if 'pipeline' in pipeline_data:
                try:
                    pipeline_json = json.loads(pipeline_data)
                    pipeline = pipeline_json.get('pipeline', 'Not found')
                    print(f"\n🔧 Generated Pipeline:")
                    print(f"   {pipeline[:100]}...")
                except:
                    print(f"\n🔧 Pipeline Response: {pipeline_data[:200]}...")
            
            return True
            
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
                print(f"   Type: {error_data.get('error_type', 'unknown')}")
                if error_data.get('suggestion'):
                    print(f"   Suggestion: {error_data.get('suggestion')}")
            except:
                print(f"   Response: {response.text[:200]}...")
            return False
                
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took longer than 120 seconds")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_stream_characteristics(rtsp_url, api_endpoint, capture_frame=False):
    """Test Mode 2: Stream Characteristics Analysis (new functionality)"""
    print("\n📊 MODE 2: STREAM CHARACTERISTICS ANALYSIS")
    print("=" * 60)
    
    payload = {
        "rtsp_url": rtsp_url,
        "mode": "characteristics",
        "capture_frame": capture_frame
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        start_time = time.time()
        response = requests.post(f"{api_endpoint}/generate-pipeline", json=payload, headers=headers, timeout=120)
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ SUCCESS! ({elapsed_time:.1f}s)")
            print(f"📊 Analysis Method: {result.get('analysis_method', 'unknown')}")
            
            # Extract stream characteristics
            characteristics = result.get('stream_characteristics', {})
            
            # Video information
            video = characteristics.get('video', {})
            if video.get('codec'):
                print(f"\n🎥 VIDEO:")
                print(f"   Codec: {video.get('codec')}")
                if video.get('resolution'):
                    print(f"   Resolution: {video.get('resolution')}")
                if video.get('framerate'):
                    print(f"   Framerate: {video.get('framerate')}")
                if video.get('bitrate'):
                    print(f"   Bitrate: {video.get('bitrate')}")
            
            # Audio information
            audio = characteristics.get('audio', {})
            if audio.get('codec'):
                print(f"\n🔊 AUDIO:")
                print(f"   Codec: {audio.get('codec')}")
                if audio.get('samplerate'):
                    print(f"   Sample Rate: {audio.get('samplerate')}")
                if audio.get('channels'):
                    print(f"   Channels: {audio.get('channels')}")
                if audio.get('bitrate'):
                    print(f"   Bitrate: {audio.get('bitrate')}")
            
            # Stream information
            stream_info = characteristics.get('stream_info', {})
            print(f"\n📺 STREAM INFO:")
            print(f"   Total Streams: {stream_info.get('total_streams', 0)}")
            print(f"   Video Streams: {stream_info.get('video_streams', 0)}")
            print(f"   Audio Streams: {stream_info.get('audio_streams', 0)}")
            
            if stream_info.get('title'):
                print(f"   Title: {stream_info.get('title')}")
            if stream_info.get('description'):
                print(f"   Description: {stream_info.get('description')}")
            if stream_info.get('server_info'):
                print(f"   Server: {stream_info.get('server_info')}")
            
            # Connection information
            connection = characteristics.get('connection', {})
            if connection.get('connection_time'):
                print(f"\n🔗 CONNECTION:")
                print(f"   Connection Time: {connection.get('connection_time')}")
                print(f"   Authentication: {connection.get('authentication_method', 'Unknown')}")
            
            # Diagnostics
            diagnostics = characteristics.get('diagnostics', {})
            if diagnostics.get('warnings'):
                print(f"\n⚠️  WARNINGS:")
                for warning in diagnostics.get('warnings', []):
                    print(f"   • {warning}")
            
            if diagnostics.get('errors'):
                print(f"\n❌ ERRORS:")
                for error in diagnostics.get('errors', []):
                    print(f"   • {error}")
            
            # Test frame information
            if result.get('test_frame_url'):
                print(f"\n📸 TEST FRAME:")
                print(f"   URL: {result.get('test_frame_url')}")
            elif result.get('test_frame_base64'):
                frame_size = len(result.get('test_frame_base64', ''))
                print(f"\n📸 TEST FRAME:")
                print(f"   Base64 Size: {frame_size} characters")
            
            return True
            
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
                print(f"   Type: {error_data.get('error_type', 'unknown')}")
                if error_data.get('suggestion'):
                    print(f"   Suggestion: {error_data.get('suggestion')}")
            except:
                print(f"   Response: {response.text[:200]}...")
            return False
                
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Request took longer than 120 seconds")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_dual_mode.py <rtsp_url> [api_endpoint]")
        print("Example: python3 test_dual_mode.py 'rtsp://user:pass@host/stream'")
        sys.exit(1)
    
    rtsp_url = sys.argv[1]
    api_endpoint = sys.argv[2] if len(sys.argv) > 2 else "https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod"
    
    print("🚀 DUAL-MODE LAMBDA FUNCTION TEST")
    print("=" * 60)
    print(f"📹 RTSP URL: {rtsp_url}")
    print(f"🌐 API Endpoint: {api_endpoint}")
    
    # Test both modes
    pipeline_success = test_pipeline_generation(rtsp_url, api_endpoint)
    characteristics_success = test_stream_characteristics(rtsp_url, api_endpoint, capture_frame=True)
    
    print(f"\n🎯 SUMMARY")
    print("=" * 60)
    print(f"Pipeline Generation: {'✅ SUCCESS' if pipeline_success else '❌ FAILED'}")
    print(f"Stream Characteristics: {'✅ SUCCESS' if characteristics_success else '❌ FAILED'}")
    
    if pipeline_success and characteristics_success:
        print("\n🎉 Both modes working perfectly!")
        print("Your dual-mode Lambda function is ready for:")
        print("  • Pipeline generation for existing workflows")
        print("  • Stream analysis for UI camera management")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")

if __name__ == "__main__":
    main()
