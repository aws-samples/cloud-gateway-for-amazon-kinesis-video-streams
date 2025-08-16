# RTSP Stream Tester Frontend

A React-based frontend application for testing and analyzing RTSP video streams using the GStreamer Pipeline Generator API. This application provides a user-friendly interface for stream validation, codec detection, and real-time frame extraction.

## 🚀 Features

### Stream Testing & Analysis
- **RTSP URL Validation**: Real-time validation of RTSP stream URLs
- **Stream Characteristics**: Detailed analysis of video/audio codecs, bitrates, and formats
- **Authentication Support**: Automatic handling of DIGEST, Basic, and no-auth streams
- **Real-time Preview**: OpenCV-powered frame extraction with visual preview

### User Interface
- **AWS Amplify UI**: Modern, responsive interface using AWS Amplify UI components
- **Form Validation**: Client-side validation with real-time error feedback
- **Loading States**: Visual feedback during stream analysis
- **Error Handling**: Comprehensive error messages and suggestions

### Technical Features
- **TypeScript**: Full type safety with comprehensive interfaces
- **React Testing Library**: Complete test suite with 29+ passing tests
- **Vite Development**: Fast development server with hot module replacement
- **CORS Support**: Properly configured for API Gateway integration

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │───▶│   API Gateway    │───▶│ Lambda Function │
│   (localhost)   │    │  (CORS-enabled)  │    │ (OpenCV + SDP)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or yarn package manager
- Deployed CDK Pipeline Generator stack (see `../cdk-pipeline-generator/`)

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend-app
npm install
```

### 2. Configure API Endpoint
The API endpoint is automatically configured to use the deployed CDK stack endpoint:
```typescript
// src/config/api.ts
export const API_CONFIG = {
  PIPELINE_GENERATOR_ENDPOINT: 'https://your-api-gateway-url/prod/generate-pipeline'
};
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Test Coverage
- **Component Tests**: RTSPStreamTester component rendering and interaction
- **API Integration**: Mock API responses and error handling
- **Form Validation**: Input validation and error states
- **Type Safety**: TypeScript interface validation

### Test Results
```
✅ 29 passing tests across 3 test files
✅ Component rendering and props
✅ API integration and error handling
✅ Form validation and user interaction
```

## 📁 Project Structure

```
frontend-app/
├── src/
│   ├── components/
│   │   ├── RTSPStreamTester.tsx    # Main stream testing component
│   │   └── index.ts                # Component exports
│   ├── config/
│   │   └── api.ts                  # API configuration and utilities
│   ├── __tests__/
│   │   ├── RTSPStreamTester.test.tsx
│   │   ├── api.test.ts
│   │   └── App.test.tsx
│   ├── App.tsx                     # Main application component
│   └── main.tsx                    # Application entry point
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

## 🔧 Configuration

### API Configuration
```typescript
// src/config/api.ts
export const API_CONFIG = {
  PIPELINE_GENERATOR_ENDPOINT: 'your-api-endpoint',
  REQUEST_TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000
};
```

### CORS Configuration
The API Gateway is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)
- `https://localhost:5173` (HTTPS dev server)

## 🎯 Usage

### Basic Stream Testing
1. **Enter Camera Name**: Provide a descriptive name for your camera
2. **Enter RTSP URL**: Input your camera's RTSP stream URL with credentials
3. **Configure Options**: 
   - Set stream retention period (1 hour to 1 week)
   - Enable/disable frame capture
4. **Test Stream**: Click "Test RTSP Stream" to analyze

### Example RTSP URLs
```
rtsp://username:password@192.168.1.100:554/stream
rtsp://admin:admin123@camera.local/live
rtsp://public-demo-server.com/stream
```

### Stream Analysis Results
- **Video Information**: Codec, framerate, bitrate, resolution
- **Audio Information**: Codec, sample rate, bitrate, profile
- **Connection Details**: Authentication method, connection time
- **Frame Capture**: Real-time preview with capture statistics
- **Diagnostics**: Warnings and informational messages

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
- Ensure the CDK stack is deployed with proper CORS configuration
- Check that the API endpoint URL is correct in `src/config/api.ts`

#### Connection Timeouts
- Verify RTSP stream is accessible from AWS Lambda
- Check network connectivity and firewall settings
- Ensure RTSP credentials are correct

#### Frame Extraction Failures
- OpenCV requires accessible RTSP streams
- Some streams may not support frame extraction
- Check Lambda logs for detailed error messages

### Debug Mode
Enable detailed logging by opening browser developer tools and checking the console for API request/response details.

## 🔮 Future Enhancements

- **Batch Stream Testing**: Test multiple streams simultaneously
- **Stream Recording**: Save extracted frames or video clips
- **Advanced Analytics**: Stream quality metrics and analysis
- **Export Functionality**: Export stream characteristics as JSON/CSV
- **Real-time Monitoring**: Live stream health monitoring

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Run the test suite: `npm run test`
5. Update documentation as needed
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
