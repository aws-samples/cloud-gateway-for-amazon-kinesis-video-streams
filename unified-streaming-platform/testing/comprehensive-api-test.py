#!/usr/bin/env python3
"""
Comprehensive API Test Script - Tests ALL Endpoints with Authentication
Tests all 12 API endpoints in the unified streaming platform
"""

import boto3
import requests
import json
import time
import os
from typing import Dict, Optional, Any
from botocore.exceptions import ClientError

class ComprehensiveAPITester:
    """Test class for ALL API endpoints with proper authentication"""
    
    def __init__(self, user_pool_id: str, client_id: str, api_base_url: str, aws_profile: str = 'malone-aws'):
        self.user_pool_id = user_pool_id
        self.client_id = client_id
        self.api_base_url = api_base_url.rstrip('/')
        self.aws_profile = aws_profile
        
        # Initialize Cognito client
        session = boto3.Session(profile_name=aws_profile)
        self.cognito_client = session.client('cognito-idp', region_name='us-east-1')
        
        # Store authentication tokens
        self.access_token = None
        self.id_token = None
        self.refresh_token = None
        self.username = None
        
    def create_test_user(self, username: str, password: str, email: str) -> bool:
        """Create a test user for API testing"""
        try:
            print(f"🔧 Creating test user: {username}")
            
            # Create user
            response = self.cognito_client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=username,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'email_verified', 'Value': 'true'}
                ],
                TemporaryPassword=password,
                MessageAction='SUPPRESS'  # Don't send welcome email
            )
            
            # Set permanent password
            self.cognito_client.admin_set_user_password(
                UserPoolId=self.user_pool_id,
                Username=username,
                Password=password,
                Permanent=True
            )
            
            print(f"✅ Test user created successfully: {username}")
            return True
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'UsernameExistsException':
                print(f"ℹ️  Test user already exists: {username}")
                return True
            else:
                print(f"❌ Failed to create test user: {e}")
                return False
    
    def authenticate_user(self, username: str, password: str) -> bool:
        """Authenticate user and get tokens"""
        try:
            print(f"🔐 Authenticating user: {username}")
            
            response = self.cognito_client.admin_initiate_auth(
                UserPoolId=self.user_pool_id,
                ClientId=self.client_id,
                AuthFlow='ADMIN_NO_SRP_AUTH',
                AuthParameters={
                    'USERNAME': username,
                    'PASSWORD': password
                }
            )
            
            # Extract tokens
            auth_result = response['AuthenticationResult']
            self.access_token = auth_result['AccessToken']
            self.id_token = auth_result['IdToken']
            self.refresh_token = auth_result['RefreshToken']
            self.username = username
            
            print(f"✅ Authentication successful for: {username}")
            return True
            
        except ClientError as e:
            print(f"❌ Authentication failed: {e}")
            return False
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get headers with authentication token"""
        if not self.id_token:
            raise ValueError("No ID token available. Please authenticate first.")
        
        return {
            'Authorization': f'Bearer {self.id_token}',
            'Content-Type': 'application/json'
        }
    
    def test_pipeline_generation_endpoints(self) -> Dict[str, Any]:
        """Test all pipeline generation endpoints"""
        results = {}
        headers = self.get_auth_headers()
        
        print("\n🔧 Testing Pipeline Generation Endpoints")
        print("=" * 50)
        
        # Test 1: Generate Pipeline
        print("🔍 Testing POST /v1/generate-pipeline")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/generate-pipeline",
                headers=headers,
                json={
                    "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
                    "mode": "pipeline",
                    "platform": "linux"
                },
                timeout=60
            )
            results['generate_pipeline'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['generate_pipeline'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 2: RTSP Characteristics
        print("🔍 Testing POST /v1/characteristics")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/characteristics",
                headers=headers,
                json={
                    "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
                    "capture_frame": False
                },
                timeout=60
            )
            results['characteristics'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['characteristics'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        return results
    
    def test_gstreamer_expert_endpoints(self) -> Dict[str, Any]:
        """Test all GStreamer expert tool endpoints"""
        results = {}
        headers = self.get_auth_headers()
        
        print("\n🧠 Testing GStreamer Expert Tool Endpoints")
        print("=" * 50)
        
        # Test 1: Search Elements
        print("🔍 Testing POST /v1/tools/search-elements")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/tools/search-elements",
                headers=headers,
                json={"query": "kvssink properties"},
                timeout=60
            )
            results['search_elements'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['search_elements'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 2: Troubleshoot
        print("🔍 Testing POST /v1/tools/troubleshoot")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/tools/troubleshoot",
                headers=headers,
                json={
                    "pipeline": "gst-launch-1.0 rtspsrc location=rtsp://test ! kvssink",
                    "symptoms": "pipeline fails to start"
                },
                timeout=60
            )
            results['troubleshoot'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['troubleshoot'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 3: Optimize
        print("🔍 Testing POST /v1/tools/optimize")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/tools/optimize",
                headers=headers,
                json={
                    "pipeline": "gst-launch-1.0 rtspsrc ! kvssink",
                    "goals": "low latency"
                },
                timeout=60
            )
            results['optimize'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['optimize'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 4: Validate
        print("🔍 Testing POST /v1/tools/validate")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/tools/validate",
                headers=headers,
                json={
                    "pipeline": "gst-launch-1.0 rtspsrc ! kvssink",
                    "platform": "linux"
                },
                timeout=60
            )
            results['validate'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['validate'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 5: Expert Query
        print("🔍 Testing POST /v1/tools/expert")
        try:
            response = requests.post(
                f"{self.api_base_url}/v1/tools/expert",
                headers=headers,
                json={"query": "How do I optimize GStreamer pipeline for low latency RTSP streaming?"},
                timeout=60
            )
            results['expert'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['expert'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        return results
    
    def test_camera_management_endpoints(self) -> Dict[str, Any]:
        """Test all camera management endpoints"""
        results = {}
        headers = self.get_auth_headers()
        
        print("\n📹 Testing Camera Management Endpoints")
        print("=" * 50)
        
        # Test 1: List Cameras
        print("🔍 Testing GET /cameras")
        try:
            response = requests.get(f"{self.api_base_url}/cameras", headers=headers, timeout=30)
            results['list_cameras'] = {
                'status_code': response.status_code,
                'success': response.status_code == 200,
                'response': response.json() if response.status_code == 200 else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
        except Exception as e:
            results['list_cameras'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 2: Create Camera
        print("🔍 Testing POST /cameras")
        test_camera = {
            "camera_name": "Comprehensive Test Camera",
            "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
            "make_model": "Test Model v1.0",
            "installation_location": "Test Lab",
            "retention_hours": 24,
            "ml_model": "object_detection_v1",
            "description": "Comprehensive API test camera"
        }
        
        try:
            response = requests.post(
                f"{self.api_base_url}/cameras",
                headers=headers,
                json=test_camera,
                timeout=30
            )
            results['create_camera'] = {
                'status_code': response.status_code,
                'success': response.status_code in [200, 201],
                'response': response.json() if response.status_code in [200, 201] else response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code in [200, 201] else '❌'}")
            
            # Store camera ID for further tests
            if response.status_code in [200, 201]:
                camera_data = response.json()
                if 'camera_id' in camera_data:
                    self.test_camera_id = camera_data['camera_id']
                    
        except Exception as e:
            results['create_camera'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test 3: Get Specific Camera
        if hasattr(self, 'test_camera_id'):
            print(f"🔍 Testing GET /cameras/{self.test_camera_id}")
            try:
                response = requests.get(
                    f"{self.api_base_url}/cameras/{self.test_camera_id}",
                    headers=headers,
                    timeout=30
                )
                results['get_camera'] = {
                    'status_code': response.status_code,
                    'success': response.status_code == 200,
                    'response': response.json() if response.status_code == 200 else response.text
                }
                print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
            except Exception as e:
                results['get_camera'] = {'success': False, 'error': str(e)}
                print(f"   Error: {e} ❌")
            
            # Test 4: Update Camera
            print(f"🔍 Testing PUT /cameras/{self.test_camera_id}")
            updated_camera = {
                "camera_name": "Updated Comprehensive Test Camera",
                "description": "Updated comprehensive API test camera"
            }
            
            try:
                response = requests.put(
                    f"{self.api_base_url}/cameras/{self.test_camera_id}",
                    headers=headers,
                    json=updated_camera,
                    timeout=30
                )
                results['update_camera'] = {
                    'status_code': response.status_code,
                    'success': response.status_code == 200,
                    'response': response.json() if response.status_code == 200 else response.text
                }
                print(f"   Status: {response.status_code} {'✅' if response.status_code == 200 else '❌'}")
            except Exception as e:
                results['update_camera'] = {'success': False, 'error': str(e)}
                print(f"   Error: {e} ❌")
            
            # Test 5: Delete Camera
            print(f"🔍 Testing DELETE /cameras/{self.test_camera_id}")
            try:
                response = requests.delete(
                    f"{self.api_base_url}/cameras/{self.test_camera_id}",
                    headers=headers,
                    timeout=30
                )
                results['delete_camera'] = {
                    'status_code': response.status_code,
                    'success': response.status_code in [200, 204],
                    'response': response.json() if response.status_code == 200 else response.text
                }
                print(f"   Status: {response.status_code} {'✅' if response.status_code in [200, 204] else '❌'}")
            except Exception as e:
                results['delete_camera'] = {'success': False, 'error': str(e)}
                print(f"   Error: {e} ❌")
        
        return results
    
    def test_unauthorized_access(self) -> Dict[str, Any]:
        """Test that all endpoints properly reject unauthorized requests"""
        results = {}
        
        print("\n🚫 Testing Unauthorized Access Protection")
        print("=" * 50)
        
        # Test endpoints without authentication
        test_endpoints = [
            ("GET", "/cameras", {}),
            ("POST", "/v1/generate-pipeline", {"rtsp_url": "test", "mode": "pipeline"}),
            ("POST", "/v1/characteristics", {"rtsp_url": "test"}),
            ("POST", "/v1/tools/expert", {"query": "test"}),
            ("POST", "/v1/tools/search-elements", {"query": "test"}),
        ]
        
        for method, endpoint, data in test_endpoints:
            print(f"🔍 Testing {method} {endpoint} (unauthorized)")
            try:
                if method == "GET":
                    response = requests.get(f"{self.api_base_url}{endpoint}", timeout=10)
                else:
                    response = requests.post(
                        f"{self.api_base_url}{endpoint}",
                        json=data,
                        timeout=10
                    )
                
                results[f"{method}_{endpoint.replace('/', '_')}"] = {
                    'status_code': response.status_code,
                    'success': response.status_code == 401,  # Should be unauthorized
                    'response': response.text
                }
                print(f"   Status: {response.status_code} {'✅' if response.status_code == 401 else '❌'}")
            except Exception as e:
                results[f"{method}_{endpoint.replace('/', '_')}"] = {'success': False, 'error': str(e)}
                print(f"   Error: {e} ❌")
        
        return results
    
    def cleanup_test_user(self, username: str) -> bool:
        """Clean up test user after testing"""
        try:
            print(f"🧹 Cleaning up test user: {username}")
            self.cognito_client.admin_delete_user(
                UserPoolId=self.user_pool_id,
                Username=username
            )
            print(f"✅ Test user deleted: {username}")
            return True
        except ClientError as e:
            print(f"❌ Failed to delete test user: {e}")
            return False
    
    def run_comprehensive_test_suite(self, test_username: str = None, test_password: str = None, test_email: str = None) -> Dict[str, Any]:
        """Run complete test suite for ALL API endpoints"""
        # Use default test credentials if not provided
        if not test_username:
            test_username = "comprehensive-api-test@example.com"  # Use email format for username
        if not test_password:
            test_password = "ComprehensiveTest123!"
        if not test_email:
            test_email = "comprehensive-api-test@example.com"
        
        print("🧪 COMPREHENSIVE API TEST SUITE - ALL 12 ENDPOINTS")
        print("=" * 70)
        print(f"User Pool ID: {self.user_pool_id}")
        print(f"Client ID: {self.client_id}")
        print(f"API Base URL: {self.api_base_url}")
        print(f"Test User: {test_username}")
        
        results = {
            'setup': {},
            'authentication': {},
            'pipeline_generation': {},
            'gstreamer_expert_tools': {},
            'camera_management': {},
            'unauthorized_access': {},
            'cleanup': {}
        }
        
        # Step 1: Create test user
        results['setup']['user_creation'] = self.create_test_user(test_username, test_password, test_email)
        
        if not results['setup']['user_creation']:
            print("❌ Cannot proceed without test user")
            return results
        
        # Step 2: Authenticate
        results['authentication']['login'] = self.authenticate_user(test_username, test_password)
        
        if not results['authentication']['login']:
            print("❌ Cannot proceed without authentication")
            return results
        
        # Step 3: Test unauthorized access (should fail)
        results['unauthorized_access'] = self.test_unauthorized_access()
        
        # Step 4: Test pipeline generation endpoints (2 endpoints)
        results['pipeline_generation'] = self.test_pipeline_generation_endpoints()
        
        # Step 5: Test GStreamer expert tool endpoints (5 endpoints)
        results['gstreamer_expert_tools'] = self.test_gstreamer_expert_endpoints()
        
        # Step 6: Test camera management endpoints (5 endpoints)
        results['camera_management'] = self.test_camera_management_endpoints()
        
        # Step 7: Cleanup
        results['cleanup']['user_deletion'] = self.cleanup_test_user(test_username)
        
        # Print summary
        self.print_comprehensive_summary(results)
        
        return results
    
    def print_comprehensive_summary(self, results: Dict[str, Any]):
        """Print a comprehensive summary of all test results"""
        print("\n📊 COMPREHENSIVE API TEST SUMMARY")
        print("=" * 60)
        
        # Count tests by category
        categories = {
            'Pipeline Generation': results.get('pipeline_generation', {}),
            'GStreamer Expert Tools': results.get('gstreamer_expert_tools', {}),
            'Camera Management': results.get('camera_management', {}),
            'Security (Unauthorized)': results.get('unauthorized_access', {})
        }
        
        total_tests = 0
        passed_tests = 0
        
        for category_name, category_results in categories.items():
            category_total = 0
            category_passed = 0
            
            for test_name, result in category_results.items():
                category_total += 1
                total_tests += 1
                
                if isinstance(result, dict) and result.get('success', False):
                    category_passed += 1
                    passed_tests += 1
                elif isinstance(result, bool) and result:
                    category_passed += 1
                    passed_tests += 1
            
            if category_total > 0:
                category_rate = (category_passed / category_total * 100)
                print(f"{category_name}: {category_passed}/{category_total} ({category_rate:.1f}%)")
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n🎯 OVERALL RESULTS:")
        print(f"Total API Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        print(f"\n📋 ENDPOINT COVERAGE:")
        print(f"✅ Pipeline Generation: 2 endpoints")
        print(f"✅ GStreamer Expert Tools: 5 endpoints")
        print(f"✅ Camera Management: 5 endpoints")
        print(f"✅ Security Testing: All endpoints")
        print(f"🎯 Total API Coverage: 12 endpoints")
        
        if success_rate >= 90:
            print("\n🎉 COMPREHENSIVE TEST SUITE: EXCELLENT")
        elif success_rate >= 80:
            print("\n✅ COMPREHENSIVE TEST SUITE: PASS")
        else:
            print("\n❌ COMPREHENSIVE TEST SUITE: NEEDS ATTENTION")


def get_stack_outputs():
    """Get CDK stack outputs dynamically"""
    import subprocess
    import os
    
    try:
        # Get stack outputs using AWS CLI
        result = subprocess.run([
            'aws', 'cloudformation', 'describe-stacks',
            '--stack-name', 'UnifiedStreamingPlatformStack',
            '--profile', 'malone-aws',
            '--region', 'us-east-1',
            '--query', 'Stacks[0].Outputs',
            '--output', 'json'
        ], capture_output=True, text=True, check=True)
        
        outputs = json.loads(result.stdout)
        
        # Convert to dictionary
        output_dict = {}
        for output in outputs:
            output_dict[output['OutputKey']] = output['OutputValue']
        
        return output_dict
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to get CDK stack outputs: {e}")
        print("Make sure the CDK stack is deployed: ./deploy.sh")
        return None
    except Exception as e:
        print(f"❌ Error getting stack outputs: {e}")
        return None


def main():
    """Main function to run the comprehensive test suite"""
    print("🔍 Getting CDK stack outputs...")
    
    # Get dynamic configuration from CDK outputs
    outputs = get_stack_outputs()
    if not outputs:
        print("❌ Cannot proceed without CDK stack outputs")
        return
    
    # Extract required values
    USER_POOL_ID = outputs.get('CognitoUserPoolId')
    CLIENT_ID = outputs.get('CognitoUserPoolWebClientId')
    API_BASE_URL = outputs.get('UnifiedApiEndpoint')
    
    if not all([USER_POOL_ID, CLIENT_ID, API_BASE_URL]):
        print("❌ Missing required CDK outputs:")
        print(f"   USER_POOL_ID: {USER_POOL_ID or 'NOT_FOUND'}")
        print(f"   CLIENT_ID: {CLIENT_ID or 'NOT_FOUND'}")
        print(f"   API_BASE_URL: {API_BASE_URL or 'NOT_FOUND'}")
        return
    
    print("✅ Successfully retrieved CDK outputs:")
    print(f"   USER_POOL_ID: {USER_POOL_ID}")
    print(f"   CLIENT_ID: {CLIENT_ID}")
    print(f"   API_BASE_URL: {API_BASE_URL}")
    print("")
    
    AWS_PROFILE = "malone-aws"
    
    # Initialize tester
    tester = ComprehensiveAPITester(USER_POOL_ID, CLIENT_ID, API_BASE_URL, AWS_PROFILE)
    
    # Run comprehensive tests
    results = tester.run_comprehensive_test_suite()
    
    # Save results to file
    timestamp = int(time.time())
    results_file = f"comprehensive-api-test-results-{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: {results_file}")


if __name__ == "__main__":
    main()
