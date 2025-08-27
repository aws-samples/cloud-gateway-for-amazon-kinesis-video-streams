"""
RTSP Stream Analysis Module
Extracted from original lambda-sdp-extractor for enhanced pipeline generator
"""

import socket
import re
import time
import logging
from urllib.parse import urlparse
from typing import Dict, Any, Optional, Tuple, List

logger = logging.getLogger(__name__)

def parse_rtsp_url(rtsp_url: str) -> Tuple[str, int, str, str, str, str]:
    """Parse RTSP URL to extract components"""
    parsed = urlparse(rtsp_url)
    
    host = parsed.hostname or 'localhost'
    port = parsed.port or 554
    username = parsed.username or ''
    password = parsed.password or ''
    path = parsed.path or '/'
    
    return host, port, username, password, path, rtsp_url

def analyze_rtsp_stream(rtsp_url: str, capture_frame: bool = False, timeout: int = 30) -> Dict[str, Any]:
    """
    Analyze RTSP stream and return characteristics
    Simplified version for enhanced pipeline generator
    """
    try:
        # Parse URL
        host, port, username, password, path, full_url = parse_rtsp_url(rtsp_url)
        
        logger.info(f"Analyzing RTSP stream: {host}:{port}")
        
        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        
        try:
            # Connect to server
            connect_start = time.time()
            sock.connect((host, port))
            connect_time = time.time() - connect_start
            
            # Send DESCRIBE request
            describe_request = (
                f"DESCRIBE {full_url} RTSP/1.0\r\n"
                f"CSeq: 1\r\n"
                f"User-Agent: Enhanced-Pipeline-Generator\r\n"
                f"Accept: application/sdp\r\n"
            )
            
            # Add authentication if provided
            if username and password:
                import base64
                credentials = base64.b64encode(f"{username}:{password}".encode()).decode()
                describe_request += f"Authorization: Basic {credentials}\r\n"
            
            describe_request += "\r\n"
            
            sock.send(describe_request.encode())
            
            # Receive response
            response = b""
            while True:
                try:
                    data = sock.recv(4096)
                    if not data:
                        break
                    response += data
                    if b'\r\n\r\n' in response:
                        break
                except socket.timeout:
                    break
            
            response_str = response.decode('utf-8', errors='ignore')
            
            # Check if successful
            if '200 OK' not in response_str:
                return {
                    'error': f'RTSP request failed: {response_str.split()[1] if response_str else "No response"}',
                    'connection_time': f"{connect_time:.2f}s"
                }
            
            # Extract SDP content
            sdp_start = response_str.find('\r\n\r\n')
            if sdp_start == -1:
                return {
                    'error': 'No SDP content found in response',
                    'connection_time': f"{connect_time:.2f}s"
                }
            
            sdp_content = response_str[sdp_start + 4:].strip()
            
            # Parse SDP content
            stream_info = parse_sdp_content(sdp_content)
            stream_info['connection'] = {
                'connection_time': f"{connect_time:.2f}s",
                'authentication_method': 'Basic' if username else 'None'
            }
            
            # Add frame capture if requested
            if capture_frame and OPENCV_AVAILABLE:
                try:
                    frame_info = capture_frame_opencv(rtsp_url, timeout=10)
                    stream_info['frame_capture'] = frame_info
                except Exception as e:
                    logger.warning(f"Frame capture failed: {e}")
                    stream_info['frame_capture'] = {'error': str(e)}
            
            return stream_info
            
        finally:
            sock.close()
            
    except Exception as e:
        logger.error(f"RTSP analysis failed: {e}")
        return {
            'error': f'RTSP analysis failed: {str(e)}',
            'suggestion': 'Check RTSP URL, network connectivity, and credentials'
        }

def parse_sdp_content(sdp_content: str) -> Dict[str, Any]:
    """Parse SDP content to extract stream characteristics"""
    
    stream_info = {
        'video': {},
        'audio': {},
        'session': {}
    }
    
    try:
        lines = sdp_content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Session information
            if line.startswith('s='):
                stream_info['session']['name'] = line[2:]
            elif line.startswith('i='):
                stream_info['session']['description'] = line[2:]
            
            # Media information
            elif line.startswith('m='):
                # Parse media line: m=video 0 RTP/AVP 96
                parts = line.split()
                if len(parts) >= 4:
                    media_type = parts[1]
                    if media_type == 'video':
                        stream_info['video']['media_type'] = 'video'
                        stream_info['video']['payload_type'] = parts[3] if len(parts) > 3 else 'unknown'
                    elif media_type == 'audio':
                        stream_info['audio']['media_type'] = 'audio'
                        stream_info['audio']['payload_type'] = parts[3] if len(parts) > 3 else 'unknown'
            
            # Attribute lines
            elif line.startswith('a='):
                attr = line[2:]
                
                # RTP map attributes
                if attr.startswith('rtpmap:'):
                    # Parse rtpmap: rtpmap:96 H264/90000
                    parts = attr.split()
                    if len(parts) >= 2:
                        payload_info = parts[1].split('/')
                        if len(payload_info) >= 2:
                            codec = payload_info[0]
                            sample_rate = payload_info[1]
                            
                            # Determine if video or audio based on codec
                            if codec.upper() in ['H264', 'H265', 'HEVC', 'VP8', 'VP9', 'MJPEG']:
                                stream_info['video']['codec'] = codec.upper()
                                stream_info['video']['sample_rate'] = sample_rate
                            elif codec.upper() in ['PCMU', 'PCMA', 'AAC', 'OPUS', 'G722']:
                                stream_info['audio']['codec'] = codec.upper()
                                stream_info['audio']['sample_rate'] = sample_rate
                
                # Format-specific parameters
                elif attr.startswith('fmtp:'):
                    # Parse format parameters
                    parts = attr.split(' ', 1)
                    if len(parts) == 2:
                        params = parts[1]
                        
                        # Extract common parameters
                        if 'profile-level-id' in params:
                            profile_match = re.search(r'profile-level-id=([^;]+)', params)
                            if profile_match:
                                if 'video' not in stream_info:
                                    stream_info['video'] = {}
                                stream_info['video']['profile'] = profile_match.group(1)
        
        # Set default values and clean up
        if stream_info['video']:
            if 'codec' not in stream_info['video']:
                stream_info['video']['codec'] = 'Unknown'
            stream_info['video']['bitrate'] = 'Variable'
            stream_info['video']['framerate'] = 'Variable'
            stream_info['video']['resolution_info'] = 'Available in stream'
        
        if stream_info['audio']:
            if 'codec' not in stream_info['audio']:
                stream_info['audio']['codec'] = 'Unknown'
            stream_info['audio']['bitrate'] = 'Variable'
        
        # Remove empty sections
        stream_info = {k: v for k, v in stream_info.items() if v}
        
        return stream_info
        
    except Exception as e:
        logger.error(f"SDP parsing failed: {e}")
        return {
            'error': f'SDP parsing failed: {str(e)}',
            'raw_sdp': sdp_content[:500] + '...' if len(sdp_content) > 500 else sdp_content
        }

def capture_frame_opencv(rtsp_url: str, timeout: int = 30) -> Dict[str, Any]:
    """Capture frame using OpenCV"""
    
    if not OPENCV_AVAILABLE:
        return {'error': 'OpenCV not available'}
    
    try:
        import cv2
        import base64
        
        # Open video capture
        cap = cv2.VideoCapture(rtsp_url)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        if not cap.isOpened():
            return {'error': 'Failed to open RTSP stream'}
        
        # Capture frame
        start_time = time.time()
        ret, frame = cap.read()
        capture_time = (time.time() - start_time) * 1000  # Convert to milliseconds
        
        if not ret:
            cap.release()
            return {'error': 'Failed to capture frame'}
        
        # Get frame dimensions
        height, width = frame.shape[:2]
        
        # Resize frame if too large
        max_width = int(os.environ.get('FRAME_WIDTH', '640'))
        if width > max_width:
            scale = max_width / width
            new_width = max_width
            new_height = int(height * scale)
            frame = cv2.resize(frame, (new_width, new_height))
        
        # Encode frame as JPEG
        quality = int(os.environ.get('JPEG_QUALITY', '85'))
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        ret, buffer = cv2.imencode('.jpg', frame, encode_param)
        
        if not ret:
            cap.release()
            return {'error': 'Failed to encode frame'}
        
        # Convert to base64
        frame_base64 = base64.b64encode(buffer).decode('utf-8')
        
        cap.release()
        
        return {
            'width': frame.shape[1],
            'height': frame.shape[0],
            'original_width': width,
            'original_height': height,
            'format': 'JPEG',
            'size_bytes': len(buffer),
            'capture_time_ms': capture_time,
            'extraction_method': 'OpenCV',
            'frame_data': frame_base64
        }
        
    except Exception as e:
        return {'error': f'Frame capture failed: {str(e)}'}

# Import OpenCV availability from main module
try:
    import cv2
    OPENCV_AVAILABLE = True
except ImportError:
    OPENCV_AVAILABLE = False
    cv2 = None

import os
