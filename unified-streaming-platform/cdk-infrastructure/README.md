# CDK Infrastructure

**Purpose**: AWS CDK infrastructure code for deploying the unified streaming platform  
**Language**: TypeScript  
**Framework**: AWS CDK v2  

## 📋 **Component Files**

### **Core Infrastructure**
- **`enhanced-pipeline-stack.ts`** - Main CDK stack definition
  - API Gateway with unified endpoints
  - Lambda functions (Enhanced Pipeline + Camera Management)
  - DynamoDB table for camera configurations
  - Secrets Manager integration
  - Cognito authentication
  - Optional RTSP Test Server deployment

### **CDK Configuration**
- **`app.ts`** - CDK application entry point
- **`cdk.json`** - CDK configuration and feature flags
- **`package.json`** - Node.js dependencies and scripts
- **`tsconfig.json`** - TypeScript compiler configuration

## 🚀 **Deployment**

### **Prerequisites**
- AWS CLI configured with appropriate permissions
- Node.js 18+ and npm installed
- AWS CDK v2 installed globally

### **Setup**
```bash
# Install dependencies
npm install

# Bootstrap CDK (first time only)
cdk bootstrap --profile malone-aws

# Deploy the stack
cdk deploy --profile malone-aws

# Deploy with RTSP Test Server
cdk deploy --parameters DeployRtspTestServer=true --profile malone-aws
```

### **Stack Outputs**
After deployment, the stack provides:
- **API Gateway URL** - Base URL for all endpoints
- **Enhanced Pipeline Lambda ARN** - Pipeline generation function
- **Camera Management Lambda ARN** - Camera CRUD operations function
- **DynamoDB Table Name** - Camera configurations storage
- **Cognito User Pool ID** - Authentication service

## 🔧 **Configuration**

### **Stack Parameters**
- **`DeployRtspTestServer`** - Optional RTSP Test Server deployment (default: false)
- **`Environment`** - Deployment environment (dev/staging/prod)

### **Resource Configuration**
- **Enhanced Pipeline Lambda**: 3GB memory, 10-minute timeout
- **Camera Management Lambda**: 512MB memory, 30-second timeout
- **DynamoDB**: On-demand billing, encryption at rest
- **API Gateway**: REST API with CORS enabled

## 📊 **Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    CDK Stack Resources                      │
├─────────────────────────────────────────────────────────────┤
│  API Gateway (REST)                                         │
│  ├── /v1/generate-pipeline (Enhanced Pipeline Lambda)       │
│  ├── /v1/characteristics (Enhanced Pipeline Lambda)         │
│  ├── /v1/tools/* (Enhanced Pipeline Lambda)                 │
│  └── /cameras/* (Camera Management Lambda)                  │
├─────────────────────────────────────────────────────────────┤
│  Lambda Functions                                           │
│  ├── Enhanced Pipeline (3GB, 10min)                        │
│  └── Camera Management (512MB, 30s)                        │
├─────────────────────────────────────────────────────────────┤
│  Storage & Authentication                                   │
│  ├── DynamoDB Table (camera-configurations)                │
│  ├── Secrets Manager (camera credentials)                  │
│  └── Cognito User Pool (authentication)                    │
├─────────────────────────────────────────────────────────────┤
│  Optional Components                                        │
│  └── RTSP Test Server (ECS Fargate)                        │
└─────────────────────────────────────────────────────────────┘
```

## 🔍 **Monitoring & Logging**

### **CloudWatch Integration**
- **Lambda Logs**: Automatic log group creation
- **API Gateway Logs**: Request/response logging
- **DynamoDB Metrics**: Read/write capacity monitoring
- **Custom Metrics**: Application-specific monitoring

### **Error Handling**
- **Lambda Error Handling**: Proper error responses and logging
- **API Gateway Error Responses**: Standardized error formats
- **DynamoDB Error Handling**: Retry logic and error reporting

## 🛠️ **Development**

### **Local Development**
```bash
# Compile TypeScript
npm run build

# Run CDK commands
cdk diff --profile malone-aws
cdk synth --profile malone-aws
```

### **Testing**
```bash
# Run CDK tests (if available)
npm test

# Validate CDK template
cdk synth --validation
```

## 📝 **Maintenance**

### **Updates**
- **CDK Version Updates**: Regular updates to latest CDK version
- **Dependency Updates**: Keep Node.js dependencies current
- **Security Updates**: Monitor and apply security patches

### **Cost Optimization**
- **Lambda Provisioned Concurrency**: Consider for high-traffic scenarios
- **DynamoDB Capacity**: Monitor and adjust based on usage
- **API Gateway Caching**: Enable for frequently accessed endpoints

---

**Note**: This infrastructure supports the complete unified streaming platform including pipeline generation, camera management, and optional RTSP testing capabilities.
