#!/usr/bin/env python3

import gi
gi.require_version('Gst', '1.0')
gi.require_version('GstRtspServer', '1.0')
from gi.repository import Gst, GstRtspServer, GLib
import threading
import time
import hashlib
import base64
import itertools
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import socket

class RTSPURLHandler(BaseHTTPRequestHandler):
    """HTTP handler to serve RTSP URL information"""
    
    def do_GET(self):
        if self.path == '/rtsp-urls' or self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')  # Enable CORS
            self.end_headers()
            
            # Get the server's public IP
            try:
                # Try to get public IP from metadata service (works in AWS)
                import urllib.request
                public_ip = urllib.request.urlopen('http://169.254.169.254/latest/meta-data/public-ipv4', timeout=2).read().decode()
            except:
                # Fallback to local IP
                try:
                    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    s.connect(("8.8.8.8", 80))
                    public_ip = s.getsockname()[0]
                    s.close()
                except:
                    public_ip = "localhost"
            
            # Get RTSP URLs from the server instance
            rtsp_urls = self.server.rtsp_server_instance.get_all_rtsp_urls(public_ip)
            
            response = {
                "server_info": {
                    "name": "RTSP Test Server",
                    "version": "1.0",
                    "public_ip": public_ip,
                    "total_streams": len(rtsp_urls)
                },
                "rtsp_urls": rtsp_urls
            }
            
            self.wfile.write(json.dumps(response, indent=2).encode())
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def log_message(self, format, *args):
        # Suppress HTTP server logs to keep output clean
        pass

class RTSPTestServer:
    def __init__(self):
        Gst.init(None)
        
        # Store all created streams for REST API
        self.all_streams = []
        
        # Define practical codec matrix (removed obsolete legacy codecs)
        self.video_codecs = {
            'h264': {
                'encoder': 'x264enc',
                'payloader': 'rtph264pay',
                'pt': 96,
                'description': 'H.264/AVC',
                'bitrate_calc': self.calculate_h264_bitrate
            },
            'h265': {
                'encoder': 'x265enc', 
                'payloader': 'rtph265pay',
                'pt': 96,
                'description': 'H.265/HEVC',
                'bitrate_calc': self.calculate_h265_bitrate
            },
            'mpeg4': {
                'encoder': 'avenc_mpeg4',
                'payloader': 'rtpmp4vpay',
                'pt': 96,
                'description': 'MPEG-4 Part 2',
                'bitrate_calc': self.calculate_mpeg4_bitrate
            },
            'mpeg2': {
                'encoder': 'avenc_mpeg2video',
                'payloader': 'rtpmpvpay',
                'pt': 32,
                'description': 'MPEG-2 Video',
                'bitrate_calc': self.calculate_mpeg2_bitrate
            },
            'mjpeg': {
                'encoder': 'jpegenc',
                'payloader': 'rtpjpegpay',
                'pt': 26,
                'description': 'Motion JPEG',
                'bitrate_calc': None  # Quality-based
            },
            'theora': {
                'encoder': 'theoraenc',
                'payloader': 'rtptheorapay',
                'pt': 96,
                'description': 'Theora',
                'bitrate_calc': self.calculate_theora_bitrate
            }
        }
        
        self.resolutions = [
            {'name': '360p', 'width': 640, 'height': 360},
            {'name': '480p', 'width': 854, 'height': 480},
            {'name': '720p', 'width': 1280, 'height': 720},
            {'name': '1080p', 'width': 1920, 'height': 1080}
        ]
        
        self.framerates = [10, 15, 20, 25, 30]
        self.audio_codecs = ['none', 'aac', 'g711', 'g726']
        
        # Create multiple RTSP servers
        self.servers = {}
        self.create_servers()
        
    def create_servers(self):
        """Create RTSP servers for different codec categories"""
        
        # Modern codecs server - Port 8554
        self.servers['modern'] = {
            'server': GstRtspServer.RTSPServer(),
            'port': '8554',
            'auth_type': 'none',
            'description': 'Modern Codecs (H.264, H.265)',
            'credentials': None,
            'codecs': ['h264', 'h265']
        }
        
        # MPEG codecs server - Port 8555
        self.servers['mpeg'] = {
            'server': GstRtspServer.RTSPServer(),
            'port': '8555',
            'auth_type': 'none',
            'description': 'MPEG Codecs (MPEG-2, MPEG-4)',
            'credentials': None,
            'codecs': ['mpeg4', 'mpeg2']
        }
        
        # MJPEG server - Port 8556 (dedicated for debugging)
        self.servers['mjpeg'] = {
            'server': GstRtspServer.RTSPServer(),
            'port': '8556',
            'auth_type': 'none',
            'description': 'MJPEG (IP Camera Standard)',
            'credentials': None,
            'codecs': ['mjpeg']
        }
        
        # Open source codecs server - Port 8557
        self.servers['opensource'] = {
            'server': GstRtspServer.RTSPServer(),
            'port': '8557',
            'auth_type': 'none',
            'description': 'Open Source Codecs (Theora)',
            'credentials': None,
            'codecs': ['theora']
        }
        
        # Configure each server
        for name, config in self.servers.items():
            self.configure_server(name, config)
            
    def configure_server(self, name, config):
        """Configure individual RTSP server"""
        server = config['server']
        server.set_service(config['port'])
        mounts = server.get_mount_points()
        
        # Add codec-specific streams
        self.add_codec_streams(mounts, name, config)
        
    def add_codec_streams(self, mounts, server_name, config):
        """Add streams for each codec supported by this server"""
        
        streams = []
        codecs = config['codecs']
        
        for codec in codecs:
            if codec not in self.video_codecs:
                continue
                
            # Add test streams for each codec
            streams.extend(self.get_codec_test_streams(codec, server_name, config))
        
        # Add all streams to the server
        for stream in streams:
            try:
                factory = GstRtspServer.RTSPMediaFactory()
                factory.set_launch(stream['pipeline'])
                factory.set_shared(True)
                mounts.add_factory(stream['path'], factory)
                
                # Store stream info for REST API
                stream_info = {
                    'path': stream['path'],
                    'description': stream['description'],
                    'codec': stream['codec'],
                    'resolution': stream['resolution'],
                    'framerate': stream['framerate'],
                    'audio': stream['audio'],
                    'port': config['port'],
                    'server_name': server_name
                }
                self.all_streams.append(stream_info)
                
                print(f"✅ Added {stream['description']} to {server_name} server at {stream['path']}")
            except Exception as e:
                print(f"❌ Failed to add {stream['description']}: {e}")
    
    def get_codec_test_streams(self, codec, server_name, config):
        """Generate test streams for a specific codec"""
        streams = []
        codec_info = self.video_codecs[codec]
        
        # Basic resolution/framerate combinations for each codec
        if codec == 'mjpeg':
            # MJPEG specific configurations - simplified for debugging
            test_combinations = [
                ('360p', 10, 'none'),
                ('480p', 15, 'none'), 
                ('720p', 20, 'none'),
                ('360p', 10, 'g711'),  # IP camera typical
            ]
        else:
            # Standard combinations for other codecs
            test_combinations = [
                ('360p', 15, 'none'),
                ('480p', 20, 'none'), 
                ('720p', 25, 'none'),
                ('360p', 15, 'aac'),  # With audio
            ]
        
        for res, fps, audio in test_combinations:
            path = f'/{codec}_{res}_{fps}fps'
            if audio != 'none':
                path += f'_{audio}'
                
            streams.append(self.create_stream_config(
                codec, res, fps, audio, server_name, config, path
            ))
        
        return streams
    
    def create_stream_config(self, codec, resolution, framerate, audio, server_name, config, path):
        """Create a stream configuration for specified parameters"""
        
        # Get resolution details
        res_info = next((r for r in self.resolutions if r['name'] == resolution), self.resolutions[1])
        width = res_info['width']
        height = res_info['height']
        
        # Create description
        codec_info = self.video_codecs[codec]
        description = f"{codec_info['description']} {resolution} {framerate}fps"
        if audio != 'none':
            description += f" + {audio.upper()}"
        
        # Create pipeline
        pipeline = self.create_codec_pipeline(codec, width, height, framerate, audio, server_name, config, description)
        
        return {
            'path': path,
            'pipeline': pipeline,
            'description': description,
            'codec': codec,
            'resolution': resolution,
            'framerate': framerate,
            'audio': audio
        }
    
    def create_codec_pipeline(self, codec, width, height, framerate, audio, server_name, config, description):
        """Create GStreamer pipeline for specified codec"""
        
        auth_info = config['description']
        port = config['port']
        
        # Choose test pattern based on codec
        patterns = {
            'h264': 'smpte75', 'h265': 'zone-plate', 'mpeg4': 'smpte',
            'mpeg2': 'solid-color', 'mjpeg': 'ball', 'theora': 'circular'
        }
        pattern = patterns.get(codec, 'smpte75')
        
        # Video pipeline base with memory optimization
        video_pipeline = (
            f"videotestsrc pattern={pattern} ! "
            f"video/x-raw,width={width},height={height},framerate={framerate}/1 ! "
            f"queue max-size-buffers=10 max-size-time=1000000000 ! "  # 1 second buffer limit
            f"textoverlay text='{description}\\nServer: {server_name}\\nAuth: {auth_info}\\nPort: {port}\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 14' ! "
            f"queue max-size-buffers=5 max-size-time=500000000 ! "  # 0.5 second buffer limit
        )
        
        # Add codec-specific encoding
        codec_info = self.video_codecs[codec]
        encoder = codec_info['encoder']
        payloader = codec_info['payloader']
        pt = codec_info['pt']
        
        if codec == 'h264':
            bitrate = self.calculate_h264_bitrate(width, height, framerate)
            video_pipeline += f"x264enc tune=zerolatency bitrate={bitrate} speed-preset=ultrafast ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        elif codec == 'h265':
            bitrate = self.calculate_h265_bitrate(width, height, framerate)
            video_pipeline += f"x265enc tune=zerolatency bitrate={bitrate} speed-preset=ultrafast ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        elif codec == 'mpeg4':
            bitrate = self.calculate_mpeg4_bitrate(width, height, framerate)
            video_pipeline += f"{encoder} bitrate={bitrate} ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        elif codec == 'mpeg2':
            bitrate = self.calculate_mpeg2_bitrate(width, height, framerate)
            video_pipeline += f"{encoder} bitrate={bitrate} ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        elif codec == 'mjpeg':
            # MJPEG FIXED pipeline - key fix: add videoconvert and specify format
            video_pipeline += f"video/x-raw,format=I420 ! videoconvert ! jpegenc quality=85 ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        elif codec == 'theora':
            bitrate = self.calculate_theora_bitrate(width, height, framerate)
            video_pipeline += f"theoraenc bitrate={bitrate} ! queue max-size-buffers=5 ! {payloader} name=pay0 pt={pt}"
        
        # Add audio if specified
        if audio != 'none':
            audio_pipeline = self.create_audio_pipeline(audio)
            video_pipeline += " " + audio_pipeline
        
        return video_pipeline
    
    def create_audio_pipeline(self, audio_codec):
        """Create audio pipeline for specified codec"""
        
        audio_configs = {
            'aac': "audiotestsrc freq=440 ! audio/x-raw,rate=48000,channels=1 ! audioconvert ! avenc_aac bitrate=128000 ! rtpmp4apay name=pay1 pt=97",
            'g711': "audiotestsrc freq=800 ! audio/x-raw,rate=8000,channels=1 ! audioconvert ! mulawenc ! rtppcmupay name=pay1 pt=0",
            'g726': "audiotestsrc freq=600 ! audio/x-raw,rate=8000,channels=1 ! audioconvert ! avenc_g726 bitrate=32000 ! rtpg726pay name=pay1 pt=97"
        }
        
        return audio_configs.get(audio_codec, "")
    
    # Bitrate calculation methods
    def calculate_h264_bitrate(self, width, height, framerate):
        pixels = width * height
        base_bitrate = pixels * framerate * 0.1 / 1000
        return max(500, min(8000, int(base_bitrate)))
    
    def calculate_h265_bitrate(self, width, height, framerate):
        h264_bitrate = self.calculate_h264_bitrate(width, height, framerate)
        return max(300, int(h264_bitrate * 0.6))
    
    def calculate_mpeg4_bitrate(self, width, height, framerate):
        pixels = width * height
        base_bitrate = pixels * framerate * 0.08 / 1000
        return max(400, min(4000, int(base_bitrate)))
    
    def calculate_mpeg2_bitrate(self, width, height, framerate):
        pixels = width * height
        base_bitrate = pixels * framerate * 0.15 / 1000
        return max(800, min(10000, int(base_bitrate)))
    
    def calculate_theora_bitrate(self, width, height, framerate):
        pixels = width * height
        base_bitrate = pixels * framerate * 0.09 / 1000
        return max(400, min(5000, int(base_bitrate)))
    
    def start_servers(self):
        """Start all RTSP servers"""
        print("🎥 Starting Streamlined GStreamer RTSP Test Servers")
        print("=" * 70)
        
        total_streams = 0
        
        for name, config in self.servers.items():
            server = config['server']
            port = config['port']
            description = config['description']
            codecs = config['codecs']
            
            # Attach server to default main context
            server.attach(None)
            
            print(f"✅ {name.upper()} Server started on port {port}")
            print(f"   Description: {description}")
            print(f"   Codecs: {', '.join([self.video_codecs[c]['description'] for c in codecs])}")
            
            # Count streams for this server
            stream_count = len(codecs) * 4  # Approximate
            total_streams += stream_count
            print(f"   Estimated Streams: {stream_count}")
            print()
        
        print(f"📺 Total Estimated Streams: {total_streams}")
        print("-" * 40)
        
        print("🔍 Test Commands:")
        print("  # Modern codecs")
        print("  python3 test-streamlined-codecs.py --server modern")
        print("  # MJPEG debugging")  
        print("  python3 test-streamlined-codecs.py --server mjpeg")
        print("  # All codecs")
        print("  python3 test-streamlined-codecs.py")
        print()

    def get_all_rtsp_urls(self, public_ip):
        """Generate all RTSP URLs for REST API"""
        rtsp_urls = []
        
        for stream in self.all_streams:
            url = f"rtsp://{public_ip}:{stream['port']}{stream['path']}"
            rtsp_urls.append({
                "url": url,
                "description": stream['description'],
                "codec": stream['codec'],
                "resolution": stream['resolution'],
                "framerate": stream['framerate'],
                "audio": stream['audio'],
                "port": int(stream['port']),
                "path": stream['path'],
                "server": stream['server_name']
            })
        
        # Sort by port, then by codec, then by resolution
        rtsp_urls.sort(key=lambda x: (x['port'], x['codec'], x['resolution']))
        return rtsp_urls

    def start_http_server(self):
        """Start HTTP server for REST API"""
        try:
            http_port = 8080
            httpd = HTTPServer(('0.0.0.0', http_port), RTSPURLHandler)
            httpd.rtsp_server_instance = self  # Pass reference to RTSP server
            
            print(f"🌐 HTTP REST API server started on port {http_port}")
            print(f"📋 REST API endpoint: http://[CONTAINER-IP]:{http_port}/rtsp-urls")
            
            # Start HTTP server in a separate thread
            http_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
            http_thread.start()
            
            return httpd
        except Exception as e:
            print(f"❌ Failed to start HTTP server: {e}")
            return None

def main():
    server = RTSPTestServer()
    server.start_servers()
    
    # Start HTTP REST API server
    server.start_http_server()
    
    # Keep the server running
    loop = GLib.MainLoop()
    try:
        loop.run()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down Streamlined RTSP servers...")
        loop.quit()

if __name__ == '__main__':
    main()
