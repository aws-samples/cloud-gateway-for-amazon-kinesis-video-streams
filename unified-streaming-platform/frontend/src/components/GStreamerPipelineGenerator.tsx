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
  Spinner
} from '@cloudscape-design/components';
import { apiUtils } from "../../config/api';
import type { 
  APIResponse, 
  RTSPTestRequest 
} from "../../config/api';

interface ValidationErrors {
  rtspUrl?: string;
}

const GStreamerPipelineGenerator: React.FC = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [generatedPipeline, setGeneratedPipeline] = useState<string>('');
  const [formattedPipeline, setFormattedPipeline] = useState<string>('');
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

  const formatPipelineForCLI = (pipeline: string): string => {
    if (!pipeline) return '';
    
    try {
      // Try to parse as JSON first (in case it's wrapped)
      const parsed = JSON.parse(pipeline);
      const pipelineText = parsed.pipeline || parsed.generated_pipeline || pipeline;
      
      // Format as multiline bash command (same as RTSP Stream Tester)
      const formatted = pipelineText
        .replace(/gst-launch-1\.0\s+/, 'gst-launch-1.0 \\\n  ')
        .replace(/\s+!\s+/g, ' \\\n  ! ')
        .replace(/\s+rtpmp4adepay/g, ' \\\n  rtpmp4adepay')
        .replace(/\s+kvssink/g, ' \\\n  kvssink');
      
      console.log('🔧 Formatted pipeline:', JSON.stringify(formatted));
      return formatted;
    } catch {
      // If not JSON, format the raw pipeline text (same as RTSP Stream Tester)
      const formatted = pipeline
        .replace(/gst-launch-1\.0\s+/, 'gst-launch-1.0 \\\n  ')
        .replace(/\s+!\s+/g, ' \\\n  ! ')
        .replace(/\s+rtpmp4adepay/g, ' \\\n  rtpmp4adepay')
        .replace(/\s+kvssink/g, ' \\\n  kvssink');
      
      console.log('🔧 Formatted pipeline (raw):', JSON.stringify(formatted));
      return formatted;
    }
  };

  const generatePipeline = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedPipeline('');
    setFormattedPipeline('');

    try {
      // Call the lambda function in pipeline mode
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: rtspUrl,
        mode: 'pipeline',
        capture_frame: false
      };

      console.log('🔧 Generating GStreamer pipeline:', pipelinePayload);
      const response = await apiUtils.generatePipeline(pipelinePayload);
      console.log('✅ Pipeline Response:', response);

      // Parse the response to extract the pipeline
      let pipelineText = '';
      
      if (typeof response === 'string') {
        try {
          // If response is a JSON string, parse it
          const parsedResponse = JSON.parse(response);
          pipelineText = parsedResponse.pipeline || parsedResponse.generated_pipeline || '';
        } catch (parseError) {
          // If parsing fails, treat the entire response as the pipeline
          pipelineText = response;
        }
      } else if (response && typeof response === 'object') {
        // If response is already an object, extract the pipeline
        pipelineText = response.generated_pipeline || response.pipeline || '';
      }

      if (pipelineText && pipelineText.trim()) {
        setGeneratedPipeline(pipelineText);
        setFormattedPipeline(formatPipelineForCLI(pipelineText));
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
    <SpaceBetween >
      <Container
        key="configuration-form"
        header={
          <Header variant="h2">
            ⚙️ GStreamer Pipeline Generator
          </Header>
        }
      >
        <SpaceBetween >
          {/* Test status element */}
          <Alert key="info-alert" type="info" header="GStreamer Pipeline Generator is now loaded and ready!">
            Generate optimized GStreamer pipelines for your RTSP camera streams. 
            This tool analyzes your stream characteristics and creates a custom pipeline 
            for ingesting video to Amazon Kinesis Video Streams.
          </Alert>

          <FormField
            key="rtsp-url-field"
            label="RTSP URL for Pipeline Generation"
            description="Enter the complete RTSP URL including credentials (e.g., rtsp://user:pass@host:port/path)"
            errorText={validationErrors.rtspUrl}
          >
            <Input
              value={rtspUrl}
              onChange={({ detail }) => handleRtspUrlChange(detail.value)}
              placeholder="rtsp://username:password@camera-ip:554/stream"
              invalid={!!validationErrors.rtspUrl}
              ariaLabel="RTSP URL for Pipeline Generation"
            />
          </FormField>

          <Box key="generate-button" textAlign="center">
            <Button
              variant="primary"
              onClick={generatePipeline}
              loading={isLoading}
              loadingText="Generating Pipeline..."
              
            >
              {isLoading ? '🔄 Generating GStreamer Pipeline...' : '🚀 Generate GStreamer Pipeline'}
            </Button>
          </Box>

          {isLoading && (
            <Box key="loading-spinner" textAlign="center">
              <SpaceBetween >
                <Spinner key="spinner"  />
                <Box key="loading-text" fontSize="body-s" color="text-body-secondary">
                  ⏱️ Analyzing stream and generating optimized pipeline...
                </Box>
              </SpaceBetween>
            </Box>
          )}
        </SpaceBetween>
      </Container>

      {error && (
        <Alert key="error-display" type="error" header="❌ Pipeline Generation Failed">
          <SpaceBetween >
            <Box key="error-message">{error}</Box>
            <Box key="error-help" fontSize="body-s">
              Please verify your RTSP URL is correct and the stream is accessible.
            </Box>
          </SpaceBetween>
        </Alert>
      )}

      {formattedPipeline && (
        <Container
          key="pipeline-container"
          header={
            <Header 
              variant="h3"
              actions={
                <Button
                  onClick={async () => {
                    console.log('🔧 Copy button clicked, formattedPipeline:', formattedPipeline);
                    try {
                      await navigator.clipboard.writeText(formattedPipeline);
                      console.log('✅ Clipboard write successful');
                    } catch (error) {
                      console.error('❌ Failed to copy to clipboard:', error);
                    }
                  }}
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
          <SpaceBetween >
            <Alert key="success-alert" type="success" header="🎉 Pipeline Generated Successfully">
              Your optimized GStreamer pipeline is ready! This pipeline is customized 
              for your specific stream characteristics and can be used to ingest video 
              to Amazon Kinesis Video Streams.
            </Alert>

            <pre
              key="pipeline-code"
              style={{
                backgroundColor: '#f2f3f3',
                borderRadius: '4px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                fontSize: '14px',
                overflow: 'auto',
                border: '1px solid #d5dbdb',
                maxHeight: '400px',
                padding: '16px',
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {formattedPipeline}
            </pre>

            <Box key="usage-instructions">
              <Header variant="h3">📋 Usage Instructions</Header>
              <SpaceBetween >
                <Box key="step-1">
                  <strong>1. Copy the pipeline command</strong> - Click "Copy Pipeline" or select and copy the formatted command above
                </Box>
                <Box key="step-2">
                  <strong>2. Open your terminal</strong> - The command is formatted with line continuations (\) for easy reading
                </Box>
                <Box key="step-3">
                  <strong>3. Set AWS credentials</strong> - Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION are set
                </Box>
                <Box key="step-4">
                  <strong>4. Install dependencies</strong> - Make sure GStreamer and the Kinesis Video Streams plugin are installed
                </Box>
                <Box key="step-5">
                  <strong>5. Paste and run</strong> - The command can be pasted directly into your terminal and will execute properly
                </Box>
              </SpaceBetween>
            </Box>
          </SpaceBetween>
        </Container>
      )}

      {!formattedPipeline && !isLoading && !error && (
        <Container
          key="help-container"
          header={<Header variant="h3">💡 How It Works</Header>}
        >
          <SpaceBetween >
            <Box key="step-1">
              <strong>Step 1:</strong> Enter your RTSP camera URL with credentials
            </Box>
            <Box key="step-2">
              <strong>Step 2:</strong> Click "Generate GStreamer Pipeline" to analyze your stream
            </Box>
            <Box key="step-3">
              <strong>Step 3:</strong> Get a customized GStreamer pipeline optimized for your camera
            </Box>
            <Box key="step-4">
              <strong>Step 4:</strong> Use the pipeline to stream video to Amazon Kinesis Video Streams
            </Box>
          </SpaceBetween>
        </Container>
      )}
    </SpaceBetween>
  );
};

export default GStreamerPipelineGenerator;
