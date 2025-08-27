#!/bin/bash

# Analyze local docs and repos directories for S3 sync status

echo "🔍 Analyzing local content vs S3 knowledge base..."
echo "================================================="

DOCS_DIR="docs"
REPOS_DIR="repos"
ANALYSIS_REPORT="reports/local-content-analysis-$(date +%Y%m%d-%H%M%S).md"

# Create analysis report
cat > "$ANALYSIS_REPORT" << 'ANALYSIS_EOF'
# Local Content Analysis Report

## Purpose
Identify content in local docs/ and repos/ directories that needs to be:
1. Added to S3 knowledge base (valuable content not yet uploaded)
2. Removed from local storage (content filtered out of knowledge base)
3. Updated in S3 (local changes that need to be synced)

## Analysis Results

ANALYSIS_EOF

echo "📁 Analyzing docs/ directory..."
if [ -d "$DOCS_DIR" ]; then
    echo "### docs/ Directory Analysis" >> "$ANALYSIS_REPORT"
    echo "" >> "$ANALYSIS_REPORT"
    
    # Count files by type
    echo "**File Counts:**" >> "$ANALYSIS_REPORT"
    echo "- Markdown files: $(find "$DOCS_DIR" -name "*.md" | wc -l)" >> "$ANALYSIS_REPORT"
    echo "- HTML files: $(find "$DOCS_DIR" -name "*.html" | wc -l)" >> "$ANALYSIS_REPORT"
    echo "- Total size: $(du -sh "$DOCS_DIR" | cut -f1)" >> "$ANALYSIS_REPORT"
    echo "" >> "$ANALYSIS_REPORT"
    
    # List subdirectories
    echo "**Subdirectories:**" >> "$ANALYSIS_REPORT"
    find "$DOCS_DIR" -type d -maxdepth 2 | sed 's/^/- /' >> "$ANALYSIS_REPORT"
    echo "" >> "$ANALYSIS_REPORT"
    
    # Identify potentially valuable content
    echo "**High-Value Content (should be in KB):**" >> "$ANALYSIS_REPORT"
    find "$DOCS_DIR" -name "*.md" | while read file; do
        if grep -q -E "(gstreamer|pipeline|streaming|hardware|acceleration)" "$file" 2>/dev/null; then
            echo "- $file" >> "$ANALYSIS_REPORT"
        fi
    done
    echo "" >> "$ANALYSIS_REPORT"
    
    # Identify low-value content
    echo "**Low-Value Content (can be removed):**" >> "$ANALYSIS_REPORT"
    find "$DOCS_DIR" -name "*.md" | while read file; do
        if grep -q -E "(deprecated|legacy|test|example)" "$file" 2>/dev/null; then
            echo "- $file" >> "$ANALYSIS_REPORT"
        fi
    done
    echo "" >> "$ANALYSIS_REPORT"
fi

echo "📁 Analyzing repos/ directory..."
if [ -d "$REPOS_DIR" ]; then
    echo "### repos/ Directory Analysis" >> "$ANALYSIS_REPORT"
    echo "" >> "$ANALYSIS_REPORT"
    
    # List repositories
    echo "**Repositories:**" >> "$ANALYSIS_REPORT"
    find "$REPOS_DIR" -name ".git" -type d | while read gitdir; do
        repo_dir=$(dirname "$gitdir")
        repo_name=$(basename "$repo_dir")
        echo "- $repo_name ($(du -sh "$repo_dir" | cut -f1))" >> "$ANALYSIS_REPORT"
    done
    echo "" >> "$ANALYSIS_REPORT"
    
    # Identify documentation within repos
    echo "**Documentation in Repositories:**" >> "$ANALYSIS_REPORT"
    find "$REPOS_DIR" -name "docs" -type d | while read docs_dir; do
        repo_name=$(echo "$docs_dir" | cut -d'/' -f2)
        doc_count=$(find "$docs_dir" -name "*.md" | wc -l)
        echo "- $repo_name: $doc_count markdown files" >> "$ANALYSIS_REPORT"
    done
    echo "" >> "$ANALYSIS_REPORT"
fi

# Generate recommendations
echo "## Recommendations" >> "$ANALYSIS_REPORT"
echo "" >> "$ANALYSIS_REPORT"
echo "### Immediate Actions" >> "$ANALYSIS_REPORT"
echo "1. **Archive Low-Value Content**: Move deprecated/test content to archive/" >> "$ANALYSIS_REPORT"
echo "2. **Stage High-Value Content**: Copy valuable content to knowledge-base-staging/" >> "$ANALYSIS_REPORT"
echo "3. **Clean Repository Docs**: Extract useful docs from repos, remove full repositories" >> "$ANALYSIS_REPORT"
echo "" >> "$ANALYSIS_REPORT"
echo "### Knowledge Base Updates" >> "$ANALYSIS_REPORT"
echo "1. **Upload New Content**: Sync staged content to S3" >> "$ANALYSIS_REPORT"
echo "2. **Remove Outdated Content**: Clean up S3 content no longer needed" >> "$ANALYSIS_REPORT"
echo "3. **Re-index Knowledge Base**: Trigger Bedrock re-indexing after changes" >> "$ANALYSIS_REPORT"
echo "" >> "$ANALYSIS_REPORT"

echo "✅ Analysis complete: $ANALYSIS_REPORT"
