import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CameraList from '../CameraList';
import { cameraAPI } from "../../config/api";

// Mock Cloudscape components
vi.mock('@cloudscape-design/components', () => ({
  Container: ({ children }: any) => <div data-testid="container">{children}</div>,
  Header: ({ children }: any) => <div data-testid="header">{children}</div>,
  Table: ({ items, loading, empty }: any) => (
    <div data-testid="table" data-loading={loading ? 'true' : 'false'}>
      {loading ? (
        <div>Loading...</div>
      ) : items?.length === 0 ? (
        <div>{empty}</div>
      ) : (
        items?.map((item: any, index: number) => (
          <div key={index} data-testid="table-row">
            {item.camera_name || JSON.stringify(item)}
          </div>
        ))
      )}
    </div>
  ),
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  SpaceBetween: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Badge: ({ children }: any) => <span>{children}</span>,
  Modal: ({ children, visible }: any) => visible ? <div data-testid="modal">{children}</div> : null,
  Alert: ({ children, type }: any) => <div data-testid="alert" data-type={type}>{children}</div>,
  Pagination: ({ children }: any) => <div>{children}</div>,
  TextFilter: ({ children }: any) => <div>{children}</div>,
  CollectionPreferences: ({ children }: any) => <div>{children}</div>,
  Link: ({ children }: any) => <a>{children}</a>,
}));

// Mock the camera API
vi.mock('../../config/api', () => ({
  cameraAPI: {
    listCameras: vi.fn(),
    deleteCamera: vi.fn(),
  }
}));

// Get the mocked API
const mockCameraAPI = vi.mocked(cameraAPI);

describe('CameraList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up default successful response for listCameras
    mockCameraAPI.listCameras.mockResolvedValue({ cameras: [] });
  });

  describe('Component Rendering', () => {
    it('renders the component without crashing', async () => {
      mockCameraAPI.listCameras.mockResolvedValue({ cameras: [] });
      render(<CameraList />);
      expect(screen.getByTestId('container')).toBeInTheDocument();
      
      // Wait for the component to finish loading
      await waitFor(() => {
        expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'false');
      });
    });

    it('shows loading state initially', async () => {
      // Mock a delayed response to catch loading state
      mockCameraAPI.listCameras.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ cameras: [] }), 100))
      );
      
      render(<CameraList />);
      
      // The component should show loading initially
      expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'true');
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('table')).toHaveAttribute('data-loading', 'false');
      });
    });

    it('displays empty state when no cameras', async () => {
      mockCameraAPI.listCameras.mockResolvedValue({ cameras: [] });
      render(<CameraList />);
      
      await waitFor(() => {
        expect(screen.getByText(/No cameras found/i)).toBeInTheDocument();
      });
    });

    it('displays cameras when loaded', async () => {
      const mockCameras = [
        {
          camera_id: '1',
          camera_name: 'Test Camera 1',
          rtsp_url: 'rtsp://test1.com/stream',
          make_model: 'Test Model',
          installation_location: 'Test Location',
          retention_hours: 24,
          composite_key: '1#testuser',
          owner: 'testuser'
        }
      ];
      
      mockCameraAPI.listCameras.mockResolvedValue({ cameras: mockCameras });
      render(<CameraList />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Camera 1')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when camera loading fails', async () => {
      mockCameraAPI.listCameras.mockRejectedValue(new Error('Failed to load cameras'));
      render(<CameraList />);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });
    });
  });
});
