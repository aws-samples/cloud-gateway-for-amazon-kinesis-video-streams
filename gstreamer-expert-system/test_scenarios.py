#!/usr/bin/env python3
"""
Easy Test Scenario Framework for GStreamer Expert System
Add new test scenarios with simple prompts and track results over time
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Dict, List

# Add the MCP server to path
sys.path.append('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert')

class TestScenarioFramework:
    """Framework for easily adding and running GStreamer test scenarios"""
    
    def __init__(self):
        self.scenarios_file = '/Users/dmalone/Desktop/bedrock-gstreamer/test_scenarios.json'
        self.results_file = '/Users/dmalone/Desktop/bedrock-gstreamer/test_results.json'
        self.scenarios = self.load_scenarios()
        self.results = self.load_results()
        
        # Initialize expert
        from complete_multi_tool_server import CompleteGStreamerExpert
        self.expert = CompleteGStreamerExpert()

    def load_scenarios(self) -> Dict:
        """Load test scenarios from file"""
        if os.path.exists(self.scenarios_file):
            with open(self.scenarios_file, 'r') as f:
                return json.load(f)
        else:
            return {
                "scenarios": [],
                "metadata": {
                    "created": datetime.now().isoformat(),
                    "total_scenarios": 0
                }
            }

    def load_results(self) -> Dict:
        """Load test results from file"""
        if os.path.exists(self.results_file):
            with open(self.results_file, 'r') as f:
                return json.load(f)
        else:
            return {
                "test_runs": [],
                "metadata": {
                    "created": datetime.now().isoformat(),
                    "total_runs": 0
                }
            }

    def save_scenarios(self):
        """Save scenarios to file"""
        self.scenarios["metadata"]["total_scenarios"] = len(self.scenarios["scenarios"])
        self.scenarios["metadata"]["last_updated"] = datetime.now().isoformat()
        
        with open(self.scenarios_file, 'w') as f:
            json.dump(self.scenarios, f, indent=2)

    def save_results(self):
        """Save results to file"""
        self.results["metadata"]["total_runs"] = len(self.results["test_runs"])
        self.results["metadata"]["last_updated"] = datetime.now().isoformat()
        
        with open(self.results_file, 'w') as f:
            json.dump(self.results, f, indent=2)

    def add_scenario(self, name: str, description: str, test_type: str, 
                    query: str = "", pipeline: str = "", symptoms: str = "", 
                    expected_keywords: List[str] = None, tags: List[str] = None):
        """
        Add a new test scenario with simple parameters
        
        Args:
            name: Short name for the scenario
            description: What this scenario tests
            test_type: 'comprehensive', 'troubleshoot', 'element_search', 'pipeline_patterns', 'element_docs'
            query: Query for comprehensive or search tests
            pipeline: Pipeline for troubleshooting tests
            symptoms: Symptoms for troubleshooting tests
            expected_keywords: Keywords that should appear in successful responses
            tags: Tags for categorizing scenarios
        """
        
        scenario = {
            "id": len(self.scenarios["scenarios"]) + 1,
            "name": name,
            "description": description,
            "test_type": test_type,
            "parameters": {
                "query": query,
                "pipeline": pipeline,
                "symptoms": symptoms
            },
            "expected_keywords": expected_keywords or [],
            "tags": tags or [],
            "created": datetime.now().isoformat(),
            "last_run": None,
            "success_count": 0,
            "failure_count": 0
        }
        
        self.scenarios["scenarios"].append(scenario)
        self.save_scenarios()
        
        print(f"✅ Added scenario '{name}' (ID: {scenario['id']})")
        return scenario['id']

    async def run_scenario(self, scenario_id: int) -> Dict:
        """Run a specific test scenario"""
        
        scenario = next((s for s in self.scenarios["scenarios"] if s["id"] == scenario_id), None)
        if not scenario:
            return {"error": f"Scenario {scenario_id} not found"}
        
        print(f"🧪 Running scenario: {scenario['name']}")
        
        try:
            # Set AWS environment
            os.environ['AWS_PROFILE'] = 'malone-aws'
            os.environ['AWS_REGION'] = 'us-east-1'
            
            result = {"scenario_id": scenario_id, "timestamp": datetime.now().isoformat()}
            
            # Run the appropriate test based on type
            if scenario["test_type"] == "comprehensive":
                response = await self.expert.base_expert.get_comprehensive_solution(scenario["parameters"]["query"])
                result["response"] = response
                result["response_length"] = len(response)
                
            elif scenario["test_type"] == "troubleshoot":
                response = await self.expert.troubleshoot_pipeline_issues(
                    scenario["parameters"]["pipeline"],
                    scenario["parameters"]["symptoms"]
                )
                result["response"] = response
                result["issue_type"] = response.get("issue_type", "unknown")
                result["diagnosed_problems"] = len(response.get("diagnosed_problems", []))
                
            elif scenario["test_type"] == "element_search":
                response = await self.expert.search_gstreamer_elements(scenario["parameters"]["query"])
                result["response"] = response
                result["elements_found"] = response.get("total_found", 0)
                
            elif scenario["test_type"] == "pipeline_patterns":
                response = await self.expert.search_pipeline_patterns(scenario["parameters"]["query"])
                result["response"] = response
                result["patterns_found"] = response.get("total_found", 0)
                
            elif scenario["test_type"] == "element_docs":
                response = await self.expert.get_element_documentation(scenario["parameters"]["query"])
                result["response"] = response
                result["has_properties"] = len(response.get("properties", [])) > 0
                result["has_examples"] = len(response.get("usage_examples", [])) > 0
            
            # Check for expected keywords
            response_text = str(result["response"]).lower()
            keyword_matches = []
            for keyword in scenario["expected_keywords"]:
                if keyword.lower() in response_text:
                    keyword_matches.append(keyword)
            
            result["keyword_matches"] = keyword_matches
            result["keyword_success_rate"] = len(keyword_matches) / len(scenario["expected_keywords"]) if scenario["expected_keywords"] else 1.0
            
            # Determine success
            result["success"] = result["keyword_success_rate"] >= 0.7  # 70% keyword match threshold
            
            # Update scenario stats
            if result["success"]:
                scenario["success_count"] += 1
            else:
                scenario["failure_count"] += 1
            
            scenario["last_run"] = datetime.now().isoformat()
            self.save_scenarios()
            
            # Save result
            self.results["test_runs"].append(result)
            self.save_results()
            
            return result
            
        except Exception as e:
            error_result = {
                "scenario_id": scenario_id,
                "timestamp": datetime.now().isoformat(),
                "success": False,
                "error": str(e)
            }
            
            scenario["failure_count"] += 1
            scenario["last_run"] = datetime.now().isoformat()
            self.save_scenarios()
            
            self.results["test_runs"].append(error_result)
            self.save_results()
            
            return error_result

    async def run_all_scenarios(self, tags: List[str] = None) -> Dict:
        """Run all scenarios or scenarios with specific tags"""
        
        scenarios_to_run = self.scenarios["scenarios"]
        
        if tags:
            scenarios_to_run = [s for s in scenarios_to_run if any(tag in s.get("tags", []) for tag in tags)]
        
        print(f"🚀 Running {len(scenarios_to_run)} scenarios...")
        
        results = []
        for scenario in scenarios_to_run:
            result = await self.run_scenario(scenario["id"])
            results.append(result)
            
            # Print quick status
            status = "✅" if result.get("success", False) else "❌"
            print(f"   {status} {scenario['name']}")
        
        # Summary
        successful = sum(1 for r in results if r.get("success", False))
        total = len(results)
        
        summary = {
            "total_scenarios": total,
            "successful": successful,
            "failed": total - successful,
            "success_rate": successful / total if total > 0 else 0,
            "timestamp": datetime.now().isoformat(),
            "results": results
        }
        
        print(f"\\n📊 Summary: {successful}/{total} scenarios passed ({summary['success_rate']:.1%} success rate)")
        
        return summary

    def list_scenarios(self, tags: List[str] = None):
        """List all scenarios or scenarios with specific tags"""
        
        scenarios_to_show = self.scenarios["scenarios"]
        
        if tags:
            scenarios_to_show = [s for s in scenarios_to_show if any(tag in s.get("tags", []) for tag in tags)]
        
        print(f"📋 Test Scenarios ({len(scenarios_to_show)} total):")
        print("=" * 60)
        
        for scenario in scenarios_to_show:
            success_rate = scenario["success_count"] / (scenario["success_count"] + scenario["failure_count"]) if (scenario["success_count"] + scenario["failure_count"]) > 0 else 0
            
            print(f"ID: {scenario['id']} | {scenario['name']}")
            print(f"   Type: {scenario['test_type']} | Tags: {', '.join(scenario.get('tags', []))}")
            print(f"   Success Rate: {success_rate:.1%} ({scenario['success_count']}✅/{scenario['failure_count']}❌)")
            print(f"   Description: {scenario['description']}")
            print()

    def get_scenario_details(self, scenario_id: int):
        """Get detailed information about a specific scenario"""
        
        scenario = next((s for s in self.scenarios["scenarios"] if s["id"] == scenario_id), None)
        if not scenario:
            print(f"❌ Scenario {scenario_id} not found")
            return
        
        print(f"📋 Scenario Details: {scenario['name']}")
        print("=" * 50)
        print(f"ID: {scenario['id']}")
        print(f"Type: {scenario['test_type']}")
        print(f"Description: {scenario['description']}")
        print(f"Tags: {', '.join(scenario.get('tags', []))}")
        print(f"Created: {scenario['created']}")
        print(f"Last Run: {scenario.get('last_run', 'Never')}")
        print(f"Success Rate: {scenario['success_count']}✅/{scenario['failure_count']}❌")
        print()
        print("Parameters:")
        for key, value in scenario['parameters'].items():
            if value:
                print(f"  {key}: {value}")
        print()
        print(f"Expected Keywords: {', '.join(scenario['expected_keywords'])}")

# ========================================
# EASY SCENARIO CREATION FUNCTIONS
# ========================================

def add_comprehensive_test(name: str, description: str, query: str, expected_keywords: List[str], tags: List[str] = None):
    """Easy way to add a comprehensive GStreamer expert test"""
    framework = TestScenarioFramework()
    return framework.add_scenario(name, description, "comprehensive", query=query, 
                                expected_keywords=expected_keywords, tags=tags or ["comprehensive"])

def add_troubleshooting_test(name: str, description: str, pipeline: str, symptoms: str, 
                           expected_keywords: List[str], tags: List[str] = None):
    """Easy way to add a troubleshooting test"""
    framework = TestScenarioFramework()
    return framework.add_scenario(name, description, "troubleshoot", pipeline=pipeline, 
                                symptoms=symptoms, expected_keywords=expected_keywords, 
                                tags=tags or ["troubleshooting"])

def add_element_search_test(name: str, description: str, query: str, expected_keywords: List[str], tags: List[str] = None):
    """Easy way to add an element search test"""
    framework = TestScenarioFramework()
    return framework.add_scenario(name, description, "element_search", query=query,
                                expected_keywords=expected_keywords, tags=tags or ["element_search"])

# ========================================
# COMMAND LINE INTERFACE
# ========================================

async def main():
    """Command line interface for test framework"""
    
    if len(sys.argv) < 2:
        print("🧪 GStreamer Expert Test Framework")
        print("=" * 40)
        print("Usage:")
        print("  python test_scenarios.py list                    # List all scenarios")
        print("  python test_scenarios.py run <id>                # Run specific scenario")
        print("  python test_scenarios.py run-all                 # Run all scenarios")
        print("  python test_scenarios.py run-tag <tag>           # Run scenarios with tag")
        print("  python test_scenarios.py details <id>            # Show scenario details")
        print("  python test_scenarios.py add-example             # Add example scenarios")
        return
    
    framework = TestScenarioFramework()
    command = sys.argv[1]
    
    if command == "list":
        framework.list_scenarios()
        
    elif command == "run" and len(sys.argv) > 2:
        scenario_id = int(sys.argv[2])
        result = await framework.run_scenario(scenario_id)
        
        if result.get("success"):
            print(f"✅ Scenario passed!")
        else:
            print(f"❌ Scenario failed: {result.get('error', 'Unknown error')}")
            
    elif command == "run-all":
        await framework.run_all_scenarios()
        
    elif command == "run-tag" and len(sys.argv) > 2:
        tag = sys.argv[2]
        await framework.run_all_scenarios([tag])
        
    elif command == "details" and len(sys.argv) > 2:
        scenario_id = int(sys.argv[2])
        framework.get_scenario_details(scenario_id)
        
    elif command == "add-example":
        # Add some example scenarios
        print("📝 Adding example test scenarios...")
        
        add_comprehensive_test(
            "RTSP to KVS Basic",
            "Test basic RTSP to KVS pipeline creation",
            "How do I stream RTSP video to Kinesis Video Streams?",
            ["kvssink", "rtspsrc", "application/x-rtp", "stream-format=avc"],
            ["basic", "kvs", "rtsp"]
        )
        
        add_troubleshooting_test(
            "Pixelation Issues",
            "Test diagnosis of video quality issues",
            "gst-launch-1.0 rtspsrc location=rtsp://test ! rtph264depay ! h264parse ! x264enc bitrate=100 ! kvssink",
            "video has pixelation and blocky artifacts",
            ["pixelation", "bitrate", "encoder settings"],
            ["quality", "troubleshooting"]
        )
        
        add_element_search_test(
            "H264 Encoders",
            "Test finding H.264 encoder elements",
            "h264 encoder",
            ["x264enc", "nvh264enc", "vtenc_h264"],
            ["elements", "encoders"]
        )
        
        print("✅ Added 3 example scenarios")
        
    else:
        print(f"❌ Unknown command: {command}")

if __name__ == "__main__":
    asyncio.run(main())
