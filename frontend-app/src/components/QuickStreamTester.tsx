import React, { useState } from 'react';
import {
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  View,
  Alert,
  Loader,
  Image,
  Badge,
  SelectField
} from '@aws-amplify/ui-react';
import { apiUtils } from '../config/api';
import type { 
  APIResponse, 
  StreamCharacteristics, 
  RTSPTestRequest
} from '../config/api';

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

const QuickStreamTester: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState('');
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const testRTSPStream = async () => {
    if (!selectedStream) {
      return;
    }

    // Clear previous results
    setTestResult(null);
    setPreviewImage(null);
    setIsLoading(true);

    try {
      // Get stream characteristics with frame capture
      const characteristicsPayload: RTSPTestRequest = {
        rtsp_url: selectedStream,
        mode: 'characteristics',
        capture_frame: true
      };

      console.log('🚀 Testing RTSP stream characteristics:', characteristicsPayload);
      const characteristicsData = await apiUtils.makeRequest(characteristicsPayload);
      console.log('✅ Characteristics Response:', characteristicsData);

      // Then, get the pipeline recommendation
      const pipelinePayload: RTSPTestRequest = {
        rtsp_url: selectedStream,
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
      <View>
        <Alert variation="success" style={{ marginBottom: 'var(--amplify-space-medium)' }}>
          <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)' }}>
            <Text style={{ fontWeight: 'bold' }}>✅ Stream Analysis Complete</Text>
          </Flex>
        </Alert>

        <Grid templateColumns="1fr 1fr" gap="var(--amplify-space-medium)">
          {/* Video Information */}
          <Card style={{ padding: 'var(--amplify-space-medium)' }}>
            <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
              📹 Video Stream
            </Heading>
            {video ? (
              <View>
                <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                  <Text style={{ fontWeight: 'bold' }}>Codec:</Text>
                  <Badge variation="info">{video.codec || 'Unknown'}</Badge>
                </Flex>
                <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                  <Text style={{ fontWeight: 'bold' }}>Frame Rate:</Text>
                  <Text>{video.framerate || 'Unknown'}</Text>
                </Flex>
                <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                  <Text style={{ fontWeight: 'bold' }}>Bitrate:</Text>
                  <Text>{video.bitrate || 'Unknown'}</Text>
                </Flex>
                {video.profile && (
                  <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontWeight: 'bold' }}>Profile:</Text>
                    <Text>{video.profile}</Text>
                  </Flex>
                )}
              </View>
            ) : (
              <Text style={{ color: 'var(--amplify-colors-font-secondary)' }}>
                No video stream detected
              </Text>
            )}
          </Card>

          {/* Audio Information */}
          <Card style={{ padding: 'var(--amplify-space-medium)' }}>
            <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
              🔊 Audio Stream
            </Heading>
            {audio && Object.keys(audio).length > 0 ? (
              <View>
                <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                  <Text style={{ fontWeight: 'bold' }}>Codec:</Text>
                  <Badge variation="success">{audio.codec || 'Unknown'}</Badge>
                </Flex>
                <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                  <Text style={{ fontWeight: 'bold' }}>Sample Rate:</Text>
                  <Text>{audio.sample_rate || 'Unknown'}</Text>
                </Flex>
                {audio.channels && (
                  <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontWeight: 'bold' }}>Channels:</Text>
                    <Text>{audio.channels}</Text>
                  </Flex>
                )}
              </View>
            ) : (
              <Text style={{ color: 'var(--amplify-colors-font-secondary)' }}>
                No audio stream detected
              </Text>
            )}
          </Card>
        </Grid>

        {/* Connection Information */}
        <Card style={{ padding: 'var(--amplify-space-medium)', marginTop: 'var(--amplify-space-medium)' }}>
          <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
            🔗 Connection Details
          </Heading>
          <Grid templateColumns="1fr 1fr" gap="var(--amplify-space-medium)">
            <View>
              <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                <Text style={{ fontWeight: 'bold' }}>Authentication:</Text>
                <Badge variation={connection?.authentication_method === 'None' ? 'success' : 'warning'}>
                  {connection?.authentication_method || 'Unknown'}
                </Badge>
              </Flex>
              <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                <Text style={{ fontWeight: 'bold' }}>Connection Time:</Text>
                <Text>{connection?.connection_time || 'Not measured'}</Text>
              </Flex>
            </View>
            <View>
              {diagnostics && (
                <>
                  <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontWeight: 'bold' }}>Errors:</Text>
                    <Badge variation={diagnostics.errors?.length > 0 ? 'error' : 'success'}>
                      {diagnostics.errors?.length || 0}
                    </Badge>
                  </Flex>
                  <Flex style={{ justifyContent: 'space-between', marginBottom: 'var(--amplify-space-xs)' }}>
                    <Text style={{ fontWeight: 'bold' }}>Warnings:</Text>
                    <Badge variation={diagnostics.warnings?.length > 0 ? 'warning' : 'success'}>
                      {diagnostics.warnings?.length || 0}
                    </Badge>
                  </Flex>
                </>
              )}
            </View>
          </Grid>
        </Card>

        {/* Diagnostics Details */}
        {diagnostics && (diagnostics.errors?.length > 0 || diagnostics.warnings?.length > 0) && (
          <Card style={{ padding: 'var(--amplify-space-medium)', marginTop: 'var(--amplify-space-medium)' }}>
            <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
              🔍 Diagnostics
            </Heading>
            
            {diagnostics.errors?.length > 0 && (
              <View style={{ marginBottom: 'var(--amplify-space-small)' }}>
                <Text style={{ fontWeight: 'bold', color: 'var(--amplify-colors-font-error)' }}>
                  Errors:
                </Text>
                {diagnostics.errors.map((error, index) => (
                  <Alert key={index} variation="error" style={{ marginTop: 'var(--amplify-space-xs)' }}>
                    {error}
                  </Alert>
                ))}
              </View>
            )}
            
            {diagnostics.warnings?.length > 0 && (
              <View>
                <Text style={{ fontWeight: 'bold', color: 'var(--amplify-colors-font-warning)' }}>
                  Warnings:
                </Text>
                {diagnostics.warnings.map((warning, index) => (
                  <Alert key={index} variation="warning" style={{ marginTop: 'var(--amplify-space-xs)' }}>
                    {warning}
                  </Alert>
                ))}
              </View>
            )}
          </Card>
        )}
      </View>
    );
  };

  const renderPipelineRecommendation = (pipeline: string) => {
    return (
      <Card style={{ padding: 'var(--amplify-space-medium)', marginTop: 'var(--amplify-space-medium)' }}>
        <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
          ⚙️ Recommended GStreamer Pipeline
        </Heading>
        <View 
          style={{ 
            backgroundColor: 'var(--amplify-colors-background-tertiary)',
            padding: 'var(--amplify-space-medium)',
            borderRadius: 'var(--amplify-radii-small)',
            fontFamily: 'monospace',
            fontSize: 'var(--amplify-font-sizes-small)',
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {pipeline}
        </View>
        <Text 
          style={{ 
            fontSize: 'var(--amplify-font-sizes-small)', 
            color: 'var(--amplify-colors-font-secondary)',
            marginTop: 'var(--amplify-space-small)'
          }}
        >
          💡 This pipeline is optimized for your stream's characteristics and can be used with GStreamer or AWS services.
        </Text>
      </Card>
    );
  };

  return (
    <View>
      <Card style={{ padding: 'var(--amplify-space-large)' }}>
        <Heading level={2} style={{ marginBottom: 'var(--amplify-space-medium)' }}>
          🚀 Quick Stream Tester
        </Heading>
        
        <Text style={{ 
          color: 'var(--amplify-colors-font-secondary)', 
          marginBottom: 'var(--amplify-space-large)' 
        }}>
          Test our demo RTSP streams with various codecs and configurations. Simply select a stream and click "Test Stream" to analyze its characteristics and get a recommended GStreamer pipeline.
        </Text>

        {/* Stream Selection Form */}
        <Card style={{ padding: 'var(--amplify-space-medium)', marginBottom: 'var(--amplify-space-large)' }}>
          <Heading level={3} style={{ marginBottom: 'var(--amplify-space-medium)' }}>
            📺 Select Test Stream
          </Heading>
          
          <Flex direction="column" gap="var(--amplify-space-medium)">
            <SelectField
              label="Test Stream"
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              placeholder="Choose a test stream..."
              size="large"
            >
              {TEST_STREAM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>

            <Flex style={{ justifyContent: 'flex-end', gap: 'var(--amplify-space-small)' }}>
              <Button
                onClick={testRTSPStream}
                disabled={!selectedStream || isLoading}
                variation="primary"
                size="large"
                style={{ 
                  minWidth: '150px',
                  backgroundColor: '#0073bb',
                  color: 'white',
                  border: '2px solid #0073bb',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? (
                  <Flex style={{ alignItems: 'center', gap: 'var(--amplify-space-small)' }}>
                    <Loader size="small" />
                    <span style={{ color: 'white' }}>Testing...</span>
                  </Flex>
                ) : (
                  <span style={{ color: 'white' }}>🧪 Test Stream</span>
                )}
              </Button>
            </Flex>
          </Flex>
        </Card>

        {/* Preview Image */}
        {previewImage && (
          <Card style={{ padding: 'var(--amplify-space-medium)', marginBottom: 'var(--amplify-space-medium)' }}>
            <Heading level={4} style={{ marginBottom: 'var(--amplify-space-small)' }}>
              📸 Captured Frame
            </Heading>
            <View style={{ textAlign: 'center' }}>
              <Image
                src={`data:image/jpeg;base64,${previewImage}`}
                alt="Captured frame from RTSP stream"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  border: '2px solid var(--amplify-colors-border-primary)',
                  borderRadius: 'var(--amplify-radii-small)'
                }}
              />
            </View>
          </Card>
        )}

        {/* Results */}
        {testResult && (
          <View>
            {testResult.error ? (
              <Alert variation="error" style={{ marginBottom: 'var(--amplify-space-medium)' }}>
                <Heading level={4} style={{ margin: 0, marginBottom: 'var(--amplify-space-small)' }}>
                  ❌ Test Failed
                </Heading>
                <Text>{testResult.error}</Text>
                {testResult.error_type && (
                  <Text style={{ fontSize: 'var(--amplify-font-sizes-small)', marginTop: 'var(--amplify-space-small)' }}>
                    Error Type: {testResult.error_type}
                  </Text>
                )}
              </Alert>
            ) : (
              <View>
                {testResult.stream_characteristics && renderStreamInfo(testResult.stream_characteristics)}
                {testResult.generated_pipeline && renderPipelineRecommendation(testResult.generated_pipeline)}
              </View>
            )}
          </View>
        )}
      </Card>
    </View>
  );
};

export default QuickStreamTester;
