# Cloud Gateway for Amazon Kinesis Video Streams + Unified Streaming Platform

**🎯 Consolidation Complete: Unified Serverless Streaming Platform**

This repository provides a comprehensive solution for ingesting RTSP video streams to Amazon Kinesis Video Streams, featuring a consolidated unified streaming platform that combines pipeline generation, camera management, and RTSP analysis capabilities.

## 🚀 **NEW: Unified Streaming Platform**

**Consolidation Phase** has successfully merged the Enhanced Pipeline Generator, CDK Pipeline Generator, and Lambda SDP Extractor into a single, comprehensive `unified-streaming-platform` with all functionality preserved and enhanced.

### **🧠 Unified Platform Features**
- **Pipeline Generation**: Advanced GStreamer pipeline creation with 324-document knowledge base
- **Camera Management**: Complete CRUD operations with Cognito authentication and DynamoDB storage
- **RTSP Analysis**: SDP parsing, codec detection, and stream characteristics extraction
- **OpenCV Integration**: Real-time frame capture and analysis capabilities
- **Expert System**: 7 specialized tools with Claude Opus 4.1 intelligence
- **Platform Intelligence**: Automatic optimization for macOS, Linux, and Windows

### **🔧 Consolidated Architecture**
- **Single CDK Stack**: Unified deployment with shared infrastructure
- **Dual Lambda Functions**: Enhanced Pipeline (3GB, 10min) + Camera Management (512MB, 30s)
- **Unified API Gateway**: 12 endpoints covering all functionality
- **Integrated Security**: Secrets Manager, Cognito authentication, user isolation
- **AI-Powered Pipeline Generation**: Uses Amazon Bedrock agents for optimized pipelines
- **Serverless Architecture**: Fully serverless using AWS Lambda and API Gateway

**Quick Start**: See [`unified-streaming-platform/README.md`](./unified-streaming-platform/README.md) for deployment instructions.

**📋 Project Roadmap**: See [`PROJECT_ROADMAP.md`](./PROJECT_ROADMAP.md) for development priorities and future enhancements.

## 📚 **Documentation Organization**

### **Component-Specific Documentation**
- **Unified Streaming Platform**: [`unified-streaming-platform/`](./unified-streaming-platform/)
  - [`UNIFIED_STREAMING_PLATFORM_SPECIFICATION.md`](./unified-streaming-platform/UNIFIED_STREAMING_PLATFORM_SPECIFICATION.md) - Complete system specification
  - [`README.md`](./unified-streaming-platform/README.md) - Component overview and deployment
  - [`deploy.sh`](./unified-streaming-platform/deploy.sh) - Deployment script

- **RTSP Test Server**: [`unified-streaming-platform/rtsp-test-server/`](./unified-streaming-platform/rtsp-test-server/)
  - [`RTSP_TEST_SERVER_SPECIFICATION.md`](./unified-streaming-platform/rtsp-test-server/RTSP_TEST_SERVER_SPECIFICATION.md) - Technical specification
  - [`RTSP_TEST_SERVER_ENHANCEMENT_SUMMARY.md`](./unified-streaming-platform/rtsp-test-server/RTSP_TEST_SERVER_ENHANCEMENT_SUMMARY.md) - Latest enhancements
  - [`VALIDATION_GUIDE.md`](./unified-streaming-platform/rtsp-test-server/VALIDATION_GUIDE.md) - Testing framework guide
  - [`validate-enhanced-rtsp-server.sh`](./unified-streaming-platform/rtsp-test-server/validate-enhanced-rtsp-server.sh) - Comprehensive validation script

- **GStreamer Expert System**: [`gstreamer-expert-system/`](./gstreamer-expert-system/)
  - MCP server for Q CLI integration
  - 324-document knowledge base
  - 7 specialized tools for GStreamer assistance

### **Project-Level Documentation**
- [`DOCUMENTATION_ORGANIZATION.md`](./DOCUMENTATION_ORGANIZATION.md) - Documentation structure guide
- [`AWS_SETUP.md`](./AWS_SETUP.md) - AWS configuration instructions
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) - Contribution guidelines

## 🏗️ **Complete Solution Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│           Cloud Gateway + GStreamer Expert System          │
├─────────────────────────────────────────────────────────────┤
│  Enhanced Pipeline Generator (NEW - Phase 7)               │
│  ├── Expert System Integration (324-doc knowledge base)    │
│  ├── RTSP Analysis + OpenCV Frame Extraction              │
│  ├── 7 Specialized GStreamer Tools                        │
│  └── Claude Opus 4.1 Pipeline Generation                  │
├─────────────────────────────────────────────────────────────┤
│  Original Solutions (Maintained)                           │
│  ├── Serverless Pipeline Generator                         │
│  ├── Fargate-based Cloud Gateway                          │
│  ├── EC2-based Cloud Gateway                              │
│  └── Frontend Application                                  │
├─────────────────────────────────────────────────────────────┤
│  GStreamer Expert System (Integrated)                      │
│  ├── MCP Server Implementation                             │
│  ├── Knowledge Base Management                             │
│  ├── Testing & Validation Framework                       │
│  └── Q CLI Integration                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 **Unified Streaming Platform** (Recommended)

The **Unified Streaming Platform** represents the consolidated evolution of this project, combining all pipeline generation, camera management, and RTSP analysis capabilities into a single, comprehensive solution:

### **Immediate Benefits**
- **🚀 Expert-Level Pipeline Generation**: 324-document knowledge base with Claude Opus 4.1
- **🔧 7 Specialized Tools**: Element search, troubleshooting, optimization, validation
- **📡 Complete RTSP Analysis**: Stream characteristics, authentication, frame extraction
- **⚡ Production-Ready**: Serverless architecture with comprehensive error handling

### **Quick Deployment**
```bash
cd unified-streaming-platform
./deploy.sh
```

### **API Usage Examples**
```bash
# Enhanced pipeline generation with stream analysis
curl -X POST https://your-api-endpoint/v1/generate-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "rtsp_url": "rtsp://username:password@camera-ip/stream",
    "mode": "pipeline",
    "analyze_stream": true
  }'

# Specialized troubleshooting
curl -X POST https://your-api-endpoint/v1/tools/troubleshoot \
  -H "Content-Type: application/json" \
  -d '{
    "pipeline": "gst-launch-1.0 rtspsrc ! kvssink",
    "issue": "green screen artifacts"
  }'
```

**📚 Complete Documentation**: [`enhanced-pipeline-generator/README.md`](./enhanced-pipeline-generator/README.md)

---

## 📁 **Project Structure**

```
cloud-gateway-for-amazon-kinesis-video-streams/
├── unified-streaming-platform/      # 🎯 CONSOLIDATED: Complete streaming solution
│   ├── enhanced_lambda_function.py  #   ├── Pipeline generation with expert system
│   ├── camera_management.py         #   ├── Camera CRUD operations
│   ├── rtsp_analysis.py             #   ├── RTSP stream analysis & SDP parsing
│   ├── enhanced-pipeline-stack.ts   #   ├── Unified CDK infrastructure
│   └── deploy.sh                    #   └── Single deployment script
├── migration-scripts/               # 🔄 Preserved migration utilities
├── gstreamer-expert-system/         # 🧠 Expert system components (integrated)
├── fargate-cdk-app/                # 🐳 Fargate-based gateway
├── ec2-cdk-app/                    # 🖥️  EC2-based gateway
├── frontend-app/                   # 🌐 React frontend application
├── docker-images/                  # 📦 Container images and scripts
├── test-scripts/                   # 🧪 Testing and validation
└── simple-rtsp-server/             # 📡 RTSP server for testing
```

### **🔄 Consolidation Summary**
- **✅ Enhanced Pipeline Generator**: Merged into unified-streaming-platform
- **✅ CDK Pipeline Generator**: Camera management integrated, deprecated Bedrock Agent removed
- **✅ Lambda SDP Extractor**: RTSP analysis functionality integrated
- **📦 Migration Scripts**: Preserved for existing deployments

---

Overview
The architecture diagram below depicts the Fargate-based gateway resources that this solution can deploy into your account. 


![Figure1: Architecture](./.github/images/Kinesis-CloudGateway-Architecture.png) 
 
Figure 1: AWS Fargate-based gateway for ingestion of on-premises IP camera video streams from RTSP to Kinesis Video Streams solution architecture


The cloud gateway is deployed as an AWS Fargate application, although it could run on either Fargate or Amazon Elastic Compute Cloud (Amazon EC2). The application running on Fargate is comprised of a GStreamer media pipeline and utilizes the Kinesis Video Streams Producer SDK Gstreamer plugin which is part of the Kinesis Video Streams C++ Producer SDK. You will compile the Kinesis Video Streams Producer SDK, including the GStreamer plugin, in the AWS Fargate container. Therefore, the GStreamer multimedia framework and Kinesis Video Streams Producer SDK compile time dependencies will need to be installed as part of the Fargate Application. 

The Amazon Virtual Private Cloud (Amazon VPC) architecture in figure 1 above includes the use of an Internet gateway or Egress-only internet gateway. Depending on the bitrates of your RTSP streams and the total number of cameras you choose to integrate using the solution in this blog, use an Internet or Egress-only gateway to cost optimize network traffic. NAT gateway could be used, but NAT gateway isn’t the most cost optimized approach when ingesting video data from one or more IP cameras. For more information, see Amazon VPC Pricing. 
The architecture in figure 1 does not depict the use of AWS Direct Connect or an AWS Site-to-Site VPN, but these AWS services could be used to further secure the connection between your premises and the Amazon VPC. For more information see the <a href="https://docs.aws.amazon.com/wellarchitected/latest/hybrid-networking-lens/hybrid-networking-lens.html">Hybrid Networking Lens</a> of the AWS Well-Architected Framework. 

## Prerequisites

*	An AWS account with full permissions on Kinesis Video Streams, EC2 or Fargate, and Amazon VPC
*	Familiarity with Linux operating systems and using the command-line 
*	Familiarity with compiling C++ applications and using CMake is helpful, but not required
*	A system with AWS CLI, AWS CDK, and docker tools installed 

## Walkthrough
 
To deploy and run the sample application we will perform the following steps:

* Create a Kinesis Video Stream
* Create an Amazon VPC with an Internet Gateway
* Create SSH Keypair and IAM user
* Create 
    * an Amazon EC2 to run the Cloud Gateway 
        OR
    * an Amazon EC2 with  install docker tools create the Cloud Gateway container 
        * Build an Ubuntu container with GStreamer and startup script
        * Create an Elastic Container Repository (ECR) to store the Ubuntu container
        * Create a Fargate cluster, task, and service and deploy the container. 
* View the video stream
* Clean Up



## Step 1: Create a Kinesis Video Stream*

*Create a Kinesis Video Stream*

Log into the AWS Management console.

![AWS Management Console Kinesis Video Streams](./.github/images/AWSManagementConsoleKVS.png) 

Create the Video Stream. Example name: CloudGatewayStream.

![AWS Management Console Kinesis Video Streams - Create Stream](./.github/images/AWSManagementConsoleKVSCreateStream.png) 

Example of a Create Video Stream Success Message.

![AWS Management Console Kinesis Video Streams - Create Stream Success](./.github/images/AWSManagementConsoleKVSCreateSuccess.png) 
  

 If you prefer the AWS CLI, use the following commands.

```bash
aws kinesisvideo create-stream --stream-name "CloudGatewayStream" --data-retention-in-hours "24" --region us-east-1
```

*Example Command Output*
```json
{
    "StreamARN": "arn:aws:kinesisvideo:us-east-1:8xxxxxxxxxxx:stream/CloudGatewayStream/1682603xxxxxx"
}
```

## Step 2: Choose an EC2 or Fargate CDK

Choose which deployment you prefer:
1. <a href="https://github.com/aws-samples/cloud-gateway-for-amazon-kinesis-video-streams/blob/main/ec2-cdk-app/README.md">ec2-cdk-app</a>
OR 
2. <a href="https://github.com/aws-samples/cloud-gateway-for-amazon-kinesis-video-streams/blob/main/fargate-cdk-app/README.md">fargate-cdk-app</a>

## Step 3: View the Kinesis Video Stream

Navigate to the Kinesis Video Stream in the AWS Management Console. 
![AWS Management Console Kinesis Video Streams](./.github/images/CloudGatewayStream.png) 

## Authors and acknowledgment
[Brian Slater](https://github.com/bmslater)

[David Malone](https://github.com/dave-malone)

## License
MIT License

