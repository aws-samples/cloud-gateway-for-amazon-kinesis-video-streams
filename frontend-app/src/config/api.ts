// API Configuration
export const API_CONFIG = {
  // Pipeline Generator API endpoint
  PIPELINE_GENERATOR_ENDPOINT: 'https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline',
  
  // Camera Management API endpoint - Updated with new CDK deployment
  CAMERA_MANAGEMENT_ENDPOINT: 'https://kcbjsfve5f.execute-api.us-east-1.amazonaws.com/prod',
  
  // Amplify API name for camera management (when using Amplify)
  AMPLIFY_API_NAME: 'cameramanagement',
  
  // Request timeout in milliseconds
  REQUEST_TIMEOUT: 60000, // 60 seconds
  
  // Default retry configuration
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 second
};

// API response types - exported interfaces
export interface StreamCharacteristics {
  video?: {
    codec?: string;
    bitrate?: string;
    framerate?: string;
    resolution_info?: string;
    clock_rate?: string;
  };
  audio?: {
    codec?: string;
    bitrate?: string;
    sample_rate?: string;
    config?: string;
    profile?: string;
  };
  connection?: {
    authentication_method?: string;
    connection_time?: string;
  };
  frame_capture?: {
    width?: number;
    height?: number;
    format?: string;
    size_bytes?: number;
    capture_time_ms?: number;
    original_width?: number;
    original_height?: number;
    extraction_method?: string;
    frame_data?: string;
  };
  diagnostics?: {
    warnings?: string[];
    info?: string[];
  };
  raw_sdp?: string;
}

export interface APIResponse {
  stream_characteristics?: StreamCharacteristics;
  generated_pipeline?: string;
  stream_analysis?: {
    rtsp_analysis?: {
      sdp_content?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  error?: string;
  error_type?: string;
  suggestion?: string;
  timestamp?: string;
}

export interface RTSPTestRequest {
  rtsp_url: string;
  mode: 'characteristics' | 'pipeline';
  capture_frame?: boolean;
}

// API utility functions
export const apiUtils = {
  /**
   * Make a request to the pipeline generator API with timeout and retry logic
   */
  async makeRequest(payload: RTSPTestRequest): Promise<APIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

    try {
      const response = await fetch(API_CONFIG.PIPELINE_GENERATOR_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle Lambda response structure - the actual data is in the 'body' field as a JSON string
      if (responseData.statusCode && responseData.body) {
        // This is a Lambda response, parse the body
        const parsedBody = JSON.parse(responseData.body);
        return parsedBody;
      }
      
      // Direct API response (not Lambda)
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The stream analysis is taking longer than expected.');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during API request');
    }
  },

  /**
   * Validate RTSP URL format
   */
  validateRTSPUrl(url: string): { isValid: boolean; error?: string } {
    if (!url.trim()) {
      return { isValid: false, error: 'RTSP URL is required' };
    }

    if (!url.toLowerCase().startsWith('rtsp://')) {
      return { isValid: false, error: 'URL must start with rtsp://' };
    }

    try {
      new URL(url);
      return { isValid: true };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },

  /**
   * Format file size in human readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Always show one decimal place for consistency
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  },

  /**
   * Format duration in human readable format
   */
  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }
};

// Camera Management Types
export interface CameraConfiguration {
  camera_id: string;
  camera_name: string;
  make_model: string;
  installation_location: string;
  retention_hours: number;
  ml_model: string;
  rtsp_secret_arn: string;
  stream_metadata?: any;
  screen_capture_base64?: string;
  test_status: 'tested' | 'not_tested';
  created_at: string;
  updated_at: string;
}

export interface CreateCameraRequest {
  camera_name: string;
  rtsp_url: string;
  make_model: string;
  installation_location: string;
  retention_hours: number;
  ml_model: string;
  stream_metadata?: any;
  screen_capture_base64?: string;
  test_status?: 'tested' | 'not_tested';
}

export interface UpdateCameraRequest {
  camera_name?: string;
  rtsp_url?: string;
  make_model?: string;
  installation_location?: string;
  retention_hours?: number;
  ml_model?: string;
  stream_metadata?: any;
  screen_capture_base64?: string;
  test_status?: 'tested' | 'not_tested';
}

export interface CameraAPIResponse {
  message?: string;
  camera?: CameraConfiguration;
  cameras?: CameraConfiguration[];
  count?: number;
  error?: string;
}

// Camera Management API Functions
export const cameraAPI = {
  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Import fetchAuthSession dynamically to avoid issues if Amplify isn't configured
      const { fetchAuthSession } = await import('aws-amplify/auth');
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };
    } catch (error) {
      console.warn('⚠️ Could not get auth token, proceeding without authentication:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  },

  /**
   * Check if Amplify API is available and configured
   */
  async isAmplifyAPIAvailable(): Promise<boolean> {
    try {
      const { API } = await import('aws-amplify');
      // Try to get the API configuration
      const config = API.configure();
      return config && config.API && config.API.endpoints && 
             config.API.endpoints.some((endpoint: any) => endpoint.name === API_CONFIG.AMPLIFY_API_NAME);
    } catch (error) {
      console.log('Amplify API not available, using direct REST calls');
      return false;
    }
  },

  /**
   * Make API call using either Amplify API or direct REST
   */
  async makeAPICall(method: string, path: string, data?: any): Promise<any> {
    const useAmplify = await this.isAmplifyAPIAvailable();
    
    if (useAmplify) {
      return this.makeAmplifyAPICall(method, path, data);
    } else {
      return this.makeDirectAPICall(method, path, data);
    }
  },

  /**
   * Make API call using Amplify API client
   */
  async makeAmplifyAPICall(method: string, path: string, data?: any): Promise<any> {
    try {
      const { API } = await import('aws-amplify');
      
      const apiOptions: any = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data) {
        apiOptions.body = data;
      }
      
      let response;
      switch (method.toUpperCase()) {
        case 'GET':
          response = await API.get(API_CONFIG.AMPLIFY_API_NAME, path, apiOptions);
          break;
        case 'POST':
          response = await API.post(API_CONFIG.AMPLIFY_API_NAME, path, apiOptions);
          break;
        case 'PUT':
          response = await API.put(API_CONFIG.AMPLIFY_API_NAME, path, apiOptions);
          break;
        case 'DELETE':
          response = await API.del(API_CONFIG.AMPLIFY_API_NAME, path, apiOptions);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response;
    } catch (error) {
      console.error('Amplify API call failed:', error);
      throw error;
    }
  },

  /**
   * Make API call using direct REST
   */
  async makeDirectAPICall(method: string, path: string, data?: any): Promise<any> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_CONFIG.CAMERA_MANAGEMENT_ENDPOINT}${path}`;
      
      const options: RequestInit = {
        method: method.toUpperCase(),
        headers,
      };
      
      if (data && method.toUpperCase() !== 'GET') {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Direct API call failed:', error);
      throw error;
    }
  },

  /**
   * Create a new camera configuration
   */
  async createCamera(cameraData: CreateCameraRequest): Promise<CameraAPIResponse> {
    try {
      console.log('📹 Creating camera:', cameraData.camera_name);
      
      const result = await this.makeAPICall('POST', '/cameras', cameraData);
      
      console.log('✅ Camera created successfully:', result.camera?.camera_id);
      return result;
    } catch (error) {
      console.error('❌ Error creating camera:', error);
      throw error;
    }
  },

  /**
   * Get all cameras
   */
  async listCameras(limit?: number, includeFrames?: boolean): Promise<CameraAPIResponse> {
    try {
      console.log('📹 Fetching cameras list...');
      
      let path = '/cameras';
      const params = new URLSearchParams();
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      if (includeFrames) {
        params.append('include_frames', 'true');
      }
      
      if (params.toString()) {
        path += `?${params.toString()}`;
      }
      
      const result = await this.makeAPICall('GET', path);
      
      console.log('✅ Retrieved cameras:', result.count || result.cameras?.length || 0);
      return result;
    } catch (error) {
      console.error('❌ Error fetching cameras:', error);
      throw error;
    }
  },

  /**
   * Get a specific camera by ID
   */
  async getCamera(cameraId: string): Promise<CameraAPIResponse> {
    try {
      console.log('📹 Fetching camera:', cameraId);
      
      const result = await this.makeAPICall('GET', `/cameras/${cameraId}`);
      
      console.log('✅ Retrieved camera:', result.camera?.camera_name);
      return result;
    } catch (error) {
      console.error('❌ Error fetching camera:', error);
      throw error;
    }
  },

  /**
   * Update a camera configuration
   */
  async updateCamera(cameraId: string, updateData: UpdateCameraRequest): Promise<CameraAPIResponse> {
    try {
      console.log('📹 Updating camera:', cameraId);
      
      const result = await this.makeAPICall('PUT', `/cameras/${cameraId}`, updateData);
      
      console.log('✅ Camera updated successfully:', result.camera?.camera_name);
      return result;
    } catch (error) {
      console.error('❌ Error updating camera:', error);
      throw error;
    }
  },

  /**
   * Delete a camera configuration
   */
  async deleteCamera(cameraId: string): Promise<CameraAPIResponse> {
    try {
      console.log('📹 Deleting camera:', cameraId);
      
      const result = await this.makeAPICall('DELETE', `/cameras/${cameraId}`);
      
      console.log('✅ Camera deleted successfully');
      return result;
    } catch (error) {
      console.error('❌ Error deleting camera:', error);
      throw error;
    }
  }
};

// Export types for easier importing
export type { StreamCharacteristics as StreamCharacteristicsType };
export type { APIResponse as APIResponseType };
export type { RTSPTestRequest as RTSPTestRequestType };
export type { CameraConfiguration as CameraConfigurationType };
export type { CreateCameraRequest as CreateCameraRequestType };
export type { UpdateCameraRequest as UpdateCameraRequestType };
export type { CameraAPIResponse as CameraAPIResponseType };
