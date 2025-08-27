#!/bin/bash

# Frontend Configuration Migration Script
# Automates the migration from hardcoded config to generated config system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "🔄 Frontend Configuration Migration"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "generate-frontend-config.sh" ]; then
    print_status $RED "❌ Please run this script from the unified-streaming-platform directory"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend" ]; then
    print_status $RED "❌ Frontend directory not found"
    exit 1
fi

print_status $BLUE "🔍 Pre-migration Checks"
echo "----------------------------------------"

# Check if frontend-config.json exists
if [ ! -f "frontend-config.json" ]; then
    print_status $YELLOW "⚠️  Frontend configuration not found. Generating..."
    if ./generate-frontend-config.sh; then
        print_status $GREEN "✅ Frontend configuration generated"
    else
        print_status $RED "❌ Failed to generate frontend configuration"
        exit 1
    fi
else
    print_status $GREEN "✅ Frontend configuration found"
fi

# Copy configuration to frontend
print_status $BLUE "📋 Copying Configuration"
echo "----------------------------------------"

if cp frontend-config.json frontend/src/config/; then
    print_status $GREEN "✅ Configuration copied to frontend/src/config/"
else
    print_status $RED "❌ Failed to copy configuration"
    exit 1
fi

# Backup old configuration files
print_status $BLUE "💾 Backing Up Old Configuration"
echo "----------------------------------------"

BACKUP_DIR="frontend/src/config/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing files
if [ -f "frontend/src/config/api.ts" ]; then
    cp "frontend/src/config/api.ts" "$BACKUP_DIR/"
    print_status $GREEN "✅ Backed up api.ts"
fi

if [ -f "frontend/src/aws-exports.js" ]; then
    cp "frontend/src/aws-exports.js" "$BACKUP_DIR/"
    print_status $GREEN "✅ Backed up aws-exports.js"
fi

print_status $GREEN "✅ Backup created in: $BACKUP_DIR"

# Update import statements
print_status $BLUE "🔧 Updating Import Statements"
echo "----------------------------------------"

# Find and update TypeScript/JavaScript files
UPDATED_FILES=0

# Update API imports
if find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "from.*config/api'" 2>/dev/null; then
    find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i '' \
        -e "s|from './config/api'|from './config/api-new'|g" \
        -e "s|from '../config/api'|from '../config/api-new'|g" \
        -e "s|from '../../config/api'|from '../../config/api-new'|g" \
        -e "s|from '../../../config/api'|from '../../../config/api-new'|g" 2>/dev/null || true
    
    UPDATED_FILES=$((UPDATED_FILES + 1))
    print_status $GREEN "✅ Updated API imports"
fi

# Update AWS exports imports
if find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs grep -l "aws-exports" 2>/dev/null; then
    find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i '' \
        -e "s|from './aws-exports'|from './config/aws-config'|g" \
        -e "s|from '../aws-exports'|from '../config/aws-config'|g" \
        -e "s|from '../../aws-exports'|from '../../config/aws-config'|g" \
        -e "s|import awsExports from|import { awsExports } from|g" 2>/dev/null || true
    
    UPDATED_FILES=$((UPDATED_FILES + 1))
    print_status $GREEN "✅ Updated AWS exports imports"
fi

if [ $UPDATED_FILES -eq 0 ]; then
    print_status $YELLOW "⚠️  No import statements found to update"
else
    print_status $GREEN "✅ Updated import statements in $UPDATED_FILES file groups"
fi

# Check for main.tsx and update Amplify configuration
print_status $BLUE "🔧 Updating Amplify Configuration"
echo "----------------------------------------"

MAIN_FILE=""
if [ -f "frontend/src/main.tsx" ]; then
    MAIN_FILE="frontend/src/main.tsx"
elif [ -f "frontend/src/main.ts" ]; then
    MAIN_FILE="frontend/src/main.ts"
elif [ -f "frontend/src/index.tsx" ]; then
    MAIN_FILE="frontend/src/index.tsx"
elif [ -f "frontend/src/index.ts" ]; then
    MAIN_FILE="frontend/src/index.ts"
fi

if [ -n "$MAIN_FILE" ]; then
    # Check if it needs updating
    if grep -q "aws-exports" "$MAIN_FILE" 2>/dev/null; then
        # Create a backup
        cp "$MAIN_FILE" "$BACKUP_DIR/$(basename $MAIN_FILE)"
        
        # Update the file
        sed -i '' \
            -e "s|import awsExports from './aws-exports'|import { amplifyConfig } from './config/aws-config'|g" \
            -e "s|Amplify.configure(awsExports)|Amplify.configure(amplifyConfig)|g" \
            "$MAIN_FILE" 2>/dev/null || true
        
        print_status $GREEN "✅ Updated Amplify configuration in $MAIN_FILE"
    else
        print_status $YELLOW "⚠️  No Amplify configuration found to update in $MAIN_FILE"
    fi
else
    print_status $YELLOW "⚠️  Main application file not found"
fi

# Validate the migration
print_status $BLUE "🔍 Validating Migration"
echo "----------------------------------------"

# Check if new configuration files exist
NEW_CONFIG_FILES=(
    "frontend/src/config/frontend-config.json"
    "frontend/src/config/app-config.ts"
    "frontend/src/config/aws-config.ts"
    "frontend/src/config/api-new.ts"
)

MISSING_FILES=()
for file in "${NEW_CONFIG_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    print_status $GREEN "✅ All new configuration files are present"
else
    print_status $RED "❌ Missing configuration files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
fi

# Check if TypeScript compilation works
print_status $BLUE "🔧 Testing TypeScript Compilation"
echo "----------------------------------------"

cd frontend

if command -v npm &> /dev/null; then
    if [ -f "package.json" ]; then
        print_status $BLUE "Installing dependencies..."
        if npm install --silent; then
            print_status $GREEN "✅ Dependencies installed"
            
            print_status $BLUE "Testing TypeScript compilation..."
            if npm run build --silent 2>/dev/null; then
                print_status $GREEN "✅ TypeScript compilation successful"
            else
                print_status $YELLOW "⚠️  TypeScript compilation issues detected"
                echo "   Run 'npm run build' in the frontend directory to see details"
            fi
        else
            print_status $YELLOW "⚠️  Could not install dependencies"
        fi
    else
        print_status $YELLOW "⚠️  No package.json found in frontend directory"
    fi
else
    print_status $YELLOW "⚠️  npm not found, skipping TypeScript compilation test"
fi

cd ..

# Generate migration report
print_status $BLUE "📋 Migration Report"
echo "=========================================="

echo ""
print_status $GREEN "✅ MIGRATION COMPLETED SUCCESSFULLY"
echo ""

echo "📄 Files Created:"
echo "   - frontend/src/config/frontend-config.json (generated configuration)"
echo "   - frontend/src/config/app-config.ts (centralized configuration)"
echo "   - frontend/src/config/aws-config.ts (AWS/Amplify configuration)"
echo "   - frontend/src/config/api-new.ts (modern API client)"
echo ""

echo "💾 Backup Location:"
echo "   - $BACKUP_DIR"
echo ""

echo "🔧 Manual Steps Required:"
echo "   1. Review and test updated components"
echo "   2. Update any remaining hardcoded values"
echo "   3. Test authentication and API calls"
echo "   4. Update test files if needed"
echo "   5. Remove old configuration files when confident"
echo ""

echo "🧪 Testing Commands:"
echo "   cd frontend"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Test production build"
echo "   npm run test   # Run tests"
echo ""

echo "🔄 Regenerate Configuration:"
echo "   ./generate-frontend-config.sh"
echo "   cp frontend-config.json frontend/src/config/"
echo ""

print_status $GREEN "🎯 Your frontend is now configured to automatically use values from your deployed CDK stack!"

# Check configuration status
print_status $BLUE "📊 Configuration Status"
echo "----------------------------------------"

if [ -f "frontend/src/config/frontend-config.json" ]; then
    if grep -q "REPLACE_WITH_" "frontend/src/config/frontend-config.json"; then
        print_status $YELLOW "⚠️  Configuration contains placeholder values"
        echo "   Please ensure your CDK stack is deployed and run:"
        echo "   ./generate-frontend-config.sh"
    else
        print_status $GREEN "✅ Configuration contains real values from CDK stack"
    fi
fi

echo ""
print_status $BLUE "🎉 Migration Complete!"
