#!/usr/bin/env python3
"""
Simple Test Scenario Addition - No Dependencies
Just adds to the JSON file directly
"""

import json
import os
from datetime import datetime

def add_test_scenario(name: str, description: str, test_type: str, query: str = "", 
                     pipeline: str = "", symptoms: str = "", expected_keywords: list = None, 
                     tags: list = None):
    """Add a test scenario directly to JSON file"""
    
    scenarios_file = '/Users/dmalone/Desktop/bedrock-gstreamer/test_scenarios.json'
    
    # Load existing scenarios
    if os.path.exists(scenarios_file):
        with open(scenarios_file, 'r') as f:
            data = json.load(f)
    else:
        data = {
            "scenarios": [],
            "metadata": {
                "created": datetime.now().isoformat(),
                "total_scenarios": 0
            }
        }
    
    # Create new scenario
    scenario_id = len(data["scenarios"]) + 1
    scenario = {
        "id": scenario_id,
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
    
    # Add to scenarios
    data["scenarios"].append(scenario)
    data["metadata"]["total_scenarios"] = len(data["scenarios"])
    data["metadata"]["last_updated"] = datetime.now().isoformat()
    
    # Save back to file
    with open(scenarios_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    return scenario_id

def quick_add(description: str, keywords: str = "", test_type: str = "auto"):
    """Quickly add a test scenario"""
    
    if not description:
        print("❌ Description is required")
        return
    
    # Parse keywords
    expected_keywords = [k.strip() for k in keywords.split(",") if k.strip()] if keywords else []
    
    # Auto-detect test type if not specified
    desc_lower = description.lower()
    
    if test_type == "auto":
        if any(word in desc_lower for word in ['troubleshoot', 'fix', 'error', 'issue', 'problem', 'artifacts', 'green screen', 'pixelation']):
            test_type = "troubleshoot"
        elif any(word in desc_lower for word in ['find', 'search', 'element', 'encoder', 'decoder']):
            test_type = "element_search"
        else:
            test_type = "comprehensive"
    
    # Generate name from description
    name = description[:30] + "..." if len(description) > 30 else description
    
    # Add scenario based on type
    if test_type == "troubleshoot":
        # For troubleshooting, create a generic pipeline and use description as symptoms
        pipeline = "gst-launch-1.0 rtspsrc location=rtsp://camera ! rtph264depay ! h264parse ! autovideosink"
        scenario_id = add_test_scenario(
            name, 
            f"Auto-generated troubleshooting test: {description}",
            "troubleshoot",
            pipeline=pipeline,
            symptoms=description,
            expected_keywords=expected_keywords or ["fix", "solution", "problem"],
            tags=["auto-generated", "troubleshooting"]
        )
    elif test_type == "element_search":
        scenario_id = add_test_scenario(
            name,
            f"Auto-generated element search: {description}",
            "element_search",
            query=description,
            expected_keywords=expected_keywords or ["element", "found"],
            tags=["auto-generated", "element_search"]
        )
    else:
        scenario_id = add_test_scenario(
            name,
            f"Auto-generated comprehensive test: {description}",
            "comprehensive",
            query=description,
            expected_keywords=expected_keywords or ["pipeline", "gst-launch"],
            tags=["auto-generated", "comprehensive"]
        )
    
    print(f"✅ Added scenario '{name}' (ID: {scenario_id})")
    print(f"   Type: {test_type}")
    print(f"   Keywords: {expected_keywords}")
    
    return scenario_id

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("🧪 Simple Test Scenario Addition")
        print("Usage:")
        print("  python3 simple_add_test.py \"Test description\"")
        print("  python3 simple_add_test.py \"Test description\" \"keyword1,keyword2\"")
        print("  python3 simple_add_test.py \"Test description\" \"keyword1,keyword2\" \"comprehensive|troubleshoot|element_search\"")
        print()
        print("Examples:")
        print("  python3 simple_add_test.py \"How do I fix green screen artifacts?\"")
        print("  python3 simple_add_test.py \"Find NVIDIA encoders\" \"nvh264enc,nvh265enc\"")
        print("  python3 simple_add_test.py \"RTSP to KVS pipeline\" \"kvssink,rtspsrc\" \"comprehensive\"")
        return
    
    description = sys.argv[1]
    keywords = sys.argv[2] if len(sys.argv) > 2 else ""
    test_type = sys.argv[3] if len(sys.argv) > 3 else "auto"
    
    scenario_id = quick_add(description, keywords, test_type)
    
    print(f"\\n🧪 To test this scenario:")
    print(f"cd mcp-gstreamer-expert && source venv/bin/activate && cd .. && python3 test_scenarios.py run {scenario_id}")

if __name__ == "__main__":
    main()
