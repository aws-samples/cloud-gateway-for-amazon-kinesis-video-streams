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
      console.log('🔍 Actual result object:', actualResult);
      console.log('🔍 Available fields:', Object.keys(actualResult));
      
      // Check for errors in the response
      if (actualResult.optimization_response && actualResult.optimization_response.includes('Error')) {
        const errorMsg = actualResult.optimization_response;
        if (errorMsg.includes('ThrottlingException') || errorMsg.includes('Too many tokens')) {
          throw new Error('Bedrock service is currently busy. Please wait a few minutes and try again.');
        } else if (errorMsg.includes('AccessDeniedException')) {
          throw new Error('Service configuration issue. Please contact support.');
        } else {
          throw new Error(`Pipeline generation failed: ${errorMsg}`);
        }
      }
      
      setResult(actualResult);
      
      // Display the full optimization response which contains expert analysis
      const fullResponse = actualResult.optimization_response || 
                           actualResult.response ||
                           'No detailed response available';
                      
      console.log('📋 Got full expert response');
      setFormattedPipeline(fullResponse);

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
        <Alert key="info-alert" type="info" header="GStreamer Expert System is ready!">
          Get comprehensive GStreamer assistance powered by AI. This expert system analyzes your requirements 
          and provides detailed guidance, pipeline recommendations, troubleshooting tips, and optimization strategies.
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
          <Header variant="h3">
            🧠 GStreamer Expert Analysis
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
            <Header variant="h3">📋 How to Use This Analysis</Header>
            <SpaceBetween size="s">
              <Box key="step-1">
                <strong>1. Review the expert analysis</strong> - The response includes pipeline recommendations, explanations, and alternatives
              </Box>
              <Box key="step-2">
                <strong>2. Copy pipeline commands</strong> - Select and copy any gst-launch commands from the analysis above
              </Box>
              <Box key="step-3">
                <strong>3. Set AWS credentials</strong> - Ensure AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_DEFAULT_REGION are set
              </Box>
              <Box key="step-4">
                <strong>4. Install dependencies</strong> - Make sure GStreamer and the Kinesis Video Streams plugin are installed
              </Box>
              <Box key="step-5">
                <strong>5. Test and customize</strong> - Use the provided guidance to adapt the pipeline for your specific needs
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
        header={<Header variant="h3">🧠 How the Expert System Works</Header>}
      >
        <SpaceBetween size="s">
          <Box key="step-1">
            <strong>Step 1:</strong> Enter your RTSP camera URL or describe your GStreamer requirements
          </Box>
          <Box key="step-2">
            <strong>Step 2:</strong> Click "Generate GStreamer Pipeline" to get expert analysis
          </Box>
          <Box key="step-3">
            <strong>Step 3:</strong> Receive comprehensive guidance including pipeline recommendations, explanations, and alternatives
          </Box>
          <Box key="step-4">
            <strong>Step 4:</strong> Use the expert advice to implement and customize your GStreamer solution
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
