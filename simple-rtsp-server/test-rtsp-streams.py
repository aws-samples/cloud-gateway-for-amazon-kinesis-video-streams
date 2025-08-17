#!/usr/bin/env python3

import socket
import time
import sys
from urllib.parse import urlparse

def extract_sdp_from_rtsp(rtsp_url, timeout=10):
    """
    Extract SDP from RTSP stream using the same approach as the Lambda function
    """
    try:
        # Parse RTSP URL
        parsed = urlparse(rtsp_url)
        host = parsed.hostname or 'localhost'
        port = parsed.port or 554
        path = parsed.path or '/'
        
        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        
        try:
            # Connect to RTSP server
            sock.connect((host, port))
            
            # Send RTSP DESCRIBE request
            cseq = 1
            request = f"DESCRIBE {rtsp_url} RTSP/1.0\r\n"
            request += f"CSeq: {cseq}\r\n"
            request += "Accept: application/sdp\r\n"
            request += f"User-Agent: RTSP-Test-Client\r\n"
            request += "\r\n"
            
            sock.send(request.encode())
            
            # Read response
            response = b""
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                try:
                    data = sock.recv(4096)
                    if not data:
                        break
                    response += data
                    
                    # Check if we have complete response
                    if b"\r\n\r\n" in response:
                        # Look for SDP content after headers
                        parts = response.split(b"\r\n\r\n", 1)
                        if len(parts) > 1 and parts[1].strip():
                            break
                except socket.timeout:
                    break
            
            response_str = response.decode('utf-8', errors='ignore')
            
            # Check for successful response
            if "200 OK" not in response_str:
                return False, f"RTSP error: {response_str.split(chr(13))[0] if response_str else 'No response'}"
            
            # Extract SDP content
            if "\r\n\r\n" in response_str:
                headers, sdp_content = response_str.split("\r\n\r\n", 1)
                sdp_content = sdp_content.strip()
                
                if sdp_content and "v=" in sdp_content:
                    return True, sdp_content
                else:
                    return False, "No SDP content found in response"
            else:
                return False, "Invalid RTSP response format"
                
        finally:
            sock.close()
            
    except socket.timeout:
        return False, "Connection timeout"
    except ConnectionRefusedError:
        return False, "Connection refused - server not running?"
    except Exception as e:
        return False, f"Error: {str(e)}"

def parse_sdp_info(sdp_content):
    """
    Parse key information from SDP content
    """
    info = {
        'session_name': 'Unknown',
        'media_streams': []
    }
    
    lines = sdp_content.split('\n')
    current_media = None
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('s='):
            info['session_name'] = line[2:]
        elif line.startswith('m='):
            # Media description: m=<media> <port> <proto> <fmt>
            parts = line[2:].split()
            if len(parts) >= 4:
                current_media = {
                    'type': parts[0],  # video, audio
                    'port': parts[1],
                    'protocol': parts[2],
                    'format': parts[3],
                    'codec': 'Unknown'
                }
                info['media_streams'].append(current_media)
        elif line.startswith('a=rtpmap:') and current_media:
            # Codec information: a=rtpmap:<payload> <encoding>/<clock>
            parts = line[9:].split()
            if parts:
                codec_info = parts[0].split('/')
                current_media['codec'] = codec_info[0]
                if len(codec_info) > 1:
                    current_media['clock_rate'] = codec_info[1]
    
    return info

def test_rtsp_stream(stream_path, description):
    """
    Test a single RTSP stream
    """
    rtsp_url = f"rtsp://localhost:8554{stream_path}"
    print(f"Testing {description} ({stream_path}): ", end="", flush=True)
    
    success, result = extract_sdp_from_rtsp(rtsp_url, timeout=8)
    
    if success:
        # Parse SDP to get stream info
        sdp_info = parse_sdp_info(result)
        
        # Build summary
        media_summary = []
        for media in sdp_info['media_streams']:
            media_summary.append(f"{media['type']}:{media['codec']}")
        
        media_str = ", ".join(media_summary) if media_summary else "No media info"
        print(f"✅ Working - {media_str}")
        return True
    else:
        print(f"❌ Failed - {result}")
        return False

def main():
    print("🧪 Testing RTSP Streams using SDP Extraction")
    print("=" * 50)
    
    # Test streams
    streams = [
        ("/h264_720p_30fps", "H.264 720p 30fps"),
        ("/h264_480p_15fps_smpte", "H.264 480p 15fps SMPTE"),
        ("/h264_1080p_25fps", "H.264 1080p 25fps"),
        ("/h265_720p_30fps", "H.265 720p 30fps"),
        ("/h264_audio_720p", "H.264 + AAC Audio"),
        ("/h264_240p_15fps", "H.264 240p low-res")
    ]
    
    working_streams = 0
    total_streams = len(streams)
    
    for stream_path, description in streams:
        if test_rtsp_stream(stream_path, description):
            working_streams += 1
        time.sleep(1)  # Brief pause between tests
    
    print()
    print("📊 Test Results Summary:")
    print(f"Working streams: {working_streams}/{total_streams}")
    
    if working_streams == total_streams:
        print("🎉 All streams are working! Ready for AWS deployment.")
        return 0
    elif working_streams > 0:
        print("⚠️  Some streams are working. Check failed streams before deployment.")
        return 1
    else:
        print("❌ No streams are working. Check server configuration.")
        return 2

if __name__ == "__main__":
    sys.exit(main())
