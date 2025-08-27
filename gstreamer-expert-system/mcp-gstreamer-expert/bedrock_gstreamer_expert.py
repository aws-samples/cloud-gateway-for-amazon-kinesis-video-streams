#!/usr/bin/env python3
"""
Bedrock GStreamer Expert MCP Server
Uses Claude 4.1 Opus via Bedrock + intelligent KB querying + context inference
"""

import asyncio
import json
import re
import os
from typing import Dict, List, Optional, Tuple
import boto3
from mcp.server import Server
from mcp.types import Tool, TextContent

class BedrockGStreamerExpert:
    """Advanced GStreamer expert using Bedrock Claude 4.1 Opus and intelligent KB querying"""
    
    def __init__(self):
        # Initialize Bedrock clients
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.bedrock_kb = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        # Configuration
        self.kb_id = '5CGJIOV1QM'
        # Use Claude Opus 4.1 via inference profile
        self.claude_model = 'us.anthropic.claude-opus-4-1-20250805-v1:0'  # Claude Opus 4.1 inference profile
        
        # Context analysis patterns
        self.platform_elements = {
            'macos': {
                'video_src': 'avfvideosrc', 'audio_src': 'osxaudiosrc',
                'video_sink': 'osxvideosink', 'audio_sink': 'osxaudiosink',
                'hw_encoder': 'vtenc_h264', 'hw_decoder': 'vtdec'
            },
            'linux': {
                'video_src': 'v4l2src', 'audio_src': 'alsasrc',
                'video_sink': 'xvimagesink', 'audio_sink': 'alsasink',
                'hw_encoder': 'vaapih264enc', 'hw_decoder': 'vaapih264dec'
            },
            'windows': {
                'video_src': 'ksvideosrc', 'audio_src': 'wasapisrc',
                'video_sink': 'd3dvideosink', 'audio_sink': 'wasapisink',
                'hw_encoder': 'mfh264enc', 'hw_decoder': 'mfh264dec'
            }
        }

    def analyze_context(self, user_input: str) -> Dict:
        """Intelligent context analysis from user input"""
        return {
            'source_type': self._detect_source_type(user_input),
            'destinations': self._detect_destinations(user_input),
            'platform': self._detect_platform(user_input),
            'codecs': self._detect_codecs(user_input),
            'complexity': self._assess_complexity(user_input),
            'issues': self._detect_issues(user_input),
            'rtsp_url': self._extract_rtsp_url(user_input),
            'pipeline_elements': self._extract_pipeline_elements(user_input)
        }
    
    def _detect_source_type(self, text: str) -> str:
        text_lower = text.lower()
        if 'rtsp://' in text or 'rtspsrc' in text:
            return 'rtsp'
        elif 'webcam' in text_lower or 'camera' in text_lower or any(src in text for src in ['v4l2src', 'avfvideosrc', 'ksvideosrc']):
            return 'webcam'
        elif 'file' in text_lower or 'filesrc' in text:
            return 'file'
        elif 'screen' in text_lower or 'desktop' in text_lower:
            return 'screen_capture'
        return 'unknown'
    
    def _detect_destinations(self, text: str) -> List[str]:
        destinations = []
        text_lower = text.lower()
        
        if 'kvs' in text_lower or 'kinesis' in text_lower or 'kvssink' in text:
            destinations.append('kvs')
        if 'display' in text_lower or 'screen' in text_lower or any(sink in text for sink in ['videosink', 'autovideosink']):
            destinations.append('display')
        if 'file' in text_lower or 'record' in text_lower or 'filesink' in text:
            destinations.append('file')
        if 'rtsp' in text_lower and ('server' in text_lower or 'stream' in text_lower):
            destinations.append('rtsp_server')
        if 'webrtc' in text_lower:
            destinations.append('webrtc')
        if 'tee' in text or 'multiple' in text_lower:
            destinations.append('multi_output')
            
        return destinations if destinations else ['unknown']
    
    def _detect_platform(self, text: str) -> str:
        # Linux indicators
        if any(elem in text for elem in ['v4l2src', 'alsasrc', 'vaapi', 'nvenc', 'nvdec']):
            return 'linux'
        # macOS indicators  
        elif any(elem in text for elem in ['avfvideosrc', 'osxaudiosrc', 'vtenc', 'vtdec']):
            return 'macos'
        # Windows indicators
        elif any(elem in text for elem in ['ksvideosrc', 'wasapi', 'mf']):
            return 'windows'
        
        return 'cross_platform'
    
    def _detect_codecs(self, text: str) -> Dict:
        codecs = {'video': [], 'audio': []}
        
        # Video codecs
        if 'h264' in text.lower() or 'rtph264' in text:
            codecs['video'].append('h264')
        if 'h265' in text.lower() or 'rtph265' in text or 'hevc' in text.lower():
            codecs['video'].append('h265')
        if 'vp8' in text.lower():
            codecs['video'].append('vp8')
        if 'vp9' in text.lower():
            codecs['video'].append('vp9')
        
        # Audio codecs
        if 'aac' in text.lower() or 'rtpmp4a' in text:
            codecs['audio'].append('aac')
        if 'opus' in text.lower() or 'rtpopus' in text:
            codecs['audio'].append('opus')
        if 'mp3' in text.lower():
            codecs['audio'].append('mp3')
            
        return codecs
    
    def _assess_complexity(self, text: str) -> str:
        text_lower = text.lower()
        
        # ML/AI inference
        if any(indicator in text_lower for indicator in ['detection', 'inference', 'openvino', 'nvidia', 'ai', 'ml', 'gva', 'nvinfer']):
            return 'ml_inference'
        # Multi-output
        elif any(indicator in text_lower for indicator in ['tee', 'multiple', 'simultaneous', 'branch']):
            return 'multi_output'
        # Multi-track
        elif any(indicator in text_lower for indicator in ['audio', 'video', 'both', 'multi']):
            return 'multi_track'
        # Optimization
        elif any(indicator in text_lower for indicator in ['optimize', 'performance', 'hardware', 'acceleration']):
            return 'optimization'
        
        return 'basic'
    
    def _detect_issues(self, text: str) -> List[str]:
        issues = []
        text_lower = text.lower()
        
        issue_patterns = {
            'initialization_failure': ['fails to initialize', 'won\'t start', 'error', 'not working'],
            'caps_negotiation': ['caps', 'negotiation', 'format', 'not negotiated'],
            'performance': ['slow', 'lag', 'performance', 'cpu', 'memory'],
            'audio_sync': ['sync', 'synchronization', 'audio delay', 'out of sync'],
            'missing_elements': ['element', 'not found', 'missing', 'plugin']
        }
        
        for issue_type, patterns in issue_patterns.items():
            if any(pattern in text_lower for pattern in patterns):
                issues.append(issue_type)
                
        return issues

    def _extract_rtsp_url(self, text: str) -> str:
        rtsp_match = re.search(r'rtsp://[^\s"\'\\]+', text)
        return rtsp_match.group(0) if rtsp_match else "rtsp://your-camera-url"

    def _extract_pipeline_elements(self, text: str) -> List[str]:
        """Extract GStreamer elements from user input"""
        # Common GStreamer element patterns
        element_pattern = r'\b\w+(?:src|sink|parse|depay|pay|enc|dec|mux|demux|convert|scale|rate|tee|queue)\b'
        elements = re.findall(element_pattern, text, re.IGNORECASE)
        return list(set(elements))  # Remove duplicates

    def generate_immediate_solution(self, context: Dict, user_input: str) -> str:
        """Generate immediate working solution based on context analysis"""
        
        source_type = context.get('source_type', 'unknown')
        destinations = context.get('destinations', ['unknown'])
        rtsp_url = context.get('rtsp_url', 'rtsp://your-camera-url')
        issues = context.get('issues', [])
        
        # Handle RTSP to KVS (most common issue based on user's example)
        if source_type == 'rtsp' and 'kvs' in destinations:
            if 'multi_track' in context.get('complexity', '') or 'audio' in user_input.lower():
                solution = f"""## 🔧 IMMEDIATE WORKING SOLUTION: RTSP to KVS (Audio + Video)

```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" name=src \\
  src. ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=avc,alignment=au ! kvssink name=sink stream-name="your-stream" aws-region="us-east-1" \\
  src. ! application/x-rtp,media=audio ! queue ! rtpmp4adepay ! aacparse ! audio/mpeg,mpegversion=4 ! avenc_aac ! queue ! sink.
```

## 🎯 Key Fixes Applied:

**1. Media Type Caps Filters:**
- `application/x-rtp,media=video` - Ensures video RTP stream selection
- `application/x-rtp,media=audio` - Ensures audio RTP stream selection

**2. Proper Stream Format:**
- Video: `stream-format=avc,alignment=au` for H.265 to kvssink
- Audio: Re-encode AAC with `avenc_aac` for kvssink compatibility

**3. Correct Sink Connection:**
- Video connects to `kvssink` directly
- Audio connects to `sink.` (same kvssink instance)
- **No container format needed** - kvssink handles multiple streams natively

## ❌ Why Your Original Pipeline Failed:
1. **Missing Media Type Caps**: Without `application/x-rtp,media=video/audio`, GStreamer couldn't select specific streams
2. **Direct Audio Connection**: Your `sink.` connection was correct, but missing proper audio encoding
3. **Stream Format**: Need `stream-format=avc` for kvssink, not `hvc1`"""
            else:
                solution = f"""## 🔧 IMMEDIATE WORKING SOLUTION: RTSP to KVS (Video Only)

```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" ! application/x-rtp,media=video ! queue ! rtph265depay ! h265parse ! video/x-h265,stream-format=avc,alignment=au ! kvssink stream-name="your-stream" aws-region="us-east-1"
```

**For audio+video, connect both streams directly to kvssink - no container needed.**"""
        
        # Handle other common patterns
        elif source_type == 'webcam' and 'display' in destinations:
            platform = context.get('platform', 'cross_platform')
            if platform == 'macos':
                solution = """## 🔧 IMMEDIATE WORKING SOLUTION: macOS Webcam to Display

```bash
gst-launch-1.0 avfvideosrc ! videoconvert ! osxvideosink
```"""
            elif platform == 'linux':
                solution = """## 🔧 IMMEDIATE WORKING SOLUTION: Linux Webcam to Display

```bash
gst-launch-1.0 v4l2src ! videoconvert ! xvimagesink
```"""
            else:
                solution = """## 🔧 IMMEDIATE WORKING SOLUTION: Cross-Platform Webcam to Display

```bash
gst-launch-1.0 autovideosrc ! videoconvert ! autovideosink
```"""
        
        # Generic fallback
        else:
            solution = f"""## 🔧 WORKING SOLUTION FRAMEWORK

Based on detected context:
- **Source**: {source_type}
- **Destinations**: {', '.join(destinations)}
- **Complexity**: {context.get('complexity', 'basic')}
- **Issues**: {', '.join(issues) if issues else 'None detected'}

```bash
# Framework - will be enhanced with specific solution
gst-launch-1.0 [source] ! [processing] ! [sink]
```"""
        
        # Add debugging section if issues detected
        if issues:
            solution += f"""

## 🛠️ DEBUGGING STEPS (Issues Detected: {', '.join(issues)}):

1. **Test connectivity:**
```bash
gst-launch-1.0 rtspsrc location="{rtsp_url}" ! fakesink dump=true
```

2. **Inspect stream:**
```bash
gst-discoverer-1.0 "{rtsp_url}"
```

3. **Enable debug output:**
```bash
GST_DEBUG=3 gst-launch-1.0 [your pipeline]
```"""
        
        return solution

    async def query_knowledge_base(self, context: Dict, user_query: str) -> List[Dict]:
        """Query Bedrock knowledge base for relevant documentation"""
        
        # Create intelligent KB query based on context
        kb_query = self._create_kb_query(context, user_query)
        
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
            
            # Extract and score relevant content
            relevant_docs = []
            for result in response.get('retrievalResults', []):
                content = result.get('content', {}).get('text', '')
                if content and len(content) > 50:  # Filter out very short content
                    relevant_docs.append({
                        'content': content,
                        'score': result.get('score', 0),
                        'source': result.get('location', {}).get('s3Location', {}).get('uri', 'Unknown')
                    })
            
            # Sort by relevance score
            relevant_docs.sort(key=lambda x: x['score'], reverse=True)
            return relevant_docs[:8]  # Top 8 most relevant
            
        except Exception as e:
            print(f"KB query failed: {e}")
            return []

    def _create_kb_query(self, context: Dict, user_query: str) -> str:
        """Create intelligent KB query based on context analysis"""
        
        query_parts = []
        
        # Add source type
        source_type = context.get('source_type', '')
        if source_type == 'rtsp':
            query_parts.append("RTSP rtspsrc streaming")
        elif source_type == 'webcam':
            query_parts.append("webcam camera video capture")
        elif source_type == 'file':
            query_parts.append("file playback filesrc")
        
        # Add destinations
        destinations = context.get('destinations', [])
        if 'kvs' in destinations:
            query_parts.append("Kinesis Video Streams kvssink AWS")
        if 'display' in destinations:
            query_parts.append("display video sink")
        if 'multi_output' in destinations:
            query_parts.append("tee multiple outputs")
        
        # Add complexity indicators
        complexity = context.get('complexity', '')
        if complexity == 'multi_track':
            query_parts.append("audio video multi-track mux")
        elif complexity == 'ml_inference':
            query_parts.append("machine learning inference OpenVINO NVIDIA")
        elif complexity == 'optimization':
            query_parts.append("performance optimization hardware acceleration")
        
        # Add detected issues
        issues = context.get('issues', [])
        if 'initialization_failure' in issues:
            query_parts.append("pipeline initialization error troubleshooting")
        if 'caps_negotiation' in issues:
            query_parts.append("caps negotiation format compatibility")
        
        # Add specific elements from pipeline
        elements = context.get('pipeline_elements', [])
        query_parts.extend(elements[:3])  # Add up to 3 specific elements
        
        # Create final query
        kb_query = ' '.join(query_parts) if query_parts else user_query[:200]
        return kb_query

    async def query_claude_opus(self, user_query: str, context: Dict, relevant_docs: List[Dict]) -> str:
        """Query Claude 4.1 Opus via Bedrock with enhanced context and intelligent fallback"""
        
        # Try Claude Opus 4.1 first with optimized prompt
        try:
            enhanced_prompt = self._create_enhanced_prompt_chunked(user_query, context, relevant_docs)
            
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 3000,  # Conservative limit for Claude Opus 4.1
                "temperature": 0.1,
                "messages": [{"role": "user", "content": enhanced_prompt}]
            }
            
            response = self.bedrock_runtime.invoke_model(
                modelId=self.claude_model,
                body=json.dumps(request_body),
                contentType='application/json'
            )
            
            response_body = json.loads(response['body'].read())
            opus_response = response_body.get('content', [{}])[0].get('text', 'No response generated')
            
            return f"**Enhanced Analysis (Claude Opus 4.1)**\n\n{opus_response}"
            
        except Exception as e:
            # Handle token limit and other errors with intelligent fallback
            if any(keyword in str(e).lower() for keyword in ['token', 'too many', 'limit', 'length']):
                return await self._fallback_with_hierarchy(user_query, context, relevant_docs, "token_limit")
            else:
                return await self._fallback_with_hierarchy(user_query, context, relevant_docs, f"opus_error: {str(e)}")

    def _create_enhanced_prompt_chunked(self, user_query: str, context: Dict, relevant_docs: List[Dict]) -> str:
        """Create token-optimized prompt for Claude Opus 4.1"""
        
        # Limit documentation to most relevant and concise
        docs_context = ""
        if relevant_docs:
            docs_context = "\n## KEY REFERENCES:\n"
            for i, doc in enumerate(relevant_docs[:2]):  # Only top 2 docs
                # Truncate each doc to ~300 characters for token efficiency
                content = doc['content'][:300] + "..." if len(doc['content']) > 300 else doc['content']
                docs_context += f"\n**Ref {i+1}** (Score: {doc['score']:.2f}): {content}\n"
        
        # Ultra-concise context summary
        context_line = f"Source: {context.get('source_type', '?')} → Dest: {','.join(context.get('destinations', ['?']))} | Platform: {context.get('platform', '?')} | Issues: {','.join(context.get('issues', ['none']))}"
        
        # Optimized prompt for token efficiency
        return f"""GStreamer Expert: Provide comprehensive pipeline solution.

CONTEXT: {context_line}
QUERY: {user_query}
{docs_context}

PROVIDE:
1. **Enhanced Pipeline**: Improved solution with explanations
2. **Platform Optimization**: Hardware acceleration for {context.get('platform', 'cross-platform')}
3. **Troubleshooting**: Debug steps for detected issues
4. **Performance**: Memory, latency, throughput optimizations
5. **Extensions**: ML inference, multi-output, advanced features

Focus on practical, working solutions."""

    async def _fallback_with_hierarchy(self, user_query: str, context: Dict, relevant_docs: List[Dict], reason: str) -> str:
        """Intelligent fallback through model hierarchy"""
        
        # Define fallback hierarchy with working models
        fallback_models = [
            ("anthropic.claude-3-5-sonnet-20240620-v1:0", "Claude 3.5 Sonnet"),
            ("anthropic.claude-3-opus-20240229-v1:0", "Claude 3 Opus"),
            ("anthropic.claude-3-sonnet-20240229-v1:0", "Claude 3 Sonnet")
        ]
        
        for model_id, model_name in fallback_models:
            try:
                # Create simpler prompt for fallback models
                simple_prompt = self._create_simple_prompt(user_query, context, relevant_docs)
                
                request_body = {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2500,
                    "temperature": 0.1,
                    "messages": [{"role": "user", "content": simple_prompt}]
                }
                
                response = self.bedrock_runtime.invoke_model(
                    modelId=model_id,
                    body=json.dumps(request_body),
                    contentType='application/json'
                )
                
                response_body = json.loads(response['body'].read())
                fallback_response = response_body.get('content', [{}])[0].get('text', 'No response generated')
                
                return f"""**Enhanced Analysis ({model_name})**
*Note: Using {model_name} fallback (Claude Opus 4.1 {reason})*

{fallback_response}"""
                
            except Exception as e:
                # Continue to next fallback model
                continue
        
        # If all models fail, provide intelligent local analysis
        return self._generate_local_analysis(user_query, context, relevant_docs, reason)

    def _create_simple_prompt(self, user_query: str, context: Dict, relevant_docs: List[Dict]) -> str:
        """Create simplified prompt for fallback models"""
        
        # Even more concise for fallback models
        docs_summary = ""
        if relevant_docs:
            # Just mention we have relevant docs, don't include full content
            docs_summary = f"\n*Reference: {len(relevant_docs)} relevant GStreamer docs available*"
        
        return f"""GStreamer Expert: Help with this pipeline issue.

Context: {context.get('source_type', 'unknown')} to {','.join(context.get('destinations', ['unknown']))}
Platform: {context.get('platform', 'cross-platform')} | Issues: {','.join(context.get('issues', ['none']))}
{docs_summary}

Query: {user_query}

Provide:
1. Working pipeline solution
2. Key optimizations for {context.get('platform', 'cross-platform')}
3. Troubleshooting steps
4. Performance recommendations"""

    def _generate_local_analysis(self, user_query: str, context: Dict, relevant_docs: List[Dict], reason: str) -> str:
        """Generate intelligent local analysis when all models fail"""
        
        # Use our intelligent context analysis to provide meaningful guidance
        source_type = context.get('source_type', 'unknown')
        destinations = context.get('destinations', ['unknown'])
        platform = context.get('platform', 'cross_platform')
        issues = context.get('issues', [])
        complexity = context.get('complexity', 'basic')
        
        analysis = f"""**Local Analysis (All models unavailable: {reason})**

Based on intelligent context analysis:

**Detected Configuration:**
- Source: {source_type}
- Destinations: {', '.join(destinations)}
- Platform: {platform}
- Complexity: {complexity}
- Issues: {', '.join(issues) if issues else 'None detected'}

**Recommended Approach:**"""
        
        # Provide specific guidance based on detected context
        if source_type == 'rtsp' and 'kvs' in destinations:
            analysis += """

**RTSP to KVS Solution:**
1. **Add media type caps**: `application/x-rtp,media=video` and `application/x-rtp,media=audio`
2. **Use proper stream format**: `stream-format=avc` for kvssink compatibility
3. **Re-encode audio**: Use `avenc_aac` for proper AAC encoding to kvssink
4. **Connect directly**: Both video and audio connect to same kvssink instance"""
        
        if 'initialization_failure' in issues:
            analysis += """

**Initialization Issues:**
1. **Test connectivity**: `gst-launch-1.0 rtspsrc location="..." ! fakesink`
2. **Check elements**: `gst-inspect-1.0 [element-name]`
3. **Enable debugging**: `GST_DEBUG=3 gst-launch-1.0 [pipeline]`"""
        
        if 'caps_negotiation' in issues:
            analysis += """

**Caps Negotiation:**
1. **Add converters**: Insert `videoconvert` and `audioconvert` elements
2. **Specify formats**: Use explicit caps filters
3. **Check compatibility**: Ensure element input/output formats match"""
        
        # Platform-specific recommendations
        if platform == 'macos':
            analysis += """

**macOS Optimizations:**
- Use `avfvideosrc` for cameras, `vtenc_h264` for encoding
- Enable VideoToolbox: `vtdec` for hardware decoding"""
        elif platform == 'linux':
            analysis += """

**Linux Optimizations:**
- Use `v4l2src` for cameras, `vaapih264enc` for Intel GPU
- NVIDIA: `nvh264enc`/`nvh264dec` for best performance"""
        
        if relevant_docs:
            analysis += f"""

**Knowledge Base**: {len(relevant_docs)} relevant documents available for detailed guidance."""
        
        return analysis

    def _create_enhanced_prompt_chunked(self, user_query: str, context: Dict, relevant_docs: List[Dict]) -> str:
        """Create token-optimized prompt for Claude Opus"""
        
        # Limit documentation to most relevant and concise
        docs_context = ""
        if relevant_docs:
            # Only use top 2 most relevant docs and truncate them
            docs_context = "\n## KEY GSTREAMER REFERENCES:\n"
            for i, doc in enumerate(relevant_docs[:2]):
                # Truncate each doc to ~400 characters
                truncated_content = doc['content'][:400] + "..." if len(doc['content']) > 400 else doc['content']
                docs_context += f"\n### Ref {i+1}: {truncated_content}\n"
        
        # Concise context summary
        context_summary = f"""## CONTEXT:
Source: {context.get('source_type', 'unknown')} | Dest: {', '.join(context.get('destinations', ['unknown']))} | Platform: {context.get('platform', 'cross_platform')}
Codecs: V:{','.join(context.get('codecs', {}).get('video', []))} A:{','.join(context.get('codecs', {}).get('audio', []))}
Issues: {', '.join(context.get('issues', ['none']))} | Complexity: {context.get('complexity', 'basic')}"""

        # Optimized prompt - much more concise
        return f"""You are a GStreamer expert. Provide a comprehensive solution for this multimedia pipeline issue.

{context_summary}

USER QUERY: {user_query}

{docs_context}

PROVIDE:
1. **Enhanced Pipeline**: Improved working solution with explanations
2. **Platform Optimization**: Hardware acceleration recommendations  
3. **Troubleshooting**: Debug steps for common issues
4. **Performance Tips**: Memory, latency, and throughput optimizations
5. **Extensions**: How to add ML inference, multi-output, or advanced features

Focus on practical, working solutions with clear explanations."""

    async def get_comprehensive_solution(self, user_query: str) -> str:
        """Get comprehensive GStreamer solution using layered approach"""
        
        # Format relevant documentation
        docs_context = ""
        if relevant_docs:
            docs_context = "\n## RELEVANT GSTREAMER DOCUMENTATION:\n"
            for i, doc in enumerate(relevant_docs[:5]):
                docs_context += f"\n### Reference {i+1} (Relevance: {doc['score']:.2f}):\n{doc['content'][:1200]}...\n"
        
        # Format context analysis
        context_summary = f"""## INTELLIGENT CONTEXT ANALYSIS:
- **Source Type**: {context.get('source_type', 'unknown')}
- **Destinations**: {', '.join(context.get('destinations', ['unknown']))}
- **Platform**: {context.get('platform', 'cross_platform')}
- **Video Codecs**: {', '.join(context.get('codecs', {}).get('video', ['none detected']))}
- **Audio Codecs**: {', '.join(context.get('codecs', {}).get('audio', ['none detected']))}
- **Complexity Level**: {context.get('complexity', 'basic')}
- **Detected Issues**: {', '.join(context.get('issues', ['none']))}
- **Pipeline Elements**: {', '.join(context.get('pipeline_elements', ['none detected']))}
- **RTSP URL**: {context.get('rtsp_url', 'none')}"""

        return f"""You are an expert GStreamer consultant with deep knowledge of multimedia pipeline development, optimization, and troubleshooting. Provide comprehensive, practical solutions.

{context_summary}

## USER QUERY:
{user_query}

{docs_context}

## RESPONSE REQUIREMENTS:

**PRIMARY FOCUS**: Provide actionable, working solutions that address the user's specific needs.

**RESPONSE STRUCTURE**:
1. **Enhanced Pipeline Solution**: Improved version of any immediate solution provided
2. **Component Deep-Dive**: Detailed explanation of each pipeline element and its configuration
3. **Platform Optimization**: Platform-specific improvements and hardware acceleration options
4. **Alternative Approaches**: Different methods to achieve the same goal
5. **Troubleshooting Guide**: Common issues and debugging techniques
6. **Performance Optimization**: Hardware acceleration, memory management, latency reduction
7. **Extension Possibilities**: How to expand the pipeline for more complex scenarios

**SPECIFIC GUIDANCE**:
- Always provide complete, runnable pipeline commands
- Explain the purpose and configuration of each GStreamer element
- Include platform-specific optimizations (macOS: vtenc/vtdec, Linux: vaapi/nvenc, Windows: mf)
- Suggest hardware acceleration when applicable
- Address any detected issues with specific solutions
- Show how to extend pipelines for multi-output, ML inference, or other advanced features
- Include debugging commands and techniques
- Provide performance tuning recommendations

**TONE**: Expert but accessible, focusing on practical implementation over theory.

Generate a comprehensive response that helps the user achieve their GStreamer goals effectively."""

    async def get_comprehensive_solution(self, user_query: str) -> str:
        """Get comprehensive GStreamer solution using layered approach"""
        
        try:
            # 1. Analyze context intelligently
            context = self.analyze_context(user_query)
            
            # 2. Generate immediate working solution
            immediate_solution = self.generate_immediate_solution(context, user_query)
            
            # 3. Query knowledge base for relevant documentation
            relevant_docs = await self.query_knowledge_base(context, user_query)
            
            # 4. Get enhanced analysis from Claude Opus
            enhanced_response = await self.query_claude_opus(user_query, context, relevant_docs)
            
            # 5. Combine into comprehensive response
            return f"""{immediate_solution}

---

## 🚀 ENHANCED ANALYSIS & RECOMMENDATIONS

{enhanced_response}

---

## 📊 CONTEXT ANALYSIS SUMMARY
```json
{json.dumps(context, indent=2)}
```

## 📚 KNOWLEDGE BASE INTEGRATION
Retrieved {len(relevant_docs)} relevant documents from GStreamer knowledge base.
Top sources: {', '.join([doc['source'].split('/')[-1] for doc in relevant_docs[:3]]) if relevant_docs else 'None'}"""
            
        except Exception as e:
            return f"""## ❌ Error in Comprehensive Analysis

{self.generate_immediate_solution(self.analyze_context(user_query), user_query)}

**Error Details**: {str(e)}

The immediate solution above should still work. Please try it and let me know if you need further assistance."""

# Initialize MCP Server
server = Server("bedrock-gstreamer-expert")
expert = BedrockGStreamerExpert()

@server.list_tools()
async def list_tools() -> List[Tool]:
    """List available GStreamer expert tools"""
    return [
        Tool(
            name="gstreamer_expert",
            description="Get comprehensive GStreamer solutions using Claude 4.1 Opus and intelligent context analysis",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Your GStreamer question, pipeline issue, or requirements. Can include existing pipelines, error descriptions, or desired functionality."
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="analyze_pipeline",
            description="Analyze an existing GStreamer pipeline for issues, optimizations, and improvements",
            inputSchema={
                "type": "object",
                "properties": {
                    "pipeline": {
                        "type": "string",
                        "description": "The complete GStreamer pipeline command to analyze"
                    },
                    "issues": {
                        "type": "string",
                        "description": "Description of any issues you're experiencing (optional)"
                    },
                    "goals": {
                        "type": "string", 
                        "description": "What you want to achieve or improve (optional)"
                    }
                },
                "required": ["pipeline"]
            }
        ),
        Tool(
            name="extend_pipeline",
            description="Extend a basic pipeline with advanced features like ML inference, multi-output, or optimization",
            inputSchema={
                "type": "object",
                "properties": {
                    "base_pipeline": {
                        "type": "string",
                        "description": "The current working pipeline to extend"
                    },
                    "desired_features": {
                        "type": "string",
                        "description": "Features to add: ML inference, multi-output tee, hardware acceleration, etc."
                    },
                    "platform": {
                        "type": "string",
                        "description": "Target platform: macos, linux, windows, or auto-detect",
                        "default": "auto-detect"
                    }
                },
                "required": ["base_pipeline", "desired_features"]
            }
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> List[TextContent]:
    """Handle tool calls with comprehensive GStreamer expertise"""
    
    if name == "gstreamer_expert":
        query = arguments.get("query", "")
        if not query:
            return [TextContent(type="text", text="Please provide a GStreamer question, pipeline, or requirement.")]
        
        try:
            response = await expert.get_comprehensive_solution(query)
            return [TextContent(type="text", text=response)]
        except Exception as e:
            return [TextContent(type="text", text=f"Error getting GStreamer solution: {str(e)}")]
    
    elif name == "analyze_pipeline":
        pipeline = arguments.get("pipeline", "")
        issues = arguments.get("issues", "")
        goals = arguments.get("goals", "")
        
        if not pipeline:
            return [TextContent(type="text", text="Please provide a GStreamer pipeline to analyze.")]
        
        analysis_query = f"Analyze this GStreamer pipeline for issues, optimizations, and improvements:\n\nPipeline: {pipeline}"
        if issues:
            analysis_query += f"\n\nCurrent Issues: {issues}"
        if goals:
            analysis_query += f"\n\nDesired Improvements: {goals}"
        
        try:
            response = await expert.get_comprehensive_solution(analysis_query)
            return [TextContent(type="text", text=response)]
        except Exception as e:
            return [TextContent(type="text", text=f"Error analyzing pipeline: {str(e)}")]
    
    elif name == "extend_pipeline":
        base_pipeline = arguments.get("base_pipeline", "")
        desired_features = arguments.get("desired_features", "")
        platform = arguments.get("platform", "auto-detect")
        
        if not base_pipeline or not desired_features:
            return [TextContent(type="text", text="Please provide both a base pipeline and desired features to add.")]
        
        extension_query = f"""Extend this GStreamer pipeline with advanced features:

Base Pipeline: {base_pipeline}

Desired Features: {desired_features}
Target Platform: {platform}

Please provide:
1. Extended pipeline with new features
2. Explanation of added components
3. Alternative implementation approaches
4. Performance optimization recommendations
5. Troubleshooting guidance for the extended pipeline"""
        
        try:
            response = await expert.get_comprehensive_solution(extension_query)
            return [TextContent(type="text", text=response)]
        except Exception as e:
            return [TextContent(type="text", text=f"Error extending pipeline: {str(e)}")]
    
    else:
        return [TextContent(type="text", text=f"Unknown tool: {name}")]

async def main():
    """Run the Bedrock GStreamer expert MCP server"""
    from mcp.server.stdio import stdio_server
    
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options()
        )

if __name__ == "__main__":
    asyncio.run(main())
