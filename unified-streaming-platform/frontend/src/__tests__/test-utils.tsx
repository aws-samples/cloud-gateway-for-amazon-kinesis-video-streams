/**
 * Test utilities for custom authentication system
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, AuthContextType } from '../contexts/AuthContext';

// Mock user for testing
export const mockUser = {
  username: 'testuser',
  email: 'test@example.com',
  attributes: {
    email: 'test@example.com',
    given_name: 'John',
    family_name: 'Doe'
  },
  accessToken: 'mock-access-token',
  idToken: 'mock-id-token',
  refreshToken: 'mock-refresh-token'
};

// Mock auth context value
export const mockAuthContextValue: AuthContextType = {
  user: mockUser,
  isLoading: false,
  isAuthenticated: true,
  signIn: vi.fn().mockResolvedValue({ success: true }),
  signUp: vi.fn().mockResolvedValue({ success: true }),
  confirmSignUp: vi.fn().mockResolvedValue({ success: true }),
  signOut: vi.fn().mockResolvedValue(undefined),
  resendConfirmationCode: vi.fn().mockResolvedValue({ success: true }),
  forgotPassword: vi.fn().mockResolvedValue({ success: true }),
  confirmForgotPassword: vi.fn().mockResolvedValue({ success: true })
};

// Setup common mocks
export const setupCommonMocks = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });

  // Mock window.location
  Object.defineProperty(window, 'location', {
    value: {
      hash: '',
      href: 'http://localhost:3000',
    },
    writable: true,
  });
};

// Reset all mocks
export const resetAllMocks = () => {
  vi.clearAllMocks();
};

// Create mock auth context
export const createMockAuthContext = (overrides?: Partial<AuthContextType>): AuthContextType => {
  return {
    ...mockAuthContextValue,
    ...overrides
  };
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authValue?: Partial<AuthContextType>;
}

// Custom render function with auth context
export const renderWithAuth = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { authValue, ...renderOptions } = options;
  
  const contextValue = createMockAuthContext(authValue);
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider value={contextValue}>
      {children}
    </AuthProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
