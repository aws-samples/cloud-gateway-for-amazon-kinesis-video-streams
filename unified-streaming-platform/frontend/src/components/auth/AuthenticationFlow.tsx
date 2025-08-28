/**
 * Authentication Flow Component
 * 
 * Provides sign in, sign up, and password reset functionality
 * using Cloudscape Design components
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  SpaceBetween,
  Form,
  FormField,
  Input,
  Button,
  Alert,
  Link,
  Box,
  Grid,
  Checkbox
} from '@cloudscape-design/components';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'signIn' | 'signUp' | 'confirmSignUp' | 'forgotPassword' | 'confirmForgotPassword' | 'changePassword';

const AuthenticationFlow: React.FC = () => {
  const { signIn, signUp, confirmSignUp, resendConfirmationCode, forgotPassword, confirmForgotPassword, changePassword } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberUsername, setRememberUsername] = useState(true);

  // Load saved username on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const shouldRemember = localStorage.getItem('rememberUsername') === 'true';
    if (savedUsername && shouldRemember) {
      setEmail(savedUsername);
      setRememberUsername(true);
    }
  }, []);

  // Save username when remember checkbox changes
  useEffect(() => {
    if (rememberUsername && email) {
      localStorage.setItem('rememberedUsername', email);
      localStorage.setItem('rememberUsername', 'true');
    } else if (!rememberUsername) {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberUsername');
    }
  }, [rememberUsername, email]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleSignIn called');
    console.log('🔍 Email:', email);
    console.log('🔍 Password length:', password.length);
    console.log('🔍 Event:', e);
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    clearMessages();

    console.log('🔍 Calling signIn function...');
    const result = await signIn(email, password);
    console.log('🔍 signIn result:', result);
    
    if (result.success) {
      console.log('✅ Sign in successful');
      setSuccess('Sign in successful!');
    } else if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
      console.log('🔄 Password change required');
      setPassword(''); // Clear the old password
      setConfirmPassword(''); // Clear confirm password
      setMode('changePassword');
      setSuccess('Please set a new password to continue.');
    } else if (result.challengeName === 'PASSWORD_RESET_REQUIRED') {
      console.log('🔄 Password reset required - redirecting to forgot password');
      setPassword(''); // Clear the old password
      setConfirmPassword(''); // Clear confirm password
      setMode('confirmForgotPassword');
      setSuccess('Password reset code sent to your email. Please check your email and enter the code below.');
    } else {
      console.log('❌ Sign in failed:', result.error);
      setError(result.error || 'Sign in failed');
    }
    
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await signUp(email, password);
    
    if (result.success) {
      setSuccess('Sign up successful! Please check your email for a confirmation code.');
      setMode('confirmSignUp');
    } else {
      setError(result.error || 'Sign up failed');
    }
    
    setIsLoading(false);
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    const result = await confirmSignUp(email, code);
    
    if (result.success) {
      setSuccess('Account confirmed! You can now sign in.');
      setMode('signIn');
      setCode('');
    } else {
      setError(result.error || 'Confirmation failed');
    }
    
    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    clearMessages();

    const result = await resendConfirmationCode(email);
    
    if (result.success) {
      setSuccess('Confirmation code resent! Please check your email.');
    } else {
      setError(result.error || 'Failed to resend code');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleForgotPassword called');
    console.log('🔍 Email value:', email);
    console.log('🔍 Current mode:', mode);
    console.log('🔍 Event:', e);
    
    if (!email) {
      console.log('❌ No email provided');
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    clearMessages();

    console.log('🔍 Calling forgotPassword function...');
    const result = await forgotPassword(email);
    console.log('🔍 forgotPassword result:', result);
    
    if (result.success) {
      console.log('✅ Password reset code sent successfully');
      setSuccess('Password reset code sent! Please check your email.');
      setMode('confirmForgotPassword');
    } else {
      console.log('❌ Password reset failed:', result.error);
      setError(result.error || 'Password reset failed');
    }
    
    setIsLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔍 handleChangePassword called');
    
    if (!password || !confirmPassword) {
      setError('Please enter both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    clearMessages();

    const result = await changePassword(email, password);
    console.log('🔍 changePassword result:', result);
    
    if (result.success) {
      console.log('✅ Password changed successfully');
      setSuccess('Password changed successfully! You are now signed in.');
    } else {
      console.log('❌ Password change failed:', result.error);
      setError(result.error || 'Password change failed');
    }
    
    setIsLoading(false);
  };

  const handleConfirmForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearMessages();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    const result = await confirmForgotPassword(email, code, password);
    
    if (result.success) {
      setSuccess('Password reset successful! You can now sign in with your new password.');
      setMode('signIn');
      setCode('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setError(result.error || 'Password reset confirmation failed');
    }
    
    setIsLoading(false);
  };

  const renderSignInForm = () => (
    <form onSubmit={handleSignIn}>
      <Form
        actions={
          <SpaceBetween direction="vertical" size="xs">
            <Button 
              key="signin-btn" 
              variant="primary" 
              loading={isLoading}
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Box key="signup-link" textAlign="center">
              <Link onFollow={() => setMode('signUp')}>
                Don't have an account? Sign up
              </Link>
            </Box>
            <Box key="forgot-link" textAlign="center">
              <Link onFollow={() => setMode('forgotPassword')}>
                Forgot your password?
              </Link>
            </Box>
          </SpaceBetween>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <FormField key="email-field" label="Email">
            <Input
              value={email}
              onChange={({ detail }) => setEmail(detail.value)}
              type="email"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </FormField>
          <FormField key="password-field" label="Password">
            <Input
              value={password}
              onChange={({ detail }) => setPassword(detail.value)}
              type="password"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </FormField>
          <FormField key="remember-field">
            <Checkbox
              checked={rememberUsername}
              onChange={({ detail }) => setRememberUsername(detail.checked)}
            >
              Remember username
            </Checkbox>
          </FormField>
        </SpaceBetween>
      </Form>
    </form>
  );

  const renderSignUpForm = () => (
    <Form
      actions={
        <SpaceBetween direction="vertical" size="xs">
          <Button key="signup-btn" variant="primary" loading={isLoading} formAction="submit">
            Sign Up
          </Button>
          <Box key="signin-link" textAlign="center">
            <Link onFollow={() => setMode('signIn')}>
              Already have an account? Sign in
            </Link>
          </Box>
        </SpaceBetween>
      }
      onSubmit={handleSignUp}
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField key="email-field" label="Email">
          <Input
            value={email}
            onChange={({ detail }) => setEmail(detail.value)}
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="password-field" label="Password">
          <Input
            value={password}
            onChange={({ detail }) => setPassword(detail.value)}
            type="password"
            placeholder="Enter your password"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="confirm-password-field" label="Confirm Password">
          <Input
            value={confirmPassword}
            onChange={({ detail }) => setConfirmPassword(detail.value)}
            type="password"
            placeholder="Confirm your password"
            disabled={isLoading}
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );

  const renderConfirmSignUpForm = () => (
    <Form
      actions={
        <SpaceBetween direction="vertical" size="xs">
          <Button key="confirm-btn" variant="primary" loading={isLoading} formAction="submit">
            Confirm Account
          </Button>
          <Button key="resend-btn" variant="link" onClick={handleResendCode} disabled={isLoading}>
            Resend confirmation code
          </Button>
          <Box key="back-link" textAlign="center">
            <Link onFollow={() => setMode('signIn')}>
              Back to sign in
            </Link>
          </Box>
        </SpaceBetween>
      }
      onSubmit={handleConfirmSignUp}
    >
      <SpaceBetween direction="vertical" size="l">
        <FormField key="email-field" label="Email">
          <Input
            value={email}
            onChange={({ detail }) => setEmail(detail.value)}
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="code-field" label="Confirmation Code">
          <Input
            value={code}
            onChange={({ detail }) => setCode(detail.value)}
            placeholder="Enter the code from your email"
            disabled={isLoading}
          />
        </FormField>
      </SpaceBetween>
    </Form>
  );

  const renderForgotPasswordForm = () => {
    console.log('🔍 Rendering forgot password form, current email:', email);
    return (
      <form onSubmit={handleForgotPassword}>
        <Form
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <Button 
                key="reset-btn" 
                variant="primary" 
                loading={isLoading}
                onClick={handleForgotPassword}
              >
                Send Reset Code
              </Button>
              <Box key="back-link" textAlign="center">
                <Link onFollow={() => setMode('signIn')}>
                  Back to sign in
                </Link>
              </Box>
            </SpaceBetween>
          }
        >
          <SpaceBetween direction="vertical" size="l">
            <FormField key="email-field" label="Email">
              <Input
                value={email}
                onChange={({ detail }) => setEmail(detail.value)}
                type="email"
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </FormField>
          </SpaceBetween>
        </Form>
      </form>
    );
  };

  const renderChangePasswordForm = () => (
    <form onSubmit={handleChangePassword}>
      <Form
        actions={
          <SpaceBetween direction="vertical" size="xs">
            <Button 
              key="change-btn" 
              variant="primary" 
              loading={isLoading}
              onClick={handleChangePassword}
            >
              Set New Password
            </Button>
            <Box key="back-link" textAlign="center">
              <Link onFollow={() => setMode('signIn')}>
                Back to sign in
              </Link>
            </Box>
          </SpaceBetween>
        }
      >
        <SpaceBetween direction="vertical" size="l">
          <FormField key="email-field" label="Email">
            <Input
              value={email}
              onChange={({ detail }) => setEmail(detail.value)}
              type="email"
              placeholder="Enter your email"
              disabled={true}
            />
          </FormField>
          <FormField key="new-password-field" label="New Password">
            <Input
              value={password}
              onChange={({ detail }) => setPassword(detail.value)}
              type="password"
              placeholder="Enter your new password"
              disabled={isLoading}
            />
          </FormField>
          <FormField key="confirm-new-password-field" label="Confirm New Password">
            <Input
              value={confirmPassword}
              onChange={({ detail }) => setConfirmPassword(detail.value)}
              type="password"
              placeholder="Confirm your new password"
              disabled={isLoading}
            />
          </FormField>
        </SpaceBetween>
      </Form>
    </form>
  );

  const renderConfirmForgotPasswordForm = () => (
    <form onSubmit={handleConfirmForgotPassword}>
      <Form
        actions={
          <SpaceBetween direction="vertical" size="xs">
            <Button 
              key="reset-confirm-btn" 
              variant="primary" 
              loading={isLoading}
              onClick={handleConfirmForgotPassword}
            >
              Reset Password
            </Button>
            <Box key="back-link" textAlign="center">
              <Link onFollow={() => setMode('signIn')}>
                Back to sign in
              </Link>
            </Box>
          </SpaceBetween>
        }
      >
      <SpaceBetween direction="vertical" size="l">
        <FormField key="email-field" label="Email">
          <Input
            value={email}
            onChange={({ detail }) => setEmail(detail.value)}
            type="email"
            placeholder="Enter your email"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="code-field" label="Reset Code">
          <Input
            value={code}
            onChange={({ detail }) => setCode(detail.value)}
            placeholder="Enter the code from your email"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="new-password-field" label="New Password">
          <Input
            value={password}
            onChange={({ detail }) => setPassword(detail.value)}
            type="password"
            placeholder="Enter your new password"
            disabled={isLoading}
          />
        </FormField>
        <FormField key="confirm-new-password-field" label="Confirm New Password">
          <Input
            value={confirmPassword}
            onChange={({ detail }) => setConfirmPassword(detail.value)}
            type="password"
            placeholder="Confirm your new password"
            disabled={isLoading}
          />
        </FormField>
      </SpaceBetween>
    </Form>
    </form>
  );

  const getTitle = () => {
    switch (mode) {
      case 'signIn': return 'Sign In';
      case 'signUp': return 'Create Account';
      case 'confirmSignUp': return 'Confirm Account';
      case 'forgotPassword': return 'Reset Password';
      case 'confirmForgotPassword': return 'Set New Password';
      case 'changePassword': return 'Change Password';
      default: return 'Authentication';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'signIn': return 'Sign in to access the Kinesis Video Streams Gateway';
      case 'signUp': return 'Create a new account to get started';
      case 'confirmSignUp': return 'Enter the confirmation code sent to your email';
      case 'forgotPassword': return 'Enter your email to receive a password reset code';
      case 'confirmForgotPassword': return 'Enter the reset code and your new password';
      case 'changePassword': return 'Set a new password to complete your sign in';
      default: return '';
    }
  };

  const renderForm = () => {
    switch (mode) {
      case 'signIn': return renderSignInForm();
      case 'signUp': return renderSignUpForm();
      case 'confirmSignUp': return renderConfirmSignUpForm();
      case 'forgotPassword': return renderForgotPasswordForm();
      case 'confirmForgotPassword': return renderConfirmForgotPasswordForm();
      case 'changePassword': return renderChangePasswordForm();
      default: return renderSignInForm();
    }
  };

  return (
    <Grid
      gridDefinition={[
        { colspan: { default: 12, xs: 10, s: 8, m: 6, l: 4 }, offset: { default: 0, xs: 1, s: 2, m: 3, l: 4 } }
      ]}
    >
      <Container>
        <SpaceBetween direction="vertical" size="l">
          <Header key="header" variant="h1" description={getDescription()}>
            {getTitle()}
          </Header>
          
          <div key="alerts">
            {error && (
              <Alert type="error" dismissible onDismiss={() => setError('')}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert type="success" dismissible onDismiss={() => setSuccess('')}>
                {success}
              </Alert>
            )}
          </div>
          
          <div key="form">
            {renderForm()}
          </div>
        </SpaceBetween>
      </Container>
    </Grid>
  );
};

export default AuthenticationFlow;
