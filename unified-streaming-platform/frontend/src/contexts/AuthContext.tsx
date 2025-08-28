/**
 * Custom Authentication Context
 * 
 * Provides authentication state management using AWS Cognito SDK directly
 * without Amplify HOC dependencies.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  GlobalSignOutCommand,
  AuthFlowType,
  ChallengeNameType
} from '@aws-sdk/client-cognito-identity-provider';
import { cognitoConfig } from '../config/app-config';

// Types
export interface AuthUser {
  username: string;
  email: string;
  attributes: Record<string, string>;
  accessToken: string;
  idToken: string;
  refreshToken: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; challengeName?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  confirmSignUp: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
  resendConfirmationCode: (email: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  confirmForgotPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.region
});

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  ID_TOKEN: 'auth_id_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_DATA: 'auth_user_data'
};

// Helper functions
const getStoredTokens = () => {
  try {
    return {
      accessToken: localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
      idToken: localStorage.getItem(STORAGE_KEYS.ID_TOKEN),
      refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      userData: localStorage.getItem(STORAGE_KEYS.USER_DATA)
    };
  } catch {
    return { accessToken: null, idToken: null, refreshToken: null, userData: null };
  }
};

const storeTokens = (accessToken: string, idToken: string, refreshToken: string, userData: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.ID_TOKEN, idToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
  } catch (error) {
    console.warn('Failed to store auth tokens:', error);
  }
};

const clearTokens = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear auth tokens:', error);
  }
};

const parseJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Auth Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [challengeSession, setChallengeSession] = useState<string | null>(null);
  const [challengeUsername, setChallengeUsername] = useState<string | null>(null);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      const { accessToken, idToken, refreshToken, userData } = getStoredTokens();
      
      if (accessToken && idToken && refreshToken && userData) {
        try {
          // Verify token is still valid
          const command = new GetUserCommand({
            AccessToken: accessToken
          });
          
          await cognitoClient.send(command);
          
          // Token is valid, restore user session
          const parsedUserData = JSON.parse(userData);
          setUser(parsedUserData);
        } catch (error) {
          console.log('Stored tokens invalid, clearing session');
          clearTokens();
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        ClientId: cognitoConfig.userPoolWebClientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });

      const response = await cognitoClient.send(command);

      if (response.ChallengeName) {
        // Store session and username for challenge response
        setChallengeSession(response.Session || null);
        setChallengeUsername(email);
        
        return {
          success: false,
          challengeName: response.ChallengeName,
          error: 'Additional authentication required'
        };
      }

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
        
        if (AccessToken && IdToken && RefreshToken) {
          // Parse user info from ID token
          const idTokenPayload = parseJWT(IdToken);
          const userData: AuthUser = {
            username: idTokenPayload.sub,
            email: idTokenPayload.email || email,
            attributes: {
              email: idTokenPayload.email || email,
              email_verified: idTokenPayload.email_verified || 'false'
            },
            accessToken: AccessToken,
            idToken: IdToken,
            refreshToken: RefreshToken
          };

          // Store tokens and user data
          storeTokens(AccessToken, IdToken, RefreshToken, JSON.stringify(userData));
          setUser(userData);

          return { success: true };
        }
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle password reset required exception
      if (error.name === 'PasswordResetRequiredException') {
        // For RESET_REQUIRED users, we need to initiate forgot password flow
        try {
          const forgotCommand = new ForgotPasswordCommand({
            ClientId: cognitoConfig.userPoolWebClientId,
            Username: email
          });
          
          await cognitoClient.send(forgotCommand);
          
          return {
            success: false,
            challengeName: 'PASSWORD_RESET_REQUIRED',
            error: 'Password reset code sent to your email. Please check your email and use the reset code.'
          };
        } catch (forgotError: any) {
          return {
            success: false,
            challengeName: 'PASSWORD_RESET_REQUIRED',
            error: 'Password reset required. Please use the forgot password option.'
          };
        }
      }
      
      return { 
        success: false, 
        error: error.message || 'Sign in failed' 
      };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const command = new SignUpCommand({
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: 'email',
            Value: email
          }
        ]
      });

      await cognitoClient.send(command);
      return { success: true };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Sign up failed' 
      };
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email,
        ConfirmationCode: code
      });

      await cognitoClient.send(command);
      return { success: true };
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Confirmation failed' 
      };
    }
  };

  const resendConfirmationCode = async (email: string) => {
    try {
      const command = new ResendConfirmationCodeCommand({
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email
      });

      await cognitoClient.send(command);
      return { success: true };
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      return { 
        success: false, 
        error: error.message || 'Resend failed' 
      };
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email
      });

      await cognitoClient.send(command);
      return { success: true };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return { 
        success: false, 
        error: error.message || 'Password reset failed' 
      };
    }
  };

  const confirmForgotPassword = async (email: string, code: string, newPassword: string) => {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: cognitoConfig.userPoolWebClientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword
      });

      await cognitoClient.send(command);
      return { success: true };
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      return { 
        success: false, 
        error: error.message || 'Password confirmation failed' 
      };
    }
  };

  const changePassword = async (email: string, newPassword: string) => {
    try {
      if (!challengeSession || !challengeUsername) {
        return { 
          success: false, 
          error: 'No active challenge session. Please sign in again.' 
        };
      }

      const command = new RespondToAuthChallengeCommand({
        ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
        ClientId: cognitoConfig.userPoolWebClientId,
        Session: challengeSession,
        ChallengeResponses: {
          USERNAME: challengeUsername,
          NEW_PASSWORD: newPassword
        }
      });

      const response = await cognitoClient.send(command);

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
        
        if (AccessToken && IdToken && RefreshToken) {
          // Parse user info from ID token
          const idTokenPayload = parseJWT(IdToken);
          const userData: AuthUser = {
            username: idTokenPayload.sub,
            email: idTokenPayload.email || email,
            attributes: {
              email: idTokenPayload.email || email,
              email_verified: idTokenPayload.email_verified || 'false'
            },
            accessToken: AccessToken,
            idToken: IdToken,
            refreshToken: RefreshToken
          };

          storeTokens(AccessToken, IdToken, RefreshToken, JSON.stringify(userData));
          setUser(userData);
          
          // Clear challenge session
          setChallengeSession(null);
          setChallengeUsername(null);

          return { success: true };
        }
      }

      return { success: false, error: 'Password change failed' };
    } catch (error: any) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: error.message || 'Password change failed' 
      };
    }
  };

  const signOut = async () => {
    try {
      if (user?.accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: user.accessToken
        });
        await cognitoClient.send(command);
      }
    } catch (error) {
      console.warn('Global sign out failed:', error);
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const refreshSession = async (): Promise<boolean> => {
    // TODO: Implement token refresh logic
    // This would use the refresh token to get new access/id tokens
    return false;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    confirmSignUp,
    resendConfirmationCode,
    forgotPassword,
    confirmForgotPassword,
    changePassword,
    signOut,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
