#!/usr/bin/env python3
"""
MCP Interface Adapter
Provides MCP server interface for the GStreamer Expert Core
"""

import asyncio
import logging
from typing import Dict, List, Any
from mcp.server import Server
from mcp.types import Tool, TextContent

# Import the core implementation
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'core'))
from gstreamer_expert_core import GStreamerExpertCore

logger = logging.getLogger(__name__)

class MCPInterface:
    """MCP server interface adapter for GStreamer Expert Core"""
    
    def __init__(self, kb_id: str = '5CGJIOV1QM', claude_model: str = 'us.anthropic.claude-opus-4-1-20250805-v1:0'):
        """Initialize MCP interface with core expert system"""
        self.core = GStreamerExpertCore(kb_id, claude_model)
        self.server = Server("gstreamer-expert")
        
        # Register MCP server handlers
        self._register_handlers()
        
        logger.info("MCP Interface initialized with GStreamer Expert Core")

    def _register_handlers(self):
        """Register MCP server handlers"""
        
        @self.server.list_tools()
        async def list_tools() -> List[Tool]:
            """List all available tools"""
            return [
                Tool(
                    name="search_gstreamer_elements",
                    description="Search for GStreamer elements by capability, name, or use case",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Search query for elements"},
                            "category": {"type": "string", "description": "Element category filter", "default": "all"}
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="get_element_documentation", 
                    description="Get detailed documentation for a specific GStreamer element",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "element_name": {"type": "string", "description": "Name of the GStreamer element"}
                        },
                        "required": ["element_name"]
                    }
                ),
                Tool(
                    name="search_pipeline_patterns",
                    description="Search for tested, working GStreamer pipeline patterns",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "scenario": {"type": "string", "description": "Pipeline scenario"},
                            "source_type": {"type": "string", "description": "Source type (optional)", "default": ""},
                            "dest_type": {"type": "string", "description": "Destination type (optional)", "default": ""}
                        },
                        "required": ["scenario"]
                    }
                ),
                Tool(
                    name="troubleshoot_pipeline_issues",
                    description="Diagnose pipeline issues including quality problems, performance issues, and errors",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "pipeline": {"type": "string", "description": "The GStreamer pipeline experiencing issues"},
                            "symptoms": {"type": "string", "description": "Description of symptoms"},
                            "error_logs": {"type": "string", "description": "Any error messages (optional)", "default": ""}
                        },
                        "required": ["pipeline", "symptoms"]
                    }
                ),
                Tool(
                    name="optimize_pipeline_performance",
                    description="Optimize pipeline for performance, latency, and quality",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "pipeline": {"type": "string", "description": "The GStreamer pipeline to optimize"},
                            "goals": {"type": "string", "description": "Optimization goals"},
                            "platform": {"type": "string", "description": "Target platform", "default": "linux"}
                        },
                        "required": ["pipeline", "goals"]
                    }
                ),
                Tool(
                    name="validate_pipeline_compatibility",
                    description="Validate pipeline compatibility and suggest improvements",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "pipeline": {"type": "string", "description": "The GStreamer pipeline to validate"},
                            "target_platform": {"type": "string", "description": "Target platform", "default": "linux"}
                        },
                        "required": ["pipeline"]
                    }
                ),
                Tool(
                    name="gstreamer_expert",
                    description="Comprehensive GStreamer assistance with intelligent tool selection",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {"type": "string", "description": "Your GStreamer question or requirements"},
                            "context": {"type": "object", "description": "Additional context (optional)", "default": {}}
                        },
                        "required": ["query"]
                    }
                )
            ]

        @self.server.call_tool()
        async def call_tool(name: str, arguments: dict) -> List[TextContent]:
            """Handle tool calls by delegating to core implementation"""
            
            try:
                result = None
                
                if name == "search_gstreamer_elements":
                    result = await self.core.search_gstreamer_elements(
                        arguments["query"],
                        arguments.get("category", "all")
                    )
                
                elif name == "get_element_documentation":
                    result = await self.core.get_element_documentation(
                        arguments["element_name"]
                    )
                
                elif name == "search_pipeline_patterns":
                    result = await self.core.search_pipeline_patterns(
                        arguments["scenario"],
                        arguments.get("source_type", ""),
                        arguments.get("dest_type", "")
                    )
                
                elif name == "troubleshoot_pipeline_issues":
                    result = await self.core.troubleshoot_pipeline_issues(
                        arguments["pipeline"],
                        arguments["symptoms"],
                        arguments.get("error_logs", "")
                    )
                
                elif name == "optimize_pipeline_performance":
                    result = await self.core.optimize_pipeline_performance(
                        arguments["pipeline"],
                        arguments["goals"],
                        arguments.get("platform", "linux")
                    )
                
                elif name == "validate_pipeline_compatibility":
                    result = await self.core.validate_pipeline_compatibility(
                        arguments["pipeline"],
                        arguments.get("target_platform", "linux")
                    )
                
                elif name == "gstreamer_expert":
                    result = await self.core.gstreamer_expert(
                        arguments["query"],
                        arguments.get("context")
                    )
                
                else:
                    return [TextContent(type="text", text=f"Unknown tool: {name}")]
                
                # Format result for MCP response
                if result:
                    # Convert result to formatted text
                    formatted_result = self._format_result_for_mcp(name, result)
                    return [TextContent(type="text", text=formatted_result)]
                else:
                    return [TextContent(type="text", text=f"No result returned for {name}")]
                
            except Exception as e:
                logger.error(f"Tool execution failed for {name}: {e}")
                return [TextContent(type="text", text=f"Tool execution failed: {str(e)}")]

    def _format_result_for_mcp(self, tool_name: str, result: Dict[str, Any]) -> str:
        """Format core result for MCP text response"""
        
        if 'error' in result:
            return f"❌ **Error**: {result['error']}"
        
        if tool_name == "search_gstreamer_elements":
            if result.get('search_successful', False):
                formatted = f"🔍 **Element Search Results for '{result['query']}'**\n\n"
                formatted += f"Found {result['total_found']} elements:\n\n"
                
                for i, element in enumerate(result['elements'][:5], 1):
                    formatted += f"**{i}. {element['name']}** ({element['category']})\n"
                    formatted += f"   {element['description']}\n"
                    formatted += f"   Capabilities: {', '.join(element.get('capabilities', []))}\n\n"
                
                return formatted
            else:
                return f"❌ Element search failed: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "get_element_documentation":
            if result.get('found', False):
                return f"📚 **Documentation for '{result['element_name']}'**\n\n{result['documentation']}"
            else:
                return f"❌ Documentation not found: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "search_pipeline_patterns":
            if result.get('search_successful', False):
                formatted = f"🔧 **Pipeline Patterns for '{result['scenario']}'**\n\n"
                formatted += result['patterns_response']
                
                if result.get('extracted_patterns'):
                    formatted += "\n\n**Extracted Pipeline Examples:**\n"
                    for i, pattern in enumerate(result['extracted_patterns'][:3], 1):
                        formatted += f"\n{i}. `{pattern['pipeline']}`\n"
                
                return formatted
            else:
                return f"❌ Pattern search failed: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "troubleshoot_pipeline_issues":
            if result.get('troubleshooting_successful', False):
                formatted = f"🩺 **Troubleshooting Analysis**\n\n"
                formatted += f"**Pipeline**: `{result['pipeline']}`\n"
                formatted += f"**Issue Type**: {result['issue_analysis']['primary_issue']}\n"
                formatted += f"**Severity**: {result['issue_analysis']['severity']}\n\n"
                formatted += f"**Diagnosis & Solutions**:\n{result['diagnosis']}"
                
                if result.get('suggested_commands'):
                    formatted += "\n\n**Diagnostic Commands**:\n"
                    for cmd in result['suggested_commands']:
                        formatted += f"- `{cmd}`\n"
                
                return formatted
            else:
                return f"❌ Troubleshooting failed: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "optimize_pipeline_performance":
            if result.get('optimization_successful', False):
                formatted = f"⚡ **Pipeline Optimization**\n\n"
                formatted += f"**Original**: `{result['original_pipeline']}`\n"
                formatted += f"**Goals**: {result['optimization_goals']}\n"
                formatted += f"**Platform**: {result['target_platform']}\n\n"
                formatted += f"**Optimization Recommendations**:\n{result['optimization_response']}"
                return formatted
            else:
                return f"❌ Optimization failed: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "validate_pipeline_compatibility":
            if result.get('validation_successful', False):
                status = "✅ Compatible" if result.get('is_compatible', False) else "⚠️ Issues Found"
                formatted = f"🔍 **Pipeline Validation** - {status}\n\n"
                formatted += f"**Pipeline**: `{result['pipeline']}`\n"
                formatted += f"**Platform**: {result['target_platform']}\n\n"
                
                if result.get('compatibility_issues'):
                    formatted += "**Issues Found**:\n"
                    for issue in result['compatibility_issues']:
                        formatted += f"- {issue}\n"
                    formatted += "\n"
                
                formatted += f"**Validation Report**:\n{result['validation_response']}"
                return formatted
            else:
                return f"❌ Validation failed: {result.get('error', 'Unknown error')}"
        
        elif tool_name == "gstreamer_expert":
            formatted = f"🧠 **GStreamer Expert Analysis**\n\n"
            formatted += f"**Query**: {result['query']}\n\n"
            formatted += f"**Expert Response**:\n{result['response']}"
            
            if result.get('kb_sources'):
                formatted += f"\n\n*Based on {result['kb_sources']} knowledge base sources*"
            
            return formatted
        
        else:
            # Fallback: return JSON representation
            import json
            return f"**{tool_name} Result**:\n```json\n{json.dumps(result, indent=2)}\n```"

    async def run(self):
        """Run the MCP server"""
        from mcp.server.stdio import stdio_server
        
        logger.info("Starting GStreamer Expert MCP Server...")
        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream, 
                write_stream, 
                self.server.create_initialization_options()
            )

# Convenience function for running the MCP server
async def run_mcp_server(kb_id: str = '5CGJIOV1QM', claude_model: str = 'us.anthropic.claude-opus-4-1-20250805-v1:0'):
    """Run the MCP server with specified configuration"""
    interface = MCPInterface(kb_id, claude_model)
    await interface.run()
