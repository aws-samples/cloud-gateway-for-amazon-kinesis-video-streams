#!/usr/bin/env python3

import gi
gi.require_version('Gst', '1.0')
gi.require_version('GstRtspServer', '1.0')
from gi.repository import Gst, GstRtspServer, GLib
import threading
import time

class RTSPTestServer:
    def __init__(self):
        Gst.init(None)
        
        # Create a single RTSP server for now (we can add auth later)
        self.server = GstRtspServer.RTSPServer()
        self.server.set_service('8554')
        
        # Get mount points
        mounts = self.server.get_mount_points()
        
        # Add test streams
        self.add_test_streams(mounts)
        
    def add_test_streams(self, mounts):
        """Add various test streams to the server"""
        
        streams = [
            {
                'path': '/h264_720p_30fps',
                'pipeline': self.create_h264_720p_pipeline(),
                'description': 'H.264 720p 30fps'
            },
            {
                'path': '/h264_480p_15fps_smpte', 
                'pipeline': self.create_h264_480p_smpte_pipeline(),
                'description': 'H.264 480p 15fps SMPTE'
            },
            {
                'path': '/h264_1080p_25fps',
                'pipeline': self.create_h264_1080p_pipeline(),
                'description': 'H.264 1080p 25fps'
            },
            {
                'path': '/h265_720p_30fps',
                'pipeline': self.create_h265_720p_pipeline(),
                'description': 'H.265 720p 30fps'
            },
            {
                'path': '/h264_audio_720p',
                'pipeline': self.create_h264_audio_pipeline(),
                'description': 'H.264 + AAC Audio 720p'
            },
            {
                'path': '/h264_240p_15fps',
                'pipeline': self.create_h264_240p_pipeline(),
                'description': 'H.264 240p 15fps Low-res'
            }
        ]
        
        for stream in streams:
            factory = GstRtspServer.RTSPMediaFactory()
            factory.set_launch(stream['pipeline'])
            factory.set_shared(True)
            mounts.add_factory(stream['path'], factory)
            print(f"✅ Added {stream['description']} at {stream['path']}")
    
    def create_h264_720p_pipeline(self):
        """Create H.264 720p 30fps pipeline with overlay"""
        return (
            "videotestsrc pattern=smpte75 ! "
            "video/x-raw,width=1280,height=720,framerate=30/1 ! "
            "textoverlay text='H.264 720p 30fps\\nServer: Open\\nAuth: None\\nPort: 8554\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 20' ! "
            "x264enc tune=zerolatency bitrate=2000 speed-preset=ultrafast ! "
            "rtph264pay name=pay0 pt=96"
        )
    
    def create_h264_480p_smpte_pipeline(self):
        """Create H.264 480p 15fps SMPTE pipeline"""
        return (
            "videotestsrc pattern=smpte ! "
            "video/x-raw,width=854,height=480,framerate=15/1 ! "
            "textoverlay text='H.264 480p 15fps SMPTE\\nServer: Open\\nAuth: None\\nPort: 8554\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 16' ! "
            "x264enc tune=zerolatency bitrate=1000 speed-preset=ultrafast ! "
            "rtph264pay name=pay0 pt=96"
        )
    
    def create_h264_1080p_pipeline(self):
        """Create H.264 1080p 25fps pipeline"""
        return (
            "videotestsrc pattern=ball ! "
            "video/x-raw,width=1920,height=1080,framerate=25/1 ! "
            "textoverlay text='H.264 1080p 25fps\\nServer: Open\\nAuth: None\\nPort: 8554\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 24' ! "
            "x264enc tune=zerolatency bitrate=4000 speed-preset=ultrafast ! "
            "rtph264pay name=pay0 pt=96"
        )
    
    def create_h265_720p_pipeline(self):
        """Create H.265 720p 30fps pipeline"""
        return (
            "videotestsrc pattern=zone-plate ! "
            "video/x-raw,width=1280,height=720,framerate=30/1 ! "
            "textoverlay text='H.265 HEVC 720p 30fps\\nServer: Open\\nAuth: None\\nPort: 8554\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 20' ! "
            "x265enc tune=zerolatency bitrate=1500 speed-preset=ultrafast ! "
            "rtph265pay name=pay0 pt=96"
        )
    
    def create_h264_audio_pipeline(self):
        """Create H.264 + Audio pipeline"""
        return (
            "videotestsrc pattern=circular ! "
            "video/x-raw,width=1280,height=720,framerate=30/1 ! "
            "textoverlay text='H.264 + AAC Audio\\nServer: Open\\nAuth: None\\nPort: 8554\\nTime: %T' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 20' ! "
            "x264enc tune=zerolatency bitrate=2000 speed-preset=ultrafast ! "
            "rtph264pay name=pay0 pt=96 "
            "audiotestsrc freq=440 ! "
            "audio/x-raw,rate=48000,channels=1 ! "
            "audioconvert ! "
            "avenc_aac bitrate=128000 ! "
            "rtpmp4apay name=pay1 pt=97"
        )
    
    def create_h264_240p_pipeline(self):
        """Create H.264 240p 15fps low-res pipeline"""
        return (
            "videotestsrc pattern=colors ! "
            "video/x-raw,width=426,height=240,framerate=15/1 ! "
            "textoverlay text='H.264 240p 15fps\\nLow Resolution\\nServer: Open\\nAuth: None\\nPort: 8554' "
            "valignment=top halignment=left font-desc='DejaVu Sans Bold 12' ! "
            "x264enc tune=zerolatency bitrate=300 speed-preset=ultrafast ! "
            "rtph264pay name=pay0 pt=96"
        )
    
    def start_server(self):
        """Start the RTSP server"""
        print("🎥 Starting GStreamer RTSP Test Server")
        print("=" * 50)
        
        # Attach server to default main context
        self.server.attach(None)
        
        print("✅ RTSP Server started on port 8554")
        print("   Auth: Open (No Authentication)")
        print("   Protocol: RTSP")
        print()
        print("📺 Available RTSP streams:")
        print("  - rtsp://localhost:8554/h264_720p_30fps    (H.264 720p 30fps)")
        print("  - rtsp://localhost:8554/h264_480p_15fps_smpte    (H.264 480p 15fps SMPTE)")
        print("  - rtsp://localhost:8554/h264_1080p_25fps   (H.264 1080p 25fps)")
        print("  - rtsp://localhost:8554/h265_720p_30fps    (H.265 720p 30fps)")
        print("  - rtsp://localhost:8554/h264_audio_720p    (H.264 + Audio)")
        print("  - rtsp://localhost:8554/h264_240p_15fps    (H.264 240p low-res)")
        print()
        print("🔍 Test with:")
        print("  ffprobe rtsp://localhost:8554/h264_720p_30fps")
        print("  ffplay rtsp://localhost:8554/h265_720p_30fps")
        print()

def main():
    server = RTSPTestServer()
    server.start_server()
    
    # Keep the server running
    loop = GLib.MainLoop()
    try:
        loop.run()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down RTSP server...")
        loop.quit()

if __name__ == '__main__':
    main()
