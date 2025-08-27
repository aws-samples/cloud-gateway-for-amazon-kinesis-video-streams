# GStreamer Knowledge Base Management Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [When to Add Content](#when-to-add-content)
4. [Content Quality Standards](#content-quality-standards)
5. [Document Format Guidelines](#document-format-guidelines)
6. [Content Categories](#content-categories)
7. [Review Process](#review-process)
8. [Maintenance Procedures](#maintenance-procedures)
9. [Examples](#examples)

## 🎯 Overview

This knowledge base serves as the authoritative source for GStreamer expertise, powering AI-assisted development and troubleshooting. Quality and organization are paramount for effective AI responses.

### Core Principles
- **Precision over Volume**: Better to have fewer high-quality documents than many mediocre ones
- **Practical Focus**: Prioritize content that solves real-world problems
- **Current Information**: Keep content up-to-date with modern GStreamer versions (1.18+)
- **Clear Organization**: Maintain logical structure for easy navigation and AI retrieval

## 📁 Directory Structure

```
gstreamer-kb/
├── elements/                   # GStreamer element documentation
├── integration-patterns/       # Service integration guides (AWS, OpenVINO, etc.)
├── platform-guides/           # Platform-specific optimization guides
├── working-examples/          # Complete, tested pipeline examples
└── troubleshooting/           # Common issues and solutions
```

## ⚡ When to Add Content

### ✅ **ADD Content When:**
- **New GStreamer elements** are released or discovered
- **Integration patterns** for popular services are developed
- **Platform-specific optimizations** are identified
- **Common problems** arise repeatedly in support
- **Working examples** demonstrate important concepts
- **Performance improvements** are discovered
- **Hardware acceleration** methods are validated

### ❌ **DON'T ADD Content When:**
- Information is **already covered** adequately
- Content is **deprecated** or for old GStreamer versions (<1.18)
- Documentation is **incomplete** or untested
- Information is **too generic** (available in official docs)
- Content is **vendor-specific** without broad applicability
- Examples **don't work** or are theoretical only

## 🏆 Content Quality Standards

### High-Quality Documents Include:
- **Clear, specific titles** that indicate exact purpose
- **Tested, working examples** with actual commands/code
- **Platform compatibility** information
- **Version requirements** (GStreamer, dependencies)
- **Performance considerations** and optimization tips
- **Common pitfalls** and troubleshooting
- **Related elements/concepts** for context

### Low-Quality Documents Have:
- Vague or generic titles
- Untested or theoretical examples
- Missing version/platform information
- Outdated information
- Duplicate content
- No practical value
- Poor formatting or unclear writing

## 📝 Document Format Guidelines

### Standard Template Structure:
```markdown
# Element/Topic Name

**Category:** [Sources/Sinks/Encoders/Decoders/etc.]
**Plugin:** [plugin-name]
**Rank:** [None/Marginal/Secondary/Primary]
**Since:** [GStreamer version]

## Description
Brief, clear description of purpose and functionality.

## Properties
- **property-name** (type): Description (default: value)
- **another-property** (type): Description

## Pad Templates
**Sink:** format specifications
**Source:** format specifications

## Usage Examples

### Basic Usage
```bash
gst-launch-1.0 [working example]
```

### Advanced Usage
```bash
gst-launch-1.0 [complex example with explanation]
```

## Platform Considerations
- **Linux**: Specific notes
- **macOS**: Specific notes  
- **Windows**: Specific notes

## Performance Tips
- Optimization recommendations
- Hardware acceleration notes
- Memory/CPU considerations

## Common Issues
- Problem: Solution
- Problem: Solution

## Related Elements
- element1: relationship
- element2: relationship
```

### Naming Conventions:
- **Elements**: `elementname.md` (lowercase)
- **Integration Patterns**: `service-pattern-name.md` (kebab-case)
- **Platform Guides**: `platform-topic-guide.md` (kebab-case)
- **Working Examples**: `descriptive-name.pipeline.md` (kebab-case + .pipeline)
- **Troubleshooting**: `issue-description.md` (kebab-case)

## 📂 Content Categories

### 1. Elements (`elements/`)
**Purpose**: Document individual GStreamer elements
**Criteria**: 
- Element must be available in GStreamer 1.18+
- Must have practical use cases
- Should include working examples

**Examples**: `kvssink.md`, `nvh264enc.md`, `queue.md`

### 2. Integration Patterns (`integration-patterns/`)
**Purpose**: Document how to integrate GStreamer with external services
**Criteria**:
- Must be for widely-used services (AWS, OpenVINO, etc.)
- Should include authentication/configuration
- Must have complete working examples

**Examples**: `kvs-authentication.md`, `openvino-inference-pipeline.md`

### 3. Platform Guides (`platform-guides/`)
**Purpose**: Platform-specific optimization and setup guides
**Criteria**:
- Must be platform-specific (not generic)
- Should include performance optimizations
- Must cover common platform issues

**Examples**: `linux-hardware-acceleration.md`, `macos-camera-access.md`

### 4. Working Examples (`working-examples/`)
**Purpose**: Complete, tested pipeline examples
**Criteria**:
- Must be fully functional and tested
- Should demonstrate important concepts
- Must include explanation of each component

**Examples**: `webcam-to-rtmp.pipeline.md`, `file-transcoding.pipeline.md`

### 5. Troubleshooting (`troubleshooting/`)
**Purpose**: Solutions to common problems
**Criteria**:
- Must address frequently encountered issues
- Should provide step-by-step solutions
- Must include diagnostic steps

**Examples**: `format-negotiation-failed.md`, `memory-leaks.md`

## 🔍 Review Process

### Before Adding Content:
1. **Search existing content** to avoid duplication
2. **Test all examples** on target platforms
3. **Verify current information** (check GStreamer version compatibility)
4. **Review format** against template
5. **Check file naming** follows conventions

### Quality Checklist:
- [ ] Title clearly indicates content purpose
- [ ] All examples are tested and working
- [ ] Platform compatibility is specified
- [ ] Version requirements are listed
- [ ] Related elements/concepts are mentioned
- [ ] Common issues are addressed
- [ ] Format follows template structure
- [ ] File is placed in correct directory
- [ ] Filename follows naming conventions

## 🔧 Maintenance Procedures

### Regular Maintenance Tasks:

#### Monthly Review:
- Check for deprecated elements or methods
- Update version compatibility information
- Review and update performance recommendations
- Validate external links and references

#### Quarterly Cleanup:
- Remove outdated content
- Consolidate duplicate information
- Update examples for new GStreamer versions
- Review and improve document organization

#### Annual Overhaul:
- Major restructuring if needed
- Comprehensive content audit
- Performance optimization review
- Platform support updates

### Content Lifecycle:
1. **Creation**: New content added following guidelines
2. **Validation**: Content tested and reviewed
3. **Maintenance**: Regular updates and improvements
4. **Deprecation**: Mark outdated content for removal
5. **Removal**: Delete obsolete or redundant content

## 📚 Examples

### ✅ Good Document Example:
```markdown
# nvh264enc

**Category:** Encoders
**Plugin:** nvcodec
**Rank:** Primary
**Since:** GStreamer 1.18

## Description
Hardware-accelerated H.264 encoder using NVIDIA NVENC. Provides high-performance encoding with minimal CPU usage on systems with compatible NVIDIA GPUs.

## Properties
- **bitrate** (uint): Target bitrate in kbps (default: 2048)
- **preset** (enum): Encoding preset (default: medium)
  - ultrafast, superfast, veryfast, faster, fast, medium, slow, slower, veryslow

## Usage Examples

### Basic Encoding
```bash
gst-launch-1.0 videotestsrc ! nvh264enc bitrate=4000 ! h264parse ! mp4mux ! filesink location=output.mp4
```

### Webcam Encoding
```bash
gst-launch-1.0 v4l2src device=/dev/video0 ! videoconvert ! nvh264enc preset=fast ! h264parse ! rtmpsink location=rtmp://server/stream
```

## Platform Considerations
- **Linux**: Requires NVIDIA drivers 470+ and CUDA toolkit
- **Windows**: Requires NVIDIA drivers and proper PATH configuration

## Performance Tips
- Use 'fast' or 'faster' presets for real-time encoding
- Monitor GPU memory usage with nvidia-smi
- Consider B-frame settings for quality vs latency trade-offs

## Common Issues
- "No NVENC capable devices found": Check NVIDIA driver version
- High latency: Use faster presets or reduce B-frames

## Related Elements
- nvh265enc: HEVC encoding alternative
- nvdec: NVIDIA hardware decoder
- h264parse: Required for proper stream formatting
```

### ❌ Poor Document Example:
```markdown
# Video Encoder

This encoder encodes video.

## Usage
```bash
gst-launch-1.0 videotestsrc ! encoder ! filesink location=out.mp4
```

It works on Linux and maybe other platforms.
```

### Document Quality Comparison:

| Aspect | Good Example | Poor Example |
|--------|-------------|--------------|
| **Title** | Specific element name | Generic description |
| **Metadata** | Complete plugin info | Missing details |
| **Examples** | Tested, complete commands | Incomplete, untested |
| **Platform Info** | Specific requirements | Vague statements |
| **Troubleshooting** | Common issues + solutions | No troubleshooting |
| **Context** | Related elements listed | No context provided |

## 🚀 Getting Started

### Adding Your First Document:
1. Identify content gap or new element to document
2. Choose appropriate directory based on content type
3. Create document following template structure
4. Test all examples thoroughly
5. Review against quality checklist
6. Place in correct directory with proper filename
7. Update knowledge base via S3 sync

### Tools and Resources:
- **GStreamer Documentation**: https://gstreamer.freedesktop.org/documentation/
- **Element Inspector**: `gst-inspect-1.0 elementname`
- **Pipeline Testing**: `gst-launch-1.0` with various inputs
- **Platform Testing**: Test on target platforms before adding

## 📞 Support and Questions

For questions about knowledge base management:
1. Review this guide thoroughly
2. Check existing content for similar examples
3. Test your content before submission
4. Follow the established patterns and formats

Remember: Quality over quantity. A single well-documented, tested example is worth more than ten incomplete ones.
