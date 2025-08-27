#!/usr/bin/env python3
"""
Enhanced Accuracy Measurement Framework for GStreamer Agent
Provides comprehensive testing, scoring, and continuous improvement tracking
"""

import boto3
import json
import time
import uuid
import re
from datetime import datetime
from typing import Dict, List, Tuple, Any
import csv

class AccuracyMeasurement:
    def __init__(self, agent_id: str, alias_id: str, profile_name: str = 'malone-aws'):
        """Initialize accuracy measurement system"""
        session = boto3.Session(profile_name=profile_name)
        self.client = session.client('bedrock-agent-runtime', region_name='us-east-1')
        self.agent_id = agent_id
        self.alias_id = alias_id
        self.test_results = []
        
    def run_comprehensive_test_suite(self) -> Dict[str, Any]:
        """Run comprehensive test suite with multiple categories"""
        
        test_categories = {
            "technical_accuracy": self._get_technical_accuracy_tests(),
            "context_gathering": self._get_context_gathering_tests(),
            "priority_hierarchy": self._get_priority_hierarchy_tests(),
            "platform_awareness": self._get_platform_awareness_tests(),
            "error_handling": self._get_error_handling_tests(),
            "real_world_scenarios": self._get_real_world_tests()
        }
        
        overall_results = {
            "timestamp": datetime.now().isoformat(),
            "categories": {},
            "overall_score": 0.0,
            "detailed_results": []
        }
        
        total_score = 0.0
        total_weight = 0.0
        
        for category, tests in test_categories.items():
            category_results = self._run_test_category(category, tests)
            overall_results["categories"][category] = category_results
            
            # Weight categories by importance
            weight = self._get_category_weight(category)
            total_score += category_results["score"] * weight
            total_weight += weight
            
        overall_results["overall_score"] = total_score / total_weight if total_weight > 0 else 0.0
        
        return overall_results
    
    def _get_technical_accuracy_tests(self) -> List[Dict]:
        """Tests for technical GStreamer knowledge"""
        return [
            {
                "name": "Element Compatibility",
                "question": "I want to use videoscale on an H.264 encoded stream from rtspsrc. What's the correct approach?",
                "expected_patterns": [
                    r"videoscale.*raw.*video",
                    r"decode.*first|decodebin",
                    r"cannot.*process.*encoded"
                ],
                "anti_patterns": [
                    r"rtspsrc.*videoscale.*directly",
                    r"videoscale.*h264"
                ],
                "weight": 1.0
            },
            {
                "name": "Codec Private Data Reality",
                "question": "How can I preserve original codec private data when transcoding with x264enc?",
                "expected_patterns": [
                    r"impossible|cannot.*preserve",
                    r"encoder.*creates.*new",
                    r"technically.*impossible"
                ],
                "anti_patterns": [
                    r"extradata.*property",
                    r"preserve.*codec.*data"
                ],
                "weight": 1.0
            },
            {
                "name": "Element Existence",
                "question": "Show me a pipeline using hlssink for HLS streaming.",
                "expected_patterns": [
                    r"hlssink2",
                    r"correct.*element"
                ],
                "anti_patterns": [
                    r"hlssink(?!2)",  # hlssink without 2
                ],
                "weight": 0.8
            }
        ]
    
    def _get_context_gathering_tests(self) -> List[Dict]:
        """Tests for proper context gathering"""
        return [
            {
                "name": "Platform Information",
                "question": "I need to capture video and stream it with best quality.",
                "expected_patterns": [
                    r"what.*operating.*system|platform",
                    r"linux|macos|windows",
                    r"hardware.*acceleration"
                ],
                "anti_patterns": [
                    r"gst-launch.*v4l2src"  # Immediate solution without context
                ],
                "weight": 1.0
            },
            {
                "name": "Hardware Capabilities",
                "question": "Help me set up hardware-accelerated encoding.",
                "expected_patterns": [
                    r"what.*gpu|hardware",
                    r"nvidia|intel|amd",
                    r"acceleration.*available"
                ],
                "anti_patterns": [
                    r"nvenc.*without.*asking"
                ],
                "weight": 1.0
            }
        ]
    
    def _get_priority_hierarchy_tests(self) -> List[Dict]:
        """Tests for proper priority hierarchy (introspection → context → solution)"""
        return [
            {
                "name": "Media Introspection First",
                "question": "I want to process an RTSP stream for YouTube Live.",
                "expected_patterns": [
                    r"gst-discoverer|discover.*stream",
                    r"analyze.*stream|characteristics",
                    r"first.*understand|before.*recommend"
                ],
                "anti_patterns": [
                    r"gst-launch.*rtspsrc.*immediately"
                ],
                "weight": 1.2  # Higher weight for priority hierarchy
            }
        ]
    
    def _get_platform_awareness_tests(self) -> List[Dict]:
        """Tests for platform-specific recommendations"""
        return [
            {
                "name": "macOS Platform Correction",
                "question": "I'm on macOS and want to use v4l2src for video capture.",
                "expected_patterns": [
                    r"avfvideosrc.*macos",
                    r"v4l2src.*linux.*only",
                    r"macos.*uses.*avfvideosrc"
                ],
                "anti_patterns": [
                    r"v4l2src.*macos"
                ],
                "weight": 1.0
            }
        ]
    
    def _get_error_handling_tests(self) -> List[Dict]:
        """Tests for proper error identification and correction"""
        return [
            {
                "name": "Multiple Issues Identification",
                "question": "On Windows, I want to use v4l2src with videoscale on encoded H.264 and output to hlssink.",
                "expected_patterns": [
                    r"windows.*ksvideosrc|mfvideosrc",
                    r"videoscale.*raw.*video",
                    r"hlssink2",
                    r"decode.*first"
                ],
                "anti_patterns": [
                    r"v4l2src.*windows",
                    r"hlssink(?!2)"
                ],
                "weight": 1.1
            }
        ]
    
    def _get_real_world_tests(self) -> List[Dict]:
        """Tests based on real user scenarios"""
        return [
            {
                "name": "Live Streaming Setup",
                "question": "I need to stream my security camera to multiple platforms with minimal latency.",
                "expected_patterns": [
                    r"what.*camera.*type|rtsp.*url",
                    r"platform.*details",
                    r"latency.*requirements"
                ],
                "anti_patterns": [
                    r"gst-launch.*without.*context"
                ],
                "weight": 1.0
            }
        ]
    
    def _run_test_category(self, category: str, tests: List[Dict]) -> Dict[str, Any]:
        """Run all tests in a category"""
        print(f"\n🔬 Testing Category: {category.replace('_', ' ').title()}")
        print("=" * 60)
        
        category_results = {
            "score": 0.0,
            "tests": [],
            "total_tests": len(tests)
        }
        
        total_weighted_score = 0.0
        total_weight = 0.0
        
        for test in tests:
            test_result = self._run_single_test(test)
            category_results["tests"].append(test_result)
            
            weighted_score = test_result["score"] * test.get("weight", 1.0)
            total_weighted_score += weighted_score
            total_weight += test.get("weight", 1.0)
        
        category_results["score"] = total_weighted_score / total_weight if total_weight > 0 else 0.0
        
        print(f"📊 Category Score: {category_results['score']:.1f}%")
        return category_results
    
    def _run_single_test(self, test: Dict) -> Dict[str, Any]:
        """Run a single test and analyze results"""
        print(f"\n🧪 Test: {test['name']}")
        print(f"❓ Question: {test['question']}")
        
        try:
            # Invoke agent
            response = self.client.invoke_agent(
                agentId=self.agent_id,
                agentAliasId=self.alias_id,
                sessionId=str(uuid.uuid4()),
                inputText=test['question']
            )
            
            # Collect response
            agent_response = ""
            for event in response['completion']:
                if 'chunk' in event:
                    chunk = event['chunk']
                    if 'bytes' in chunk:
                        agent_response += chunk['bytes'].decode('utf-8')
            
            print(f"🤖 Response: {agent_response[:200]}...")
            
            # Analyze response
            score = self._analyze_response(agent_response, test)
            
            result = {
                "name": test["name"],
                "question": test["question"],
                "response": agent_response,
                "score": score,
                "timestamp": datetime.now().isoformat()
            }
            
            print(f"📊 Test Score: {score:.1f}%")
            return result
            
        except Exception as e:
            print(f"❌ Test failed: {e}")
            return {
                "name": test["name"],
                "question": test["question"],
                "response": f"ERROR: {str(e)}",
                "score": 0.0,
                "timestamp": datetime.now().isoformat()
            }
    
    def _analyze_response(self, response: str, test: Dict) -> float:
        """Analyze response against expected patterns"""
        response_lower = response.lower()
        
        # Check expected patterns
        expected_matches = 0
        expected_patterns = test.get("expected_patterns", [])
        
        for pattern in expected_patterns:
            if re.search(pattern, response_lower):
                expected_matches += 1
        
        # Check anti-patterns (things that should NOT be present)
        anti_pattern_violations = 0
        anti_patterns = test.get("anti_patterns", [])
        
        for pattern in anti_patterns:
            if re.search(pattern, response_lower):
                anti_pattern_violations += 1
        
        # Calculate score
        expected_score = (expected_matches / len(expected_patterns)) * 100 if expected_patterns else 100
        anti_pattern_penalty = (anti_pattern_violations / len(anti_patterns)) * 50 if anti_patterns else 0
        
        final_score = max(0, expected_score - anti_pattern_penalty)
        
        print(f"   ✅ Expected patterns matched: {expected_matches}/{len(expected_patterns)}")
        print(f"   ❌ Anti-pattern violations: {anti_pattern_violations}/{len(anti_patterns)}")
        
        return final_score
    
    def _get_category_weight(self, category: str) -> float:
        """Get importance weight for each category"""
        weights = {
            "technical_accuracy": 1.5,  # Most important
            "context_gathering": 1.3,
            "priority_hierarchy": 1.2,
            "platform_awareness": 1.0,
            "error_handling": 1.1,
            "real_world_scenarios": 1.0
        }
        return weights.get(category, 1.0)
    
    def save_results(self, results: Dict[str, Any], filename: str = None):
        """Save test results to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"accuracy_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"📁 Results saved to: {filename}")
    
    def generate_improvement_report(self, results: Dict[str, Any]) -> str:
        """Generate actionable improvement recommendations"""
        report = []
        report.append("# 🎯 AGENT ACCURACY IMPROVEMENT REPORT")
        report.append(f"Generated: {results['timestamp']}")
        report.append(f"Overall Score: {results['overall_score']:.1f}%")
        report.append("")
        
        # Category analysis
        report.append("## 📊 Category Performance")
        for category, data in results["categories"].items():
            score = data["score"]
            status = "🟢" if score >= 80 else "🟡" if score >= 60 else "🔴"
            report.append(f"- {status} **{category.replace('_', ' ').title()}**: {score:.1f}%")
        
        report.append("")
        
        # Specific recommendations
        report.append("## 🔧 Improvement Recommendations")
        
        for category, data in results["categories"].items():
            if data["score"] < 80:  # Focus on categories needing improvement
                report.append(f"### {category.replace('_', ' ').title()}")
                
                # Analyze failed tests
                failed_tests = [test for test in data["tests"] if test["score"] < 70]
                for test in failed_tests:
                    report.append(f"- **{test['name']}** ({test['score']:.1f}%): Needs reinforcement")
                
                report.append("")
        
        return "\n".join(report)

def main():
    """Run comprehensive accuracy measurement"""
    # Configuration
    agent_id = 'L60IDME1CM'
    alias_id = 'LOZ5ZB4MAS'
    
    # Initialize measurement system
    accuracy = AccuracyMeasurement(agent_id, alias_id)
    
    print("🚀 Starting Comprehensive Accuracy Measurement")
    print("=" * 60)
    
    # Run tests
    results = accuracy.run_comprehensive_test_suite()
    
    # Save results
    accuracy.save_results(results)
    
    # Generate improvement report
    report = accuracy.generate_improvement_report(results)
    
    # Save report
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"improvement_report_{timestamp}.md"
    with open(report_filename, 'w') as f:
        f.write(report)
    
    print(f"\n📋 Improvement report saved to: {report_filename}")
    print(f"\n🎯 Overall Accuracy Score: {results['overall_score']:.1f}%")

if __name__ == "__main__":
    main()
