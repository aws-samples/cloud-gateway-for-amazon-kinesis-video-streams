#!/usr/bin/env python3
"""
Knowledge Base Evaluation Framework
Assess KB coverage against system specification use cases
"""

import asyncio
import json
import sys
from datetime import datetime
from typing import Dict, List

# Add the MCP server to path
sys.path.append('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert')

class KnowledgeBaseEvaluator:
    """Evaluate knowledge base coverage and accuracy"""
    
    def __init__(self):
        from complete_multi_tool_server import CompleteGStreamerExpert
        self.expert = CompleteGStreamerExpert()
        
        # Define evaluation scenarios based on system specification
        self.evaluation_scenarios = self._define_evaluation_scenarios()
        self.results = []
    
    def _define_evaluation_scenarios(self) -> List[Dict]:
        """Define comprehensive evaluation scenarios from system specification"""
        
        return [
            # Basic Pipeline Construction
            {
                "category": "basic_pipeline_construction",
                "name": "RTSP to KVS Basic",
                "query": "Create basic RTSP to KVS pipeline",
                "expected_elements": ["rtspsrc", "kvssink", "rtph264depay", "h264parse"],
                "expected_concepts": ["stream-name", "aws-region"],
                "complexity": "basic"
            },
            {
                "category": "basic_pipeline_construction", 
                "name": "Webcam Recording",
                "query": "Record webcam to file on macOS",
                "expected_elements": ["avfvideosrc", "filesink", "qtmux"],
                "expected_concepts": ["device", "location"],
                "complexity": "basic"
            },
            
            # Platform-Specific Optimizations
            {
                "category": "platform_optimization",
                "name": "macOS Hardware Acceleration",
                "query": "Optimize H.264 encoding for macOS with hardware acceleration",
                "expected_elements": ["vtenc_h264", "videotoolbox"],
                "expected_concepts": ["hardware acceleration", "VideoToolbox"],
                "complexity": "intermediate"
            },
            {
                "category": "platform_optimization",
                "name": "Linux NVIDIA Acceleration", 
                "query": "Use NVIDIA GPU for H.264 encoding on Linux",
                "expected_elements": ["nvh264enc", "nvidia"],
                "expected_concepts": ["CUDA", "NVENC"],
                "complexity": "intermediate"
            },
            {
                "category": "platform_optimization",
                "name": "Windows MediaFoundation",
                "query": "Hardware encoding on Windows with MediaFoundation",
                "expected_elements": ["mfh264enc", "mediafoundation"],
                "expected_concepts": ["Windows", "hardware acceleration"],
                "complexity": "intermediate"
            },
            
            # Quality Issue Diagnosis
            {
                "category": "quality_troubleshooting",
                "name": "Pixelation Issues",
                "query": "Fix pixelation in video stream with low bitrate",
                "expected_concepts": ["bitrate", "encoder settings", "quality"],
                "expected_solutions": ["increase bitrate", "encoder tuning"],
                "complexity": "intermediate"
            },
            {
                "category": "quality_troubleshooting",
                "name": "Green Screen Artifacts",
                "query": "Resolve green screen artifacts in RTSP pipeline",
                "expected_concepts": ["color space", "YUV", "RGB", "videoconvert"],
                "expected_solutions": ["color conversion", "caps filter"],
                "complexity": "intermediate"
            },
            {
                "category": "quality_troubleshooting",
                "name": "Audio Video Sync",
                "query": "Fix audio video synchronization issues",
                "expected_concepts": ["sync", "buffer", "latency", "clock"],
                "expected_solutions": ["buffer adjustment", "sync settings"],
                "complexity": "intermediate"
            },
            
            # Complex Scenarios
            {
                "category": "complex_scenarios",
                "name": "Multi-Output Tee",
                "query": "Stream to multiple destinations simultaneously with tee",
                "expected_elements": ["tee", "queue"],
                "expected_concepts": ["multi-output", "branching"],
                "complexity": "advanced"
            },
            {
                "category": "complex_scenarios",
                "name": "ML Inference Integration",
                "query": "Add OpenVINO object detection to webcam pipeline",
                "expected_elements": ["gvadetect", "gvainference", "openvino"],
                "expected_concepts": ["machine learning", "inference", "detection"],
                "complexity": "advanced"
            },
            {
                "category": "complex_scenarios",
                "name": "Multi-Camera Composition",
                "query": "Combine multiple camera feeds into single output",
                "expected_elements": ["compositor", "videomixer"],
                "expected_concepts": ["composition", "mixing", "layout"],
                "complexity": "advanced"
            },
            
            # KVS-Specific Scenarios
            {
                "category": "kvs_specific",
                "name": "KVS HLS Playback",
                "query": "Ensure KVS stream works with HLS playback in browser",
                "expected_concepts": ["HLS", "fragmented MP4", "H.264", "H.265"],
                "expected_solutions": ["codec compatibility", "container format"],
                "complexity": "advanced"
            },
            {
                "category": "kvs_specific", 
                "name": "KVS GetClip API",
                "query": "Configure pipeline for KVS GetClip API compatibility",
                "expected_concepts": ["GetClip", "timestamps", "fragmentation"],
                "expected_solutions": ["proper timestamps", "consistent codec"],
                "complexity": "advanced"
            },
            
            # Performance Optimization
            {
                "category": "performance_optimization",
                "name": "Low Latency Streaming",
                "query": "Optimize pipeline for sub-100ms latency",
                "expected_concepts": ["latency", "zero-latency", "buffer size"],
                "expected_solutions": ["tune=zerolatency", "buffer optimization"],
                "complexity": "advanced"
            },
            {
                "category": "performance_optimization",
                "name": "High CPU Usage",
                "query": "Reduce CPU usage in software encoding pipeline",
                "expected_concepts": ["CPU usage", "hardware acceleration", "optimization"],
                "expected_solutions": ["hardware encoders", "threading"],
                "complexity": "intermediate"
            }
        ]
    
    async def evaluate_scenario(self, scenario: Dict) -> Dict:
        """Evaluate a single scenario against the knowledge base"""
        
        print(f"🔍 Evaluating: {scenario['name']}")
        
        try:
            # Query the comprehensive expert
            response = await self.expert.base_expert.get_comprehensive_solution(scenario['query'])
            
            # Analyze response coverage
            coverage_score = self._analyze_coverage(response, scenario)
            
            result = {
                'scenario': scenario['name'],
                'category': scenario['category'],
                'complexity': scenario['complexity'],
                'query': scenario['query'],
                'response_length': len(response),
                'coverage_score': coverage_score,
                'response': response[:500] + "..." if len(response) > 500 else response,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"   📊 Coverage: {coverage_score['total_score']:.1%}")
            return result
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            return {
                'scenario': scenario['name'],
                'category': scenario['category'],
                'error': str(e),
                'coverage_score': {'total_score': 0},
                'timestamp': datetime.now().isoformat()
            }
    
    def _analyze_coverage(self, response: str, scenario: Dict) -> Dict:
        """Analyze how well the response covers the expected content"""
        
        response_lower = response.lower()
        coverage = {
            'elements_found': 0,
            'elements_total': 0,
            'concepts_found': 0,
            'concepts_total': 0,
            'solutions_found': 0,
            'solutions_total': 0,
            'has_working_pipeline': False,
            'has_explanation': False
        }
        
        # Check for expected elements
        if 'expected_elements' in scenario:
            coverage['elements_total'] = len(scenario['expected_elements'])
            for element in scenario['expected_elements']:
                if element.lower() in response_lower:
                    coverage['elements_found'] += 1
        
        # Check for expected concepts
        if 'expected_concepts' in scenario:
            coverage['concepts_total'] = len(scenario['expected_concepts'])
            for concept in scenario['expected_concepts']:
                if concept.lower() in response_lower:
                    coverage['concepts_found'] += 1
        
        # Check for expected solutions
        if 'expected_solutions' in scenario:
            coverage['solutions_total'] = len(scenario['expected_solutions'])
            for solution in scenario['expected_solutions']:
                if solution.lower() in response_lower:
                    coverage['solutions_found'] += 1
        
        # Check for working pipeline
        coverage['has_working_pipeline'] = 'gst-launch-1.0' in response
        
        # Check for explanation
        coverage['has_explanation'] = len(response) > 200
        
        # Calculate total score
        element_score = coverage['elements_found'] / max(coverage['elements_total'], 1)
        concept_score = coverage['concepts_found'] / max(coverage['concepts_total'], 1)
        solution_score = coverage['solutions_found'] / max(coverage['solutions_total'], 1)
        pipeline_score = 1.0 if coverage['has_working_pipeline'] else 0.0
        explanation_score = 1.0 if coverage['has_explanation'] else 0.0
        
        # Weighted total score
        total_score = (
            element_score * 0.3 +
            concept_score * 0.3 +
            solution_score * 0.2 +
            pipeline_score * 0.1 +
            explanation_score * 0.1
        )
        
        coverage['total_score'] = total_score
        coverage['element_score'] = element_score
        coverage['concept_score'] = concept_score
        coverage['solution_score'] = solution_score
        coverage['pipeline_score'] = pipeline_score
        coverage['explanation_score'] = explanation_score
        
        return coverage
    
    async def run_comprehensive_evaluation(self) -> Dict:
        """Run comprehensive knowledge base evaluation"""
        
        print("🧪 Starting Comprehensive Knowledge Base Evaluation")
        print("=" * 60)
        
        # Run all scenarios
        for scenario in self.evaluation_scenarios:
            result = await self.evaluate_scenario(scenario)
            self.results.append(result)
        
        # Generate summary
        summary = self._generate_evaluation_summary()
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"kb_evaluation_results_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump({
                'summary': summary,
                'detailed_results': self.results,
                'evaluation_timestamp': datetime.now().isoformat()
            }, f, indent=2)
        
        print(f"\n📊 Results saved to: {results_file}")
        return summary
    
    def _generate_evaluation_summary(self) -> Dict:
        """Generate evaluation summary and recommendations"""
        
        # Calculate overall metrics
        total_scenarios = len(self.results)
        successful_scenarios = len([r for r in self.results if 'error' not in r])
        
        if successful_scenarios == 0:
            return {'error': 'No successful evaluations'}
        
        # Calculate average scores
        avg_total_score = sum(r['coverage_score']['total_score'] for r in self.results if 'error' not in r) / successful_scenarios
        
        # Category breakdown
        category_scores = {}
        for result in self.results:
            if 'error' not in result:
                category = result['category']
                if category not in category_scores:
                    category_scores[category] = []
                category_scores[category].append(result['coverage_score']['total_score'])
        
        category_averages = {
            category: sum(scores) / len(scores)
            for category, scores in category_scores.items()
        }
        
        # Identify gaps
        low_scoring_scenarios = [
            r for r in self.results 
            if 'error' not in r and r['coverage_score']['total_score'] < 0.7
        ]
        
        summary = {
            'total_scenarios': total_scenarios,
            'successful_evaluations': successful_scenarios,
            'overall_coverage_score': avg_total_score,
            'category_scores': category_averages,
            'low_scoring_scenarios': [
                {
                    'name': r['scenario'],
                    'category': r['category'],
                    'score': r['coverage_score']['total_score']
                }
                for r in low_scoring_scenarios
            ],
            'recommendations': self._generate_recommendations(category_averages, low_scoring_scenarios)
        }
        
        # Print summary
        print(f"\n📈 Knowledge Base Evaluation Summary:")
        print(f"   Overall Coverage: {avg_total_score:.1%}")
        print(f"   Successful Evaluations: {successful_scenarios}/{total_scenarios}")
        
        print(f"\n📊 Category Scores:")
        for category, score in category_averages.items():
            print(f"   {category}: {score:.1%}")
        
        if low_scoring_scenarios:
            print(f"\n⚠️  Low Scoring Scenarios ({len(low_scoring_scenarios)}):")
            for scenario in low_scoring_scenarios[:5]:  # Top 5
                print(f"   {scenario['scenario']}: {scenario['coverage_score']['total_score']:.1%}")
        
        return summary
    
    def _generate_recommendations(self, category_scores: Dict, low_scoring_scenarios: List) -> List[str]:
        """Generate recommendations for knowledge base improvements"""
        
        recommendations = []
        
        # Category-specific recommendations
        for category, score in category_scores.items():
            if score < 0.7:
                if category == "platform_optimization":
                    recommendations.append("Add more platform-specific hardware acceleration examples")
                elif category == "quality_troubleshooting":
                    recommendations.append("Expand troubleshooting guides with more specific solutions")
                elif category == "complex_scenarios":
                    recommendations.append("Include more advanced pipeline examples and patterns")
                elif category == "kvs_specific":
                    recommendations.append("Add comprehensive KVS feature compatibility documentation")
                elif category == "performance_optimization":
                    recommendations.append("Include more performance tuning examples and benchmarks")
        
        # Overall recommendations
        if len(low_scoring_scenarios) > 5:
            recommendations.append("Consider expanding knowledge base with more comprehensive examples")
        
        if not recommendations:
            recommendations.append("Knowledge base coverage appears comprehensive across all categories")
        
        return recommendations

async def main():
    """Main evaluation execution"""
    
    evaluator = KnowledgeBaseEvaluator()
    summary = await evaluator.run_comprehensive_evaluation()
    
    print(f"\n🎯 Evaluation Complete!")
    print(f"📊 Overall Coverage: {summary.get('overall_coverage_score', 0):.1%}")
    
    if summary.get('recommendations'):
        print(f"\n💡 Recommendations:")
        for rec in summary['recommendations']:
            print(f"   • {rec}")

if __name__ == "__main__":
    asyncio.run(main())
