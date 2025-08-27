# Unified Streaming Platform - Testing Suite

**Purpose**: Consolidated testing scripts for the unified streaming platform  
**Date**: 2025-08-27  

## 📋 **Available Testing Scripts**

### **Authentication Testing**
- **`test-authentication.sh`** - Tests authentication mechanisms
  - Basic and Digest authentication validation
  - Credential testing with various scenarios
  - Integration with RTSP streams

### **System Validation**
- **`validate_all_tests.py`** - Comprehensive validation framework
  - Orchestrates multiple test scenarios
  - Provides detailed reporting and analysis
  - Suitable for CI/CD integration

### **Basic Functionality**
- **`test-basic-functionality.sh`** - Core functionality validation
  - Basic API endpoint testing
  - Pipeline generation validation
  - Health check verification

### **Frame Extraction Testing**
- **`test-frame-extraction.sh`** - OpenCV frame extraction validation
  - Tests frame capture capabilities
  - Validates image processing functionality
  - Complements unified platform OpenCV integration

### **API Testing**
- **`simple_api_test.py`** - Basic API endpoint testing
  - Simple validation of core endpoints
  - Useful for quick functionality checks
  - Lightweight testing option

### **Stream Characteristics**
- **`test_characteristics_detailed.py`** - RTSP stream analysis testing
  - Detailed stream characteristic extraction
  - SDP parsing validation
  - Codec detection testing

## 🧪 **Primary Testing Framework**

### **For RTSP Test Server Validation**
**Primary Script**: `../rtsp-test-server/validate-enhanced-rtsp-server.sh`
- Comprehensive 50+ stream validation
- Authentication testing (Basic/Digest)
- Transport protocol testing (UDP/TCP)
- Quality variation testing
- Detailed reporting with success/failure analysis

### **Usage Examples**
```bash
# Comprehensive RTSP validation
cd ../rtsp-test-server/
./validate-enhanced-rtsp-server.sh

# Quick RTSP validation
./validate-enhanced-rtsp-server.sh --quick

# Authentication-only testing
./validate-enhanced-rtsp-server.sh --auth-only

# Basic functionality testing
cd testing/
./test-basic-functionality.sh

# Authentication testing
./test-authentication.sh

# Comprehensive validation framework
python3 validate_all_tests.py
```

## 🎯 **Testing Strategy**

### **Component-Level Testing**
- **RTSP Test Server**: Use enhanced validation script in rtsp-test-server/
- **Pipeline Generation**: Use unified platform API testing
- **Camera Management**: Use authentication and API testing scripts
- **Frame Extraction**: Use frame extraction testing script

### **Integration Testing**
- **End-to-End**: Use validate_all_tests.py for comprehensive scenarios
- **Authentication Flow**: Use test-authentication.sh for auth scenarios
- **Basic Functionality**: Use test-basic-functionality.sh for core features

### **Performance Testing**
- **Load Testing**: Use enhanced RTSP validation with multiple concurrent streams
- **Stress Testing**: Use 4K/8K streams when available (Phase 3+)
- **Network Testing**: Use transport protocol variations (UDP/TCP)

## 📊 **Test Coverage**

### **Current Coverage**
- ✅ **RTSP Stream Validation**: 50+ streams with 85% real-world coverage
- ✅ **Authentication Testing**: Basic and Digest auth with real credentials
- ✅ **Transport Protocols**: UDP and TCP validation
- ✅ **API Endpoints**: Core functionality and error handling
- ✅ **Frame Extraction**: OpenCV integration validation

### **Planned Coverage (Phase 3+)**
- 🔄 **4K/8K Stream Testing**: High-resolution stress testing
- 🔄 **Advanced Audio Codecs**: G.711 A-law, G.722, Opus
- 🔄 **Network Simulation**: Packet loss, jitter, bandwidth limiting
- 🔄 **Multi-Stream Testing**: Main + sub stream combinations

## 🚀 **CI/CD Integration**

### **Quick Validation (CI Pipeline)**
```bash
# Fast validation for CI/CD
../rtsp-test-server/validate-enhanced-rtsp-server.sh --quick
./test-basic-functionality.sh
```

### **Comprehensive Validation (Nightly)**
```bash
# Full validation for nightly builds
../rtsp-test-server/validate-enhanced-rtsp-server.sh
python3 validate_all_tests.py
./test-authentication.sh
```

### **Performance Validation (Weekly)**
```bash
# Performance and stress testing
../rtsp-test-server/validate-enhanced-rtsp-server.sh --duration 10
# Additional performance tests as available
```

## 📝 **Adding New Tests**

### **For RTSP-Specific Testing**
- Add to `../rtsp-test-server/validate-enhanced-rtsp-server.sh`
- Follow existing pattern for new stream configurations
- Update stream matrix in rtsp-test-server-enhanced.py

### **For Platform-Specific Testing**
- Add new scripts to this directory
- Follow naming convention: `test-[component]-[feature].sh`
- Update this README with new script documentation
- Integrate with validate_all_tests.py if appropriate

## 🔧 **Troubleshooting**

### **Common Issues**
- **Authentication Failures**: Check credentials and auth method support
- **Network Connectivity**: Verify RTSP server accessibility
- **GStreamer Errors**: Check element availability and pipeline syntax
- **Permission Issues**: Ensure scripts are executable (chmod +x)

### **Debug Mode**
Most scripts support verbose/debug modes:
```bash
# Enable debug output
GST_DEBUG=3 ./test-frame-extraction.sh
./test-authentication.sh --verbose
```

---

**Note**: This testing suite complements the enhanced RTSP Test Server validation framework. For comprehensive RTSP testing, use the enhanced validation script in the rtsp-test-server directory.
