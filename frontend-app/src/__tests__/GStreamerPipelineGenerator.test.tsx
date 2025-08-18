import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('GStreamerPipelineGenerator', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(screen.getByLabelText(/RTSP URL/i)).toBeInTheDocument();
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

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, 'invalid-url');
      await user.click(generateButton);

      expect(screen.getByText('URL must start with rtsp://')).toBeInTheDocument();
    });

    it('clears validation error when user starts typing', async () => {
      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      expect(apiUtils.makeRequest).toHaveBeenCalledWith({
        rtsp_url: mockRtspUrl,
        mode: 'pipeline',
        capture_frame: false
      });
    });

    it('shows loading state during pipeline generation', async () => {
      (apiUtils.makeRequest as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ generated_pipeline: mockPipeline }), 100))
      );

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Generated GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getByText('🎉 Pipeline Generated Successfully')).toBeInTheDocument();
        expect(screen.getByText(/Your optimized GStreamer pipeline is ready/)).toBeInTheDocument();
      });

      // Check that the pipeline is displayed (formatted version)
      expect(screen.getByText(/gst-launch-1.0 rtspsrc/)).toBeInTheDocument();
    });

    it('shows copy button when pipeline is generated', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Pipeline/i })).toBeInTheDocument();
      });

      const copyButton = screen.getByRole('button', { name: /Copy Pipeline/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('gst-launch-1.0 rtspsrc')
      );
    });

    it('shows usage instructions when pipeline is generated', async () => {
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: mockPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
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

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, mockRtspUrl);
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Pipeline Generation Failed')).toBeInTheDocument();
        expect(screen.getByText('No pipeline was generated. Please check your RTSP URL and try again.')).toBeInTheDocument();
      });
    });

    it('hides help section when error is displayed', async () => {
      (apiUtils.makeRequest as any).mockRejectedValue(new Error('Test error'));

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
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
    it('formats pipeline with line continuations', async () => {
      const longPipeline = 'gst-launch-1.0 rtspsrc location="rtsp://user:pass@camera.example.com:554/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test-stream" aws-region="us-east-1"';
      
      (apiUtils.makeRequest as any).mockResolvedValue({
        generated_pipeline: longPipeline
      });

      render(<GStreamerPipelineGenerator />);

      const input = screen.getByLabelText(/RTSP URL/i);
      const generateButton = screen.getByRole('button', { name: /Generate GStreamer Pipeline/i });

      await user.type(input, 'rtsp://test.com/stream');
      await user.click(generateButton);

      await waitFor(() => {
        // The formatted pipeline should contain line continuations
        const pipelineElement = screen.getByText(/gst-launch-1.0 rtspsrc/);
        expect(pipelineElement.textContent).toContain('\\');
      });
    });
  });
});
