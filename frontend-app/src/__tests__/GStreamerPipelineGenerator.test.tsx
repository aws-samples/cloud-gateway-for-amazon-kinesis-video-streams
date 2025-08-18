import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GStreamerPipelineGenerator from '../components/GStreamerPipelineGenerator';
import { apiUtils } from '../config/api';

// Mock the API utils
vi.mock('../config/api', () => ({
  apiUtils: {
    validateRTSPUrl: vi.fn(),
    makeRequest: vi.fn(),
  },
}));

// Mock clipboard API
const mockWriteText = vi.fn().mockResolvedValue(undefined);

describe('GStreamerPipelineGenerator', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset clipboard mock
    mockWriteText.mockClear();
    // Override the clipboard after userEvent setup
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      configurable: true,
    });
    // Setup default mock implementations
    (apiUtils.validateRTSPUrl as any).mockReturnValue({ isValid: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders the component with all essential elements', () => {
      render(<GStreamerPipelineGenerator />);

      // Check for main header
      expect(screen.getByText('⚙️ GStreamer Pipeline Generator')).toBeInTheDocument();

      // Check for status alert (our test element)
      expect(screen.getByText('GStreamer Pipeline Generator is now loaded and ready!')).toBeInTheDocument();

      // Check for form elements
      expect(screen.getByLabelText(/RTSP URL for Pipeline Generation/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Generate GStreamer Pipeline/i })).toBeInTheDocument();

      // Check for help section
      expect(screen.getByText('💡 How It Works')).toBeInTheDocument();
      expect(screen.getByText(/Step 1:/)).toBeInTheDocument();
      expect(screen.getByText(/Step 2:/)).toBeInTheDocument();
      expect(screen.getByText(/Step 3:/)).toBeInTheDocument();
      expect(screen.getByText(/Step 4:/)).toBeInTheDocument();
    });

    it('displays the correct description text', () => {
      render(<GStreamerPipelineGenerator />);

      expect(screen.getByText(/Generate optimized GStreamer pipelines for your RTSP camera streams/)).toBeInTheDocument();
      expect(screen.getByText(/This tool analyzes your stream characteristics/)).toBeInTheDocument();
    });

    it('shows the help section when no pipeline is generated', () => {
      render(<GStreamerPipelineGenerator />);

      expect(screen.getByText('💡 How It Works')).toBeInTheDocument();
      expect(screen.getByText(/Enter your RTSP camera URL with credentials/)).toBeInTheDocument();
      expect(screen.getByText(/Get a customized GStreamer pipeline/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty RTSP URL', async () => {
      render(<GStreamerPipelineGenerator />);

      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });
      await user.click(generateButton);

      expect(screen.getByText('RTSP URL is required')).toBeInTheDocument();
    });

    it('shows validation error for invalid RTSP URL', async () => {
      (apiUtils.validateRTSPUrl as any).mockReturnValue({ 
        isValid: false, 
        error: 'URL must start with rtsp://' 
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, 'invalid-url');
      await user.click(generateButton);

      expect(screen.getByText('URL must start with rtsp://')).toBeInTheDocument();
    });

    it('clears validation error when user starts typing', async () => {
      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      // Trigger validation error
      await user.click(generateButton);
      expect(screen.getByText('RTSP URL is required')).toBeInTheDocument();

      // Start typing to clear error
      await user.type(input, 'rtsp://');
      expect(screen.queryByText('RTSP URL is required')).not.toBeInTheDocument();
    });
  });

  describe('Pipeline Generation', () => {
    const mockRtspUrl = 'rtsp://user:pass@camera.example.com:554/stream';
    const mockPipeline = 'gst-launch-1.0 rtspsrc location="rtsp://user:pass@camera.example.com:554/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test-stream"';

    it('calls API with correct parameters when generating pipeline', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      expect(apiUtils.makeRequest).toHaveBeenCalledWith({
        rtsp_url: mockRtspUrl,
        mode: 'pipeline',
        capture_frame: false
      });
    });

    it('handles API response with .pipeline property', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Generated GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => element?.textContent?.includes("gst-launch-1.0") || false)[0]).toBeInTheDocument();
      });
    });

    it('handles API response with .generated_pipeline property', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Generated GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => element?.textContent?.includes("gst-launch-1.0") || false)[0]).toBeInTheDocument();
      });
    });

    it('handles string API response format', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue(mockPipeline);

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Generated GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getAllByText((content, element) => element?.textContent?.includes("gst-launch-1.0") || false)[0]).toBeInTheDocument();
      });
    });

    it('shows loading state during pipeline generation', async () => {
      (apiUtils.makeRequest as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ generated_pipeline: mockPipeline }), 100))
      );

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      // Check loading state
      expect(screen.getByText('🔄 Generating GStreamer Pipeline...')).toBeInTheDocument();
      expect(screen.getByText(/Analyzing stream and generating optimized pipeline/)).toBeInTheDocument();

      // Wait for completion
      await waitFor(() => {
        expect(screen.queryByText('🔄 Generating GStreamer Pipeline...')).not.toBeInTheDocument();
      });
    });

    it('displays generated pipeline successfully', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Generated GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getByText('🎉 Pipeline Generated Successfully')).toBeInTheDocument();
        expect(screen.getByText(/Your optimized GStreamer pipeline is ready/)).toBeInTheDocument();
      });

      // Check that the pipeline is displayed (formatted version)
      // Use getAllByText to handle multiple elements with the same text
      const pipelineElements = screen.getAllByText((content, element) => {
        return element?.textContent?.includes('gst-launch-1.0') && 
               element?.textContent?.includes('rtspsrc') || false;
      });
      expect(pipelineElements.length).toBeGreaterThan(0);
    });

    it('shows copy button when pipeline is generated', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Pipeline/i })).toBeInTheDocument();
      });
    });

    it('copies formatted pipeline to clipboard', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await act(async () => {
        await user.type(input, mockRtspUrl);
        await user.click(generateButton);
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Pipeline/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /Copy Pipeline/i });
      console.log('🔧 About to click copy button');
      
      await act(async () => {
        await user.click(copyButton);
      });
      
      console.log('🔧 Copy button clicked, mockWriteText calls:', mockWriteText.mock.calls.length);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(
          expect.stringContaining('gst-launch-1.0')
        );
      });
    });

    it('shows usage instructions when pipeline is generated', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('📋 Usage Instructions')).toBeInTheDocument();
        expect(screen.getByText(/Copy the pipeline command/)).toBeInTheDocument();
        expect(screen.getByText(/Open your terminal/)).toBeInTheDocument();
        expect(screen.getByText(/Set AWS credentials/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    const mockRtspUrl = 'rtsp://user:pass@camera.example.com:554/stream';

    it('displays error when API request fails', async () => {
      const errorMessage = 'Connection failed';
      (apiUtils.makeRequest as any).mockRejectedValue(new Error(errorMessage));

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByText(/Please verify your RTSP URL is correct/)).toBeInTheDocument();
      });
    });

    it('displays error when API returns error response', async () => {
      const errorMessage = 'Stream not accessible';
      (apiUtils.makeRequest as any).mockResolvedValue({
        error: errorMessage
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('displays generic error when no pipeline is returned', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({});

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.getByText('No pipeline was generated. Please check your RTSP URL and try again.')).toBeInTheDocument();
      });
    });

    it('handles empty string response gracefully', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue('');

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.getByText('No pipeline was generated. Please check your RTSP URL and try again.')).toBeInTheDocument();
      });
    });

    it('handles null response gracefully', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue(null);

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        // The error message will be about trying to read properties of null
        expect(screen.getByText(/Cannot read properties of null/)).toBeInTheDocument();
      });
    });

    it('hides help section when error is displayed', async () => {
      (apiUtils.makeRequest as any).mockRejectedValue(new Error('Test error'));

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.queryByText('💡 How It Works')).not.toBeInTheDocument();
      });
    });
  });

  describe('Pipeline Formatting', () => {
    const mockRtspUrl = 'rtsp://user:pass@camera.example.com:554/stream';

    it('formats pipeline with line continuations for readability', async () => {
      const longPipeline = 'gst-launch-1.0 rtspsrc location="rtsp://user:pass@camera.example.com:554/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test-stream" aws-region="us-east-1"';
      
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: longPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        // The formatted pipeline should contain line continuations
        const pipelineElement = screen.getByText(/gst-launch-1.0 \\/);
        expect(pipelineElement).toBeInTheDocument();
      });
    });

    it('formats pipeline elements on separate lines', async () => {
      const pipeline = 'gst-launch-1.0 rtspsrc location="rtsp://test.com/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test"';
      
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: pipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        // Should format with line breaks and proper indentation
        const pipelineElement = screen.getByText(/gst-launch-1.0 \\/);
        const pipelineText = pipelineElement.textContent;
        
        expect(pipelineText).toContain('gst-launch-1.0 \\');
        expect(pipelineText).toContain('! rtph264depay');
        expect(pipelineText).toContain('! h264parse');
        expect(pipelineText).toContain('kvssink');
      });
    });

    it('handles JSON wrapped pipeline response', async () => {
      const pipelineJson = JSON.stringify({
        pipeline: 'gst-launch-1.0 rtspsrc location="rtsp://test.com/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test"'
      });
      
      (apiUtils.makeRequest as any).mockResolvedValue(pipelineJson);

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        // Should extract and format the pipeline from JSON
        expect(screen.getByText(/gst-launch-1.0 \\/)).toBeInTheDocument();
        expect(screen.getByText(/kvssink/)).toBeInTheDocument();
      });
    });

    it('preserves pipeline functionality while improving readability', async () => {
      const functionalPipeline = 'gst-launch-1.0 rtspsrc location="rtsp://test.com/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test"';
      
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: functionalPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL for Pipeline Generation/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        // Should contain all essential pipeline elements
        const pipelineElement = screen.getByText(/gst-launch-1.0 \\/);
        const pipelineText = pipelineElement.textContent;
        
        expect(pipelineText).toContain('rtspsrc');
        expect(pipelineText).toContain('rtph264depay');
        expect(pipelineText).toContain('h264parse');
        expect(pipelineText).toContain('kvssink');
        expect(pipelineText).toContain('stream-name="test"');
      });
    });
  });
});
