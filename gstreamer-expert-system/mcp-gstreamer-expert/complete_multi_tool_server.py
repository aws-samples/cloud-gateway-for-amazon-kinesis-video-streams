#!/usr/bin/env python3
"""
Complete Enhanced Multi-Tool GStreamer Expert MCP Server
All functionality in single file for proper testing
"""

import asyncio
import json
import re
import os
from typing import Dict, List, Optional, Tuple
import boto3
from mcp.server import Server
from mcp.types import Tool, TextContent

class CompleteGStreamerExpert:
    """Complete multi-tool GStreamer expert with all functionality"""
    
    def __init__(self):
        # Initialize Bedrock clients
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.bedrock_kb = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        # Configuration
        self.kb_id = '5CGJIOV1QM'
        self.claude_model = 'us.anthropic.claude-opus-4-1-20250805-v1:0'
        
        # Import existing base expert for comprehensive solutions
        import sys
        sys.path.append('/Users/dmalone/Desktop/bedrock-gstreamer/mcp-gstreamer-expert')
        from bedrock_gstreamer_expert import BedrockGStreamerExpert
        self.base_expert = BedrockGStreamerExpert()

    # ========================================
    # TOOL 1: Search GStreamer Elements
    # ========================================
    
    async def search_gstreamer_elements(self, query: str, category: str = "all") -> Dict:
        """Search for GStreamer elements by capability, name, or use case"""
        
        kb_query = f"gstreamer element {query}"
        if category != "all":
            kb_query += f" {category}"
        
        try:
            response = self.bedrock_kb.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={'text': kb_query},
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': 15
                    }
                }
            )
            
            elements = []
            for result in response.get('retrievalResults', []):
                content = result.get('content', {}).get('text', '')
                score = result.get('score', 0)
                
                element_names = self._extract_element_names(content)
                
                for element_name in element_names:
                    if element_name not in [e['name'] for e in elements]:
                        elements.append({
                            'name': element_name,
                            'description': content[:200] + "...",
                            'relevance_score': score,
                            'category': self._categorize_element(element_name),
                            'source': result.get('location', {}).get('s3Location', {}).get('uri', 'Unknown')
                        })
            
            return {
                'query': query,
                'total_found': len(elements),
                'elements': sorted(elements, key=lambda x: x['relevance_score'], reverse=True)[:10]
            }
            
        except Exception as e:
            return {'error': f"Element search failed: {str(e)}", 'elements': []}

    def _extract_element_names(self, content: str) -> List[str]:
        """Extract GStreamer element names from documentation content"""
        patterns = [
            r'\b\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue|valve)\b',
            r'gst-launch-1\.0.*?(\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue))',
            r'`(\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue))`'
        ]
        
        elements = set()
        for pattern in patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            elements.update(matches)
        
        filtered = [e for e in elements if len(e) > 3 and not e.startswith('gst')]
        return list(filtered)[:5]

    def _categorize_element(self, element_name: str) -> str:
        """Categorize element by its suffix/purpose"""
        element_lower = element_name.lower()
        
        if element_lower.endswith('src'):
            return 'source'
        elif element_lower.endswith('sink'):
            return 'sink'
        elif any(suffix in element_lower for suffix in ['enc', 'encoder']):
            return 'encoder'
        elif any(suffix in element_lower for suffix in ['dec', 'decoder']):
            return 'decoder'
        elif any(suffix in element_lower for suffix in ['parse', 'depay', 'pay']):
            return 'protocol'
        elif any(suffix in element_lower for suffix in ['mux', 'demux']):
            return 'container'
        elif any(suffix in element_lower for suffix in ['convert', 'scale', 'rate']):
            return 'transform'
        elif element_lower in ['tee', 'queue', 'valve']:
            return 'utility'
        else:
            return 'other'

    # ========================================
    # TOOL 2: Get Element Documentation
    # ========================================
    
    async def get_element_documentation(self, element_name: str) -> Dict:
        """Get detailed documentation for a specific GStreamer element"""
        
        kb_query = f"{element_name} element properties caps usage examples"
        
        try:
            response = self.bedrock_kb.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={'text': kb_query},
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': 8
                    }
                }
            )
            
            element_info = {
                'name': element_name,
                'properties': [],
                'supported_caps': [],
                'usage_examples': [],
                'platform_notes': [],
                'documentation_sources': []
            }
            
            for result in response.get('retrievalResults', []):
                content = result.get('content', {}).get('text', '')
                score = result.get('score', 0)
                
                if element_name.lower() in content.lower():
                    properties = self._extract_properties(content, element_name)
                    element_info['properties'].extend(properties)
                    
                    caps = self._extract_caps(content, element_name)
                    element_info['supported_caps'].extend(caps)
                    
                    examples = self._extract_usage_examples(content, element_name)
                    element_info['usage_examples'].extend(examples)
                    
                    platform_notes = self._extract_platform_notes(content)
                    element_info['platform_notes'].extend(platform_notes)
                    
                    element_info['documentation_sources'].append({
                        'source': result.get('location', {}).get('s3Location', {}).get('uri', 'Unknown'),
                        'relevance': score,
                        'excerpt': content[:300] + "..."
                    })
            
            element_info['properties'] = list(set(element_info['properties']))
            element_info['supported_caps'] = list(set(element_info['supported_caps']))
            element_info['usage_examples'] = element_info['usage_examples'][:3]
            
            return element_info
            
        except Exception as e:
            return {'error': f"Element documentation lookup failed: {str(e)}", 'name': element_name}

    def _extract_properties(self, content: str, element_name: str) -> List[str]:
        """Extract element properties from documentation"""
        properties = []
        
        property_patterns = [
            rf'{element_name}.*?(\w+)=[\w\d"\']+',
            r'property[:\s]+(\w+)',
            r'(\w+)\s*:\s*\w+\s*\(.*?\)'
        ]
        
        for pattern in property_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            properties.extend(matches)
        
        return [p for p in properties if len(p) > 2 and p.lower() not in ['the', 'and', 'for']][:5]

    def _extract_caps(self, content: str, element_name: str) -> List[str]:
        """Extract supported caps from documentation"""
        caps = []
        
        caps_patterns = [
            r'(video/x-[\w-]+)',
            r'(audio/x-[\w-]+)', 
            r'(application/x-[\w-]+)',
            r'(image/[\w-]+)'
        ]
        
        for pattern in caps_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            caps.extend(matches)
        
        return list(set(caps))[:5]

    def _extract_usage_examples(self, content: str, element_name: str) -> List[str]:
        """Extract usage examples from documentation"""
        examples = []
        
        gst_launch_pattern = rf'gst-launch-1\.0[^`\n]*{element_name}[^`\n]*'
        matches = re.findall(gst_launch_pattern, content, re.IGNORECASE)
        
        for match in matches:
            if len(match) < 200:
                examples.append(match.strip())
        
        return examples[:3]

    def _extract_platform_notes(self, content: str) -> List[str]:
        """Extract platform-specific notes"""
        notes = []
        
        platforms = ['macos', 'linux', 'windows', 'nvidia', 'intel', 'vaapi', 'videotoolbox']
        
        for platform in platforms:
            if platform.lower() in content.lower():
                sentences = content.split('.')
                for sentence in sentences:
                    if platform.lower() in sentence.lower() and len(sentence) < 150:
                        notes.append(f"{platform.upper()}: {sentence.strip()}")
                        break
        
        return notes[:3]

    # ========================================
    # TOOL 3: Search Pipeline Patterns
    # ========================================
    
    async def search_pipeline_patterns(self, scenario: str, source_type: str = "", dest_type: str = "") -> Dict:
        """Search for tested, working pipeline patterns"""
        
        query_parts = [scenario]
        if source_type:
            query_parts.append(source_type)
        if dest_type:
            query_parts.append(dest_type)
        
        kb_query = f"gst-launch-1.0 pipeline {' '.join(query_parts)} working example"
        
        try:
            response = self.bedrock_kb.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={'text': kb_query},
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': 10
                    }
                }
            )
            
            patterns = []
            for result in response.get('retrievalResults', []):
                content = result.get('content', {}).get('text', '')
                score = result.get('score', 0)
                
                pipeline_commands = self._extract_pipeline_commands(content)
                
                for cmd in pipeline_commands:
                    patterns.append({
                        'pipeline': cmd,
                        'scenario': self._classify_pipeline_scenario(cmd),
                        'complexity': self._assess_pipeline_complexity(cmd),
                        'elements_used': self._extract_elements_from_pipeline(cmd),
                        'relevance_score': score,
                        'source': result.get('location', {}).get('s3Location', {}).get('uri', 'Unknown')
                    })
            
            unique_patterns = []
            seen_pipelines = set()
            
            for pattern in sorted(patterns, key=lambda x: x['relevance_score'], reverse=True):
                pipeline_key = pattern['pipeline'][:50]
                if pipeline_key not in seen_pipelines:
                    seen_pipelines.add(pipeline_key)
                    unique_patterns.append(pattern)
            
            return {
                'scenario': scenario,
                'total_found': len(unique_patterns),
                'patterns': unique_patterns[:5]
            }
            
        except Exception as e:
            return {'error': f"Pattern search failed: {str(e)}", 'patterns': []}

    def _extract_pipeline_commands(self, content: str) -> List[str]:
        """Extract gst-launch pipeline commands from content"""
        commands = []
        
        pattern = r'gst-launch-1\.0[^`\n]*(?:\\\s*\n[^`\n]*)*'
        matches = re.findall(pattern, content, re.MULTILINE)
        
        for match in matches:
            cleaned = re.sub(r'\s+', ' ', match.replace('\\\n', ' ')).strip()
            if len(cleaned) > 20 and len(cleaned) < 500:
                commands.append(cleaned)
        
        return commands

    def _classify_pipeline_scenario(self, pipeline: str) -> str:
        """Classify what scenario this pipeline addresses"""
        pipeline_lower = pipeline.lower()
        
        if 'rtspsrc' in pipeline_lower and 'kvssink' in pipeline_lower:
            return 'rtsp_to_kvs'
        elif 'rtspsrc' in pipeline_lower:
            return 'rtsp_streaming'
        elif 'filesrc' in pipeline_lower:
            return 'file_playback'
        elif any(src in pipeline_lower for src in ['v4l2src', 'avfvideosrc', 'ksvideosrc']):
            return 'webcam_capture'
        elif 'tee' in pipeline_lower:
            return 'multi_output'
        elif any(ml in pipeline_lower for ml in ['gva', 'nvinfer', 'openvino']):
            return 'ml_inference'
        else:
            return 'general'

    def _assess_pipeline_complexity(self, pipeline: str) -> str:
        """Assess pipeline complexity level"""
        element_count = len(pipeline.split('!'))
        
        if element_count <= 3:
            return 'basic'
        elif element_count <= 6:
            return 'intermediate'
        else:
            return 'advanced'

    def _extract_elements_from_pipeline(self, pipeline: str) -> List[str]:
        """Extract GStreamer elements from pipeline command"""
        parts = pipeline.split('!')
        elements = []
        
        for part in parts:
            words = part.strip().split()
            if words and not words[0].startswith('gst-launch'):
                element = words[0]
                if '=' in element:
                    element = element.split('=')[0]
                elements.append(element)
        
        return elements

    # ========================================
    # TOOL 4: Troubleshoot Pipeline Issues
    # ========================================
    
    async def troubleshoot_pipeline_issues(self, pipeline: str, symptoms: str, error_logs: str = "") -> Dict:
        """Diagnose pipeline issues including quality problems, performance issues, and errors"""
        
        issue_classification = self._classify_pipeline_issues(symptoms, error_logs)
        
        troubleshooting_result = {
            'pipeline': pipeline,
            'symptoms': symptoms,
            'issue_type': issue_classification['type'],
            'severity': issue_classification['severity'],
            'diagnosed_problems': [],
            'solutions': [],
            'prevention_tips': []
        }
        
        try:
            kb_query = f"gstreamer troubleshooting {issue_classification['type']} {symptoms}"
            
            response = self.bedrock_kb.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={'text': kb_query},
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': 8
                    }
                }
            )
            
            for result in response.get('retrievalResults', []):
                content = result.get('content', {}).get('text', '')
                solutions = self._extract_troubleshooting_solutions(content, issue_classification['type'])
                troubleshooting_result['solutions'].extend(solutions)
            
            if issue_classification['type'] == 'quality_issues':
                troubleshooting_result['diagnosed_problems'].extend(
                    self._diagnose_quality_issues(pipeline, symptoms)
                )
            elif issue_classification['type'] == 'performance_issues':
                troubleshooting_result['diagnosed_problems'].extend(
                    self._diagnose_performance_issues(pipeline, symptoms)
                )
            elif issue_classification['type'] == 'initialization_failure':
                troubleshooting_result['diagnosed_problems'].extend(
                    self._diagnose_initialization_issues(pipeline, error_logs)
                )
            
            troubleshooting_result['prevention_tips'] = self._generate_prevention_tips(issue_classification['type'])
            
            return troubleshooting_result
            
        except Exception as e:
            troubleshooting_result['diagnosed_problems'].append(f"Troubleshooting analysis failed: {str(e)}")
            return troubleshooting_result

    def _classify_pipeline_issues(self, symptoms: str, error_logs: str) -> Dict:
        """Classify the type and severity of pipeline issues"""
        
        symptoms_lower = symptoms.lower()
        error_lower = error_logs.lower()
        
        quality_indicators = ['pixelation', 'artifacts', 'green screen', 'gray screen', 'color', 'blurry', 'distorted']
        if any(indicator in symptoms_lower for indicator in quality_indicators):
            return {'type': 'quality_issues', 'severity': 'medium'}
        
        performance_indicators = ['slow', 'lag', 'cpu', 'memory', 'fps', 'framerate', 'latency']
        if any(indicator in symptoms_lower for indicator in performance_indicators):
            return {'type': 'performance_issues', 'severity': 'medium'}
        
        init_indicators = ['fails to start', 'won\'t initialize', 'error', 'crash']
        if any(indicator in symptoms_lower for indicator in init_indicators) or error_logs:
            return {'type': 'initialization_failure', 'severity': 'high'}
        
        sync_indicators = ['sync', 'audio delay', 'video delay', 'out of sync']
        if any(indicator in symptoms_lower for indicator in sync_indicators):
            return {'type': 'synchronization_issues', 'severity': 'medium'}
        
        return {'type': 'general', 'severity': 'low'}

    def _diagnose_quality_issues(self, pipeline: str, symptoms: str) -> List[str]:
        """Diagnose media quality issues"""
        problems = []
        symptoms_lower = symptoms.lower()
        
        if 'pixelation' in symptoms_lower or 'blocky' in symptoms_lower:
            problems.append("Pixelation detected - likely bitrate too low or encoder settings suboptimal")
            
        if 'green screen' in symptoms_lower or 'green' in symptoms_lower:
            problems.append("Green screen artifacts - possible color space conversion issue or hardware decoder problem")
            
        if 'gray screen' in symptoms_lower or 'gray' in symptoms_lower:
            problems.append("Gray screen - likely YUV/RGB color space mismatch or missing color conversion")
            
        if 'blurry' in symptoms_lower or 'soft' in symptoms_lower:
            problems.append("Image softness - check scaling algorithms and encoder quality settings")
            
        if 'artifacts' in symptoms_lower:
            problems.append("Encoding artifacts - review encoder settings, bitrate, and GOP structure")
        
        return problems

    def _diagnose_performance_issues(self, pipeline: str, symptoms: str) -> List[str]:
        """Diagnose performance-related issues"""
        problems = []
        symptoms_lower = symptoms.lower()
        
        if 'cpu' in symptoms_lower or 'slow' in symptoms_lower:
            problems.append("High CPU usage - consider hardware acceleration or pipeline optimization")
            
        if 'memory' in symptoms_lower:
            problems.append("Memory issues - check buffer sizes and queue configurations")
            
        if 'fps' in symptoms_lower or 'framerate' in symptoms_lower:
            problems.append("Frame rate issues - verify source capabilities and processing capacity")
            
        if 'latency' in symptoms_lower or 'delay' in symptoms_lower:
            problems.append("Latency issues - optimize buffer sizes and consider zero-latency encoding")
        
        return problems

    def _diagnose_initialization_issues(self, pipeline: str, error_logs: str) -> List[str]:
        """Diagnose pipeline initialization failures"""
        problems = []
        
        if 'caps' in error_logs.lower() or 'negotiation' in error_logs.lower():
            problems.append("Caps negotiation failure - elements cannot agree on data format")
            
        if 'not found' in error_logs.lower() or 'missing' in error_logs.lower():
            problems.append("Missing GStreamer plugin or element")
            
        if 'permission' in error_logs.lower() or 'access' in error_logs.lower():
            problems.append("Permission or device access issue")
            
        if 'resource' in error_logs.lower():
            problems.append("Resource unavailable (device busy, insufficient memory, etc.)")
        
        return problems

    def _extract_troubleshooting_solutions(self, content: str, issue_type: str) -> List[str]:
        """Extract troubleshooting solutions from KB content"""
        solutions = []
        
        solution_patterns = [
            r'solution[:\s]+(.*?)(?:\n|$)',
            r'fix[:\s]+(.*?)(?:\n|$)',
            r'try[:\s]+(.*?)(?:\n|$)',
            r'use[:\s]+(.*?)(?:\n|$)'
        ]
        
        for pattern in solution_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 10 and len(match.strip()) < 200:
                    solutions.append(match.strip())
        
        return solutions[:3]

    def _generate_prevention_tips(self, issue_type: str) -> List[str]:
        """Generate prevention tips based on issue type"""
        
        tips_map = {
            'quality_issues': [
                "Test with different encoder settings and bitrates",
                "Verify color space conversions with videoconvert elements",
                "Use hardware encoders when available for better quality"
            ],
            'performance_issues': [
                "Enable hardware acceleration when possible",
                "Optimize queue sizes for your use case",
                "Monitor system resources during pipeline operation"
            ],
            'initialization_failure': [
                "Test pipeline components individually",
                "Verify all required GStreamer plugins are installed",
                "Check device permissions and availability"
            ],
            'synchronization_issues': [
                "Use proper clock synchronization",
                "Adjust buffer sizes and latency settings",
                "Ensure consistent frame rates throughout pipeline"
            ]
        }
        
        return tips_map.get(issue_type, ["Test pipeline thoroughly before production use"])

    def _detect_kvs_feature_intent(self, user_query: str) -> List[str]:
        """Detect if user intends to use specific KVS features"""
        
        features = []
        query_lower = user_query.lower()
        
        # Playback features
        if any(term in query_lower for term in ['hls', 'dash', 'playback', 'streaming', 'browser', 'web']):
            features.append('playback')
        
        # GetClip API
        if any(term in query_lower for term in ['getclip', 'clip', 'download', 'extract', 'save']):
            features.append('getclip')
        
        # Amazon Connect
        if any(term in query_lower for term in ['connect', 'contact center', 'call center']):
            features.append('connect')
        
        # WebRTC
        if any(term in query_lower for term in ['webrtc', 'real-time', 'live', 'rtc']):
            features.append('webrtc')
        
        return features

    def _generate_kvs_compatibility_guidance(self, pipeline: str, symptoms: str) -> str:
        """Generate KVS-specific compatibility guidance based on AWS documentation"""
        
        if 'kvssink' not in pipeline.lower():
            return ""
        
        guidance = ""
        
        # Check for actually unsupported codecs (VP8/VP9/AV1)
        if any(codec in pipeline.lower() for codec in ['vp8', 'vp9', 'av1']) and any(term in symptoms.lower() for term in ['hls', 'dash', 'playback', 'getclip']):
            guidance += "\\n### ⚠️ KVS Codec Compatibility Issue\\n\\n"
            guidance += "**Problem**: VP8/VP9/AV1 codecs not supported by HLS/DASH/GetClip\\n"
            guidance += "**Solution**: Use H.264 or H.265 for playback compatibility\\n\\n"
        
        # Check for WebRTC-specific limitations (H.264 only for WebRTC)
        if 'h265' in pipeline.lower() and any(term in symptoms.lower() for term in ['webrtc', 'real-time']):
            guidance += "### ⚠️ WebRTC Codec Compatibility\\n\\n"
            guidance += "**Problem**: H.265 not supported by WebRTC (but supported by HLS/DASH)\\n"
            guidance += "**Solution**: Use H.264 for WebRTC compatibility\\n\\n"
        
        # Provide accurate guidance based on AWS documentation
        if any(term in symptoms.lower() for term in ['playback', 'hls', 'dash', 'getclip']):
            guidance += "\\n### 🎯 KVS Feature Support (AWS Documentation)\\n\\n"
            guidance += "**✅ HLS/DASH Playback Supports:**\\n"
            guidance += "- H.264 AND H.265 video codecs\\n"
            guidance += "- AAC, G.711 A-Law, G.711 U-Law audio\\n"
            guidance += "- Audio + Video OR Audio-only OR Video-only\\n"
            guidance += "- Multi-track with proper ordering (Video=Track1, Audio=Track2)\\n\\n"
            
            guidance += "**✅ GetClip API Supports:**\\n"
            guidance += "- H.264 AND H.265 video codecs\\n"
            guidance += "- AAC and G.711 A-Law audio\\n"
            guidance += "- Audio + Video OR Video-only\\n\\n"
            
            guidance += "**⚠️ Real Limitations:**\\n"
            guidance += "- Codec parameters must stay consistent (no mid-stream changes)\\n"
            guidance += "- Track structure must stay consistent throughout stream\\n"
            guidance += "- VP8/VP9/AV1 codecs not supported for playback features\\n\\n"
            
            guidance += "**💡 Your Pipeline Analysis:**\\n"
            if 'sink.' in pipeline:
                guidance += "- Multi-track configuration detected: ✅ Supported by HLS/DASH/GetClip\\n"
            if 'h264' in pipeline.lower():
                guidance += "- H.264 codec: ✅ Supported by all KVS features\\n"
            if 'h265' in pipeline.lower():
                guidance += "- H.265 codec: ✅ Supported by HLS/DASH/GetClip (not WebRTC)\\n"
            if 'aac' in pipeline.lower():
                guidance += "- AAC audio: ✅ Supported by all KVS features\\n"
        
        return guidance

# Initialize MCP Server
server = Server("complete-gstreamer-expert")
expert = CompleteGStreamerExpert()

@server.list_tools()
async def list_tools() -> List[Tool]:
    """List all available tools"""
    return [
        Tool(
            name="search_gstreamer_elements",
            description="Search for GStreamer elements by capability, name, or use case",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query for elements"},
                    "category": {"type": "string", "description": "Element category filter", "default": "all"}
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="get_element_documentation", 
            description="Get detailed documentation for a specific GStreamer element",
            inputSchema={
                "type": "object",
                "properties": {
                    "element_name": {"type": "string", "description": "Name of the GStreamer element"}
                },
                "required": ["element_name"]
            }
        ),
        Tool(
            name="search_pipeline_patterns",
            description="Search for tested, working GStreamer pipeline patterns",
            inputSchema={
                "type": "object",
                "properties": {
                    "scenario": {"type": "string", "description": "Pipeline scenario"},
                    "source_type": {"type": "string", "description": "Source type (optional)", "default": ""},
                    "dest_type": {"type": "string", "description": "Destination type (optional)", "default": ""}
                },
                "required": ["scenario"]
            }
        ),
        Tool(
            name="troubleshoot_pipeline_issues",
            description="Diagnose pipeline issues including quality problems, performance issues, and errors",
            inputSchema={
                "type": "object",
                "properties": {
                    "pipeline": {"type": "string", "description": "The GStreamer pipeline experiencing issues"},
                    "symptoms": {"type": "string", "description": "Description of symptoms"},
                    "error_logs": {"type": "string", "description": "Any error messages (optional)", "default": ""}
                },
                "required": ["pipeline", "symptoms"]
            }
        ),
        Tool(
            name="gstreamer_expert",
            description="Comprehensive GStreamer assistance",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Your GStreamer question or requirements"}
                },
                "required": ["query"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> List[TextContent]:
    """Handle tool calls"""
    
    try:
        if name == "search_gstreamer_elements":
            query = arguments.get("query", "")
            category = arguments.get("category", "all")
            result = await expert.search_gstreamer_elements(query, category)
            
            response = f"## 🔍 GStreamer Elements Search Results\\n\\n"
            response += f"**Query**: {result['query']}\\n"
            response += f"**Found**: {result['total_found']} elements\\n\\n"
            
            for element in result['elements'][:5]:
                response += f"### {element['name']} ({element['category']})\\n"
                response += f"**Relevance**: {element['relevance_score']:.3f}\\n"
                response += f"**Description**: {element['description']}\\n\\n"
            
            return [TextContent(type="text", text=response)]
        
        elif name == "get_element_documentation":
            element_name = arguments.get("element_name", "")
            result = await expert.get_element_documentation(element_name)
            
            if 'error' in result:
                return [TextContent(type="text", text=f"Documentation lookup failed: {result['error']}")]
            
            response = f"## 📚 {result['name']} Element Documentation\\n\\n"
            
            if result['properties']:
                response += f"**Properties**: {', '.join(result['properties'])}\\n\\n"
            
            if result['supported_caps']:
                response += f"**Supported Caps**: {', '.join(result['supported_caps'])}\\n\\n"
            
            if result['usage_examples']:
                response += "**Usage Examples**:\\n"
                for example in result['usage_examples']:
                    response += f"```bash\\n{example}\\n```\\n\\n"
            
            return [TextContent(type="text", text=response)]
        
        elif name == "search_pipeline_patterns":
            scenario = arguments.get("scenario", "")
            source_type = arguments.get("source_type", "")
            dest_type = arguments.get("dest_type", "")
            result = await expert.search_pipeline_patterns(scenario, source_type, dest_type)
            
            response = f"## 🔧 Pipeline Patterns for '{result['scenario']}'\\n\\n"
            response += f"**Found**: {result['total_found']} patterns\\n\\n"
            
            for i, pattern in enumerate(result['patterns'][:3], 1):
                response += f"### Pattern {i}: {pattern['scenario']} ({pattern['complexity']})\\n"
                response += f"```bash\\n{pattern['pipeline']}\\n```\\n"
                response += f"**Elements**: {', '.join(pattern['elements_used'])}\\n\\n"
            
            return [TextContent(type="text", text=response)]
        
        elif name == "troubleshoot_pipeline_issues":
            pipeline = arguments.get("pipeline", "")
            symptoms = arguments.get("symptoms", "")
            error_logs = arguments.get("error_logs", "")
            result = await expert.troubleshoot_pipeline_issues(pipeline, symptoms, error_logs)
            
            response = f"## 🔧 Pipeline Troubleshooting Analysis\\n\\n"
            response += f"**Issue Type**: {result['issue_type']} (Severity: {result['severity']})\\n"
            response += f"**Symptoms**: {result['symptoms']}\\n\\n"
            
            if result['diagnosed_problems']:
                response += "### 🎯 Diagnosed Problems:\\n"
                for problem in result['diagnosed_problems']:
                    response += f"- {problem}\\n"
                response += "\\n"
            
            if result['solutions']:
                response += "### 💡 Solutions:\\n"
                for solution in result['solutions']:
                    response += f"- {solution}\\n"
                response += "\\n"
            
            if result['prevention_tips']:
                response += "### 🛡️ Prevention Tips:\\n"
                for tip in result['prevention_tips']:
                    response += f"- {tip}\\n"
            
            # Add KVS-specific compatibility guidance
            kvs_guidance = expert._generate_kvs_compatibility_guidance(pipeline, symptoms)
            if kvs_guidance:
                response += kvs_guidance
            
            # Add context gathering commands
            response += "\\n### 🔍 Context Gathering Commands\\n"
            response += "To provide better assistance, please run these diagnostic commands:\\n\\n"
            
            # System info
            response += "**System Information:**\\n```bash\\n"
            response += "uname -a  # Linux\\nsw_vers   # macOS\\n"
            response += "lscpu | head -5  # Linux CPU\\n```\\n\\n"
            
            # GStreamer info  
            response += "**GStreamer Environment:**\\n```bash\\n"
            response += "gst-launch-1.0 --version\\n"
            response += "gst-inspect-1.0 | grep -E '(nvidia|vaapi|vtenc)' | head -3\\n```\\n\\n"
            
            # RTSP-specific if applicable
            if 'rtsp' in pipeline.lower():
                response += "**RTSP Stream Analysis:**\\n```bash\\n"
                response += "gst-discoverer-1.0 'YOUR_RTSP_URL'\\n"
                response += "curl -X DESCRIBE 'YOUR_RTSP_URL' -H 'Accept: application/sdp'\\n```\\n\\n"
            
            return [TextContent(type="text", text=response)]
        
        elif name == "gstreamer_expert":
            query = arguments.get("query", "")
            result = await expert.base_expert.get_comprehensive_solution(query)
            return [TextContent(type="text", text=result)]
        
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]
    
    except Exception as e:
        return [TextContent(type="text", text=f"Tool execution failed: {str(e)}")]

async def main():
    """Run the complete multi-tool GStreamer expert MCP server"""
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
