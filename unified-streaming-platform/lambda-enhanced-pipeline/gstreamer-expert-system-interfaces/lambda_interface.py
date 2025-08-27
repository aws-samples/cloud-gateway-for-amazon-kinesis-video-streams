#!/usr/bin/env python3
"""
Lambda Interface Adapter
Provides AWS Lambda interface for the GStreamer Expert Core
"""

import json
import logging
from typing import Dict, List, Any, Optional

# Import the core implementation
import sys
import os
sys.path.append('/var/task/gstreamer-expert-system/core')
from gstreamer_expert_core import GStreamerExpertCore

logger = logging.getLogger(__name__)

class LambdaInterface:
    """Lambda function interface adapter for GStreamer Expert Core"""
    
    def __init__(self, kb_id: str = None, claude_model: str = None):
        """Initialize Lambda interface with core expert system"""
        # Use environment variables or defaults
        kb_id = kb_id or os.environ.get('KNOWLEDGE_BASE_ID', '5CGJIOV1QM')
        claude_model = claude_model or os.environ.get('CLAUDE_MODEL', 'us.anthropic.claude-opus-4-1-20250805-v1:0')
        
        self.core = GStreamerExpertCore(kb_id, claude_model)
        logger.info("Lambda Interface initialized with GStreamer Expert Core")

    async def handle_request(self, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        """
        Handle Lambda request by routing to appropriate core method
        
        Args:
            event: Lambda event containing request data
            context: Lambda context (unused)
            
        Returns:
            Lambda response dictionary
        """
        # CORS headers
        cors_headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Content-Type': 'application/json'
        }
        
        # Handle preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }
        
        try:
            # Parse request
            body = json.loads(event.get('body', '{}'))
            path = event.get('path', '')
            
            # Route based on path and determine tool/method
            tool_name, arguments = self._route_request(path, body)
            
            if not tool_name:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Invalid request path or missing parameters'})
                }
            
            # Execute the appropriate core method
            result = await self._execute_tool(tool_name, arguments)
            
            # Format response
            response_body = {
                'tool': tool_name,
                'arguments': arguments,
                'result': result,
                'success': 'error' not in result
            }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(response_body)
            }
            
        except Exception as e:
            logger.error(f"Lambda request handling failed: {e}")
            return {
                'statusCode': 500,
                'headers': cors_headers,
                'body': json.dumps({'error': f'Internal server error: {str(e)}'})
            }

    def _route_request(self, path: str, body: Dict[str, Any]) -> tuple[Optional[str], Optional[Dict[str, Any]]]:
        """
        Route request to appropriate tool based on path and body
        
        Args:
            path: Request path
            body: Request body
            
        Returns:
            Tuple of (tool_name, arguments) or (None, None) if invalid
        """
        
        # Extract mode from body or path
        mode = body.get('mode', '')
        
        # Route based on path
        if '/search-elements' in path or mode == 'search-elements':
            query = body.get('query')
            if not query:
                return None, None
            return 'search_gstreamer_elements', {
                'query': query,
                'category': body.get('category', 'all')
            }
        
        elif '/get-documentation' in path or mode == 'get-documentation':
            element_name = body.get('element_name')
            if not element_name:
                return None, None
            return 'get_element_documentation', {
                'element_name': element_name
            }
        
        elif '/search-patterns' in path or mode == 'search-patterns':
            scenario = body.get('scenario')
            if not scenario:
                return None, None
            return 'search_pipeline_patterns', {
                'scenario': scenario,
                'source_type': body.get('source_type', ''),
                'dest_type': body.get('dest_type', '')
            }
        
        elif '/troubleshoot' in path or mode == 'troubleshooting':
            pipeline = body.get('pipeline')
            symptoms = body.get('symptoms') or body.get('issue', '')
            if not pipeline or not symptoms:
                return None, None
            return 'troubleshoot_pipeline_issues', {
                'pipeline': pipeline,
                'symptoms': symptoms,
                'error_logs': body.get('error_logs', '')
            }
        
        elif '/optimize' in path or mode == 'optimization':
            pipeline = body.get('pipeline')
            goals = body.get('goals', 'performance and quality')
            if not pipeline:
                return None, None
            return 'optimize_pipeline_performance', {
                'pipeline': pipeline,
                'goals': goals,
                'platform': body.get('platform', 'linux')
            }
        
        elif '/validate' in path or mode == 'validation':
            pipeline = body.get('pipeline')
            if not pipeline:
                return None, None
            return 'validate_pipeline_compatibility', {
                'pipeline': pipeline,
                'target_platform': body.get('target_platform', 'linux')
            }
        
        elif '/expert' in path or mode == 'expert':
            query = body.get('query')
            if not query:
                return None, None
            return 'gstreamer_expert', {
                'query': query,
                'context': body.get('context')
            }
        
        elif '/generate-pipeline' in path or mode == 'pipeline':
            # Enhanced pipeline generation using expert system
            rtsp_url = body.get('rtsp_url')
            if not rtsp_url:
                return None, None
            
            # Build query for pipeline generation
            query = f"Generate optimized GStreamer pipeline for RTSP stream: {rtsp_url}"
            
            # Add additional context from body
            context = {}
            if body.get('stream_analysis'):
                context['stream_analysis'] = body['stream_analysis']
            if body.get('platform'):
                context['platform'] = body['platform']
            if body.get('optimization_goals'):
                context['optimization_goals'] = body['optimization_goals']
            
            return 'gstreamer_expert', {
                'query': query,
                'context': context
            }
        
        else:
            # Default to expert mode if no specific path matches
            query = body.get('query') or body.get('rtsp_url')
            if query:
                return 'gstreamer_expert', {
                    'query': query,
                    'context': body.get('context')
                }
        
        return None, None

    async def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute the specified tool with arguments
        
        Args:
            tool_name: Name of the tool to execute
            arguments: Tool arguments
            
        Returns:
            Tool execution result
        """
        try:
            if tool_name == 'search_gstreamer_elements':
                return await self.core.search_gstreamer_elements(
                    arguments['query'],
                    arguments.get('category', 'all')
                )
            
            elif tool_name == 'get_element_documentation':
                return await self.core.get_element_documentation(
                    arguments['element_name']
                )
            
            elif tool_name == 'search_pipeline_patterns':
                return await self.core.search_pipeline_patterns(
                    arguments['scenario'],
                    arguments.get('source_type', ''),
                    arguments.get('dest_type', '')
                )
            
            elif tool_name == 'troubleshoot_pipeline_issues':
                return await self.core.troubleshoot_pipeline_issues(
                    arguments['pipeline'],
                    arguments['symptoms'],
                    arguments.get('error_logs', '')
                )
            
            elif tool_name == 'optimize_pipeline_performance':
                return await self.core.optimize_pipeline_performance(
                    arguments['pipeline'],
                    arguments['goals'],
                    arguments.get('platform', 'linux')
                )
            
            elif tool_name == 'validate_pipeline_compatibility':
                return await self.core.validate_pipeline_compatibility(
                    arguments['pipeline'],
                    arguments.get('target_platform', 'linux')
                )
            
            elif tool_name == 'gstreamer_expert':
                return await self.core.gstreamer_expert(
                    arguments['query'],
                    arguments.get('context')
                )
            
            else:
                return {'error': f'Unknown tool: {tool_name}'}
                
        except Exception as e:
            logger.error(f"Tool execution failed for {tool_name}: {e}")
            return {'error': f'Tool execution failed: {str(e)}'}

    # Convenience methods for specific use cases
    
    async def generate_enhanced_pipeline(self, rtsp_url: str, stream_info: Optional[Dict] = None, 
                                       platform: str = 'linux', goals: str = 'quality and performance') -> Dict[str, Any]:
        """
        Generate enhanced pipeline using expert system
        
        Args:
            rtsp_url: RTSP stream URL
            stream_info: Optional stream analysis information
            platform: Target platform
            goals: Optimization goals
            
        Returns:
            Enhanced pipeline generation result
        """
        query = f"Generate optimized GStreamer pipeline for RTSP stream: {rtsp_url}"
        
        context = {
            'platform': platform,
            'optimization_goals': goals
        }
        
        if stream_info:
            context['stream_analysis'] = stream_info
        
        return await self.core.gstreamer_expert(query, context)

    async def analyze_context_for_lambda(self, user_input: str, stream_info: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze context for Lambda pipeline generation (backward compatibility)
        
        Args:
            user_input: User input string
            stream_info: Optional stream information
            
        Returns:
            Context analysis result
        """
        return self.core.analyze_context(user_input, stream_info)

# Global instance for Lambda handler
_lambda_interface = None

def get_lambda_interface() -> LambdaInterface:
    """Get or create the global Lambda interface instance"""
    global _lambda_interface
    if _lambda_interface is None:
        _lambda_interface = LambdaInterface()
    return _lambda_interface

# Lambda handler function
def lambda_handler(event, context):
    """
    AWS Lambda handler function
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        Lambda response
    """
    import asyncio
    
    # Get interface instance
    interface = get_lambda_interface()
    
    # Run async handler
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    try:
        return loop.run_until_complete(interface.handle_request(event, context))
    finally:
        loop.close()
