# Frontend Configuration Generator

This directory contains an automated system for generating frontend configuration files from CDK stack outputs.

## 🎯 **Overview**

The frontend configuration system eliminates manual configuration errors by automatically generating `frontend-config.json` from your deployed CDK stack outputs.

## 📁 **Files**

- **`frontend-config-template.json`** - Template with placeholders for CDK outputs
- **`generate-frontend-config.sh`** - Automated generation script  
- **`frontend-config.json`** - Generated configuration (auto-created, gitignored)
- **`FRONTEND_CONFIG_README.md`** - This documentation

## 🚀 **Quick Start**

### Automatic Generation (Recommended)
The frontend config is automatically generated during deployment:
```bash
./deploy.sh
```

### Manual Generation
Generate the config file manually anytime:
```bash
./generate-frontend-config.sh
```

## 📋 **Generated Configuration Structure**

```json
{
  "aws": {
    "region": "us-east-1",
    "accountId": "418265330172"
  },
  "cognito": {
    "userPoolId": "us-east-1_yMrNPqCOf",
    "userPoolWebClientId": "1lpt1d27acn11fcs998bquqhll",
    "userPoolNativeClientId": "2e43phqj923g8555a7ja2gbuqj",
    "region": "us-east-1"
  },
  "api": {
    "baseUrl": "https://fesxn1owye.execute-api.us-east-1.amazonaws.com/prod/",
    "gatewayId": "fesxn1owye",
    "stage": "prod",
    "endpoints": {
      "pipelineGeneration": "/v1/generate-pipeline",
      "rtspCharacteristics": "/v1/characteristics",
      "gstreamerTools": {
        "searchElements": "/v1/tools/search-elements",
        "troubleshoot": "/v1/tools/troubleshoot",
        "optimize": "/v1/tools/optimize",
        "validate": "/v1/tools/validate",
        "expert": "/v1/tools/expert"
      },
      "cameraManagement": {
        "list": "/cameras",
        "create": "/cameras",
        "get": "/cameras/{id}",
        "update": "/cameras/{id}",
        "delete": "/cameras/{id}"
      }
    }
  },
  "backend": {
    "knowledgeBaseId": "5CGJIOV1QM",
    "claudeModel": "us.anthropic.claude-opus-4-1-20250805-v1:0",
    "enhancedLambdaFunction": "UnifiedStreamingPlatformS-EnhancedPipelineFunction-WO5nSFMiVEpw",
    "cameraLambdaFunction": "UnifiedStreamingPlatformS-CameraManagementFunction-ClP9DYKvoHwG",
    "camerasTable": "CameraConfigurations"
  },
  "rtspTestServer": {
    "enabled": true,
    "cluster": "rtsp-test-server-cluster",
    "service": "UnifiedStreamingPlatformStack-RTSPTestServiceB5476C96-0DzD3YuS4RwP",
    "ports": {
      "rtsp": 8554,
      "http": 8080,
      "https": 8443,
      "admin": 8888
    },
    "testStreams": [
      "rtsp://3.94.214.20:8554/h264_720p_25fps",
      "rtsp://3.94.214.20:8554/h264_360p_15fps_aac",
      "rtsp://3.94.214.20:8554/h265_720p_25fps",
      "rtsp://3.94.214.20:8554/h265_360p_15fps_aac"
    ]
  },
  "authentication": {
    "tokenType": "idToken",
    "authFlow": "ADMIN_NO_SRP_AUTH",
    "usernameFormat": "email"
  }
}
```

## 🔧 **How It Works**

1. **Template Processing**: Reads `frontend-config-template.json` with placeholders
2. **CDK Output Retrieval**: Fetches outputs from `UnifiedStreamingPlatformStack`
3. **Placeholder Replacement**: Replaces all `{{ REPLACE_WITH_CDK_OUTPUT_* }}` placeholders
4. **RTSP IP Detection**: Automatically discovers RTSP Test Server public IP
5. **File Generation**: Creates `frontend-config.json` with real values

## 📊 **Automatic Values**

The script automatically populates:

### **AWS Configuration**
- Account ID and Region from CDK outputs

### **Cognito Authentication**
- User Pool ID and Client IDs from CDK-created resources
- Proper email-as-username configuration

### **API Configuration**  
- Base URL, Gateway ID, and Stage from deployed API Gateway
- All endpoint paths for pipeline generation and camera management

### **Backend Resources**
- Lambda function names and DynamoDB table names
- Knowledge Base ID and Claude model configuration

### **RTSP Test Server**
- ECS cluster and service names
- **Public IP auto-detection** from running ECS tasks
- Pre-configured test stream URLs

## 🛠️ **Customization**

### **Modify Template**
Edit `frontend-config-template.json` to add new configuration sections:
```json
{
  "myCustomSection": {
    "value": "{{ REPLACE_WITH_CDK_OUTPUT_MyCustomOutput }}"
  }
}
```

### **Add CDK Outputs**
Add corresponding outputs to your CDK stack:
```typescript
new cdk.CfnOutput(this, 'MyCustomOutput', {
  value: myCustomValue,
  description: 'My custom configuration value'
});
```

### **Update Script**
Add replacement logic to `generate-frontend-config.sh`:
```bash
MY_CUSTOM_VALUE=$(get_output_value "MyCustomOutput")
CONFIG_CONTENT=$(echo "$CONFIG_CONTENT" | sed "s/{{ REPLACE_WITH_CDK_OUTPUT_MyCustomOutput }}/$MY_CUSTOM_VALUE/g")
```

## 🔄 **Integration Points**

### **Deployment Integration**
The script is automatically called by `deploy.sh` after successful CDK deployment.

### **Frontend Applications**
Copy the generated `frontend-config.json` to your frontend application:

```bash
# React/Vue/Angular applications
cp frontend-config.json ../frontend-app/src/config/

# Static websites
cp frontend-config.json ../website/assets/config/

# Mobile applications
cp frontend-config.json ../mobile-app/src/config/
```

### **CI/CD Integration**
Include in your deployment pipeline:
```yaml
# GitHub Actions example
- name: Generate Frontend Config
  run: |
    cd unified-streaming-platform
    ./generate-frontend-config.sh
    cp frontend-config.json ../frontend-app/src/config/
```

## 🔍 **Troubleshooting**

### **Missing CDK Outputs**
```bash
❌ Missing required CDK outputs:
   - COGNITO_USER_POOL_ID
```
**Solution**: Ensure CDK stack is deployed and outputs are defined.

### **RTSP IP Detection Failed**
```bash
⚠️  Could not automatically determine RTSP Test Server Public IP
```
**Solution**: Manually replace `REPLACE_WITH_RTSP_SERVER_PUBLIC_IP` in the generated config.

### **AWS Credentials Issues**
```bash
❌ AWS credentials not configured for profile malone-aws
```
**Solution**: Configure AWS CLI with `aws configure --profile malone-aws`

### **Stack Not Found**
```bash
❌ Failed to get CDK stack outputs
```
**Solution**: Verify stack name and ensure it's deployed in the correct region.

## 📝 **Best Practices**

### **Version Control**
- ✅ **Commit**: `frontend-config-template.json` (template)
- ✅ **Commit**: `generate-frontend-config.sh` (generator script)
- ❌ **Don't Commit**: `frontend-config.json` (environment-specific)

### **Environment Management**
- Use different templates for different environments
- Generate separate configs for dev/staging/prod
- Include environment identifier in generated config

### **Security**
- Generated config contains public endpoints only
- No secrets or credentials are included
- RTSP Test Server IP is public by design

### **Automation**
- Run generation after every deployment
- Include in CI/CD pipelines
- Validate generated config before use

## 🎯 **Benefits**

✅ **Eliminates Manual Errors** - No more copy/paste mistakes  
✅ **Always Up-to-Date** - Config matches deployed infrastructure  
✅ **Automatic IP Detection** - RTSP server IP discovered automatically  
✅ **Environment Agnostic** - Works across dev/staging/prod  
✅ **CI/CD Ready** - Easy integration with deployment pipelines  
✅ **Type Safety** - Consistent structure for frontend applications  

## 🔗 **Related Documentation**

- [Deployment Guide](./README.md) - Main deployment instructions
- [Testing Guide](./testing/DYNAMIC_CONFIG_README.md) - Dynamic configuration for tests
- [CDK Stack Documentation](./cdk-infrastructure/README.md) - Infrastructure details
