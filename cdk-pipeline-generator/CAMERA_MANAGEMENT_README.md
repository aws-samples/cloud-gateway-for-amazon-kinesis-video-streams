# Camera Management System

A comprehensive camera management system for RTSP streams with secure credential storage and metadata management.

## 🏗️ Architecture Overview

The camera management system consists of:

- **Frontend**: React component for camera configuration and management
- **Backend**: AWS Lambda function with DynamoDB and Secrets Manager
- **API**: RESTful API Gateway endpoints for CRUD operations
- **Security**: RTSP URLs stored securely in AWS Secrets Manager
- **Storage**: Camera metadata and configurations in DynamoDB

## 📋 Features

### ✅ **Complete CRUD Operations**
- **Create**: Add new camera configurations with RTSP stream testing
- **Read**: List all cameras or get specific camera details
- **Update**: Modify camera settings and metadata
- **Delete**: Remove cameras and associated secrets

### 🔒 **Security Features**
- RTSP URLs stored securely in AWS Secrets Manager
- IAM roles with least-privilege access
- Encrypted DynamoDB table with point-in-time recovery
- Resource-based access controls

### 📊 **Rich Metadata Support**
- Stream characteristics (video/audio codecs, resolution, bitrate)
- Screen capture storage for visual verification
- Installation location and camera details
- Configurable retention periods (0 hours to 5 years)
- ML model selection for future processing

### 🎯 **Smart Testing Integration**
- Automatic RTSP stream testing before saving
- Reuse of existing test results when available
- OpenCV frame capture for visual verification
- Stream diagnostics and validation

## 🚀 Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm
- CDK v2 installed (`npm install -g aws-cdk`)

### Deploy the Infrastructure

```bash
# Navigate to the CDK directory
cd cdk-pipeline-generator

# Install dependencies
npm install

# Deploy the camera management stack
./deploy-camera-management.sh
```

The deployment script will:
1. Check AWS credentials and configuration
2. Bootstrap CDK if needed
3. Deploy the camera management stack
4. Display the API Gateway URL and other outputs

### Update Frontend Configuration

After deployment, update the frontend API configuration:

```typescript
// In frontend-app/src/config/api.ts
export const API_CONFIG = {
  // ... other config
  CAMERA_MANAGEMENT_ENDPOINT: 'https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod',
};
```

## 📡 API Endpoints

### Base URL
```
https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/cameras` | Create new camera |
| `GET` | `/cameras` | List all cameras |
| `GET` | `/cameras/{id}` | Get specific camera |
| `PUT` | `/cameras/{id}` | Update camera |
| `DELETE` | `/cameras/{id}` | Delete camera |

### Request/Response Examples

#### Create Camera
```bash
POST /cameras
Content-Type: application/json

{
  "camera_name": "Front Door Camera",
  "rtsp_url": "rtsp://user:pass@192.168.1.100:554/stream1",
  "make_model": "Hikvision DS-2CD2143G0-IS",
  "installation_location": "Main entrance, facing north, mounted at 8ft height",
  "retention_hours": 168,
  "ml_model": "none",
  "stream_metadata": {
    "video": {
      "codec": "H.264",
      "resolution": "1920x1080",
      "framerate": "30fps"
    }
  },
  "screen_capture_base64": "base64-encoded-image-data",
  "test_status": "tested"
}
```

#### Response
```json
{
  "message": "Camera created successfully",
  "camera": {
    "camera_id": "123e4567-e89b-12d3-a456-426614174000",
    "camera_name": "Front Door Camera",
    "make_model": "Hikvision DS-2CD2143G0-IS",
    "installation_location": "Main entrance, facing north, mounted at 8ft height",
    "retention_hours": 168,
    "ml_model": "none",
    "rtsp_secret_arn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:camera-rtsp-123e4567-e89b-12d3-a456-426614174000",
    "test_status": "tested",
    "created_at": "2024-08-18T20:30:00.000Z",
    "updated_at": "2024-08-18T20:30:00.000Z"
  }
}
```

## 🧪 Testing

### Automated API Testing

Use the provided test script to validate all API endpoints:

```bash
# Get the API URL from deployment outputs
API_URL="https://YOUR-API-ID.execute-api.REGION.amazonaws.com/prod"

# Run the test suite
python3 test-camera-api.py $API_URL
```

The test script will:
1. Create a test camera
2. List all cameras
3. Get the specific camera
4. Update the camera
5. Delete the camera

### Manual Testing

You can also test individual endpoints using curl:

```bash
# List cameras
curl -X GET "$API_URL/cameras"

# Create camera
curl -X POST "$API_URL/cameras" \
  -H "Content-Type: application/json" \
  -d '{"camera_name":"Test Camera","rtsp_url":"rtsp://test","make_model":"Test","installation_location":"Test","retention_hours":24,"ml_model":"none"}'
```

## 🗄️ Database Schema

### DynamoDB Table: `CameraConfigurations`

| Field | Type | Description |
|-------|------|-------------|
| `camera_id` | String (PK) | Unique camera identifier (UUID) |
| `camera_name` | String | User-friendly camera name |
| `make_model` | String | Camera manufacturer and model |
| `installation_location` | String | Physical installation details |
| `retention_hours` | Number | Stream retention period in hours |
| `ml_model` | String | Selected ML model for processing |
| `rtsp_secret_arn` | String | ARN of the Secrets Manager secret |
| `stream_metadata` | Map | JSON metadata from stream testing |
| `screen_capture_base64` | String | Base64 encoded preview image |
| `test_status` | String | "tested" or "not_tested" |
| `created_at` | String | ISO timestamp of creation |
| `updated_at` | String | ISO timestamp of last update |

### Global Secondary Index: `CameraNameIndex`
- Partition Key: `camera_name`
- Allows querying cameras by name

## 🔐 Security Model

### Secrets Manager
- RTSP URLs stored with naming pattern: `camera-rtsp-{camera_id}`
- Secrets tagged with camera metadata for management
- IAM policies restrict access to camera-specific secrets

### IAM Permissions
The Lambda function has permissions for:
- DynamoDB: Read/write access to camera table and indexes
- Secrets Manager: Create, read, update, delete camera secrets
- CloudWatch Logs: Write execution logs

### Data Protection
- DynamoDB table encrypted with AWS managed keys
- Point-in-time recovery enabled
- Secrets Manager provides encryption at rest and in transit

## 🔧 Configuration

### Environment Variables (Lambda)
- `CAMERAS_TABLE_NAME`: DynamoDB table name
- `CAMERAS_TABLE_GSI_NAME`: Global secondary index name
- `SECRETS_PREFIX`: Prefix for Secrets Manager secret names

### Retention Periods
Available retention options (in hours):
- 0 (Zero hours)
- 12 (Half day)
- 24 (One day)
- 168 (One week)
- 336 (Two weeks)
- 720 (One month)
- 2160 (Three months)
- 4320 (Six months)
- 6480 (Nine months)
- 8760 (One year)
- 17520 (Two years)
- 26280 (Three years)
- 35040 (Four years)
- 43800 (Five years)

## 🚨 Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input data or missing required fields
- **404 Not Found**: Camera not found or endpoint doesn't exist
- **500 Internal Server Error**: Server-side errors with detailed logging

All errors return JSON responses with descriptive error messages.

## 📈 Monitoring

### CloudWatch Logs
- Lambda execution logs with structured logging
- API Gateway access logs
- Error tracking and debugging information

### Metrics
- API Gateway request/response metrics
- Lambda execution duration and error rates
- DynamoDB read/write capacity metrics

## 🔄 Future Enhancements

### Planned Features
- Camera health monitoring and alerts
- Bulk camera import/export
- Advanced search and filtering
- Camera grouping and tagging
- Integration with ML processing pipelines
- Real-time stream status monitoring

### ML Model Integration
The `ml_model` field is designed to support future ML processing:
- Object detection models
- Person/vehicle detection
- Custom trained models
- Real-time inference integration

## 🤝 Contributing

When extending the camera management system:

1. Update the CDK stack for infrastructure changes
2. Modify the Lambda function for API changes
3. Update frontend types and API calls
4. Add tests for new functionality
5. Update documentation

## 📚 Related Documentation

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [AWS Lambda Python Runtime](https://docs.aws.amazon.com/lambda/latest/dg/python-programming-model.html)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/latest/developerguide/)
- [AWS Secrets Manager User Guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/)
