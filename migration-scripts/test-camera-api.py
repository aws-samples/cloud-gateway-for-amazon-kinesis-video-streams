#!/usr/bin/env python3
"""
Test script for Camera Management API
This script tests all CRUD operations for the camera management system.
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

class CameraAPITester:
    def __init__(self, api_url: str):
        self.api_url = api_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    
    def test_create_camera(self) -> Optional[str]:
        """Test creating a new camera."""
        print("🧪 Testing camera creation...")
        
        camera_data = {
            "camera_name": "Test Front Door Camera",
            "rtsp_url": "rtsp://testuser:testpass@192.168.1.100:554/stream1",
            "make_model": "Hikvision DS-2CD2143G0-IS",
            "installation_location": "Main entrance, facing north, mounted at 8ft height",
            "retention_hours": 168,  # 1 week
            "ml_model": "none",
            "stream_metadata": {
                "video": {
                    "codec": "H.264",
                    "resolution": "1920x1080",
                    "framerate": "30fps"
                },
                "audio": {
                    "codec": "AAC",
                    "sample_rate": "48000Hz"
                }
            },
            "screen_capture_base64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
            "test_status": "tested"
        }
        
        try:
            response = self.session.post(f"{self.api_url}/cameras", json=camera_data)
            
            if response.status_code == 201:
                result = response.json()
                camera_id = result['camera']['camera_id']
                print(f"✅ Camera created successfully with ID: {camera_id}")
                return camera_id
            else:
                print(f"❌ Failed to create camera: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error creating camera: {e}")
            return None
    
    def test_list_cameras(self) -> bool:
        """Test listing all cameras."""
        print("🧪 Testing camera listing...")
        
        try:
            response = self.session.get(f"{self.api_url}/cameras")
            
            if response.status_code == 200:
                result = response.json()
                camera_count = result.get('count', 0)
                print(f"✅ Retrieved {camera_count} cameras")
                return True
            else:
                print(f"❌ Failed to list cameras: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error listing cameras: {e}")
            return False
    
    def test_get_camera(self, camera_id: str) -> bool:
        """Test getting a specific camera."""
        print(f"🧪 Testing camera retrieval for ID: {camera_id}")
        
        try:
            response = self.session.get(f"{self.api_url}/cameras/{camera_id}")
            
            if response.status_code == 200:
                result = response.json()
                camera = result['camera']
                print(f"✅ Retrieved camera: {camera['camera_name']}")
                return True
            else:
                print(f"❌ Failed to get camera: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error getting camera: {e}")
            return False
    
    def test_update_camera(self, camera_id: str) -> bool:
        """Test updating a camera."""
        print(f"🧪 Testing camera update for ID: {camera_id}")
        
        update_data = {
            "camera_name": "Updated Test Camera",
            "retention_hours": 336,  # 2 weeks
            "ml_model": "object_detection"
        }
        
        try:
            response = self.session.put(f"{self.api_url}/cameras/{camera_id}", json=update_data)
            
            if response.status_code == 200:
                result = response.json()
                camera = result['camera']
                print(f"✅ Updated camera: {camera['camera_name']}")
                return True
            else:
                print(f"❌ Failed to update camera: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error updating camera: {e}")
            return False
    
    def test_delete_camera(self, camera_id: str) -> bool:
        """Test deleting a camera."""
        print(f"🧪 Testing camera deletion for ID: {camera_id}")
        
        try:
            response = self.session.delete(f"{self.api_url}/cameras/{camera_id}")
            
            if response.status_code == 200:
                print("✅ Camera deleted successfully")
                return True
            else:
                print(f"❌ Failed to delete camera: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error deleting camera: {e}")
            return False
    
    def run_full_test_suite(self) -> bool:
        """Run the complete test suite."""
        print("🚀 Starting Camera Management API Test Suite")
        print(f"🔗 API URL: {self.api_url}")
        print("-" * 60)
        
        # Test 1: Create camera
        camera_id = self.test_create_camera()
        if not camera_id:
            print("❌ Test suite failed at camera creation")
            return False
        
        time.sleep(1)  # Brief pause between operations
        
        # Test 2: List cameras
        if not self.test_list_cameras():
            print("❌ Test suite failed at camera listing")
            return False
        
        time.sleep(1)
        
        # Test 3: Get specific camera
        if not self.test_get_camera(camera_id):
            print("❌ Test suite failed at camera retrieval")
            return False
        
        time.sleep(1)
        
        # Test 4: Update camera
        if not self.test_update_camera(camera_id):
            print("❌ Test suite failed at camera update")
            return False
        
        time.sleep(1)
        
        # Test 5: Delete camera
        if not self.test_delete_camera(camera_id):
            print("❌ Test suite failed at camera deletion")
            return False
        
        print("-" * 60)
        print("✅ All tests passed! Camera Management API is working correctly.")
        return True

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 test-camera-api.py <API_GATEWAY_URL>")
        print("Example: python3 test-camera-api.py https://abc123.execute-api.us-east-1.amazonaws.com/prod")
        sys.exit(1)
    
    api_url = sys.argv[1]
    tester = CameraAPITester(api_url)
    
    success = tester.run_full_test_suite()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
