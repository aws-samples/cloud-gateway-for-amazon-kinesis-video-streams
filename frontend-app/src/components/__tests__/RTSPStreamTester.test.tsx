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

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Button: ({ children, onClick, isLoading, ...props }: any) => (
    <button onClick={onClick} disabled={isLoading} {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  Flex: ({ children, ...props }: any) => <div data-testid="flex" {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
  Heading: ({ children, level, ...props }: any) => React.createElement(`h${level}`, props, children),
  Input: ({ onChange, ...props }: any) => (
    <input onChange={(e) => onChange?.(e)} {...props} />
  ),
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Alert: ({ children, variation, ...props }: any) => (
    <div data-testid="alert" data-variation={variation} {...props}>{children}</div>
  ),
  Loader: ({ size, ...props }: any) => <div data-testid="loader" data-size={size} {...props}>Loading...</div>,
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
  Badge: ({ children, variation, ...props }: any) => (
    <span data-testid="badge" data-variation={variation} {...props}>{children}</span>
  ),
  SelectField: ({ children, onChange, value, ...props }: any) => (
    <select onChange={(e) => onChange?.(e)} value={value} {...props}>
      {children}
    </select>
  ),
}));

describe('RTSPStreamTester', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component without crashing', () => {
    render(<RTSPStreamTester />);
    
    expect(screen.getByText('RTSP Stream Configuration & Testing')).toBeInTheDocument();
    expect(screen.getByText('Camera Configuration')).toBeInTheDocument();
    expect(screen.getByText('Test Results')).toBeInTheDocument();
  });

  it('renders all form fields', () => {
    render(<RTSPStreamTester />);
    
    expect(screen.getByLabelText(/Camera Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/RTSP URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Stream Retention Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Capture test frame/i)).toBeInTheDocument();
  });

  it('validates RTSP URL on form submission', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    mockValidateRTSPUrl.mockReturnValue({
      isValid: false,
      error: 'RTSP URL is required'
    });

    render(<RTSPStreamTester />);
    
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockValidateRTSPUrl).toHaveBeenCalledWith('');
      expect(screen.getByText('RTSP URL is required')).toBeInTheDocument();
    });
  });

  it('makes API request with valid RTSP URL', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
    
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockMakeRequest.mockResolvedValue({
      stream_characteristics: {
        video: { codec: 'H.264', framerate: '30 fps' },
        audio: { codec: 'AAC', sample_rate: '48000 Hz' }
      }
    });

    render(<RTSPStreamTester />);
    
    const urlInput = screen.getByLabelText(/RTSP URL/i);
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    
    fireEvent.change(urlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(mockMakeRequest).toHaveBeenCalledWith({
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics',
        capture_frame: true
      });
    });
  });

  it('displays loading state during API request', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
    
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockMakeRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    render(<RTSPStreamTester />);
    
    const urlInput = screen.getByLabelText(/RTSP URL/i);
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    
    fireEvent.change(urlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.click(testButton);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByText('Analyzing RTSP stream...')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
    
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockMakeRequest.mockRejectedValue(new Error('Network error'));

    render(<RTSPStreamTester />);
    
    const urlInput = screen.getByLabelText(/RTSP URL/i);
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    
    fireEvent.change(urlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays stream characteristics on successful response', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
    const mockFormatFileSize = vi.mocked(apiUtils.formatFileSize);
    const mockFormatDuration = vi.mocked(apiUtils.formatDuration);
    
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockFormatFileSize.mockReturnValue('45.4 KB');
    mockFormatDuration.mockReturnValue('3.0s');
    
    mockMakeRequest.mockResolvedValue({
      stream_characteristics: {
        video: { 
          codec: 'H.265/HEVC', 
          framerate: '25.0 fps',
          bitrate: '500 kbps'
        },
        audio: { 
          codec: 'AAC', 
          sample_rate: '16000 Hz'
        },
        connection: {
          authentication_method: 'DIGEST',
          connection_time: '0.16s'
        },
        frame_capture: {
          width: 640,
          height: 180,
          format: 'JPEG',
          size_bytes: 45405,
          capture_time_ms: 3000,
          extraction_method: 'OpenCV'
        }
      }
    });

    render(<RTSPStreamTester />);
    
    const urlInput = screen.getByLabelText(/RTSP URL/i);
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    
    fireEvent.change(urlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.click(testButton);

    await waitFor(() => {
      expect(screen.getByText('Stream Analysis Successful!')).toBeInTheDocument();
      expect(screen.getByText('H.265/HEVC')).toBeInTheDocument();
      expect(screen.getByText('AAC')).toBeInTheDocument();
      expect(screen.getByText('DIGEST')).toBeInTheDocument();
      expect(screen.getByText('640×180')).toBeInTheDocument();
    });
  });

  it('displays preview image when frame data is available', async () => {
    const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
    const mockMakeRequest = vi.mocked(apiUtils.makeRequest);
    
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    mockMakeRequest.mockResolvedValue({
      stream_characteristics: {
        frame_capture: {
          frame_data: 'base64encodedimagedata'
        }
      }
    });

    render(<RTSPStreamTester />);
    
    const urlInput = screen.getByLabelText(/RTSP URL/i);
    const testButton = screen.getByRole('button', { name: /Test RTSP Stream/i });
    
    fireEvent.change(urlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.click(testButton);

    await waitFor(() => {
      const previewImage = screen.getByAltText('RTSP Stream Preview');
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'data:image/jpeg;base64,base64encodedimagedata');
    });
  });

  it('toggles frame capture checkbox', () => {
    render(<RTSPStreamTester />);
    
    const checkbox = screen.getByLabelText(/Capture test frame/i);
    expect(checkbox).toBeChecked(); // Default is true
    
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('handles form input changes correctly', () => {
    render(<RTSPStreamTester />);
    
    const cameraNameInput = screen.getByLabelText(/Camera Name/i);
    const rtspUrlInput = screen.getByLabelText(/RTSP URL/i);
    const retentionSelect = screen.getByLabelText(/Stream Retention Period/i);
    
    fireEvent.change(cameraNameInput, { target: { value: 'Test Camera' } });
    fireEvent.change(rtspUrlInput, { target: { value: 'rtsp://test.com/stream' } });
    fireEvent.change(retentionSelect, { target: { value: '48' } });
    
    expect(cameraNameInput).toHaveValue('Test Camera');
    expect(rtspUrlInput).toHaveValue('rtsp://test.com/stream');
    expect(retentionSelect).toHaveValue('48');
  });
});
