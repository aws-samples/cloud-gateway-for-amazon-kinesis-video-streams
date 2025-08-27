/**
 * AWS Configuration for Amplify
 * 
 * This file provides AWS configuration using the generated frontend config
 * instead of the hardcoded aws-exports.js file.
 */

import { cognitoConfig, apiConfig, awsConfig } from './app-config';

// Amplify configuration object
export const amplifyConfig = {
  Auth: {
    Cognito: {
      // AWS Region
      region: cognitoConfig.region,
      
      // Cognito User Pool configuration
      userPoolId: cognitoConfig.userPoolId,
      userPoolClientId: cognitoConfig.userPoolWebClientId,
      
      // Authentication flow configuration
      loginWith: {
        email: true,
        username: false,
        phone: false
      },
      
      // Sign up configuration
      signUpVerificationMethod: 'code',
      userAttributes: {
        email: {
          required: true
        }
      },
      
      // Allow users to sign up
      allowGuestAccess: false,
      
      // Password policy
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: false
      }
    }
  },
  
  API: {
    REST: {
      // Unified API configuration
      UnifiedAPI: {
        endpoint: apiConfig.baseUrl,
        region: awsConfig.region,
        service: 'execute-api'
      }
    }
  }
};

// Legacy aws-exports format for backward compatibility
export const awsExports = {
  aws_project_region: awsConfig.region,
  aws_cognito_region: cognitoConfig.region,
  aws_user_pools_id: cognitoConfig.userPoolId,
  aws_user_pools_web_client_id: cognitoConfig.userPoolWebClientId,
  
  // Authentication configuration
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: ['SMS'],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
  
  // OAuth configuration (empty for now)
  oauth: {},
  
  // API configuration
  aws_cloud_logic_custom: [
    {
      name: 'UnifiedAPI',
      endpoint: apiConfig.baseUrl,
      region: awsConfig.region
    }
  ]
};

// Export both formats
export default amplifyConfig;
