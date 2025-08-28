#!/usr/bin/env python3
"""
GStreamer Expert Core Implementation
Shared logic for both MCP server and Lambda function interfaces
"""

import json
import re
import logging
import sys
import os
from typing import Dict, List, Optional, Any

# Add the core directory to path for imports
sys.path.append('/var/task/gstreamer-expert-system/core')

from knowledge_base_client import KnowledgeBaseClient
from pipeline_analyzer import PipelineAnalyzer
from element_searcher import ElementSearcher
from troubleshooter import Troubleshooter

logger = logging.getLogger(__name__)

class GStreamerExpertCore:
    """
    Core GStreamer expert implementation with all tools and functionality.
    This class provides the shared logic used by both MCP and Lambda interfaces.
    """
    
    def __init__(self, kb_id: str = '5CGJIOV1QM', claude_model: str = 'us.anthropic.claude-opus-4-1-20250805-v1:0'):
        """Initialize the core expert system"""
        self.kb_id = kb_id
        self.claude_model = claude_model
        
        # Initialize components
        self.kb_client = KnowledgeBaseClient(kb_id, claude_model)
        self.pipeline_analyzer = PipelineAnalyzer(self.kb_client)
        self.element_searcher = ElementSearcher(self.kb_client)
        self.troubleshooter = Troubleshooter(self.kb_client)
        
        logger.info(f"GStreamer Expert Core initialized with KB: {kb_id}")

    # ========================================
    # TOOL 1: Search GStreamer Elements
    # ========================================
    
    async def search_gstreamer_elements(self, query: str, category: str = "all") -> Dict[str, Any]:
        """
        Search for GStreamer elements by capability, name, or use case
        
        Args:
            query: Search query for elements
            category: Element category filter (optional)
            
        Returns:
            Dictionary with search results including elements list
        """
        return await self.element_searcher.search_elements(query, category)

    # ========================================
    # TOOL 2: Get Element Documentation
    # ========================================
    
    async def get_element_documentation(self, element_name: str) -> Dict[str, Any]:
        """
        Get detailed documentation for a specific GStreamer element
        
        Args:
            element_name: Name of the GStreamer element
            
        Returns:
            Dictionary with element documentation and properties
        """
        return await self.element_searcher.get_element_docs(element_name)

    # ========================================
    # TOOL 3: Search Pipeline Patterns
    # ========================================
    
    async def search_pipeline_patterns(self, scenario: str, source_type: str = "", dest_type: str = "") -> Dict[str, Any]:
        """
        Search for tested, working GStreamer pipeline patterns
        
        Args:
            scenario: Pipeline scenario description
            source_type: Source type filter (optional)
            dest_type: Destination type filter (optional)
            
        Returns:
            Dictionary with matching pipeline patterns
        """
        return await self.pipeline_analyzer.search_patterns(scenario, source_type, dest_type)

    # ========================================
    # TOOL 4: Troubleshoot Pipeline Issues
    # ========================================
    
    async def troubleshoot_pipeline_issues(self, pipeline: str, symptoms: str, error_logs: str = "") -> Dict[str, Any]:
        """
        Diagnose pipeline issues including quality problems, performance issues, and errors
        
        Args:
            pipeline: The GStreamer pipeline experiencing issues
            symptoms: Description of symptoms
            error_logs: Any error messages (optional)
            
        Returns:
            Dictionary with diagnosis and solutions
        """
        return await self.troubleshooter.diagnose_issues(pipeline, symptoms, error_logs)

    # ========================================
    # TOOL 5: Optimize Pipeline Performance
    # ========================================
    
    async def optimize_pipeline_performance(self, pipeline: str, goals: str, platform: str = "linux") -> Dict[str, Any]:
        """
        Optimize pipeline for performance, latency, and quality
        
        Args:
            pipeline: The GStreamer pipeline to optimize
            goals: Optimization goals (e.g., "low latency", "high quality")
            platform: Target platform (linux, macos, windows)
            
        Returns:
            Dictionary with optimization recommendations
        """
        return await self.pipeline_analyzer.optimize_pipeline(pipeline, goals, platform)

    # ========================================
    # TOOL 6: Validate Pipeline Compatibility
    # ========================================
    
    async def validate_pipeline_compatibility(self, pipeline: str, target_platform: str = "linux") -> Dict[str, Any]:
        """
        Validate pipeline compatibility and suggest improvements
        
        Args:
            pipeline: The GStreamer pipeline to validate
            target_platform: Target platform for validation
            
        Returns:
            Dictionary with validation results and suggestions
        """
        return await self.pipeline_analyzer.validate_compatibility(pipeline, target_platform)

    # ========================================
    # TOOL 7: Comprehensive GStreamer Expert
    # ========================================
    
    async def gstreamer_expert(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Comprehensive GStreamer assistance with intelligent tool selection
        
        Args:
            query: User's GStreamer question or requirements
            context: Additional context (stream info, platform, etc.)
            
        Returns:
            Dictionary with comprehensive expert response
        """
        # Analyze the query to determine the best approach
        analysis = self._analyze_query_intent(query)
        
        # Use appropriate specialized tool(s) based on analysis
        if analysis['intent'] == 'element_search':
            return await self.search_gstreamer_elements(analysis['extracted_query'])
        elif analysis['intent'] == 'troubleshooting':
            return await self.troubleshoot_pipeline_issues(
                analysis.get('pipeline', ''), 
                analysis['extracted_query']
            )
        elif analysis['intent'] == 'optimization':
            return await self.optimize_pipeline_performance(
                analysis.get('pipeline', ''), 
                analysis['extracted_query']
            )
        elif analysis['intent'] == 'pattern_search':
            return await self.search_pipeline_patterns(analysis['extracted_query'])
        else:
            # Comprehensive analysis using multiple tools if needed
            return await self._comprehensive_analysis(query, context)

    # ========================================
    # Helper Methods
    # ========================================
    
    def _analyze_query_intent(self, query: str) -> Dict[str, Any]:
        """Analyze user query to determine intent and extract relevant information"""
        query_lower = query.lower()
        
        # Extract pipeline if present
        pipeline_match = re.search(r'gst-launch-1\.0[^"]*|pipeline[:\s]+([^"]*)', query, re.IGNORECASE)
        pipeline = pipeline_match.group(1) if pipeline_match else ""
        
        # Determine intent
        if any(word in query_lower for word in ['find', 'search', 'element', 'plugin']):
            intent = 'element_search'
        elif any(word in query_lower for word in ['error', 'fail', 'problem', 'issue', 'debug', 'troubleshoot']):
            intent = 'troubleshooting'
        elif any(word in query_lower for word in ['optimize', 'performance', 'improve', 'faster', 'latency']):
            intent = 'optimization'
        elif any(word in query_lower for word in ['pattern', 'example', 'template', 'how to']):
            intent = 'pattern_search'
        else:
            intent = 'comprehensive'
        
        return {
            'intent': intent,
            'extracted_query': query,
            'pipeline': pipeline,
            'complexity': self._assess_complexity(query)
        }
    
    def _assess_complexity(self, query: str) -> str:
        """Assess the complexity level of the query"""
        query_lower = query.lower()
        
        complexity_indicators = {
            'high': ['optimize', 'performance', 'latency', 'quality', 'hardware', 'acceleration'],
            'medium': ['pipeline', 'convert', 'encode', 'decode', 'stream'],
            'low': ['simple', 'basic', 'quick', 'easy']
        }
        
        for level, indicators in complexity_indicators.items():
            if any(indicator in query_lower for indicator in indicators):
                return level
        
        return 'medium'
    
    async def _comprehensive_analysis(self, query: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Perform comprehensive analysis using knowledge base and Claude"""
        
        # Build comprehensive KB query
        kb_query = f"gstreamer {query}"
        if context:
            if context.get('platform'):
                kb_query += f" {context['platform']}"
            if context.get('source_type'):
                kb_query += f" {context['source_type']}"
        
        # Get relevant knowledge base information (reduced for Lambda to prevent throttling)
        kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=5)
        
        # Build context for Claude
        claude_context = self._build_comprehensive_context(query, kb_results, context)
        
        # Generate comprehensive response
        response = await self.kb_client.invoke_claude(claude_context)
        
        return {
            'query': query,
            'response': response,
            'context_used': context,
            'kb_sources': len(kb_results),
            'analysis_type': 'comprehensive'
        }
    
    def _build_comprehensive_context(self, query: str, kb_results: List[Dict], context: Optional[Dict]) -> str:
        """Build comprehensive context for Claude analysis"""
        
        system_prompt = """You are a comprehensive GStreamer expert. Analyze the user's query and provide detailed, actionable assistance. Include specific pipeline examples, element recommendations, and troubleshooting guidance as appropriate."""
        
        # Add knowledge base context (reduced size for Lambda)
        kb_context = "\n\n=== RELEVANT KNOWLEDGE BASE INFORMATION ===\n"
        for i, result in enumerate(kb_results[:5], 1):
            kb_context += f"\n{i}. {result['content'][:300]}...\n"  # Reduced from 500 to 300 chars
        
        # Add user context if available
        context_info = ""
        if context:
            context_info = f"\n\n=== ADDITIONAL CONTEXT ===\n{json.dumps(context, indent=2)}\n"
        
        # Build final prompt
        final_prompt = system_prompt + kb_context + context_info
        final_prompt += f"\n\n=== USER QUERY ===\n{query}\n\n"
        final_prompt += "Please provide comprehensive assistance including:\n"
        final_prompt += "1. Direct answer to the query\n"
        final_prompt += "2. Specific GStreamer pipeline examples if applicable\n"
        final_prompt += "3. Element recommendations and alternatives\n"
        final_prompt += "4. Platform-specific considerations\n"
        final_prompt += "5. Troubleshooting tips if relevant\n"
        
        return final_prompt

    # ========================================
    # Context Analysis (for Lambda integration)
    # ========================================
    
    def analyze_context(self, user_input: str, stream_info: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze context from user input and stream information
        Used by Lambda function for enhanced pipeline generation
        """
        context = {
            'source_type': self._detect_source_type(user_input),
            'destinations': self._detect_destinations(user_input),
            'platform': self._detect_platform(user_input),
            'codecs': self._detect_codecs(user_input),
            'complexity': self._assess_complexity(user_input),
            'issues': self._detect_issues(user_input),
            'rtsp_url': self._extract_rtsp_url(user_input),
            'pipeline_elements': self._extract_pipeline_elements(user_input)
        }
        
        # Enhance with stream information if available
        if stream_info:
            context['stream_analysis'] = stream_info
            if 'video' in stream_info:
                context['video_codec'] = stream_info['video'].get('codec', 'unknown')
            if 'audio' in stream_info:
                context['audio_codec'] = stream_info['audio'].get('codec', 'unknown')
        
        return context
    
    def _detect_source_type(self, text: str) -> str:
        """Detect source type from text"""
        text_lower = text.lower()
        if 'rtsp://' in text or 'rtspsrc' in text:
            return 'rtsp'
        elif 'webcam' in text_lower or 'camera' in text_lower:
            return 'webcam'
        elif 'file' in text_lower or 'filesrc' in text:
            return 'file'
        return 'rtsp'
    
    def _detect_destinations(self, text: str) -> List[str]:
        """Detect output destinations from text"""
        destinations = []
        text_lower = text.lower()
        
        if 'kvs' in text_lower or 'kinesis' in text_lower or 'kvssink' in text:
            destinations.append('kvs')
        if 'display' in text_lower or 'screen' in text_lower:
            destinations.append('display')
        if 'file' in text_lower or 'record' in text_lower:
            destinations.append('file')
            
        return destinations if destinations else ['kvs']
    
    def _detect_platform(self, text: str) -> str:
        """Detect target platform from text"""
        if any(elem in text for elem in ['v4l2src', 'alsasrc', 'vaapi', 'nvenc']):
            return 'linux'
        elif any(elem in text for elem in ['avfvideosrc', 'osxaudiosrc', 'vtenc']):
            return 'macos'
        elif any(elem in text for elem in ['ksvideosrc', 'wasapi', 'mf']):
            return 'windows'
        return 'linux'
    
    def _detect_codecs(self, text: str) -> List[str]:
        """Detect codecs mentioned in text"""
        codecs = []
        text_lower = text.lower()
        
        if 'h264' in text_lower or 'h.264' in text_lower:
            codecs.append('h264')
        if 'h265' in text_lower or 'h.265' in text_lower or 'hevc' in text_lower:
            codecs.append('h265')
        if 'aac' in text_lower:
            codecs.append('aac')
        if 'opus' in text_lower:
            codecs.append('opus')
            
        return codecs
    
    def _detect_issues(self, text: str) -> List[str]:
        """Detect issues mentioned in text"""
        issues = []
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['error', 'fail', 'problem', 'issue']):
            issues.append('troubleshooting_needed')
        if any(word in text_lower for word in ['slow', 'lag', 'delay']):
            issues.append('performance_issue')
        if any(word in text_lower for word in ['pixelated', 'artifacts', 'quality']):
            issues.append('quality_issue')
            
        return issues
    
    def _extract_rtsp_url(self, text: str) -> Optional[str]:
        """Extract RTSP URL from text"""
        rtsp_pattern = r'rtsp://[^\s]+'
        match = re.search(rtsp_pattern, text)
        return match.group(0) if match else None
    
    def _extract_pipeline_elements(self, text: str) -> List[str]:
        """Extract GStreamer elements mentioned in text"""
        element_pattern = r'\b\w+(?:src|sink|enc|dec|parse|mux|demux|convert|scale|filter)\b'
        elements = re.findall(element_pattern, text, re.IGNORECASE)
        return list(set(elements))
