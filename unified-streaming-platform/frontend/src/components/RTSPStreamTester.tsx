import { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Input,
  Button,
  Alert,
  Box,
  Spinner,
  Checkbox,
  Grid,
  Badge
} from '@cloudscape-design/components';
import { apiUtils } from '../config/api-new';
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from '../config/api-new';

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
      const characteristicsData = await apiUtils.getStreamCharacteristics(characteristicsPayload);
      console.log('✅ Characteristics Response:', characteristicsData);

      // Then, get the pipeline recommendation
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: formData.rtspUrl,
        mode: 'pipeline',
        capture_frame: false
      };

      console.log('🔧 Getting pipeline recommendation:', pipelinePayload);
      const pipelineData = await apiUtils.generatePipeline(pipelinePayload);
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
      <SpaceBetween >
        <Alert type="success" header="✅ Stream Analysis Successful!">
          Connection established and stream characteristics detected
        </Alert>
        
        {/* Diagnostics */}
        {testResult?.stream_characteristics && (() => {
          const { diagnostics } = testResult.stream_characteristics;
          return diagnostics && (diagnostics?.warnings?.length || diagnostics.info?.length) && (
            <Container header={<Header variant="h3">🔍 Diagnostics</Header>}>
              <SpaceBetween >
                {diagnostics?.warnings && diagnostics?.warnings?.length > 0 && (
                  <SpaceBetween >
                    {diagnostics?.warnings.map((warning, index) => (
                      <Alert key={index} type="warning">
                        {warning}
                      </Alert>
                    ))}
                  </SpaceBetween>
                )}
                {diagnostics.info && diagnostics.info.length > 0 && (
                  <SpaceBetween >
                    {diagnostics.info.map((info, index) => (
                      <Alert key={index} type="info">
                        {info}
                      </Alert>
                    ))}
                  </SpaceBetween>
                )}
              </SpaceBetween>
            </Container>
          );
        })()}
        
        {/* Captured Frame Preview */}
        {previewImage && (
          <Container header={<Header variant="h3">📸 Captured Frame Preview</Header>}>
            <SpaceBetween >
              <Box
                padding="s"
                style={{
                  border: '2px solid #0073bb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  textAlign: 'center'
                }}
              >
                <img
                  src={`data:image/jpeg;base64,${previewImage}`}
                  alt="RTSP Stream Preview"
                  style={{ 
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }}
                />
              </Box>
              <Box fontSize="body-s" color="text-body-secondary" textAlign="center">
                Frame extracted from RTSP stream using OpenCV
              </Box>
              {testResult?.stream_characteristics?.frame_capture && (
                <Grid gridDefinition={[
                  { colspan: { default: 12, xs: 6, s: 3 } },
                  { colspan: { default: 12, xs: 6, s: 3 } },
                  { colspan: { default: 12, xs: 6, s: 3 } },
                  { colspan: { default: 12, xs: 6, s: 3 } }
                ]}>
                  <Box fontSize="body-s">
                    <Box fontWeight="bold">Size:</Box> {apiUtils.formatFileSize(testResult.stream_characteristics.frame_capture.size_bytes || 0)}
                  </Box>
                  <Box fontSize="body-s">
                    <Box fontWeight="bold">Time:</Box> {apiUtils.formatDuration(testResult.stream_characteristics.frame_capture.capture_time_ms || 0)}
                  </Box>
                  <Box fontSize="body-s">
                    <Box fontWeight="bold">Resolution:</Box> {testResult.stream_characteristics.frame_capture.width}x{testResult.stream_characteristics.frame_capture.height}
                  </Box>
                  <Box fontSize="body-s">
                    <Box fontWeight="bold">Original:</Box> {testResult.stream_characteristics.frame_capture.original_width}x{testResult.stream_characteristics.frame_capture.original_height}
                  </Box>
                </Grid>
              )}
            </SpaceBetween>
          </Container>
        )}
        
        {/* Recommended GStreamer Pipeline */}
        {testResult?.generated_pipeline && (
          <Container
            header={
              <Header 
                variant="h3"
                actions={
                  <Button
                    onClick={() => {
                      const pipelineText = (() => {
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
                      })();
                      navigator.clipboard.writeText(pipelineText);
                    }}
                    iconName="copy"
                  >
                    Copy Pipeline
                  </Button>
                }
              >
                🔧 Recommended GStreamer Pipeline
              </Header>
            }
          >
            <SpaceBetween >
              <pre
                style={{
                  backgroundColor: '#f2f3f3',
                  borderRadius: '4px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  overflow: 'auto',
                  border: '1px solid #d5dbdb',
                  padding: '16px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}
              >
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
              </pre>
              <Box fontSize="body-s" color="text-body-secondary">
                Copy this pipeline to use with GStreamer for streaming to Kinesis Video Streams
              </Box>
            </SpaceBetween>
          </Container>
        )}
        
        {/* Video Information */}
        {video && (
          <Container header={<Header variant="h3">🎥 Video Stream</Header>}>
            <Grid gridDefinition={[
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } }
            ]}>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Codec</Box>
                <Badge color="blue">{video.codec || 'Unknown'}</Badge>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Framerate</Box>
                <Box>{video.framerate || 'Unknown'}</Box>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Bitrate</Box>
                <Box>{video.bitrate || 'Unknown'}</Box>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Clock Rate</Box>
                <Box>{video.clock_rate || 'Unknown'}</Box>
              </Box>
            </Grid>
            {video.resolution_info && (
              <Box 
                margin={{ top: 's' }}
                padding="s"
                style={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
              >
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Resolution Info</Box>
                <Box fontSize="body-s">{video.resolution_info}</Box>
              </Box>
            )}
          </Container>
        )}

        {/* Audio Information */}
        {audio && (
          <Container header={<Header variant="h3">🔊 Audio Stream</Header>}>
            <Grid gridDefinition={[
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } },
              { colspan: { default: 12, xs: 6, s: 3 } }
            ]}>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Codec</Box>
                <Badge color="green">{audio.codec || 'Unknown'}</Badge>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Sample Rate</Box>
                <Box>{audio.sample_rate || 'Unknown'}</Box>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Bitrate</Box>
                <Box>{audio.bitrate || 'Unknown'}</Box>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Profile</Box>
                <Box>{audio.profile || 'Unknown'}</Box>
              </Box>
            </Grid>
            {audio.config && (
              <Box 
                margin={{ top: 's' }}
                padding="s"
                style={{ backgroundColor: '#f9f9f9', borderRadius: '4px' }}
              >
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Audio Config</Box>
                <Box fontSize="body-s" fontFamily="monospace">{audio.config}</Box>
              </Box>
            )}
          </Container>
        )}

        {/* Connection Information */}
        {connection && (
          <Container header={<Header variant="h3">🔗 Connection Details</Header>}>
            <Grid gridDefinition={[
              { colspan: { default: 12, xs: 6 } },
              { colspan: { default: 12, xs: 6 } }
            ]}>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Authentication</Box>
                <Badge color="red">{connection.authentication_method || 'Unknown'}</Badge>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Connection Time</Box>
                <Box>{connection.connection_time || 'Unknown'}</Box>
              </Box>
            </Grid>
          </Container>
        )}

        {/* SDP Contents */}
        {testResult?.stream_characteristics?.raw_sdp && (
          <Container header={<Header variant="h3">📄 SDP Contents</Header>}>
            <SpaceBetween >
              <pre
                style={{
                  backgroundColor: '#f2f3f3',
                  borderRadius: '4px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '12px',
                  overflow: 'auto',
                  border: '1px solid #d5dbdb',
                  padding: '16px',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  maxHeight: '300px'
                }}
              >
                {testResult.stream_characteristics.raw_sdp}
              </pre>
              <Box fontSize="body-s" color="text-body-secondary">
                Raw Session Description Protocol (SDP) data from the RTSP stream
              </Box>
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    );
  };

  return (
    <SpaceBetween >
      {/* Configuration Form */}
      <Container
        header={
          <Header variant="h2">
            🎥 RTSP Stream Tester
          </Header>
        }
      >
        <SpaceBetween >
          <Box>
            Test and analyze your RTSP camera streams to verify connectivity, 
            extract stream characteristics, and get optimized GStreamer pipeline recommendations.
          </Box>

          <FormField
            label="RTSP URL"
            description="Enter the complete RTSP URL including credentials (e.g., rtsp://user:pass@host:port/path)"
            errorText={validationErrors.rtspUrl}
          >
            <Input
              value={formData.rtspUrl}
              onChange={({ detail }) => handleInputChange('rtspUrl', detail.value)}
              placeholder="rtsp://username:password@camera-ip:554/stream"
              invalid={!!validationErrors.rtspUrl}
              ariaLabel="RTSP URL"
            />
          </FormField>

          <FormField
            label="Frame Capture"
            description="Extract a preview frame using OpenCV for visual verification"
          >
            <Checkbox
              checked={formData.captureFrame}
              onChange={({ detail }) => handleInputChange('captureFrame', detail.checked)}
            >
              Capture test frame
            </Checkbox>
          </FormField>

          <Box textAlign="center">
            <Button
              variant="primary"
              onClick={testRTSPStream}
              loading={isLoading}
              loadingText="Testing Stream..."
              
            >
              {isLoading ? '🔄 Testing RTSP Stream...' : '🚀 Test RTSP Stream'}
            </Button>
          </Box>

          {isLoading && (
            <Box textAlign="center">
              <SpaceBetween >
                <Spinner  />
                <Box fontSize="body-s" color="text-body-secondary">
                  ⏱️ This may take 5-15 seconds depending on stream quality
                </Box>
                <Box fontSize="body-s" color="text-body-secondary">
                  • Connecting to RTSP stream<br/>
                  • Detecting codecs and stream properties<br/>
                  • Extracting frame (if enabled)<br/>
                  • Analyzing characteristics
                </Box>
              </SpaceBetween>
            </Box>
          )}
        </SpaceBetween>
      </Container>

      {/* Test Results Section */}
      <Container
        header={<Header variant="h3">Test Results</Header>}
      >
        {isLoading && (
          <Box textAlign="center" padding="l">
            <SpaceBetween >
              <Spinner  />
              <Box fontSize="heading-m" fontWeight="bold">
                🔍 Analyzing RTSP stream...
              </Box>
            </SpaceBetween>
          </Box>
        )}

        {testResult && !isLoading && (
          <SpaceBetween >
            {testResult.error ? (
              <Alert type="error" header="❌ Stream Test Failed">
                <SpaceBetween >
                  <Box>{testResult.error}</Box>
                  {testResult.suggestion && (
                    <Box>
                      <Box fontWeight="bold">💡 Suggestion:</Box>
                      <Box fontSize="body-s">{testResult.suggestion}</Box>
                    </Box>
                  )}
                </SpaceBetween>
              </Alert>
            ) : testResult.stream_characteristics ? (
              renderStreamInfo(testResult.stream_characteristics)
            ) : (
              <Alert type="warning" header="Unexpected Response">
                Unexpected response format received from server
              </Alert>
            )}
          </SpaceBetween>
        )}

        {!testResult && !isLoading && (
          <Box textAlign="center" padding="l">
            <SpaceBetween >
              <Box fontSize="display-l">🎥</Box>
              <Box fontSize="heading-m" color="text-body-secondary">
                Ready to test your RTSP stream
              </Box>
              <Box fontSize="body-s" color="text-body-secondary">
                Fill in the RTSP URL above, then click "Test RTSP Stream" to begin analysis
              </Box>
            </SpaceBetween>
          </Box>
        )}
      </Container>
    </SpaceBetween>
  );
};

export default RTSPStreamTester;
