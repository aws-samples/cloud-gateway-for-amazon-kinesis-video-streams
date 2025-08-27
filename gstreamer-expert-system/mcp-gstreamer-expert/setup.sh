#!/bin/bash

# Setup script for GStreamer Expert MCP Server

echo "🔧 Setting up GStreamer Expert MCP Server..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Make server executable
chmod +x server_final.py

echo "✅ Setup complete!"
echo ""
echo "To run the MCP server:"
echo "  source venv/bin/activate"
echo "  python server_final.py"
echo ""
echo "To add to Amazon Q CLI configuration:"
echo "  Add the following to your MCP configuration:"
echo "  {"
echo "    \"command\": \"$(pwd)/venv/bin/python\","
echo "    \"args\": [\"$(pwd)/server_final.py\"],"
echo "    \"env\": {"
echo "      \"AWS_PROFILE\": \"malone-aws\""
echo "    }"
echo "  }"
