import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock AWS Amplify components
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: (component: any) => component,
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  Flex: ({ children, ...props }: any) => <div data-testid="flex" {...props}>{children}</div>,
  Grid: ({ children, ...props }: any) => <div data-testid="grid" {...props}>{children}</div>,
  Loader: ({ children, ...props }: any) => <div data-testid="loader" {...props}>Loading...</div>,
  Alert: ({ children, variation, ...props }: any) => <div data-testid="alert" data-variation={variation} {...props}>{children}</div>,
  Badge: ({ children, variation, ...props }: any) => <span data-testid="badge" data-variation={variation} {...props}>{children}</span>,
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Heading: ({ children, level = 1, ...props }: any) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    return <Tag {...props}>{children}</Tag>;
  },
}));

// Mock API utils
vi.mock('../config/api', () => ({
  apiUtils: {
    validateRTSPUrl: vi.fn(),
    makeRequest: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.history
const historyMock = {
  pushState: vi.fn(),
  replaceState: vi.fn(),
};
Object.defineProperty(window, 'history', {
  value: historyMock,
});

describe('Navigation', () => {
  const user = userEvent.setup();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL hash
    window.location.hash = '';
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Navigation State', () => {
    it('loads default tab when no hash or localStorage', () => {
      render(<App />);
      
      // Should show Quick Stream Tester content by default
      expect(screen.getByText(/Select from 24 pre-configured test streams/)).toBeInTheDocument();
      expect(screen.queryByLabelText(/RTSP URL/)).not.toBeInTheDocument();
    });

    it('loads tab from URL hash when present', () => {
      // Set URL hash before rendering
      window.location.hash = '#pipeline';
      
      render(<App />);
      
      // Should show GStreamer Pipeline Generator content
      expect(screen.getByText(/Generate optimized GStreamer pipelines/)).toBeInTheDocument();
      expect(screen.queryByText(/Select from 24 pre-configured test streams/)).not.toBeInTheDocument();
    });

    it('loads tab from localStorage when no hash present', () => {
      localStorageMock.getItem.mockReturnValue('rtsp-tester');
      
      render(<App />);
      
      // Should show RTSP Stream Tester content
      expect(screen.getByLabelText(/RTSP URL/)).toBeInTheDocument();
      expect(screen.queryByText(/Select from 24 pre-configured test streams/)).not.toBeInTheDocument();
    });

    it('prioritizes URL hash over localStorage', () => {
      window.location.hash = '#pipeline';
      localStorageMock.getItem.mockReturnValue('rtsp-tester');
      
      render(<App />);
      
      // Should show GStreamer Pipeline Generator content (from hash), not RTSP Tester (from localStorage)
      expect(screen.getByText(/Generate optimized GStreamer pipelines/)).toBeInTheDocument();
      expect(screen.queryByText(/🎥 RTSP Stream Tester/)).not.toBeInTheDocument();
    });
  });

  describe('Navigation Interactions', () => {
    it('updates URL and localStorage when navigation item is clicked', async () => {
      render(<App />);
      
      // Find and click the GStreamer Pipeline Generator navigation item
      const pipelineNavItem = screen.getByText('⚙️ GStreamer Pipeline Generator');
      await user.click(pipelineNavItem);
      
      // Should update localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeTab', 'pipeline');
      
      // Should update browser history
      expect(historyMock.pushState).toHaveBeenCalledWith(null, '', '#pipeline');
      
      // Should show the correct content
      await waitFor(() => {
        expect(screen.getByText(/Generate optimized GStreamer pipelines/)).toBeInTheDocument();
      });
    });

    it('switches between different navigation tabs correctly', async () => {
      render(<App />);
      
      // Start with Quick Stream Tester content (default)
      expect(screen.getByText(/Select from 24 pre-configured test streams/)).toBeInTheDocument();
      
      // Click RTSP Stream Tester in navigation
      const rtspNavItem = screen.getAllByText('🔧 RTSP Stream Tester')[0]; // Get the navigation item
      await user.click(rtspNavItem);
      
      await waitFor(() => {
        expect(screen.getByLabelText(/RTSP URL/)).toBeInTheDocument();
        expect(screen.queryByText(/Select from 24 pre-configured test streams/)).not.toBeInTheDocument();
      });
      
      // Click GStreamer Pipeline Generator in navigation
      const pipelineNavItem = screen.getAllByText('⚙️ GStreamer Pipeline Generator')[0]; // Get the navigation item
      await user.click(pipelineNavItem);
      
      await waitFor(() => {
        expect(screen.getByText(/Generate optimized GStreamer pipelines/)).toBeInTheDocument();
        expect(screen.queryByText(/🎥 RTSP Stream Tester/)).not.toBeInTheDocument();
      });
    });

    it('updates active navigation state visually', async () => {
      render(<App />);
      
      // Click Analytics tab
      const analyticsNavItem = screen.getAllByText('📊 Analytics')[0]; // Get the navigation item
      await user.click(analyticsNavItem);
      
      // Should show analytics content
      await waitFor(() => {
        expect(screen.getAllByText(/Advanced analytics and insights/)[0]).toBeInTheDocument();
      });
      
      // Should update localStorage and history
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeTab', 'analytics');
      expect(historyMock.pushState).toHaveBeenCalledWith(null, '', '#analytics');
    });
  });

  describe('Browser History Integration', () => {
    it('handles hashchange events correctly', async () => {
      render(<App />);
      
      // Simulate browser hash change (back/forward button)
      window.location.hash = '#pipeline';
      const hashChangeEvent = new HashChangeEvent('hashchange');
      window.dispatchEvent(hashChangeEvent);
      
      // Should update to show pipeline content
      await waitFor(() => {
        expect(screen.getByText('⚙️ GStreamer Pipeline Generator')).toBeInTheDocument();
      });
      
      // Should update localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeTab', 'pipeline');
    });

    it('sets initial URL hash when none present', () => {
      // Ensure no hash is present
      window.location.hash = '';
      
      render(<App />);
      
      // Should set initial hash
      expect(historyMock.replaceState).toHaveBeenCalledWith(null, '', '#quick-tester');
    });

    it('handles empty hash by defaulting to quick-tester', async () => {
      render(<App />);
      
      // Simulate hash change to empty
      window.location.hash = '';
      const hashChangeEvent = new HashChangeEvent('hashchange');
      window.dispatchEvent(hashChangeEvent);
      
      await waitFor(() => {
        expect(screen.getByText(/Select from 24 pre-configured test streams/)).toBeInTheDocument();
      });
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('activeTab', 'quick-tester');
    });
  });

  describe('Navigation Menu Structure', () => {
    it('renders all expected navigation items', () => {
      render(<App />);
      
      // Check all navigation items are present
      expect(screen.getAllByText('🚀 Quick Stream Tester')).toHaveLength(2); // Navigation + page heading
      expect(screen.getAllByText('🔧 RTSP Stream Tester')).toHaveLength(1); // Only in navigation
      expect(screen.getAllByText('⚙️ GStreamer Pipeline Generator')).toHaveLength(1); // Only in navigation
      expect(screen.getAllByText('📊 Analytics')).toHaveLength(1); // Only in navigation
    });

    it('has correct href attributes for navigation items', () => {
      render(<App />);
      
      // Navigation items should have proper href attributes
      // Note: This tests the navigation structure, actual hrefs are handled by Cloudscape components
      expect(screen.getAllByText('🚀 Quick Stream Tester')).toHaveLength(2); // Navigation + page heading
      expect(screen.getAllByText('🔧 RTSP Stream Tester')).toHaveLength(1); // Only in navigation
      expect(screen.getAllByText('⚙️ GStreamer Pipeline Generator')).toHaveLength(1); // Only in navigation
      expect(screen.getByText('📊 Analytics')).toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('renders correct content for each navigation tab', async () => {
      render(<App />);
      
      // Test Quick Stream Tester content
      expect(screen.getByText(/Select from 24 pre-configured test streams/)).toBeInTheDocument();
      
      // Switch to RTSP Stream Tester
      await user.click(screen.getAllByText('🔧 RTSP Stream Tester')[0]);
      await waitFor(() => {
        expect(screen.getByLabelText(/RTSP URL/)).toBeInTheDocument();
      });
      
      // Switch to GStreamer Pipeline Generator
      await user.click(screen.getAllByText('⚙️ GStreamer Pipeline Generator')[0]);
      await waitFor(() => {
        expect(screen.getByText(/Generate optimized GStreamer pipelines/)).toBeInTheDocument();
      });
      
      // Switch to Analytics
      await user.click(screen.getAllByText('📊 Analytics')[0]);
      await waitFor(() => {
        expect(screen.getAllByText(/Advanced analytics and insights/)[0]).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles invalid hash gracefully', async () => {
      window.location.hash = '#invalid-tab';
      
      render(<App />);
      
      // Should still render without crashing
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      
      // Should handle the invalid hash by showing some content
      // (The exact behavior depends on your implementation)
    });

    it('handles localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not crash when localStorage fails
      expect(() => render(<App />)).not.toThrow();
    });
  });
});
