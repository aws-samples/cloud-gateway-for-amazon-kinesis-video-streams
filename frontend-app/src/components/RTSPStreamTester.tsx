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
  Badge
} from '@aws-amplify/ui-react';
import { apiUtils } from '../config/api';
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from '../config/api';

interface ValidationErrors {
  rtspUrl?: string;
}

const RTSPStreamTester: React.FC = () => {
  const [formData, setFormData] = useState({
    rtspUrl: '',
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
      // First, get stream characteristics with frame capture
      const characteristicsPayload: RTSPTestRequest = {
        rtsp_url: formData.rtspUrl,
        mode: 'characteristics',
        capture_frame: formData.captureFrame
      };

      console.log('🚀 Testing RTSP stream characteristics:', characteristicsPayload);
      const characteristicsData = await apiUtils.makeRequest(characteristicsPayload);
      console.log('✅ Characteristics Response:', characteristicsData);

      // Then, get the pipeline recommendation
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: formData.rtspUrl,
        mode: 'pipeline',
        capture_frame: false
      };

      console.log('🔧 Getting pipeline recommendation:', pipelinePayload);
      const pipelineData = await apiUtils.makeRequest(pipelinePayload);
      console.log('✅ Pipeline Response:', pipelineData);

      // Combine both responses
      const combinedData = {
        ...characteristicsData,
        generated_pipeline: pipelineData.generated_pipeline,
        stream_analysis: pipelineData.stream_analysis
      };
      
      setTestResult(combinedData);

      // If frame capture was successful, create preview image
      if (characteristicsData.stream_characteristics?.frame_capture?.frame_data) {
        const frameData = characteristicsData.stream_characteristics.frame_capture.frame_data;
        setPreviewImage(frameData); // Store just the base64 data
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
    const { video, audio, connection, diagnostics } = characteristics;

    return (
      <View>
        <Alert variation="success" style={{ marginBottom: 'var(--amplify-space-medium)' }}>
          <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)' }}>
            <Text style={{ fontSize: 'large' }}>✅</Text>
            <View>
              <Text style={{ fontWeight: 'bold' }}>Stream Analysis Successful!</Text>
              <Text style={{ fontSize: 'small' }}>
                Connection established and stream characteristics detected
              </Text>
            </View>
          </Flex>
        </Alert>
        
        {/* Diagnostics */}
        {testResult?.stream_characteristics && (() => {
          const { diagnostics } = testResult.stream_characteristics;
          return diagnostics && (diagnostics.warnings?.length || diagnostics.info?.length) && (
            <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
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
          );
        })()}
        
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
            {testResult?.stream_characteristics?.frame_capture && (
              <Flex style={{ 
                justifyContent: 'center', 
                gap: 'var(--amplify-space-large)', 
                marginTop: 'var(--amplify-space-small)',
                flexWrap: 'wrap'
              }}>
                <Text style={{ fontSize: 'small' }}>
                  <Text style={{ fontWeight: 'bold' }}>Size:</Text> {apiUtils.formatFileSize(testResult.stream_characteristics.frame_capture.size_bytes || 0)}
                </Text>
                <Text style={{ fontSize: 'small' }}>
                  <Text style={{ fontWeight: 'bold' }}>Time:</Text> {apiUtils.formatDuration(testResult.stream_characteristics.frame_capture.capture_time_ms || 0)}
                </Text>
                <Text style={{ fontSize: 'small' }}>
                  <Text style={{ fontWeight: 'bold' }}>Resolution:</Text> {testResult.stream_characteristics.frame_capture.width}x{testResult.stream_characteristics.frame_capture.height}
                </Text>
                <Text style={{ fontSize: 'small' }}>
                  <Text style={{ fontWeight: 'bold' }}>Original:</Text> {testResult.stream_characteristics.frame_capture.original_width}x{testResult.stream_characteristics.frame_capture.original_height}
                </Text>
              </Flex>
            )}
          </Card>
        )}
        
        {/* Recommended GStreamer Pipeline */}
        {testResult?.generated_pipeline && (
          <Card style={{ marginBottom: 'var(--amplify-space-medium)', padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>🔧</Text>
              <Heading level={5} style={{ margin: 0 }}>Recommended GStreamer Pipeline</Heading>
            </Flex>
            <View style={{ 
              backgroundColor: 'var(--amplify-colors-background-secondary)',
              padding: 'var(--amplify-space-medium)',
              borderRadius: '8px',
              border: '1px solid var(--amplify-colors-border-primary)',
              marginBottom: 'var(--amplify-space-small)'
            }}>
              <Text style={{ 
                fontFamily: 'monospace',
                fontSize: 'small',
                wordBreak: 'break-all',
                whiteSpace: 'pre-wrap'
              }}>
                {(() => {
                  try {
                    const pipeline = JSON.parse(testResult.generated_pipeline);
                    const pipelineText = pipeline.pipeline || testResult.generated_pipeline;
                    
                    // Format as multiline bash command
                    return pipelineText
                      .replace(/gst-launch-1\.0\s+/, 'gst-launch-1.0 \\\n  ')
                      .replace(/\s+!\s+/g, ' \\\n  ! ')
                      .replace(/\s+rtpmp4adepay/g, ' \\\n  rtpmp4adepay')
                      .replace(/\s+kvssink/g, ' \\\n  kvssink');
                  } catch {
                    // If not JSON, format the raw pipeline text
                    return testResult.generated_pipeline
                      .replace(/gst-launch-1\.0\s+/, 'gst-launch-1.0 \\\n  ')
                      .replace(/\s+!\s+/g, ' \\\n  ! ')
                      .replace(/\s+rtpmp4adepay/g, ' \\\n  rtpmp4adepay')
                      .replace(/\s+kvssink/g, ' \\\n  kvssink');
                  }
                })()}
              </Text>
            </View>
            <Text style={{ fontSize: 'small', color: 'gray' }}>
              Copy this pipeline to use with GStreamer for streaming to Kinesis Video Streams
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

        {/* SDP Contents */}
        {testResult?.stream_characteristics?.raw_sdp && (
          <Card style={{ padding: 'var(--amplify-space-medium)' }}>
            <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)', marginBottom: 'var(--amplify-space-small)' }}>
              <Text style={{ fontSize: 'large' }}>📄</Text>
              <Heading level={5} style={{ margin: 0 }}>SDP Contents</Heading>
            </Flex>
            <View style={{ 
              backgroundColor: 'var(--amplify-colors-background-secondary)',
              padding: 'var(--amplify-space-medium)',
              borderRadius: '8px',
              border: '1px solid var(--amplify-colors-border-primary)',
              maxHeight: '300px',
              overflow: 'auto',
              marginBottom: 'var(--amplify-space-small)'
            }}>
              <Text style={{ 
                fontFamily: 'monospace',
                fontSize: 'small',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {testResult.stream_characteristics.raw_sdp}
              </Text>
            </View>
            <Text style={{ fontSize: 'small', color: 'gray' }}>
              Raw Session Description Protocol (SDP) data from the RTSP stream
            </Text>
          </Card>
        )}
      </View>
    );
  };

  return (
    <View style={{ padding: 'var(--amplify-space-large)' }}>
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
                • Connecting to RTSP stream<br/>
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
                      <Text style={{ fontWeight: 'bold' }}>Stream Test Failed</Text>
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
