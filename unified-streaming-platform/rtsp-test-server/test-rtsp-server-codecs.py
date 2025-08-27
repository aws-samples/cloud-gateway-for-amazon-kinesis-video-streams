#!/usr/bin/env python3

import subprocess
import json
import time
import sys
import re
import concurrent.futures
from threading import Lock

class RTSPTestServerCodecTester:
    def __init__(self):
        self.results = []
        self.results_lock = Lock()
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        
    def generate_streamlined_urls(self, server_filter=None):
        """Generate test URLs for streamlined codecs (removed obsolete legacy)"""
        urls = []
        
        # Server configurations with practical codecs only
        servers = {
            'modern': {
                'port': '8554',
                'description': 'Modern Codecs',
                'codecs': ['h264', 'h265'],
                'streams': [
                    '/h264_360p_15fps', '/h264_480p_20fps', '/h264_720p_25fps', '/h264_360p_15fps_aac',
                    '/h265_360p_15fps', '/h265_480p_20fps', '/h265_720p_25fps', '/h265_360p_15fps_aac'
                ]
            },
            'mpeg': {
                'port': '8555', 
                'description': 'MPEG Codecs',
                'codecs': ['mpeg4', 'mpeg2'],
                'streams': [
                    '/mpeg4_360p_15fps', '/mpeg4_480p_20fps', '/mpeg4_720p_25fps', '/mpeg4_360p_15fps_aac',
                    '/mpeg2_360p_15fps', '/mpeg2_480p_20fps', '/mpeg2_720p_25fps', '/mpeg2_360p_15fps_aac'
                ]
            },
            'mjpeg': {
                'port': '8556',
                'description': 'MJPEG (IP Camera Standard)', 
                'codecs': ['mjpeg'],
                'streams': [
                    '/mjpeg_360p_10fps', '/mjpeg_480p_15fps', '/mjpeg_720p_20fps', '/mjpeg_360p_10fps_g711'
                ]
            },
            'opensource': {
                'port': '8557',
                'description': 'Open Source Codecs',
                'codecs': ['theora'], 
                'streams': [
                    '/theora_360p_15fps', '/theora_480p_20fps', '/theora_720p_25fps', '/theora_360p_15fps_aac'
                ]
            }
        }
        
        # Filter by server if specified
        if server_filter:
            if server_filter in servers:
                servers = {server_filter: servers[server_filter]}
            else:
                print(f"❌ Unknown server: {server_filter}")
                return []
        
        # Build URLs for each server
        for server_name, config in servers.items():
            port = config['port']
            
            for stream_path in config['streams']:
                url = f"rtsp://localhost:{port}{stream_path}"
                
                # Extract codec from path
                codec = stream_path.split('_')[0][1:]  # Remove leading /
                
                urls.append({
                    'url': url,
                    'server': server_name,
                    'path': stream_path,
                    'codec': codec,
                    'expected_codec': self.map_codec_name(codec),
                    'expected_resolution': self.extract_resolution_from_path(stream_path),
                    'expected_framerate': self.extract_framerate_from_path(stream_path),
                    'expected_audio': self.extract_audio_from_path(stream_path)
                })
        
        return urls
    
    def map_codec_name(self, codec):
        """Map our codec names to expected ffprobe codec names"""
        codec_map = {
            'h264': 'h264',
            'h265': 'hevc', 
            'mpeg4': 'mpeg4',
            'mpeg2': 'mpeg2video',
            'mjpeg': 'mjpeg',
            'theora': 'theora'
        }
        return codec_map.get(codec, codec)
    
    def extract_resolution_from_path(self, path):
        """Extract expected resolution from stream path"""
        if '360p' in path:
            return '360p'
        elif '480p' in path:
            return '480p'
        elif '720p' in path:
            return '720p'
        elif '1080p' in path:
            return '1080p'
        return 'unknown'
    
    def extract_framerate_from_path(self, path):
        """Extract expected framerate from stream path"""
        fps_match = re.search(r'(\d+)fps', path)
        if fps_match:
            return int(fps_match.group(1))
        return 25  # Default
    
    def extract_audio_from_path(self, path):
        """Extract expected audio codec from stream path"""
        if '_aac' in path:
            return 'aac'
        elif '_g711' in path:
            return 'g711'
        return 'none'
    
    def test_stream_ffprobe(self, stream_info):
        """Test a single stream using ffprobe with MJPEG-specific optimizations"""
        url = stream_info['url']
        codec = stream_info['codec']
        
        try:
            # Use different timeouts based on codec
            if codec == 'mjpeg':
                timeout = 15  # Longer timeout for MJPEG
                analyzeduration = '5000000'  # More analysis time
                probesize = '5000000'
            else:
                timeout = 10
                analyzeduration = '3000000'
                probesize = '3000000'
            
            # Use ffprobe to analyze the stream
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_streams',
                '-show_format',
                f'-analyzeduration', analyzeduration,
                f'-probesize', probesize,
                '-rtsp_transport', 'tcp',
                url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            
            if result.returncode == 0:
                probe_data = json.loads(result.stdout)
                return self.analyze_probe_result(stream_info, probe_data)
            else:
                return {
                    'url': url,
                    'status': 'FAILED',
                    'error': f"ffprobe failed: {result.stderr}",
                    'expected': stream_info,
                    'actual': None
                }
                
        except subprocess.TimeoutExpired:
            return {
                'url': url,
                'status': 'TIMEOUT',
                'error': f'ffprobe timeout after {timeout} seconds',
                'expected': stream_info,
                'actual': None
            }
        except Exception as e:
            return {
                'url': url,
                'status': 'ERROR',
                'error': str(e),
                'expected': stream_info,
                'actual': None
            }
    
    def analyze_probe_result(self, stream_info, probe_data):
        """Analyze ffprobe result and compare with expected values"""
        url = stream_info['url']
        streams = probe_data.get('streams', [])
        
        if not streams:
            return {
                'url': url,
                'status': 'FAILED',
                'error': 'No streams found in probe data',
                'expected': stream_info,
                'actual': None
            }
        
        # Analyze video stream
        video_stream = next((s for s in streams if s.get('codec_type') == 'video'), None)
        audio_stream = next((s for s in streams if s.get('codec_type') == 'audio'), None)
        
        actual_info = {
            'video_codec': video_stream.get('codec_name') if video_stream else None,
            'width': video_stream.get('width') if video_stream else None,
            'height': video_stream.get('height') if video_stream else None,
            'framerate': self.parse_framerate(video_stream.get('r_frame_rate')) if video_stream else None,
            'audio_codec': audio_stream.get('codec_name') if audio_stream else None
        }
        
        # Validate results
        validation_results = self.validate_stream_properties(stream_info, actual_info)
        
        return {
            'url': url,
            'status': 'PASSED' if validation_results['all_valid'] else 'FAILED',
            'expected': stream_info,
            'actual': actual_info,
            'validation': validation_results,
            'error': None if validation_results['all_valid'] else 'Property validation failed'
        }
    
    def parse_framerate(self, framerate_str):
        """Parse framerate string like '25/1' to integer"""
        if not framerate_str:
            return None
        try:
            if '/' in framerate_str:
                num, den = framerate_str.split('/')
                return round(float(num) / float(den))
            else:
                return round(float(framerate_str))
        except:
            return None
    
    def validate_stream_properties(self, expected, actual):
        """Validate actual stream properties against expected"""
        results = {
            'codec_valid': False,
            'resolution_valid': False,
            'framerate_valid': False,
            'audio_valid': False,
            'all_valid': False
        }
        
        # Validate video codec
        expected_codec = expected['expected_codec']
        actual_codec = actual['video_codec']
        
        if expected_codec == actual_codec:
            results['codec_valid'] = True
        elif expected_codec == 'h264' and actual_codec in ['h264', 'libx264']:
            results['codec_valid'] = True
        elif expected_codec == 'hevc' and actual_codec in ['hevc', 'h265', 'libx265']:
            results['codec_valid'] = True
        
        # Validate resolution
        expected_res = expected['expected_resolution']
        actual_width = actual['width']
        actual_height = actual['height']
        
        resolution_map = {
            '360p': (640, 360),
            '480p': (854, 480),
            '720p': (1280, 720),
            '1080p': (1920, 1080)
        }
        
        if expected_res in resolution_map:
            exp_width, exp_height = resolution_map[expected_res]
            if actual_width == exp_width and actual_height == exp_height:
                results['resolution_valid'] = True
        
        # Validate framerate (allow ±3 fps tolerance for MJPEG)
        expected_fps = expected['expected_framerate']
        actual_fps = actual['framerate']
        
        tolerance = 3 if expected['codec'] == 'mjpeg' else 2
        if actual_fps and abs(actual_fps - expected_fps) <= tolerance:
            results['framerate_valid'] = True
        
        # Validate audio
        expected_audio = expected['expected_audio']
        actual_audio = actual['audio_codec']
        
        if expected_audio == 'none' and not actual_audio:
            results['audio_valid'] = True
        elif expected_audio == 'aac' and actual_audio in ['aac']:
            results['audio_valid'] = True
        elif expected_audio == 'g711' and actual_audio in ['pcm_mulaw']:
            results['audio_valid'] = True
        
        # Overall validation
        results['all_valid'] = (
            results['codec_valid'] and 
            results['resolution_valid'] and 
            results['framerate_valid'] and 
            results['audio_valid']
        )
        
        return results
    
    def run_tests(self, max_workers=3, test_limit=None, server_filter=None):
        """Run streamlined codec tests with parallel execution"""
        test_urls = self.generate_streamlined_urls(server_filter)
        
        if test_limit:
            test_urls = test_urls[:test_limit]
        
        self.total_tests = len(test_urls)
        
        if self.total_tests == 0:
            print("❌ No tests to run")
            return []
        
        server_desc = f" ({server_filter} server only)" if server_filter else ""
        print(f"🎥 Starting Streamlined RTSP Codec Tests{server_desc}")
        print(f"📊 Total streams to test: {self.total_tests}")
        print(f"⚡ Max parallel workers: {max_workers}")
        print("=" * 70)
        
        start_time = time.time()
        
        # Run tests in parallel
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tests
            future_to_stream = {
                executor.submit(self.test_stream_ffprobe, stream_info): stream_info 
                for stream_info in test_urls
            }
            
            # Process results as they complete
            for i, future in enumerate(concurrent.futures.as_completed(future_to_stream), 1):
                stream_info = future_to_stream[future]
                
                try:
                    result = future.result()
                    
                    with self.results_lock:
                        self.results.append(result)
                        
                        if result['status'] == 'PASSED':
                            self.passed_tests += 1
                            status_icon = "✅"
                        else:
                            self.failed_tests += 1
                            status_icon = "❌"
                    
                    # Progress update
                    progress = (i / self.total_tests) * 100
                    codec = result['expected']['codec']
                    print(f"{status_icon} [{i:3d}/{self.total_tests}] ({progress:5.1f}%) {codec.upper()}: {result['url']}")
                    
                    if result['status'] != 'PASSED':
                        print(f"    Error: {result.get('error', 'Unknown error')}")
                    
                except Exception as e:
                    with self.results_lock:
                        self.failed_tests += 1
                    print(f"❌ [{i:3d}/{self.total_tests}] Exception testing {stream_info['url']}: {e}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Print summary
        self.print_test_summary(duration)
        
        return self.results
    
    def print_test_summary(self, duration):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📋 STREAMLINED CODECS TEST SUMMARY")
        print("=" * 70)
        
        print(f"⏱️  Total Duration: {duration:.2f} seconds")
        print(f"📊 Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"📈 Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")
        print()
        
        # Group results by server/codec category
        server_results = {}
        codec_results = {}
        
        for result in self.results:
            server = result['expected']['server']
            codec = result['expected']['codec']
            
            # Server stats
            if server not in server_results:
                server_results[server] = {'passed': 0, 'failed': 0, 'total': 0}
            server_results[server]['total'] += 1
            if result['status'] == 'PASSED':
                server_results[server]['passed'] += 1
            else:
                server_results[server]['failed'] += 1
            
            # Codec stats
            if codec not in codec_results:
                codec_results[codec] = {'passed': 0, 'failed': 0, 'total': 0}
            codec_results[codec]['total'] += 1
            if result['status'] == 'PASSED':
                codec_results[codec]['passed'] += 1
            else:
                codec_results[codec]['failed'] += 1
        
        print("📊 Results by Server:")
        print("-" * 40)
        for server, stats in server_results.items():
            success_rate = (stats['passed'] / stats['total']) * 100
            print(f"{server.upper():>12}: {stats['passed']:3d}/{stats['total']:3d} ({success_rate:5.1f}%)")
        
        print("\n🎥 Results by Codec:")
        print("-" * 40)
        for codec, stats in codec_results.items():
            success_rate = (stats['passed'] / stats['total']) * 100
            status = "✅" if success_rate == 100 else "⚠️" if success_rate >= 50 else "❌"
            print(f"{status} {codec.upper():>8}: {stats['passed']:3d}/{stats['total']:3d} ({success_rate:5.1f}%)")
        
        print("=" * 70)

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Streamlined RTSP Codec Tester (No Obsolete Legacy)')
    parser.add_argument('--workers', type=int, default=3, help='Number of parallel workers (default: 3)')
    parser.add_argument('--limit', type=int, help='Limit number of tests (for debugging)')
    parser.add_argument('--server', help='Test only specific server (modern, mpeg, mjpeg, opensource)')
    
    args = parser.parse_args()
    
    tester = RTSPTestServerCodecTester()
    results = tester.run_tests(max_workers=args.workers, test_limit=args.limit, server_filter=args.server)
    
    # Exit with error code if any tests failed
    sys.exit(0 if tester.failed_tests == 0 else 1)

if __name__ == '__main__':
    main()
