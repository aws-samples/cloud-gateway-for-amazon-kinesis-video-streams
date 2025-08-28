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
  Badge,
  Select,
  Textarea,
  type SelectProps
} from '@cloudscape-design/components';
import { apiUtils, cameraAPI, type CreateCameraRequest } from "../../config/api";
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from "../../config/api";

interface ValidationErrors {
  cameraName?: string;
  rtspUrl?: string;
  makeModel?: string;
  installationLocation?: string;
  retentionPeriod?: string;
  mlModel?: string;
}

interface CameraFormData {
  cameraName: string;
  rtspUrl: string;
  makeModel: string;
  installationLocation: string;
  retentionPeriod: string;
  mlModel: string;
  captureFrame: boolean;
}

// Retention period options
const RETENTION_OPTIONS: SelectProps.Option[] = [
  { label: 'Zero hours', value: '0' },
  { label: 'Half day (12 hours)', value: '12' },
  { label: 'One day (24 hours)', value: '24' },
  { label: 'One week (168 hours)', value: '168' },
  { label: 'Two weeks (336 hours)', value: '336' },
  { label: 'One month (720 hours)', value: '720' },
  { label: 'Three months (2160 hours)', value: '2160' },
  { label: 'Six months (4320 hours)', value: '4320' },
  { label: 'Nine months (6480 hours)', value: '6480' },
  { label: 'One year (8760 hours)', value: '8760' },
  { label: 'Two years (17520 hours)', value: '17520' },
  { label: 'Three years (26280 hours)', value: '26280' },
  { label: 'Four years (35040 hours)', value: '35040' },
  { label: 'Five years (43800 hours)', value: '43800' }
];

// ML Model options (starting with None, will be expanded later)
const ML_MODEL_OPTIONS: SelectProps.Option[] = [
  { label: 'None', value: 'none' },
  // TODO: Add more ML models as they become available
  // { label: 'Object Detection', value: 'object_detection' },
  // { label: 'Person Detection', value: 'person_detection' },
  // { label: 'Vehicle Detection', value: 'vehicle_detection' }
];

const AddNewCamera: React.FC = () => {
  const [formData, setFormData] = useState<CameraFormData>({
    cameraName: '',
    rtspUrl: '',
    makeModel: '',
    installationLocation: '',
    retentionPeriod: '168', // Default to one week
    mlModel: 'none',
    captureFrame: true
  });
  
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hasBeenTested, setHasBeenTested] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (field: keyof CameraFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing (only for string fields that have validation)
    if (field !== 'captureFrame' && validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (isTestOnly: boolean = false): boolean => {
    const errors: ValidationErrors = {};
    
    // For testing, only validate RTSP URL
    if (isTestOnly) {
      if (!formData.rtspUrl.trim()) {
        errors.rtspUrl = 'RTSP URL is required';
      } else {
        const urlValidation = apiUtils.validateRTSPUrl(formData.rtspUrl);
        if (!urlValidation.isValid) {
          errors.rtspUrl = urlValidation.error || 'Invalid RTSP URL';
        }
      }
    } else {
      // For saving, validate all required fields
      if (!formData.cameraName.trim()) {
        errors.cameraName = 'Camera name is required';
      }
      
      if (!formData.rtspUrl.trim()) {
        errors.rtspUrl = 'RTSP URL is required';
      } else {
        const urlValidation = apiUtils.validateRTSPUrl(formData.rtspUrl);
        if (!urlValidation.isValid) {
          errors.rtspUrl = urlValidation.error || 'Invalid RTSP URL';
        }
      }
      
      if (!formData.makeModel.trim()) {
        errors.makeModel = 'Make and model is required';
      }
      
      if (!formData.installationLocation.trim()) {
        errors.installationLocation = 'Installation location is required';
      }
      
      if (!formData.retentionPeriod) {
        errors.retentionPeriod = 'Retention period is required';
      }
      
      if (!formData.mlModel) {
        errors.mlModel = 'ML model selection is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const testRTSPStream = async () => {
    // Clear previous results
    setTestResult(null);
    setPreviewImage(null);
    setSaveSuccess(false);
    
    // Validate form for testing
    if (!validateForm(true)) {
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
      const characteristicsData = await apiUtils.generatePipeline(characteristicsPayload);
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
      setHasBeenTested(true);

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
      setHasBeenTested(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCamera = async () => {
    setSaveSuccess(false);
    
    // Validate all form fields
    if (!validateForm(false)) {
      return;
    }

    setIsSaving(true);

    try {
      let streamMetadata = null;
      let screenCaptureBase64 = null;

      // If not tested yet, run the test first to gather metadata and screen capture
      if (!hasBeenTested) {
        console.log('🔍 Camera not tested yet, gathering metadata and screen capture...');
        
        const characteristicsPayload: RTSPTestRequest = {
          rtsp_url: formData.rtspUrl,
          mode: 'characteristics',
          capture_frame: true // Always capture frame for saving
        };

        const characteristicsData = await apiUtils.generatePipeline(characteristicsPayload);
        
        if (characteristicsData.stream_characteristics) {
          streamMetadata = characteristicsData.stream_characteristics;
          if (characteristicsData.stream_characteristics.frame_capture?.frame_data) {
            screenCaptureBase64 = characteristicsData.stream_characteristics.frame_capture.frame_data;
          }
        }
      } else {
        // Use existing test results
        if (testResult?.stream_characteristics) {
          streamMetadata = testResult.stream_characteristics;
        }
        if (previewImage) {
          screenCaptureBase64 = previewImage;
        }
      }

      // Prepare camera data for saving
      const cameraData: CreateCameraRequest = {
        camera_name: formData.cameraName,
        rtsp_url: formData.rtspUrl,
        make_model: formData.makeModel,
        installation_location: formData.installationLocation,
        retention_hours: parseInt(formData.retentionPeriod),
        ml_model: formData.mlModel,
        stream_metadata: streamMetadata,
        screen_capture_base64: screenCaptureBase64 || undefined,
        test_status: hasBeenTested ? 'tested' : 'not_tested'
      };

      console.log('💾 Saving camera data...');
      
      // Call the real camera management API
      const result = await cameraAPI.createCamera(cameraData);
      
      if (result.camera) {
        console.log('✅ Camera saved successfully:', result.camera.camera_id);
        setSaveSuccess(true);
        
        // Reset form after successful save
        setTimeout(() => {
          setFormData({
            cameraName: '',
            rtspUrl: '',
            makeModel: '',
            installationLocation: '',
            retentionPeriod: '168',
            mlModel: 'none',
            captureFrame: true
          });
          setTestResult(null);
          setPreviewImage(null);
          setHasBeenTested(false);
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error('No camera data returned from API');
      }

    } catch (error) {
      console.error('❌ Save Error:', error);
      // You could set an error state here to show the user what went wrong
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      // For now, we'll just log it, but you might want to show this to the user
      console.error('Failed to save camera:', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const renderStreamInfo = (characteristics: StreamCharacteristics) => {
    const { video, audio, connection, diagnostics } = characteristics;

    return (
      <SpaceBetween size="l">
        <Alert key="success-alert" type="success" header="✅ Stream Test Successful!">
          Connection established and stream characteristics detected
        </Alert>
        
        {/* Diagnostics */}
        {testResult?.stream_characteristics && (() => {
          const { diagnostics } = testResult.stream_characteristics;
          return diagnostics && (diagnostics?.warnings?.length || diagnostics.info?.length) && (
            <Container key="diagnostics-container" header={<Header variant="h3">🔍 Diagnostics</Header>}>
              <SpaceBetween size="m">
                {diagnostics?.warnings && diagnostics?.warnings?.length > 0 && (
                  <SpaceBetween key="warnings-section" size="s">
                    {diagnostics?.warnings.map((warning, index) => (
                      <Alert key={`warning-${index}`} type="warning">
                        {warning}
                      </Alert>
                    ))}
                  </SpaceBetween>
                )}
                {diagnostics.info && diagnostics.info.length > 0 && (
                  <SpaceBetween key="info-section" size="s">
                    {diagnostics.info.map((info, index) => (
                      <Alert key={`info-${index}`} type="info">
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
          <Container key="preview-container" header={<Header variant="h3">📸 Captured Frame Preview</Header>}>
            <SpaceBetween size="m">
              <Box
                padding="s"
              >
                <div style={{
                  border: '2px solid #0073bb',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f9f9f9',
                  textAlign: 'center'
                }}>
                  <img
                    src={`data:image/jpeg;base64,${previewImage}`}
                    alt="RTSP Stream Preview"
                    style={{ 
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              </Box>
              <Box fontSize="body-s" color="text-body-secondary" textAlign="center">
                Frame extracted from RTSP stream using OpenCV
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
                <Badge color="grey">{connection.authentication_method || 'Unknown'}</Badge>
              </Box>
              <Box>
                <Box fontSize="body-s" fontWeight="bold" color="text-body-secondary">Connection Time</Box>
                <Box>{connection.connection_time || 'Unknown'}</Box>
              </Box>
            </Grid>
          </Container>
        )}
      </SpaceBetween>
    );
  };

  return (
    <SpaceBetween size="l">
      {/* Camera Configuration Form */}
      <Container
        header={
          <Header variant="h2">
            📹 Add New Camera
          </Header>
        }
      >
        <SpaceBetween size="l">
          <Box key="description">
            Configure a new camera for monitoring and streaming to Kinesis Video Streams. 
            Fill in the camera details, test the RTSP connection, and save the configuration.
          </Box>

          <Grid gridDefinition={[
            { colspan: { default: 12, s: 6 } },
            { colspan: { default: 12, s: 6 } }
          ]}>
            <FormField
              label="Camera Name"
              description="A friendly name to identify this camera"
              errorText={validationErrors.cameraName}
            >
              <Input
                value={formData.cameraName}
                onChange={({ detail }) => handleInputChange('cameraName', detail.value)}
                placeholder="e.g., Front Door Camera"
                invalid={!!validationErrors.cameraName}
                ariaLabel="Camera Name"
              />
            </FormField>

            <FormField
              label="Make and Model"
              description="Camera manufacturer and model number"
              errorText={validationErrors.makeModel}
            >
              <Input
                value={formData.makeModel}
                onChange={({ detail }) => handleInputChange('makeModel', detail.value)}
                placeholder="e.g., Hikvision DS-2CD2143G0-IS"
                invalid={!!validationErrors.makeModel}
                ariaLabel="Make and Model"
              />
            </FormField>
          </Grid>

          <FormField
            label="Installation Location"
            description="Physical location where the camera is installed"
            errorText={validationErrors.installationLocation}
          >
            <Textarea
              value={formData.installationLocation}
              onChange={({ detail }) => handleInputChange('installationLocation', detail.value)}
              placeholder="e.g., Main entrance, facing north, mounted at 8ft height"
              invalid={!!validationErrors.installationLocation}
              ariaLabel="Installation Location"
              rows={3}
            />
          </FormField>

          <FormField
            label="RTSP URL"
            description="Complete RTSP URL including credentials (will be stored securely in AWS Secrets Manager)"
            errorText={validationErrors.rtspUrl}
          >
            <Input
              value={formData.rtspUrl}
              onChange={({ detail }) => handleInputChange('rtspUrl', detail.value)}
              placeholder="rtsp://username:password@camera-ip:554/stream"
              invalid={!!validationErrors.rtspUrl}
              ariaLabel="RTSP URL"
              type="password"
            />
          </FormField>

          <Grid gridDefinition={[
            { colspan: { default: 12, s: 6 } },
            { colspan: { default: 12, s: 6 } }
          ]}>
            <FormField
              label="Stream Retention Period"
              description="How long to retain video streams in Kinesis Video Streams"
              errorText={validationErrors.retentionPeriod}
            >
              <Select
                selectedOption={RETENTION_OPTIONS.find(option => option.value === formData.retentionPeriod) || null}
                onChange={({ detail }) => handleInputChange('retentionPeriod', detail.selectedOption?.value || '')}
                options={RETENTION_OPTIONS}
                placeholder="Select retention period"
                invalid={!!validationErrors.retentionPeriod}
                ariaLabel="Stream Retention Period"
              />
            </FormField>

            <FormField
              label="ML Model"
              description="Machine learning model to apply to this camera stream"
              errorText={validationErrors.mlModel}
            >
              <Select
                selectedOption={ML_MODEL_OPTIONS.find(option => option.value === formData.mlModel) || null}
                onChange={({ detail }) => handleInputChange('mlModel', detail.selectedOption?.value || '')}
                options={ML_MODEL_OPTIONS}
                placeholder="Select ML model"
                invalid={!!validationErrors.mlModel}
                ariaLabel="ML Model"
              />
            </FormField>
          </Grid>

          <FormField
            label="Frame Capture"
            description="Extract a preview frame during testing for visual verification"
          >
            <Checkbox
              checked={formData.captureFrame}
              onChange={({ detail }) => handleInputChange('captureFrame', detail.checked)}
            >
              Capture test frame
            </Checkbox>
          </FormField>

          {/* Action Buttons */}
          <Box key="action-buttons" textAlign="center">
            <SpaceBetween direction="horizontal" size="s">
              <Button
                variant="normal"
                onClick={testRTSPStream}
                loading={isLoading}
                loadingText="Testing Stream..."
                disabled={isSaving}
              >
                {isLoading ? '🔄 Testing...' : '🧪 Test Stream'}
              </Button>
              
              <Button
                variant="primary"
                onClick={saveCamera}
                loading={isSaving}
                loadingText="Saving Camera..."
                disabled={isLoading}
              >
                {isSaving ? '💾 Saving...' : '💾 Save Camera'}
              </Button>
            </SpaceBetween>
          </Box>

          {isLoading && (
            <Box key="loading-indicator" textAlign="center">
              <SpaceBetween size="s">
                <Spinner key="loading-spinner" />
                <Box key="loading-text" fontSize="body-s" color="text-body-secondary">
                  ⏱️ Testing RTSP connection and gathering stream metadata...
                </Box>
              </SpaceBetween>
            </Box>
          )}

          {isSaving && (
            <Box key="saving-indicator" textAlign="center">
              <SpaceBetween size="s">
                <Spinner key="saving-spinner" />
                <Box key="saving-text" fontSize="body-s" color="text-body-secondary">
                  💾 Saving camera configuration and securing RTSP credentials...
                </Box>
              </SpaceBetween>
            </Box>
          )}

          {saveSuccess && (
            <Alert type="success" header="✅ Camera Saved Successfully!">
              Camera configuration has been saved. RTSP URL is securely stored in AWS Secrets Manager.
            </Alert>
          )}
        </SpaceBetween>
      </Container>

      {/* Test Results Section */}
      {(testResult || isLoading) && (
        <Container
          header={<Header variant="h3">Stream Test Results</Header>}
        >
          {isLoading && (
            <Box key="test-loading" textAlign="center" padding="l">
              <SpaceBetween size="s">
                <Spinner key="test-spinner" />
                <Box key="test-loading-text" fontSize="heading-m" fontWeight="bold">
                  🔍 Analyzing RTSP stream...
                </Box>
              </SpaceBetween>
            </Box>
          )}

          {testResult && !isLoading && (
            <SpaceBetween size="m">
              {testResult.error ? (
                <Alert key="test-error" type="error" header="❌ Stream Test Failed">
                  <SpaceBetween size="s">
                    <Box key="error-message">{testResult.error}</Box>
                    {testResult.suggestion && (
                      <Box key="error-suggestion">
                        <Box fontWeight="bold">💡 Suggestion:</Box>
                        <Box fontSize="body-s">{testResult.suggestion}</Box>
                      </Box>
                    )}
                  </SpaceBetween>
                </Alert>
              ) : testResult.stream_characteristics ? (
                renderStreamInfo(testResult.stream_characteristics)
              ) : (
                <Alert key="unexpected-response" type="warning" header="Unexpected Response">
                  Unexpected response format received from server
                </Alert>
              )}
            </SpaceBetween>
          )}
        </Container>
      )}
    </SpaceBetween>
  );
};

export default AddNewCamera;
