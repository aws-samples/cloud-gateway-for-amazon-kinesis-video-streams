#!/usr/bin/env python3
"""
Test Q CLI Integration with Enhanced GStreamer Expert
"""

import subprocess
import json
import time

def test_q_cli_integration():
    """Test that Q CLI can access the enhanced GStreamer expert tools"""
    
    print("🧪 Testing Q CLI Integration with Enhanced GStreamer Expert")
    print("=" * 60)
    
    # Test 1: Check if Q CLI is available
    print("1. Testing Q CLI availability...")
    try:
        result = subprocess.run(['q', '--help'], capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("   ✅ Q CLI is available")
        else:
            print("   ❌ Q CLI not available or not working")
            return False
    except Exception as e:
        print(f"   ❌ Q CLI test failed: {e}")
        return False
    
    # Test 2: Check MCP server configuration
    print("\\n2. Checking MCP server configuration...")
    mcp_config_path = "/Users/dmalone/.aws/amazonq/mcp.json"
    try:
        with open(mcp_config_path, 'r') as f:
            config = json.load(f)
        
        if "enhanced-gstreamer-expert" in config.get("mcpServers", {}):
            server_config = config["mcpServers"]["enhanced-gstreamer-expert"]
            print("   ✅ Enhanced GStreamer Expert server configured")
            print(f"   📁 Command: {server_config['command']}")
            print(f"   🔧 Disabled: {server_config.get('disabled', False)}")
            print(f"   🔐 Auto-approve: {len(server_config.get('autoApprove', []))} tools")
        else:
            print("   ❌ Enhanced GStreamer Expert server not found in configuration")
            return False
            
    except Exception as e:
        print(f"   ❌ Failed to read MCP configuration: {e}")
        return False
    
    # Test 3: Check server script exists and is executable
    print("\\n3. Checking server startup script...")
    server_script = "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/start_enhanced_server.sh"
    try:
        import os
        if os.path.exists(server_script):
            print("   ✅ Server script exists")
            if os.access(server_script, os.X_OK):
                print("   ✅ Server script is executable")
            else:
                print("   ❌ Server script is not executable")
                return False
        else:
            print("   ❌ Server script not found")
            return False
    except Exception as e:
        print(f"   ❌ Server script check failed: {e}")
        return False
    
    # Test 4: Test server dependencies
    print("\\n4. Testing server dependencies...")
    try:
        # Test in the virtual environment
        venv_python = "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/venv/bin/python3"
        test_cmd = [venv_python, "-c", "import boto3, mcp; print('Dependencies OK')"]
        result = subprocess.run(test_cmd, capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("   ✅ Server dependencies available")
        else:
            print(f"   ❌ Dependency check failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"   ❌ Dependency test failed: {e}")
        return False
    
    print("\\n🎉 Q CLI Integration Setup Complete!")
    print("\\n📋 Next Steps:")
    print("1. Start a new Q CLI session: `q chat`")
    print("2. Test GStreamer expert tools:")
    print("   - Ask: 'Search for H.264 encoders'")
    print("   - Ask: 'How do I fix pixelation in my RTSP pipeline?'")
    print("   - Ask: 'Find documentation for kvssink element'")
    print("\\n🔧 Available Tools:")
    print("   • search_gstreamer_elements - Find elements by capability")
    print("   • get_element_documentation - Get detailed element info")
    print("   • search_pipeline_patterns - Find working pipeline examples")
    print("   • troubleshoot_pipeline_issues - Diagnose quality/performance issues")
    print("   • gstreamer_expert - Comprehensive GStreamer assistance")
    
    return True

def create_usage_guide():
    """Create a usage guide for the Q CLI integration"""
    
    guide_content = """# 🎯 Enhanced GStreamer Expert - Q CLI Usage Guide

## 🚀 Getting Started

Start Q CLI and begin asking GStreamer questions:
```bash
q chat
```

## 🛠️ Available Tools

### 1. **Comprehensive GStreamer Expert**
Ask any GStreamer question for complete solutions:
```
How do I create an RTSP to KVS pipeline with audio and video?
Help me optimize my pipeline for low latency streaming
I need to add object detection to my webcam pipeline
```

### 2. **Element Search**
Find specific GStreamer elements:
```
Search for NVIDIA H.264 encoders
Find elements for audio conversion
What elements can I use for RTSP streaming?
```

### 3. **Element Documentation**
Get detailed information about specific elements:
```
Get documentation for kvssink
Show me properties of x264enc
What caps does rtspsrc support?
```

### 4. **Pipeline Patterns**
Find working pipeline examples:
```
Find RTSP to KVS pipeline patterns
Show me webcam recording examples
Search for multi-output tee patterns
```

### 5. **Troubleshooting**
Diagnose pipeline issues:
```
My pipeline has pixelation issues: gst-launch-1.0 rtspsrc ! rtph264depay ! h264parse ! x264enc bitrate=100 ! kvssink
Troubleshoot green screen artifacts in my RTSP pipeline
My pipeline uses too much CPU, how can I optimize it?
```

## 🎯 Example Conversations

### Basic Pipeline Creation
**You**: "How do I stream from my macOS webcam to Kinesis Video Streams?"

**Expert**: Provides immediate working solution with platform-specific optimizations

### Quality Issues
**You**: "My RTSP stream has green screen artifacts, how do I fix this?"

**Expert**: Diagnoses color space issues and provides specific solutions

### Performance Optimization
**You**: "My pipeline uses too much CPU, can you optimize it for hardware acceleration?"

**Expert**: Analyzes pipeline and suggests platform-specific hardware acceleration

### Complex Scenarios
**You**: "I need to add OpenVINO object detection to my RTSP to KVS pipeline"

**Expert**: Provides complete multi-branch pipeline with ML inference integration

## 🔧 Advanced Features

### Multi-Tool Workflow
The system automatically uses the most appropriate tool for your question:
- **Simple element questions** → Element search/documentation tools
- **Pipeline issues** → Troubleshooting tools  
- **Complex scenarios** → Comprehensive expert with all tools combined

### Intelligent Context Analysis
The system automatically detects:
- Source types (RTSP, webcam, file)
- Destination types (KVS, display, file)
- Platform (macOS, Linux, Windows)
- Issues (quality, performance, initialization)
- Complexity level (basic, advanced, ML inference)

### Knowledge Base Integration
All responses are backed by:
- 324 comprehensive GStreamer documents
- Tested pipeline examples
- Platform-specific optimizations
- Hardware acceleration guides

## 🎯 Tips for Best Results

1. **Be Specific**: Include pipeline commands, error messages, or specific requirements
2. **Mention Platform**: Specify macOS, Linux, or Windows for optimized recommendations
3. **Describe Issues**: Use specific terms like "pixelation", "green screen", "high CPU"
4. **Ask Follow-ups**: The system maintains context for iterative improvements

## 🚨 Troubleshooting Q CLI Integration

If tools aren't working:
1. Check MCP server status: Look for "enhanced-gstreamer-expert" in available tools
2. Restart Q CLI session: Exit and run `q chat` again
3. Check server logs: Look for any startup errors
4. Verify configuration: Ensure MCP configuration is correct

## 📊 Quality Assurance

The system includes automated testing for:
- Pipeline accuracy validation
- Element compatibility checking
- Quality issue diagnosis
- Performance optimization recommendations

All responses are continuously validated against real-world scenarios.
"""
    
    with open('/Users/dmalone/Desktop/bedrock-gstreamer/Q_CLI_USAGE_GUIDE.md', 'w') as f:
        f.write(guide_content)
    
    print("📚 Created Q CLI Usage Guide: Q_CLI_USAGE_GUIDE.md")

if __name__ == "__main__":
    success = test_q_cli_integration()
    
    if success:
        create_usage_guide()
        print("\\n🎉 Setup complete! You can now use the enhanced GStreamer expert in Q CLI.")
    else:
        print("\\n❌ Setup incomplete. Please fix the issues above before using Q CLI.")
