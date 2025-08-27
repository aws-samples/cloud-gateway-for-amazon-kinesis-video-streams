# Migration Scripts Directory

This directory contains migration scripts preserved from the consolidation process.

## Available Scripts

### `migrate-existing-cameras.py`
- **Purpose**: Migrates camera records to composite key structure
- **Source**: Preserved from cdk-pipeline-generator directory
- **Usage**: Run after deploying new DynamoDB schema to migrate existing camera records

### `test-camera-api.py`
- **Purpose**: Comprehensive API testing script for camera management endpoints
- **Source**: Preserved from cdk-pipeline-generator directory  
- **Usage**: Test all CRUD operations for the camera management system

## Background

These scripts were preserved from the `cdk-pipeline-generator` directory before it was removed during the consolidation process. The cdk-pipeline-generator functionality has been fully integrated into the unified streaming platform, but these migration and testing utilities may still be useful for:

- Migrating existing deployments
- Testing camera management functionality
- Reference for future migration needs

## Consolidation Notes

- Camera management functionality: ✅ Consolidated into unified platform
- RTSP analysis functionality: ✅ Consolidated into unified platform  
- Deprecated Bedrock Agent approach: ❌ Removed (obsolete)
- Migration utilities: ✅ Preserved in this directory
