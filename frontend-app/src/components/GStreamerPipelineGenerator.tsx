import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  FormField,
  Input,
  Button,
  Alert,
  CodeView,
  Box,
  Spinner
} from '@cloudscape-design/components';
import { apiUtils } from '../config/api';
import type { 
  APIResponse, 
  RTSPTestRequest 
} from '../config/api';

interface ValidationErrors {
  rtspUrl?: string;
}

const GStreamerPipelineGenerator: React.FC = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [generatedPipeline, setGeneratedPipeline] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate RTSP URL
    if (!rtspUrl.trim()) {
      errors.rtspUrl = 'RTSP URL is required';
    } else {
      const urlValidation = apiUtils.validateRTSPUrl(rtspUrl);
      if (!urlValidation.isValid) {
        errors.rtspUrl = urlValidation.error || 'Invalid RTSP URL';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const generatePipeline = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedPipeline('');

    try {
      // Call the lambda function in pipeline mode
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: rtspUrl,
        mode: 'pipeline',
        capture_frame: false
      };

      console.log('🔧 Generating GStreamer pipeline:', pipelinePayload);
      const response = await apiUtils.makeRequest(pipelinePayload);
      console.log('✅ Pipeline Response:', response);

      if (response.generated_pipeline) {
        setGeneratedPipeline(response.generated_pipeline);
      } else if (response.error) {
        setError(response.error);
      } else {
        setError('No pipeline was generated. Please check your RTSP URL and try again.');
      }

    } catch (error) {
      console.error('❌ Pipeline Generation Error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRtspUrlChange = (value: string) => {
    setRtspUrl(value);
    // Clear validation error when user starts typing
    if (validationErrors.rtspUrl) {
      setValidationErrors(prev => ({ ...prev, rtspUrl: undefined }));
    }
  };

  return (
    <SpaceBetween size="l">
      {/* Configuration Form */}
      <Container
        header={
          <Header variant="h2">
            ⚙️ GStreamer Pipeline Generator
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Box>
            Generate optimized GStreamer pipelines for your RTSP camera streams. 
            This tool analyzes your stream characteristics and creates a custom pipeline 
            for ingesting video to Amazon Kinesis Video Streams.
          </Box>

          <FormField
            label="RTSP URL"
            description="Enter the complete RTSP URL including credentials (e.g., rtsp://user:pass@host:port/path)"
            errorText={validationErrors.rtspUrl}
          >
            <Input
              value={rtspUrl}
              onChange={({ detail }) => handleRtspUrlChange(detail.value)}
              placeholder="rtsp://username:password@camera-ip:554/stream"
              invalid={!!validationErrors.rtspUrl}
            />
          </FormField>

          <Box textAlign="center">
            <Button
              variant="primary"
              onClick={generatePipeline}
              loading={isLoading}
              loadingText="Generating Pipeline..."
              size="large"
            >
              {isLoading ? '🔄 Generating GStreamer Pipeline...' : '🚀 Generate GStreamer Pipeline'}
            </Button>
          </Box>

          {isLoading && (
            <Box textAlign="center">
              <SpaceBetween size="s">
                <Spinner size="large" />
                <Box fontSize="body-s" color="text-body-secondary">
                  ⏱️ Analyzing stream and generating optimized pipeline...
                </Box>
              </SpaceBetween>
            </Box>
          )}
        </SpaceBetween>
      </Container>

      {/* Error Display */}
      {error && (
        <Alert type="error" header="❌ Pipeline Generation Failed">
          <SpaceBetween size="s">
            <Box>{error}</Box>
            <Box fontSize="body-s">
              Please verify your RTSP URL is correct and the stream is accessible.
            </Box>
          </SpaceBetween>
        </Alert>
      )}

      {/* Generated Pipeline Display */}
      {generatedPipeline && (
        <Container
          header={
            <Header 
              variant="h3"
              actions={
                <Button
                  onClick={() => navigator.clipboard.writeText(generatedPipeline)}
                  iconName="copy"
                >
                  Copy Pipeline
                </Button>
              }
            >
              ✅ Generated GStreamer Pipeline
            </Header>
          }
        >
          <SpaceBetween size="m">
            <Alert type="success" header="🎉 Pipeline Generated Successfully">
              Your optimized GStreamer pipeline is ready! This pipeline is customized 
              for your specific stream characteristics and can be used to ingest video 
              to Amazon Kinesis Video Streams.
            </Alert>

            <CodeView
              content={generatedPipeline}
              highlight="bash"
            />

            <Box>
              <Header variant="h4">📋 Usage Instructions</Header>
              <SpaceBetween size="s">
                <Box>
                  1. Copy the pipeline command above
                </Box>
                <Box>
                  2. Install GStreamer and the Kinesis Video Streams plugin on your system
                </Box>
                <Box>
                  3. Set your AWS credentials and region
                </Box>
                <Box>
                  4. Run the pipeline command to start streaming to Kinesis Video Streams
                </Box>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      )}

      {/* Help Section */}
      {!generatedPipeline && !isLoading && !error && (
        <Container
          header={<Header variant="h3">💡 How It Works</Header>}
        >
          <SpaceBetween size="m">
            <Box>
              <strong>Step 1:</strong> Enter your RTSP camera URL with credentials
            </Box>
            <Box>
              <strong>Step 2:</strong> Click "Generate GStreamer Pipeline" to analyze your stream
            </Box>
            <Box>
              <strong>Step 3:</strong> Get a customized GStreamer pipeline optimized for your camera
            </Box>
            <Box>
              <strong>Step 4:</strong> Use the pipeline to stream video to Amazon Kinesis Video Streams
            </Box>
          </SpaceBetween>
        </Container>
      )}
    </SpaceBetween>
  );
};

export default GStreamerPipelineGenerator;
