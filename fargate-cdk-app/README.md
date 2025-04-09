# ECS/Fargate Creation with CDK

This example will create:

- A new VPC with an Internet Gateway
- Public and Private subnets
- A security group with egress traffic only
- An IAM Role for the ECS Task
- An ECS/Fargate Cluster, Task, and Task Definition

## Pre-requisites
- AWS CLI
- AWS CDK
- Docker tools installed on the system the AWS CDK will execute
- Basic container understanding
- Clone the respository to your environment
- Some environments may require the sudo command.

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
### Use deployment context variables to customize your Stream Name and RTSP URL

You can use CDK's context variables to pass the name of the Stream you created 
previously and the url or your RTSP stream.

```bash
$ cdk deploy --context streamName=<YourStreamName> --context rtspUrl=<YourRtspUrl>
```

For example:

```bash
$ cdk deploy --context streamName=CloudGatewayStream --context rtspUrl=rtsp://kvsedge:stream1234@your-ip-cam:554/
```

## To Destroy

```bash
# Destroy all project resources.
$ cdk destroy
```
