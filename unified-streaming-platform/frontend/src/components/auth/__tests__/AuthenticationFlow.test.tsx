import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AuthenticationFlow from '../AuthenticationFlow';

// Mock the AuthContext module
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockConfirmSignUp = vi.fn();
const mockResendConfirmationCode = vi.fn();
const mockForgotPassword = vi.fn();
const mockConfirmForgotPassword = vi.fn();
const mockChangePassword = vi.fn();

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    confirmSignUp: mockConfirmSignUp,
    resendConfirmationCode: mockResendConfirmationCode,
    forgotPassword: mockForgotPassword,
    confirmForgotPassword: mockConfirmForgotPassword,
    changePassword: mockChangePassword,
  }),
}));

describe('AuthenticationFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to return successful results by default
    mockSignIn.mockResolvedValue({ success: true });
    mockSignUp.mockResolvedValue({ success: true });
    mockConfirmSignUp.mockResolvedValue({ success: true });
    mockForgotPassword.mockResolvedValue({ success: true });
    mockConfirmForgotPassword.mockResolvedValue({ success: true });
    mockChangePassword.mockResolvedValue({ success: true });
  });

  describe('Component Rendering', () => {
    it('renders sign in form by default', () => {
      render(<AuthenticationFlow />);
      // Use heading role to be more specific about which "Sign In" text we want
      expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    });

    it('renders sign up link', () => {
      render(<AuthenticationFlow />);
      expect(screen.getByText("Don't have an account? Sign up")).toBeInTheDocument();
    });
  });

  describe('Sign In Flow', () => {
    it('handles email input', () => {
      render(<AuthenticationFlow />);
      const emailInput = screen.getByPlaceholderText('Enter your email');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('handles password input', () => {
      render(<AuthenticationFlow />);
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      expect(passwordInput).toHaveValue('password123');
    });

    it('calls signIn when form is submitted', async () => {
      render(<AuthenticationFlow />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Submit the form by clicking the button
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      }, { timeout: 3000 });
    });
  });

  describe('Sign Up Flow', () => {
    it('switches to sign up mode', () => {
      render(<AuthenticationFlow />);
      const signUpLink = screen.getByText("Don't have an account? Sign up");
      
      fireEvent.click(signUpLink);
      
      expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error when sign in fails', async () => {
      mockSignIn.mockResolvedValue({ 
        success: false, 
        error: 'Invalid credentials' 
      });
      
      render(<AuthenticationFlow />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(signInButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Loading States', () => {
    it('shows loading state during authentication', async () => {
      // Mock a delayed response
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });
      mockSignIn.mockReturnValue(signInPromise);
      
      render(<AuthenticationFlow />);
      
      const emailInput = screen.getByPlaceholderText('Enter your email');
      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const signInButton = screen.getByRole('button', { name: /sign in/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Trigger the loading state
      fireEvent.click(signInButton);
      
      // Check that inputs are disabled during loading
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      }, { timeout: 3000 });
      
      // Resolve the promise to complete the test
      resolveSignIn!({ success: true });
    });
  });

  describe('Password Reset Challenges', () => {
    describe('NEW_PASSWORD_REQUIRED Challenge', () => {
      it('switches to change password mode when NEW_PASSWORD_REQUIRED challenge is returned', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        
        render(<AuthenticationFlow />);
        
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'temppass123' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        }, { timeout: 3000 });
        
        expect(screen.getByText('Please set a new password to continue.')).toBeInTheDocument();
      });

      it('clears password fields when switching to change password mode', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        
        render(<AuthenticationFlow />);
        
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'temppass123' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
          const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
          expect(newPasswordInput).toHaveValue('');
          expect(confirmPasswordInput).toHaveValue('');
        }, { timeout: 3000 });
      });

      it('successfully changes password with valid inputs', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        mockChangePassword.mockResolvedValue({ success: true });
        
        render(<AuthenticationFlow />);
        
        // First trigger the challenge
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'temppass123' } });
        fireEvent.click(signInButton);
        
        // Wait for change password form
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        });
        
        // Fill in new password
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
        const changePasswordButton = screen.getByRole('button', { name: /set new password/i });
        
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.click(changePasswordButton);
        
        await waitFor(() => {
          expect(mockChangePassword).toHaveBeenCalledWith('test@example.com', 'newpass123!');
          expect(screen.getByText('Password changed successfully! You are now signed in.')).toBeInTheDocument();
        });
      });

      it('shows error when passwords do not match', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        
        render(<AuthenticationFlow />);
        
        // Fill in credentials and trigger challenge
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpassword' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        });
        
        // Enter mismatched passwords
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
        const changePasswordButton = screen.getByRole('button', { name: /set new password/i });
        
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different123!' } });
        fireEvent.click(changePasswordButton);
        
        await waitFor(() => {
          expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
        });
      });
    });

    describe('PASSWORD_RESET_REQUIRED Challenge', () => {
      it('switches to confirm forgot password mode when PASSWORD_RESET_REQUIRED challenge is returned', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'PASSWORD_RESET_REQUIRED',
          error: 'Password reset code sent to your email. Please check your email and use the reset code.'
        });
        
        render(<AuthenticationFlow />);
        
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpass123' } });
        fireEvent.click(signInButton);
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Set New Password' })).toBeInTheDocument();
          expect(screen.getByText('Password reset code sent to your email. Please check your email and enter the code below.')).toBeInTheDocument();
        });
      });

      it('successfully resets password with valid code and new password', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'PASSWORD_RESET_REQUIRED',
          error: 'Password reset code sent to your email.'
        });
        mockConfirmForgotPassword.mockResolvedValue({ success: true });
        
        render(<AuthenticationFlow />);
        
        // Fill in credentials and trigger password reset
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpassword' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Set New Password' })).toBeInTheDocument();
        });
        
        // Fill in reset form
        const codeInput = screen.getByPlaceholderText('Enter the code from your email');
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
        const resetButton = screen.getByRole('button', { name: /reset password/i });
        
        fireEvent.change(codeInput, { target: { value: '123456' } });
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.click(resetButton);
        
        await waitFor(() => {
          expect(mockConfirmForgotPassword).toHaveBeenCalledWith('test@example.com', '123456', 'newpass123!');
          expect(screen.getByText('Password reset successful! You can now sign in with your new password.')).toBeInTheDocument();
        });
      });
    });

    describe('Challenge Error Handling', () => {
      it('handles changePassword failure gracefully', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        mockChangePassword.mockResolvedValue({ 
          success: false, 
          error: 'Password change failed' 
        });
        
        render(<AuthenticationFlow />);
        
        // Fill in credentials and trigger challenge
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpassword' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        });
        
        const newPasswordInput = screen.getByPlaceholderText('Enter your new password');
        const confirmPasswordInput = screen.getByPlaceholderText('Confirm your new password');
        const changePasswordButton = screen.getByRole('button', { name: /set new password/i });
        
        fireEvent.change(newPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'newpass123!' } });
        fireEvent.click(changePasswordButton);
        
        await waitFor(() => {
          expect(screen.getByText('Password change failed')).toBeInTheDocument();
        });
      });

      it('validates required fields in change password form', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        
        render(<AuthenticationFlow />);
        
        // Fill in credentials and trigger challenge
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpassword' } });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        });
        
        // Try to submit without filling fields
        const changePasswordButton = screen.getByRole('button', { name: /set new password/i });
        fireEvent.click(changePasswordButton);
        
        await waitFor(() => {
          expect(screen.getByText('Please enter both password fields')).toBeInTheDocument();
        });
      });
    });

    describe('Remember Username Feature', () => {
      it('renders remember username checkbox checked by default', () => {
        render(<AuthenticationFlow />);
        
        const rememberCheckbox = screen.getByRole('checkbox', { name: /remember username/i });
        expect(rememberCheckbox).toBeChecked();
      });

      it('preserves email field when switching between modes', async () => {
        mockSignIn.mockResolvedValue({ 
          success: false, 
          challengeName: 'NEW_PASSWORD_REQUIRED',
          error: 'Additional authentication required'
        });
        
        render(<AuthenticationFlow />);
        
        // Fill in credentials
        const emailInput = screen.getByPlaceholderText('Enter your email');
        const passwordInput = screen.getByPlaceholderText('Enter your password');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'oldpassword' } });
        
        const signInButton = screen.getByRole('button', { name: /sign in/i });
        
        await act(async () => {
          fireEvent.click(signInButton);
        });
        
        await waitFor(() => {
          expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
        });
        
        // Email should be preserved and disabled in change password mode
        const preservedEmailInput = screen.getByDisplayValue('test@example.com');
        expect(preservedEmailInput).toBeDisabled();
      });
    });
  });
});
