#!/bin/bash

# Enhanced GStreamer Expert MCP Server Startup Script
# Activates virtual environment and starts the complete multi-tool server

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Activate virtual environment
source "$SCRIPT_DIR/venv/bin/activate"

# Set AWS environment variables
export AWS_PROFILE="${AWS_PROFILE:-malone-aws}"
export AWS_REGION="${AWS_REGION:-us-east-1}"

# Start the enhanced multi-tool server
exec python3 "$SCRIPT_DIR/complete_multi_tool_server.py"
