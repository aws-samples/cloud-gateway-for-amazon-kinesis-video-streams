#!/usr/bin/env python3
"""
Troubleshooter
Handles GStreamer pipeline troubleshooting and issue diagnosis
"""

import re
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class Troubleshooter:
    """Handles GStreamer pipeline troubleshooting and diagnostics"""
    
    def __init__(self, kb_client):
        """Initialize with knowledge base client"""
        self.kb_client = kb_client

    async def diagnose_issues(self, pipeline: str, symptoms: str, error_logs: str = "") -> Dict[str, Any]:
        """
        Diagnose pipeline issues including quality problems, performance issues, and errors
        
        Args:
            pipeline: The GStreamer pipeline experiencing issues
            symptoms: Description of symptoms
            error_logs: Any error messages (optional)
            
        Returns:
            Dictionary with diagnosis and solutions
        """
        try:
            # Analyze the issue type and severity
            issue_analysis = self._analyze_issue_type(symptoms, error_logs)
            
            # Build targeted KB query based on issue analysis
            kb_query = self.kb_client.build_kb_query(
                f"gstreamer troubleshooting {issue_analysis['primary_issue']} {symptoms}",
                mode='troubleshooting'
            )
            
            # Add pipeline elements to query for context
            pipeline_elements = self._extract_pipeline_elements(pipeline)
            if pipeline_elements:
                kb_query += f" {' '.join(pipeline_elements[:3])}"  # Add top 3 elements
            
            # Query knowledge base for troubleshooting information
            kb_results = await self.kb_client.query_knowledge_base(kb_query, max_results=12)
            
            # Build comprehensive troubleshooting context
            system_prompt = """You are a GStreamer troubleshooting expert. Analyze the pipeline issue and provide specific, actionable solutions. Focus on:
1. Root cause analysis
2. Step-by-step troubleshooting steps
3. Specific fixes and workarounds
4. Prevention strategies
5. Alternative approaches if needed"""
            
            user_context = {
                'pipeline': pipeline,
                'symptoms': symptoms,
                'error_logs': error_logs,
                'issue_analysis': issue_analysis,
                'pipeline_elements': pipeline_elements
            }
            
            additional_context = f"""
=== TROUBLESHOOTING REQUEST ===
Pipeline: {pipeline}
Symptoms: {symptoms}
Error Logs: {error_logs}
Issue Type: {issue_analysis['primary_issue']}
Severity: {issue_analysis['severity']}

Please provide comprehensive troubleshooting assistance including:
1. Likely root causes
2. Diagnostic commands to run
3. Specific fixes to try
4. Alternative pipeline approaches
5. Prevention tips
"""
            
            claude_context = self.kb_client.build_claude_context(
                system_prompt,
                kb_results,
                user_context,
                additional_context
            )
            
            # Generate troubleshooting response
            diagnosis = await self.kb_client.invoke_claude(claude_context)
            
            return {
                'pipeline': pipeline,
                'symptoms': symptoms,
                'error_logs': error_logs,
                'issue_analysis': issue_analysis,
                'diagnosis': diagnosis,
                'kb_sources': len(kb_results),
                'troubleshooting_successful': True,
                'suggested_commands': self._extract_diagnostic_commands(diagnosis)
            }
            
        except Exception as e:
            logger.error(f"Pipeline troubleshooting failed: {e}")
            return {
                'pipeline': pipeline,
                'symptoms': symptoms,
                'error': f"Troubleshooting failed: {str(e)}",
                'troubleshooting_successful': False
            }

    def _analyze_issue_type(self, symptoms: str, error_logs: str = "") -> Dict[str, Any]:
        """Analyze the type and severity of the issue"""
        
        combined_text = f"{symptoms} {error_logs}".lower()
        
        # Define issue patterns
        issue_patterns = {
            'quality_issues': [
                'pixelated', 'artifacts', 'green screen', 'distorted', 'blurry',
                'color', 'brightness', 'contrast', 'resolution'
            ],
            'performance_issues': [
                'slow', 'lag', 'delay', 'latency', 'fps', 'framerate',
                'cpu', 'memory', 'bandwidth', 'stuttering'
            ],
            'connection_issues': [
                'connection', 'network', 'timeout', 'refused', 'unreachable',
                'rtsp', 'stream', 'source'
            ],
            'codec_issues': [
                'codec', 'encoding', 'decoding', 'format', 'unsupported',
                'h264', 'h265', 'aac'
            ],
            'pipeline_errors': [
                'error', 'failed', 'crash', 'segfault', 'assertion',
                'gst-launch', 'pipeline'
            ],
            'audio_issues': [
                'audio', 'sound', 'volume', 'mute', 'sync', 'echo'
            ]
        }
        
        # Count matches for each issue type
        issue_scores = {}
        for issue_type, keywords in issue_patterns.items():
            score = sum(1 for keyword in keywords if keyword in combined_text)
            if score > 0:
                issue_scores[issue_type] = score
        
        # Determine primary issue
        primary_issue = max(issue_scores.keys(), key=lambda k: issue_scores[k]) if issue_scores else 'general'
        
        # Determine severity
        severity_indicators = {
            'critical': ['crash', 'segfault', 'failed', 'error', 'not working'],
            'high': ['slow', 'lag', 'artifacts', 'distorted', 'timeout'],
            'medium': ['quality', 'performance', 'delay', 'sync'],
            'low': ['minor', 'slight', 'occasional']
        }
        
        severity = 'medium'  # default
        for sev_level, indicators in severity_indicators.items():
            if any(indicator in combined_text for indicator in indicators):
                severity = sev_level
                break
        
        return {
            'primary_issue': primary_issue,
            'all_issues': list(issue_scores.keys()),
            'severity': severity,
            'issue_scores': issue_scores
        }

    def _extract_pipeline_elements(self, pipeline: str) -> List[str]:
        """Extract GStreamer elements from pipeline string"""
        # Remove gst-launch-1.0 and common flags
        cleaned_pipeline = re.sub(r'gst-launch-1\.0\s+', '', pipeline)
        cleaned_pipeline = re.sub(r'-[a-z]\s+\w+', '', cleaned_pipeline)  # Remove flags like -v, -e
        
        # Extract element names (words followed by properties or !)
        element_pattern = r'\b(\w+(?:src|sink|enc|dec|parse|mux|demux|convert|scale|rate|tee|queue|pay|depay))\b'
        elements = re.findall(element_pattern, cleaned_pipeline, re.IGNORECASE)
        
        # Also look for other common elements
        common_elements = ['videotestsrc', 'audiotestsrc', 'filesrc', 'appsrc', 'appsink', 'fakesink']
        for element in common_elements:
            if element in cleaned_pipeline:
                elements.append(element)
        
        return list(set(elements))  # Remove duplicates

    def _extract_diagnostic_commands(self, diagnosis: str) -> List[str]:
        """Extract diagnostic commands from the diagnosis response"""
        commands = []
        
        # Look for command patterns in the diagnosis
        command_patterns = [
            r'`([^`]+)`',  # Commands in backticks
            r'gst-launch-1\.0[^\n]+',  # GStreamer commands
            r'gst-inspect-1\.0[^\n]+',  # Inspection commands
            r'gst-discoverer-1\.0[^\n]+',  # Discovery commands
        ]
        
        for pattern in command_patterns:
            matches = re.findall(pattern, diagnosis)
            commands.extend(matches)
        
        # Clean up and filter commands
        cleaned_commands = []
        for cmd in commands:
            cmd = cmd.strip()
            if len(cmd) > 5 and not cmd.startswith('http'):  # Filter out URLs
                cleaned_commands.append(cmd)
        
        return cleaned_commands[:5]  # Limit to 5 most relevant commands
