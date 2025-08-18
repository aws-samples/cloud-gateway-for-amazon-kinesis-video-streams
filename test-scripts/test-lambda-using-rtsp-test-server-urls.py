#!/usr/bin/env python3
"""
Comprehensive Lambda Function Testing Script

This script tests the deployed lambda-sdp-extractor function against all available
RTSP streams from the simple-rtsp-server REST API. It creates the test-results
directory and saves detailed test results.

Usage:
    python3 test-lambda-comprehensive.py [--lambda-function FUNCTION_NAME] [--server-ip IP]

Requirements:
    - boto3
    - requests
    - AWS credentials configured
    - simple-rtsp-server running with REST API on port 8080
"""

import json
import time
import boto3
import requests
import argparse
import os
import sys
import base64
from datetime import datetime
from typing import Dict, List, Any, Optional

class LambdaRTSPTester:
    def __init__(self, lambda_function_name: str, server_ip: str = "44.215.108.66"):
        self.lambda_function_name = lambda_function_name
        self.server_ip = server_ip
        self.lambda_client = boto3.client('lambda')
        self.test_results = []
        self.start_time = None
        self.end_time = None
        
        # Ensure test-results directory exists
        self.results_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "test-results")
        os.makedirs(self.results_dir, exist_ok=True)
        print(f"✓ Test results directory: {self.results_dir}")
        
        # Create frames subdirectory for captured images
        self.frames_dir = os.path.join(self.results_dir, "captured-frames")
        os.makedirs(self.frames_dir, exist_ok=True)
        print(f"✓ Captured frames directory: {self.frames_dir}")

    def get_rtsp_streams(self) -> List[str]:
        """Fetch all available RTSP streams from the server's REST API."""
        try:
            api_url = f"http://{self.server_ip}:8080/"
            print(f"Fetching RTSP streams from: {api_url}")
            
            response = requests.get(api_url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            streams = data.get('rtsp_urls', [])
            
            if not streams:
                raise ValueError("No streams found in API response")
            
            # Extract URLs and replace private IP with public IP if needed
            rtsp_urls = []
            for stream in streams:
                url = stream['url']
                # Replace private IP with public IP for external access
                if '172.31.5.208' in url:
                    url = url.replace('172.31.5.208', self.server_ip)
                rtsp_urls.append(url)
                
            print(f"✓ Found {len(rtsp_urls)} RTSP streams")
            return rtsp_urls
            
        except requests.exceptions.RequestException as e:
            print(f"✗ Error fetching streams from API: {e}")
            sys.exit(1)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            print(f"✗ Error parsing API response: {e}")
            sys.exit(1)

    def save_captured_frame(self, rtsp_url: str, response_payload: Dict[str, Any], test_index: int) -> Optional[str]:
        """Extract and save the captured frame from Lambda response as an image file."""
        try:
            # Parse the response body if it's a string
            if isinstance(response_payload.get('body'), str):
                body = json.loads(response_payload['body'])
            else:
                body = response_payload.get('body', {})
            
            # Extract frame data from the response
            frame_capture = body.get('stream_characteristics', {}).get('frame_capture', {})
            frame_data_b64 = frame_capture.get('frame_data')
            
            if not frame_data_b64:
                print(f"    ⚠️  No frame data found in response")
                return None
            
            # Generate filename from RTSP URL
            # Extract stream name from URL (e.g., "h264_360p_15fps" from rtsp://ip:port/h264_360p_15fps)
            stream_name = rtsp_url.split('/')[-1] if '/' in rtsp_url else f"stream_{test_index}"
            
            # Clean filename (remove invalid characters)
            safe_stream_name = "".join(c for c in stream_name if c.isalnum() or c in ('-', '_')).rstrip()
            if not safe_stream_name:
                safe_stream_name = f"stream_{test_index}"
            
            # Create filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{safe_stream_name}_{timestamp}.jpg"
            filepath = os.path.join(self.frames_dir, filename)
            
            # Decode base64 and save as image file
            frame_bytes = base64.b64decode(frame_data_b64)
            
            with open(filepath, 'wb') as f:
                f.write(frame_bytes)
            
            # Get frame info for logging
            width = frame_capture.get('width', 'unknown')
            height = frame_capture.get('height', 'unknown')
            size_bytes = frame_capture.get('size_bytes', len(frame_bytes))
            
            print(f"    📸 Frame saved: {filename} ({width}x{height}, {size_bytes:,} bytes)")
            return filepath
            
        except Exception as e:
            print(f"    ⚠️  Failed to save frame: {str(e)}")
            return None

    def test_lambda_function(self, rtsp_url: str, test_index: int = 0) -> Dict[str, Any]:
        """Test the lambda function with a single RTSP URL."""
        payload = {
            "rtsp_url": rtsp_url,
            "timeout": 30,
            "extract_frame": True,
            "analysis_depth": "comprehensive"
        }
        
        test_start = time.time()
        
        try:
            print(f"  Testing: {rtsp_url}")
            
            response = self.lambda_client.invoke(
                FunctionName=self.lambda_function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(payload)
            )
            
            duration = time.time() - test_start
            
            # Parse response
            response_payload = json.loads(response['Payload'].read())
            status_code = response.get('StatusCode', 0)
            
            # Determine success
            success = (
                status_code == 200 and 
                response_payload.get('statusCode') == 200 and
                'stream_characteristics' in response_payload.get('body', '{}')
            )
            
            # Save captured frame if successful
            saved_frame_path = None
            if success:
                saved_frame_path = self.save_captured_frame(rtsp_url, response_payload, test_index)
            
            result = {
                "rtsp_url": rtsp_url,
                "status_code": status_code,
                "duration": duration,
                "success": success,
                "response": response_payload,
                "saved_frame_path": saved_frame_path,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            
            if success:
                print(f"    ✓ Success ({duration:.2f}s)")
            else:
                print(f"    ✗ Failed ({duration:.2f}s)")
                
            return result
            
        except Exception as e:
            duration = time.time() - test_start
            print(f"    ✗ Exception: {str(e)} ({duration:.2f}s)")
            
            return {
                "rtsp_url": rtsp_url,
                "status_code": 0,
                "duration": duration,
                "success": False,
                "error": str(e),
                "saved_frame_path": None,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }

    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run comprehensive testing against all available RTSP streams."""
        print(f"\n🚀 Starting comprehensive lambda function test")
        print(f"Lambda Function: {self.lambda_function_name}")
        print(f"Server IP: {self.server_ip}")
        print("=" * 60)
        
        self.start_time = time.time()
        
        # Get all RTSP streams
        rtsp_urls = self.get_rtsp_streams()
        
        # Test each stream
        print(f"\n📋 Testing {len(rtsp_urls)} RTSP streams:")
        
        for i, rtsp_url in enumerate(rtsp_urls, 1):
            print(f"\n[{i}/{len(rtsp_urls)}]", end=" ")
            result = self.test_lambda_function(rtsp_url, i)
            self.test_results.append(result)
            
            # Brief pause between tests
            time.sleep(0.5)
        
        self.end_time = time.time()
        
        # Calculate summary statistics
        successful_tests = sum(1 for r in self.test_results if r['success'])
        failed_tests = len(self.test_results) - successful_tests
        success_rate = successful_tests / len(self.test_results) if self.test_results else 0
        total_duration = self.end_time - self.start_time
        
        summary = {
            "lambda_function": self.lambda_function_name,
            "server_ip": self.server_ip,
            "test_timestamp": datetime.utcnow().isoformat() + "Z",
            "total_tests": len(self.test_results),
            "successful_tests": successful_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "total_duration": total_duration,
            "average_duration": sum(r['duration'] for r in self.test_results) / len(self.test_results) if self.test_results else 0,
            "results": self.test_results
        }
        
        return summary

    def save_results(self, summary: Dict[str, Any]) -> None:
        """Save test results to files."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save detailed results
        detailed_file = os.path.join(self.results_dir, f"lambda-test-detailed-{timestamp}.json")
        with open(detailed_file, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"✓ Detailed results saved: {detailed_file}")
        
        # Save summary
        summary_file = os.path.join(self.results_dir, "test-summary.json")
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)
        print(f"✓ Summary saved: {summary_file}")
        
        # Save individual successful results
        successful_results = [r for r in self.test_results if r['success']]
        if successful_results:
            success_file = os.path.join(self.results_dir, f"successful-tests-{timestamp}.json")
            with open(success_file, 'w') as f:
                json.dump(successful_results, f, indent=2)
            print(f"✓ Successful tests saved: {success_file}")
        
        # Save failed results if any
        failed_results = [r for r in self.test_results if not r['success']]
        if failed_results:
            failed_file = os.path.join(self.results_dir, f"failed-tests-{timestamp}.json")
            with open(failed_file, 'w') as f:
                json.dump(failed_results, f, indent=2)
            print(f"✓ Failed tests saved: {failed_file}")
        
        # Report on captured frames
        frames_saved = sum(1 for r in self.test_results if r.get('saved_frame_path'))
        if frames_saved > 0:
            print(f"✓ Captured frames saved: {frames_saved} images in {self.frames_dir}")
        else:
            print("⚠️  No frames were captured and saved")

    def print_summary(self, summary: Dict[str, Any]) -> None:
        """Print test summary to console."""
        print("\n" + "=" * 60)
        print("🎯 TEST SUMMARY")
        print("=" * 60)
        print(f"Lambda Function: {summary['lambda_function']}")
        print(f"Server IP: {summary['server_ip']}")
        print(f"Test Duration: {summary['total_duration']:.2f}s")
        print(f"Average per Test: {summary['average_duration']:.2f}s")
        print()
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Successful: {summary['successful_tests']} ✓")
        print(f"Failed: {summary['failed_tests']} ✗")
        print(f"Success Rate: {summary['success_rate']:.1%}")
        
        # Frame capture statistics
        frames_saved = sum(1 for r in summary['results'] if r.get('saved_frame_path'))
        print(f"Frames Captured: {frames_saved} 📸")
        print()
        
        if summary['failed_tests'] > 0:
            print("❌ FAILED TESTS:")
            for result in summary['results']:
                if not result['success']:
                    error_msg = result.get('error', 'Unknown error')
                    print(f"  • {result['rtsp_url']}: {error_msg}")
            print()
        
        if frames_saved > 0:
            print("📸 CAPTURED FRAMES:")
            for result in summary['results']:
                if result.get('saved_frame_path'):
                    frame_path = result['saved_frame_path']
                    filename = os.path.basename(frame_path)
                    print(f"  • {filename}")
            print()
        
        if summary['success_rate'] == 1.0:
            print("🎉 ALL TESTS PASSED! Perfect success rate.")
        elif summary['success_rate'] >= 0.9:
            print("✅ Excellent success rate!")
        elif summary['success_rate'] >= 0.7:
            print("⚠️  Good success rate, but some issues detected.")
        else:
            print("❌ Low success rate - investigation needed.")

def main():
    parser = argparse.ArgumentParser(description='Comprehensive Lambda RTSP Testing')
    parser.add_argument('--lambda-function', 
                       default='PipelineGeneratorStack-SdpExtractorFunction0634AF6-vPvkrlpMQnAP',
                       help='Lambda function name')
    parser.add_argument('--server-ip', 
                       default='44.215.108.66',
                       help='RTSP server IP address')
    
    args = parser.parse_args()
    
    # Initialize tester
    tester = LambdaRTSPTester(args.lambda_function, args.server_ip)
    
    try:
        # Run comprehensive test
        summary = tester.run_comprehensive_test()
        
        # Save results
        tester.save_results(summary)
        
        # Print summary
        tester.print_summary(summary)
        
        # Exit with appropriate code
        sys.exit(0 if summary['success_rate'] == 1.0 else 1)
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Test interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
