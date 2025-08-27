#!/usr/bin/env python3
"""
Enhanced GStreamer Expert Lambda Handler
Uses the refactored core implementation for consistent functionality with MCP server
"""

import json
import logging
import sys
import os

# Add interfaces directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'interfaces'))
from lambda_interface import lambda_handler as core_lambda_handler

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    AWS Lambda handler function using refactored core
    
    This handler provides identical functionality to the MCP server
    by using the same core implementation through the Lambda interface adapter.
    
    Args:
        event: Lambda event containing request data
        context: Lambda context
        
    Returns:
        Lambda response with CORS headers and JSON body
    """
    
    logger.info("🚀 Enhanced GStreamer Expert Lambda Handler")
    logger.info(f"📚 Knowledge Base: {os.environ.get('KNOWLEDGE_BASE_ID', '5CGJIOV1QM')}")
    logger.info(f"🧠 Model: {os.environ.get('CLAUDE_MODEL', 'Claude Opus 4.1')}")
    
    # Log request details
    method = event.get('httpMethod', 'UNKNOWN')
    path = event.get('path', 'UNKNOWN')
    logger.info(f"📡 Request: {method} {path}")
    
    try:
        # Use the core Lambda handler from the interface
        response = core_lambda_handler(event, context)
        
        # Log response status
        status_code = response.get('statusCode', 500)
        logger.info(f"✅ Response: {status_code}")
        
        return response
        
    except Exception as e:
        logger.error(f"❌ Lambda handler error: {e}")
        
        # Return error response with CORS headers
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': f'Lambda handler error: {str(e)}',
                'handler': 'enhanced-gstreamer-expert'
            })
        }
