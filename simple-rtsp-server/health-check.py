#!/usr/bin/env python3
"""
Comprehensive health check script for RTSP server deployment in AWS
Tests actual RTSP stream functionality, not just process existence
"""

import subprocess
import json
import sys
import time
import socket
from concurrent.futures import ThreadPoolExecutor, as_completed
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RTSPHealthChecker:
    def __init__(self):
        self.critical_streams = [
            'rtsp://localhost:8554/h264_720p_25fps',  # Primary H.264 stream
            'rtsp://localhost:8555/mpeg4_480p_20fps', # Primary MPEG-4 stream
            'rtsp://localhost:8556/mjpeg_360p_10fps', # Primary MJPEG stream
            'rtsp://localhost:8557/theora_360p_15fps' # Primary Theora stream
        ]
        
        self.all_streams = [
            # H.264/H.265 streams
            'rtsp://localhost:8554/h264_720p_25fps',
            'rtsp://localhost:8554/h264_480p_20fps',
            'rtsp://localhost:8554/h265_720p_25fps',
            'rtsp://localhost:8554/h265_480p_20fps',
            
            # MPEG streams
            'rtsp://localhost:8555/mpeg4_480p_20fps',
            'rtsp://localhost:8555/mpeg2_480p_20fps',
            
            # MJPEG streams
            'rtsp://localhost:8556/mjpeg_360p_10fps',
            'rtsp://localhost:8556/mjpeg_720p_20fps',
            
            # Theora streams
            'rtsp://localhost:8557/theora_360p_15fps',
            'rtsp://localhost:8557/theora_480p_20fps'
        ]

    def check_port_connectivity(self, port):
        """Check if RTSP port is accessible"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(2)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            return result == 0
        except Exception as e:
            logger.error(f"Port check failed for {port}: {e}")
            return False

    def test_rtsp_stream(self, url, timeout=5):
        """Test individual RTSP stream with ffprobe"""
        try:
            cmd = [
                'ffprobe', '-v', 'quiet', '-print_format', 'json', 
                '-show_streams', '-timeout', str(timeout * 1000000), url
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
            
            if result.returncode == 0:
                try:
                    data = json.loads(result.stdout)
                    if 'streams' in data and len(data['streams']) > 0:
                        stream = data['streams'][0]
                        codec = stream.get('codec_name', 'unknown')
                        width = stream.get('width', 0)
                        height = stream.get('height', 0)
                        
                        # Validate stream has reasonable properties
                        if codec != 'unknown' and width > 0 and height > 0:
                            return True, f"{codec} {width}x{height}"
                        else:
                            return False, f"Invalid stream properties: {codec} {width}x{height}"
                    else:
                        return False, "No streams found"
                except json.JSONDecodeError as e:
                    return False, f"JSON decode error: {e}"
            else:
                return False, f"ffprobe failed: {result.stderr[:100]}"
                
        except subprocess.TimeoutExpired:
            return False, f"Timeout after {timeout}s"
        except Exception as e:
            return False, f"Exception: {e}"

    def quick_health_check(self):
        """Quick health check for AWS ELB - tests critical streams only"""
        logger.info("Starting quick health check...")
        
        # Check all RTSP ports are accessible
        ports = [8554, 8555, 8556, 8557]
        for port in ports:
            if not self.check_port_connectivity(port):
                logger.error(f"Port {port} not accessible")
                return False
        
        # Test critical streams in parallel
        success_count = 0
        with ThreadPoolExecutor(max_workers=4) as executor:
            future_to_url = {
                executor.submit(self.test_rtsp_stream, url, 3): url 
                for url in self.critical_streams
            }
            
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    success, details = future.result()
                    if success:
                        success_count += 1
                        logger.info(f"✅ {url}: {details}")
                    else:
                        logger.warning(f"❌ {url}: {details}")
                except Exception as e:
                    logger.error(f"❌ {url}: Exception {e}")
        
        # Require at least 3 out of 4 critical streams to pass
        required_success = 3
        success_rate = success_count / len(self.critical_streams)
        
        if success_count >= required_success:
            logger.info(f"✅ Health check PASSED: {success_count}/{len(self.critical_streams)} critical streams working ({success_rate:.1%})")
            return True
        else:
            logger.error(f"❌ Health check FAILED: Only {success_count}/{len(self.critical_streams)} critical streams working ({success_rate:.1%})")
            return False

    def comprehensive_health_check(self):
        """Comprehensive health check for detailed monitoring"""
        logger.info("Starting comprehensive health check...")
        
        # Check all RTSP ports
        ports = [8554, 8555, 8556, 8557]
        port_results = {}
        for port in ports:
            port_results[port] = self.check_port_connectivity(port)
            logger.info(f"Port {port}: {'✅' if port_results[port] else '❌'}")
        
        # Test all streams
        results = {}
        success_count = 0
        
        with ThreadPoolExecutor(max_workers=6) as executor:
            future_to_url = {
                executor.submit(self.test_rtsp_stream, url, 5): url 
                for url in self.all_streams
            }
            
            for future in as_completed(future_to_url):
                url = future_to_url[future]
                try:
                    success, details = future.result()
                    results[url] = {'success': success, 'details': details}
                    if success:
                        success_count += 1
                        logger.info(f"✅ {url}: {details}")
                    else:
                        logger.warning(f"❌ {url}: {details}")
                except Exception as e:
                    results[url] = {'success': False, 'details': f"Exception: {e}"}
                    logger.error(f"❌ {url}: Exception {e}")
        
        # Calculate success rate
        total_streams = len(self.all_streams)
        success_rate = success_count / total_streams
        
        # Generate report
        report = {
            'timestamp': time.time(),
            'ports': port_results,
            'streams': results,
            'summary': {
                'total_streams': total_streams,
                'successful_streams': success_count,
                'failed_streams': total_streams - success_count,
                'success_rate': success_rate,
                'status': 'HEALTHY' if success_rate >= 0.8 else 'UNHEALTHY'
            }
        }
        
        logger.info(f"📊 Comprehensive check complete: {success_count}/{total_streams} streams working ({success_rate:.1%})")
        return report

def main():
    """Main health check entry point"""
    checker = RTSPHealthChecker()
    
    # Determine check type from command line args
    if len(sys.argv) > 1 and sys.argv[1] == '--comprehensive':
        # Comprehensive check for monitoring/debugging
        report = checker.comprehensive_health_check()
        print(json.dumps(report, indent=2))
        sys.exit(0 if report['summary']['status'] == 'HEALTHY' else 1)
    else:
        # Quick check for AWS health checks
        if checker.quick_health_check():
            print("HEALTHY")
            sys.exit(0)
        else:
            print("UNHEALTHY")
            sys.exit(1)

if __name__ == "__main__":
    main()
