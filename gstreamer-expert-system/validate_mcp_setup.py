#!/usr/bin/env python3
"""
Final MCP Configuration Validation
Ensures everything is properly set up for Q CLI integration
"""

import json
import os
import subprocess

def validate_mcp_configuration():
    """Validate complete MCP setup"""
    
    print("🔍 Final MCP Configuration Validation")
    print("=" * 50)
    
    validation_results = {
        "config_file": False,
        "server_script": False,
        "server_executable": False,
        "dependencies": False,
        "tools_configured": False,
        "auto_approve_complete": False
    }
    
    # 1. Check MCP configuration file
    print("1. Checking MCP configuration...")
    mcp_config_path = "/Users/dmalone/.aws/amazonq/mcp.json"
    
    try:
        with open(mcp_config_path, 'r') as f:
            config = json.load(f)
        
        if "enhanced-gstreamer-expert" in config.get("mcpServers", {}):
            server_config = config["mcpServers"]["enhanced-gstreamer-expert"]
            validation_results["config_file"] = True
            print("   ✅ MCP configuration file exists and contains enhanced-gstreamer-expert")
            
            # Check auto-approve tools
            auto_approve = server_config.get("autoApprove", [])
            expected_tools = [
                "search_gstreamer_elements",
                "get_element_documentation", 
                "search_pipeline_patterns",
                "troubleshoot_pipeline_issues",
                "optimize_pipeline_performance",
                "validate_pipeline_compatibility",
                "gstreamer_expert"
            ]
            
            if all(tool in auto_approve for tool in expected_tools):
                validation_results["auto_approve_complete"] = True
                print(f"   ✅ All {len(expected_tools)} tools configured for auto-approve")
            else:
                missing = [tool for tool in expected_tools if tool not in auto_approve]
                print(f"   ⚠️  Missing auto-approve for: {missing}")
            
        else:
            print("   ❌ enhanced-gstreamer-expert not found in MCP configuration")
            
    except Exception as e:
        print(f"   ❌ Failed to read MCP configuration: {e}")
    
    # 2. Check server startup script
    print("\\n2. Checking server startup script...")
    server_script = "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/start_enhanced_server.sh"
    
    if os.path.exists(server_script):
        validation_results["server_script"] = True
        print("   ✅ Server startup script exists")
        
        if os.access(server_script, os.X_OK):
            validation_results["server_executable"] = True
            print("   ✅ Server script is executable")
        else:
            print("   ❌ Server script is not executable")
    else:
        print("   ❌ Server startup script not found")
    
    # 3. Check server dependencies
    print("\\n3. Checking server dependencies...")
    try:
        venv_python = "/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/venv/bin/python3"
        test_cmd = [venv_python, "-c", "import boto3, mcp; from complete_multi_tool_server import CompleteGStreamerExpert; print('All dependencies OK')"]
        result = subprocess.run(test_cmd, capture_output=True, text=True, timeout=10, cwd="/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert")
        
        if result.returncode == 0:
            validation_results["dependencies"] = True
            print("   ✅ All server dependencies available")
        else:
            print(f"   ❌ Dependency check failed: {result.stderr}")
    except Exception as e:
        print(f"   ❌ Dependency test failed: {e}")
    
    # 4. Check tool definitions
    print("\\n4. Checking tool definitions...")
    try:
        # Import and check tools
        import sys
        sys.path.append('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert')
        
        # Test import without running server
        with open('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/complete_multi_tool_server.py', 'r') as f:
            content = f.read()
            
        # Check for all expected tools
        expected_tools = [
            "search_gstreamer_elements",
            "get_element_documentation", 
            "search_pipeline_patterns",
            "troubleshoot_pipeline_issues",
            "gstreamer_expert"
        ]
        
        tools_found = all(tool in content for tool in expected_tools)
        
        if tools_found:
            validation_results["tools_configured"] = True
            print("   ✅ All expected tools defined in server")
        else:
            print("   ❌ Some tools missing from server definition")
            
    except Exception as e:
        print(f"   ❌ Tool definition check failed: {e}")
    
    # 5. Summary
    print("\\n" + "=" * 50)
    print("📊 Validation Summary:")
    
    all_passed = all(validation_results.values())
    
    for check, passed in validation_results.items():
        status = "✅" if passed else "❌"
        print(f"   {status} {check.replace('_', ' ').title()}")
    
    if all_passed:
        print("\\n🎉 All validations passed! MCP setup is complete.")
        print("\\n🚀 Ready to use:")
        print("   1. Start Q CLI: q chat")
        print("   2. Try: 'Search for H.264 encoders'")
        print("   3. Try: 'How do I fix pixelation in my RTSP pipeline?'")
        return True
    else:
        print("\\n⚠️  Some validations failed. Please fix the issues above.")
        return False

def show_final_configuration():
    """Show the final configuration summary"""
    
    print("\\n📋 Final Configuration Summary:")
    print("=" * 40)
    
    print("🔧 MCP Server: enhanced-gstreamer-expert")
    print("📁 Script: /Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert/start_enhanced_server.sh")
    print("🌍 Environment: AWS_PROFILE=malone-aws, AWS_REGION=us-east-1")
    
    print("\\n🛠️ Available Tools (7 total):")
    tools = [
        "search_gstreamer_elements - Find elements by capability",
        "get_element_documentation - Element details & properties", 
        "search_pipeline_patterns - Working pipeline examples",
        "troubleshoot_pipeline_issues - Diagnose problems with context gathering",
        "optimize_pipeline_performance - Performance tuning",
        "validate_pipeline_compatibility - Check element compatibility",
        "gstreamer_expert - Comprehensive assistance"
    ]
    
    for tool in tools:
        print(f"   • {tool}")
    
    print("\\n🔐 Auto-Approve: All tools pre-approved for seamless usage")
    print("\\n📚 Documentation:")
    print("   • PROMPTING_TECHNIQUES_GUIDE.md - Advanced prompting examples")
    print("   • QUICK_PROMPTS_REFERENCE.md - Quick reference card")
    print("   • Q_CLI_USAGE_GUIDE.md - Complete usage guide")

if __name__ == "__main__":
    success = validate_mcp_configuration()
    
    if success:
        show_final_configuration()
        print("\\n✨ Enhanced GStreamer Expert system is ready for production use!")
    else:
        print("\\n🔧 Please resolve the validation issues before proceeding.")
