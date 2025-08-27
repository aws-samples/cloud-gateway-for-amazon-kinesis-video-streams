#!/bin/bash

# GStreamer Knowledge Base Content Creator
# Creates new documents with proper structure and naming

set -e

echo "🎯 GStreamer Knowledge Base Content Creator"
echo "============================================"
echo ""

# Get content type
echo "Content types:"
echo "  1. element     - GStreamer element documentation"
echo "  2. pattern     - Service integration pattern"
echo "  3. guide       - Platform-specific guide"
echo "  4. example     - Working pipeline example"
echo "  5. troubleshoot - Problem solution"
echo ""

read -p "Select content type (1-5): " type_num

case $type_num in
  1)
    type="element"
    dir="elements"
    echo "📦 Creating element documentation"
    ;;
  2)
    type="pattern"
    dir="integration-patterns"
    echo "🔗 Creating integration pattern"
    ;;
  3)
    type="guide"
    dir="platform-guides"
    echo "🖥️ Creating platform guide"
    ;;
  4)
    type="example"
    dir="working-examples"
    echo "⚡ Creating working example"
    ;;
  5)
    type="troubleshoot"
    dir="troubleshooting"
    echo "🔧 Creating troubleshooting guide"
    ;;
  *)
    echo "❌ Invalid selection"
    exit 1
    ;;
esac

echo ""
read -p "Content name (e.g., nvh264enc, kvs-auth, linux-optimization): " name

# Validate name
if [[ -z "$name" ]]; then
    echo "❌ Name cannot be empty"
    exit 1
fi

# Create filename based on type
case $type in
  "element")
    filename="${name}.md"
    ;;
  "pattern")
    filename="${name}.md"
    ;;
  "guide")
    filename="${name}.md"
    ;;
  "example")
    filename="${name}.pipeline.md"
    ;;
  "troubleshoot")
    filename="${name}.md"
    ;;
esac

# Create directory structure
mkdir -p "gstreamer-kb/${dir}"

# Create document with appropriate template
case $type in
  "element")
    cat > "gstreamer-kb/${dir}/${filename}" << 'EOF'
# ElementName

**Category:** [Sources/Sinks/Encoders/Decoders/Filters/Muxers/Demuxers/Parsers]
**Plugin:** plugin-name
**Rank:** [None/Marginal/Secondary/Primary]
**Since:** GStreamer X.Y

## Description
Brief description of what this element does and when to use it.

## Properties
- **property-name** (type): Description (default: value)
- **another-property** (type): Description (default: value)

## Pad Templates
**Sink:** format specifications
**Source:** format specifications

## Usage Examples

### Basic Usage
```bash
gst-launch-1.0 [basic working example]
```

### Advanced Usage
```bash
gst-launch-1.0 [more complex example with explanation]
```

## Platform Considerations
- **Linux**: Requirements and notes
- **macOS**: Requirements and notes
- **Windows**: Requirements and notes

## Performance Tips
- Optimization recommendations
- Hardware acceleration notes
- Memory/CPU considerations

## Common Issues
- **Problem**: Solution and explanation
- **Another Problem**: Solution and explanation

## Related Elements
- **element-name**: How it relates to this element
- **another-element**: How it relates to this element
EOF
    ;;
    
  "pattern")
    cat > "gstreamer-kb/${dir}/${filename}" << 'EOF'
# Service Integration Pattern

**Service:** Service/Library Name
**Category:** [Authentication/Streaming/Processing/Storage]
**Complexity:** [Basic/Intermediate/Advanced]

## Description
What this integration accomplishes and when to use it.

## Prerequisites
- Required services/accounts
- Dependencies and versions
- Platform requirements

## Configuration

### Service Setup
Steps to configure the external service.

### GStreamer Setup
Required plugins and elements.

## Implementation

### Basic Integration
```bash
gst-launch-1.0 [basic integration example]
```

### Advanced Integration
```bash
gst-launch-1.0 [complex integration with error handling]
```

## Authentication
How to handle credentials and authentication.

## Error Handling
Common errors and solutions.

## Performance Considerations
Optimization tips and best practices.

## Security Notes
Security considerations and best practices.

## Related Patterns
- **pattern-name**: How it relates
- **another-pattern**: How it relates
EOF
    ;;
    
  "guide")
    cat > "gstreamer-kb/${dir}/${filename}" << 'EOF'
# Platform-Specific Guide

**Platform:** [Linux/macOS/Windows/Cross-Platform]
**Topic:** [Hardware Acceleration/Audio/Video/Networking]
**Difficulty:** [Beginner/Intermediate/Advanced]

## Overview
What this guide covers and who should use it.

## Prerequisites
- System requirements
- Software dependencies
- Hardware requirements

## Setup Instructions

### Installation
Platform-specific installation steps.

### Configuration
Required configuration changes.

## Optimization Techniques

### Performance Optimizations
Specific optimizations for this platform.

### Hardware Acceleration
How to enable and use hardware acceleration.

## Common Issues

### Issue 1
- **Problem**: Description
- **Cause**: Why it happens
- **Solution**: Step-by-step fix

### Issue 2
- **Problem**: Description
- **Cause**: Why it happens
- **Solution**: Step-by-step fix

## Best Practices
Platform-specific recommendations.

## Testing and Validation
How to verify everything is working correctly.

## Related Guides
- **guide-name**: How it relates
- **another-guide**: How it relates
EOF
    ;;
    
  "example")
    cat > "gstreamer-kb/${dir}/${filename}" << 'EOF'
# Pipeline Example: Descriptive Name

**Use Case:** What this pipeline accomplishes
**Complexity:** [Basic/Intermediate/Advanced]
**Platform:** [Linux/macOS/Windows/Cross-Platform]

## Overview
Description of what this pipeline does and when to use it.

## Prerequisites
- Required elements/plugins
- Hardware requirements
- Input/output requirements

## Pipeline Breakdown

### Complete Pipeline
```bash
gst-launch-1.0 \
  source-element ! \
  processing-element ! \
  sink-element
```

### Element Explanation
- **source-element**: What it does and why
- **processing-element**: What it does and why
- **sink-element**: What it does and why

## Variations

### Variation 1: Different Input
```bash
gst-launch-1.0 [modified pipeline for different input]
```

### Variation 2: Different Output
```bash
gst-launch-1.0 [modified pipeline for different output]
```

## Performance Tuning
- Buffer sizes and queue configurations
- Hardware acceleration options
- CPU/memory optimization tips

## Troubleshooting
- Common errors and solutions
- Debugging techniques
- Performance issues

## Related Examples
- **example-name**: How it relates
- **another-example**: How it relates
EOF
    ;;
    
  "troubleshoot")
    cat > "gstreamer-kb/${dir}/${filename}" << 'EOF'
# Troubleshooting: Issue Name

**Category:** [Pipeline/Element/Performance/Platform]
**Severity:** [Low/Medium/High/Critical]
**Frequency:** [Common/Occasional/Rare]

## Problem Description
Clear description of the issue and symptoms.

## Symptoms
- What users see or experience
- Error messages
- Behavior patterns

## Root Causes
- Primary cause
- Secondary causes
- Contributing factors

## Diagnostic Steps

### Step 1: Initial Check
```bash
# Commands to run for initial diagnosis
```

### Step 2: Detailed Analysis
```bash
# More detailed diagnostic commands
```

## Solutions

### Solution 1: Primary Fix
```bash
# Commands or configuration changes
```
Explanation of why this works.

### Solution 2: Alternative Fix
```bash
# Alternative approach
```
When to use this approach.

## Prevention
How to avoid this issue in the future.

## Related Issues
- **issue-name**: How it relates
- **another-issue**: How it relates

## Additional Resources
- Links to relevant documentation
- Related troubleshooting guides
EOF
    ;;
esac

echo ""
echo "✅ Created: gstreamer-kb/${dir}/${filename}"
echo ""
echo "Next steps:"
echo "1. Edit the file: nano gstreamer-kb/${dir}/${filename}"
echo "2. Test all examples thoroughly"
echo "3. Upload to knowledge base: ./upload-to-kb.sh ${dir}/${filename}"
echo ""
echo "📝 Remember to:"
echo "   - Replace placeholder text with actual content"
echo "   - Test all commands and examples"
echo "   - Follow the naming conventions"
echo "   - Include platform-specific information"
echo ""
