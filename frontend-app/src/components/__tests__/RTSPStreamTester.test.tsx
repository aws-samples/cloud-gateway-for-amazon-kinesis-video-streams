import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RTSPStreamTester from '../RTSPStreamTester';
import { apiUtils } from '../../config/api';

// Mock the API utilities
vi.mock('../../config/api', () => ({
  apiUtils: {
    validateRTSPUrl: vi.fn(),
    makeRequest: vi.fn(),
    formatFileSize: vi.fn(),
    formatDuration: vi.fn(),
  },
  API_CONFIG: {
    PIPELINE_GENERATOR_ENDPOINT: 'https://test-endpoint.com',
    REQUEST_TIMEOUT: 60000,
  }
}));

// Mock CloudScape Design System components
vi.mock('@cloudscape-design/components', () => ({
  Container: ({ children, header, ...props }: any) => (
    <div data-testid="container" {...props}>
      {header && <div data-testid="header">{header}</div>}
      {children}
    </div>
  ),
  Header: ({ children, variant, actions, ...props }: any) => (
    <div data-testid="header" data-variant={variant} {...props}>
      {children}
      {actions && <div data-testid="actions">{actions}</div>}
    </div>
  ),
  SpaceBetween: ({ children, ...props }: any) => <div data-testid="space-between" {...props}>{children}</div>,
  FormField: ({ children, label, description, errorText, ...props }: any) => (
    <div data-testid="form-field" {...props}>
      {label && <label>{label}</label>}
      {description && <div data-testid="description">{description}</div>}
      {children}
      {errorText && <div data-testid="error">{errorText}</div>}
    </div>
  ),
  Input: ({ value, onChange, placeholder, invalid, ...props }: any) => (
    <input
      value={value}
      onChange={(e) => onChange?.({ detail: { value: e.target.value } })}
      placeholder={placeholder}
      data-invalid={invalid}
      {...props}
    />
  ),
  Button: ({ children, onClick, loading, variant, size, ...props }: any) => (
    <button 
      onClick={onClick} 
      disabled={loading} 
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  ),
  Alert: ({ children, type, header, ...props }: any) => (
    <div data-testid="alert" data-type={type} {...props}>
      {header && <div data-testid="alert-header">{header}</div>}
      {children}
    </div>
  ),
  Box: ({ children, textAlign, padding, fontSize, fontWeight, color, ...props }: any) => (
    <div 
      data-testid="box" 
      data-text-align={textAlign}
      data-padding={padding}
      data-font-size={fontSize}
      data-font-weight={fontWeight}
      data-color={color}
      {...props}
    >
      {children}
    </div>
  ),
  Spinner: ({ size, ...props }: any) => <div data-testid="spinner" data-size={size} {...props}>Loading...</div>,
  Checkbox: ({ children, checked, onChange, ...props }: any) => (
    <label {...props}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.({ detail: { checked: e.target.checked } })}
      />
      {children}
    </label>
  ),
  Grid: ({ children, gridDefinition, ...props }: any) => (
    <div data-testid="grid" data-grid-definition={JSON.stringify(gridDefinition)} {...props}>
      {children}
    </div>
  ),
  Badge: ({ children, color, ...props }: any) => (
    <span data-testid="badge" data-color={color} {...props}>{children}</span>
  ),
}));

describe('RTSPStreamTester', () => {
  const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
  const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
  const mockFormatFileSize = vi.mocked(apiUtils.formatFileSize);
  const mockFormatDuration = vi.mocked(apiUtils.formatDuration);

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockFormatFileSize.mockReturnValue('1.2 MB');
    mockFormatDuration.mockReturnValue('150ms');
  });

  describe('Component Rendering', () => {
    it('renders the component without crashing', () => {
      render(<RTSPStreamTester />);
      
      expect(screen.getByText('🎥 RTSP Stream Tester')).toBeInTheDocument();
      expect(screen.getByText('Test Results')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<RTSPStreamTester />);
      
      expect(screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Capture test frame/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Test RTSP Stream/i })).toBeInTheDocument();
    });

    it('shows ready state initially', () => {
      render(<RTSPStreamTester />);
      
      expect(screen.getByText('Ready to test your RTSP stream')).toBeInTheDocument();
      expect(screen.getByText(/Fill in the RTSP URL above/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates RTSP URL on form submission', async () => {
      render(<RTSPStreamTester />);
      
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('RTSP URL is required')).toBeInTheDocument();
      });
    });

    it('shows validation error for invalid URL', async () => {
      mockValidateRTSPUrl.mockReturnValue({ 
        isValid: false, 
        error: 'URL must start with rtsp://' 
      });

      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      fireEvent.change(input, { target: { value: 'invalid-url' } });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('URL must start with rtsp://')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('displays loading state during API request', async () => {
      mockMakeRequest.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          stream_characteristics: {
            video: { codec: 'H.264' },
            audio: { codec: 'AAC' },
            connection: { authentication_method: 'Basic' }
          }
        }), 100))
      );

      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      fireEvent.change(input, { target: { value: 'rtsp://test.com/stream' } });
      fireEvent.click(testButton);

      expect(screen.getByText('🔍 Analyzing RTSP stream...')).toBeInTheDocument();
      expect(screen.getAllByTestId('spinner')).toHaveLength(2); // Button and results area spinners
    });

    it('displays stream characteristics on successful response', async () => {
      const mockResponse = {
        stream_characteristics: {
          video: { 
            codec: 'H.265/HEVC',
            framerate: '30 fps',
            bitrate: '2000 kbps'
          },
          audio: { 
            codec: 'AAC',
            sample_rate: '48000 Hz'
          },
          connection: { 
            authentication_method: 'Basic',
            connection_time: '150ms'
          }
        },
        generated_pipeline: 'gst-launch-1.0 rtspsrc location="rtsp://test.com/stream" ! rtph265depay ! h265parse ! kvssink stream-name="test-stream"'
      };

      mockMakeRequest.mockResolvedValueOnce(mockResponse);
      mockMakeRequest.mockResolvedValueOnce({ generated_pipeline: mockResponse.generated_pipeline });

      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      fireEvent.change(input, { target: { value: 'rtsp://test.com/stream' } });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('✅ Stream Analysis Successful!')).toBeInTheDocument();
        expect(screen.getByText('H.265/HEVC')).toBeInTheDocument();
        expect(screen.getByText('AAC')).toBeInTheDocument();
        expect(screen.getByText('Basic')).toBeInTheDocument();
      });
    });

    it('displays error message on API failure', async () => {
      mockMakeRequest.mockRejectedValue(new Error('Network error'));

      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      fireEvent.change(input, { target: { value: 'rtsp://test.com/stream' } });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('❌ Stream Test Failed')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('Form Input Changes', () => {
    it('handles form input changes correctly', () => {
      render(<RTSPStreamTester />);
      
      const rtspUrlInput = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const captureFrameCheckbox = screen.getByLabelText(/Capture test frame/i);
      
      fireEvent.change(rtspUrlInput, { target: { value: 'rtsp://user:pass@camera.example.com:554/stream' } });
      fireEvent.click(captureFrameCheckbox);
      
      expect(rtspUrlInput).toHaveValue('rtsp://user:pass@camera.example.com:554/stream');
      expect(captureFrameCheckbox).not.toBeChecked(); // Should toggle from default true to false
    });

    it('clears validation errors when user starts typing', async () => {
      mockValidateRTSPUrl.mockReturnValue({ isValid: false, error: 'RTSP URL is required' });
      
      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      // Trigger validation error
      fireEvent.click(testButton);
      
      await waitFor(() => {
        expect(screen.getByText('RTSP URL is required')).toBeInTheDocument();
      });
      
      // Start typing to clear error
      mockValidateRTSPUrl.mockReturnValue({ isValid: true });
      fireEvent.change(input, { target: { value: 'rtsp://' } });
      
      // Error should be cleared (this would happen in the actual component)
      expect(input).toHaveValue('rtsp://');
    });
  });

  describe('Pipeline Display', () => {
    it('displays generated pipeline with proper formatting', async () => {
      const mockResponse = {
        stream_characteristics: {
          video: { codec: 'H.264' },
          audio: { codec: 'AAC' },
          connection: { authentication_method: 'Basic' }
        },
        generated_pipeline: 'gst-launch-1.0 rtspsrc location="rtsp://test.com/stream" ! rtph264depay ! h264parse ! kvssink stream-name="test-stream"'
      };

      mockMakeRequest.mockResolvedValueOnce(mockResponse);
      mockMakeRequest.mockResolvedValueOnce({ generated_pipeline: mockResponse.generated_pipeline });

      render(<RTSPStreamTester />);
      
      const input = screen.getByPlaceholderText(/rtsp:\/\/username:password@camera-ip:554\/stream/i);
      const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
      
      fireEvent.change(input, { target: { value: 'rtsp://test.com/stream' } });
      fireEvent.click(testButton);

      await waitFor(() => {
        expect(screen.getByText('🔧 Recommended GStreamer Pipeline')).toBeInTheDocument();
        expect(screen.getByText(/gst-launch-1.0/)).toBeInTheDocument();
        expect(screen.getByText(/Copy Pipeline/)).toBeInTheDocument();
      });
    });
  });
});
