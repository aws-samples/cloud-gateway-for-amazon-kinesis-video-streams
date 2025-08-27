# Bedrock GStreamer Expert - Accuracy Testing Suite

This directory contains comprehensive testing tools for validating and improving the accuracy of the Bedrock GStreamer Expert system.

## 📁 Testing Scripts Overview

### 🎯 **Core Accuracy Testing**

#### `enhanced-accuracy-framework.py`
**Purpose**: Comprehensive accuracy testing framework with detailed analysis
- **Features**: Multi-dimensional accuracy measurement, confidence scoring, platform-specific validation
- **Usage**: `python enhanced-accuracy-framework.py`
- **Output**: Detailed accuracy reports with improvement recommendations

#### `test-agent-accuracy.py`
**Purpose**: Direct agent accuracy testing with real GStreamer queries
- **Features**: Automated query execution, response validation, accuracy scoring
- **Usage**: `./test-agent-accuracy.py`
- **Output**: Accuracy percentages and detailed failure analysis

#### `interactive-accuracy-test.py`
**Purpose**: Interactive testing interface for manual accuracy validation
- **Features**: Real-time testing, manual validation, iterative improvement
- **Usage**: `python interactive-accuracy-test.py`
- **Output**: Interactive feedback and accuracy metrics

### 🔧 **Agent Testing Tools**

#### `test-agent.py`
**Purpose**: Basic agent functionality testing
- **Features**: Connection testing, basic query validation
- **Usage**: `./test-agent.py`
- **Output**: Agent health status and basic functionality verification

#### `test-agent-simple.py` & `test-agent-simple.sh`
**Purpose**: Lightweight agent testing for quick validation
- **Features**: Fast connectivity checks, basic response validation
- **Usage**: `python test-agent-simple.py` or `./test-agent-simple.sh`
- **Output**: Pass/fail status for basic functionality

#### `quick-test-agents.py`
**Purpose**: Rapid testing across multiple agent configurations
- **Features**: Multi-agent testing, comparative analysis
- **Usage**: `python quick-test-agents.py`
- **Output**: Comparative performance metrics

### 📊 **Priority and Hierarchy Testing**

#### `test-priority-hierarchy.py`
**Purpose**: Validates priority assessment framework
- **Features**: Priority level testing, urgency analysis, confidence validation
- **Usage**: `./test-priority-hierarchy.py`
- **Output**: Priority framework accuracy metrics

#### `quick-priority-test.py`
**Purpose**: Fast priority assessment validation
- **Features**: Quick priority checks, confidence scoring
- **Usage**: `python quick-priority-test.py`
- **Output**: Priority assessment accuracy

## 📋 **Documentation**

#### `agent-accuracy-analysis.md`
**Purpose**: Comprehensive analysis of agent accuracy improvements
- **Content**: Historical accuracy data, improvement strategies, performance metrics
- **Usage**: Reference document for understanding accuracy evolution

## 🚀 **Quick Start Guide**

### 1. **Basic Agent Health Check**
```bash
cd testing/
./test-agent-simple.sh
```

### 2. **Comprehensive Accuracy Testing**
```bash
cd testing/
python enhanced-accuracy-framework.py
```

### 3. **Interactive Testing Session**
```bash
cd testing/
python interactive-accuracy-test.py
```

### 4. **Priority Framework Validation**
```bash
cd testing/
./test-priority-hierarchy.py
```

## 🔄 **Testing Workflow**

### **Development Testing**
1. Run `test-agent-simple.py` for basic connectivity
2. Execute `test-agent-accuracy.py` for core accuracy validation
3. Use `interactive-accuracy-test.py` for manual validation

### **Production Validation**
1. Run `enhanced-accuracy-framework.py` for comprehensive analysis
2. Execute `test-priority-hierarchy.py` for priority framework validation
3. Use `quick-test-agents.py` for multi-configuration testing

### **Continuous Improvement**
1. Analyze results from `agent-accuracy-analysis.md`
2. Implement improvements based on testing feedback
3. Re-run comprehensive testing suite
4. Update accuracy baselines

## 📈 **Testing Metrics**

### **Accuracy Dimensions**
- **Technical Accuracy**: Correctness of GStreamer pipeline recommendations
- **Platform Compatibility**: Appropriate element selection for target platforms
- **Priority Assessment**: Correct urgency and impact evaluation
- **Response Quality**: Clarity, completeness, and actionability

### **Performance Metrics**
- **Response Time**: Agent query processing speed
- **Confidence Scores**: Agent certainty in recommendations
- **Success Rates**: Percentage of successful pipeline executions
- **Error Handling**: Quality of error detection and resolution

## 🛠️ **Configuration**

### **Prerequisites**
- AWS CLI configured with appropriate profile
- Python 3.8+ with required dependencies
- Access to Bedrock agent and knowledge base
- GStreamer installation for pipeline validation

### **Environment Setup**
```bash
# Ensure AWS credentials are configured
aws configure --profile malone-aws

# Install Python dependencies (if needed)
pip install boto3 requests

# Make scripts executable
chmod +x *.py *.sh
```

## 📊 **Integration with Main System**

### **Knowledge Base Integration**
- Testing scripts validate knowledge base query responses
- Accuracy metrics inform knowledge base content optimization
- Platform-specific testing ensures documentation coverage

### **Agent Configuration**
- Testing validates agent instruction effectiveness
- Priority framework testing ensures proper urgency assessment
- Accuracy feedback drives agent instruction refinement

### **MCP Server Validation**
- Testing scripts can validate MCP server responses
- Integration testing ensures Q CLI compatibility
- Performance testing validates server response times

## 🔍 **Troubleshooting**

### **Common Issues**
- **Connection Errors**: Check AWS credentials and agent configuration
- **Permission Errors**: Verify IAM roles and policies
- **Timeout Issues**: Adjust timeout settings in test scripts
- **Accuracy Drops**: Review recent agent instruction changes

### **Debug Mode**
Most scripts support verbose output:
```bash
python test-script.py --verbose
python test-script.py --debug
```

## 📝 **Contributing**

### **Adding New Tests**
1. Follow existing script patterns
2. Include comprehensive error handling
3. Provide clear output and metrics
4. Update this README with new test descriptions

### **Improving Accuracy**
1. Analyze test results for patterns
2. Identify common failure modes
3. Propose agent instruction improvements
4. Validate improvements with testing suite

This testing suite provides comprehensive validation capabilities for the Bedrock GStreamer Expert system, ensuring high accuracy and reliability across all components.
