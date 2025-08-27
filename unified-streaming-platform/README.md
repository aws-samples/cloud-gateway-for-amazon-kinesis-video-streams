# Unified Streaming Platform

**🎯 Comprehensive serverless streaming platform combining pipeline generation, camera management, and RTSP analysis capabilities**

This unified platform consolidates the Enhanced Pipeline Generator, CDK Pipeline Generator, and Lambda SDP Extractor into a single, cohesive solution with all functionality preserved and enhanced.

## 🏗️ **Component Architecture**

### **📁 Directory Structure**
```
unified-streaming-platform/
├── cdk-infrastructure/          # AWS CDK deployment code
│   ├── enhanced-pipeline-stack.ts    # Main CDK stack
│   ├── app.ts                        # CDK application entry
│   └── [CDK configuration files]
│
├── frontend/                    # React web application
│   ├── src/                          # React source code
│   ├── public/                       # Static assets
│   ├── package.json                  # Frontend dependencies
│   └── [React app configuration]
│
├── lambda-enhanced-pipeline/    # AI-powered pipeline generation
│   ├── enhanced_lambda_function.py   # Main Lambda handler
│   ├── gstreamer_expert.py          # Expert system engine
│   ├── rtsp_analysis.py             # RTSP analysis engine
│   └── [Python dependencies]
│
├── lambda-camera-management/    # Camera CRUD operations
│   ├── camera_management.py         # Camera management handler
│   └── camera_requirements.txt      # Lightweight dependencies
│
├── rtsp-test-server/           # Comprehensive RTSP testing
│   ├── Enhanced server (50+ streams, 85% camera coverage)
│   ├── Authentication support (Basic/Digest)
│   ├── Professional resolutions (up to 1080p@60fps)
│   └── Comprehensive validation framework
│
├── testing/                    # Consolidated testing suite
│   ├── Authentication testing
│   ├── API validation scripts
│   └── Integration test framework
│
├── PROJECT_PLAN.md            # Comprehensive roadmap
├── UNIFIED_STREAMING_PLATFORM_SPECIFICATION.md
└── deploy.sh                  # Unified deployment script
```

## 🎯 **Core Components**

### **1. CDK Infrastructure** ([`cdk-infrastructure/`](./cdk-infrastructure/))
**Purpose**: AWS deployment and resource management  
**Technology**: TypeScript, AWS CDK v2  

**Key Features**:
- ✅ **Unified CDK Stack** with shared infrastructure
- ✅ **API Gateway** with 12 consolidated endpoints
- ✅ **Dual Lambda Architecture** (Enhanced Pipeline + Camera Management)
- ✅ **DynamoDB Integration** for camera configurations
- ✅ **Cognito Authentication** with user isolation
- ✅ **Secrets Manager** for secure credential storage
- ✅ **Optional RTSP Test Server** deployment

### **2. Frontend Application** ([`frontend/`](./frontend/))
**Purpose**: React-based web interface for the unified streaming platform  
**Technology**: React 18, TypeScript, Vite, Cloudscape Design System  
**Hosting**: S3 + CloudFront via CDK  

**Key Features**:
- 🔐 **Cognito Authentication** - User login and registration (existing User Pool)
- 📋 **Camera Management UI** - Web interface for camera CRUD operations
- 🎬 **Pipeline Generation Interface** - AI-powered pipeline creation
- 📊 **Stream Analysis Dashboard** - RTSP characteristics and frame extraction
- 🧪 **Testing Interface** - Integration with RTSP Test Server
- 🎨 **Cloudscape Design** - AWS-native UI components

### **3. Enhanced Pipeline Lambda** ([`lambda-enhanced-pipeline/`](./lambda-enhanced-pipeline/))
**Purpose**: AI-powered GStreamer pipeline generation with RTSP analysis  
**Technology**: Python 3.11, OpenCV, AWS Bedrock  
**Resources**: 3GB memory, 10-minute timeout  

**Key Features**:
- 🧠 **AI-Powered Expertise** - 324-document knowledge base with Claude Opus 4.1
- 🔍 **Real-time RTSP Analysis** - SDP parsing, codec detection, authentication handling
- 📸 **OpenCV Frame Extraction** - Visual stream sampling and analysis
- 🛠️ **7 Specialized Tools** for different GStreamer use cases
- 🎯 **Platform Intelligence** - Automatic optimization for macOS, Linux, Windows

### **4. Camera Management Lambda** ([`lambda-camera-management/`](./lambda-camera-management/))
**Purpose**: Complete CRUD operations for camera configurations  
**Technology**: Python 3.11, DynamoDB, Cognito  
**Resources**: 512MB memory, 30-second timeout  

**Key Features**:
- 📋 **Complete CRUD Operations** - Create, Read, Update, Delete cameras
- 🔐 **Cognito Authentication** - JWT token validation and user isolation
- 🗄️ **DynamoDB Storage** - Scalable camera configuration storage
- 🔒 **Secrets Manager Integration** - Secure credential management
- 👥 **Multi-tenant Support** - User isolation and data security

### **5. RTSP Test Server** ([`rtsp-test-server/`](./rtsp-test-server/))
**Purpose**: Industry-leading RTSP endpoint testing (85% camera coverage)  
**Technology**: Python 3.11, GStreamer, Docker  

**Key Features**:
- 📺 **50+ Stream Matrix** - Comprehensive codec and resolution coverage
- 🔐 **Authentication Support** - Basic and Digest auth with real-world credentials
- 🌐 **Transport Protocols** - UDP and TCP support with URL parameter selection
- 📊 **Professional Resolutions** - Up to 1080p@60fps with quality variations
- 🧪 **Enhanced Testing Framework** - Comprehensive validation scripts

### **6. Testing Suite** ([`testing/`](./testing/))
**Purpose**: Consolidated testing and validation framework  
**Technology**: Bash, Python, GStreamer  

**Key Features**:
- 🔐 **Authentication Testing** - Basic and Digest auth validation
- 🧪 **API Validation** - Comprehensive endpoint testing
- 📸 **Frame Extraction Testing** - OpenCV integration validation
- 🎯 **Integration Testing** - End-to-end scenario validation

## 🚀 **Quick Start**

### **Prerequisites**
- AWS CLI configured with `malone-aws` profile
- Node.js 18+ and npm installed
- Python 3.11+ with pip
- Docker (for RTSP Test Server)

### **One-Command Deployment**
```bash
# Deploy the complete unified platform (backend + frontend + RTSP test server)
./deploy.sh

# Deploy without RTSP Test Server
./deploy.sh --no-rtsp-test-server

# Deploy backend only (no frontend or RTSP server)
./deploy.sh --no-frontend --no-rtsp-test-server
```

### **Manual Deployment**
```bash
# 1. Deploy CDK infrastructure
cd cdk-infrastructure/
npm install
cdk deploy --profile malone-aws

# 2. Build and deploy frontend (optional)
cd ../frontend/
npm install
npm run build
# Frontend automatically deployed via CDK S3 deployment

# 3. Test the deployment
cd ../testing/
./test-basic-functionality.sh

# 4. Optional: Deploy RTSP Test Server
cd ../rtsp-test-server/
docker build -t rtsp-test-server .
# Deploy to ECS (via CDK parameter)
```

## 📊 **API Endpoints**

### **Pipeline Generation** (Enhanced Pipeline Lambda)
- **`POST /v1/generate-pipeline`** - Generate optimized GStreamer pipelines
- **`POST /v1/characteristics`** - Extract RTSP stream characteristics
- **`POST /v1/tools/search-elements`** - Search GStreamer elements
- **`POST /v1/tools/get-documentation`** - Get element documentation
- **`POST /v1/tools/troubleshoot`** - Troubleshoot pipeline issues
- **`POST /v1/tools/optimize`** - Optimize pipeline performance
- **`POST /v1/tools/validate`** - Validate pipeline compatibility

### **Camera Management** (Camera Management Lambda)
- **`GET /cameras`** - List all cameras for authenticated user
- **`POST /cameras`** - Create new camera configuration
- **`GET /cameras/{camera_id}`** - Get specific camera details
- **`PUT /cameras/{camera_id}`** - Update camera configuration
- **`DELETE /cameras/{camera_id}`** - Delete camera configuration

## 🧪 **Testing & Validation**

### **Component Testing**
```bash
# Test Enhanced Pipeline Lambda
cd lambda-enhanced-pipeline/
python3 enhanced_lambda_function.py

# Test Camera Management Lambda
cd lambda-camera-management/
python3 camera_management.py

# Test RTSP Test Server
cd rtsp-test-server/
./validate-enhanced-rtsp-server.sh --quick
```

### **Integration Testing**
```bash
# Run comprehensive testing suite
cd testing/
./test-basic-functionality.sh
./test-authentication.sh
python3 validate_all_tests.py
```

### **RTSP Testing Framework**
```bash
# Comprehensive RTSP validation (50+ streams)
cd rtsp-test-server/
./validate-enhanced-rtsp-server.sh

# Quick validation for CI/CD
./validate-enhanced-rtsp-server.sh --quick

# Authentication-only testing
./validate-enhanced-rtsp-server.sh --auth-only
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_PROFILE=malone-aws

# Bedrock Configuration
BEDROCK_AGENT_ID=L60IDME1CM
BEDROCK_AGENT_ALIAS_ID=LOZ5ZB4MAS
KNOWLEDGE_BASE_ID=5CGJIOV1QM

# DynamoDB Configuration
CAMERA_TABLE_NAME=camera-configurations

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
```

### **CDK Parameters**
```bash
# Deploy with RTSP Test Server
cdk deploy --parameters DeployRtspTestServer=true

# Deploy to specific environment
cdk deploy --parameters Environment=production
```

## 📈 **Performance & Scaling**

### **Lambda Performance**
- **Enhanced Pipeline**: 3GB memory, 10-minute timeout (AI processing)
- **Camera Management**: 512MB memory, 30-second timeout (CRUD operations)
- **Cold Start**: <2 seconds for camera management, <5 seconds for enhanced pipeline
- **Concurrent Executions**: Supports high concurrency for both functions

### **Storage & Database**
- **DynamoDB**: On-demand scaling with encryption at rest
- **Secrets Manager**: Secure credential storage with automatic rotation support
- **S3**: Optional storage for frame extraction results

### **API Gateway**
- **Rate Limiting**: Configurable per-endpoint rate limits
- **CORS**: Enabled for web application integration
- **Authentication**: Cognito integration for secure access

## 🔍 **Monitoring & Logging**

### **CloudWatch Integration**
- **Lambda Metrics**: Duration, error rate, invocation count
- **API Gateway Metrics**: Request count, latency, error rate
- **DynamoDB Metrics**: Read/write capacity, throttling
- **Custom Metrics**: Application-specific monitoring

### **Logging Strategy**
- **Structured Logging**: JSON format for easy parsing
- **Request Tracing**: Full request/response logging
- **Error Details**: Comprehensive error information
- **Performance Metrics**: Timing for different operations

## 🛠️ **Development**

### **Local Development**
```bash
# Set up Enhanced Pipeline Lambda
cd lambda-enhanced-pipeline/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set up Camera Management Lambda
cd lambda-camera-management/
python3 -m venv venv
source venv/bin/activate
pip install -r camera_requirements.txt

# Set up CDK Infrastructure
cd cdk-infrastructure/
npm install
```

### **Testing Locally**
```bash
# Test Lambda functions locally
python3 -c "
from enhanced_lambda_function import lambda_handler
event = {'httpMethod': 'POST', 'path': '/v1/generate-pipeline'}
result = lambda_handler(event, None)
print(result)
"
```

## 📋 **Documentation**

### **Component Documentation**
- **[CDK Infrastructure](./cdk-infrastructure/README.md)** - Deployment and infrastructure
- **[Enhanced Pipeline Lambda](./lambda-enhanced-pipeline/README.md)** - AI-powered pipeline generation
- **[Camera Management Lambda](./lambda-camera-management/README.md)** - Camera CRUD operations
- **[RTSP Test Server](./rtsp-test-server/README.md)** - Comprehensive RTSP testing
- **[Testing Suite](./testing/README.md)** - Consolidated testing framework

### **Project Documentation**
- **[System Specification](./UNIFIED_STREAMING_PLATFORM_SPECIFICATION.md)** - Complete technical specification
- **[Project Plan](./PROJECT_PLAN.md)** - Comprehensive roadmap and next steps

## 🚀 **Next Steps**

See **[PROJECT_PLAN.md](./PROJECT_PLAN.md)** for detailed roadmap including:
- **Phase 3A**: AWS deployment testing (2-3 weeks)
- **Phase 3B**: 4K support and 95% camera coverage (4-6 weeks)
- **Phase 4**: 8K support and 99% camera coverage (6-8 weeks)

---

**🎯 Ready to deploy the unified streaming platform? Start with `./deploy.sh` and follow the comprehensive testing framework!**
