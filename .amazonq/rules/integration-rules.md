# Cloud Gateway + GStreamer Expert System Integration Rules

## Integration Overview

This project represents the successful merger of two sophisticated systems:
1. **Cloud Gateway for Amazon Kinesis Video Streams**: Serverless RTSP to KVS architecture
2. **Bedrock GStreamer Expert System**: AI-powered GStreamer assistance with 7 specialized tools

The integration creates a unified system providing both practical RTSP stream processing and comprehensive GStreamer expertise.

## Architecture Consistency Rules

### Dual Deployment Consistency
The system maintains identical functionality across two deployment methods:
- **MCP Server**: Local development with Q CLI integration
- **Lambda Function**: Cloud deployment with HTTP API

**Consistency Requirements**:
- Both implementations must provide the same 7 specialized tools
- Responses must be functionally identical between MCP and Lambda
- Core logic must be shared via `gstreamer_expert_core.py`
- Interface adapters handle protocol-specific formatting only

### Core Implementation Sharing
**Shared Components**:
- `gstreamer_expert_core.py`: Main expert system logic
- `knowledge_base_client.py`: Bedrock knowledge base integration
- `element_searcher.py`: GStreamer element search functionality
- `troubleshooter.py`: Pipeline troubleshooting logic
- `pipeline_analyzer.py`: Pipeline analysis and optimization

**Interface Adapters**:
- `mcp_interface.py`: MCP protocol formatting and error handling
- `lambda_interface.py`: HTTP API formatting and AWS Lambda integration

### Tool Consistency Matrix
All implementations must provide these 7 tools with identical functionality:

| Tool | MCP Server | Lambda Function | Core Implementation |
|------|------------|-----------------|-------------------|
| search_gstreamer_elements | ✅ | ✅ | element_searcher.py |
| get_element_documentation | ✅ | ✅ | knowledge_base_client.py |
| search_pipeline_patterns | ✅ | ✅ | pipeline_analyzer.py |
| troubleshoot_pipeline_issues | ✅ | ✅ | troubleshooter.py |
| optimize_pipeline_performance | ✅ | ✅ | pipeline_analyzer.py |
| validate_pipeline_compatibility | ✅ | ✅ | pipeline_analyzer.py |
| gstreamer_expert | ✅ | ✅ | gstreamer_expert_core.py |

## Development Workflow Rules

### Component Modification Guidelines
When modifying functionality:

1. **Core Logic Changes**: Always modify the shared core implementation first
2. **Interface Testing**: Test both MCP server and Lambda function after core changes
3. **Consistency Validation**: Ensure identical responses across both interfaces
4. **Documentation Updates**: Update both component-specific and unified documentation

### Testing Requirements
**Mandatory Testing Sequence**:
1. **Core Unit Tests**: Test shared core components in isolation
2. **MCP Integration Tests**: Validate MCP server with Q CLI
3. **Lambda Integration Tests**: Validate Lambda function via HTTP API
4. **Cross-Interface Consistency Tests**: Compare responses between MCP and Lambda
5. **End-to-End Integration Tests**: Test complete workflows

### Deployment Coordination
**MCP Server Deployment**:
- Local development environment
- Q CLI integration via `.amazonq/agent.json`
- Direct access to shared core implementation

**Lambda Function Deployment**:
- AWS Lambda with Docker container
- API Gateway with 7 specialized endpoints
- CDK stack deployment via `enhanced-pipeline-stack.ts`

## Knowledge Base Integration Rules

### Shared Knowledge Base Access
Both MCP server and Lambda function access the same Bedrock knowledge base:
- **Knowledge Base ID**: 5CGJIOV1QM
- **Document Count**: 324 curated GStreamer documents
- **Access Method**: `knowledge_base_client.py` with consistent query formatting

### Query Consistency Requirements
- Identical query formatting across MCP and Lambda implementations
- Consistent result processing and response formatting
- Shared error handling for knowledge base access failures
- Unified fallback strategies when knowledge base is unavailable

## Error Handling Integration Rules

### Consistent Error Responses
**Error Categories**:
1. **Knowledge Base Errors**: Connection failures, query timeouts
2. **Core Logic Errors**: Invalid parameters, processing failures
3. **Interface Errors**: Protocol-specific formatting issues
4. **AWS Service Errors**: Bedrock access, Lambda execution issues

**Error Handling Strategy**:
- Core errors handled in shared implementation
- Interface-specific errors handled in adapters
- Consistent error message formatting across interfaces
- Graceful degradation when services are unavailable

### Fallback Mechanisms
**Primary → Secondary → Tertiary**:
1. **Primary**: Bedrock knowledge base with Claude Opus 4.1
2. **Secondary**: Cached responses and local knowledge
3. **Tertiary**: Basic GStreamer element information and generic guidance

## Configuration Management Rules

### Environment Configuration
**Shared Configuration Elements**:
- AWS profile settings (malone-aws)
- Bedrock knowledge base configuration
- GStreamer element database paths
- Logging and debugging settings

**Interface-Specific Configuration**:
- MCP server: Q CLI integration settings
- Lambda function: AWS Lambda environment variables and IAM roles

### Secrets and Credentials Management
- Never hardcode AWS credentials in any component
- Use AWS profile for local development (MCP server)
- Use IAM roles for cloud deployment (Lambda function)
- Consistent credential handling across both interfaces

## Documentation Integration Rules

### Unified Documentation Strategy
**Component-Specific Documentation**:
- Each component maintains its own README.md
- Technical implementation details in component directories
- API documentation for interface-specific features

**Unified Documentation**:
- Root README.md provides complete system overview
- Integration summary documents (PHASE_7_INTEGRATION_SUMMARY.md)
- Cross-component workflow documentation

### Documentation Consistency Requirements
- Consistent terminology across all documentation
- Unified examples that work with both MCP and Lambda interfaces
- Cross-references between component documentation
- Maintenance of both technical and user-facing documentation

## Quality Assurance Integration Rules

### Continuous Integration Requirements
**Pre-Deployment Validation**:
1. Core component unit tests pass
2. MCP server integration tests pass
3. Lambda function integration tests pass
4. Cross-interface consistency tests pass
5. Documentation is updated and consistent

### Performance Consistency
**Response Time Requirements**:
- MCP server: <3 seconds for most queries
- Lambda function: <5 seconds including cold start
- Knowledge base queries: <10 seconds with timeout handling
- Consistent performance characteristics across interfaces

### Accuracy Validation
**Testing Framework Integration**:
- Shared test scenarios for both MCP and Lambda
- Consistent accuracy metrics across interfaces
- Regular validation against known-good responses
- Cross-interface response comparison testing

## Maintenance and Evolution Rules

### Synchronized Updates
When updating the system:
1. **Core First**: Update shared core implementation
2. **Interface Adaptation**: Update interface adapters as needed
3. **Testing**: Validate both MCP and Lambda implementations
4. **Documentation**: Update all relevant documentation
5. **Deployment**: Deploy updates to both local and cloud environments

### Backward Compatibility
- Maintain API compatibility for existing integrations
- Provide migration paths for breaking changes
- Document compatibility requirements clearly
- Test backward compatibility with existing workflows

### Future Enhancement Guidelines
**Enhancement Categories**:
1. **Core Functionality**: New GStreamer capabilities, improved analysis
2. **Interface Improvements**: Better error handling, enhanced responses
3. **Integration Features**: New AWS service integrations, enhanced workflows
4. **Performance Optimizations**: Faster responses, better resource utilization

**Enhancement Process**:
1. Design enhancement for core implementation
2. Evaluate impact on both MCP and Lambda interfaces
3. Implement in shared core with interface adaptations
4. Test across all deployment methods
5. Update documentation and deployment procedures

## Success Metrics

### Integration Success Indicators
- **Functional Consistency**: Identical responses across MCP and Lambda interfaces
- **Performance Consistency**: Similar response times and resource utilization
- **Maintenance Efficiency**: Single codebase updates affect both deployments
- **User Experience**: Seamless transition between local and cloud usage
- **Quality Assurance**: Consistent accuracy and reliability across interfaces

### Monitoring and Validation
- Regular cross-interface consistency testing
- Performance monitoring for both deployment methods
- User feedback collection for both MCP and Lambda usage
- Continuous validation of shared core implementation
- Documentation accuracy and completeness verification
