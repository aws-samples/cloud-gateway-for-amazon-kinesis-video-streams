import React, { useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Input,
  Label,
  Text,
  View,
  Alert,
  Loader,
  Image,
  Badge,
  SelectField
} from '@aws-amplify/ui-react';
import { apiUtils } from '../config/api';
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from '../config/api';

interface ValidationErrors {
  cameraName?: string;
  rtspUrl?: string;
}

const RTSPStreamTester: React.FC = () => {
  const [formData, setFormData] = useState({
    cameraName: '',
    rtspUrl: '',
    streamRetention: '24', // hours
    captureFrame: true
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate camera name
    if (!formData.cameraName.trim()) {
      errors.cameraName = 'Camera name is required';
    } else if (formData.cameraName.trim().length < 2) {
      errors.cameraName = 'Camera name must be at least 2 characters long';
    }
    
    // Validate RTSP URL
    if (!formData.rtspUrl.trim()) {
      errors.rtspUrl = 'RTSP URL is required';
    } else {
      const urlValidation = apiUtils.validateRTSPUrl(formData.rtspUrl);
      if (!urlValidation.isValid) {
        errors.rtspUrl = urlValidation.error || 'Invalid RTSP URL';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const testRTSPStream = async () => {
    // Clear previous results
    setTestResult(null);
    setPreviewImage(null);
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload: RTSPTestRequest = {
        rtsp_url: formData.rtspUrl,
        mode: 'characteristics',
        capture_frame: formData.captureFrame
      };

      console.log('🚀 Testing RTSP stream:', payload);
      const data = await apiUtils.makeRequest(payload);
      console.log('✅ API Response:', data);
      
      setTestResult(data);

      // If frame capture was successful, create preview image
      if (data.stream_characteristics?.frame_capture?.frame_data) {
        const frameData = data.stream_characteristics.frame_capture.frame_data;
        setPreviewImage(`data:image/jpeg;base64,${frameData}`);
        console.log('📸 Frame extracted successfully');
      }

    } catch (error) {
      console.error('❌ API Error:', error);
      setTestResult({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        error_type: 'NETWORK_ERROR'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStreamInfo = (characteristics: StreamCharacteristics) => {
    const { video, audio, connection, frame_capture, diagnostics } = characteristics;

    return (
      <View>
        <Alert variation="success" style={{ marginBottom: 'var(--amplify-space-medium)' }}>
          <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)' }}>
            <Text style={{ fontSize: 'large' }}>✅</Text>
            <View>
              <Text style={{ fontWeight: 'bold' }}>Stream Analysis Successful!</Text>
              <Text style={{ fontSize: 'small' }}>
                Connection established and stream characteristics detected for "{formData.cameraName}"
              </Text>
            </View>
          </Flex>
        </Alert>
        
        {/* Captured Frame Preview */}
        {previewImage && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>📸</Text>
              <Heading level={5} style={{ margin: 0 }}>Captured Frame Preview</Heading>
            </Flex>
            <View style={{ 
              border: '2px solid var(--amplify-colors-border-primary)',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: 'var(--amplify-colors-background-secondary)'
            }}>
              <Image
                src={`data:image/jpeg;base64,${previewImage}`}
                alt="RTSP Stream Preview"
                style={{ 
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </View>
            <Text style={{ 
              fontSize: 'small', 
              color: 'gray', 
              marginTop: 'var(--amplify-space-xs)',
              textAlign: 'center'
            }}>
              Frame extracted from RTSP stream using OpenCV
            </Text>
          </Card>
        )}
        
        {/* Video Information */}
        {video && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>🎥</Text>
              <Heading level={5} style={{ margin: 0 }}>Video Stream</Heading>
            </Flex>
            <Grid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--amplify-space-small)' }}>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Codec</Text>
                <Badge variation="info" size="small">{video.codec || 'Unknown'}</Badge>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Framerate</Text>
                <Text>{video.framerate || 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Bitrate</Text>
                <Text>{video.bitrate || 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Clock Rate</Text>
                <Text>{video.clock_rate || 'Unknown'}</Text>
              </View>
            </Grid>
            {video.resolution_info && (
              <View style={{ 
                marginTop: 'var(--amplify-space-small)', 
                padding: 'var(--amplify-space-small)', 
                backgroundColor: 'var(--amplify-colors-background-secondary)' 
              }}>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Resolution Info</Text>
                <Text style={{ fontSize: 'small' }}>{video.resolution_info}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Audio Information */}
        {audio && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>🔊</Text>
              <Heading level={5} style={{ margin: 0 }}>Audio Stream</Heading>
            </Flex>
            <Grid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--amplify-space-small)' }}>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Codec</Text>
                <Badge variation="success" size="small">{audio.codec || 'Unknown'}</Badge>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Sample Rate</Text>
                <Text>{audio.sample_rate || 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Bitrate</Text>
                <Text>{audio.bitrate || 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Profile</Text>
                <Text>{audio.profile || 'Unknown'}</Text>
              </View>
            </Grid>
            {audio.config && (
              <View style={{ 
                marginTop: 'var(--amplify-space-small)', 
                padding: 'var(--amplify-space-small)', 
                backgroundColor: 'var(--amplify-colors-background-secondary)' 
              }}>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Audio Config</Text>
                <Text style={{ fontSize: 'small', fontFamily: 'monospace' }}>{audio.config}</Text>
              </View>
            )}
          </Card>
        )}

        {/* Connection Information */}
        {connection && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>🔗</Text>
              <Heading level={5} style={{ margin: 0 }}>Connection Details</Heading>
            </Flex>
            <Grid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--amplify-space-small)' }}>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Authentication</Text>
                <Badge variation="warning" size="small">{connection.authentication_method || 'Unknown'}</Badge>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Connection Time</Text>
                <Text>{connection.connection_time || 'Unknown'}</Text>
              </View>
            </Grid>
          </Card>
        )}

        {/* Frame Capture Information */}
        {frame_capture && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>📸</Text>
              <Heading level={5} style={{ margin: 0 }}>Frame Capture Results</Heading>
            </Flex>
            <Grid style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--amplify-space-small)' }}>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Dimensions</Text>
                <Text>{frame_capture.width}×{frame_capture.height}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Format</Text>
                <Badge size="small">{frame_capture.format}</Badge>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>File Size</Text>
                <Text>{frame_capture.size_bytes ? apiUtils.formatFileSize(frame_capture.size_bytes) : 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Capture Time</Text>
                <Text>{frame_capture.capture_time_ms ? apiUtils.formatDuration(frame_capture.capture_time_ms) : 'Unknown'}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Original Size</Text>
                <Text>{frame_capture.original_width}×{frame_capture.original_height}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 'small', fontWeight: 'bold', color: 'gray' }}>Method</Text>
                <Badge variation="success" size="small">{frame_capture.extraction_method}</Badge>
              </View>
            </Grid>
          </Card>
        )}

        {/* Diagnostics */}
        {diagnostics && (diagnostics.warnings?.length || diagnostics.info?.length) && (
          <Card style={{ padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>🔍</Text>
              <Heading level={5} style={{ margin: 0 }}>Diagnostics</Heading>
            </Flex>
            {diagnostics.warnings && diagnostics.warnings.length > 0 && (
              <View style={{ marginBottom: 'var(--amplify-space-small)' }}>
                {diagnostics.warnings.map((warning, index) => (
                  <Alert key={index} variation="warning" style={{ marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontSize: 'small' }}>{warning}</Text>
                  </Alert>
                ))}
              </View>
            )}
            {diagnostics.info && diagnostics.info.length > 0 && (
              <View>
                {diagnostics.info.map((info, index) => (
                  <Alert key={index} variation="info" style={{ marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontSize: 'small' }}>{info}</Text>
                  </Alert>
                ))}
              </View>
            )}
          </Card>
        )}
      </View>
    );
  };

  return (
    <View style={{ padding: 'var(--amplify-space-large)' }}>
      <Heading level={2}>RTSP Stream Configuration & Testing</Heading>
      <Text style={{ color: 'gray', marginBottom: 'var(--amplify-space-large)' }}>
        Configure your camera settings and test the RTSP stream connection with real-time analysis
      </Text>

      <Flex style={{ 
        gap: 'var(--amplify-space-large)',
        alignItems: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap'
      }}>
        {/* Configuration Form */}
        <View style={{ 
          flex: '1 1 400px',
          minWidth: '400px'
        }}>
        <Card style={{ padding: 'var(--amplify-space-large)' }}>
          <Heading level={3} style={{ marginBottom: 'var(--amplify-space-medium)' }}>Camera Configuration</Heading>
          
          <Flex style={{ flexDirection: 'column', gap: 'var(--amplify-space-medium)' }}>
            {/* Camera Name Field */}
            <View>
              <Label htmlFor="cameraName" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Camera Name 
                <Text style={{ color: 'red' }}>*</Text>
              </Label>
              <Input
                id="cameraName"
                placeholder="e.g., Front Door Camera"
                value={formData.cameraName}
                onChange={(e) => handleInputChange('cameraName', e.target.value)}
                hasError={!!validationErrors.cameraName}
              />
              {validationErrors.cameraName && (
                <Text style={{ fontSize: 'small', color: 'red', marginTop: 'var(--amplify-space-xs)' }}>
                  {validationErrors.cameraName}
                </Text>
              )}
              <Text style={{ fontSize: 'small', color: 'gray' }}>
                Friendly name for this camera stream
              </Text>
            </View>

            {/* RTSP URL Field */}
            <View>
              <Label htmlFor="rtspUrl" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                RTSP URL 
                <Text style={{ color: 'red' }}>*</Text>
              </Label>
              <Input
                id="rtspUrl"
                placeholder="rtsp://username:password@camera-ip:554/stream"
                value={formData.rtspUrl}
                onChange={(e) => handleInputChange('rtspUrl', e.target.value)}
                hasError={!!validationErrors.rtspUrl}
              />
              {validationErrors.rtspUrl && (
                <Text style={{ fontSize: 'small', color: 'red', marginTop: 'var(--amplify-space-xs)' }}>
                  {validationErrors.rtspUrl}
                </Text>
              )}
              <Text style={{ fontSize: 'small', color: 'gray' }}>
                Include credentials: rtsp://user:pass@host:port/path
              </Text>
            </View>

            {/* Stream Retention Field */}
            <View>
              <SelectField
                label="Stream Retention Period"
                id="streamRetention"
                value={formData.streamRetention}
                onChange={(e) => handleInputChange('streamRetention', e.target.value)}
              >
                <option value="1">1 hour</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours (default)</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
                <option value="168">1 week</option>
              </SelectField>
              <Text style={{ fontSize: 'small', color: 'gray' }}>
                How long to retain video data in Kinesis Video Streams
              </Text>
            </View>

            {/* Frame Capture Checkbox */}
            <View>
              <Label htmlFor="captureFrame">
                <input
                  id="captureFrame"
                  type="checkbox"
                  checked={formData.captureFrame}
                  onChange={(e) => handleInputChange('captureFrame', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                Capture test frame
              </Label>
              <Text style={{ fontSize: 'small', color: 'gray', marginTop: 'var(--amplify-space-xs)' }}>
                Extract a preview frame using OpenCV for visual verification
              </Text>
            </View>

            {/* Test Stream Button - Made more prominent */}
            <View style={{ 
              marginTop: 'var(--amplify-space-medium)',
              padding: 'var(--amplify-space-small)',
              backgroundColor: 'var(--amplify-colors-background-secondary)',
              borderRadius: '8px',
              border: '2px solid var(--amplify-colors-brand-primary-20)'
            }}>
              <Button
                variation="primary"
                onClick={testRTSPStream}
                isLoading={isLoading}
                loadingText="Testing Stream..."
                size="large"
                isFullWidth
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '16px',
                  backgroundColor: '#0073bb',
                  color: 'white',
                  border: 'none'
                }}
              >
                {isLoading ? '🔄 Testing RTSP Stream...' : '🚀 Test RTSP Stream'}
              </Button>
              
              {isLoading && (
                <Text style={{ 
                  fontSize: 'small', 
                  color: 'gray', 
                  textAlign: 'center',
                  marginTop: 'var(--amplify-space-small)'
                }}>
                  ⏱️ This may take 5-15 seconds depending on stream quality
                </Text>
              )}
            </View>
          </Flex>
        </Card>
        </View>

        {/* Right Side - Test Results */}
        <View style={{ 
          flex: '1 1 400px',
          minWidth: '400px'
        }}>
        <Card style={{ padding: 'var(--amplify-space-large)' }}>
          <Heading level={3} style={{ marginBottom: 'var(--amplify-space-medium)' }}>Test Results</Heading>
          
          {isLoading && (
            <Flex style={{ 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: 'var(--amplify-space-large)' 
            }}>
              <Loader size="large" />
              <Text style={{ marginTop: 'var(--amplify-space-medium)', textAlign: 'center', fontWeight: 'bold' }}>
                🔍 Analyzing RTSP stream...
              </Text>
              <Text style={{ 
                fontSize: 'small', 
                color: 'gray', 
                textAlign: 'center', 
                marginTop: 'var(--amplify-space-small)' 
              }}>
                • Connecting to "{formData.cameraName}"<br/>
                • Detecting codecs and stream properties<br/>
                • Extracting frame (if enabled)<br/>
                • Analyzing characteristics
              </Text>
            </Flex>
          )}

          {testResult && !isLoading && (
            <View>
              {testResult.error ? (
                <Alert variation="error" style={{ marginBottom: 'var(--amplify-space-medium)' }}>
                  <Flex style={{ alignItems: 'flex-start', gap: 'var(--amplify-space-small)' }}>
                    <Text style={{ fontSize: 'large' }}>❌</Text>
                    <View>
                      <Text style={{ fontWeight: 'bold' }}>Test Failed for "{formData.cameraName}"</Text>
                      <Text style={{ marginTop: 'var(--amplify-space-xs)' }}>{testResult.error}</Text>
                      {testResult.suggestion && (
                        <View style={{ 
                          marginTop: 'var(--amplify-space-small)', 
                          padding: 'var(--amplify-space-small)', 
                          backgroundColor: 'var(--amplify-colors-background-secondary)' 
                        }}>
                          <Text style={{ fontSize: 'small', fontWeight: 'bold' }}>💡 Suggestion:</Text>
                          <Text style={{ fontSize: 'small', marginTop: 'var(--amplify-space-xs)' }}>{testResult.suggestion}</Text>
                        </View>
                      )}
                    </View>
                  </Flex>
                </Alert>
              ) : testResult.stream_characteristics ? (
                renderStreamInfo(testResult.stream_characteristics)
              ) : (
                <Alert variation="warning">
                  <Text>Unexpected response format received from server</Text>
                </Alert>
              )}
            </View>
          )}

          {!testResult && !isLoading && (
            <View style={{ textAlign: 'center', padding: 'var(--amplify-space-large)' }}>
              <Text style={{ fontSize: 'xx-large', marginBottom: 'var(--amplify-space-medium)' }}>🎥</Text>
              <Text style={{ color: 'gray', marginBottom: 'var(--amplify-space-small)', fontSize: 'large' }}>
                Ready to test your RTSP stream
              </Text>
              <Text style={{ fontSize: 'small', color: 'gray' }}>
                Fill in the camera name and RTSP URL above, then click "Test RTSP Stream" to begin analysis
              </Text>
            </View>
          )}
        </Card>
        </View>
      </Flex>
    </View>
  );
};

export default RTSPStreamTester;
