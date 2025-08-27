# Knowledge Base Content Workflow

## 🔄 Step-by-Step Process for Adding Content

### Phase 1: Planning & Research (5-10 minutes)

#### 1. Identify the Need
- [ ] New GStreamer element discovered
- [ ] Integration pattern developed
- [ ] Common problem needs solution
- [ ] Platform-specific optimization found
- [ ] Working example created

#### 2. Check for Existing Content
```bash
# Search existing knowledge base
find /path/to/gstreamer-kb -name "*.md" -exec grep -l "search-term" {} \;

# Or search S3 directly
aws s3 ls s3://gstreamer-precision-kb-1756157992/gstreamer-kb/ --recursive | grep "search-term"
```

#### 3. Determine Content Category
- **Element**: Individual GStreamer component → `elements/`
- **Integration**: Service/library integration → `integration-patterns/`
- **Platform**: OS-specific guide → `platform-guides/`
- **Example**: Complete pipeline → `working-examples/`
- **Troubleshooting**: Problem solution → `troubleshooting/`

### Phase 2: Content Creation (15-30 minutes)

#### 1. Create Document Structure
```bash
# Create new document with proper naming
touch elementname.md  # for elements
touch service-pattern.md  # for integrations
touch platform-topic.md  # for platform guides
touch description.pipeline.md  # for examples
touch issue-name.md  # for troubleshooting
```

#### 2. Use Template
Copy from `KB_QUICK_REFERENCE.md` template and fill in:
- [ ] Specific, descriptive title
- [ ] Complete metadata (category, plugin, rank, version)
- [ ] Clear description of purpose
- [ ] All relevant properties with defaults
- [ ] Multiple working examples
- [ ] Platform-specific considerations
- [ ] Performance tips
- [ ] Common issues and solutions
- [ ] Related elements/concepts

#### 3. Test All Examples
```bash
# Test each command/pipeline in your document
gst-launch-1.0 [example-command]

# Verify on target platforms
# Test with different inputs/outputs
# Check error conditions
```

### Phase 3: Quality Assurance (10-15 minutes)

#### 1. Content Review Checklist
- [ ] **Title**: Specific and searchable
- [ ] **Examples**: All tested and working
- [ ] **Completeness**: All sections filled appropriately
- [ ] **Accuracy**: Information is current and correct
- [ ] **Clarity**: Easy to understand and follow
- [ ] **Uniqueness**: Not duplicating existing content

#### 2. Format Validation
```bash
# Check markdown syntax
markdownlint filename.md

# Verify file naming convention
# Check directory placement
# Ensure consistent formatting
```

#### 3. Cross-Reference Check
- [ ] Related elements mentioned
- [ ] Links to relevant patterns/guides
- [ ] Platform compatibility noted
- [ ] Version requirements specified

### Phase 4: Deployment (5 minutes)

#### 1. File Placement
```bash
# Place in correct directory
mv filename.md /path/to/gstreamer-kb/appropriate-directory/

# Verify correct location
ls -la /path/to/gstreamer-kb/appropriate-directory/filename.md
```

#### 2. Upload to S3
```bash
# Upload single file
aws s3 cp filename.md s3://gstreamer-precision-kb-1756157992/gstreamer-kb/appropriate-directory/ --profile malone-aws

# Or sync entire directory
aws s3 sync /local/gstreamer-kb/ s3://gstreamer-precision-kb-1756157992/gstreamer-kb/ --profile malone-aws
```

#### 3. Trigger Knowledge Base Ingestion
```bash
# Start new ingestion job
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id 5CGJIOV1QM \
  --data-source-id L80DJLYRON \
  --description "Added: filename.md - [brief description]" \
  --profile malone-aws
```

### Phase 5: Validation (5 minutes)

#### 1. Monitor Ingestion
```bash
# Check ingestion status
aws bedrock-agent list-ingestion-jobs \
  --knowledge-base-id 5CGJIOV1QM \
  --data-source-id L80DJLYRON \
  --max-results 1 \
  --profile malone-aws
```

#### 2. Test AI Responses
- Ask the AI system about your new content
- Verify it can find and use the information
- Check response quality and accuracy

## 🛠️ Tools and Scripts

### Content Creation Helper Script
```bash
#!/bin/bash
# create-kb-content.sh

echo "GStreamer Knowledge Base Content Creator"
echo "========================================"

read -p "Content type (element/pattern/guide/example/troubleshooting): " type
read -p "Content name (e.g., nvh264enc, kvs-auth): " name

case $type in
  "element")
    dir="elements"
    filename="${name}.md"
    ;;
  "pattern")
    dir="integration-patterns"
    filename="${name}.md"
    ;;
  "guide")
    dir="platform-guides"
    filename="${name}.md"
    ;;
  "example")
    dir="working-examples"
    filename="${name}.pipeline.md"
    ;;
  "troubleshooting")
    dir="troubleshooting"
    filename="${name}.md"
    ;;
  *)
    echo "Invalid type"
    exit 1
    ;;
esac

mkdir -p "gstreamer-kb/${dir}"
cp KB_QUICK_REFERENCE_TEMPLATE.md "gstreamer-kb/${dir}/${filename}"

echo "Created: gstreamer-kb/${dir}/${filename}"
echo "Edit the file and run: ./upload-to-kb.sh ${dir}/${filename}"
```

### Upload Helper Script
```bash
#!/bin/bash
# upload-to-kb.sh

if [ $# -eq 0 ]; then
    echo "Usage: $0 <relative-path-to-file>"
    exit 1
fi

file_path=$1
s3_path="s3://gstreamer-precision-kb-1756157992/gstreamer-kb/${file_path}"

echo "Uploading ${file_path} to knowledge base..."
aws s3 cp "gstreamer-kb/${file_path}" "${s3_path}" --profile malone-aws

if [ $? -eq 0 ]; then
    echo "✅ Upload successful!"
    echo "Starting knowledge base ingestion..."
    
    aws bedrock-agent start-ingestion-job \
      --knowledge-base-id 5CGJIOV1QM \
      --data-source-id L80DJLYRON \
      --description "Added: ${file_path}" \
      --profile malone-aws
    
    echo "✅ Ingestion job started!"
else
    echo "❌ Upload failed!"
fi
```

## 📋 Content Review Templates

### Element Review Template
```markdown
## Review Checklist for: [element-name]

### Basic Information
- [ ] Element name is correct and specific
- [ ] Plugin name is accurate
- [ ] Rank is appropriate
- [ ] GStreamer version is specified

### Documentation Quality
- [ ] Description explains purpose clearly
- [ ] All important properties are documented
- [ ] Property defaults are correct
- [ ] Pad templates are accurate

### Examples
- [ ] Basic example works as written
- [ ] Advanced examples are practical
- [ ] All commands are complete and tested
- [ ] Examples show different use cases

### Platform Coverage
- [ ] Linux requirements specified
- [ ] macOS compatibility noted
- [ ] Windows support documented
- [ ] Hardware requirements listed

### Completeness
- [ ] Performance tips included
- [ ] Common issues addressed
- [ ] Related elements mentioned
- [ ] Troubleshooting provided
```

### Integration Pattern Review Template
```markdown
## Review Checklist for: [pattern-name]

### Integration Quality
- [ ] Service/library properly identified
- [ ] Authentication method documented
- [ ] Configuration steps are complete
- [ ] Dependencies are listed

### Examples
- [ ] Basic integration example works
- [ ] Advanced patterns are practical
- [ ] Error handling is covered
- [ ] Security considerations noted

### Completeness
- [ ] Platform-specific notes included
- [ ] Performance implications discussed
- [ ] Troubleshooting section provided
- [ ] Related patterns referenced
```

## 🎯 Success Metrics

### Document Quality Indicators:
- **Immediate Usability**: Examples work without modification
- **Problem Solving**: Addresses real user pain points
- **Completeness**: Covers common use cases and edge cases
- **Clarity**: Easy to understand and follow
- **Maintenance**: Easy to update as technology evolves

### Knowledge Base Health Metrics:
- **Coverage**: All important elements/patterns documented
- **Currency**: Information is up-to-date
- **Accuracy**: Examples work as documented
- **Organization**: Content is easy to find
- **Uniqueness**: Minimal duplication

## 🚨 Red Flags (Don't Add These)

- **Untested examples** that might not work
- **Deprecated elements** for old GStreamer versions
- **Duplicate information** already well-covered
- **Vendor-specific** content without broad applicability
- **Incomplete documentation** missing key information
- **Theoretical content** without practical value
- **Generic information** available in official docs

## 📞 Getting Help

### Before Adding Content:
1. Review existing documentation thoroughly
2. Test all examples on target platforms
3. Check GStreamer version compatibility
4. Verify information accuracy

### Quality Questions:
- Would this help a developer solve a real problem?
- Are the examples immediately usable?
- Is this information available elsewhere?
- Does this add unique value to the knowledge base?

Remember: The goal is to create the most helpful, accurate, and practical GStreamer knowledge base possible. Quality always trumps quantity!
