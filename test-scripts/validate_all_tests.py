#!/usr/bin/env python3
"""
Comprehensive validation script for all test scripts
Validates that all test scripts work with the current Lambda function
"""

import subprocess
import sys
import os

def run_test(script_name, args, description):
    """Run a test script and return success status"""
    print(f"\n🧪 Testing: {description}")
    print(f"📄 Script: {script_name}")
    print("-" * 60)
    
    try:
        cmd = ["python3", f"test-scripts/{script_name}"] + args
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        
        if result.returncode == 0:
            print("✅ SUCCESS")
            # Show first few lines of output
            lines = result.stdout.split('\n')[:10]
            for line in lines:
                if line.strip():
                    print(f"   {line}")
            if len(result.stdout.split('\n')) > 10:
                print("   ...")
            return True
        else:
            print("❌ FAILED")
            print(f"   Return code: {result.returncode}")
            if result.stderr:
                print(f"   Error: {result.stderr[:200]}...")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ TIMEOUT (180s)")
        return False
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def main():
    """Run all test validations"""
    print("🚀 COMPREHENSIVE TEST SCRIPT VALIDATION")
    print("=" * 70)
    
    # Test URL
    test_url = "rtsp://rtspgateway:qOjicr6ro7ER@47.198.161.34/Preview_05_main"
    
    # Test cases
    tests = [
        {
            "script": "test_dual_mode.py",
            "args": [test_url],
            "description": "Dual-mode comprehensive test (Mode 1 + Mode 2)"
        },
        {
            "script": "test_characteristics_detailed.py", 
            "args": [test_url],
            "description": "Detailed stream characteristics analysis"
        },
        {
            "script": "simple_api_test.py",
            "args": [test_url],
            "description": "Simple pipeline generation test"
        },
        {
            "script": "test-pipeline-generator.py",
            "args": [
                "--rtsp-url", test_url,
                "--test-type", "api",
                "--api-url", "https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline"
            ],
            "description": "Advanced pipeline generator test"
        }
    ]
    
    # Run all tests
    results = []
    for test in tests:
        success = run_test(test["script"], test["args"], test["description"])
        results.append({
            "script": test["script"],
            "description": test["description"],
            "success": success
        })
    
    # Summary
    print("\n" + "=" * 70)
    print("📊 TEST VALIDATION SUMMARY")
    print("=" * 70)
    
    passed = 0
    total = len(results)
    
    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        print(f"{status} - {result['script']}")
        print(f"      {result['description']}")
        if result["success"]:
            passed += 1
    
    print(f"\n🎯 RESULTS: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All test scripts are valid and working!")
        print("✅ Ready for production use")
        return 0
    else:
        print("⚠️  Some test scripts need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())
