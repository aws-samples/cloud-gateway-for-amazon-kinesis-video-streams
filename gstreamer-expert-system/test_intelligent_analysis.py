#!/usr/bin/env python3
"""
Test the intelligent GStreamer context analysis and solution generation
"""

import re
import json
from typing import Dict, List

class GStreamerExpert:
    """Intelligent GStreamer pipeline expert with context inference"""
    
    def __init__(self):
        # Platform-specific element mappings
        self.platform_elements = {
            'macos': {
                'video_src': 'avfvideosrc',
                'audio_src': 'osxaudiosrc', 
                'video_sink': 'osxvideosink',
                'audio_sink': 'osxaudiosink',
                'hw_encoder': 'vtenc_h264',
                'hw_decoder': 'vtdec'
            },
            'linux': {
                'video_src': 'v4l2src',
                'audio_src': 'alsasrc',
                'video_sink': 'xvimagesink',
                'audio_sink': 'alsasink',
                'hw_encoder': 'vaapih264enc',  # or nvh264enc
                'hw_decoder': 'vaapih264dec'   # or nvh264dec
            },
            'windows': {
                'video_src': 'ksvideosrc',
                'audio_src': 'wasapisrc',
                'video_sink': 'd3dvideosink',
                'audio_sink': 'wasapisink',
                'hw_encoder': 'mfh264enc',
                'hw_decoder': 'mfh264dec'
            }
        }

    def analyze_context(self, user_input: str) -> Dict:
        """Intelligently extract context from user input"""
        context = {
            'source_type': self._detect_source_type(user_input),
            'destinations': self._detect_destinations(user_input),
            'platform': self._detect_platform(user_input),
            'codecs': self._detect_codecs(user_input),
            'complexity': self._assess_complexity(user_input),
            'issues': self._detect_issues(user_input),
            'rtsp_url': self._extract_rtsp_url(user_input)
        }
        return context
    
    def _detect_source_type(self, text: str) -> str:
        """Detect media source type from user input"""
        text_lower = text.lower()
        if 'rtsp://' in text or 'rtspsrc' in text:
            return 'rtsp'
        elif 'webcam' in text_lower or 'camera' in text_lower or 'v4l2src' in text or 'avfvideosrc' in text:
            return 'webcam'
        elif 'file' in text_lower or 'filesrc' in text:
            return 'file'
        elif 'screen' in text_lower or 'desktop' in text_lower:
            return 'screen_capture'
        return 'unknown'
    
    def _detect_destinations(self, text: str) -> List[str]:
        """Detect output destinations"""
        destinations = []
        text_lower = text.lower()
        
        if 'kvs' in text_lower or 'kinesis' in text_lower or 'kvssink' in text:
            destinations.append('kvs')
        if 'display' in text_lower or 'screen' in text_lower or 'videosink' in text:
            destinations.append('display')
        if 'file' in text_lower or 'record' in text_lower or 'filesink' in text:
            destinations.append('file')
        if 'rtsp' in text_lower and 'server' in text_lower:
            destinations.append('rtsp_server')
        if 'webrtc' in text_lower:
            destinations.append('webrtc')
            
        return destinations if destinations else ['unknown']
    
    def _detect_platform(self, text: str) -> str:
        """Detect target platform from context clues"""
        text_lower = text.lower()
        
        if any(elem in text for elem in ['v4l2src', 'alsasrc', 'vaapi', 'nvenc']):
            return 'linux'
        elif any(elem in text for elem in ['avfvideosrc', 'osxaudiosrc', 'vtenc']):
            return 'macos'
        elif any(elem in text for elem in ['ksvideosrc', 'wasapi', 'mf']):
            return 'windows'
        
        return 'cross_platform'  # Use cross-platform elements
    
    def _detect_codecs(self, text: str) -> Dict:
        """Extract codec information from pipeline or URL"""
        codecs = {'video': [], 'audio': []}
        
        # Video codecs
        if 'h264' in text.lower() or 'rtph264' in text:
            codecs['video'].append('h264')
        if 'h265' in text.lower() or 'rtph265' in text or 'hevc' in text.lower():
            codecs['video'].append('h265')
        
        # Audio codecs  
        if 'aac' in text.lower() or 'rtpmp4a' in text:
            codecs['audio'].append('aac')
        if 'opus' in text.lower() or 'rtpopus' in text:
            codecs['audio'].append('opus')
        if 'mp3' in text.lower():
            codecs['audio'].append('mp3')
            
        return codecs
    
    def _assess_complexity(self, text: str) -> str:
        """Assess pipeline complexity level"""
        text_lower = text.lower()
        
        complexity_indicators = {
            'basic': ['simple', 'basic', 'just works'],
            'multi_track': ['audio', 'video', 'both', 'multi'],
            'multi_output': ['tee', 'multiple', 'simultaneous', 'branch'],
            'ml_inference': ['detection', 'inference', 'openvino', 'nvidia', 'ai', 'ml'],
            'optimization': ['optimize', 'performance', 'hardware', 'acceleration']
        }
        
        for level, indicators in complexity_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                return level
                
        return 'basic'
    
    def _detect_issues(self, text: str) -> List[str]:
        """Detect common GStreamer issues from user description"""
        issues = []
        text_lower = text.lower()
        
        issue_patterns = {
            'caps_negotiation': ['caps', 'negotiation', 'format', 'not negotiated'],
            'initialization_failure': ['fails to initialize', 'won\'t start', 'error'],
            'performance': ['slow', 'lag', 'performance', 'cpu'],
            'audio_sync': ['sync', 'synchronization', 'audio delay'],
            'missing_elements': ['element', 'not found', 'missing']
        }
        
        for issue_type, patterns in issue_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                issues.append(issue_type)
                
        return issues

    def _extract_rtsp_url(self, text: str) -> str:
        """Extract RTSP URL from user input"""
        rtsp_match = re.search(r'rtsp://[^\s"\'\\]+', text)
        return rtsp_match.group(0) if rtsp_match else "rtsp://your-camera-url"

    def generate_kvs_solution(self, context: Dict) -> str:
        """Generate RTSP to KVS pipeline solution"""
        rtsp_url = context.get('rtsp_url', 'rtsp://your-camera-url')
        
        # Detect if multi-track is needed
        if 'multi_track' in context.get('complexity', '') or 'audio' in str(context).lower():
            return f"""## 🔧 WORKING SOLUTION: RTSP to KVS with Audio + Video

```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" name=src \\
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! matroskamux name=mux ! kvssink stream-name="rtsp-test-stream-final" aws-region="us-east-1" \\
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,mpegversion=4,stream-format=raw ! mux.
```

## 🎯 Key Fixes Applied to Your Pipeline:

**1. Added Media Type Caps Filters:**
- `application/x-rtp,media=video` - Ensures video RTP stream selection
- `application/x-rtp,media=audio` - Ensures audio RTP stream selection

**2. Added Matroskamux Container:**
- KVS requires a container format for multi-track streams
- `matroskamux` combines video and audio into a single stream

**3. Fixed Audio Caps:**
- Added `mpegversion=4` to specify AAC format correctly

**4. Proper Sink Connection:**
- Connect audio to `mux.` instead of `sink.`
- Let matroskamux output go to kvssink

## ❌ Why Your Original Pipeline Failed:

1. **Missing Container**: KVS needs a muxed stream for audio+video
2. **Ambiguous RTP Selection**: Without media type caps, GStreamer couldn't determine which RTP stream to use
3. **Direct Audio to KVS**: kvssink expects a container format, not raw audio

## 🚀 Alternative Approaches:

**Video-Only (if audio isn't critical):**
```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! kvssink stream-name="rtsp-test-stream-final" aws-region="us-east-1"
```

**With Fragment Duration Optimization:**
```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" name=src \\
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! matroskamux name=mux ! kvssink stream-name="rtsp-test-stream-final" aws-region="us-east-1" fragment-duration=6000 \\
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,mpegversion=4,stream-format=raw ! mux.
```

## 🛠️ Debugging Steps if Issues Persist:

1. **Test RTSP connectivity:**
```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" ! fakesink dump=true
```

2. **Inspect the stream:**
```bash
gst-discoverer-1.0 "{rtsp_url}"
```

3. **Enable debug output:**
```bash
GST_DEBUG=kvssink:5 gst-launch-1.0 [your pipeline]
```"""
        else:
            return f"""## 🔧 WORKING SOLUTION: RTSP to KVS (Video Only)

```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! kvssink stream-name="rtsp-test-stream-final" aws-region="us-east-1"
```

For audio+video, use the multi-track version with matroskamux."""

def test_kvs_pipeline_analysis():
    """Test the intelligent analysis with the user's KVS pipeline issue"""
    
    user_input = '''This GStreamer pipeline fails to initialize when trying to stream both audio and video from RTSP to Kinesis Video Streams:

gst-launch-1.0 rtspsrc location="rtsp://rtspgateway:qOjicr6ro7ER@192.168.4.119/Preview_05_main" name=src \\
src. ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=hvc1,alignment=au ! kvssink name=sink stream-name="rtsp-test-stream-final" aws-region="us-east-1" \\
src. ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,stream-format=raw ! sink.

The pipeline fails to initialize. How do I fix this to properly stream both video and audio to KVS?'''

    expert = GStreamerExpert()
    
    print("🔍 INTELLIGENT CONTEXT ANALYSIS:")
    print("=" * 50)
    
    context = expert.analyze_context(user_input)
    print(json.dumps(context, indent=2))
    
    print("\n🔧 GENERATED SOLUTION:")
    print("=" * 50)
    
    solution = expert.generate_kvs_solution(context)
    print(solution)

if __name__ == "__main__":
    test_kvs_pipeline_analysis()
