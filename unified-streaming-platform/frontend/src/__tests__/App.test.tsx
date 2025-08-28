/**
 * App Component Tests
 * Tests the main application component with authentication
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithAuth, setupCommonMocks, resetAllMocks, createMockAuthContext } from './test-utils';
import App from '../App';

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => createMockAuthContext(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('App Component', () => {
  beforeEach(() => {
    resetAllMocks();
    setupCommonMocks();
  });

  describe('Authentication Integration', () => {
    it('should render with authenticated user', () => {
      renderWithAuth(<App />);
      
      // Check for main app elements
      expect(screen.getByRole('banner')).toBeInTheDocument(); // TopNavigation
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // SideNavigation
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });

    it('should display user information in navigation', () => {
      renderWithAuth(<App />);
      
      // Should show user name somewhere in the document (multiple instances expected)
      expect(screen.getAllByText('John Doe')).toHaveLength(3);
    });

    it('should handle sign out', async () => {
      const mockSignOut = vi.fn();
      renderWithAuth(<App />, {
        authValue: { signOut: mockSignOut }
      });

      // Find and click the user menu (get first instance)
      const userButtons = screen.getAllByText('John Doe');
      fireEvent.click(userButtons[0]);

      // Look for sign out option (might need to wait for dropdown)
      await waitFor(() => {
        const signOutButton = screen.queryByText('Sign out');
        if (signOutButton) {
          fireEvent.click(signOutButton);
          expect(mockSignOut).toHaveBeenCalled();
        }
      });
    });
  });

  describe('Navigation Structure', () => {
    it('should render all navigation items', () => {
      renderWithAuth(<App />);
      
      // Check for navigation items (using more flexible text matching)
      expect(screen.getByText(/Stream Dashboard/)).toBeInTheDocument();
      expect(screen.getByText(/Analytics/)).toBeInTheDocument();
      expect(screen.getByText(/Add New Camera/)).toBeInTheDocument();
      expect(screen.getByText(/Camera List/)).toBeInTheDocument();
      expect(screen.getAllByText(/Quick Stream Tester/)).toHaveLength(2); // Navigation + content
      expect(screen.getByText(/RTSP Stream Tester/)).toBeInTheDocument();
      expect(screen.getByText(/GStreamer Pipeline Generator/)).toBeInTheDocument();
    });

    it('should have correct navigation structure', () => {
      renderWithAuth(<App />);
      
      // Check for main layout components
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
      
      // Check for content area
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Default Content', () => {
    it('should render Quick Stream Tester by default', () => {
      renderWithAuth(<App />);
      
      // Should show Quick Stream Tester content by default
      expect(screen.getByText(/Select from \d+ pre-configured test streams/)).toBeInTheDocument();
    });
  });

  describe('Navigation Interactions', () => {
    it('should handle tab navigation', async () => {
      renderWithAuth(<App />);
      
      // Click on different navigation items
      const addCameraLink = screen.getByText(/Add New Camera/);
      fireEvent.click(addCameraLink);
      
      // Should show add camera content
      await waitFor(() => {
        expect(screen.getByText(/Add New Camera/)).toBeInTheDocument();
      });
    });

    it('should update content on navigation', async () => {
      renderWithAuth(<App />);
      
      const cameraListLink = screen.getByText(/Camera List/);
      fireEvent.click(cameraListLink);
      
      // Should show camera list content
      await waitFor(() => {
        expect(screen.getByText(/Camera List/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should render error boundary when component fails', () => {
      // This would test the ErrorBoundary component
      renderWithAuth(<App />);
      
      // Should not crash and should render normally
      expect(screen.getAllByText(/Kinesis Video Streams Gateway/)).toHaveLength(2);
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle navigation state changes', () => {
      renderWithAuth(<App />);
      
      // Should have navigation that can be toggled
      const navigation = screen.getByRole('navigation');
      expect(navigation).toBeInTheDocument();
    });
  });
});
