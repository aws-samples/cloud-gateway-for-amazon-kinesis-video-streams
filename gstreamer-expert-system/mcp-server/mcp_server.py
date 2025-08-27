#!/usr/bin/env python3
"""
GStreamer Expert MCP Server
Uses the refactored core implementation for consistent functionality
"""

import asyncio
import logging
import sys
import os

# Add interfaces directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'interfaces'))
from mcp_interface import run_mcp_server

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

async def main():
    """Main entry point for the MCP server"""
    logger.info("🚀 Starting Enhanced GStreamer Expert MCP Server")
    logger.info("📚 Using refactored core with 324-document knowledge base")
    logger.info("🧠 Claude Opus 4.1 integration active")
    
    try:
        # Run the MCP server with default configuration
        await run_mcp_server()
    except KeyboardInterrupt:
        logger.info("👋 MCP Server stopped by user")
    except Exception as e:
        logger.error(f"❌ MCP Server error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
