#!/usr/bin/env python3
"""
Cognito Authentication Test Script for Unified Streaming Platform
Tests all protected API endpoints with proper authentication
"""

import boto3
import requests
import json
import time
import os
from typing import Dict, Optional, Any
from botocore.exceptions import ClientError

class CognitoAuthTester:
    """Test class for Cognito authentication and API endpoint testing"""
    
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
        if not self.access_token:
            raise ValueError("No access token available. Please authenticate first.")
        
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
    
    def test_camera_endpoints(self) -> Dict[str, Any]:
        """Test all camera management endpoints"""
        results = {}
        headers = self.get_auth_headers()
        
        print("\n📹 Testing Camera Management Endpoints")
        print("=" * 50)
        
        # Test 1: GET /cameras (List cameras)
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
        
        # Test 2: POST /cameras (Create camera)
        print("🔍 Testing POST /cameras")
        test_camera = {
            "name": "Test Camera 1",
            "rtsp_url": "rtsp://98.83.42.80:8554/h264_720p_25fps",
            "description": "Test camera for API validation",
            "location": "Test Lab"
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
        
        # Test 3: GET /cameras/{id} (Get specific camera)
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
            
            # Test 4: PUT /cameras/{id} (Update camera)
            print(f"🔍 Testing PUT /cameras/{self.test_camera_id}")
            updated_camera = {
                "name": "Updated Test Camera 1",
                "description": "Updated description for API validation"
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
            
            # Test 5: DELETE /cameras/{id} (Delete camera)
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
        """Test that endpoints properly reject unauthorized requests"""
        results = {}
        
        print("\n🚫 Testing Unauthorized Access Protection")
        print("=" * 50)
        
        # Test without any authorization header
        print("🔍 Testing access without authorization header")
        try:
            response = requests.get(f"{self.api_base_url}/cameras", timeout=30)
            results['no_auth'] = {
                'status_code': response.status_code,
                'success': response.status_code == 401,  # Should be unauthorized
                'response': response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 401 else '❌'}")
        except Exception as e:
            results['no_auth'] = {'success': False, 'error': str(e)}
            print(f"   Error: {e} ❌")
        
        # Test with invalid token
        print("🔍 Testing access with invalid token")
        invalid_headers = {
            'Authorization': 'Bearer invalid-token-12345',
            'Content-Type': 'application/json'
        }
        
        try:
            response = requests.get(f"{self.api_base_url}/cameras", headers=invalid_headers, timeout=30)
            results['invalid_token'] = {
                'status_code': response.status_code,
                'success': response.status_code == 401,  # Should be unauthorized
                'response': response.text
            }
            print(f"   Status: {response.status_code} {'✅' if response.status_code == 401 else '❌'}")
        except Exception as e:
            results['invalid_token'] = {'success': False, 'error': str(e)}
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
    
    def run_full_test_suite(self, test_username: str = None, test_password: str = None, test_email: str = None) -> Dict[str, Any]:
        """Run complete test suite"""
        # Use default test credentials if not provided
        if not test_username:
            test_username = "api-test-user"
        if not test_password:
            test_password = "TestPassword123!"
        if not test_email:
            test_email = "api-test@example.com"
        
        print("🧪 Starting Cognito Authentication API Test Suite")
        print("=" * 60)
        print(f"User Pool ID: {self.user_pool_id}")
        print(f"Client ID: {self.client_id}")
        print(f"API Base URL: {self.api_base_url}")
        print(f"Test User: {test_username}")
        
        results = {
            'setup': {},
            'authentication': {},
            'camera_endpoints': {},
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
        
        # Step 4: Test camera endpoints (should succeed with auth)
        results['camera_endpoints'] = self.test_camera_endpoints()
        
        # Step 5: Cleanup
        results['cleanup']['user_deletion'] = self.cleanup_test_user(test_username)
        
        # Print summary
        self.print_test_summary(results)
        
        return results
    
    def print_test_summary(self, results: Dict[str, Any]):
        """Print a summary of test results"""
        print("\n📊 Test Summary")
        print("=" * 50)
        
        total_tests = 0
        passed_tests = 0
        
        for category, tests in results.items():
            if isinstance(tests, dict):
                for test_name, result in tests.items():
                    total_tests += 1
                    if isinstance(result, dict) and result.get('success', False):
                        passed_tests += 1
                    elif isinstance(result, bool) and result:
                        passed_tests += 1
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("🎉 Test Suite: PASS")
        else:
            print("❌ Test Suite: FAIL")


def get_stack_outputs():
    """Get CDK stack outputs dynamically"""
    import subprocess
    
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
    """Main function to run the test suite"""
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
    tester = CognitoAuthTester(USER_POOL_ID, CLIENT_ID, API_BASE_URL, AWS_PROFILE)
    
    # Run tests
    results = tester.run_full_test_suite()
    
    # Save results to file
    timestamp = int(time.time())
    results_file = f"cognito-auth-test-results-{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n📄 Detailed results saved to: {results_file}")


if __name__ == "__main__":
    main()
