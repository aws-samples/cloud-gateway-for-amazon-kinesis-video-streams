#!/usr/bin/env python3
"""
Enhanced GStreamer Pipeline Generator Lambda Function
Uses refactored core implementation for consistent functionality
"""

import json
import logging
import os
import sys
from typing import Dict, Any, Optional

# Import RTSP analysis module
from rtsp_analysis import analyze_rtsp_stream

# Import the refactored GStreamer expert core
sys.path.append('/opt/gstreamer-expert-system/interfaces')
from lambda_interface import LambdaInterface

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

logger.info("🚀 Enhanced GStreamer Pipeline Generator Lambda initialized")
logger.info("🧠 Using refactored core with identical MCP functionality")

# Global interface instance
expert_interface = None

def get_expert_interface() -> LambdaInterface:
    """Get or create the expert interface instance"""
    global expert_interface
    if expert_interface is None:
        expert_interface = LambdaInterface()
    return expert_interface

def lambda_handler(event, context):
    """Enhanced Lambda handler using refactored core for consistent functionality"""
    
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
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        path = event.get('path', '')
        
        # Handle RTSP characteristics analysis (maintains backward compatibility)
        if '/characteristics' in path or body.get('mode') == 'characteristics':
            rtsp_url = body.get('rtsp_url')
            if not rtsp_url:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'rtsp_url is required for characteristics analysis'})
                }
            
            capture_frame = body.get('capture_frame', False)
            logger.info(f"Analyzing RTSP stream: {rtsp_url}")
            
            # Use RTSP analysis module
            stream_info = analyze_rtsp_stream(rtsp_url, capture_frame)
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({
                    'stream_characteristics': stream_info,
                    'mode': 'characteristics',
                    'enhanced': True
                })
            }
        
        # For all other requests, use the refactored expert interface
        else:
            expert_interface = get_expert_interface()
            
            # Handle the request using the refactored interface
            response = await expert_interface.handle_request(event, context)
            
            # The interface already handles CORS and formatting
            return response
    
    except Exception as e:
        logger.error(f"Lambda execution error: {e}")
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
