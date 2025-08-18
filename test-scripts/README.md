# Test Scripts

This directory contains comprehensive testing scripts for the Cloud Gateway for Amazon Kinesis Video Streams project.

## Lambda Function Testing

### Quick Start

Run the comprehensive lambda function test:

```bash
./run-lambda-using-rtsp-test-server-urls.sh
```

This will:
- ✅ Create the `test-results/` directory automatically
- 🔍 Check all prerequisites (Python, AWS credentials, server connectivity)
- 🧪 Test all available RTSP streams from the simple-rtsp-server
- 📊 Generate detailed test results and summaries
- 📸 **Save captured frames as viewable image files**
- 💾 Save results in multiple formats for analysis

### Advanced Usage

#### Custom Lambda Function
```bash
./run-lambda-using-rtsp-test-server-urls.sh --lambda-function "YourLambdaFunctionName"
```

#### Custom Server IP
```bash
./run-lambda-using-rtsp-test-server-urls.sh --server-ip "192.168.1.100"
```

#### Python Script Direct Usage
```bash
python3 test-lambda-using-rtsp-test-server-urls.py --lambda-function "YourFunction" --server-ip "192.168.1.100"
```

## Test Results

All test results are automatically saved to the `../test-results/` directory:

- `test-summary.json` - Latest test summary (overwritten each run)
- `lambda-test-detailed-YYYYMMDD_HHMMSS.json` - Complete test results with timestamp
- `successful-tests-YYYYMMDD_HHMMSS.json` - Only successful test results
- `failed-tests-YYYYMMDD_HHMMSS.json` - Only failed test results (if any)
- `captured-frames/` - **Directory containing captured frame images from each successful test**
  - `h264_360p_15fps_YYYYMMDD_HHMMSS.jpg` - Frame from h264_360p_15fps stream
  - `h264_720p_30fps_YYYYMMDD_HHMMSS.jpg` - Frame from h264_720p_30fps stream
  - etc. (one image file per successful stream test)

### Sample Test Summary Structure

```json
{
  "lambda_function": "PipelineGeneratorStack-SdpExtractorFunction0634AF6-vPvkrlpMQnAP",
  "server_ip": "44.215.108.66",
  "test_timestamp": "2025-08-18T13:41:58.780Z",
  "total_tests": 24,
  "successful_tests": 24,
  "failed_tests": 0,
  "success_rate": 1.0,
  "total_duration": 75.2,
  "average_duration": 3.13,
  "frames_captured": 24,
  "results": [...]
}
```

## Prerequisites

### Required Software
- Python 3.x
- AWS CLI configured with valid credentials
- Internet connectivity to reach the RTSP server

### Required Python Packages
```bash
pip3 install boto3 requests
```

### AWS Permissions
Your AWS credentials need permissions to invoke Lambda functions:
- `lambda:InvokeFunction`

## Other Test Scripts

### Legacy Test Scripts
- `test-authentication.sh` - Test RTSP authentication scenarios
- `test-basic-functionality.sh` - Basic functionality tests
- `test-frame-extraction.sh` - Frame extraction testing
- `test-pipeline-generator.py` - Pipeline generator testing
- `simple_api_test.py` - Simple API testing
- `test_characteristics_detailed.py` - Detailed characteristics testing
- `test_dual_mode.py` - Dual mode testing
- `validate_all_tests.py` - Test validation

## Integration with CI/CD

The test scripts return appropriate exit codes:
- `0` - All tests passed
- `1` - Some tests failed
- `130` - Interrupted by user (Ctrl+C)

Example CI/CD usage:
```bash
# Run tests and capture results
if ./test-scripts/run-lambda-using-rtsp-test-server-urls.sh; then
    echo "✅ All lambda tests passed"
else
    echo "❌ Lambda tests failed"
    exit 1
fi
```

## Troubleshooting

### Common Issues

1. **AWS Credentials Not Found**
   ```bash
   aws configure
   # or
   export AWS_PROFILE=your-profile
   ```

2. **Server Not Reachable**
   - Ensure simple-rtsp-server is running
   - Check security group allows inbound traffic on port 8080
   - Verify the server IP address

3. **Lambda Function Not Found**
   - Check the function name is correct
   - Ensure you have permissions to invoke the function
   - Verify the function is in the correct AWS region

4. **Python Dependencies Missing**
   ```bash
   pip3 install boto3 requests
   ```

### Debug Mode

For verbose output, run the Python script directly:
```bash
python3 -v test-lambda-using-rtsp-test-server-urls.py
```

## Test Results Analysis

### Success Rate Interpretation
- **100%** - Perfect! All streams analyzed successfully
- **90-99%** - Excellent, minor issues with specific streams
- **70-89%** - Good, but investigate failed streams
- **<70%** - Poor, significant issues need investigation

### Performance Metrics
- **Average Duration** - Time per stream analysis
- **Total Duration** - Complete test suite runtime
- **Individual Results** - Per-stream timing and success status

## Contributing

When adding new test scripts:
1. Follow the naming convention: `test-*.py` or `test-*.sh`
2. Make scripts executable: `chmod +x script-name`
3. Include help/usage information
4. Return appropriate exit codes
5. Update this README with documentation
