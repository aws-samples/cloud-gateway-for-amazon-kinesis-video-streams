#!/usr/bin/env python3
"""
Knowledge Base Client
Handles all interactions with AWS Bedrock Knowledge Base and Claude model
"""

import json
import boto3
import logging
from typing import Dict, List, Optional, Any

logger = logging.getLogger(__name__)

class KnowledgeBaseClient:
    """Client for AWS Bedrock Knowledge Base and Claude model interactions"""
    
    def __init__(self, kb_id: str, claude_model: str):
        """Initialize the knowledge base client"""
        self.kb_id = kb_id
        self.claude_model = claude_model
        
        # Initialize Bedrock clients
        self.bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-east-1')
        self.bedrock_kb = boto3.client('bedrock-agent-runtime', region_name='us-east-1')
        
        logger.info(f"Knowledge Base Client initialized - KB: {kb_id}, Model: {claude_model}")

    async def query_knowledge_base(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Query the knowledge base for relevant information
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of knowledge base results with content and metadata
        """
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
                    'source': result.get('location', {}).get('s3Location', {}).get('uri', 'unknown'),
                    'metadata': result.get('metadata', {})
                })
            
            logger.info(f"Knowledge base query returned {len(results)} results for: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"Knowledge base query failed: {e}")
            return []

    async def invoke_claude(self, prompt: str, temperature: float = 0.1, max_tokens: int = 4000) -> str:
        """
        Invoke Claude model with the given prompt
        
        Args:
            prompt: The prompt to send to Claude
            temperature: Model temperature (0.0-1.0)
            max_tokens: Maximum tokens in response
            
        Returns:
            Claude's response text
        """
        try:
            body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": max_tokens,
                "temperature": temperature,
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
            result = response_body['content'][0]['text']
            
            logger.info(f"Claude invocation successful - {len(result)} characters returned")
            return result
            
        except Exception as e:
            logger.error(f"Claude invocation failed: {e}")
            return f"Error generating response: {str(e)}"

    def build_kb_query(self, base_query: str, **filters) -> str:
        """
        Build optimized knowledge base query with filters
        
        Args:
            base_query: Base search query
            **filters: Additional filters (platform, codec, etc.)
            
        Returns:
            Optimized query string
        """
        query_parts = [base_query]
        
        # Add platform filter
        if filters.get('platform'):
            query_parts.append(f"{filters['platform']} platform")
        
        # Add codec filters
        if filters.get('video_codec'):
            codec = filters['video_codec'].lower()
            if 'h264' in codec:
                query_parts.append('h264 video encoding')
            elif 'h265' in codec or 'hevc' in codec:
                query_parts.append('h265 hevc video encoding')
        
        if filters.get('audio_codec'):
            codec = filters['audio_codec'].lower()
            if 'aac' in codec:
                query_parts.append('aac audio encoding')
        
        # Add source/destination filters
        if filters.get('source_type'):
            if filters['source_type'] == 'rtsp':
                query_parts.append('rtspsrc RTSP streaming')
        
        if filters.get('destination'):
            if 'kvs' in filters['destination']:
                query_parts.append('kvssink Kinesis Video Streams')
        
        # Add mode-specific terms
        mode = filters.get('mode', '')
        if mode == 'troubleshooting':
            query_parts.append('troubleshooting debugging pipeline issues')
        elif mode == 'optimization':
            query_parts.append('performance optimization latency quality')
        elif mode == 'elements':
            query_parts.append('gstreamer elements plugins')
        
        return ' '.join(query_parts)

    def build_claude_context(self, 
                           system_prompt: str, 
                           kb_results: List[Dict], 
                           user_context: Optional[Dict] = None,
                           additional_context: str = "") -> str:
        """
        Build comprehensive context for Claude
        
        Args:
            system_prompt: System prompt defining Claude's role
            kb_results: Knowledge base search results
            user_context: User context information
            additional_context: Any additional context string
            
        Returns:
            Complete prompt for Claude
        """
        # Start with system prompt
        prompt = system_prompt
        
        # Add knowledge base context
        if kb_results:
            prompt += "\n\n=== RELEVANT KNOWLEDGE BASE INFORMATION ===\n"
            for i, result in enumerate(kb_results[:10], 1):
                content = result['content'][:500] + "..." if len(result['content']) > 500 else result['content']
                prompt += f"\n{i}. {content}\n"
        
        # Add user context
        if user_context:
            prompt += f"\n\n=== USER CONTEXT ===\n{json.dumps(user_context, indent=2)}\n"
        
        # Add additional context
        if additional_context:
            prompt += f"\n\n=== ADDITIONAL CONTEXT ===\n{additional_context}\n"
        
        return prompt
