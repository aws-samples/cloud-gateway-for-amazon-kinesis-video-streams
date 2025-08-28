#!/usr/bin/env python3
import boto3
import requests
import json

# Configuration
USER_POOL_ID = 'us-east-1_yMrNPqCOf'
CLIENT_ID = '1lpt1d27acn11fcs998bquqhll'
API_BASE_URL = 'https://fesxn1owye.execute-api.us-east-1.amazonaws.com/prod/'
TEST_EMAIL = 'comprehensive-api-test@example.com'
TEST_PASSWORD = 'TempPassword123!'

# Initialize Cognito client
session = boto3.Session(profile_name='malone-aws')
cognito_client = session.client('cognito-idp', region_name='us-east-1')

print("🔐 Authenticating user...")
try:
    # Authenticate user
    auth_response = cognito_client.admin_initiate_auth(
        UserPoolId=USER_POOL_ID,
        ClientId=CLIENT_ID,
        AuthFlow='ADMIN_NO_SRP_AUTH',
        AuthParameters={
            'USERNAME': TEST_EMAIL,
            'PASSWORD': TEST_PASSWORD
        }
    )
    
    access_token = auth_response['AuthenticationResult']['AccessToken']
    id_token = auth_response['AuthenticationResult']['IdToken']
    print("✅ Authentication successful")
    
    # Test pipeline generation
    print("\n🚀 Testing pipeline generation...")
    headers = {
        'Authorization': f'Bearer {id_token}',  # Use ID token instead of access token
        'Content-Type': 'application/json'
    }
    
    payload = {
        "rtsp_url": "rtsp://rtspgateway:qOjicr6ro7ER@47.198.161.34/Preview_04_main",
        "mode": "pipeline"
    }
    
    response = requests.post(
        f"{API_BASE_URL}/v1/generate-pipeline",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Body:")
    
    if response.status_code == 200:
        response_json = response.json()
        print(json.dumps(response_json, indent=2))
        
        # Check for Bedrock errors in the response
        if 'result' in response_json:
            result = response_json['result']
            if 'optimization_response' in result and 'Error' in str(result['optimization_response']):
                print("\n❌ BEDROCK ERROR DETECTED:")
                print(result['optimization_response'])
    else:
        print(response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")
