# Camera Management Lambda

**Purpose**: Complete CRUD operations for camera configurations with Cognito authentication  
**Language**: Python 3.11  
**Runtime**: AWS Lambda (512MB memory, 30-second timeout)  

## 📋 **Component Files**

### **Core Lambda Function**
- **`camera_management.py`** - Main Lambda handler
  - Complete CRUD operations (Create, Read, Update, Delete)
  - Cognito authentication and authorization
  - User isolation and multi-tenant support
  - DynamoDB integration with composite keys
  - Secrets Manager integration for secure credential storage
  - Input validation and error handling

### **Dependencies**
- **`camera_requirements.txt`** - Python package dependencies
  - Lightweight dependencies for fast cold starts
  - AWS SDK (boto3) for service integration
  - JSON handling and validation libraries

## 🎯 **Functionality**

### **API Endpoints Handled**
- **`GET /cameras`** - List all cameras for authenticated user
- **`POST /cameras`** - Create new camera configuration
- **`GET /cameras/{camera_id}`** - Get specific camera details
- **`PUT /cameras/{camera_id}`** - Update camera configuration
- **`DELETE /cameras/{camera_id}`** - Delete camera configuration

### **Core Capabilities**
1. **Camera Configuration Management**
   - Store camera metadata (name, location, description)
   - Manage RTSP connection details (URL, resolution, codec)
   - Handle authentication credentials securely
   - Support for multiple camera types and configurations

2. **User Authentication & Authorization**
   - Cognito JWT token validation
   - User identity extraction from tokens
   - Multi-tenant data isolation
   - Role-based access control (future enhancement)

3. **Secure Credential Storage**
   - Secrets Manager integration for RTSP credentials
   - Encrypted storage of sensitive information
   - Automatic credential rotation support
   - Secure retrieval with proper access controls

4. **Data Validation & Error Handling**
   - Comprehensive input validation
   - Proper HTTP status codes and error messages
   - Request/response logging for debugging
   - Graceful error handling and recovery

## 🗄️ **Data Model**

### **DynamoDB Schema**
```json
{
  "TableName": "camera-configurations",
  "KeySchema": [
    {
      "AttributeName": "user_id",
      "KeyType": "HASH"
    },
    {
      "AttributeName": "camera_id", 
      "KeyType": "RANGE"
    }
  ],
  "AttributeDefinitions": [
    {
      "AttributeName": "user_id",
      "AttributeType": "S"
    },
    {
      "AttributeName": "camera_id",
      "AttributeType": "S"
    }
  ]
}
```

### **Camera Configuration Structure**
```json
{
  "user_id": "cognito-user-id",
  "camera_id": "unique-camera-identifier",
  "name": "Camera Display Name",
  "description": "Camera Description",
  "location": "Camera Location",
  "rtsp_url": "rtsp://camera-url",
  "resolution": "1920x1080",
  "codec": "H.264",
  "credentials_secret_arn": "arn:aws:secretsmanager:...",
  "created_at": "2025-08-27T18:00:00Z",
  "updated_at": "2025-08-27T18:00:00Z",
  "status": "active"
}
```

## 🚀 **Deployment**

### **Lambda Configuration**
- **Memory**: 512MB (lightweight operations)
- **Timeout**: 30 seconds (sufficient for CRUD operations)
- **Runtime**: Python 3.11
- **Architecture**: x86_64

### **Environment Variables**
```bash
# DynamoDB Configuration
CAMERA_TABLE_NAME=camera-configurations

# Secrets Manager Configuration
AWS_REGION=us-east-1

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **IAM Permissions Required**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/camera-configurations"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:UpdateSecret",
        "secretsmanager:DeleteSecret"
      ],
      "Resource": "arn:aws:secretsmanager:*:*:secret:camera-credentials/*"
    }
  ]
}
```

## 🔧 **Local Development**

### **Setup**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r camera_requirements.txt

# Set environment variables
export CAMERA_TABLE_NAME=camera-configurations-dev
export AWS_REGION=us-east-1
# ... other environment variables
```

### **Testing**
```bash
# Test camera creation
python3 -c "
from camera_management import lambda_handler
event = {
    'httpMethod': 'POST',
    'path': '/cameras',
    'headers': {'Authorization': 'Bearer jwt-token'},
    'body': '{\"name\": \"Test Camera\", \"rtsp_url\": \"rtsp://test\"}'
}
result = lambda_handler(event, None)
print(result)
"

# Test camera listing
python3 -c "
from camera_management import lambda_handler
event = {
    'httpMethod': 'GET',
    'path': '/cameras',
    'headers': {'Authorization': 'Bearer jwt-token'}
}
result = lambda_handler(event, None)
print(result)
"
```

## 🔐 **Security Features**

### **Authentication & Authorization**
- **JWT Token Validation**: Verify Cognito-issued tokens
- **User Identity Extraction**: Extract user ID from validated tokens
- **Data Isolation**: Ensure users can only access their own cameras
- **Request Validation**: Validate all input parameters and data

### **Secure Credential Management**
- **Secrets Manager Integration**: Store RTSP credentials securely
- **Encryption at Rest**: All data encrypted in DynamoDB and Secrets Manager
- **Access Control**: Proper IAM permissions for service access
- **Audit Logging**: Track all camera configuration changes

### **Input Validation**
```python
# Example validation rules
{
    "name": {"required": True, "max_length": 100},
    "rtsp_url": {"required": True, "format": "url"},
    "resolution": {"pattern": r"^\d+x\d+$"},
    "codec": {"enum": ["H.264", "H.265", "MJPEG"]}
}
```

## 📊 **Performance Characteristics**

### **Resource Usage**
- **Memory**: 100-200MB typical usage (512MB allocated)
- **CPU**: Low (simple CRUD operations)
- **Network**: Minimal (DynamoDB and Secrets Manager calls)
- **Storage**: None (stateless operations)

### **Response Times**
- **Create Camera**: 200-500ms
- **List Cameras**: 100-300ms
- **Get Camera**: 100-200ms
- **Update Camera**: 200-400ms
- **Delete Camera**: 200-400ms

### **Scalability**
- **Concurrent Executions**: Supports high concurrency
- **Cold Start**: <1 second (lightweight dependencies)
- **DynamoDB Scaling**: On-demand scaling for variable workloads
- **Secrets Manager**: Handles high request volumes

## 🔍 **Monitoring & Debugging**

### **CloudWatch Metrics**
- **Invocation Count**: Track API usage patterns
- **Duration**: Monitor response times
- **Error Rate**: Track authentication and validation failures
- **DynamoDB Metrics**: Monitor read/write capacity usage

### **Logging**
```python
# Structured logging example
{
    "timestamp": "2025-08-27T18:00:00Z",
    "level": "INFO",
    "user_id": "cognito-user-id",
    "operation": "create_camera",
    "camera_id": "camera-123",
    "duration_ms": 250,
    "status": "success"
}
```

### **Error Handling**
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Validation Errors**: 400 Bad Request
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

## 🛠️ **API Usage Examples**

### **Create Camera**
```bash
curl -X POST https://api-gateway-url/cameras \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Front Door Camera",
    "description": "Main entrance security camera",
    "location": "Front Door",
    "rtsp_url": "rtsp://192.168.1.100:554/stream1",
    "resolution": "1920x1080",
    "codec": "H.264",
    "username": "admin",
    "password": "secure-password"
  }'
```

### **List Cameras**
```bash
curl -X GET https://api-gateway-url/cameras \
  -H "Authorization: Bearer jwt-token"
```

### **Update Camera**
```bash
curl -X PUT https://api-gateway-url/cameras/camera-123 \
  -H "Authorization: Bearer jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Camera Name",
    "description": "Updated description"
  }'
```

## 🔄 **Migration Support**

### **Data Migration**
- **Legacy Format Support**: Handle old camera configuration formats
- **Batch Migration**: Support for migrating multiple cameras
- **Validation**: Ensure data integrity during migration
- **Rollback**: Support for reverting migrations if needed

### **Schema Evolution**
- **Backward Compatibility**: Support for older API versions
- **Gradual Migration**: Phased approach to schema changes
- **Version Management**: Track schema versions for compatibility

---

**Note**: This Lambda function provides secure, scalable camera configuration management with proper authentication, authorization, and data isolation for the unified streaming platform.
