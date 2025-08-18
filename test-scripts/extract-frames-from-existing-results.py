#!/usr/bin/env python3
"""
Extract and save frames from existing test results

This script demonstrates the frame capture functionality by extracting
base64-encoded frame data from existing test result files and saving
them as viewable JPEG images.
"""

import json
import base64
import os
import glob
from datetime import datetime

def extract_frame_from_result_file(result_file_path):
    """Extract and save frame from a single result file."""
    try:
        with open(result_file_path, 'r') as f:
            data = json.load(f)
        
        # Extract frame data from the response
        response_payload = data.get('response_payload', {})
        if isinstance(response_payload.get('body'), str):
            body = json.loads(response_payload['body'])
        else:
            body = response_payload.get('body', {})
        
        frame_capture = body.get('stream_characteristics', {}).get('frame_capture', {})
        frame_data_b64 = frame_capture.get('frame_data')
        
        if not frame_data_b64:
            print(f"  ⚠️  No frame data found in {os.path.basename(result_file_path)}")
            return None
        
        # Extract stream name from RTSP URL
        rtsp_url = data.get('rtsp_url', '')
        if rtsp_url:
            stream_name = rtsp_url.split('/')[-1] if '/' in rtsp_url else 'unknown_stream'
        else:
            # Fallback to filename
            stream_name = os.path.basename(result_file_path).replace('.json', '').replace('result_', '')
        
        # Clean filename
        safe_stream_name = "".join(c for c in stream_name if c.isalnum() or c in ('-', '_')).rstrip()
        if not safe_stream_name:
            safe_stream_name = 'unknown_stream'
        
        # Create frames directory
        frames_dir = os.path.join(os.path.dirname(result_file_path), "captured-frames")
        os.makedirs(frames_dir, exist_ok=True)
        
        # Create filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_stream_name}_{timestamp}.jpg"
        filepath = os.path.join(frames_dir, filename)
        
        # Decode and save frame
        frame_bytes = base64.b64decode(frame_data_b64)
        
        with open(filepath, 'wb') as f:
            f.write(frame_bytes)
        
        # Get frame info
        width = frame_capture.get('width', 'unknown')
        height = frame_capture.get('height', 'unknown')
        size_bytes = frame_capture.get('size_bytes', len(frame_bytes))
        
        print(f"  📸 Frame saved: {filename} ({width}x{height}, {size_bytes:,} bytes)")
        return filepath
        
    except Exception as e:
        print(f"  ❌ Error processing {os.path.basename(result_file_path)}: {str(e)}")
        return None

def main():
    print("🖼️  Extracting frames from existing test results")
    print("=" * 50)
    
    # Find all result files
    results_dir = "../test-results"
    result_files = glob.glob(os.path.join(results_dir, "result_*.json"))
    
    if not result_files:
        print("❌ No result files found in test-results directory")
        return
    
    print(f"Found {len(result_files)} result files")
    print()
    
    extracted_count = 0
    
    for result_file in sorted(result_files):
        print(f"Processing: {os.path.basename(result_file)}")
        saved_path = extract_frame_from_result_file(result_file)
        if saved_path:
            extracted_count += 1
    
    print()
    print("=" * 50)
    print(f"🎯 EXTRACTION SUMMARY")
    print("=" * 50)
    print(f"Total result files: {len(result_files)}")
    print(f"Frames extracted: {extracted_count}")
    print(f"Success rate: {extracted_count/len(result_files):.1%}")
    
    if extracted_count > 0:
        frames_dir = os.path.join(results_dir, "captured-frames")
        print(f"📁 Frames saved to: {frames_dir}")
        print()
        print("🖼️  You can now view the extracted frames:")
        print(f"   open {frames_dir}")
        print("   or browse to the directory and open the .jpg files")

if __name__ == "__main__":
    main()
