import ec2 = require('aws-cdk-lib/aws-ec2');
import ecs = require('aws-cdk-lib/aws-ecs');
import ecs_patterns = require('aws-cdk-lib/aws-ecs-patterns');
import cdk = require('aws-cdk-lib');
import path = require('path');

const app = new cdk.App();
const stack = new cdk.Stack(app, 'FargateServiceWithLocalImage');

// Create VPC and Fargate Cluster
// NOTE: Limit AZs to avoid reaching resource quotas
const vpc = new ec2.Vpc(stack, 'MyVpc', {
        ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/21'),

        maxAzs: 3,

        subnetConfiguration: [
                {
                subnetType: ec2.SubnetType.PUBLIC,
                name: 'Ingress',
                cidrMask: 24,

                },
                {
                        cidrMask: 24,
                        name: 'CloudGateway',
                        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                }
        ],
});
//const igwId = vpc.internetGatewayId;
const cluster = new ecs.Cluster(stack, 'Cluster', { vpc });

// Instantiate Fargate Service with a cluster and a local image that gets
// uploaded to an S3 staging bucket prior to being uploaded to ECR.
// A new repository is created in ECR and the Fargate service is created
// with the image from ECR.
new ecs_patterns.ApplicationLoadBalancedFargateService(stack, "FargateService", {
  cluster,
   memoryLimitMiB: 4096,
  cpu: 2048,
  taskImageOptions: {
    image: ecs.ContainerImage.fromAsset(path.resolve(__dirname, 'local-image'))
  },
});


app.synth();

