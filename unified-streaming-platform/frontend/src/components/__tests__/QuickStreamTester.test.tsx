import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import QuickStreamTester from '../QuickStreamTester';
import { apiUtils } from "../../config/api";

// Mock the API utilities
vi.mock('../../config/api', () => ({
  apiUtils: {
    getStreamCharacteristics: vi.fn(),
    generatePipeline: vi.fn(),
    validateRTSPUrl: vi.fn(),
    getRTSPTestStreams: vi.fn(),
  },
  RTSP_CONFIG: {
    ENABLED: true,
    TEST_STREAMS: [
      { name: 'Test Stream 1', url: 'rtsp://test1.com/stream' },
      { name: 'Test Stream 2', url: 'rtsp://test2.com/stream' }
    ]
  }
}));

// Mock CloudScape components
vi.mock('@cloudscape-design/components', () => ({
  Container: ({ children, header }: any) => (
    <div data-testid="container">
      {header && <div data-testid="header">{header}</div>}
      {children}
    </div>
  ),
  Header: ({ children }: any) => <div data-testid="header">{children}</div>,
  SpaceBetween: ({ children }: any) => <div data-testid="space-between">{children}</div>,
  FormField: ({ children, label }: any) => (
    <div data-testid="form-field">
      {label && <label>{label}</label>}
      {children}
    </div>
  ),
  Select: ({ selectedOption, onChange, options, placeholder }: any) => (
    <select
      data-testid="select"
      value={selectedOption?.value || ''}
      onChange={(e) => {
        const option = options?.find((opt: any) => opt.value === e.target.value);
        onChange && onChange({ detail: { selectedOption: option } });
      }}
    >
      <option value="">{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  Alert: ({ children, type }: any) => (
    <div data-testid="alert" data-type={type}>{children}</div>
  ),
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

describe('QuickStreamTester', () => {
  const mockGetStreamCharacteristics = vi.mocked(apiUtils.getStreamCharacteristics);
  const mockGeneratePipeline = vi.mocked(apiUtils.generatePipeline);
  const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);
  const mockGetRTSPTestStreams = vi.mocked(apiUtils.getRTSPTestStreams);

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
    
    // Mock 25 test streams so that length - 1 = 24
    const mockStreams = Array.from({ length: 25 }, (_, i) => ({
      url: `rtsp://test${i}.com/stream`,
      description: `Test Stream ${i}`,
      codec: 'H.264',
      resolution: '720p',
      framerate: '25fps',
      audio: false
    }));
    mockGetRTSPTestStreams.mockResolvedValue({
      server_info: {
        name: 'Test Server',
        version: '1.0',
        ip: '44.222.205.185',
        port: 8554
      },
      rtsp_urls: mockStreams
    });
    mockGetStreamCharacteristics.mockResolvedValue({
      stream_characteristics: {
        video: { codec: 'H.264' },
        audio: { codec: 'AAC' }
      }
    });
    mockGeneratePipeline.mockResolvedValue({
      generated_pipeline: 'gst-launch-1.0 rtspsrc ! kvssink'
    });
  });

  describe('Component Rendering', () => {
    it('renders the component without crashing', () => {
      render(<QuickStreamTester />);
      expect(screen.getByText('🚀 Quick Stream Tester')).toBeInTheDocument();
    });

    it('renders stream selection dropdown', () => {
      render(<QuickStreamTester />);
      expect(screen.getByTestId('select')).toBeInTheDocument();
    });

    it('renders test button', () => {
      render(<QuickStreamTester />);
      expect(screen.getByRole('button', { name: /Test Stream/i })).toBeInTheDocument();
    });
  });

  describe('Stream Selection', () => {
    it('handles stream selection', async () => {
      render(<QuickStreamTester />);
      
      // Wait for streams to load
      await waitFor(() => {
        expect(screen.getByTestId('select')).toBeInTheDocument();
      });
      
      const select = screen.getByTestId('select');
      
      // Select the first mock stream
      fireEvent.change(select, { target: { value: 'rtsp://test0.com/stream' } });
      expect(select).toHaveValue('rtsp://test0.com/stream');
    });
  });

  describe('Stream Testing', () => {
    it('disables test button when no stream selected', () => {
      render(<QuickStreamTester />);
      const testButton = screen.getByRole('button', { name: /Test Stream/i });
      expect(testButton).toBeDisabled();
    });
  });
});
