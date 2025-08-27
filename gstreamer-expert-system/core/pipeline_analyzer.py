#!/usr/bin/env python3
"""
Pipeline Analyzer
Handles pipeline pattern search, optimization, and validation
"""

import re
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class PipelineAnalyzer:
    """Handles pipeline analysis, optimization, and pattern matching"""
    
    def __init__(self, kb_client):
        """Initialize with knowledge base client"""
        self.kb_client = kb_client

    async def search_patterns(self, scenario: str, source_type: str = "", dest_type: str = "") -> Dict[str, Any]:
        """
        Search for tested, working GStreamer pipeline patterns
        
        Args:
            scenario: Pipeline scenario description
            source_type: Source type filter (optional)
            dest_type: Destination type filter (optional)
            
        Returns:
            Dictionary with matching pipeline patterns
        """
        try:
            # Build comprehensive KB query
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer pipeline pattern example {scenario}",
                source_type=source_type,
                destination=dest_type
            )
            
            # Query knowledge base for patterns
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=15)
            
            # Extract pipeline patterns from results
            patterns = self._extract_pipeline_patterns(kb_results)
            
            # Build comprehensive response using Claude
            system_prompt = """You are a GStreamer pipeline pattern expert. Provide working pipeline examples and patterns based on the knowledge base information. Focus on:
1. Complete, working pipeline commands
2. Explanation of each pipeline component
3. Variations for different scenarios
4. Platform-specific considerations
5. Performance optimization tips"""
            
            user_context = {
                'scenario': scenario,
                'source_type': source_type,
                'dest_type': dest_type,
                'extracted_patterns': patterns
            }
            
            additional_context = f"""
=== PIPELINE PATTERN REQUEST ===
Scenario: {scenario}
Source Type: {source_type or 'Any'}
Destination Type: {dest_type or 'Any'}

Please provide comprehensive pipeline patterns including:
1. Basic working pipeline
2. Enhanced pipeline with optimizations
3. Alternative approaches
4. Common variations
5. Troubleshooting tips
"""
            
            claude_context = self.kb_client.build_claude_context(
                system_prompt,
                kb_results,
                user_context,
                additional_context
            )
            
            response = await self.kb_client.invoke_claude(claude_context)
            
            return {
                'scenario': scenario,
                'source_type': source_type,
                'dest_type': dest_type,
                'patterns_response': response,
                'extracted_patterns': patterns,
                'kb_sources': len(kb_results),
                'search_successful': True
            }
            
        except Exception as e:
            logger.error(f"Pipeline pattern search failed: {e}")
            return {
                'scenario': scenario,
                'error': f"Pattern search failed: {str(e)}",
                'search_successful': False
            }

    async def optimize_pipeline(self, pipeline: str, goals: str, platform: str = "linux") -> Dict[str, Any]:
        """
        Optimize pipeline for performance, latency, and quality
        
        Args:
            pipeline: The GStreamer pipeline to optimize
            goals: Optimization goals
            platform: Target platform
            
        Returns:
            Dictionary with optimization recommendations
        """
        try:
            # Analyze current pipeline
            pipeline_analysis = self._analyze_pipeline_structure(pipeline)
            
            # Build optimization-focused KB query
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer optimization performance {goals}",
                platform=platform,
                mode='optimization'
            )
            
            # Add pipeline elements to query for context
            if pipeline_analysis['elements']:
                kb_query += f" {' '.join(pipeline_analysis['elements'][:3])}"
            
            # Query knowledge base
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=12)
            
            # Build optimization context
            system_prompt = """You are a GStreamer performance optimization expert. Analyze the pipeline and provide specific optimization recommendations. Focus on:
1. Performance bottlenecks identification
2. Hardware acceleration opportunities
3. Buffer and latency optimizations
4. Quality improvements
5. Platform-specific optimizations
6. Alternative element suggestions"""
            
            user_context = {
                'original_pipeline': pipeline,
                'optimization_goals': goals,
                'target_platform': platform,
                'pipeline_analysis': pipeline_analysis
            }
            
            additional_context = f"""
=== OPTIMIZATION REQUEST ===
Original Pipeline: {pipeline}
Optimization Goals: {goals}
Target Platform: {platform}
Pipeline Elements: {', '.join(pipeline_analysis['elements'])}
Detected Issues: {', '.join(pipeline_analysis['potential_issues'])}

Please provide comprehensive optimization recommendations including:
1. Optimized pipeline version
2. Specific performance improvements
3. Hardware acceleration options
4. Buffer and latency tuning
5. Quality enhancement suggestions
6. Platform-specific optimizations
"""
            
            claude_context = self.kb_client.build_claude_context(
                system_prompt,
                kb_results,
                user_context,
                additional_context
            )
            
            optimization_response = await self.kb_client.invoke_claude(claude_context)
            
            return {
                'original_pipeline': pipeline,
                'optimization_goals': goals,
                'target_platform': platform,
                'pipeline_analysis': pipeline_analysis,
                'optimization_response': optimization_response,
                'kb_sources': len(kb_results),
                'optimization_successful': True
            }
            
        except Exception as e:
            logger.error(f"Pipeline optimization failed: {e}")
            return {
                'original_pipeline': pipeline,
                'error': f"Optimization failed: {str(e)}",
                'optimization_successful': False
            }

    async def validate_compatibility(self, pipeline: str, target_platform: str = "linux") -> Dict[str, Any]:
        """
        Validate pipeline compatibility and suggest improvements
        
        Args:
            pipeline: The GStreamer pipeline to validate
            target_platform: Target platform for validation
            
        Returns:
            Dictionary with validation results
        """
        try:
            # Analyze pipeline structure
            pipeline_analysis = self._analyze_pipeline_structure(pipeline)
            
            # Check for platform-specific elements
            compatibility_issues = self._check_platform_compatibility(pipeline_analysis['elements'], target_platform)
            
            # Build validation KB query
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer compatibility validation {target_platform}",
                platform=target_platform
            )
            
            # Query knowledge base
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=10)
            
            # Build validation context
            system_prompt = """You are a GStreamer compatibility validation expert. Analyze the pipeline for compatibility issues and provide recommendations. Focus on:
1. Platform compatibility assessment
2. Element availability verification
3. Alternative element suggestions
4. Dependency requirements
5. Performance considerations
6. Best practices compliance"""
            
            user_context = {
                'pipeline': pipeline,
                'target_platform': target_platform,
                'pipeline_analysis': pipeline_analysis,
                'compatibility_issues': compatibility_issues
            }
            
            additional_context = f"""
=== COMPATIBILITY VALIDATION REQUEST ===
Pipeline: {pipeline}
Target Platform: {target_platform}
Elements Found: {', '.join(pipeline_analysis['elements'])}
Potential Issues: {', '.join(compatibility_issues)}

Please provide comprehensive compatibility validation including:
1. Compatibility assessment
2. Platform-specific issues
3. Alternative elements for compatibility
4. Dependency requirements
5. Performance implications
6. Recommended improvements
"""
            
            claude_context = self.kb_client.build_claude_context(
                system_prompt,
                kb_results,
                user_context,
                additional_context
            )
            
            validation_response = await self.kb_client.invoke_claude(claude_context)
            
            return {
                'pipeline': pipeline,
                'target_platform': target_platform,
                'pipeline_analysis': pipeline_analysis,
                'compatibility_issues': compatibility_issues,
                'validation_response': validation_response,
                'kb_sources': len(kb_results),
                'validation_successful': True,
                'is_compatible': len(compatibility_issues) == 0
            }
            
        except Exception as e:
            logger.error(f"Pipeline validation failed: {e}")
            return {
                'pipeline': pipeline,
                'error': f"Validation failed: {str(e)}",
                'validation_successful': False
            }

    def _extract_pipeline_patterns(self, kb_results: List[Dict]) -> List[Dict[str, Any]]:
        """Extract pipeline patterns from knowledge base results"""
        patterns = []
        
        for result in kb_results:
            content = result.get('content', '')
            
            # Look for gst-launch commands
            gst_commands = re.findall(r'gst-launch-1\.0[^\n]+', content, re.IGNORECASE)
            
            for command in gst_commands:
                if len(command) > 20:  # Filter out very short commands
                    patterns.append({
                        'pipeline': command.strip(),
                        'source': result.get('source', 'unknown'),
                        'context': self._extract_context_around_pipeline(content, command),
                        'score': result.get('score', 0)
                    })
        
        # Sort by score and remove duplicates
        seen_pipelines = set()
        unique_patterns = []
        
        for pattern in sorted(patterns, key=lambda x: x['score'], reverse=True):
            pipeline_key = pattern['pipeline'].lower().replace(' ', '')
            if pipeline_key not in seen_pipelines:
                seen_pipelines.add(pipeline_key)
                unique_patterns.append(pattern)
        
        return unique_patterns[:5]  # Return top 5 patterns

    def _extract_context_around_pipeline(self, content: str, pipeline: str) -> str:
        """Extract context around a pipeline command"""
        # Find the pipeline in content and extract surrounding context
        pipeline_index = content.find(pipeline)
        if pipeline_index == -1:
            return ""
        
        # Extract 100 characters before and after
        start = max(0, pipeline_index - 100)
        end = min(len(content), pipeline_index + len(pipeline) + 100)
        
        context = content[start:end].strip()
        return context

    def _analyze_pipeline_structure(self, pipeline: str) -> Dict[str, Any]:
        """Analyze the structure of a GStreamer pipeline"""
        
        # Extract elements
        elements = self._extract_elements_from_pipeline(pipeline)
        
        # Categorize elements
        sources = [e for e in elements if e.endswith('src')]
        sinks = [e for e in elements if e.endswith('sink')]
        encoders = [e for e in elements if 'enc' in e.lower()]
        decoders = [e for e in elements if 'dec' in e.lower()]
        
        # Identify potential issues
        potential_issues = []
        
        if not sources:
            potential_issues.append("No source element detected")
        if not sinks:
            potential_issues.append("No sink element detected")
        if len(sources) > 1:
            potential_issues.append("Multiple sources detected")
        if 'autovideosink' in elements:
            potential_issues.append("Using autovideosink (may not be optimal)")
        
        # Check for common problematic patterns
        if 'queue' not in elements and len(elements) > 3:
            potential_issues.append("No queue elements (may cause blocking)")
        
        return {
            'elements': elements,
            'sources': sources,
            'sinks': sinks,
            'encoders': encoders,
            'decoders': decoders,
            'element_count': len(elements),
            'potential_issues': potential_issues,
            'has_audio': any('audio' in e.lower() for e in elements),
            'has_video': any('video' in e.lower() for e in elements)
        }

    def _extract_elements_from_pipeline(self, pipeline: str) -> List[str]:
        """Extract GStreamer elements from pipeline string"""
        # Remove gst-launch-1.0 and common flags
        cleaned = re.sub(r'gst-launch-1\.0\s+', '', pipeline)
        cleaned = re.sub(r'-[a-z]\s+\w+', '', cleaned)  # Remove flags
        
        # Split by ! and extract element names
        parts = cleaned.split('!')
        elements = []
        
        for part in parts:
            part = part.strip()
            if part:
                # Extract element name (first word, before any properties)
                element_match = re.match(r'(\w+)', part)
                if element_match:
                    elements.append(element_match.group(1))
        
        return elements

    def _check_platform_compatibility(self, elements: List[str], platform: str) -> List[str]:
        """Check for platform-specific compatibility issues"""
        issues = []
        
        # Platform-specific element mappings
        platform_elements = {
            'linux': {
                'incompatible': ['avfvideosrc', 'osxaudiosrc', 'vtenc', 'vtdec', 'ksvideosrc', 'wasapi'],
                'preferred': ['v4l2src', 'alsasrc', 'vaapih264enc', 'nvh264enc']
            },
            'macos': {
                'incompatible': ['v4l2src', 'alsasrc', 'vaapi', 'nvenc', 'ksvideosrc', 'wasapi'],
                'preferred': ['avfvideosrc', 'osxaudiosrc', 'vtenc_h264', 'vtdec_h264']
            },
            'windows': {
                'incompatible': ['v4l2src', 'alsasrc', 'vaapi', 'avfvideosrc', 'osxaudiosrc', 'vtenc'],
                'preferred': ['ksvideosrc', 'wasapisrc', 'mfh264enc', 'mfh264dec']
            }
        }
        
        if platform in platform_elements:
            incompatible = platform_elements[platform]['incompatible']
            
            for element in elements:
                if any(incomp in element.lower() for incomp in incompatible):
                    issues.append(f"Element '{element}' may not be available on {platform}")
        
        return issues
