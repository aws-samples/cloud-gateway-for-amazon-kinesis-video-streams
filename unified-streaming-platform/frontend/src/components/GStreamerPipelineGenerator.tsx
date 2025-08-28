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
  Spinner,
  Select
} from '@cloudscape-design/components';
import { apiUtils } from '../config/api';

interface GenerationResult {
  pipeline?: string;
  characteristics?: any;
  error?: string;
}

const GStreamerPipelineGenerator: React.FC = () => {
  const [rtspUrl, setRtspUrl] = useState('');
  const [targetEnvironment, setTargetEnvironment] = useState(() => 
    localStorage.getItem('gstreamer-target-environment') || 'linux-ubuntu'
  );
  const [hardwareAcceleration, setHardwareAcceleration] = useState(() => 
    localStorage.getItem('gstreamer-hardware-acceleration') || 'auto'
  );
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
        mode: 'pipeline',
        platform: targetEnvironment,
        hardware_acceleration: hardwareAcceleration
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
    // Help section first - explains how the system works
    <Container
      key="help-container"
      header={<Header variant="h3">🧠 How the Expert System Works</Header>}
    >
      <SpaceBetween size="s">
        <Box key="step-1">
          <strong>Step 1:</strong> Enter your RTSP camera URL or describe your GStreamer requirements
        </Box>
        <Box key="step-2">
          <strong>Step 2:</strong> Select your target environment and hardware acceleration preferences
        </Box>
        <Box key="step-3">
          <strong>Step 3:</strong> Click "Generate GStreamer Pipeline" to get expert analysis
        </Box>
        <Box key="step-4">
          <strong>Step 4:</strong> Receive comprehensive guidance including pipeline recommendations, explanations, and alternatives
        </Box>
        <Box key="step-5">
          <strong>Step 5:</strong> Use the expert advice to implement and customize your GStreamer solution
        </Box>
      </SpaceBetween>
    </Container>,
    
    // Main configuration form
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

        <FormField
          key="target-environment-field"
          label="Target Execution Environment"
          description="Select the specific operating system and distribution"
        >
          <Select
            selectedOption={{ 
              label: targetEnvironment === 'linux-ubuntu' ? 'Linux (Ubuntu/Debian)' : 
                     targetEnvironment === 'linux-rhel' ? 'Linux (RHEL/CentOS/Fedora)' :
                     targetEnvironment === 'linux-arch' ? 'Linux (Arch/Manjaro)' :
                     targetEnvironment === 'macos-intel' ? 'macOS (Intel)' :
                     targetEnvironment === 'macos-apple' ? 'macOS (Apple Silicon)' :
                     targetEnvironment === 'windows' ? 'Windows' :
                     'Docker/Container', 
              value: targetEnvironment 
            }}
            onChange={({ detail }) => {
              const value = detail.selectedOption.value || 'linux-ubuntu';
              setTargetEnvironment(value);
              localStorage.setItem('gstreamer-target-environment', value);
            }}
            options={[
              { label: 'Linux (Ubuntu/Debian)', value: 'linux-ubuntu' },
              { label: 'Linux (RHEL/CentOS/Fedora)', value: 'linux-rhel' },
              { label: 'Linux (Arch/Manjaro)', value: 'linux-arch' },
              { label: 'macOS (Intel)', value: 'macos-intel' },
              { label: 'macOS (Apple Silicon)', value: 'macos-apple' },
              { label: 'Windows', value: 'windows' },
              { label: 'Docker/Container', value: 'docker' }
            ]}
            placeholder="Choose target environment"
          />
        </FormField>

        <FormField
          key="hardware-acceleration-field"
          label="Hardware Acceleration Preference"
          description="Select your preferred acceleration method (choose 'Auto-detect' if unsure)"
        >
          <Select
            selectedOption={{ 
              label: hardwareAcceleration === 'auto' ? 'Auto-detect (Recommended)' :
                     hardwareAcceleration === 'gpu-nvidia' ? 'GPU (NVIDIA)' :
                     hardwareAcceleration === 'gpu-amd' ? 'GPU (AMD)' :
                     hardwareAcceleration === 'gpu-intel' ? 'GPU (Intel)' :
                     hardwareAcceleration === 'cpu' ? 'CPU Only' :
                     'Software Only', 
              value: hardwareAcceleration 
            }}
            onChange={({ detail }) => {
              const value = detail.selectedOption.value || 'auto';
              setHardwareAcceleration(value);
              localStorage.setItem('gstreamer-hardware-acceleration', value);
            }}
            options={[
              { label: 'Auto-detect (Recommended)', value: 'auto' },
              { label: 'GPU (NVIDIA)', value: 'gpu-nvidia' },
              { label: 'GPU (AMD)', value: 'gpu-amd' },
              { label: 'GPU (Intel)', value: 'gpu-intel' },
              { label: 'CPU Only', value: 'cpu' },
              { label: 'Software Only', value: 'software' }
            ]}
            placeholder="Choose acceleration preference"
          />
        </FormField>

        {/* Hardware Detection Help */}
        <Alert
          key="hardware-detection-help"
          type="info"
          header="🔍 Need help detecting your hardware capabilities?"
        >
          <SpaceBetween size="s">
            <Box>
              <strong>Run these commands to detect your hardware:</strong>
            </Box>
            
            {targetEnvironment.startsWith('linux') && (
              <Box>
                <strong>Linux:</strong>
                <Box variant="code">
                  # Check GPU<br/>
                  lspci | grep -i vga<br/>
                  nvidia-smi  # For NVIDIA<br/>
                  lshw -c video  # General GPU info<br/><br/>
                  # Check GStreamer plugins<br/>
                  gst-inspect-1.0 | grep -i nvenc  # NVIDIA<br/>
                  gst-inspect-1.0 | grep -i vaapi  # Intel/AMD<br/>
                  gst-inspect-1.0 | grep -i v4l2   # Hardware codecs
                </Box>
              </Box>
            )}
            
            {targetEnvironment.startsWith('macos') && (
              <Box>
                <strong>macOS:</strong>
                <Box variant="code">
                  # Check hardware<br/>
                  system_profiler SPDisplaysDataType<br/>
                  sysctl machdep.cpu.brand_string<br/><br/>
                  # Check GStreamer plugins<br/>
                  gst-inspect-1.0 | grep -i vtenc  # VideoToolbox<br/>
                  gst-inspect-1.0 | grep -i applemedia
                </Box>
              </Box>
            )}
            
            {targetEnvironment === 'windows' && (
              <Box>
                <strong>Windows:</strong>
                <Box variant="code">
                  # Check GPU<br/>
                  dxdiag  # DirectX Diagnostics<br/>
                  wmic path win32_VideoController get name<br/><br/>
                  # Check GStreamer plugins<br/>
                  gst-inspect-1.0.exe | findstr nvenc  # NVIDIA<br/>
                  gst-inspect-1.0.exe | findstr d3d11  # DirectX<br/>
                  gst-inspect-1.0.exe | findstr mf     # Media Foundation
                </Box>
              </Box>
            )}
          </SpaceBetween>
        </Alert>

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

  return (
    <SpaceBetween size="l">
      {children}
    </SpaceBetween>
  );
};

export default GStreamerPipelineGenerator;
