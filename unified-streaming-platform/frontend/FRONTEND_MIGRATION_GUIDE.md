# Frontend Configuration Migration Guide

This guide helps you migrate from the old hardcoded configuration system to the new automated configuration system that uses generated CDK outputs.

## 🎯 **Migration Overview**

### **Before (Old System)**
- ❌ Hardcoded API endpoints in `src/config/api.ts`
- ❌ Hardcoded Cognito configuration in `src/aws-exports.js`
- ❌ Manual updates required when backend changes
- ❌ Environment-specific values committed to git

### **After (New System)**
- ✅ Automatic configuration from CDK outputs
- ✅ Generated `frontend-config.json` with real values
- ✅ Type-safe configuration with validation
- ✅ Environment-agnostic and CI/CD ready

## 🔄 **Migration Steps**

### **Step 1: Generate Frontend Configuration**
```bash
# From the unified-streaming-platform directory
./generate-frontend-config.sh
```

This creates `frontend-config.json` with real values from your deployed CDK stack.

### **Step 2: Copy Configuration to Frontend**
```bash
# Copy the generated config to the frontend
cp frontend-config.json frontend/src/config/
```

### **Step 3: Update Import Statements**

#### **Replace API Configuration Imports**
```typescript
// OLD - Replace this
import { API_CONFIG, apiUtils, cameraAPI } from './config/api';

// NEW - Use this instead
import { API_CONFIG, apiUtils, cameraAPI } from './config/api-new';
```

#### **Replace AWS Configuration Imports**
```typescript
// OLD - Replace this
import awsExports from './aws-exports';

// NEW - Use this instead
import { amplifyConfig, awsExports } from './config/aws-config';
```

#### **Add App Configuration Imports**
```typescript
// NEW - Add these imports for full configuration access
import { appConfig, cognitoConfig, apiConfig } from './config/app-config';
```

### **Step 4: Update Amplify Configuration**

#### **Replace Amplify.configure() calls**
```typescript
// OLD - Replace this
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

// NEW - Use this instead
import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './config/aws-config';
Amplify.configure(amplifyConfig);
```

### **Step 5: Update Component Imports**

#### **Update API Usage in Components**
```typescript
// OLD - Replace these imports
import { API_CONFIG, apiUtils } from '../config/api';

// NEW - Use these imports
import { API_CONFIG, apiUtils, RTSP_CONFIG } from '../config/api-new';
import { appConfig } from '../config/app-config';
```

#### **Update RTSP Test Stream Usage**
```typescript
// OLD - Hardcoded test streams
const testStream = 'rtsp://hardcoded-ip:8554/stream';

// NEW - Dynamic test streams from configuration
import { RTSP_CONFIG } from '../config/api-new';
const testStream = RTSP_CONFIG.getRandomTestStream();
```

### **Step 6: Update Environment Variables**

#### **Remove Old Environment Variables**
Remove these from your `.env` files:
```bash
# Remove these old variables
VITE_API_ENDPOINT=https://old-api-gateway.amazonaws.com
VITE_USER_POOL_ID=us-east-1_OldUserPool
VITE_CLIENT_ID=old-client-id
```

#### **Add New Environment Variables (Optional)**
```bash
# Optional: Override configuration file location
VITE_CONFIG_FILE_PATH=./src/config/frontend-config.json
```

## 📋 **File-by-File Migration Checklist**

### **Configuration Files**
- [ ] ✅ `src/config/frontend-config.json` - Generated automatically
- [ ] ✅ `src/config/app-config.ts` - New centralized configuration
- [ ] ✅ `src/config/aws-config.ts` - New AWS/Amplify configuration  
- [ ] ✅ `src/config/api-new.ts` - New API configuration
- [ ] ❌ `src/config/api.ts` - Replace imports with `api-new.ts`
- [ ] ❌ `src/aws-exports.js` - Replace imports with `aws-config.ts`

### **Component Files to Update**
- [ ] `src/main.tsx` - Update Amplify configuration
- [ ] `src/App.tsx` - Update configuration imports
- [ ] `src/components/GStreamerPipelineGenerator.tsx` - Update API imports
- [ ] `src/components/RTSPStreamTester.tsx` - Update API imports and test streams
- [ ] Any other components using API or AWS configuration

### **Test Files to Update**
- [ ] `src/config/__tests__/api.test.ts` - Update to test new configuration
- [ ] `src/components/__tests__/*.test.tsx` - Update configuration imports

## 🔧 **Code Examples**

### **Main Application Setup**
```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import App from './App.tsx';
import './index.css';

// NEW: Use generated configuration
import { amplifyConfig } from './config/aws-config';
import { configUtils } from './config/app-config';

// Configure Amplify with generated config
Amplify.configure(amplifyConfig);

// Log configuration status in development
if (import.meta.env.DEV) {
  configUtils.logConfigurationStatus();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### **API Usage in Components**
```typescript
// src/components/GStreamerPipelineGenerator.tsx
import React, { useState } from 'react';
import { 
  API_CONFIG, 
  apiUtils, 
  RTSP_CONFIG,
  type RTSPTestRequest,
  type APIResponse 
} from '../config/api-new';
import { appConfig } from '../config/app-config';

export function GStreamerPipelineGenerator() {
  const [rtspUrl, setRtspUrl] = useState('');
  
  // Use dynamic test stream
  const handleUseTestStream = () => {
    const testStream = RTSP_CONFIG.getRandomTestStream();
    if (testStream) {
      setRtspUrl(testStream);
    }
  };
  
  // Use new API utilities
  const handleGeneratePipeline = async () => {
    try {
      const request: RTSPTestRequest = {
        rtsp_url: rtspUrl,
        mode: 'pipeline',
        capture_frame: true
      };
      
      const response = await apiUtils.generatePipeline(request);
      // Handle response...
    } catch (error) {
      console.error('Pipeline generation failed:', error);
    }
  };
  
  return (
    <div>
      <input 
        value={rtspUrl} 
        onChange={(e) => setRtspUrl(e.target.value)}
        placeholder="Enter RTSP URL or use test stream"
      />
      <button onClick={handleUseTestStream}>
        Use Test Stream
      </button>
      <button onClick={handleGeneratePipeline}>
        Generate Pipeline
      </button>
      
      {/* Show configuration status */}
      {import.meta.env.DEV && (
        <div>
          <p>API Base URL: {appConfig.api.baseUrl}</p>
          <p>RTSP Server: {RTSP_CONFIG.ENABLED ? 'Available' : 'Not Available'}</p>
        </div>
      )}
    </div>
  );
}
```

### **Camera Management Usage**
```typescript
// src/components/CameraManager.tsx
import React, { useEffect, useState } from 'react';
import { 
  cameraAPI, 
  type CameraConfiguration,
  type CreateCameraRequest 
} from '../config/api-new';

export function CameraManager() {
  const [cameras, setCameras] = useState<CameraConfiguration[]>([]);
  
  useEffect(() => {
    loadCameras();
  }, []);
  
  const loadCameras = async () => {
    try {
      const response = await cameraAPI.listCameras();
      setCameras(response.cameras || []);
    } catch (error) {
      console.error('Failed to load cameras:', error);
    }
  };
  
  const createCamera = async (cameraData: CreateCameraRequest) => {
    try {
      await cameraAPI.createCamera(cameraData);
      await loadCameras(); // Reload list
    } catch (error) {
      console.error('Failed to create camera:', error);
    }
  };
  
  return (
    <div>
      {/* Camera management UI */}
    </div>
  );
}
```

## 🛠️ **Automated Migration Script**

Create a migration script to automate the import updates:

```bash
#!/bin/bash
# migrate-frontend-config.sh

echo "🔄 Migrating frontend configuration..."

# Update import statements in TypeScript files
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e "s|from './config/api'|from './config/api-new'|g" \
  -e "s|from '../config/api'|from '../config/api-new'|g" \
  -e "s|from '../../config/api'|from '../../config/api-new'|g"

# Update AWS exports imports
find src -name "*.ts" -o -name "*.tsx" | xargs sed -i '' \
  -e "s|from './aws-exports'|from './config/aws-config'|g" \
  -e "s|from '../aws-exports'|from '../config/aws-config'|g"

echo "✅ Import statements updated"
echo "📋 Manual steps remaining:"
echo "   1. Update Amplify.configure() calls"
echo "   2. Test all components"
echo "   3. Update test files"
echo "   4. Remove old configuration files"
```

## 🧪 **Testing the Migration**

### **Verify Configuration Loading**
```typescript
// Add this to your main component for testing
import { configUtils } from './config/app-config';

// In development, log configuration status
if (import.meta.env.DEV) {
  const status = configUtils.getConfigurationStatus();
  console.log('Configuration Status:', status);
  
  if (!status.isValid) {
    console.error('❌ Configuration is invalid!');
    console.error('Missing fields:', status.missingFields);
    console.error('Please run: cd ../.. && ./generate-frontend-config.sh');
  }
}
```

### **Test API Endpoints**
```typescript
// Test that API endpoints are working
import { API_CONFIG, apiUtils } from './config/api-new';

// Test pipeline generation
const testAPI = async () => {
  try {
    const response = await apiUtils.generatePipeline({
      rtsp_url: 'rtsp://test',
      mode: 'characteristics'
    });
    console.log('✅ API is working:', response);
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
};
```

## 🚨 **Common Issues and Solutions**

### **Issue: Configuration Not Found**
```
Error: Frontend configuration not found. Please run generate-frontend-config.sh
```
**Solution**: Generate the configuration file:
```bash
cd ../.. && ./generate-frontend-config.sh
cp frontend-config.json frontend/src/config/
```

### **Issue: Invalid Configuration Values**
```
Warning: Using fallback configuration. Missing fields: cognito.userPoolId
```
**Solution**: Ensure CDK stack is deployed and outputs are available:
```bash
aws cloudformation describe-stacks --stack-name UnifiedStreamingPlatformStack --profile malone-aws
```

### **Issue: Authentication Errors**
```
Error: Could not get auth token
```
**Solution**: Check Amplify configuration and ensure user is signed in:
```typescript
import { getCurrentUser } from 'aws-amplify/auth';

try {
  const user = await getCurrentUser();
  console.log('User is signed in:', user);
} catch (error) {
  console.log('User is not signed in');
}
```

### **Issue: CORS Errors**
```
Error: CORS policy blocked the request
```
**Solution**: Verify API Gateway CORS configuration in CDK stack and ensure correct base URL.

## 📚 **Additional Resources**

- [App Configuration Documentation](./src/config/app-config.ts) - Type definitions and utilities
- [API Configuration Documentation](./src/config/api-new.ts) - Modern API client
- [AWS Configuration Documentation](./src/config/aws-config.ts) - Amplify setup
- [Frontend Config Generator](../generate-frontend-config.sh) - Automatic config generation
- [CDK Stack Outputs](../cdk-infrastructure/enhanced-pipeline-stack.ts) - Infrastructure configuration

## ✅ **Migration Checklist**

- [ ] Generate frontend configuration file
- [ ] Copy configuration to frontend directory
- [ ] Update all import statements
- [ ] Update Amplify configuration
- [ ] Update component API usage
- [ ] Test configuration loading
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Update test files
- [ ] Remove old configuration files
- [ ] Commit changes

Once migration is complete, your frontend will automatically stay in sync with your deployed backend infrastructure! 🎉
