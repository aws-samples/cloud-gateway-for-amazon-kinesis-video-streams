This CDK project has been copied from https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/ec2-instance

# EC2 Instance Creation with CDK

This example will create:

- A new VPC with an Internet Gateway
- One public subnet
- A security group
- An EC2 instance with the the KVS gstreamer pipeline installed and ready to use

The `/src/config.sh` file is used as [user-data](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html) for the EC2 instance. This file contains all of the installation instructions for the KVS application. 

## Pre-requisites

This CDK project depends on an EC2 instance keypair. To create this keypair, navigate to the AWS Console in your Browser, and then enter EC2 into the Services search bar. Then, from the EC2 console, navigate to Network & Security > Key Pairs, and select Create key pair. You may skip this step if you have an existing keypair.

In order to restrict access to the EC2 instance that is created, you will also need to fetch your public IPv4 address to be added to the security group created by this project. You can easily obtain this value by visiting http://checkip.amazonaws.com/. The value displayed on this page will need to be passed in as a parameter to the CDK deploy command below.

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

- `Ec2CdkStack.DownloadKeyCommand`: The command needed to download the private key that was created.
- `Ec2CdkStack.IPAddress`: Public IP Address of Instance.
- `Ec2CdkStack.KeyName`: Key Name that was created.
- `Ec2CdkStack.sshcommand`: The command used to connect to the instance.

## To Destroy

```bash
# Destroy all project resources.
$ cdk destroy
```
