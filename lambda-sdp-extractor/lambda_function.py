import json
import boto3
import logging
import os
import socket
import base64
import re
import time
import hashlib
from urllib.parse import urlparse
from typing import Dict, Any, Optional, Tuple, List

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize Bedrock client
bedrock_agent_runtime = boto3.client('bedrock-agent-runtime')

def parse_rtsp_url(rtsp_url: str) -> Tuple[str, int, str, str, str, str]:
    """Parse RTSP URL to extract components"""
    parsed = urlparse(rtsp_url)
    
    host = parsed.hostname or 'localhost'
    port = parsed.port or 554
    username = parsed.username or ''
    password = parsed.password or ''
    path = parsed.path or '/'
    
    return host, port, username, password, path, rtsp_url

class AuthenticationChallenge:
    """Represents an authentication challenge from WWW-Authenticate header"""
    
    def __init__(self, method: str, parameters: Dict[str, str]):
        self.method = method.lower()
        self.parameters = parameters
        
    def __repr__(self):
        return f"AuthenticationChallenge(method='{self.method}', parameters={self.parameters})"

def parse_authentication_challenges(www_authenticate_headers: List[str]) -> List[AuthenticationChallenge]:
    """
    Parse WWW-Authenticate headers to extract all authentication challenges
    Supports multiple headers and multiple challenges per header
    """
    challenges = []
    
    for header in www_authenticate_headers:
        # Split header by authentication schemes (Basic, Digest, etc.)
        # Handle cases like: 'Basic realm="test", Digest realm="test" nonce="123"'
        
        # Find all authentication schemes
        scheme_pattern = r'(Basic|Digest|Bearer|NTLM|Negotiate)\s*([^,]*(?:,(?!\s*(?:Basic|Digest|Bearer|NTLM|Negotiate))[^,]*)*)'
        matches = re.findall(scheme_pattern, header, re.IGNORECASE)
        
        for method, params_str in matches:
            parameters = {}
            
            # Parse parameters for this authentication method
            param_pattern = r'(\w+)=(?:"([^"]+)"|([^,\s]+))'
            param_matches = re.findall(param_pattern, params_str)
            
            for param_match in param_matches:
                key = param_match[0]
                value = param_match[1] if param_match[1] else param_match[2]
                parameters[key] = value
            
            challenges.append(AuthenticationChallenge(method, parameters))
            logger.info(f"Detected authentication method: {method} with parameters: {list(parameters.keys())}")
    
    return challenges

def get_authentication_preference_order() -> List[str]:
    """
    Return authentication methods in order of preference (most secure first)
    """
    return ['digest', 'basic']  # Digest is more secure than Basic

def select_best_authentication_method(challenges: List[AuthenticationChallenge]) -> Optional[AuthenticationChallenge]:
    """
    Select the best authentication method from available challenges
    Returns the most secure method that we support
    """
    if not challenges:
        return None
    
    preference_order = get_authentication_preference_order()
    
    # Try to find the most preferred method that's available
    for preferred_method in preference_order:
        for challenge in challenges:
            if challenge.method == preferred_method:
                logger.info(f"Selected authentication method: {preferred_method}")
                return challenge
    
    # If no preferred method found, use the first available
    logger.warning(f"No preferred authentication method found, using: {challenges[0].method}")
    return challenges[0]

def create_basic_auth_header(username: str, password: str) -> str:
    """Create Basic authentication header"""
    if username and password:
        credentials = f"{username}:{password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return f"Authorization: Basic {encoded_credentials}\r\n"
    return ""

def create_digest_auth_header(username: str, password: str, method: str, uri: str, challenge: AuthenticationChallenge) -> str:
    """Create Digest authentication header from challenge"""
    realm = challenge.parameters.get('realm', '')
    nonce = challenge.parameters.get('nonce', '')
    qop = challenge.parameters.get('qop', '')
    algorithm = challenge.parameters.get('algorithm', 'MD5').upper()
    
    if algorithm != 'MD5':
        logger.warning(f"Unsupported digest algorithm: {algorithm}, falling back to MD5")
    
    # Calculate HA1
    ha1 = hashlib.md5(f"{username}:{realm}:{password}".encode()).hexdigest()
    
    # Calculate HA2
    ha2 = hashlib.md5(f"{method}:{uri}".encode()).hexdigest()
    
    # Calculate response
    if qop and 'auth' in qop:
        nc = "00000001"
        cnonce = hashlib.md5(str(time.time()).encode()).hexdigest()[:8]
        response = hashlib.md5(f"{ha1}:{nonce}:{nc}:{cnonce}:auth:{ha2}".encode()).hexdigest()
        
        auth_header = (
            f'Authorization: Digest username="{username}", '
            f'realm="{realm}", '
            f'nonce="{nonce}", '
            f'uri="{uri}", '
            f'response="{response}", '
            f'qop=auth, '
            f'nc={nc}, '
            f'cnonce="{cnonce}"'
        )
        
        if algorithm != 'MD5':
            auth_header += f', algorithm={algorithm}'
            
        auth_header += '\r\n'
    else:
        response = hashlib.md5(f"{ha1}:{nonce}:{ha2}".encode()).hexdigest()
        
        auth_header = (
            f'Authorization: Digest username="{username}", '
            f'realm="{realm}", '
            f'nonce="{nonce}", '
            f'uri="{uri}", '
            f'response="{response}"'
        )
        
        if algorithm != 'MD5':
            auth_header += f', algorithm={algorithm}'
            
        auth_header += '\r\n'
    
    return auth_header

def create_auth_header(challenge: AuthenticationChallenge, username: str, password: str, method: str, uri: str) -> str:
    """Create authentication header based on the challenge type"""
    if challenge.method == 'basic':
        return create_basic_auth_header(username, password)
    elif challenge.method == 'digest':
        return create_digest_auth_header(username, password, method, uri, challenge)
    else:
        logger.warning(f"Unsupported authentication method: {challenge.method}")
        # Fallback to basic auth
        return create_basic_auth_header(username, password)

def attempt_rtsp_authentication(sock: socket.socket, rtsp_url: str, username: str, password: str, 
                               challenge: AuthenticationChallenge, cseq: int) -> Tuple[bool, str, str]:
    """
    Attempt RTSP authentication with a specific method
    Returns: (success, response_string, error_message)
    """
    try:
        host, port, _, _, path, full_url = parse_rtsp_url(rtsp_url)
        
        # Create authentication header
        auth_header = create_auth_header(challenge, username, password, "DESCRIBE", full_url)
        
        # Send authenticated DESCRIBE request
        auth_request = (
            f"DESCRIBE {full_url} RTSP/1.0\r\n"
            f"CSeq: {cseq}\r\n"
            f"User-Agent: AWS-Lambda-RTSP-Client\r\n"
            f"Accept: application/sdp\r\n"
            f"{auth_header}"
            f"\r\n"
        )
        
        logger.info(f"Attempting {challenge.method.upper()} authentication")
        sock.send(auth_request.encode())
        
        # Receive authenticated response
        auth_response = b""
        bytes_received = 0
        
        while True:
            try:
                data = sock.recv(4096)
                if not data:
                    break
                
                auth_response += data
                bytes_received += len(data)
                
                # Check if we have complete response
                if b'\r\n\r\n' in auth_response:
                    response_str = auth_response.decode('utf-8', errors='ignore')
                    if 'Content-Length:' in response_str:
                        content_length_match = re.search(r'Content-Length:\s*(\d+)', response_str)
                        if content_length_match:
                            content_length = int(content_length_match.group(1))
                            header_end = auth_response.find(b'\r\n\r\n') + 4
                            current_content_length = len(auth_response) - header_end
                            
                            if current_content_length >= content_length:
                                break
                    else:
                        break
                        
            except socket.timeout:
                logger.warning(f"Socket timeout during {challenge.method} authentication")
                break
        
        auth_str = auth_response.decode('utf-8', errors='ignore')
        first_line = auth_str.split('\r\n')[0] if auth_str else "No response"
        
        logger.info(f"{challenge.method.upper()} authentication response: {first_line}")
        
        # Check if authentication was successful
        if '200 OK' in auth_str:
            logger.info(f"✅ {challenge.method.upper()} authentication successful")
            return True, auth_str, ""
        elif '401' in auth_str:
            return False, auth_str, f"{challenge.method.upper()} authentication failed: Invalid credentials"
        else:
            return False, auth_str, f"{challenge.method.upper()} authentication failed: {first_line}"
            
    except Exception as e:
        error_msg = f"{challenge.method.upper()} authentication error: {str(e)}"
        logger.error(error_msg)
        return False, "", error_msg

def get_sdp_via_rtsp(rtsp_url: str, timeout: int = 60) -> Tuple[str, Dict[str, Any]]:
    """
    Get SDP information by sending RTSP DESCRIBE request with automatic authentication detection
    """
    start_time = time.time()
    
    try:
        host, port, username, password, path, full_url = parse_rtsp_url(rtsp_url)
        
        logger.info(f"Connecting to RTSP server: {host}:{port} (timeout: {timeout}s)")
        
        # Create socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        
        try:
            connect_start = time.time()
            sock.connect((host, port))
            connect_time = time.time() - connect_start
            logger.info(f"Socket connection established in {connect_time:.2f}s")
            
            # Step 1: Send OPTIONS request (some servers require this)
            options_request = (
                f"OPTIONS {full_url} RTSP/1.0\r\n"
                f"CSeq: 1\r\n"
                f"User-Agent: AWS-Lambda-RTSP-Client\r\n"
                f"\r\n"
            )
            
            logger.info("Sending OPTIONS request")
            sock.send(options_request.encode())
            
            # Receive OPTIONS response
            options_response = b""
            while True:
                try:
                    data = sock.recv(1024)
                    if not data:
                        break
                    options_response += data
                    if b'\r\n\r\n' in options_response:
                        break
                except socket.timeout:
                    break
            
            options_str = options_response.decode('utf-8', errors='ignore')
            logger.info(f"OPTIONS response: {options_str.split()[1] if options_str else 'No response'}")
            
            # Step 2: Send DESCRIBE request without authentication to detect requirements
            describe_request = (
                f"DESCRIBE {full_url} RTSP/1.0\r\n"
                f"CSeq: 2\r\n"
                f"User-Agent: AWS-Lambda-RTSP-Client\r\n"
                f"Accept: application/sdp\r\n"
                f"\r\n"
            )
            
            logger.info("Sending initial DESCRIBE request to detect authentication requirements")
            sock.send(describe_request.encode())
            
            # Receive DESCRIBE response
            describe_response = b""
            while True:
                try:
                    data = sock.recv(1024)
                    if not data:
                        break
                    describe_response += data
                    if b'\r\n\r\n' in describe_response:
                        break
                except socket.timeout:
                    break
            
            describe_str = describe_response.decode('utf-8', errors='ignore')
            first_line = describe_str.split('\r\n')[0] if describe_str else "No response"
            logger.info(f"Initial DESCRIBE response: {first_line}")
            
            # Step 3: Handle authentication based on server response
            if '200 OK' in describe_str:
                # No authentication required!
                logger.info("✅ No authentication required")
                
                # Extract SDP content
                sdp_start = describe_str.find('\r\n\r\n')
                if sdp_start == -1:
                    raise Exception("No SDP content found in response")
                
                sdp_content = describe_str[sdp_start + 4:].strip()
                
                if not sdp_content or not sdp_content.startswith('v='):
                    raise Exception("Invalid SDP content received")
                
                total_time = time.time() - start_time
                logger.info(f"Successfully extracted SDP content in {total_time:.2f}s ({len(sdp_content)} chars)")
                
                # Parse SDP to extract stream information
                stream_info = parse_sdp_content(sdp_content)
                
                return sdp_content, stream_info
                
            elif '401' in describe_str and username and password:
                # Authentication required - detect and attempt authentication
                logger.info("🔐 Authentication required - detecting supported methods")
                
                # Extract all WWW-Authenticate headers
                www_auth_headers = re.findall(r'WWW-Authenticate:\s*(.+)', describe_str, re.IGNORECASE)
                
                if not www_auth_headers:
                    raise Exception("Server requires authentication but no WWW-Authenticate header found")
                
                logger.info(f"Found {len(www_auth_headers)} WWW-Authenticate header(s)")
                for i, header in enumerate(www_auth_headers):
                    logger.info(f"  Header {i+1}: {header}")
                
                # Parse authentication challenges
                challenges = parse_authentication_challenges(www_auth_headers)
                
                if not challenges:
                    raise Exception("No valid authentication challenges found in WWW-Authenticate headers")
                
                logger.info(f"Detected {len(challenges)} authentication method(s): {[c.method.upper() for c in challenges]}")
                
                # Try authentication methods in order of preference
                attempted_methods = []
                last_error = ""
                
                # Sort challenges by preference
                preference_order = get_authentication_preference_order()
                sorted_challenges = sorted(challenges, key=lambda c: preference_order.index(c.method) if c.method in preference_order else 999)
                
                for challenge in sorted_challenges:
                    success, response_str, error_msg = attempt_rtsp_authentication(
                        sock, rtsp_url, username, password, challenge, 3
                    )
                    
                    attempted_methods.append(challenge.method.upper())
                    
                    if success:
                        # Extract SDP content from successful response
                        sdp_start = response_str.find('\r\n\r\n')
                        if sdp_start == -1:
                            raise Exception("No SDP content found in authenticated response")
                        
                        sdp_content = response_str[sdp_start + 4:].strip()
                        
                        if not sdp_content or not sdp_content.startswith('v='):
                            raise Exception("Invalid SDP content received")
                        
                        total_time = time.time() - start_time
                        logger.info(f"Successfully extracted SDP content using {challenge.method.upper()} auth in {total_time:.2f}s ({len(sdp_content)} chars)")
                        
                        # Parse SDP to extract stream information
                        stream_info = parse_sdp_content(sdp_content)
                        
                        return sdp_content, stream_info
                    else:
                        last_error = error_msg
                        logger.warning(f"❌ {challenge.method.upper()} authentication failed: {error_msg}")
                
                # All authentication methods failed
                raise Exception(f"All authentication methods failed. Tried: {', '.join(attempted_methods)}. Last error: {last_error}")
                
            elif '401' in describe_str:
                raise Exception("Server requires authentication but no credentials provided")
            else:
                raise Exception(f"Unexpected server response: {first_line}")
            
        finally:
            sock.close()
            
    except socket.timeout:
        elapsed = time.time() - start_time
        raise Exception(f"Connection timeout to {host}:{port} after {elapsed:.2f}s")
    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"RTSP connection error after {elapsed:.2f}s: {e}")
        raise

def parse_sdp_content(sdp_content: str) -> Dict[str, Any]:
    """Parse SDP content to extract stream information"""
    logger.info("Parsing SDP content...")
    streams = []
    current_media = None
    
    lines = sdp_content.split('\n')
    logger.info(f"Processing {len(lines)} SDP lines")
    
    for line_num, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('m='):
            # Media description line
            if current_media:
                streams.append(current_media)
            
            parts = line.split()
            if len(parts) >= 4:
                media_type = parts[1]  # video, audio, etc.
                logger.info(f"Found media line {line_num}: {media_type} - {line}")
                current_media = {
                    'codec_type': media_type,
                    'media_line': line,
                    'attributes': []
                }
        
        elif line.startswith('a=') and current_media:
            # Attribute line
            current_media['attributes'].append(line)
            
            # Parse specific attributes
            if line.startswith('a=rtpmap:'):
                # Extract codec information
                rtpmap_match = re.search(r'a=rtpmap:\d+\s+([^/]+)', line)
                if rtpmap_match:
                    codec = rtpmap_match.group(1).lower()
                    current_media['codec_name'] = codec
                    logger.info(f"Detected codec: {codec} from {line}")
            
            elif line.startswith('a=fmtp:'):
                # Format parameters
                current_media['format_params'] = line
                logger.info(f"Format params: {line}")
    
    # Add the last media section
    if current_media:
        streams.append(current_media)
    
    logger.info(f"Parsed {len(streams)} media streams from SDP")
    
    # Convert to ffprobe-like format for compatibility
    formatted_streams = []
    for i, stream in enumerate(streams):
        formatted_stream = {
            'index': i,
            'codec_type': stream['codec_type'],
            'codec_name': stream.get('codec_name', 'unknown')
        }
        
        # Map common codec names
        codec_name = formatted_stream['codec_name']
        logger.info(f"Stream {i}: {stream['codec_type']} codec '{codec_name}'")
        
        if codec_name in ['h264', 'avc']:
            formatted_stream['codec_name'] = 'h264'
            formatted_stream['codec_long_name'] = 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10'
        elif codec_name in ['h265', 'hevc']:
            formatted_stream['codec_name'] = 'hevc'
            formatted_stream['codec_long_name'] = 'H.265 / HEVC (High Efficiency Video Coding)'
            logger.info("✅ Detected H.265/HEVC video codec!")
        elif codec_name in ['mpeg4-generic', 'aac']:
            formatted_stream['codec_name'] = 'aac'
            formatted_stream['codec_long_name'] = 'AAC (Advanced Audio Coding)'
        elif codec_name in ['pcmu', 'g711u']:
            formatted_stream['codec_name'] = 'pcm_mulaw'
            formatted_stream['codec_long_name'] = 'PCM mu-law / G.711 mu-law'
        elif codec_name in ['pcma', 'g711a']:
            formatted_stream['codec_name'] = 'pcm_alaw'
            formatted_stream['codec_long_name'] = 'PCM A-law / G.711 A-law'
        
        formatted_streams.append(formatted_stream)
    
    return {
        'format': {
            'format_name': 'rtsp',
            'format_long_name': 'RTSP (Real Time Streaming Protocol)'
        },
        'streams': formatted_streams
    }

def format_stream_analysis(stream_info: Dict[str, Any], sdp_content: str, rtsp_url: str) -> str:
    """Format the stream analysis into a structured format for the Bedrock agent."""
    analysis = {
        "rtsp_analysis": {
            "source_url": rtsp_url,
            "format_info": stream_info.get("format", {}),
            "streams": stream_info.get("streams", []),
            "sdp_content": sdp_content,
            "analysis_method": "DIRECT_RTSP_SDP_EXTRACTION_WITH_AUTO_AUTH_DETECTION"
        }
    }
    
    # Extract key information for easier processing
    video_streams = [s for s in analysis["rtsp_analysis"]["streams"] if s.get("codec_type") == "video"]
    audio_streams = [s for s in analysis["rtsp_analysis"]["streams"] if s.get("codec_type") == "audio"]
    
    analysis["summary"] = {
        "video_streams": len(video_streams),
        "audio_streams": len(audio_streams),
        "video_codecs": [s.get("codec_name") for s in video_streams],
        "audio_codecs": [s.get("codec_name") for s in audio_streams],
        "total_streams": len(analysis["rtsp_analysis"]["streams"])
    }
    
    return json.dumps(analysis, indent=2)

def invoke_bedrock_agent(stream_analysis: str, agent_id: str, agent_alias_id: str) -> str:
    """Invoke the Bedrock agent with the stream analysis to generate GStreamer pipeline."""
    try:
        prompt = f"""
Please analyze the following REAL RTSP stream information extracted via direct SDP analysis with automatic authentication detection and generate an appropriate GStreamer pipeline for ingesting this stream into Amazon Kinesis Video Streams.

Stream Analysis:
{stream_analysis}

Please provide a complete GStreamer pipeline configuration that:
1. Handles the detected codecs appropriately (pay special attention to H.265/HEVC vs H.264)
2. Includes proper decoder selection based on the ACTUAL stream format from SDP
3. Configures appropriate encoder settings for Kinesis Video Streams
4. Handles both video and audio streams if present
5. Includes error handling and buffering as needed

IMPORTANT: This is REAL stream data extracted from SDP using automatic authentication detection, not mock data. Please generate the pipeline based on the ACTUAL codecs detected in the SDP.

Return the response in JSON format with the pipeline string and explanation.
"""

        response = bedrock_agent_runtime.invoke_agent(
            agentId=agent_id,
            agentAliasId=agent_alias_id,
            sessionId=f"rtsp-auto-auth-{hash(stream_analysis) % 10000}",
            inputText=prompt
        )
        
        # Extract the response text
        response_text = ""
        for event in response['completion']:
            if 'chunk' in event:
                chunk = event['chunk']
                if 'bytes' in chunk:
                    response_text += chunk['bytes'].decode('utf-8')
        
        logger.info("Bedrock agent invoked successfully")
        return response_text
        
    except Exception as e:
        logger.error(f"Error invoking Bedrock agent: {e}")
        raise

def lambda_handler(event, context):
    """Main Lambda handler function - DIRECT RTSP SDP ANALYSIS with automatic authentication detection."""
    try:
        # Parse input
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        rtsp_url = body.get('rtsp_url')
        agent_id = body.get('agent_id', os.environ.get('BEDROCK_AGENT_ID'))
        agent_alias_id = body.get('agent_alias_id', os.environ.get('BEDROCK_AGENT_ALIAS_ID', 'TSTALIASID'))
        
        if not rtsp_url:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'rtsp_url is required'})
            }
        
        if not agent_id:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'agent_id is required (set BEDROCK_AGENT_ID environment variable)'})
            }
        
        logger.info(f"Processing RTSP URL: {rtsp_url} (AUTO AUTHENTICATION DETECTION)")
        
        # Extract REAL stream information via RTSP SDP with automatic authentication
        try:
            sdp_content, stream_info = get_sdp_via_rtsp(rtsp_url, timeout=60)
        except Exception as e:
            logger.error(f"Failed to extract SDP via RTSP: {e}")
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': f'Failed to analyze RTSP stream via SDP: {str(e)}',
                    'rtsp_url': rtsp_url,
                    'timestamp': context.aws_request_id,
                    'suggestion': 'Check if the RTSP URL is accessible and credentials are correct. The system automatically detects and tries all supported authentication methods.'
                })
            }
        
        # Format analysis for Bedrock agent
        stream_analysis = format_stream_analysis(stream_info, sdp_content, rtsp_url)
        
        # Invoke Bedrock agent to generate pipeline
        pipeline_response = invoke_bedrock_agent(stream_analysis, agent_id, agent_alias_id)
        
        # Return response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'rtsp_url': rtsp_url,
                'stream_analysis': json.loads(stream_analysis),
                'generated_pipeline': pipeline_response,
                'timestamp': context.aws_request_id,
                'analysis_method': 'DIRECT_RTSP_SDP_EXTRACTION_WITH_AUTO_AUTH_DETECTION'
            })
        }
        
    except Exception as e:
        logger.error(f"Lambda execution failed: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'timestamp': context.aws_request_id
            })
        }
