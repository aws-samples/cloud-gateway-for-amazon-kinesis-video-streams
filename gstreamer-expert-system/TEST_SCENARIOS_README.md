# 🧪 GStreamer Expert Test Scenarios

Easy framework for adding and managing test scenarios for the GStreamer Expert system.

## 🚀 Quick Start

### Add a Test Scenario with Simple Prompt

```bash
# Just describe what you want to test:
python3 add_test_scenario.py "How do I fix green screen artifacts in my RTSP pipeline?"

# Or troubleshoot a specific issue:
python3 add_test_scenario.py "My pipeline gst-launch-1.0 rtspsrc ! h264parse ! kvssink has audio sync issues"
```

### Interactive Mode

```bash
# Guided interface for adding scenarios:
python3 add_test_scenario.py
```

### Run Tests

```bash
# Activate environment first
cd mcp-gstreamer-expert && source venv/bin/activate && cd ..

# List all scenarios
python3 test_scenarios.py list

# Run specific scenario
python3 test_scenarios.py run 1

# Run all scenarios
python3 test_scenarios.py run-all

# Run scenarios with specific tag
python3 test_scenarios.py run-tag troubleshooting
```

## 📋 Test Types

### 1. Comprehensive Tests
Test the full GStreamer expert with complex queries:
```python
add_comprehensive_test(
    "RTSP to KVS with ML",
    "Test RTSP streaming to KVS with object detection",
    "How do I add OpenVINO object detection to my RTSP to KVS pipeline?",
    ["gvadetect", "kvssink", "rtspsrc", "openvino"],
    ["ml", "kvs", "advanced"]
)
```

### 2. Troubleshooting Tests
Test diagnosis of specific pipeline issues:
```python
add_troubleshooting_test(
    "Green Screen Issue",
    "Test diagnosis of color space problems",
    "gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! nvh264dec ! autovideosink",
    "video shows green screen instead of proper colors",
    ["color space", "yuv", "rgb", "videoconvert"],
    ["quality", "troubleshooting"]
)
```

### 3. Element Search Tests
Test finding specific GStreamer elements:
```python
add_element_search_test(
    "NVIDIA Encoders",
    "Test finding NVIDIA hardware encoders",
    "nvidia h264 encoder hardware",
    ["nvh264enc", "nvh265enc"],
    ["nvidia", "encoders", "hardware"]
)
```

## 🎯 Common Test Scenarios to Add

### Quality Issues
- Pixelation problems
- Green/gray screen artifacts
- Audio/video sync issues
- Compression artifacts
- Color space problems

### Performance Issues
- High CPU usage
- Memory leaks
- Latency problems
- Frame rate drops

### Platform-Specific
- macOS VideoToolbox acceleration
- Linux VAAPI/NVIDIA optimization
- Windows MediaFoundation integration

### Complex Pipelines
- Multi-output tee configurations
- ML inference integration (OpenVINO, NVIDIA)
- Real-time streaming optimizations
- Multi-camera setups

## 📊 Test Results

Results are automatically saved to `test_results.json` with:
- Response quality metrics
- Keyword matching success rates
- Performance timing
- Historical trends

## 🏷️ Useful Tags

- `basic` - Simple, fundamental scenarios
- `advanced` - Complex multi-component pipelines
- `troubleshooting` - Problem diagnosis tests
- `quality` - Media quality issues
- `performance` - Performance optimization
- `kvs` - Kinesis Video Streams related
- `ml` - Machine learning integration
- `nvidia` - NVIDIA-specific features
- `macos` - macOS-specific tests
- `linux` - Linux-specific tests
- `windows` - Windows-specific tests

## 🔄 Workflow for Adding New Scenarios

### When You Encounter a New Issue:

1. **Quick Add**: 
   ```bash
   python3 add_test_scenario.py "Your issue description here"
   ```

2. **Test Immediately**:
   The script will offer to run the test right away

3. **Refine if Needed**:
   Edit `test_scenarios.json` to adjust expected keywords or add more details

### Regular Testing:

```bash
# Weekly regression testing
python3 test_scenarios.py run-all

# Test specific areas
python3 test_scenarios.py run-tag quality
python3 test_scenarios.py run-tag troubleshooting
```

## 📁 Files Created

- `test_scenarios.json` - All test scenario definitions
- `test_results.json` - Historical test results and metrics
- Individual test runs with timestamps and success rates

## 🎯 Success Criteria

Tests pass when:
- 70% or more expected keywords appear in responses
- No errors during execution
- Response length indicates comprehensive answer (for comprehensive tests)
- Specific metrics met (elements found, problems diagnosed, etc.)

## 💡 Tips for Good Test Scenarios

1. **Specific Keywords**: Use exact element names, technical terms
2. **Realistic Scenarios**: Base on real user problems
3. **Clear Descriptions**: Make it easy to understand what's being tested
4. **Good Tags**: Use consistent tagging for easy filtering
5. **Expected Outcomes**: Define what success looks like

## 🔧 Example Usage Session

```bash
# Add a new scenario for a problem you encountered
python3 add_test_scenario.py "Pipeline fails with caps negotiation error between rtph264depay and kvssink"

# Test it immediately
python3 test_scenarios.py run 4

# Add to regular test suite
python3 test_scenarios.py run-tag troubleshooting

# Check overall system health
python3 test_scenarios.py run-all
```

This framework makes it easy to continuously improve the GStreamer Expert system by capturing real-world scenarios and ensuring consistent quality over time.
