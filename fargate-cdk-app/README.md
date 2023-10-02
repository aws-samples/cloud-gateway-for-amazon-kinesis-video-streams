This CDK project has been copied from https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/ecs/fargate-service-with-local-image

# ECS/Fargate Creation with CDK

This example will create:

- A new VPC with an Internet Gateway
- One public subnet
- A security group
- An EC2 instance with the the KVS gstreamer pipeline installed and ready to use

 
 
 . This file contains all of the installation instructions for the KVS application. 

## Pre-requisites

 

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
