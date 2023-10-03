# ECS/Fargate Creation with CDK

This example will create:

- A new VPC with an Internet Gateway
- Public and Private subnets
- A security group with egress traffic only
- An ECS/Fargate Cluster, Task, and Task Definition

## Pre-requisites
- AWS CLI
- AWS CDK
- Docker tools installed on the system the AWS CDK will execute
- Basic container understanding

## To Deploy

Ensure that aws-cdk is installed.

```bash
$ npm install -g aws-cdk
```

Next you will install project dependencies, build the project, and then [bootstrap](https://docs.aws.amazon.com/cdk/latest/guide/bootstrapping.html).

```bash
$ npm install
$ npm run build
$ cdk bootstrap
```
## Set the valus in stream-rtsp-to-kvs.sh
Set the RTSP_URL value in stream-rtsp-to-kvs.sh.  If you have used a different STEAM_NAME in STEP 1: Create Kinesis Video Stream, update STREAM_NAME to match.
STREAM_NAME=CloudGatewayStream
RTSP_URL="rtsp://kvsedge:stream1234@your-ip-cam:554/"

$ <a href="https://github.com/aws-samples/cloud-gateway-for-amazon-kinesis-video-streams/blob/main/ec2-cdk-app/src/stream-rtsp-to-kvs.sh">stream-rtsp-to-kvs.sh</a>


## CDK Deploy
Deploy with the CDK.

```bash
$ cdk deploy 
```

## To Destroy

```bash
# Destroy all project resources.
$ cdk destroy
```
