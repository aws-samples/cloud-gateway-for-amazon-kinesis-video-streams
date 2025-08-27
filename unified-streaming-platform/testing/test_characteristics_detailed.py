#!/usr/bin/env python3
"""
Comprehensive test script for detailed stream characteristics extraction
"""

import requests
import json
import sys

def test_detailed_characteristics(rtsp_url, api_endpoint):
    """Test detailed stream characteristics extraction"""
    print("🔍 COMPREHENSIVE STREAM CHARACTERISTICS TEST")
    print("=" * 70)
    
    payload = {
        "rtsp_url": rtsp_url,
        "mode": "characteristics",
        "capture_frame": False
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(f"{api_endpoint}/generate-pipeline", json=payload, headers=headers, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ SUCCESS: Detailed stream analysis complete")
            print(f"📊 Analysis Method: {result.get('analysis_method', 'unknown')}")
            
            chars = result.get('stream_characteristics', {})
            
            # Stream Information
            stream_info = chars.get('stream_info', {})
            print(f"\n📺 STREAM INFORMATION:")
            print(f"   Total Streams: {stream_info.get('total_streams', 0)}")
            print(f"   Video Streams: {stream_info.get('video_streams', 0)}")
            print(f"   Audio Streams: {stream_info.get('audio_streams', 0)}")
            
            if stream_info.get('title'):
                print(f"   Stream Title: {stream_info.get('title')}")
            if stream_info.get('description'):
                print(f"   Description: {stream_info.get('description')}")
            if stream_info.get('server_info'):
                print(f"   Server Software: {stream_info.get('server_info')}")
            
            # Video Details
            video = chars.get('video', {})
            if video:
                print(f"\n🎥 VIDEO CHARACTERISTICS:")
                if video.get('codec'):
                    print(f"   Codec: {video.get('codec')}")
                if video.get('framerate'):
                    print(f"   Frame Rate: {video.get('framerate')}")
                if video.get('bitrate'):
                    print(f"   Bitrate: {video.get('bitrate')}")
                if video.get('clock_rate'):
                    print(f"   Clock Rate: {video.get('clock_rate')}")
                if video.get('profile'):
                    print(f"   Profile ID: {video.get('profile')}")
                if video.get('resolution_info'):
                    print(f"   Resolution Info: {video.get('resolution_info')}")
            
            # Audio Details
            audio = chars.get('audio', {})
            if audio:
                print(f"\n🔊 AUDIO CHARACTERISTICS:")
                if audio.get('codec'):
                    print(f"   Codec: {audio.get('codec')}")
                if audio.get('sample_rate'):
                    print(f"   Sample Rate: {audio.get('sample_rate')}")
                if audio.get('channels'):
                    print(f"   Channels: {audio.get('channels')}")
                if audio.get('bitrate'):
                    print(f"   Bitrate: {audio.get('bitrate')}")
                if audio.get('profile'):
                    print(f"   Profile: {audio.get('profile')}")
                if audio.get('config'):
                    print(f"   Config: {audio.get('config')}")
            
            # Connection Information
            connection = chars.get('connection', {})
            if connection:
                print(f"\n🔗 CONNECTION DETAILS:")
                print(f"   Authentication: {connection.get('authentication_method', 'Unknown')}")
                if connection.get('connection_time'):
                    print(f"   Connection Time: {connection.get('connection_time')}")
            
            # Diagnostics
            diagnostics = chars.get('diagnostics', {})
            if diagnostics.get('warnings'):
                print(f"\n⚠️  WARNINGS:")
                for warning in diagnostics.get('warnings', []):
                    print(f"   • {warning}")
            
            if diagnostics.get('errors'):
                print(f"\n❌ ERRORS:")
                for error in diagnostics.get('errors', []):
                    print(f"   • {error}")
            
            # Raw SDP (first 200 chars)
            raw_sdp = chars.get('raw_sdp', '')
            if raw_sdp:
                print(f"\n📄 RAW SDP (first 200 chars):")
                print(f"   {raw_sdp[:200]}...")
            
            print(f"\n🎯 SUMMARY FOR UI INTEGRATION:")
            print(f"   • Stream is {'✅ VALID' if stream_info.get('total_streams', 0) > 0 else '❌ INVALID'}")
            print(f"   • Video: {'✅ ' + video.get('codec', 'Unknown') if video.get('codec') else '❌ No video'}")
            print(f"   • Audio: {'✅ ' + audio.get('codec', 'Unknown') if audio.get('codec') else '❌ No audio'}")
            print(f"   • Quality: {video.get('framerate', 'Unknown fps')} @ {video.get('bitrate', 'Unknown bitrate')}")
            
            return True
            
        else:
            print(f"❌ FAILED: HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error Type: {error_data.get('error_type', 'unknown')}")
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
                if error_data.get('suggestion'):
                    print(f"   Suggestion: {error_data.get('suggestion')}")
            except:
                print(f"   Response: {response.text[:200]}...")
            return False
                
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_characteristics_detailed.py <rtsp_url> [api_endpoint]")
        print("Example: python3 test_characteristics_detailed.py 'rtsp://user:pass@host/stream'")
        sys.exit(1)
    
    rtsp_url = sys.argv[1]
    api_endpoint = sys.argv[2] if len(sys.argv) > 2 else "https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod"
    
    print(f"📹 RTSP URL: {rtsp_url}")
    print(f"🌐 API Endpoint: {api_endpoint}")
    
    success = test_detailed_characteristics(rtsp_url, api_endpoint)
    
    if success:
        print("\n🎉 Detailed characteristics extraction working perfectly!")
        print("Ready for UI camera management integration.")
    else:
        print("\n⚠️  Test failed. Check the errors above.")

if __name__ == "__main__":
    main()
