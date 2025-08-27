# Dynamic Configuration for Test Scripts

## Overview

All test scripts have been updated to **dynamically fetch CDK stack outputs** instead of using hardcoded Cognito User Pool and API Gateway values. This makes the test suite portable and ensures it works with any deployment of the unified streaming platform.

## What Changed

### ❌ **Before (Hardcoded)**
```bash
USER_POOL_ID="us-east-1_Q1jWhy4hd"
CLIENT_ID="33or6k033pn7jgjq8gbmfs2gu3"
API_BASE_URL="https://ru12gtmwv0.execute-api.us-east-1.amazonaws.com/prod"
```

### ✅ **After (Dynamic)**
```bash
# Get CDK stack outputs
source "./get-stack-outputs.sh"
# Now USER_POOL_ID, CLIENT_ID, API_BASE_URL are set dynamically
```

## Updated Test Scripts

### **Bash Scripts**
- ✅ `comprehensive-api-test.sh` - Uses `get-stack-outputs.sh`
- ✅ `quick-auth-test.sh` - Uses `get-stack-outputs.sh`
- ✅ `quick-auth-test-fixed.sh` - Uses `get-stack-outputs.sh`

### **Python Scripts**
- ✅ `comprehensive-api-test.py` - Uses `get_stack_outputs()` function
- ✅ `cognito-auth-test.py` - Uses `get_stack_outputs()` function

### **JavaScript Scripts**
- ✅ `cognito-auth-test.js` - Uses `getStackOutputs()` function

## Helper Script

### `get-stack-outputs.sh`
This helper script:
1. Fetches CDK stack outputs using AWS CLI
2. Exports them as environment variables
3. Validates that required values are present
4. Provides clear error messages if CDK stack is not deployed

**Usage:**
```bash
source "./get-stack-outputs.sh"
echo "User Pool ID: $USER_POOL_ID"
```

## How It Works

### **For Bash Scripts:**
```bash
# Get CDK stack outputs
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/get-stack-outputs.sh"

# Now use the dynamic values
echo "Testing with User Pool: $USER_POOL_ID"
```

### **For Python Scripts:**
```python
def get_stack_outputs():
    """Get CDK stack outputs dynamically"""
    result = subprocess.run([
        'aws', 'cloudformation', 'describe-stacks',
        '--stack-name', 'UnifiedStreamingPlatformStack',
        '--profile', 'malone-aws',
        '--region', 'us-east-1',
        '--query', 'Stacks[0].Outputs',
        '--output', 'json'
    ], capture_output=True, text=True, check=True)
    
    outputs = json.loads(result.stdout)
    return {output['OutputKey']: output['OutputValue'] for output in outputs}

# Usage
outputs = get_stack_outputs()
USER_POOL_ID = outputs['CognitoUserPoolId']
```

## Benefits

### ✅ **Portability**
- Test scripts work with any deployment
- No hardcoded account-specific values
- Can be used across different AWS accounts/regions

### ✅ **Maintainability**
- Single source of truth (CDK stack outputs)
- No need to update test scripts when resources change
- Automatic synchronization with deployed infrastructure

### ✅ **Error Prevention**
- Eliminates copy/paste errors with hardcoded values
- Clear error messages when CDK stack is not deployed
- Validation that all required outputs are present

## Prerequisites

### **CDK Stack Must Be Deployed**
All test scripts now require the CDK stack to be deployed first:

```bash
# Deploy the stack
./deploy.sh

# Then run tests
./comprehensive-api-test.sh
```

### **AWS CLI Configuration**
Test scripts require AWS CLI to be configured with the `malone-aws` profile:

```bash
aws configure --profile malone-aws
```

## Error Handling

### **Stack Not Deployed**
```
❌ Failed to get CDK stack outputs
Make sure the CDK stack is deployed: ./deploy.sh
```

### **Missing Outputs**
```
❌ Missing required CDK outputs:
   USER_POOL_ID: NOT_FOUND
   CLIENT_ID: NOT_FOUND
   API_BASE_URL: NOT_FOUND
```

### **AWS CLI Issues**
```
❌ AWS credentials not configured for profile: malone-aws
```

## Migration Notes

### **Backward Compatibility**
- Old hardcoded values are completely removed
- Test scripts will fail gracefully if CDK stack is not deployed
- Clear error messages guide users to deploy the stack first

### **New Workflow**
1. **Deploy CDK Stack**: `./deploy.sh`
2. **Run Tests**: `./comprehensive-api-test.py`
3. **Tests Automatically Use Current Deployment**

## Validation

All updated test scripts have been validated to:
- ✅ Successfully retrieve CDK outputs
- ✅ Handle missing stack gracefully
- ✅ Provide clear error messages
- ✅ Work with the new Cognito User Pool created by CDK
- ✅ Maintain all existing test functionality

This ensures that the test suite is now **fully portable** and **automatically synchronized** with the deployed infrastructure! 🚀
