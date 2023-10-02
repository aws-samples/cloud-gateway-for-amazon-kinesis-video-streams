# ECS/Fargate Creation with CDK

This example will create:

- A new VPC with an Internet Gateway
- Public and Private subnets
- A security group
- An ECS/Fargate Cluster, Task, and Task Definition

 
 
 . This file contains all of the installation instructions for the KVS application. 

## Pre-requisites
- AWS CLI
- AWS CDK
- Docker tools installed on the system the AWS CDK will execute
- Basic container understanding
- NPM

   
 

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

Finally, to deploy this project, you will need to pass in your EC2 key pair name and your IPv4 address as parameters so they can be used within this project.

```bash
$ cdk deploy --parameters keyPairName=MY-KEY-PAIR-NAME --parameters myIpAddress=MY-IP-ADDRESS
```

## Output

??

## To Destroy

```bash
# Destroy all project resources.
$ cdk destroy
```
