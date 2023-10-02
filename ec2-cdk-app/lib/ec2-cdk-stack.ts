import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as path from 'path';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';

export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const myIpAddressParam = new cdk.CfnParameter(this, 'myIpAddress', { type: 'String', description: 'Your ip address for use in the EC2 instance security group. Can be retrieved by visiting http://checkip.amazonaws.com/'});
    const myIpAddress = myIpAddressParam.valueAsString;
    console.log(`adding ip address to security group: ${myIpAddress}`)

    const keyPairParam = new cdk.CfnParameter(this, 'keyPairName', { type: 'String', description: 'The name of the Amazon EC2 key pair.'});
    const keyPairName = keyPairParam.valueAsString;
    console.log(`using EC2 instance key pair name: ${keyPairName}`)

    // Create new VPC with 2 Subnets
    const vpc = new ec2.Vpc(this, 'VPC', {
      vpcName: 'KVS Cloud Gateway VPC',
      natGateways: 0,
      createInternetGateway: true, //true by default; explicitly stating so it is more obvious
      subnetConfiguration: [{
        cidrMask: 24,
        name: "Application",
        subnetType: ec2.SubnetType.PUBLIC
      }]
    });

    // Allow SSH (TCP Port 22) access from anywhere
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow SSH (TCP port 22) in',
      allowAllOutbound: true
    });
    securityGroup.addIngressRule(ec2.Peer.ipv4(`${myIpAddress}/32`), ec2.Port.tcp(22), 'Allow SSH Access')

    const role = new iam.Role(this, 'ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'kvsCloudGatewayInstanceRole',
    });
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'))
    role.addToPolicy(new iam.PolicyStatement({
      resources: [`arn:aws:kinesisvideo:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:stream/CloudGatewayStream/*`],
      actions: [
        'kinesisvideo:PutMedia',
        'kinesisvideo:DescribeStream',
        'kinesisvideo:GetDataEndpoint',
        'kinesisvideo:TagStream'
      ]
    }));

    // Use Ubuntu Server 22.04
    const ami = ec2.MachineImage.genericLinux({
      'us-east-1': 'ami-0d192a81a9bee8a6e',     
    });

    const rootVolume: ec2.BlockDevice = {
      deviceName: '/dev/sda1',
      volume: ec2.BlockDeviceVolume.ebs(50, {encrypted: true, deleteOnTermination: true}), // Override the volume size in Gibibytes (GiB)
    };

    // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
    const ec2Instance = new ec2.Instance(this, 'Instance', {
      instanceName: 'kvs-rtsp-cloud-gateway',
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MEDIUM),
      machineImage: ami,
      securityGroup: securityGroup,
      keyName: keyPairName,
      role: role,
      blockDevices: [rootVolume],
      propagateTagsToVolumeOnCreation: true,
    });

    ec2Instance.userData.addCommands('sudo apt update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tzdata');
    ec2Instance.userData.addCommands('sudo apt install unzip -y');
    ec2Instance.userData.addCommands(`curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
      unzip awscliv2.zip && \
      sudo ./aws/install && \
      rm awscliv2.zip`);

    ec2Instance.userData.addCommands(`sudo apt-get install -y \
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
      jq \
      make`);


    // Create an asset that will be used as part of User Data to run on first load
    const installKvsProducerSdkScript = new Asset(this, 'InstallKvsProducerSdkScript', { path: path.join(__dirname, '../src/config.sh') });
    const serviceFile = new Asset(this, 'KvsServiceFile', { path: path.join(__dirname, '../src/stream-rtsp-to-kvs.service') });
    const executionScript = new Asset(this, 'KvsExecutionScript', { path: path.join(__dirname, '../src/stream-rtsp-to-kvs.sh') });

    installKvsProducerSdkScript.grantRead(ec2Instance.role);
    serviceFile.grantRead(ec2Instance.role);
    executionScript.grantRead(ec2Instance.role);

    const installKvsProducerSdkScriptLocalPath = ec2Instance.userData.addS3DownloadCommand({
      bucket: installKvsProducerSdkScript.bucket,
      bucketKey: installKvsProducerSdkScript.s3ObjectKey,
    });

    ec2Instance.userData.addS3DownloadCommand({
      bucket: serviceFile.bucket,
      bucketKey: serviceFile.s3ObjectKey,
      localFile: '/etc/systemd/system/stream-rtsp-to-kvs.service'
    });

    ec2Instance.userData.addS3DownloadCommand({
      bucket: executionScript.bucket,
      bucketKey: executionScript.s3ObjectKey,
      localFile: '/home/ubuntu/stream-rtsp-to-kvs.sh'
    });

    ec2Instance.userData.addExecuteFileCommand({
      filePath: installKvsProducerSdkScriptLocalPath,
      arguments: '--verbose -y'
    });
    
    ec2Instance.userData.addCommands('sudo chmod 755 /home/ubuntu/stream-rtsp-to-kvs.sh');
    ec2Instance.userData.addCommands('sudo systemctl daemon-reload');
    ec2Instance.userData.addCommands('sudo systemctl enable stream-rtsp-to-kvs.service');
    ec2Instance.userData.addCommands('sudo systemctl start stream-rtsp-to-kvs.service');

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'IP Address', { value: ec2Instance.instancePublicIp });
    new cdk.CfnOutput(this, 'Key Name', { value: keyPairName })
    new cdk.CfnOutput(this, 'Download Key Command', { value: 'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem' })
    new cdk.CfnOutput(this, 'ssh command', { value: 'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' + ec2Instance.instancePublicIp })
  }
}
