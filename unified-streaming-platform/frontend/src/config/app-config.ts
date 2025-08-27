/**
 * Application Configuration
 * 
 * This file provides a centralized configuration system that automatically
 * loads from the generated frontend-config.json file created by the CDK deployment.
 * 
 * The configuration is generated automatically by generate-frontend-config.sh
 * and contains real values from the deployed CDK stack.
 */

// Import the generated configuration
import generatedConfig from './frontend-config.json';

// Configuration interfaces
export interface AWSConfig {
  region: string;
  accountId: string;
}

export interface CognitoConfig {
  userPoolId: string;
  userPoolWebClientId: string;
  userPoolNativeClientId: string;
  region: string;
}

export interface APIEndpoints {
  pipelineGeneration: string;
  rtspCharacteristics: string;
  gstreamerTools: {
    searchElements: string;
    troubleshoot: string;
    optimize: string;
    validate: string;
    expert: string;
  };
  cameraManagement: {
    list: string;
    create: string;
    get: string;
    update: string;
    delete: string;
  };
}

export interface APIConfig {
  baseUrl: string;
  gatewayId: string;
  stage: string;
  endpoints: APIEndpoints;
}

export interface BackendConfig {
  knowledgeBaseId: string;
  claudeModel: string;
  enhancedLambdaFunction: string;
  cameraLambdaFunction: string;
  camerasTable: string;
}

export interface RTSPTestServerConfig {
  enabled: boolean;
  cluster: string;
  service: string;
  ports: {
    rtsp: number;
    http: number;
    https: number;
    admin: number;
  };
  testStreams: string[];
}

export interface AuthenticationConfig {
  tokenType: string;
  authFlow: string;
  usernameFormat: string;
}

export interface AppConfig {
  aws: AWSConfig;
  cognito: CognitoConfig;
  api: APIConfig;
  backend: BackendConfig;
  rtspTestServer: RTSPTestServerConfig;
  authentication: AuthenticationConfig;
}

// Load and validate configuration
function loadConfiguration(): AppConfig {
  try {
    // Validate that required configuration exists
    if (!generatedConfig) {
      throw new Error('Frontend configuration not found. Please run generate-frontend-config.sh');
    }

    // Validate required fields
    const requiredFields = [
      'aws.region',
      'aws.accountId',
      'cognito.userPoolId',
      'cognito.userPoolWebClientId',
      'api.baseUrl',
      'api.gatewayId'
    ];

    for (const field of requiredFields) {
      const value = field.split('.').reduce((obj: any, key) => obj?.[key], generatedConfig);
      if (!value) {
        throw new Error(`Missing required configuration field: ${field}`);
      }
    }

    return generatedConfig as AppConfig;
  } catch (error) {
    console.error('❌ Configuration Error:', error);
    
    // Provide fallback configuration for development
    console.warn('⚠️ Using fallback configuration. Please run generate-frontend-config.sh to get real values.');
    
    return {
      aws: {
        region: 'us-east-1',
        accountId: 'REPLACE_WITH_ACCOUNT_ID'
      },
      cognito: {
        userPoolId: 'REPLACE_WITH_USER_POOL_ID',
        userPoolWebClientId: 'REPLACE_WITH_WEB_CLIENT_ID',
        userPoolNativeClientId: 'REPLACE_WITH_NATIVE_CLIENT_ID',
        region: 'us-east-1'
      },
      api: {
        baseUrl: 'REPLACE_WITH_API_BASE_URL',
        gatewayId: 'REPLACE_WITH_API_GATEWAY_ID',
        stage: 'prod',
        endpoints: {
          pipelineGeneration: '/v1/generate-pipeline',
          rtspCharacteristics: '/v1/characteristics',
          gstreamerTools: {
            searchElements: '/v1/tools/search-elements',
            troubleshoot: '/v1/tools/troubleshoot',
            optimize: '/v1/tools/optimize',
            validate: '/v1/tools/validate',
            expert: '/v1/tools/expert'
          },
          cameraManagement: {
            list: '/cameras',
            create: '/cameras',
            get: '/cameras/{id}',
            update: '/cameras/{id}',
            delete: '/cameras/{id}'
          }
        }
      },
      backend: {
        knowledgeBaseId: 'REPLACE_WITH_KNOWLEDGE_BASE_ID',
        claudeModel: 'REPLACE_WITH_CLAUDE_MODEL',
        enhancedLambdaFunction: 'REPLACE_WITH_ENHANCED_LAMBDA',
        cameraLambdaFunction: 'REPLACE_WITH_CAMERA_LAMBDA',
        camerasTable: 'REPLACE_WITH_CAMERAS_TABLE'
      },
      rtspTestServer: {
        enabled: false,
        cluster: 'REPLACE_WITH_CLUSTER',
        service: 'REPLACE_WITH_SERVICE',
        ports: {
          rtsp: 8554,
          http: 8080,
          https: 8443,
          admin: 8888
        },
        testStreams: []
      },
      authentication: {
        tokenType: 'idToken',
        authFlow: 'ADMIN_NO_SRP_AUTH',
        usernameFormat: 'email'
      }
    };
  }
}

// Export the loaded configuration
export const appConfig: AppConfig = loadConfiguration();

// Export individual configuration sections for convenience
export const awsConfig = appConfig.aws;
export const cognitoConfig = appConfig.cognito;
export const apiConfig = appConfig.api;
export const backendConfig = appConfig.backend;
export const rtspTestServerConfig = appConfig.rtspTestServer;
export const authenticationConfig = appConfig.authentication;

// Configuration validation utilities
export const configUtils = {
  /**
   * Check if the configuration is using real values (not placeholders)
   */
  isConfigurationValid(): boolean {
    const hasPlaceholders = JSON.stringify(appConfig).includes('REPLACE_WITH_');
    return !hasPlaceholders;
  },

  /**
   * Get configuration status for debugging
   */
  getConfigurationStatus(): {
    isValid: boolean;
    source: 'generated' | 'fallback';
    missingFields: string[];
  } {
    const isValid = this.isConfigurationValid();
    const source = isValid ? 'generated' : 'fallback';
    
    const missingFields: string[] = [];
    const checkField = (obj: any, path: string) => {
      const value = path.split('.').reduce((o, key) => o?.[key], obj);
      if (!value || (typeof value === 'string' && value.startsWith('REPLACE_WITH_'))) {
        missingFields.push(path);
      }
    };

    // Check critical fields
    checkField(appConfig, 'cognito.userPoolId');
    checkField(appConfig, 'cognito.userPoolWebClientId');
    checkField(appConfig, 'api.baseUrl');
    checkField(appConfig, 'api.gatewayId');

    return {
      isValid,
      source,
      missingFields
    };
  },

  /**
   * Log configuration status to console
   */
  logConfigurationStatus(): void {
    const status = this.getConfigurationStatus();
    
    if (status.isValid) {
      console.log('✅ Configuration loaded successfully from generated config');
      console.log('📋 Configuration details:', {
        userPoolId: cognitoConfig.userPoolId,
        apiBaseUrl: apiConfig.baseUrl,
        rtspServerEnabled: rtspTestServerConfig.enabled
      });
    } else {
      console.warn('⚠️ Using fallback configuration');
      console.warn('Missing or invalid fields:', status.missingFields);
      console.warn('Please run: cd ../.. && ./generate-frontend-config.sh');
    }
  }
};

// Log configuration status on load (development only)
if (import.meta.env.DEV) {
  configUtils.logConfigurationStatus();
}

// Export default configuration
export default appConfig;
