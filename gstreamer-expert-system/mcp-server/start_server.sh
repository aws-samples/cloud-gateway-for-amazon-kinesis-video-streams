#!/bin/bash

# Enhanced GStreamer Expert MCP Server Startup Script
# Uses refactored core implementation

set -e

echo "🚀 Starting Enhanced GStreamer Expert MCP Server"
echo "================================================"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if virtual environment exists (try both possible locations)
VENV_PATH="$PROJECT_ROOT/mcp-gstreamer-expert/venv"
if [ ! -d "$VENV_PATH" ]; then
    # Try alternative location for integrated project
    VENV_PATH="$PROJECT_ROOT/venv"
    if [ ! -d "$VENV_PATH" ]; then
        echo "❌ Virtual environment not found"
        echo "Tried locations:"
        echo "  - $PROJECT_ROOT/mcp-gstreamer-expert/venv"
        echo "  - $PROJECT_ROOT/venv"
        echo "Please run the setup script first"
        exit 1
    fi
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Set Python path to include core modules
export PYTHONPATH="$PROJECT_ROOT/core:$PROJECT_ROOT/interfaces:$PYTHONPATH"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "⚠️  Warning: AWS credentials not configured"
    echo "The server will start but may not function properly without AWS access"
fi

# Start the MCP server
echo "🎯 Starting MCP server with refactored core..."
echo "📚 Knowledge Base: 5CGJIOV1QM (324 documents)"
echo "🧠 Model: Claude Opus 4.1"
echo ""

cd "$SCRIPT_DIR"
python3 mcp_server.py
