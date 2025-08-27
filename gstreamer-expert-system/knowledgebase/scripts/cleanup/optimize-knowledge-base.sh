#!/bin/bash

# Knowledge Base Optimization Script
# Helps identify and remove low-quality or conflicting documentation

BUCKET_NAME="gstreamer-expert-knowledge-base-1755726919"
AWS_PROFILE="malone-aws"

echo "🔍 Knowledge Base Optimization Analysis"
echo "======================================"

# Function to analyze file types and sizes
analyze_content() {
    echo "📊 Analyzing S3 bucket content..."
    
    # Get file statistics
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    awk '{
        # Extract file extension
        split($4, parts, ".")
        ext = parts[length(parts)]
        
        # Count by extension
        count[ext]++
        size[ext] += $3
        total_files++
        total_size += $3
    }
    END {
        print "File Type Analysis:"
        print "==================="
        for (e in count) {
            printf "%-10s: %6d files, %10.2f MB\n", e, count[e], size[e]/1024/1024
        }
        print "==================="
        printf "%-10s: %6d files, %10.2f MB\n", "TOTAL", total_files, total_size/1024/1024
    }'
}

# Function to identify potentially problematic files
identify_issues() {
    echo -e "\n🚨 Identifying Potential Issues..."
    
    echo "Large files (>1MB) that might be binary:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    awk '$3 > 1048576 {print $3/1024/1024 " MB - " $4}' | sort -nr
    
    echo -e "\nFiles with potentially problematic extensions:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    grep -E '\.(jar|zip|tar|gz|exe|dll|so|dylib|bin|img|iso)$' | \
    awk '{print $3/1024/1024 " MB - " $4}'
    
    echo -e "\nDuplicate or similar filenames:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    awk '{print $4}' | \
    sed 's/.*\///' | \
    sort | uniq -d | head -20
}

# Function to suggest cleanup actions
suggest_cleanup() {
    echo -e "\n💡 Cleanup Suggestions:"
    echo "======================="
    
    echo "1. Remove binary files that don't contain useful text:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    grep -E '\.(jar|zip|tar|gz|exe|dll|so|dylib|bin|img|iso|mp4|avi|wav|ogg)$' | \
    head -10 | awk '{print "   aws s3 rm s3://'$BUCKET_NAME'/" $4 " --profile '$AWS_PROFILE'"}'
    
    echo -e "\n2. Remove very large files (>5MB) that might be datasets:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    awk '$3 > 5242880 {print "   aws s3 rm s3://'$BUCKET_NAME'/" $4 " --profile '$AWS_PROFILE'"}' | \
    head -5
    
    echo -e "\n3. Remove test files and temporary content:"
    aws s3 ls s3://$BUCKET_NAME --recursive --profile $AWS_PROFILE | \
    grep -E '(test|tmp|temp|example|sample)' | \
    head -10 | awk '{print "   aws s3 rm s3://'$BUCKET_NAME'/" $4 " --profile '$AWS_PROFILE'"}'
}

# Function to create focused knowledge base
create_focused_kb() {
    echo -e "\n🎯 Creating Focused Knowledge Base Structure:"
    echo "============================================="
    
    cat << 'EOF'
Recommended Knowledge Base Structure:

📁 docs/
├── 📁 core/                    # Essential GStreamer concepts
│   ├── introspection-guide.md
│   ├── platform-differences.md
│   └── element-verification.md
├── 📁 platforms/               # Platform-specific guides
│   ├── macos-specifics.md
│   ├── linux-specifics.md
│   └── windows-specifics.md
├── 📁 pipelines/              # Common pipeline patterns
│   ├── camera-to-kvs.md
│   ├── file-processing.md
│   └── rtsp-streaming.md
├── 📁 hardware/               # Hardware acceleration
│   ├── nvidia-acceleration.md
│   ├── intel-vaapi.md
│   └── apple-videotoolbox.md
└── 📁 troubleshooting/        # Common issues and solutions
    ├── element-not-found.md
    ├── caps-negotiation.md
    └── performance-issues.md

Benefits of Focused Structure:
✅ Reduced retrieval noise
✅ Platform-specific accuracy
✅ Easier maintenance
✅ Better relevance scoring
✅ Faster query responses
EOF
}

# Main execution
main() {
    analyze_content
    identify_issues
    suggest_cleanup
    create_focused_kb
    
    echo -e "\n🚀 Next Steps:"
    echo "=============="
    echo "1. Review the analysis above"
    echo "2. Remove problematic files using suggested commands"
    echo "3. Reorganize remaining content into focused structure"
    echo "4. Start new ingestion job after cleanup"
    echo "5. Test agent accuracy with cleaned knowledge base"
    
    echo -e "\n📋 Quick Cleanup Commands:"
    echo "=========================="
    echo "# Remove all binary files:"
    echo "aws s3 rm s3://$BUCKET_NAME --recursive --exclude '*' --include '*.jar' --include '*.zip' --include '*.tar' --include '*.gz' --profile $AWS_PROFILE"
    echo ""
    echo "# Remove test files:"
    echo "aws s3 rm s3://$BUCKET_NAME --recursive --exclude '*' --include '*test*' --include '*tmp*' --include '*temp*' --profile $AWS_PROFILE"
    echo ""
    echo "# Remove large media files:"
    echo "aws s3 rm s3://$BUCKET_NAME --recursive --exclude '*' --include '*.mp4' --include '*.avi' --include '*.wav' --include '*.ogg' --profile $AWS_PROFILE"
}

# Run the analysis
main
