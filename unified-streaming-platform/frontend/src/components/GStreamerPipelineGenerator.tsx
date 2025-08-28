import React, { useState } from 'react';
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
import { apiUtils } from '../config/api';

interface GenerationResult {
  pipeline?: string;
  characteristics?: any;
  error?: string;
}

const GStreamerPipelineGenerator: React.FC = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedPipeline, setFormattedPipeline] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!rtspUrl.trim()) {
      setError('Please enter an RTSP URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setFormattedPipeline(null);

    try {
      console.log('🚀 Starting pipeline generation for URL:', rtspUrl);
      
      const response = await apiUtils.generatePipeline({
        rtsp_url: rtspUrl.trim(),
        mode: 'pipeline'
      });

      console.log('✅ Pipeline generation response:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      // Handle nested result structure
      const actualResult = response.result || response;
      setResult(actualResult);
      
      if (actualResult.pipeline) {
        const formatted = actualResult.pipeline
          .replace(/\s+/g, ' ')
          .replace(/\s*!\s*/g, ' ! ')
          .replace(/\s*=\s*/g, '=')
          .trim();
        
        setFormattedPipeline(formatted);
        console.log('📋 Formatted pipeline ready for display');
      } else {
        console.log('⚠️ No pipeline found in response:', actualResult);
      }

    } catch (err) {
      console.error('❌ Pipeline generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Pipeline generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const children = [
    <Container
      key="configuration-form"
      header={
        <Header variant="h2">
          ⚙️ GStreamer Pipeline Generator
        </Header>
      }
    >
      <SpaceBetween size="m">
        <Alert key="info-alert" type="info" header="GStreamer Pipeline Generator is now loaded and ready!">
          Generate optimized GStreamer pipelines for your RTSP camera streams. 
          This tool analyzes your stream characteristics and creates a custom pipeline 
          optimized for Amazon Kinesis Video Streams.
        </Alert>

        <FormField
          key="rtsp-url-field"
          label="RTSP URL for Pipeline Generation"
          description="Enter the complete RTSP URL including credentials (e.g., rtsp://user:pass@host:port/path)"
        >
          <Input
            value={rtspUrl}
            onChange={({ detail }) => setRtspUrl(detail.value)}
            placeholder="rtsp://username:password@192.168.1.100:554/stream1"
          />
        </FormField>

        <Box key="generate-button" textAlign="center">
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!rtspUrl.trim() || isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Generating Pipeline...' : '🚀 Generate GStreamer Pipeline'}
          </Button>
        </Box>

        {isLoading && (
          <Box key="loading-spinner" textAlign="center">
            <SpaceBetween size="s">
              <Spinner key="spinner"  />
              <Box key="loading-text" fontSize="body-s" color="text-body-secondary">
                ⏱️ Analyzing stream and generating optimized pipeline...
              </Box>
            </SpaceBetween>
          </Box>
        )}
      </SpaceBetween>
    </Container>
  ];

  if (error) {
    children.push(
      <Alert key="error-display" type="error" header="❌ Pipeline Generation Failed">
        <SpaceBetween size="s">
          <Box key="error-message">{error}</Box>
          <Box key="error-help" fontSize="body-s">
            Please verify your RTSP URL is correct and the stream is accessible.
          </Box>
        </SpaceBetween>
      </Alert>
    );
  }

  if (formattedPipeline) {
    children.push(
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
                    console.log('✅ Pipeline copied to clipboard successfully');
                  } catch (err) {
                    console.error('❌ Failed to copy pipeline to clipboard:', err);
                  }
                }}
              >
                📋 Copy Pipeline
              </Button>
            }
          >
            🎯 Generated GStreamer Pipeline
          </Header>
        }
      >
        <SpaceBetween size="m">
          <Alert key="success-alert" type="success" header="🎉 Pipeline Generated Successfully">
            Your optimized GStreamer pipeline is ready! This pipeline is customized 
            for your specific stream characteristics and can be used to ingest video 
            directly into Amazon Kinesis Video Streams.
          </Alert>

          <pre
            key="pipeline-code"
            style={{
              backgroundColor: '#f2f3f3',
              padding: '16px',
              borderRadius: '4px',
              border: '1px solid #d5dbdb',
              fontSize: '14px',
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.4',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {formattedPipeline}
          </pre>

          <Box key="usage-instructions">
            <Header variant="h3">📋 Usage Instructions</Header>
            <SpaceBetween size="s">
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
    );
  }

  if (!formattedPipeline && !isLoading && !error) {
    children.push(
      <Container
        key="help-container"
        header={<Header variant="h3">💡 How It Works</Header>}
      >
        <SpaceBetween size="s">
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
    );
  }

  return (
    <SpaceBetween size="l">
      {children}
    </SpaceBetween>
  );
};

export default GStreamerPipelineGenerator;
