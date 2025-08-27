# Temporary Development File Naming Convention Rules

## Purpose
Establish clear naming conventions for temporary development files to prevent confusion, accidental commits, and workspace clutter.

## Mandatory Naming Patterns

### 1. Temporary Test Files
**Pattern**: `temp_test_<description>_<timestamp>.<ext>`
**Examples**:
- `temp_test_agent_response_20250825.py`
- `temp_test_pipeline_debug_20250825.sh`
- `temp_test_kb_query_20250825.md`

### 2. Development Experiments
**Pattern**: `dev_experiment_<description>_<timestamp>.<ext>`
**Examples**:
- `dev_experiment_new_server_approach_20250825.py`
- `dev_experiment_accuracy_method_20250825.py`
- `dev_experiment_kb_structure_20250825.md`

### 3. Debug/Troubleshooting Files
**Pattern**: `debug_<issue>_<timestamp>.<ext>`
**Examples**:
- `debug_agent_timeout_20250825.py`
- `debug_pipeline_failure_20250825.sh`
- `debug_kb_ingestion_20250825.log`

### 4. Quick Prototypes
**Pattern**: `prototype_<feature>_<timestamp>.<ext>`
**Examples**:
- `prototype_new_mcp_function_20250825.py`
- `prototype_enhanced_testing_20250825.py`
- `prototype_kb_optimization_20250825.sh`

### 5. Scratch/Working Files
**Pattern**: `scratch_<purpose>_<timestamp>.<ext>`
**Examples**:
- `scratch_pipeline_ideas_20250825.txt`
- `scratch_config_changes_20250825.json`
- `scratch_notes_20250825.md`

## Required Elements

### Timestamp Format
- **Date**: YYYYMMDD (e.g., 20250825)
- **Date + Time**: YYYYMMDD_HHMM (e.g., 20250825_1430) for multiple files same day
- **Always use UTC time for consistency**

### Descriptive Names
- Use clear, specific descriptions
- Avoid generic names like "test1", "temp", "new"
- Include the component being tested (agent, kb, mcp, pipeline)

## File Placement Rules

### Temporary Directory Structure
```
/temp-dev/
├── tests/          # Temporary test files
├── experiments/    # Development experiments
├── debug/          # Debug and troubleshooting files
├── prototypes/     # Quick prototypes
└── scratch/        # Working files and notes
```

### Fallback Placement
If `/temp-dev/` doesn't exist, place in component directory with clear prefix:
- `gstreamer-expert-system/accuracy-testing/temp_test_*`
- `enhanced-pipeline-generator/temp_test_*`
- `gstreamer-expert-system/mcp-gstreamer-expert/debug_*`
- `gstreamer-expert-system/knowledgebase/prototype_*`

## Git Integration Rules

### .gitignore Patterns
Ensure these patterns are in `.gitignore`:
```
# Temporary development files
temp_*
dev_experiment_*
debug_*
prototype_*
scratch_*
/temp-dev/
```

### Pre-commit Checks
Before any commit:
1. Search for files matching temporary patterns
2. Review and remove or relocate as needed
3. Never commit files with temporary prefixes

## Cleanup Procedures

### Daily Cleanup
- Review temporary files older than 24 hours
- Remove files that are no longer needed
- Archive important discoveries to permanent documentation

### Weekly Cleanup
- Remove all temporary files older than 7 days
- Review temp-dev directory for abandoned experiments
- Update permanent documentation with validated approaches

### Pre-commit Cleanup
- Always run cleanup before major commits
- Ensure no temporary files are staged
- Document any important findings in permanent files

## Documentation Requirements

### Temporary File Headers
All temporary files should include a header:
```
# TEMPORARY DEVELOPMENT FILE
# Created: 2025-08-25 23:38 UTC
# Purpose: Testing new agent response format
# Status: EXPERIMENTAL - DO NOT COMMIT
# Remove by: 2025-08-26 (or when resolved)
```

### Cleanup Log
Maintain a simple log of what was tested:
```
# temp-dev/cleanup-log.md
## 2025-08-25
- temp_test_agent_response_20250825.py: Tested new response format, approach validated, removed
- debug_pipeline_failure_20250825.sh: Fixed issue with h264 encoding, removed
```

## Enforcement

### Automated Checks
- Git hooks to prevent commits of temporary files
- Automated cleanup scripts for old temporary files
- Workspace scanning for improperly named temporary files

### Manual Reviews
- Include temporary file review in development workflow
- Check for temporary files during code reviews
- Regular workspace audits for naming compliance

## Benefits

### Clarity
- Immediately obvious which files are temporary
- Clear purpose and timeline for each temporary file
- Reduced confusion for humans exploring workspace

### Safety
- Prevents accidental commits of experimental code
- Reduces workspace clutter
- Maintains clean production codebase

### Efficiency
- Easy identification of files for cleanup
- Systematic approach to temporary file management
- Clear separation of production and development assets

## Examples of What NOT to Do

### Bad Naming Examples
- `test.py` (too generic)
- `new_server.py` (unclear if temporary)
- `backup.py` (ambiguous purpose)
- `fix.sh` (no context or timestamp)
- `trying_something.md` (unclear and unprofessional)

### Bad Placement Examples
- Temporary files in root directory
- Mixed with production files
- No clear organization or structure

## Integration with Existing Rules

This rule complements existing workspace rules:
- **File Organization Rules**: Temporary files have designated locations
- **Git Workflow Rules**: Prevents accidental commits of development artifacts
- **Development Cleanup Rules**: Provides systematic approach to cleanup
- **AWS Profile Management**: Temporary files follow same profile separation principles

## Implementation

### Immediate Actions
1. Add temporary file patterns to `.gitignore`
2. Create `/temp-dev/` directory structure if needed
3. Review existing files for temporary naming violations
4. Update development workflow to include temporary file management

### Ongoing Practices
1. Always use prescribed naming patterns for temporary files
2. Include cleanup review in development process
3. Document important discoveries before removing temporary files
4. Maintain clean separation between production and development assets
