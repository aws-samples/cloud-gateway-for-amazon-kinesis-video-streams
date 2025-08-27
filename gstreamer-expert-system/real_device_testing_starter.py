#!/usr/bin/env python3
"""
Real-Device Testing Framework - Starter Implementation
Validates GStreamer pipeline recommendations on actual hardware
"""

import asyncio
import json
import subprocess
import time
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

class DeviceType(Enum):
    LOCAL_MACOS = "local_macos"
    DOCKER_LINUX = "docker_linux"
    RASPBERRY_PI = "raspberry_pi"
    JETSON_NANO = "jetson_nano"
    EC2_LINUX = "ec2_linux"
    EC2_WINDOWS = "ec2_windows"

@dataclass
class TestDevice:
    name: str
    device_type: DeviceType
    connection_info: Dict
    capabilities: List[str]
    status: str = "unknown"

@dataclass
class TestScenario:
    name: str
    pipeline: str
    expected_outcome: str
    timeout: int = 30
    platforms: List[DeviceType] = None
    requirements: List[str] = None

class RealDeviceTestFramework:
    """Framework for testing GStreamer pipelines on real devices"""
    
    def __init__(self):
        self.devices = []
        self.test_scenarios = []
        self.results = []
        
    def register_device(self, device: TestDevice):
        """Register a test device"""
        self.devices.append(device)
        print(f"✅ Registered device: {device.name} ({device.device_type.value})")
    
    def add_test_scenario(self, scenario: TestScenario):
        """Add a test scenario"""
        self.test_scenarios.append(scenario)
        print(f"✅ Added test scenario: {scenario.name}")
    
    async def test_device_health(self, device: TestDevice) -> bool:
        """Check if device is accessible and ready for testing"""
        
        print(f"🔍 Health check: {device.name}")
        
        try:
            if device.device_type == DeviceType.LOCAL_MACOS:
                # Test local macOS
                result = subprocess.run(['gst-launch-1.0', '--version'], 
                                      capture_output=True, text=True, timeout=10)
                return result.returncode == 0
                
            elif device.device_type == DeviceType.DOCKER_LINUX:
                # Test Docker container
                container_name = device.connection_info.get('container_name')
                result = subprocess.run(['docker', 'exec', container_name, 'gst-launch-1.0', '--version'],
                                      capture_output=True, text=True, timeout=10)
                return result.returncode == 0
                
            # Add other device types as needed
            return False
            
        except Exception as e:
            print(f"❌ Health check failed for {device.name}: {e}")
            return False
    
    async def execute_pipeline_on_device(self, device: TestDevice, scenario: TestScenario) -> Dict:
        """Execute a pipeline on a specific device"""
        
        print(f"🧪 Testing '{scenario.name}' on {device.name}")
        
        start_time = time.time()
        result = {
            'device': device.name,
            'scenario': scenario.name,
            'pipeline': scenario.pipeline,
            'success': False,
            'execution_time': 0,
            'stdout': '',
            'stderr': '',
            'error': None
        }
        
        try:
            if device.device_type == DeviceType.LOCAL_MACOS:
                # Execute on local macOS
                process = subprocess.run(
                    scenario.pipeline.split(),
                    capture_output=True,
                    text=True,
                    timeout=scenario.timeout
                )
                
                result['stdout'] = process.stdout
                result['stderr'] = process.stderr
                result['success'] = process.returncode == 0
                
            elif device.device_type == DeviceType.DOCKER_LINUX:
                # Execute in Docker container
                container_name = device.connection_info.get('container_name')
                cmd = ['docker', 'exec', container_name] + scenario.pipeline.split()
                
                process = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=scenario.timeout
                )
                
                result['stdout'] = process.stdout
                result['stderr'] = process.stderr
                result['success'] = process.returncode == 0
            
            result['execution_time'] = time.time() - start_time
            
        except subprocess.TimeoutExpired:
            result['error'] = f"Pipeline timed out after {scenario.timeout} seconds"
        except Exception as e:
            result['error'] = str(e)
        
        # Log result
        status = "✅" if result['success'] else "❌"
        print(f"   {status} {scenario.name} on {device.name} ({result['execution_time']:.2f}s)")
        
        return result
    
    async def run_comprehensive_test_suite(self) -> Dict:
        """Run all test scenarios on all compatible devices"""
        
        print("🚀 Starting comprehensive test suite...")
        
        # Health check all devices
        healthy_devices = []
        for device in self.devices:
            if await self.test_device_health(device):
                healthy_devices.append(device)
                device.status = "healthy"
            else:
                device.status = "unhealthy"
        
        print(f"📊 {len(healthy_devices)}/{len(self.devices)} devices healthy")
        
        # Run tests
        all_results = []
        for scenario in self.test_scenarios:
            for device in healthy_devices:
                # Check if scenario is compatible with device
                if scenario.platforms and device.device_type not in scenario.platforms:
                    continue
                
                result = await self.execute_pipeline_on_device(device, scenario)
                all_results.append(result)
        
        # Generate summary
        successful_tests = sum(1 for r in all_results if r['success'])
        total_tests = len(all_results)
        
        summary = {
            'total_tests': total_tests,
            'successful_tests': successful_tests,
            'success_rate': successful_tests / total_tests if total_tests > 0 else 0,
            'results': all_results,
            'device_summary': {
                device.name: device.status for device in self.devices
            }
        }
        
        print(f"📈 Test Summary: {successful_tests}/{total_tests} tests passed ({summary['success_rate']:.1%})")
        
        return summary

# Example usage and starter test scenarios
def create_starter_test_suite():
    """Create a starter test suite with basic scenarios"""
    
    framework = RealDeviceTestFramework()
    
    # Register test devices
    framework.register_device(TestDevice(
        name="local-macos",
        device_type=DeviceType.LOCAL_MACOS,
        connection_info={},
        capabilities=["videotoolbox", "macos"]
    ))
    
    # Add basic test scenarios
    framework.add_test_scenario(TestScenario(
        name="gstreamer_version_check",
        pipeline="gst-launch-1.0 --version",
        expected_outcome="version_output",
        timeout=10,
        platforms=[DeviceType.LOCAL_MACOS, DeviceType.DOCKER_LINUX]
    ))
    
    framework.add_test_scenario(TestScenario(
        name="videotestsrc_basic",
        pipeline="gst-launch-1.0 videotestsrc num-buffers=10 ! fakesink",
        expected_outcome="successful_execution",
        timeout=15,
        platforms=[DeviceType.LOCAL_MACOS, DeviceType.DOCKER_LINUX]
    ))
    
    framework.add_test_scenario(TestScenario(
        name="h264_encoding_test",
        pipeline="gst-launch-1.0 videotestsrc num-buffers=30 ! x264enc ! fakesink",
        expected_outcome="successful_encoding",
        timeout=20,
        platforms=[DeviceType.LOCAL_MACOS, DeviceType.DOCKER_LINUX]
    ))
    
    return framework

async def main():
    """Main test execution"""
    
    print("🧪 Real-Device Testing Framework - Starter")
    print("=" * 50)
    
    # Create test suite
    framework = create_starter_test_suite()
    
    # Run comprehensive tests
    results = await framework.run_comprehensive_test_suite()
    
    # Save results
    with open('test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📊 Results saved to test_results.json")
    print(f"🎯 Success rate: {results['success_rate']:.1%}")

if __name__ == "__main__":
    asyncio.run(main())
