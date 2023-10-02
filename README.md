# Build a Cloud Gateway to Ingest RTSP video to Amazon Kinesis Video Streams



Prerequisites

* An AWS account with full permissions on Kinesis Video Streams, Fargate, and Amazon VPC
* Familiarity with Linux operating systems and using the command-line 
* Familiarity with compiling C++ applications and using CMake is helpful, but not required

 
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

 



*Step 1: Create a Kinesis Video Stream*

*Create a Kinesis Video Stream*

```bash
aws kinesisvideo create-stream --stream-name "CloudGatewayStream" --data-retention-in-hours "24" --region us-east-1
```

*Example Command Output*
```json
{
    "StreamARN": "arn:aws:kinesisvideo:us-east-1:8xxxxxxxxxxx:stream/CloudGatewayStream/1682603545622"
}
```
 
Note the stream name to use in a shell script in a later step. 
 
*Step 2: Create an Amazon VPC with an Internet Gateway*
 
*Create a VPC*

```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specification 'ResourceType=vpc,Tags=[{Key=Name,Value=kvs-vpc}]' 
```

*Example Command Output*
```json
{
    "Vpc": {
        "CidrBlock": "10.0.0.0/16",
        "DhcpOptionsId": "dopt-04b547f0XXXXXXXX",
        "State": "pending",
        "VpcId": "vpc-0db4803faXXXXXXXX",
        "OwnerId": "8176XXXXXXXX",
        "InstanceTenancy": "default",
        "Ipv6CidrBlockAssociationSet": [],
        "CidrBlockAssociationSet": [
            {
                "AssociationId": "vpc-cidr-assoc-0f82fdbbaXXXXXXXX",
                "CidrBlock": "10.0.0.0/16",
                "CidrBlockState": {
                    "State": "associated“
                }
            }
        ],
        "IsDefault": false,
        "Tags": [
            {
                "Key": "Name",
                "Value": "kvs-vpc“
            }
        ]
    }
}
```

*Create at least 2 subnets*

 
*Create first subnet*
```bash
aws ec2 create-subnet --vpc-id vpc-0db4803faXXXXXXXX --cidr-block 10.0.0.0/24 --query Subnet.SubnetId --output text 
```

*Output*
```bash
subnet-05bf87e9cXXXXXXXX
```

*Create second subnet*
```bash
aws ec2 create-subnet --vpc-id vpc-0db4803faXXXXXXXX --cidr-block 10.0.1.0/24 --query Subnet.SubnetId --output text
```

*Output*
```bash
subnet-0df70e6ccXXXXXXXX
```
*Create an Internet Gateway (IGW)*
```bash
aws ec2 create-internet-gateway --query InternetGateway.InternetGatewayId --output text
```

*Output*
```bash
igw-0519512f1XXXXXXXX
```
 
*Attach the Internet Gateway to the VPC*
```bash
aws ec2 attach-internet-gateway --vpc-id vpc-0db4803faXXXXXXXX --internet-gateway-id igw-0519512f1XXXXXXXX
```
*Create route table for IGW*

```bash
aws ec2 create-route-table --vpc-id vpc-0db4803faXXXXXXXX --query RouteTable.RouteTableId --output text
```
 
*Output*
```bash
rtb-0915b6e0aXXXXXXXX
```

*Add route to IGW to access internet*
```bash
aws ec2 create-route --route-table-id rtb-0915b6e0aXXXXXXXX --destination-cidr-block 0.0.0.0/0 --gateway-id igw-0519512f1XXXXXXXX
```
*Output*
```bash
True
```


*Associate route table with the VPC subnets*

```bash
aws ec2 associate-route-table --subnet-id subnet-05bf87e9XXXXXXXX --route-table-id rtb-0915b6e0aXXXXXXXX
```
```bash
aws ec2 associate-route-table --subnet-id subnet-0df70e6ccXXXXXXXX --route-table-id rtb-0915b6e0aXXXXXXXX
``` 

Output
```bash
rtbassoc-00c97b394XXXXXXXX
ASSOCIATIONSTATE        associated
rtbassoc-06e3ae560XXXXXXXX
ASSOCIATIONSTATE        associated
```

For more information please see Getting started with Amazon VPC.
 
 
 


*Create a security group and authorize in-bound SSH*

```bash
aws ec2 create-security-group --group-name ec2-kvs-blog --description "EC2 with docker build tools for KVS blog" --tag-specifications 'ResourceType=security-group,Tags=[{Key=Name,Value=kvs-blog-sg}]' --vpc-id vpc-0db4803faXXXXXXXX --output text
```
 
Output 
```bash
sg-0450367a2XXXXXXXX
```

*Add rule for all VPC CIDRs to security group*

```bash
aws ec2 authorize-security-group-ingress --group-id sg-0450367a2XXXXXXXX --protocol tcp --port 22 --cidr "0.0.0.0/0"                            
```
 
*Verify security group configuration*
```bash
aws ec2 describe-security-groups --group-ids sg-0450367a2XXXXXXXX 
``` 
Output
```json
{
 "SecurityGroups": [
        {
            "Description": "EC2 with docker build tools for KVS blog",
            "GroupName": "ec2-kvs-blog",
            "IpPermissions": [
                {
                    "FromPort": 22,
                    "IpProtocol": "tcp",
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
…
``` 
 
 
*Create SSH keypair*

```bash
aws ec2 create-key-pair --key-name ec2-kvs-keypair --key-type rsa --query "KeyMaterial" --output text > ec2-kvs-keypair.pem
```
The private key is stored locally in the output text filename. The public key is available in the EC2 console. 

*Set the permissions for the pem*
```bash
chmod 400 ec2-kvs-keypair.pem
```

Note the keypair local path to use in later steps.


*Create IAM user for the script stream-rtsp-to-kvs.sh*
 
```bash
aws iam create-user --user-name rtsp
```

*Create Policy*

```bash
aws iam attach-user-policy --user-name rtsp --policy-arn "arn:aws:iam::aws:policy/ AmazonKinesisVideoStreamsFullAccess" 
```
```bash
aws iam create-access-key --user-name rtsp
```
Note the access and secret key to use in later steps.
 
 
 
*Step 4: Create EC2 only or EC2 and Container*

Follow Step 4a to run Cloud Gateway on EC2 as a service.
Follow Step 4b to run the Docker build tools on EC2 and Cloud Gateway as a container with a start-up script.
 
  
*Step 4a: Cloud Gateway as an EC2*
 
*Use Ubuntu 22.04 to build a Cloud Gateway server on EC2.*
 
 
*Get AMI ID (AMI IDs may be different depending on your region)*
```bash
aws ec2 describe-images --filters "Name=name,Values=Ubuntu Server 22.04" --query "sort_by(Images, &CreationDate)[].[Name, ImageId]"  
```

Output
```json
[
    [
        "Ubuntu Server 22.04",
        "ami-0d192a81a9bee8a6e"
    ]
]
```

*Create EC2*
 
Create an EC2 using the:

* AMI image-id from the previous step
* SSH Key key-name from Step 3.
* Security Group ID from Step 2. 
* A Subnet ID from Step 2.  

```bash
   aws ec2 run-instances \
    --image-id ami-0d192a81a9bee8a6e \
    --count 1 \
    --instance-type t3.medium \
    --key-name ec2-kvs-keypair \
    --security-group-ids sg-0450367a2XXXXXXXX   \
    --subnet-id subnet-05bf87e9cXXXXXXXX \
    --block-device-mappings "[{\"DeviceName\":\"/dev/sdf\",\"Ebs\":{\"VolumeSize\":30,\"DeleteOnTermination\":false}}]" \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ec2-kvs-ec2}]' 'ResourceType=volume,Tags=[{Key=Name,Value= ec2-kvs-ec2}]’
```
 
Output
```json
{
    "Groups": [],
    "Instances": [
        {
            "AmiLaunchIndex": 0,
            "ImageId": "ami-0d192a81a9bee8a6e",
            "InstanceId": "i-097dfd371XXXXXXXX",
            "InstanceType": "t3.medium",
            "KeyName": "ec2-kvs-keypair",
            "LaunchTime": "2023-07-10T15:34:04+00:00",
            "Monitoring": {
                "State": "disabled"
            },
…
```
 
To allow access remotely to the EC2, create a public IP and associate it to the InstanceID of the EC2.
 
*Create a public IP*

```bash
aws ec2 allocate-address
```

Output
```json
{
    "PublicIp": "52.xxx.xxx.xxx",
    "AllocationId": "eipalloc-0edaefdb6XXXXXXXX",
    "PublicIpv4Pool": "amazon",
    "NetworkBorderGroup": "us-east-1",
    "Domain": "vpc"
}
```


*Associate a public IP to the EC2 instance.*

```bash
aws ec2 associate-address --instance-id i-01650cc6eXXXXXXXX --public-ip 52.xxx.xxx.xxx
```

Output
```json
{
    "AssociationId": "eipassoc-078bf4af5XXXXXXXX"
}
``` 
 
*Test SSH to the instance*
 
Use the SSH Keypair from Step 3 to connect to the EC2.
```bash
ssh -i ec2-kvs-keypair.pem -o IgnoreUnknown=UseKeychain ubuntu@52.xxx.xxx.xxx
``` 
 
*EC2 Install Software*
 
Update Ubuntu and install Time Zone 
```bash
sudo apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata
```
 

*Install GStreamer and dependencies*
 
If you see a menu at the end, hit enter when it appears.


```bash
sudo apt-get install -y \
        libssl-dev \
        git \
        libcurl4-openssl-dev \
        liblog4cplus-dev \
        libgstreamer1.0-dev \
        libgstreamer-plugins-base1.0-dev \
        gstreamer1.0-plugins-base-apps \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-ugly \
        gstreamer1.0-tools \
        build-essential \
        autoconf \
        automake  \
        bison \
        bzip2 \
        cmake \
        curl \
        diffutils \
        flex \
        make
```
 
 

*Set KVS_SDK_VERSION*

```bash
KVS_SDK_VERSION=v3.2.0
```

*Change to the /opt directory*
```bash
cd /opt/
```
*Clone the KVS SDK repository* 

```bash
sudo git clone --depth 1 --branch $KVS_SDK_VERSION https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
```
 
*Create the build directory*
```bash
sudo mkdir -p /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
``` 

*Change to the build directory*
```bash
cd /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
``` 
 
*Run cmake and make to build GStreamer*
```bash
sudo cmake .. -DBUILD_GSTREAMER_PLUGIN=ON -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON && sudo make
```

*Export the LD_LIBRARY_PATH*
```bash
export LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
```
*Export the GST_PLUGIN_PATH*
```bash
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/:$GST_PLUGIN_PATH
```

Assumes that amazon-kinesis-video-streams-producer-sdk-cpp has been cloned and all dependencies are installed as per the docs.


*Create file /home/ubuntu/stream-rtsp-to-kvs.sh*
Update the AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, STREAM_NAME, RTSP_URL with your values.

```bash
#!/bin/bash
 
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
 
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=us-east-1
 
STREAM_NAME=CloudGatewayStream
RTSP_URL="rtsp://kvsedge:stream1234@your-ip-cam:554/"
 
# below pipeline is specific to h264 encoded media, and does not process audio
gst-launch-1.0 -v rtspsrc location=$RTSP_URL short-header=TRUE \
    ! rtph264depay \
    ! h264parse \
    ! kvssink stream-name=$STREAM_NAME storage-size=128
``` 

 
*Create file /etc/systemd/system/stream-rtsp-to-kvs.service*
```bash
[Unit]
Description=Ingestion of RTSP stream to Kinesis Video Streams via gstreamer pipeline
After=network.target
StartLimitIntervalSec=0
[Service]
Type=simple
Restart=always
RestartSec=1
User=ubuntu
ExecStart=/home/ubuntu/stream-rtsp-to-kvs.sh
 
[Install]
WantedBy=multi-user.target
 ```

*Execute the following commands to load and start the new service*

```bash
sudo systemctl daemon-reload
```
```bash 
systemctl enable stream-rtsp-to-kvs.service
```
```bash
sudo systemctl start stream-rtsp-to-kvs.service
``` 

 
Running Cloud Gateway on an EC2 has been completed. Skip to Step 5.
 
 
 
 
*Step 4b: Cloud Gateway as a Container*
 
                  
*Use Amazon Linux 2 for the docker build tools on EC2.*
 
 
*Get AMI ID (AMI IDs may be different depending on your region)*
```bash
aws ec2 describe-images --filters "Name=name,Values=Amazon Linux 2023 AMI 2023*" --query "sort_by(Images, &CreationDate)[].[Name, ImageId]"  
```

Output
```json
[
    [
        "Amazon Linux 2023 AMI 2023.0.20230315.0 x86_64 HVM kernel-6.1 SSD Volume Type by Venv",
        "ami-0efce49721f2fecff"
    ]
]
```
 
*Create EC2*
 
Create an EC2 using the:

* AMI image-id from the previous step
* SSH Key key-name from Step 3.
* Security Group ID from Step 2. 
* A Subnet ID from Step 2.  

```bash

   aws ec2 run-instances \
    --image-id ami-0efce49721f2fecff \
    --count 1 \
    --instance-type t3.medium \
    --key-name ec2-kvs-keypair \
    --security-group-ids sg-0450367a2XXXXXXXX   \
    --subnet-id subnet-05bf87e9cXXXXXXXX \
    --block-device-mappings "[{\"DeviceName\":\"/dev/sdf\",\"Ebs\":{\"VolumeSize\":30,\"DeleteOnTermination\":false}}]" \
    --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ec2-kvs-container-build}]' 'ResourceType=volume,Tags=[{Key=Name,Value= ec2-kvs-container-build}]’
```
 
Output Example
```json
{
    "Groups": [],
    "Instances": [
        {
            "AmiLaunchIndex": 0,
            "ImageId": "ami-0efce49721f2fecff",
            "InstanceId": "i-0ff1ec809XXXXXXXX",
            "InstanceType": "t3.medium",
            "KeyName": "ec2-kvs-keypair",
            "LaunchTime": "2023-07-10T15:36:35+00:00",
            "Monitoring": {
                "State": "disabled“
            },
…
``` 
 

*Create a public IP*
To allow access remotely to the EC2, create a public IP and associate it to the InstanceID of the EC2.

```bash 
aws ec2 allocate-address
```

Output
```json
{
    "PublicIp": "52.xxx.xxx.xxx",
    "AllocationId": "eipalloc-0edaefdbXXXXXXXX",
    "PublicIpv4Pool": "amazon",
    "NetworkBorderGroup": "us-east-1",
    "Domain": "vpc"
}
``` 

*Associate a public IP to the EC2 instance*
```bash
aws ec2 associate-address --instance-id i-01650cc6efb368571 --public-ip 52.xxx.xxx.xxx
```

Output
```json
{
    "AssociationId": "eipassoc-078bf4af5XXXXXXXX"
}
``` 
 
*Test SSH to the instance*
 
Use the SSH Keypair from Step 3 to connect to the EC2.
```bash
ssh -i ec2-kvs-keypair.pem -o IgnoreUnknown=UseKeychain ubuntu@52.xxx.xxx.xxx
``` 
 
 
 
*Install docker*
 
Install docker and dependencies on the EC2

```bash
sudo yum update -y
sudo yum install docker 
sudo usermod -a -G docker ec2-user 
sudo newgrp docker
sudo yum install python3-pip
#(without root access)
pip3 install --user docker-compose
```
 
Enable the docker service

```bash
sudo systemctl enable docker.service
``` 
Output
```bash
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /usr/lib/systemd/system/docker.service
```

*Start the docker service*
```bash
sudo systemctl start docker.service
``` 
 
*Create Docker directory for docker file and scripts*
```bash
mkdir kvs-docker
```
```bash
cd kvs-docker/
```

*Create script that will be copied to the Cloud Gateway Container*
```bash
cd kvs-docker
```
  
*Create file /home/ubuntu/stream-rtsp-to-kvs.sh*
Update the AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION, STREAM_NAME, RTSP_URL with your values.

```bash
#!/bin/bash
 
export GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build
 
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
export AWS_DEFAULT_REGION=us-east-1
 
STREAM_NAME=CloudGatewaySteam
RTSP_URL="rtsp://kvsedge:stream1234@your-ip-cam:554/"
 
# below pipeline is specific to h264 encoded media, and does not process audio
gst-launch-1.0 -v rtspsrc location=$RTSP_URL short-header=TRUE \
    ! rtph264depay \
    ! h264parse \
    ! kvssink stream-name=$STREAM_NAME storage-size=128
```
 
 
*Make stream-rtsp-to-kvs.sh executable*
```bash
chmod +x stream-rtsp-to-kvs.sh
```
 
Create the docker file with the contents of the following
While in docker-files directory:  
 
*Create Dockerfile*
 
```bash
# Build docker with
# docker build -t kinesis-video-producer-sdk-cpp-amazon-linux .
#
FROM ubuntu:22.04
#apt-get install tzdata noninteractive. Without the next line, one will be prompted during build to select timezone. 
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata
RUN apt-get install -y \
        libssl-dev \
        git \
        libcurl4-openssl-dev \
        liblog4cplus-dev \
        libgstreamer1.0-dev \
        libgstreamer-plugins-base1.0-dev \
        gstreamer1.0-plugins-base-apps \
        gstreamer1.0-plugins-bad \
        gstreamer1.0-plugins-good \
        gstreamer1.0-plugins-ugly \
        gstreamer1.0-tools \
        build-essential \
        autoconf \
        automake  \
        bison \
        bzip2 \
        cmake \
        curl \
        diffutils \
        flex \
        make
 
ENV KVS_SDK_VERSION v3.2.0
 
WORKDIR /opt/
RUN git clone --depth 1 --branch $KVS_SDK_VERSION https://github.com/awslabs/amazon-kinesis-video-streams-producer-sdk-cpp.git
WORKDIR /opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/
 
#changed cmake3 to cmake
RUN cmake .. -DBUILD_GSTREAMER_PLUGIN=ON -DCMAKE_VERBOSE_MAKEFILE:BOOL=ON && \
    make
 
ENV LD_LIBRARY_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/open-source/local/lib
ENV GST_PLUGIN_PATH=/opt/amazon-kinesis-video-streams-producer-sdk-cpp/build/:$GST_PLUGIN_PATH
 
 
#Make directories and copy script files. Note: We don’t use systemctl due to it being a container. 
 
RUN mkdir -p /home/ubuntu/
COPY stream-rtsp-to-kvs.sh   /home/ubuntu/stream-rtsp-to-kvs.sh
 
RUN chmod a+x /home/ubuntu/stream-rtsp-to-kvs.sh
CMD ["/bin/bash", "-c", "source /home/ubuntu/stream-rtsp-to-kvs.sh"]
``` 

 
*Build Container*
In the kvs-docker directory
```bash
sudo docker build -t kvs-rtsp .
```
 
*Verify Container*
```bash
sudo docker images
```
 
Output
```bash
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
kvs-rtsp     latest    ee301589c280   2 minutes ago   1.13GB\
```
 
*List the running containers and retrieve the CONTAINER ID*
```bash
sudo docker ps
```
 
Output
```bash
REPOSITORY   TAG       IMAGE ID       CREATED         SIZE
kvs-rtsp     latest    ee301589c280   2 minutes ago   1.13GB\
```
 
You can explore the running container for any type of review needed. This is not necessary, but how to access if you need to troubleshoot. 
 
To access the running Container that was built, run:
 
*Start the container*
```bash
sudo docker run d66db3d2d41a
```
 
*Get a command prompt inside the container*
```bash
sudo docker exec -it d66db3d2d41a /bin/bash
```
 
*Create an Elastic Container Repository (ECR) to store the Ubuntu container*
 
Elastic Container Registry (ECR (https://aws.amazon.com/ecr/)) is an AWS service used to store container images. Create an ECR to store the cloud gateway container that will be deployed into AWS Fargate service. 
 
*Create the ECR*
```bash
aws ecr create-repository --repository-name ecr-kvs --image-scanning-configuration scanOnPush=true --region us-east-1
``` 
    
```json
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:us-east-1:8xxxxxxxxxxx:repository/ecr-kvs",
        "registryId": "8xxxxxxxxxxx",
        "repositoryName": "ecr-kvs",
        "repositoryUri": "8xxxxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/ecr-kvs",
        "createdAt": "2023-06-16T16:11:39+00:00",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": true
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}
```


*Authenticate to push to the ECR*

```bash
aws ecr get-login-password --region us-east-1 | sudo docker login --username AWS --password-stdin 8176XXXXXXXX.dkr.ecr.us-east-1.amazonaws.com
```

*Tag the latest image*
```bash
sudo docker tag kvs-rtsp:latest 8176XXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/ecr-kvs:latest
```

*Push the image to the ECR*
```bash
sudo docker push 8176XXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/ecr-kvs:latest 
``` 

*Check if the image is in the ECR*
```bash
aws ecr describe-images --repository-name ecr-kvs --query 'sort_by(imageDetails, &imagePushedAt)' 
```

*Create a Fargate Cluster*
```bash
aws ecs create-cluster --cluster-name fargate-kvs-rtsp
```

Output

```json
{
    "cluster": {
        "clusterArn": "arn:aws:ecs:us-east-1:8176XXXXXXXX:cluster/fargate-kvs-rtsp",
        "clusterName": "fargate-kvs-rtsp",
        "status": "ACTIVE",
        "registeredContainerInstancesCount": 0,
        "runningTasksCount": 0,
        "pendingTasksCount": 0,
        "activeServicesCount": 0,
        "statistics": [],
        "tags": [],
        "settings": [
            {
                "name": "containerInsights",
                "value": "disabled"
            }
        ],
        "capacityProviders": [],
        "defaultCapacityProviderStrategy": []
    }
}
```
 

*Create the task*
Before you can run a task on your ECS cluster, you must register a task definition. Task definitions are lists of containers grouped together. For more information about the available task definition parameters, see Amazon ECS task definitions (https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html).
 

*Create the task definition*
```json
 {
    "taskDefinitionArn": "arn:aws:ecs:us-east-1:8176XXXXXXXX:task-definition/fargate",
    "containerDefinitions": [
        {
            "name": "ecr-kvs",
            "image": "8176XXXXXXXX.dkr.ecr.us-east-1.amazonaws.com/ecr-kvs:latest",
            "cpu": 0,
            "portMappings": [
                {
                    "name": "ecr-kvs-554-tcp",
                    "containerPort": 554,
                    "hostPort": 554,
                    "protocol": "tcp",
                    "appProtocol": "http"
                }
            ],
            "essential": true,
            "environment": [],
            "environmentFiles": [],
            "mountPoints": [],
            "volumesFrom": [],
            "ulimits": [],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-create-group": "true",
                    "awslogs-group": "/ecs/fargate",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "ecs"
                }
            }
        }
    ],
    "family": "fargate",
    "executionRoleArn": "arn:aws:iam::8176XXXXXXXX:role/ecsTaskExecutionRole",
    "networkMode": "awsvpc",
    "revision": 4,
    "volumes": [],
    "status": "ACTIVE",
    "requiresAttributes": [
        {
            "name": "com.amazonaws.ecs.capability.logging-driver.awslogs"
        },
        {
            "name": "ecs.capability.execution-role-awslogs"
        },
        {
            "name": "com.amazonaws.ecs.capability.ecr-auth"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.19"
        },
        {
            "name": "ecs.capability.execution-role-ecr-pull"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.18"
        },
        {
            "name": "ecs.capability.task-eni"
        },
        {
            "name": "com.amazonaws.ecs.capability.docker-remote-api.1.29"
        }
    ],
    "placementConstraints": [],
    "compatibilities": [
        "EC2",
        "FARGATE"
    ],
    "requiresCompatibilities": [
        "FARGATE"
    ],
    "cpu": "2048",
    "memory": "4096",
    "runtimePlatform": {
        "cpuArchitecture": "X86_64",
        "operatingSystemFamily": "LINUX"
    },
    "registeredAt": "2023-06-20T18:54:37.316Z",
    "registeredBy": "arn:aws:iam::8176XXXXXXXX:user/rtsp",
    "tags": []
}
```

*Register the task definition*
```bash
aws ecs register-task-definition --cli-input-json file://home/ec2-user/fargate/tasks/kvs-rtsp-task.json
```
 
For more information please see Getting started with AWS Fargate (https://aws.amazon.com/fargate/getting-started/).
 
 
 
*Step 5: View the Video Stream in the AWS console*
 
https://us-east-1.console.aws.amazon.com/kinesisvideo/home?region=us-east-1#/streams/streamName/CloudGatewayStream 
 
 

*Step 6: Cleaning up*

Remind users to delete example resources if they no longer need them, to avoid incurring future costs.

* Delete the Fargate Application
* Delete the stream from Kinesis Video Streams
* Delete the Amazon VPC created


## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
