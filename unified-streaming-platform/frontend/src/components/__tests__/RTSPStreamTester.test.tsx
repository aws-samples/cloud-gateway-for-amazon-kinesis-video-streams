import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import RTSPStreamTester from '../RTSPStreamTester';
import { apiUtils } from '../../config/api-new';

// Mock the API utilities
vi.mock('../../config/api-new', () => ({
  apiUtils: {
    getStreamCharacteristics: vi.fn(),
    generatePipeline: vi.fn(),
    validateRTSPUrl: vi.fn(),
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
    </div>
  ),
  SpaceBetween: ({ children, direction, size, ...props }: any) => (
    <div data-testid="space-between" {...props}>
      {children}
    </div>
  ),
  FormField: ({ children, label, description, ...props }: any) => (
    <div data-testid="form-field" {...props}>
      {label && <label>{label}</label>}
      {description && <div data-testid="description">{description}</div>}
      {children}
    </div>
  ),
  Input: ({ value, onChange, placeholder, invalid, ariaLabel, ...props }: any) => (
    <input
      value={value}
      onChange={(e) => onChange && onChange({ detail: { value: e.target.value } })}
      placeholder={placeholder}
      data-invalid={invalid}
      ariaLabel={ariaLabel}
      {...props}
    />
  ),
  Button: ({ children, variant, disabled, loading, loadingText, onClick, ...props }: any) => (
    <button
      data-variant={variant}
      disabled={disabled || loading}
      loadingText={loadingText}
      onClick={onClick}
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
  Spinner: ({ size, ...props }: any) => (
    <div data-testid="spinner" data-size={size} {...props}>
      Loading...
    </div>
  ),
  Checkbox: ({ children, checked, onChange, ...props }: any) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange && onChange({ detail: { checked: e.target.checked } })}
        {...props}
      />
      {children}
    </label>
  ),
  Grid: ({ children, gridDefinition, ...props }: any) => (
    <div data-testid="grid" {...props}>
      {children}
    </div>
  ),
  Badge: ({ children, color, ...props }: any) => (
    <span data-testid="badge" data-color={color} {...props}>{children}</span>
  ),
}));

describe('RTSPStreamTester', () => {
  const mockGetStreamCharacteristics = vi.mocked(apiUtils.getStreamCharacteristics);
  const mockGeneratePipeline = vi.mocked(apiUtils.generatePipeline);
  const mockValidateRTSPUrl = vi.mocked(apiUtils.validateRTSPUrl);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    mockGetStreamCharacteristics.mockResolvedValue({
      stream_characteristics: {
        video: { codec: 'H.265/HEVC', bitrate: '2000 kbps' },
        audio: { codec: 'AAC', sample_rate: '48000 Hz' }
      }
    });
    
    mockGeneratePipeline.mockResolvedValue({
      generated_pipeline: 'gst-launch-1.0 rtspsrc ! kvssink'
    });

    mockValidateRTSPUrl.mockReturnValue({ isValid: true });
  });

  describe('Component Rendering', () => {
    it('renders the component without crashing', () => {
      render(<RTSPStreamTester />);
      expect(screen.getByText('🎥 RTSP Stream Tester')).toBeInTheDocument();
    });

    it('renders all form fields', () => {
      render(<RTSPStreamTester />);
      
      expect(screen.getByText('RTSP URL')).toBeInTheDocument();
      expect(screen.getByText('Frame Capture')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Test RTSP Stream/i })).toBeInTheDocument();
    });

    it('shows ready state initially', () => {
      render(<RTSPStreamTester />);
      
      expect(screen.getByText('Ready to test your RTSP stream')).toBeInTheDocument();
    });
  });
});
