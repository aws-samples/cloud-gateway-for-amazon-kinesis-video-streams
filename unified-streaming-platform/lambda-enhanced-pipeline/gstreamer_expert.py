"""
GStreamer Expert System Module
Extracted from bedrock-gstreamer project for enhanced pipeline generator
"""

import json
import boto3
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class GStreamerExpert:
    """GStreamer expert system with knowledge base integration"""
    
    def __init__(self, kb_id: str, claude_model: str):
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.bedrock_kb = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        self.kb_id = kb_id
        self.claude_model = claude_model
        
        logger.info(f"Initialized GStreamer Expert with KB: {kb_id}")

    def analyze_context(self, user_input: str, stream_info: Dict = None) -> Dict:
        """Analyze context from user input and stream information"""
        
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
        return 'rtsp'  # Default for this use case
    
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
            
        return destinations if destinations else ['kvs']  # Default to KVS
    
    def _detect_platform(self, text: str) -> str:
        """Detect target platform from text"""
        # Linux indicators
        if any(elem in text for elem in ['v4l2src', 'alsasrc', 'vaapi', 'nvenc']):
            return 'linux'
        # macOS indicators  
        elif any(elem in text for elem in ['avfvideosrc', 'osxaudiosrc', 'vtenc']):
            return 'macos'
        # Windows indicators
        elif any(elem in text for elem in ['ksvideosrc', 'wasapi', 'mf']):
            return 'windows'
        return 'linux'  # Default
    
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
    
    def _assess_complexity(self, text: str) -> str:
        """Assess complexity level from text"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['optimize', 'performance', 'latency', 'quality']):
            return 'high'
        elif any(word in text_lower for word in ['simple', 'basic', 'quick']):
            return 'low'
        return 'medium'
    
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
        import re
        rtsp_pattern = r'rtsp://[^\s]+'
        match = re.search(rtsp_pattern, text)
        return match.group(0) if match else None
    
    def _extract_pipeline_elements(self, text: str) -> List[str]:
        """Extract GStreamer elements mentioned in text"""
        import re
        element_pattern = r'\b\w+(?:src|sink|enc|dec|parse|mux|demux|convert|scale|filter)\b'
        elements = re.findall(element_pattern, text, re.IGNORECASE)
        return list(set(elements))

    def query_knowledge_base(self, query: str, max_results: int = 10) -> List[Dict]:
        """Query the knowledge base for relevant information"""
        try:
            response = self.bedrock_kb.retrieve(
                knowledgeBaseId=self.kb_id,
                retrievalQuery={'text': query},
                retrievalConfiguration={
                    'vectorSearchConfiguration': {
                        'numberOfResults': max_results,
                        'overrideSearchType': 'HYBRID'
                    }
                }
            )
            
            results = []
            for result in response.get('retrievalResults', []):
                results.append({
                    'content': result.get('content', {}).get('text', ''),
                    'score': result.get('score', 0),
                    'source': result.get('location', {}).get('s3Location', {}).get('uri', 'unknown')
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Knowledge base query failed: {e}")
            return []

    def generate_pipeline(self, context: Dict, mode: str = 'pipeline') -> str:
        """Generate GStreamer pipeline using knowledge base and Claude"""
        
        # Build comprehensive query for knowledge base
        kb_query = self._build_kb_query(context, mode)
        
        # Query knowledge base for relevant information
        kb_results = self.query_knowledge_base(kb_query, max_results=15)
        
        # Build context for Claude
        claude_context = self._build_claude_context(context, kb_results, mode)
        
        # Generate response using Claude
        response = self._invoke_claude(claude_context, mode)
        
        return response
    
    def _build_kb_query(self, context: Dict, mode: str) -> str:
        """Build optimized knowledge base query"""
        query_parts = []
        
        # Add source type
        if context.get('source_type') == 'rtsp':
            query_parts.append('rtspsrc RTSP streaming')
        
        # Add destination
        destinations = context.get('destinations', ['kvs'])
        if 'kvs' in destinations:
            query_parts.append('kvssink Kinesis Video Streams')
        
        # Add codecs from stream analysis
        if context.get('stream_analysis'):
            stream_info = context['stream_analysis']
            if 'video' in stream_info:
                video_codec = stream_info['video'].get('codec', '')
                if 'H264' in video_codec:
                    query_parts.append('h264 video encoding')
                elif 'H265' in video_codec or 'HEVC' in video_codec:
                    query_parts.append('h265 hevc video encoding')
            
            if 'audio' in stream_info:
                audio_codec = stream_info['audio'].get('codec', '')
                if 'AAC' in audio_codec:
                    query_parts.append('aac audio encoding')
        
        # Add platform
        platform = context.get('platform', 'linux')
        query_parts.append(f'{platform} platform optimization')
        
        # Add mode-specific terms
        if mode == 'troubleshooting':
            query_parts.append('troubleshooting debugging pipeline issues')
        elif mode == 'optimization':
            query_parts.append('performance optimization latency quality')
        
        return ' '.join(query_parts)
    
    def _build_claude_context(self, context: Dict, kb_results: List[Dict], mode: str) -> str:
        """Build comprehensive context for Claude"""
        
        # Start with system prompt based on mode
        if mode == 'troubleshooting':
            system_prompt = """You are a GStreamer troubleshooting expert. Analyze the provided information and help diagnose and fix pipeline issues."""
        elif mode == 'optimization':
            system_prompt = """You are a GStreamer performance optimization expert. Provide specific recommendations to improve pipeline performance, reduce latency, and enhance quality."""
        else:
            system_prompt = """You are a GStreamer pipeline generation expert specializing in creating optimized pipelines for Amazon Kinesis Video Streams ingestion from RTSP sources."""
        
        # Add knowledge base context
        kb_context = "\n\n=== RELEVANT KNOWLEDGE BASE INFORMATION ===\n"
        for i, result in enumerate(kb_results[:10], 1):
            kb_context += f"\n{i}. {result['content'][:500]}...\n"
        
        # Add stream analysis if available
        stream_context = ""
        if context.get('stream_analysis'):
            stream_context = f"\n\n=== RTSP STREAM ANALYSIS ===\n{json.dumps(context['stream_analysis'], indent=2)}\n"
        
        # Add user context
        user_context = f"\n\n=== USER CONTEXT ===\n"
        user_context += f"Source Type: {context.get('source_type', 'rtsp')}\n"
        user_context += f"Destinations: {', '.join(context.get('destinations', ['kvs']))}\n"
        user_context += f"Platform: {context.get('platform', 'linux')}\n"
        user_context += f"Complexity: {context.get('complexity', 'medium')}\n"
        
        if context.get('issues'):
            user_context += f"Issues Detected: {', '.join(context['issues'])}\n"
        
        # Build final prompt
        final_prompt = system_prompt + kb_context + stream_context + user_context
        
        if mode == 'pipeline':
            final_prompt += "\n\nPlease generate an optimized GStreamer pipeline for this configuration. Include:\n"
            final_prompt += "1. Complete working pipeline command\n"
            final_prompt += "2. Explanation of key elements and their purpose\n"
            final_prompt += "3. Platform-specific optimizations\n"
            final_prompt += "4. Performance and quality recommendations\n"
        
        return final_prompt
    
    def _invoke_claude(self, prompt: str, mode: str) -> str:
        """Invoke Claude with the constructed prompt"""
        try:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "temperature": 0.1,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            response = self.bedrock_runtime.invoke_model(
                modelId=self.claude_model,
                body=json.dumps(body)
            )
            
            response_body = json.loads(response['body'].read())
            return response_body['content'][0]['text']
            
        except Exception as e:
            logger.error(f"Claude invocation failed: {e}")
            return f"Error generating response: {str(e)}"

    # Specialized tool methods
    
    def search_elements(self, query: str) -> str:
        """Search for GStreamer elements"""
        kb_query = f"gstreamer element {query}"
        kb_results = self.query_knowledge_base(kb_query, max_results=10)
        
        context = f"Search for GStreamer elements related to: {query}\n\n"
        context += "=== RELEVANT KNOWLEDGE BASE INFORMATION ===\n"
        for i, result in enumerate(kb_results[:5], 1):
            context += f"\n{i}. {result['content'][:300]}...\n"
        
        context += "\n\nPlease provide a comprehensive list of relevant GStreamer elements with their descriptions and usage examples."
        
        return self._invoke_claude(context, 'search')
    
    def troubleshoot_pipeline(self, pipeline: str, issue: str) -> str:
        """Troubleshoot pipeline issues"""
        kb_query = f"gstreamer troubleshooting {issue} pipeline debug"
        kb_results = self.query_knowledge_base(kb_query, max_results=10)
        
        context = f"Troubleshoot this GStreamer pipeline issue:\n\n"
        context += f"Pipeline: {pipeline}\n"
        context += f"Issue: {issue}\n\n"
        context += "=== RELEVANT TROUBLESHOOTING INFORMATION ===\n"
        for i, result in enumerate(kb_results[:5], 1):
            context += f"\n{i}. {result['content'][:300]}...\n"
        
        context += "\n\nPlease analyze the issue and provide specific troubleshooting steps and solutions."
        
        return self._invoke_claude(context, 'troubleshooting')
    
    def optimize_pipeline(self, pipeline: str, goals: str) -> str:
        """Optimize pipeline for specific goals"""
        kb_query = f"gstreamer optimization performance {goals}"
        kb_results = self.query_knowledge_base(kb_query, max_results=10)
        
        context = f"Optimize this GStreamer pipeline:\n\n"
        context += f"Pipeline: {pipeline}\n"
        context += f"Optimization Goals: {goals}\n\n"
        context += "=== RELEVANT OPTIMIZATION INFORMATION ===\n"
        for i, result in enumerate(kb_results[:5], 1):
            context += f"\n{i}. {result['content'][:300]}...\n"
        
        context += "\n\nPlease provide specific optimization recommendations and an improved pipeline."
        
        return self._invoke_claude(context, 'optimization')
