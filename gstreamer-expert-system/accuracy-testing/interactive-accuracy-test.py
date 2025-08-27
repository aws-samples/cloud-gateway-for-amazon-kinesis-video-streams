#!/usr/bin/env python3
"""
Interactive Accuracy Measurement for Phase 2 Priority Assessment
Manual testing approach for measuring improvements
"""

import json
import re
from datetime import datetime
from typing import Dict, List, Any
import statistics

class InteractiveAccuracyTest:
    def __init__(self):
        self.test_queries = [
            {
                "id": 1,
                "query": "My GStreamer pipeline crashes with segfault when processing H.264 video",
                "expected_priority": 5,
                "category": "critical_issue",
                "expected_elements": ["priority assessment", "segfault", "crash", "debugging"]
            },
            {
                "id": 2,
                "query": "How do I optimize GStreamer performance for production streaming?",
                "expected_priority": 4,
                "category": "production_optimization", 
                "expected_elements": ["priority assessment", "production", "performance", "optimization"]
            },
            {
                "id": 3,
                "query": "What's the best way to learn GStreamer basics?",
                "expected_priority": 1,
                "category": "learning",
                "expected_elements": ["priority assessment", "tutorial", "basics", "learning"]
            },
            {
                "id": 4,
                "query": "GStreamer memory leak in nvenc plugin causing system instability",
                "expected_priority": 5,
                "category": "critical_issue",
                "expected_elements": ["priority assessment", "memory leak", "system instability", "critical"]
            },
            {
                "id": 5,
                "query": "How to configure rtsp streaming with authentication?",
                "expected_priority": 3,
                "category": "implementation",
                "expected_elements": ["priority assessment", "rtsp", "authentication", "configuration"]
            }
        ]
        
        self.baseline_results = []
        self.enhanced_results = []

    def display_test_instructions(self):
        """Display instructions for manual testing"""
        print("🎯 INTERACTIVE PHASE 2 ACCURACY MEASUREMENT")
        print("=" * 60)
        print()
        print("INSTRUCTIONS:")
        print("1. We'll test both BASELINE and ENHANCED versions")
        print("2. For each test, copy the query and paste it into Q chat")
        print("3. Copy the full response back here")
        print("4. The script will analyze the responses automatically")
        print()
        print("TESTING PHASES:")
        print("📊 Phase A: BASELINE (Original MCP server)")
        print("🚀 Phase B: ENHANCED (Phase 2 MCP server)")
        print()

    def switch_to_baseline(self):
        """Instructions to switch to baseline server"""
        print("🔄 SWITCHING TO BASELINE SERVER")
        print("-" * 40)
        print("Please run this command in another terminal:")
        print("cd /Users/dmalone/Desktop/bedrock-gstreamer")
        print("cp mcp-gstreamer-server-backup-phase1.py mcp-gstreamer-server.py")
        print()
        input("Press Enter when you've switched to baseline server...")

    def switch_to_enhanced(self):
        """Instructions to switch to enhanced server"""
        print("🚀 SWITCHING TO ENHANCED SERVER")
        print("-" * 40)
        print("Please run this command in another terminal:")
        print("cd /Users/dmalone/Desktop/bedrock-gstreamer")
        print("cp mcp-gstreamer-server-phase2-enhanced.py mcp-gstreamer-server.py")
        print()
        input("Press Enter when you've switched to enhanced server...")

    def collect_response(self, test_case: Dict[str, Any], phase: str) -> Dict[str, Any]:
        """Collect response for a test case"""
        print(f"\n📝 TEST {test_case['id']}: {test_case['category'].upper()}")
        print("-" * 50)
        print(f"QUERY: {test_case['query']}")
        print()
        print("1. Copy the query above")
        print("2. Paste it into Q chat")
        print("3. Copy the FULL response below:")
        print()
        
        response = ""
        print("Paste response (press Ctrl+D when done):")
        try:
            while True:
                line = input()
                response += line + "\n"
        except EOFError:
            pass
        
        if not response.strip():
            print("❌ No response provided, skipping...")
            return None
        
        return {
            "test_case": test_case,
            "response": response.strip(),
            "phase": phase,
            "timestamp": datetime.now().isoformat()
        }

    def analyze_response(self, response: str, expected_elements: List[str], expected_priority: int) -> Dict[str, Any]:
        """Analyze response for accuracy metrics"""
        response_lower = response.lower()
        
        # Check for priority assessment presence
        priority_patterns = [
            r"priority assessment:?\s*level\s*(\d+)",
            r"priority:?\s*level\s*(\d+)",
            r"priority\s*(\d+)",
            r"level\s*(\d+)\s*priority"
        ]
        
        detected_priority = None
        for pattern in priority_patterns:
            priority_match = re.search(pattern, response_lower)
            if priority_match:
                detected_priority = int(priority_match.group(1))
                break
        
        # Check for expected elements
        elements_found = []
        for element in expected_elements:
            if element.lower() in response_lower:
                elements_found.append(element)
        
        # Calculate accuracy scores
        priority_accuracy = 1.0 if detected_priority == expected_priority else 0.0
        element_coverage = len(elements_found) / len(expected_elements)
        
        # Check for technical depth indicators
        technical_indicators = [
            "gstreamer", "pipeline", "plugin", "element", "pad", "caps",
            "buffer", "event", "message", "bus", "bin", "property", "gst-launch"
        ]
        technical_depth = sum(1 for indicator in technical_indicators if indicator in response_lower)
        
        # Check for platform-specific information
        platform_indicators = ["linux", "windows", "macos", "arm", "x86", "nvidia", "intel"]
        platform_awareness = sum(1 for indicator in platform_indicators if indicator in response_lower)
        
        # Check for urgency/impact analysis
        urgency_indicators = ["urgent", "critical", "immediate", "emergency", "production"]
        impact_indicators = ["crash", "segfault", "instability", "failure", "down"]
        
        urgency_score = sum(1 for indicator in urgency_indicators if indicator in response_lower)
        impact_score = sum(1 for indicator in impact_indicators if indicator in response_lower)
        
        return {
            "priority_detected": detected_priority is not None,
            "priority_accuracy": priority_accuracy,
            "detected_priority": detected_priority,
            "expected_priority": expected_priority,
            "element_coverage": element_coverage,
            "elements_found": elements_found,
            "technical_depth_score": min(technical_depth / 5.0, 1.0),
            "platform_awareness_score": min(platform_awareness / 3.0, 1.0),
            "urgency_analysis_score": min(urgency_score / 3.0, 1.0),
            "impact_analysis_score": min(impact_score / 3.0, 1.0),
            "response_length": len(response),
            "has_code_examples": "```" in response or "gst-launch" in response_lower,
            "has_troubleshooting": any(word in response_lower for word in ["debug", "troubleshoot", "diagnose", "check"])
        }

    def run_phase_testing(self, phase: str) -> List[Dict[str, Any]]:
        """Run testing for one phase"""
        print(f"\n🧪 STARTING {phase.upper()} PHASE TESTING")
        print("=" * 50)
        
        results = []
        for test_case in self.test_queries:
            result = self.collect_response(test_case, phase)
            if result:
                # Analyze the response
                analysis = self.analyze_response(
                    result["response"],
                    test_case["expected_elements"],
                    test_case["expected_priority"]
                )
                result["analysis"] = analysis
                results.append(result)
                
                # Show quick analysis
                priority_status = "✅" if analysis["priority_detected"] else "❌"
                accuracy_status = "✅" if analysis["priority_accuracy"] == 1.0 else "❌"
                print(f"✅ Analysis complete - Priority: {priority_status} | Accuracy: {accuracy_status}")
        
        return results

    def calculate_improvements(self) -> Dict[str, Any]:
        """Calculate improvements between baseline and enhanced"""
        if not self.baseline_results or not self.enhanced_results:
            return {"error": "Missing baseline or enhanced results"}
        
        baseline_metrics = self.extract_metrics(self.baseline_results)
        enhanced_metrics = self.extract_metrics(self.enhanced_results)
        
        improvements = {}
        for metric in baseline_metrics:
            baseline_val = baseline_metrics[metric]
            enhanced_val = enhanced_metrics[metric]
            
            if baseline_val == 0:
                improvement = float('inf') if enhanced_val > 0 else 0
            else:
                improvement = ((enhanced_val - baseline_val) / baseline_val) * 100
            
            improvements[metric] = {
                "baseline": baseline_val,
                "enhanced": enhanced_val,
                "improvement_percent": improvement
            }
        
        return improvements

    def extract_metrics(self, results: List[Dict[str, Any]]) -> Dict[str, float]:
        """Extract aggregated metrics from test results"""
        analyses = [r["analysis"] for r in results]
        
        return {
            "priority_detection_rate": statistics.mean([a["priority_detected"] for a in analyses]),
            "priority_accuracy_rate": statistics.mean([a["priority_accuracy"] for a in analyses]),
            "element_coverage_avg": statistics.mean([a["element_coverage"] for a in analyses]),
            "technical_depth_avg": statistics.mean([a["technical_depth_score"] for a in analyses]),
            "platform_awareness_avg": statistics.mean([a["platform_awareness_score"] for a in analyses]),
            "urgency_analysis_avg": statistics.mean([a["urgency_analysis_score"] for a in analyses]),
            "impact_analysis_avg": statistics.mean([a["impact_analysis_score"] for a in analyses]),
            "response_length_avg": statistics.mean([a["response_length"] for a in analyses]),
            "code_examples_rate": statistics.mean([1.0 if a["has_code_examples"] else 0.0 for a in analyses]),
            "troubleshooting_rate": statistics.mean([1.0 if a["has_troubleshooting"] else 0.0 for a in analyses])
        }

    def generate_report(self) -> str:
        """Generate comprehensive accuracy report"""
        improvements = self.calculate_improvements()
        
        if "error" in improvements:
            return f"❌ Report generation failed: {improvements['error']}"
        
        report = []
        report.append("=" * 80)
        report.append("🎯 PHASE 2 INTERACTIVE ACCURACY MEASUREMENT REPORT")
        report.append("=" * 80)
        report.append(f"📅 Generated: {datetime.now().isoformat()}")
        report.append(f"🧪 Total Test Cases: {len(self.test_queries)}")
        report.append(f"📊 Baseline Results: {len(self.baseline_results)}")
        report.append(f"🚀 Enhanced Results: {len(self.enhanced_results)}")
        report.append("")
        
        report.append("📈 ACCURACY IMPROVEMENTS:")
        report.append("-" * 40)
        
        key_metrics = [
            "priority_detection_rate",
            "priority_accuracy_rate", 
            "technical_depth_avg",
            "urgency_analysis_avg",
            "impact_analysis_avg"
        ]
        
        for metric in key_metrics:
            if metric in improvements:
                data = improvements[metric]
                metric_name = metric.replace("_", " ").title()
                baseline = data["baseline"]
                enhanced = data["enhanced"]
                improvement = data["improvement_percent"]
                
                if improvement == float('inf'):
                    improvement_str = "∞% (New capability)"
                else:
                    improvement_str = f"{improvement:+.1f}%"
                
                status = "🚀" if improvement > 0 else "📉" if improvement < 0 else "➡️"
                
                report.append(f"{status} {metric_name}:")
                report.append(f"   Baseline: {baseline:.3f} → Enhanced: {enhanced:.3f} ({improvement_str})")
                report.append("")
        
        # Overall assessment
        priority_improvement = improvements.get("priority_detection_rate", {}).get("improvement_percent", 0)
        accuracy_improvement = improvements.get("priority_accuracy_rate", {}).get("improvement_percent", 0)
        
        report.append("🎯 OVERALL ASSESSMENT:")
        report.append("-" * 40)
        
        if priority_improvement > 50 and accuracy_improvement > 25:
            report.append("✅ EXCELLENT: Significant improvements across all metrics")
        elif priority_improvement > 25 or accuracy_improvement > 10:
            report.append("✅ GOOD: Notable improvements in key areas")
        elif priority_improvement > 0 or accuracy_improvement > 0:
            report.append("⚠️  MODERATE: Some improvements, room for optimization")
        else:
            report.append("❌ NEEDS WORK: Limited or no improvements detected")
        
        return "\n".join(report)

    def save_results(self):
        """Save detailed results to JSON file"""
        results = {
            "baseline_results": self.baseline_results,
            "enhanced_results": self.enhanced_results,
            "improvements": self.calculate_improvements(),
            "timestamp": datetime.now().isoformat()
        }
        
        filename = f"interactive-accuracy-results-{int(datetime.now().timestamp())}.json"
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"💾 Detailed results saved to: {filename}")

    def run_full_test(self):
        """Run complete interactive accuracy measurement"""
        self.display_test_instructions()
        
        # Phase A: Baseline testing
        self.switch_to_baseline()
        self.baseline_results = self.run_phase_testing("baseline")
        
        # Phase B: Enhanced testing  
        self.switch_to_enhanced()
        self.enhanced_results = self.run_phase_testing("enhanced")
        
        # Generate and display report
        report = self.generate_report()
        print("\n" + report)
        
        # Save results
        self.save_results()

if __name__ == "__main__":
    test = InteractiveAccuracyTest()
    test.run_full_test()
