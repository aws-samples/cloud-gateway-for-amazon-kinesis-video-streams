# Knowledge Base Management Directory

This directory contains all assets, scripts, and content for managing the GStreamer Expert knowledge base.

## Directory Structure

```
knowledgebase/
├── raw-sources/           # Original downloaded content
│   ├── repos/            # Git repositories (moved from top-level)
│   ├── docs/             # Documentation files (moved from top-level)  
│   └── downloads/        # Fresh downloads from various sources
├── scripts/              # Knowledge base management scripts
│   ├── collection/       # Scripts to download/collect content
│   ├── cleanup/          # Scripts to filter and clean content
│   ├── sync/            # Scripts to sync with S3
│   └── analysis/        # Scripts to analyze content
├── staging/             # Processed content ready for upload
│   ├── filtered/        # Content after filtering
│   ├── processed/       # Content after processing
│   └── ready-for-upload/ # Final content ready for S3
├── local-copies/        # Local reference copies
│   ├── current/         # Current S3 content
│   ├── archived/        # Archived versions
│   └── extracted/       # Extracted from repositories
├── manifests/           # Content manifests and inventories
├── reports/            # Analysis and sync reports
└── config/             # Configuration files
```

## Quick Start

### 1. Collect All Sources
```bash
cd scripts/collection/
./collect-all-sources.sh
```

### 2. Filter and Clean Content  
```bash
cd scripts/cleanup/
./filter-and-cleanup.sh
```

### 3. Stage for Upload
```bash
cd scripts/sync/
./stage-for-upload.sh
```

### 4. Sync to S3
```bash
# Configure first
export KB_S3_BUCKET=your-actual-bucket-name
cd scripts/sync/
./sync-to-s3.sh
```

## Configuration

Edit `config/kb-config.env` to set:
- S3 bucket and prefix
- AWS profile
- Content filtering options
- Bedrock configuration

## Content Sources

### Current Sources
- **GStreamer Official Documentation**: Core framework documentation
- **AWS Kinesis Video Streams**: Integration documentation and examples
- **OpenVINO**: GStreamer plugin documentation
- **Hardware Acceleration**: Platform-specific optimization guides

### Raw Sources Location
- **Repositories**: `raw-sources/repos/` (moved from top-level `repos/`)
- **Documentation**: `raw-sources/docs/` (moved from top-level `docs/`)
- **Fresh Downloads**: `raw-sources/downloads/`

## Workflow

1. **Collection**: Download/clone all source materials
2. **Filtering**: Remove low-value, deprecated, or duplicate content
3. **Processing**: Optimize and add metadata
4. **Staging**: Prepare final content for upload
5. **Sync**: Upload to S3 knowledge base
6. **Validation**: Test agent performance improvements

## Scripts Overview

### Collection Scripts (`scripts/collection/`)
- **collect-all-sources.sh**: Comprehensive source collection from all origins
- **collect-all-documentation.sh**: Enhanced documentation collection (copied from main scripts)
- **scrape-dlstreamer-docs.sh**: OpenVINO DL Streamer documentation (copied from main scripts)

### Cleanup Scripts (`scripts/cleanup/`)
- **filter-and-cleanup.sh**: Intelligent content filtering and optimization
- **optimize-knowledge-base.sh**: Knowledge base optimization (copied from main scripts)
- **cleanup-*.sh**: Various cleanup utilities (copied from main scripts)

### Sync Scripts (`scripts/sync/`)
- **sync-to-s3.sh**: Enhanced S3 sync with comprehensive reporting
- **stage-for-upload.sh**: Upload preparation and staging
- **upload-to-s3.sh**: Basic S3 upload utility (copied from main scripts)

### Analysis Scripts (`scripts/analysis/`)
- **analyze-local-content.sh**: Local content analysis (copied from main scripts)

## Content Processing Pipeline

### Phase 1: Raw Collection
```
External Sources → raw-sources/downloads/
Git Repositories → raw-sources/repos/
Existing Docs → raw-sources/docs/
```

### Phase 2: Filtering & Cleanup
```
raw-sources/ → staging/filtered/
- Remove deprecated content
- Filter by relevance
- Remove duplicates
- Optimize file sizes
```

### Phase 3: Staging & Metadata
```
staging/filtered/ → staging/ready-for-upload/
- Add KB metadata headers
- Organize by category
- Generate upload manifest
```

### Phase 4: S3 Sync
```
staging/ready-for-upload/ → S3 Knowledge Base
- Upload with AWS CLI
- Verify upload success
- Generate sync reports
```

## Maintenance

### Regular Updates
- **Monthly**: Run collection scripts to gather new content
- **Quarterly**: Review and update filtering criteria
- **As Needed**: Clean up outdated or deprecated content

### Performance Monitoring
- Monitor agent accuracy improvements after KB updates
- Track CloudWatch metrics for embedding invocations
- Analyze agent query patterns and success rates

### Content Quality
- Review filtered content before upload
- Validate that high-value content is preserved
- Ensure deprecated content is properly excluded

## Integration with Main Project

### Backward Compatibility
- Symlinks created: `repos/` → `knowledgebase/raw-sources/repos/`
- Symlinks created: `docs/` → `knowledgebase/raw-sources/docs/`
- Existing scripts continue to work with symlinked directories

### Integration Points
- **Accuracy Testing**: `../accuracy-testing/` for validation after KB updates
- **Agent Configuration**: `../current-config/` for agent settings
- **Main Reports**: `../reports/` for overall project reporting
- **Scripts**: Original scripts in `../scripts/` still functional

## Environment Variables

Set these before running sync scripts:
```bash
export KB_S3_BUCKET=your-actual-bucket-name
export KB_S3_PREFIX=gstreamer-expert-docs
export AWS_PROFILE=malone-aws
```

## Troubleshooting

### Common Issues
1. **S3 Sync Fails**: Check AWS credentials and bucket permissions
2. **No Content Found**: Ensure raw sources are collected first
3. **Filtering Issues**: Review filtering criteria in cleanup scripts
4. **Upload Errors**: Verify S3 bucket exists and is accessible

### Debug Mode
Add `set -x` to any script for detailed execution logging.

## Next Steps After Setup

1. **Configure S3 Settings**: Update `config/kb-config.env` with your actual S3 bucket
2. **Run Initial Collection**: Execute the collection scripts to gather sources
3. **Test Filtering**: Run cleanup scripts and review filtered content
4. **Perform Initial Sync**: Upload content to S3 and trigger KB re-indexing
5. **Validate Improvements**: Run accuracy tests to measure agent improvements
