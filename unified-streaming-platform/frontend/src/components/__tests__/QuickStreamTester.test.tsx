import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import QuickStreamTester from '../QuickStreamTester';
import { apiUtils } from '../../config/api-new';

// Mock the API utilities
vi.mock('../../config/api-new', () => ({
  apiUtils: {
    getStreamCharacteristics: vi.fn(),
    generatePipeline: vi.fn(),
    validateRTSPUrl: vi.fn(),
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

  beforeEach(() => {
    vi.clearAllMocks();
    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
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
    it('handles stream selection', () => {
      render(<QuickStreamTester />);
      const select = screen.getByTestId('select');
      
      // Select an actual option from the dropdown
      fireEvent.change(select, { target: { value: 'rtsp://44.215.108.66:8554/h264_360p_15fps' } });
      expect(select).toHaveValue('rtsp://44.215.108.66:8554/h264_360p_15fps');
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
