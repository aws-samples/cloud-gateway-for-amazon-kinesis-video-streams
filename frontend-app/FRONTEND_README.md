# Kinesis Video Streams Gateway - Frontend Application

A React-based web application for managing and testing RTSP camera streams with AWS Kinesis Video Streams integration.

## 🚀 Features

### 🔧 RTSP Stream Tester
- **Real-time Stream Analysis**: Test RTSP connections and analyze stream characteristics
- **OpenCV Frame Extraction**: Capture preview frames directly from RTSP streams
- **Authentication Support**: Automatic detection and handling of DIGEST, Basic, and no-auth streams
- **Comprehensive Stream Info**: Display video/audio codecs, bitrates, framerates, and connection details
- **Visual Feedback**: Real-time preview images with detailed capture metrics

### 🎥 Stream Management
- **Camera Configuration**: Set up camera names, RTSP URLs, and retention periods
- **Stream Validation**: Validate RTSP URL formats and connection parameters
- **Error Handling**: Detailed error messages with troubleshooting suggestions

### 🔐 Authentication
- **AWS Amplify Integration**: Secure user authentication and session management
- **Protected Routes**: All features require user authentication

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   API Gateway    │───▶│ Lambda Function │
│  (Amplify UI)   │    │                  │    │  (OpenCV + SDP) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                            ┌─────────────────┐
│  AWS Amplify    │                            │  RTSP Stream    │
│  Authentication │                            │   Analysis      │
└─────────────────┘                            └─────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ (Node 20+ recommended)
- npm or yarn package manager
- AWS Amplify CLI configured
- Access to the deployed Pipeline Generator API

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend-app
npm install
```

### 2. Configure API Endpoint
Update the API endpoint in `src/config/api.ts`:
```typescript
export const API_CONFIG = {
  PIPELINE_GENERATOR_ENDPOINT: 'https://your-api-endpoint/prod/generate-pipeline',
  // ... other config
};
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

## 🔧 Configuration

### API Configuration (`src/config/api.ts`)
- **PIPELINE_GENERATOR_ENDPOINT**: Your Lambda function API endpoint
- **REQUEST_TIMEOUT**: API request timeout (default: 60 seconds)
- **RETRY_ATTEMPTS**: Number of retry attempts for failed requests

### Amplify Configuration
The app uses AWS Amplify for authentication. Configuration is in:
- `src/amplifyconfiguration.json`
- `src/aws-exports.js`

## 🎨 Components

### RTSPStreamTester
The main component for testing RTSP streams with the following features:

#### Form Fields:
- **Camera Name**: Friendly name for the camera
- **RTSP URL**: Full RTSP URL with credentials
- **Stream Retention**: How long to retain video data (1 hour to 1 week)
- **Capture Frame**: Toggle for frame extraction

#### Results Display:
- **Video Stream Info**: Codec, framerate, bitrate, resolution
- **Audio Stream Info**: Codec, sample rate, bitrate, profile
- **Connection Details**: Authentication method, connection time
- **Frame Capture**: Dimensions, file size, capture time, extraction method
- **Diagnostics**: Warnings and informational messages

#### Preview Image:
- **Real-time Frame**: Displays captured frame from RTSP stream
- **Metadata**: Shows capture details and performance metrics
- **Responsive Design**: Scales appropriately on different screen sizes

## 🔍 Usage Examples

### Testing an RTSP Stream
1. Navigate to the "RTSP Stream Tester" tab
2. Enter camera details:
   ```
   Camera Name: Front Door Camera
   RTSP URL: rtsp://admin:password@192.168.1.100:554/stream1
   Stream Retention: 24 hours
   Capture Frame: ✓ Enabled
   ```
3. Click "Test RTSP Stream"
4. View results including:
   - Stream characteristics (codecs, bitrates, etc.)
   - Preview frame (if capture enabled)
   - Connection diagnostics

### Interpreting Results

#### Successful Test:
```json
{
  "stream_characteristics": {
    "video": {
      "codec": "H.265/HEVC",
      "framerate": "25.0 fps",
      "bitrate": "500 kbps"
    },
    "audio": {
      "codec": "AAC",
      "sample_rate": "16000 Hz"
    },
    "connection": {
      "authentication_method": "DIGEST"
    },
    "frame_capture": {
      "width": 640,
      "height": 180,
      "format": "JPEG",
      "size_bytes": 45405,
      "extraction_method": "OpenCV"
    }
  }
}
```

#### Error Response:
```json
{
  "error": "Connection refused to 192.168.1.100:554",
  "error_type": "CONNECTION_ERROR",
  "suggestion": "Check if the RTSP server is running and accessible"
}
```

## 🎯 API Integration

The frontend integrates with the serverless pipeline generator API:

### Request Format:
```typescript
{
  rtsp_url: string;
  mode: 'characteristics' | 'pipeline';
  capture_frame?: boolean;
}
```

### Response Handling:
- **Success**: Display stream characteristics and preview image
- **Error**: Show error message with troubleshooting suggestions
- **Loading**: Display progress indicators and status updates

### Error Handling:
- **Network Errors**: Connection timeouts, DNS resolution failures
- **Validation Errors**: Invalid RTSP URL formats
- **Stream Errors**: Authentication failures, codec issues
- **Server Errors**: Lambda function errors, API Gateway issues

## 🔐 Security

### Authentication:
- **AWS Amplify**: Handles user authentication and session management
- **Protected Routes**: All functionality requires valid authentication
- **Secure API Calls**: Uses authenticated requests to backend services

### Data Handling:
- **No Credential Storage**: RTSP credentials are only used for testing
- **Secure Transmission**: All API calls use HTTPS
- **Session Management**: Automatic token refresh and logout

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with side-by-side layout
- **Tablet**: Stacked layout with touch-friendly controls
- **Mobile**: Single-column layout optimized for small screens

## 🧪 Testing

### Manual Testing:
1. Test with various RTSP URL formats
2. Verify error handling with invalid URLs
3. Test frame extraction with different camera types
4. Validate responsive design on different screen sizes

### Common Test Cases:
- **Valid RTSP Stream**: Should show full characteristics and preview
- **Invalid URL**: Should show validation error
- **Connection Timeout**: Should show timeout error with suggestion
- **Authentication Failure**: Should show auth error with credential hint

## 🚀 Deployment

### Development:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm run preview
```

### AWS Amplify Hosting:
```bash
amplify publish
```

## 🔧 Troubleshooting

### Common Issues:

1. **API Endpoint Not Found**
   - Check `src/config/api.ts` configuration
   - Verify Lambda function is deployed and accessible

2. **Authentication Errors**
   - Ensure Amplify is properly configured
   - Check `amplifyconfiguration.json` settings

3. **CORS Issues**
   - Verify API Gateway CORS configuration
   - Check browser developer tools for CORS errors

4. **Frame Extraction Failures**
   - Verify RTSP stream is accessible
   - Check Lambda function logs for OpenCV errors

### Debug Mode:
Enable debug logging by setting:
```typescript
// In src/config/api.ts
const DEBUG = true;
```

## 📊 Performance

### Metrics:
- **Initial Load**: ~2-3 seconds (with authentication)
- **Stream Test**: 5-15 seconds (depending on stream quality)
- **Frame Extraction**: 3-8 seconds (varies by resolution)
- **Bundle Size**: ~500KB (gzipped)

### Optimization:
- **Code Splitting**: Lazy load components
- **Image Optimization**: Compress preview images
- **API Caching**: Cache successful stream tests
- **Error Boundaries**: Graceful error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test thoroughly
4. Update documentation
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
