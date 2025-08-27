# Cloud Gateway with GStreamer Expert System Project Rules

## Startup Behavior
🚀 **Project Configuration Loaded**: Unified Cloud Gateway with Enhanced GStreamer Expert System
- **Architecture**: Serverless cloud gateway with integrated GStreamer pipeline generation
- **GStreamer Expert**: Agent ID L60IDME1CM, Knowledge Base 5CGJIOV1QM (324 documents)
- **Enhanced Pipeline Generator**: API Gateway + Lambda with Docker container deployment
- **MCP Server**: gstreamer-expert-system/mcp-gstreamer-expert/complete_multi_tool_server.py
- **Lambda Function**: enhanced-pipeline-generator/lambda/enhanced_pipeline_generator.py
- **AWS Profile**: malone-aws
- **Region**: us-east-1

## Unified Architecture Overview

### Core Components
- **Cloud Gateway**: Original RTSP to KVS serverless architecture
- **GStreamer Expert System**: Comprehensive AI-powered GStreamer assistance (7 specialized tools)
- **Enhanced Pipeline Generator**: Unified system combining RTSP analysis, OpenCV frame extraction, and GStreamer expertise
- **Shared Core Implementation**: Consistent functionality across MCP and Lambda deployments

### Integration Points
- **API Gateway**: 7 specialized endpoints for GStreamer expertise
- **Lambda Functions**: Enhanced pipeline generation with expert system integration
- **Knowledge Base**: 324 curated GStreamer documents with Bedrock integration
- **Docker Containers**: Consistent deployment across local and cloud environments

## File Organization Rules

### Root Directory Structure
- **Root Directory**: Keep clean - essential scripts, README, integration summaries only
- **gstreamer-expert-system/**: Complete GStreamer expert system (migrated from bedrock-gstreamer)
- **enhanced-pipeline-generator/**: Unified serverless pipeline generation system
- **cdk-pipeline-generator/**: Original CDK-based pipeline generation
- **docker-images/**: Container definitions and build scripts
- **frontend-app/**: Web interface for cloud gateway
- **test-scripts/**: Integration and system testing
- **logs/**: System logs and debugging output

### GStreamer Expert System Structure
- **gstreamer-expert-system/current-config/**: Agent configuration, IAM policies, environment files
- **gstreamer-expert-system/knowledgebase/**: KB management scripts, content, reports
- **gstreamer-expert-system/mcp-gstreamer-expert/**: MCP server implementation with 7 tools
- **gstreamer-expert-system/accuracy-testing/**: Testing scripts, validation reports, analysis
- **gstreamer-expert-system/core/**: Shared core implementation for MCP and Lambda consistency

### Enhanced Pipeline Generator Structure
- **enhanced-pipeline-generator/cdk/**: CDK stack for serverless deployment
- **enhanced-pipeline-generator/lambda/**: Lambda function with expert system integration
- **enhanced-pipeline-generator/docker/**: Docker container for Lambda deployment
- **enhanced-pipeline-generator/interfaces/**: MCP and Lambda interface adapters

### Asset Placement Guidelines
- **Reports**: Place in appropriate component's testing directory
- **Configs**: Place in component-specific config directories
- **Scripts**: Place in appropriate component directory or test-scripts/ if system-wide
- **Documentation**: Place in component directories, maintain component-specific READMEs
- **Integration Assets**: Place in root only for system-wide integration (PHASE_7_INTEGRATION_SUMMARY.md)

### No Root Assets Rule
Do not create assets in the root directory unless specifically instructed. Exceptions:
- README.md (unified project overview)
- Setup scripts (system-wide deployment)
- Integration summaries (PHASE_7_INTEGRATION_SUMMARY.md)
- AWS setup documentation (AWS_SETUP.md)

## AWS Profile Management

### CLI Operations
- Use `malone-aws` profile for all AWS CLI commands
- Always include `--profile malone-aws` in CLI operations
- Applies to both original cloud gateway and GStreamer expert system operations

### Asset Creation
- Never hardcode AWS profile names in scripts or configuration files
- Use variables, parameters, or environment variables instead
- Keep assets generic and reusable across both systems
- Maintain consistency between MCP server and Lambda function configurations

## Git Workflow Rules

### No Automatic Git Operations
- Never run git commands unless explicitly requested by the user
- Do not execute: `git commit`, `git add`, `git push`, or other git operations automatically
- Preserve user control over version control workflow
- Applies to all components: cloud gateway, GStreamer expert system, and enhanced pipeline generator

## AWS CLI Documentation Lookup

### Error Handling Workflow
When AWS CLI commands fail with syntax errors:
1. Use `search_documentation` tool to verify correct syntax
2. Check official AWS CLI documentation
3. Retry command with corrected syntax
4. Do not guess or retry without verification
5. Applies to both cloud gateway and GStreamer expert system operations

## Development Cleanup Rules

### Temporary Resource Management
When implementing new features or enhancements:
1. **Identify Development Artifacts**: Distinguish between production code and temporary development/testing resources
2. **Clean Up After Implementation**: Remove temporary files, debug scripts, and development-only resources once the working solution is complete
3. **Preserve Essential Tests**: Keep only the final, comprehensive test suites that validate the production solution
4. **Remove Redundant Files**: Delete duplicate, experimental, or superseded versions of files
5. **Maintain Component Separation**: Clean up within appropriate component directories

### Cleanup Criteria
- **Remove**: Debug scripts, experimental versions, duplicate test files, temporary development aids
- **Keep**: Production code, final test suites, comprehensive documentation, essential configuration files
- **Document**: Any cleanup actions in commit messages for transparency
- **Preserve Integration**: Maintain integration points between cloud gateway and GStreamer expert system

## Automation Rules

### Required Behaviors
1. Look at the directory you are in to familiarize yourself with this unified project before proceeding
2. When asked to add a rule, add these to the `.amazonq/rules/` directory in Markdown format
3. Check directory structure before creating files - respect component boundaries
4. Use appropriate subdirectories for different asset types
5. Maintain AWS profile separation (CLI vs assets)
6. Preserve git workflow control
7. Follow existing project organization patterns
8. When AWS CLI syntax fails, consult documentation before retrying
9. Understand integration points between cloud gateway and GStreamer expert system
10. Maintain consistency between MCP server and Lambda function implementations

## Project Context

### AWS Resources - GStreamer Expert System
- **Bedrock Agent**: L60IDME1CM (alias: LOZ5ZB4MAS)
- **Knowledge Base**: 5CGJIOV1QM (324 documents)
- **S3 Bucket**: gstreamer-expert-knowledge-base-1755726919
- **Region**: us-east-1

### AWS Resources - Enhanced Pipeline Generator
- **API Gateway**: 7 specialized endpoints for GStreamer expertise
- **Lambda Function**: enhanced_pipeline_generator with Docker deployment
- **CDK Stack**: enhanced-pipeline-stack.ts with knowledge base integration
- **IAM Roles**: Proper permissions for Bedrock and knowledge base access

### MCP Server Configuration
- **Server Path**: `gstreamer-expert-system/mcp-gstreamer-expert/complete_multi_tool_server.py`
- **Status**: Production-ready with 7 specialized tools
- **Environment**: AWS_PROFILE variable support
- **Core Implementation**: Shared with Lambda function via gstreamer_expert_core.py

### Lambda Function Configuration
- **Function Path**: `enhanced-pipeline-generator/lambda/enhanced_pipeline_generator.py`
- **Status**: Production-ready with expert system integration
- **Deployment**: Docker container with legacy builder for Lambda compatibility
- **Interface**: HTTP API with same 7 tools as MCP server

## Development Guidelines

### Component Organization
Each major component has its own directory with specific purposes:
- **Cloud Gateway**: Original serverless RTSP to KVS architecture
- **GStreamer Expert System**: Comprehensive AI-powered GStreamer assistance
- **Enhanced Pipeline Generator**: Unified system combining both capabilities
- Configuration and setup files in appropriate component subdirectories
- Testing and validation in component-specific testing directories
- Documentation co-located with components
- Clean separation of concerns with well-defined integration points

### Integration Principles
- **Shared Core Logic**: Use gstreamer_expert_core.py for consistent functionality
- **Interface Adapters**: Separate MCP and Lambda interfaces while maintaining identical capabilities
- **Consistent APIs**: Ensure MCP server and Lambda function provide same 7 tools
- **Unified Documentation**: Maintain comprehensive documentation for integrated system

### Quality Standards
- Maintain production-ready code quality across all components
- Include comprehensive error handling in both MCP and Lambda implementations
- Follow AWS best practices for serverless architecture
- Preserve existing project patterns and conventions
- Ensure consistency between local MCP server and cloud Lambda function
- Maintain backward compatibility with original cloud gateway functionality

### Architecture Consistency
- **7 Specialized Tools**: search_gstreamer_elements, get_element_documentation, search_pipeline_patterns, troubleshoot_pipeline_issues, optimize_pipeline_performance, validate_pipeline_compatibility, gstreamer_expert
- **Shared Knowledge Base**: Same Bedrock knowledge base (5CGJIOV1QM) accessed by both MCP and Lambda
- **Consistent Responses**: Interface adapters ensure identical functionality across deployment methods
- **Unified Testing**: Test scenarios validate both MCP server and Lambda function implementations
