import React, { useState } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Select,
  Button,
  Alert,
  Spinner,
  Box,
  Badge,
  ColumnLayout,
  StatusIndicator,
  CodeEditor
} from '@cloudscape-design/components';
import { apiUtils } from '../config/api';
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from '../config/api';
import type { AuthUser } from "aws-amplify/auth";

// Test server URLs from our RTSP test server
const TEST_STREAM_OPTIONS = [
  { value: '', label: 'Select a test stream...' },
  { value: 'rtsp://44.215.108.66:8554/h264_360p_15fps', label: 'H.264 360p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8554/h264_360p_15fps_aac', label: 'H.264 360p 15fps + AAC Audio' },
  { value: 'rtsp://44.215.108.66:8554/h264_480p_20fps', label: 'H.264 480p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8554/h264_720p_25fps', label: 'H.264 720p 25fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8554/h265_360p_15fps', label: 'H.265 360p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8554/h265_360p_15fps_aac', label: 'H.265 360p 15fps + AAC Audio' },
  { value: 'rtsp://44.215.108.66:8554/h265_480p_20fps', label: 'H.265 480p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8554/h265_720p_25fps', label: 'H.265 720p 25fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg2_360p_15fps', label: 'MPEG-2 360p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg2_360p_15fps_aac', label: 'MPEG-2 360p 15fps + AAC Audio' },
  { value: 'rtsp://44.215.108.66:8555/mpeg2_480p_20fps', label: 'MPEG-2 480p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg2_720p_25fps', label: 'MPEG-2 720p 25fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg4_360p_15fps', label: 'MPEG-4 360p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg4_360p_15fps_aac', label: 'MPEG-4 360p 15fps + AAC Audio' },
  { value: 'rtsp://44.215.108.66:8555/mpeg4_480p_20fps', label: 'MPEG-4 480p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8555/mpeg4_720p_25fps', label: 'MPEG-4 720p 25fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8556/mjpeg_360p_10fps', label: 'MJPEG 360p 10fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8556/mjpeg_360p_10fps_g711', label: 'MJPEG 360p 10fps + G.711 Audio' },
  { value: 'rtsp://44.215.108.66:8556/mjpeg_480p_15fps', label: 'MJPEG 480p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8556/mjpeg_720p_20fps', label: 'MJPEG 720p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8557/theora_360p_15fps', label: 'Theora 360p 15fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8557/theora_360p_15fps_aac', label: 'Theora 360p 15fps + AAC Audio' },
  { value: 'rtsp://44.215.108.66:8557/theora_480p_20fps', label: 'Theora 480p 20fps (No Audio)' },
  { value: 'rtsp://44.215.108.66:8557/theora_720p_25fps', label: 'Theora 720p 25fps (No Audio)' }
];

interface QuickStreamTesterProps {
  user?: AuthUser;
}

const QuickStreamTester: React.FC<QuickStreamTesterProps> = ({ user }) => {
  const [selectedStream, setSelectedStream] = useState({ value: '', label: 'Select a test stream...' });
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const testRTSPStream = async () => {
    if (!selectedStream.value) {
      return;
    }

    // Clear previous results
    setTestResult(null);
    setPreviewImage(null);
    setIsLoading(true);

    try {
      // Get stream characteristics with frame capture
      const characteristicsPayload: RTSPTestRequest = {
        rtsp_url: selectedStream.value,
        mode: 'characteristics',
        capture_frame: true
      };

      console.log('🚀 Testing RTSP stream characteristics:', characteristicsPayload);
      const characteristicsData = await apiUtils.makeRequest(characteristicsPayload);
      console.log('✅ Characteristics Response:', characteristicsData);

      // Then, get the pipeline recommendation
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: selectedStream.value,
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
        setPreviewImage(frameData);
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
      <SpaceBetween size="l">
        <Alert type="success">
          <Box fontWeight="bold">✅ Stream Analysis Complete</Box>
        </Alert>

        <ColumnLayout columns={2} variant="text-grid">
          {/* Video Information */}
          <Container header={<Header variant="h3">📹 Video Stream</Header>}>
            {video ? (
              <SpaceBetween size="xs">
                <Box>
                  <Box display="inline" fontWeight="bold">Codec: </Box>
                  <Badge color="blue">{video.codec || 'Unknown'}</Badge>
                </Box>
                <Box>
                  <Box display="inline" fontWeight="bold">Frame Rate: </Box>
                  {video.framerate || 'Unknown'}
                </Box>
                <Box>
                  <Box display="inline" fontWeight="bold">Bitrate: </Box>
                  {video.bitrate || 'Unknown'}
                </Box>
                {video.profile && (
                  <Box>
                    <Box display="inline" fontWeight="bold">Profile: </Box>
                    {video.profile}
                  </Box>
                )}
              </SpaceBetween>
            ) : (
              <Box color="text-body-secondary">No video stream detected</Box>
            )}
          </Container>

          {/* Audio Information */}
          <Container header={<Header variant="h3">🔊 Audio Stream</Header>}>
            {audio && Object.keys(audio).length > 0 ? (
              <SpaceBetween size="xs">
                <Box>
                  <Box display="inline" fontWeight="bold">Codec: </Box>
                  <Badge color="green">{audio.codec || 'Unknown'}</Badge>
                </Box>
                <Box>
                  <Box display="inline" fontWeight="bold">Sample Rate: </Box>
                  {audio.sample_rate || 'Unknown'}
                </Box>
                {audio.channels && (
                  <Box>
                    <Box display="inline" fontWeight="bold">Channels: </Box>
                    {audio.channels}
                  </Box>
                )}
              </SpaceBetween>
            ) : (
              <Box color="text-body-secondary">No audio stream detected</Box>
            )}
          </Container>
        </ColumnLayout>

        {/* Connection Information */}
        <Container header={<Header variant="h3">🔗 Connection Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xs">
              <Box>
                <Box display="inline" fontWeight="bold">Authentication: </Box>
                <StatusIndicator type={connection?.authentication_method === 'None' ? 'success' : 'warning'}>
                  {connection?.authentication_method || 'Unknown'}
                </StatusIndicator>
              </Box>
              <Box>
                <Box display="inline" fontWeight="bold">Connection Time: </Box>
                {connection?.connection_time || 'Not measured'}
              </Box>
            </SpaceBetween>
            {diagnostics && (
              <SpaceBetween size="xs">
                <Box>
                  <Box display="inline" fontWeight="bold">Errors: </Box>
                  <Badge color={diagnostics.errors?.length > 0 ? 'red' : 'green'}>
                    {diagnostics.errors?.length || 0}
                  </Badge>
                </Box>
                <Box>
                  <Box display="inline" fontWeight="bold">Warnings: </Box>
                  <Badge color={diagnostics.warnings?.length > 0 ? 'grey' : 'green'}>
                    {diagnostics.warnings?.length || 0}
                  </Badge>
                </Box>
              </SpaceBetween>
            )}
          </ColumnLayout>
        </Container>

        {/* Diagnostics Details */}
        {diagnostics && (diagnostics.errors?.length > 0 || diagnostics.warnings?.length > 0) && (
          <Container header={<Header variant="h3">🔍 Diagnostics</Header>}>
            <SpaceBetween size="m">
              {diagnostics.errors?.length > 0 && (
                <SpaceBetween size="xs">
                  <Box fontWeight="bold" color="text-status-error">Errors:</Box>
                  {diagnostics.errors.map((error, index) => (
                    <Alert key={index} type="error">{error}</Alert>
                  ))}
                </SpaceBetween>
              )}
              
              {diagnostics.warnings?.length > 0 && (
                <SpaceBetween size="xs">
                  <Box fontWeight="bold" color="text-status-warning">Warnings:</Box>
                  {diagnostics.warnings.map((warning, index) => (
                    <Alert key={index} type="warning">{warning}</Alert>
                  ))}
                </SpaceBetween>
              )}
            </SpaceBetween>
          </Container>
        )}
      </SpaceBetween>
    );
  };

  const renderPipelineRecommendation = (pipeline: string) => {
    return (
      <Container header={<Header variant="h3">⚙️ Recommended GStreamer Pipeline</Header>}>
        <SpaceBetween size="m">
          <Box 
            padding="m"
            backgroundColor="background-code-editor"
            borderRadius="s"
            fontFamily="monospace"
            fontSize="body-s"
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {pipeline}
            </pre>
          </Box>
          <Box fontSize="body-s" color="text-body-secondary">
            💡 This pipeline is optimized for your stream's characteristics and can be used with GStreamer or AWS services.
          </Box>
        </SpaceBetween>
      </Container>
    );
  };

  return (
    <SpaceBetween size="l">
      <Container>
        <SpaceBetween size="l">
          <Header 
            variant="h1" 
            description="Test our demo RTSP streams with various codecs and configurations. Simply select a stream and click 'Test Stream' to analyze its characteristics and get a recommended GStreamer pipeline."
            info={
              user && (
                <Box display="inline" color="text-body-secondary">
                  Welcome back, {user.username}
                </Box>
              )
            }
          >
            🚀 Quick Stream Tester
          </Header>

          {/* Stream Selection Form */}
          <Container header={<Header variant="h3">📺 Select Test Stream</Header>}>
            <SpaceBetween size="m">
              <Select
                selectedOption={selectedStream}
                onChange={({ detail }) => setSelectedStream(detail.selectedOption)}
                options={TEST_STREAM_OPTIONS}
                placeholder="Choose a test stream..."
                expandToViewport
              />

              <Box textAlign="right">
                <Button
                  onClick={testRTSPStream}
                  disabled={!selectedStream.value || isLoading}
                  variant="primary"
                  loading={isLoading}
                  loadingText="Testing..."
                >
                  🧪 Test Stream
                </Button>
              </Box>
            </SpaceBetween>
          </Container>

          {/* Preview Image */}
          {previewImage && (
            <Container header={<Header variant="h3">📸 Captured Frame</Header>}>
              <Box textAlign="center">
                <img
                  src={`data:image/jpeg;base64,${previewImage}`}
                  alt="Captured frame from RTSP stream"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    border: '2px solid var(--color-border-divider-default)',
                    borderRadius: '8px'
                  }}
                />
              </Box>
            </Container>
          )}

          {/* Results */}
          {testResult && (
            <SpaceBetween size="l">
              {testResult.error ? (
                <Alert type="error" header="❌ Test Failed">
                  <SpaceBetween size="s">
                    <Box>{testResult.error}</Box>
                    {testResult.error_type && (
                      <Box fontSize="body-s">Error Type: {testResult.error_type}</Box>
                    )}
                  </SpaceBetween>
                </Alert>
              ) : (
                <SpaceBetween size="l">
                  {testResult.stream_characteristics && renderStreamInfo(testResult.stream_characteristics)}
                  {testResult.generated_pipeline && renderPipelineRecommendation(testResult.generated_pipeline)}
                </SpaceBetween>
              )}
            </SpaceBetween>
          )}
        </SpaceBetween>
      </Container>
    </SpaceBetween>
  );
};

export default QuickStreamTester;
