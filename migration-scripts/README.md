# Migration Scripts Directory

This directory contains production migration utilities for the unified streaming platform.

## Available Scripts

### `migrate-existing-cameras.py`
- **Purpose**: Migrates camera records to unified platform DynamoDB schema
- **Usage**: Run after deploying unified streaming platform to migrate existing camera records
- **Source**: Preserved from consolidation process for production migrations
- **Status**: Production utility - may be needed for live system migrations

## Background

This script was preserved during the consolidation of the Enhanced Pipeline Generator, CDK Pipeline Generator, and Lambda SDP Extractor into the unified streaming platform. While the original cdk-pipeline-generator has been fully integrated into the unified platform, this migration utility may still be needed for:

1. **Production Migrations**: Moving existing camera configurations to the new unified schema
2. **Data Format Updates**: Converting legacy camera records to current format
3. **System Upgrades**: Facilitating smooth transitions during platform updates

## Usage

### Prerequisites
- AWS CLI configured with appropriate permissions
- Access to both source and target DynamoDB tables
- Python 3.8+ with boto3 installed

### Migration Process
```bash
# Review the migration script before running
python3 migrate-existing-cameras.py --dry-run

# Execute the migration (after validation)
python3 migrate-existing-cameras.py --execute
```

### Safety Features
- **Dry-run mode**: Preview changes before execution
- **Backup validation**: Ensures source data is preserved
- **Error handling**: Comprehensive error reporting and rollback capabilities
- **Progress tracking**: Detailed logging of migration progress

## Integration with Unified Platform

The unified streaming platform now provides:
- **Camera Management**: Complete CRUD operations via `/cameras/*` endpoints
- **Authentication**: Cognito-based user authentication and authorization
- **Secure Storage**: Secrets Manager integration for camera credentials
- **User Isolation**: Multi-tenant support with proper data isolation

For new camera configurations, use the unified platform's camera management API instead of direct DynamoDB operations.

## Support

For issues with migration scripts or questions about the unified platform:
1. Review the unified platform documentation in `../UNIFIED_STREAMING_PLATFORM_SPECIFICATION.md`
2. Check the deployment guide in `../README.md`
3. Consult the project plan in `../PROJECT_PLAN.md` for current development status

- Migrating existing deployments
- Testing camera management functionality
- Reference for future migration needs

## Consolidation Notes

- Camera management functionality: ✅ Consolidated into unified platform
- RTSP analysis functionality: ✅ Consolidated into unified platform  
- Deprecated Bedrock Agent approach: ❌ Removed (obsolete)
- Migration utilities: ✅ Preserved in this directory
