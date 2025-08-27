# Frontend Application

**Purpose**: React-based web interface for the unified streaming platform  
**Technology**: React 18, TypeScript, Vite, Cloudscape Design System  
**Deployment**: S3 + CloudFront via CDK  

## 📋 **Component Overview**

### **Technology Stack**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Cloudscape Design System** - AWS-native UI components
- **AWS SDK** - Direct integration with AWS services (replacing Amplify)

### **Key Features**
- 🔐 **Cognito Authentication** - User login and registration
- 📋 **Camera Management** - CRUD operations for camera configurations
- 🎬 **Pipeline Generation** - AI-powered GStreamer pipeline creation
- 📊 **Stream Analysis** - RTSP stream characteristics and frame extraction
- 🧪 **Testing Interface** - Integration with RTSP Test Server

## 🚀 **Development Setup**

### **Prerequisites**
- Node.js 18+ and npm
- Access to unified streaming platform API

### **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### **Environment Configuration**
Create `.env.local` file:
```bash
# API Configuration (from CDK outputs)
VITE_API_GATEWAY_URL=https://your-api-gateway-url

# Cognito Configuration (from existing Amplify deployment)
VITE_COGNITO_USER_POOL_ID=us-east-1_Q1jWhy4hd
VITE_COGNITO_CLIENT_ID=33or6k033pn7jgjq8gbmfs2gu3
VITE_COGNITO_REGION=us-east-1

# Optional: RTSP Test Server URL
VITE_RTSP_TEST_SERVER_URL=http://rtsp-test-server-url:8080
```

## 🏗️ **Architecture**

### **Component Structure**
```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── camera/          # Camera management components
│   ├── pipeline/        # Pipeline generation components
│   └── common/          # Shared components
├── pages/               # Page-level components
├── services/            # API service layer
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── aws-config.ts        # AWS SDK configuration
```

### **State Management**
- **React Context** - Global state management
- **Custom Hooks** - Component-specific state logic
- **Local Storage** - Persistent user preferences

### **API Integration**
- **Direct AWS SDK** - Replaces Amplify for Cognito authentication
- **Fetch API** - HTTP requests to unified platform API
- **Error Handling** - Comprehensive error boundaries and user feedback

## 🔐 **Authentication Flow**

### **Cognito Integration**
```typescript
// aws-config.ts
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

export const cognitoClient = new CognitoIdentityProviderClient({
  region: import.meta.env.VITE_COGNITO_REGION,
});

export const cognitoConfig = {
  userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};
```

### **Authentication Service**
```typescript
// services/auth.ts
export class AuthService {
  async signIn(username: string, password: string) {
    // Direct Cognito authentication
  }
  
  async signUp(username: string, password: string, email: string) {
    // User registration
  }
  
  async getCurrentUser() {
    // Get current authenticated user
  }
}
```

## 📊 **API Integration**

### **Service Layer**
```typescript
// services/api.ts
export class ApiService {
  private baseUrl = import.meta.env.VITE_API_GATEWAY_URL;
  
  async generatePipeline(rtspUrl: string) {
    return fetch(`${this.baseUrl}/v1/generate-pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rtsp_url: rtspUrl }),
    });
  }
  
  async getCameras() {
    return fetch(`${this.baseUrl}/cameras`, {
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`,
      },
    });
  }
}
```

## 🎨 **UI Components**

### **Cloudscape Design System**
```typescript
import {
  AppLayout,
  Button,
  Container,
  Header,
  SpaceBetween,
  Table,
  Form,
  FormField,
  Input,
} from '@cloudscape-design/components';
```

### **Key Pages**
- **Dashboard** - Overview of cameras and recent activity
- **Camera Management** - CRUD operations for camera configurations
- **Pipeline Generator** - AI-powered pipeline creation interface
- **Stream Analysis** - RTSP stream characteristics and testing
- **Settings** - User preferences and configuration

## 🧪 **Testing**

### **Test Setup**
```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in UI mode
npm run test:ui
```

### **Test Structure**
- **Component Tests** - React Testing Library
- **Service Tests** - API service mocking
- **Integration Tests** - End-to-end user flows
- **Accessibility Tests** - WCAG compliance validation

## 📦 **Build & Deployment**

### **Build Process**
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### **CDK Integration**
The frontend is automatically deployed via CDK:
```bash
# Deploy with frontend
cd ../cdk-infrastructure/
cdk deploy --parameters DeployFrontend=true
```

### **Build Output**
- **dist/** - Production build artifacts
- **Optimized bundles** - Code splitting and tree shaking
- **Static assets** - Images, fonts, and other resources
- **Service worker** - Offline support (optional)

## 🔧 **Configuration**

### **Vite Configuration**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
});
```

### **TypeScript Configuration**
- **Strict mode** enabled for type safety
- **Path mapping** for clean imports
- **Build optimization** for production

## 🚀 **Deployment**

### **S3 + CloudFront Hosting**
- **S3 Bucket** - Static website hosting
- **CloudFront Distribution** - Global CDN with HTTPS
- **SPA Routing** - Proper handling of client-side routes
- **Cache Optimization** - Efficient content delivery

### **Environment Variables**
Production environment variables are injected during build:
- API Gateway URL from CDK outputs
- Cognito configuration from existing User Pool
- Feature flags for optional components

---

**Note**: This frontend application provides a complete web interface for the unified streaming platform, integrating seamlessly with the backend services while maintaining the existing Cognito User Pool for authentication.
