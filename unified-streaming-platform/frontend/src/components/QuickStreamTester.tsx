import { useState, useEffect } from 'react';
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
import { apiUtils } from "../../config/api";
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest,
  RTSPStreamInfo
} from "../../config/api";

interface StreamOption {
  value: string;
  label: string;
}

const QuickStreamTester: React.FC = () => {
  const [streamOptions, setStreamOptions] = useState<StreamOption[]>([
    { value: '', label: 'Loading test streams...' }
  ]);
  const [selectedStream, setSelectedStream] = useState<StreamOption>({ value: '', label: 'Loading test streams...' });
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loadingStreams, setLoadingStreams] = useState(true);

  // Load RTSP test streams on component mount
  useEffect(() => {
    const loadTestStreams = async () => {
      try {
        const streamsData = await apiUtils.getRTSPTestStreams();
        
        if (streamsData && streamsData.rtsp_urls.length > 0) {
          const options: StreamOption[] = [
            { value: '', label: 'Select a test stream...' },
            ...streamsData.rtsp_urls.map((stream: RTSPStreamInfo) => ({
              value: stream.url,
              label: stream.description
            }))
          ];
          
          setStreamOptions(options);
          setSelectedStream({ value: '', label: 'Select a test stream...' });
          console.log(`✅ Loaded ${streamsData.rtsp_urls.length} test streams from RTSP server`);
        } else {
          // Fallback to hardcoded streams if API fails
          console.warn('⚠️ RTSP test server unavailable, using fallback streams');
          setStreamOptions([
            { value: '', label: 'Select a test stream...' },
            { value: 'rtsp://3.94.214.20:8554/h264_720p_25fps', label: 'H.264 720p 25fps (No Audio)' },
            { value: 'rtsp://3.94.214.20:8554/h264_360p_15fps_aac', label: 'H.264 360p 15fps + AAC Audio' },
            { value: 'rtsp://3.94.214.20:8554/h265_720p_25fps', label: 'H.265 720p 25fps (No Audio)' },
            { value: 'rtsp://3.94.214.20:8554/h265_360p_15fps_aac', label: 'H.265 360p 15fps + AAC Audio' }
          ]);
          setSelectedStream({ value: '', label: 'Select a test stream...' });
        }
      } catch (error) {
        console.error('❌ Failed to load test streams:', error);
        // Use fallback streams
        setStreamOptions([
          { value: '', label: 'Select a test stream...' },
          { value: 'rtsp://3.94.214.20:8554/h264_720p_25fps', label: 'H.264 720p 25fps (No Audio)' }
        ]);
        setSelectedStream({ value: '', label: 'Select a test stream...' });
      } finally {
        setLoadingStreams(false);
      }
    };

    loadTestStreams();
  }, []);

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
      const characteristicsData = await apiUtils.generatePipeline(characteristicsPayload);
      console.log('✅ Characteristics Response:', characteristicsData);

      // Then, get the pipeline recommendation
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: selectedStream.value,
        mode: 'pipeline',
        capture_frame: false
      };

      console.log('🔧 Getting pipeline recommendation:', pipelinePayload);
      const pipelineData = await apiUtils.generatePipeline(pipelinePayload);
      console.log('✅ Pipeline Response:', pipelineData);

      // Combine both responses and extract stream_characteristics to root level
      const combinedData = {
        ...characteristicsData.stream_characteristics,
        generated_pipeline: pipelineData.result?.generated_pipeline || pipelineData.generated_pipeline,
        stream_analysis: pipelineData.result?.stream_analysis || pipelineData.stream_analysis,
        mode: characteristicsData.mode,
        enhanced: characteristicsData.enhanced,
        system: characteristicsData.system
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
      <SpaceBetween >
        <Alert type="success">
          <Box fontWeight="bold">✅ Stream Analysis Complete</Box>
        </Alert>

        <ColumnLayout columns={2} variant="text-grid">
          {/* Video Information */}
          <Container header={<Header variant="h3">📹 Video Stream</Header>}>
            {video ? (
              <SpaceBetween >
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
              <SpaceBetween >
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
            <SpaceBetween >
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
              <SpaceBetween >
                <Box>
                  <Box display="inline" fontWeight="bold">Errors: </Box>
                  <Badge color={diagnostics?.errors?.length > 0 ? 'red' : 'green'}>
                    {diagnostics?.errors?.length || 0}
                  </Badge>
                </Box>
                <Box>
                  <Box display="inline" fontWeight="bold">Warnings: </Box>
                  <Badge color={diagnostics?.warnings?.length > 0 ? 'grey' : 'green'}>
                    {diagnostics?.warnings?.length || 0}
                  </Badge>
                </Box>
              </SpaceBetween>
            )}
          </ColumnLayout>
        </Container>

        {/* Diagnostics Details */}
        {diagnostics && (diagnostics?.errors?.length > 0 || diagnostics?.warnings?.length > 0) && (
          <Container header={<Header variant="h3">🔍 Diagnostics</Header>}>
            <SpaceBetween >
              {diagnostics?.errors?.length > 0 && (
                <SpaceBetween >
                  <Box fontWeight="bold" color="text-status-error">Errors:</Box>
                  {diagnostics?.errors.map((error, index) => (
                    <Alert key={index} type="error">{error}</Alert>
                  ))}
                </SpaceBetween>
              )}
              
              {diagnostics?.warnings?.length > 0 && (
                <SpaceBetween >
                  <Box fontWeight="bold" color="text-status-warning">Warnings:</Box>
                  {diagnostics?.warnings.map((warning, index) => (
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
        <SpaceBetween >
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
    <SpaceBetween >
      <Container>
        <SpaceBetween >
          <Header 
            variant="h1" 
            description={`Select from ${streamOptions.length - 1} pre-configured test streams with various codecs and configurations. Simply select a stream and click 'Test Stream' to analyze its characteristics and get a recommended GStreamer pipeline.`}
          >
            🚀 Quick Stream Tester
          </Header>

          {/* Stream Selection Form */}
          <Container header={<Header variant="h3">📺 Select Test Stream</Header>}>
            <SpaceBetween >
              <Select
                selectedOption={selectedStream}
                onChange={({ detail }) => setSelectedStream(detail.selectedOption)}
                options={streamOptions}
                placeholder="Choose a test stream..."
                expandToViewport
                disabled={loadingStreams}
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
            <SpaceBetween >
              {testResult.error ? (
                <Alert type="error" header="❌ Test Failed">
                  <SpaceBetween >
                    <Box>{testResult.error}</Box>
                    {testResult.error_type && (
                      <Box fontSize="body-s">Error Type: {testResult.error_type}</Box>
                    )}
                  </SpaceBetween>
                </Alert>
              ) : (
                <SpaceBetween >
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
