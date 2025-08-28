import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthenticationFlow from '../AuthenticationFlow';

// Mock the AuthContext module
vi.mock('../../../contexts/AuthContext', () => {
  const mockContext = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    confirmSignUp: vi.fn(),
    signOut: vi.fn(),
    resendConfirmationCode: vi.fn(),
    forgotPassword: vi.fn(),
    confirmResetPassword: vi.fn(),
  };
  
  return {
    AuthContext: React.createContext(mockContext),
    useAuth: () => mockContext,
  };
});

const renderWithAuth = (authOverrides = {}) => {
  // Just render the component directly since the mock handles the context
  return render(<AuthenticationFlow />);
};

describe('AuthenticationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders sign in form by default', () => {
      renderWithAuth();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    });

    it('renders tabs for different auth modes', () => {
      renderWithAuth();
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Sign In Flow', () => {
    it('handles email input', () => {
      renderWithAuth();
      const emailInput = screen.getByPlaceholderText('Enter your email');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('handles password input', () => {
      renderWithAuth();
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(passwordInput).toHaveValue('password123');
    });

    it('calls signIn when form is submitted', async () => {
      const mockSignIn = vi.fn().mockResolvedValue({});
      renderWithAuth({ signIn: mockSignIn });
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Sign Up Flow', () => {
    it('switches to sign up tab', () => {
      renderWithAuth();
      const signUpTab = screen.getByText('Sign Up');
      
      fireEvent.click(signUpTab);
      expect(screen.getByText('Create Account')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error when sign in fails', async () => {
      const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'));
      renderWithAuth({ signIn: mockSignIn });
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during authentication', () => {
      renderWithAuth({ isLoading: true });
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
