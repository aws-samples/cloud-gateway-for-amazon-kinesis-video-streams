# AWS Configuration Setup

This project requires AWS credentials to deploy and test the cloud gateway infrastructure. Follow these steps to configure your AWS environment.

## Prerequisites

- AWS CLI installed and configured
- AWS CDK installed (`npm install -g aws-cdk`)
- Valid AWS account with appropriate permissions

## AWS Profile Configuration

### Option 1: Use Default AWS Profile

If you have AWS CLI configured with default credentials:

```bash
aws configure
```

The project will use your default AWS profile automatically.

### Option 2: Use Named AWS Profile

If you prefer to use a named AWS profile:

1. **Configure your profile:**
   ```bash
   aws configure --profile your-profile-name
   ```

2. **Set the AWS_PROFILE environment variable:**
   ```bash
   export AWS_PROFILE=your-profile-name
   ```

3. **Or specify the profile in each command:**
   ```bash
   aws cloudformation describe-stacks --profile your-profile-name
   cdk deploy --profile your-profile-name
   ```

## Required AWS Permissions

Your AWS credentials need the following permissions:

### Core Services
- **CloudFormation**: Full access for stack management
- **Lambda**: Create, update, delete functions and layers
- **API Gateway**: Create and manage REST APIs
- **IAM**: Create roles and policies for Lambda execution
- **S3**: Create buckets for CDK assets and Lambda deployment packages

### For Simple RTSP Server (if using)
- **ECS**: Create clusters, services, and tasks
- **EC2**: Create VPC, subnets, security groups, and instances
- **ECR**: Create repositories and push container images
- **CloudWatch**: Create log groups and streams

### For Testing
- **Lambda**: Invoke functions for testing
- **CloudFormation**: Describe stacks to get API endpoints

## Environment Variables

You can set these environment variables to customize deployment:

```bash
# AWS Profile (optional)
export AWS_PROFILE=your-profile-name

# AWS Region (optional, defaults to us-east-1)
export AWS_DEFAULT_REGION=us-west-2

# CDK Bootstrap (if not already done)
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

## Verification

Test your AWS configuration:

```bash
# Check AWS credentials
aws sts get-caller-identity

# Check CDK is working
cdk --version

# List existing stacks (should not error)
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
```

## Troubleshooting

### Common Issues

1. **"Unable to resolve AWS account"**
   - Run `aws configure` to set up credentials
   - Verify with `aws sts get-caller-identity`

2. **"CDK bootstrap required"**
   - Run `cdk bootstrap` in your target region
   - This only needs to be done once per account/region

3. **"Access Denied" errors**
   - Verify your AWS user/role has the required permissions
   - Check AWS CloudTrail logs for specific permission denials

4. **"Profile not found"**
   - List available profiles: `aws configure list-profiles`
   - Create profile: `aws configure --profile your-profile-name`

## Security Best Practices

- **Never commit AWS credentials** to version control
- **Use IAM roles** when possible instead of long-term access keys
- **Follow principle of least privilege** for permissions
- **Rotate access keys** regularly
- **Enable MFA** on your AWS account

## Next Steps

Once AWS is configured, you can proceed with:

1. **Deploy the pipeline generator**: See `cdk-pipeline-generator/README.md`
2. **Deploy the RTSP server**: See `simple-rtsp-server/README.md`
3. **Run tests**: See `test-scripts/README.md`
