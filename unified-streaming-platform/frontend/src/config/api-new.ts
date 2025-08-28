/**
 * Modern API Configuration
 * 
 * This file provides API configuration using the generated frontend config
 * with automatic endpoint resolution and authentication handling.
 */

import { apiConfig, authenticationConfig, rtspTestServerConfig } from './app-config';

// API Configuration using generated config
export const API_CONFIG = {
  // Base API URL from generated config
  BASE_URL: apiConfig.baseUrl,
  
  // API Gateway details
  GATEWAY_ID: apiConfig.gatewayId,
  STAGE: apiConfig.stage,
  
  // Full endpoint URLs (constructed from base URL + paths)
  ENDPOINTS: {
    // Pipeline generation endpoints
    PIPELINE_GENERATION: `${apiConfig.baseUrl}${apiConfig.endpoints.pipelineGeneration}`,
    RTSP_CHARACTERISTICS: `${apiConfig.baseUrl}${apiConfig.endpoints.rtspCharacteristics}`,
    
    // GStreamer expert tools endpoints
    GSTREAMER_TOOLS: {
      SEARCH_ELEMENTS: `${apiConfig.baseUrl}${apiConfig.endpoints.gstreamerTools.searchElements}`,
      TROUBLESHOOT: `${apiConfig.baseUrl}${apiConfig.endpoints.gstreamerTools.troubleshoot}`,
      OPTIMIZE: `${apiConfig.baseUrl}${apiConfig.endpoints.gstreamerTools.optimize}`,
      VALIDATE: `${apiConfig.baseUrl}${apiConfig.endpoints.gstreamerTools.validate}`,
      EXPERT: `${apiConfig.baseUrl}${apiConfig.endpoints.gstreamerTools.expert}`
    },
    
    // Camera management endpoints
    CAMERA_MANAGEMENT: {
      LIST: `${apiConfig.baseUrl}${apiConfig.endpoints.cameraManagement.list}`,
      CREATE: `${apiConfig.baseUrl}${apiConfig.endpoints.cameraManagement.create}`,
      GET: (cameraId: string) => `${apiConfig.baseUrl}${apiConfig.endpoints.cameraManagement.get.replace('{id}', cameraId)}`,
      UPDATE: (cameraId: string) => `${apiConfig.baseUrl}${apiConfig.endpoints.cameraManagement.update.replace('{id}', cameraId)}`,
      DELETE: (cameraId: string) => `${apiConfig.baseUrl}${apiConfig.endpoints.cameraManagement.delete.replace('{id}', cameraId)}`
    }
  },
  
  // Request configuration
  REQUEST_TIMEOUT: 60000, // 60 seconds
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 second
  
  // Authentication configuration
  AUTH_FLOW: authenticationConfig.authFlow,
  TOKEN_TYPE: authenticationConfig.tokenType,
  USERNAME_FORMAT: authenticationConfig.usernameFormat
};

// RTSP Test Server configuration
export const RTSP_CONFIG = {
  ENABLED: rtspTestServerConfig.enabled,
  TEST_STREAMS: rtspTestServerConfig.testStreams,
  PORTS: rtspTestServerConfig.ports,
  
  // Helper to get a random test stream
  getRandomTestStream(): string | null {
    if (!rtspTestServerConfig.enabled || rtspTestServerConfig.testStreams.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * rtspTestServerConfig.testStreams.length);
    return rtspTestServerConfig.testStreams[randomIndex];
  },
  
  // Helper to get test streams by quality
  getTestStreamsByQuality(): { [key: string]: string[] } {
    const streams = rtspTestServerConfig.testStreams;
    return {
      '720p': streams.filter(stream => stream.includes('720p')),
      '360p': streams.filter(stream => stream.includes('360p')),
      'h264': streams.filter(stream => stream.includes('h264')),
      'h265': streams.filter(stream => stream.includes('h265')),
      'aac': streams.filter(stream => stream.includes('aac'))
    };
  },

  // Get RTSP test server list endpoint URL
  getListEndpoint(): string | null {
    if (!rtspTestServerConfig.enabled || rtspTestServerConfig.testStreams.length === 0) {
      return null;
    }
    // Extract IP from first test stream
    const firstStream = rtspTestServerConfig.testStreams[0];
    const match = firstStream.match(/rtsp:\/\/([^:]+):/);
    if (match) {
      const ip = match[1];
      return `http://${ip}:${rtspTestServerConfig.ports.http}/rtsp-urls`;
    }
    return null;
  }
};

// API response types (keeping existing interfaces)
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

// RTSP Test Server response types
export interface RTSPStreamInfo {
  url: string;
  path: string;
  description: string;
  codec: string;
  resolution: string;
  framerate: number;
  bitrate: string;
  audio: string;
  authentication: string;
  transport: string;
  port: number;
  server: string;
  test_credentials?: any;
}

export interface RTSPTestServerResponse {
  server_info: {
    name: string;
    version: string;
    public_ip: string;
    total_streams: number;
    coverage: string;
    authentication_support: string[];
    transport_support: string[];
    max_resolution: string;
    max_framerate: string;
  };
  rtsp_urls: RTSPStreamInfo[];
  authentication_info: any;
  usage_examples: any;
}

// GStreamer Tools request/response types
export interface GStreamerToolRequest {
  query?: string;
  pipeline?: string;
  issue?: string;
  symptoms?: string;
  target_platform?: string;
  performance_requirements?: string;
}

export interface GStreamerToolResponse {
  result?: any;
  elements?: any[];
  suggestions?: string[];
  optimizations?: string[];
  validation_results?: any;
  error?: string;
  timestamp?: string;
}

// Camera Management types (keeping existing interfaces)
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

// Modern API utility functions
export const apiUtils = {
  /**
   * Get authentication headers for API requests
   */
  async getAuthHeaders(): Promise<HeadersInit> {
    try {
      // Get token from localStorage (where our custom auth stores it)
      const idToken = localStorage.getItem('auth_id_token');
      
      if (idToken) {
        return {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        };
      } else {
        console.warn('⚠️ No authentication token found, proceeding without authentication');
        return {
          'Content-Type': 'application/json'
        };
      }
    } catch (error) {
      console.warn('⚠️ Could not get auth token, proceeding without authentication:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  },

  /**
   * Make authenticated API request with retry logic
   */
  async makeAuthenticatedRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const headers = await this.getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    return this.makeRequestWithRetry(url, requestOptions);
  },

  /**
   * Make API request with timeout and retry logic
   */
  async makeRequestWithRetry(
    url: string, 
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle Lambda response structure
      if (responseData.statusCode && responseData.body) {
        const parsedBody = JSON.parse(responseData.body);
        return parsedBody;
      }
      
      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Retry logic
      if (attempt < API_CONFIG.RETRY_ATTEMPTS && 
          error instanceof Error && 
          !error.name.includes('Abort')) {
        
        console.warn(`Request failed (attempt ${attempt}), retrying...`, error.message);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.makeRequestWithRetry(url, options, attempt + 1);
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timed out. The operation is taking longer than expected.');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during API request');
    }
  },

  /**
   * Make pipeline generation request
   */
  async generatePipeline(payload: RTSPTestRequest): Promise<APIResponse> {
    return this.makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.PIPELINE_GENERATION, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Get RTSP stream characteristics
   */
  async getStreamCharacteristics(payload: RTSPTestRequest): Promise<APIResponse> {
    return this.makeAuthenticatedRequest(API_CONFIG.ENDPOINTS.RTSP_CHARACTERISTICS, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Use GStreamer expert tools
   */
  async useGStreamerTool(
    tool: 'searchElements' | 'troubleshoot' | 'optimize' | 'validate' | 'expert',
    payload: GStreamerToolRequest
  ): Promise<GStreamerToolResponse> {
    const endpoint = API_CONFIG.ENDPOINTS.GSTREAMER_TOOLS[tool.toUpperCase() as keyof typeof API_CONFIG.ENDPOINTS.GSTREAMER_TOOLS];
    
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Get RTSP test server stream list
   */
  async getRTSPTestStreams(): Promise<RTSPTestServerResponse | null> {
    // Use public IP from config instead of calling localhost API
    const publicIP = '44.222.205.185'; // Current RTSP server public IP
    const port = 8554;
    
    const testStreams = [
      {
        url: `rtsp://${publicIP}:${port}/h264_720p_25fps`,
        description: 'H.264 720p 25fps (No Audio)',
        codec: 'H.264',
        resolution: '720p',
        framerate: '25fps',
        audio: false
      },
      {
        url: `rtsp://${publicIP}:${port}/h264_360p_15fps`,
        description: 'H.264 360p 15fps (No Audio)',
        codec: 'H.264',
        resolution: '360p',
        framerate: '15fps',
        audio: false
      },
      {
        url: `rtsp://${publicIP}:${port}/h264_360p_15fps_aac`,
        description: 'H.264 360p 15fps + AAC Audio',
        codec: 'H.264',
        resolution: '360p',
        framerate: '15fps',
        audio: true
      },
      {
        url: `rtsp://${publicIP}:${port}/h265_720p_25fps`,
        description: 'H.265 720p 25fps (No Audio)',
        codec: 'H.265',
        resolution: '720p',
        framerate: '25fps',
        audio: false
      },
      {
        url: `rtsp://${publicIP}:${port}/h265_360p_15fps_aac`,
        description: 'H.265 360p 15fps + AAC Audio',
        codec: 'H.265',
        resolution: '360p',
        framerate: '15fps',
        audio: true
      }
    ];

    return {
      server_info: {
        name: 'Enhanced RTSP Test Server',
        version: '2.0',
        ip: publicIP,
        port: port
      },
      rtsp_urls: testStreams
    };
  },
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

// Camera Management API (modernized)
export const cameraAPI = {
  /**
   * Create a new camera configuration
   */
  async createCamera(cameraData: CreateCameraRequest): Promise<CameraAPIResponse> {
    console.log('📹 Creating camera:', cameraData.camera_name);
    
    const result = await apiUtils.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.CAMERA_MANAGEMENT.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(cameraData)
      }
    );
    
    console.log('✅ Camera created successfully:', result.camera?.camera_id);
    return result;
  },

  /**
   * Get all cameras
   */
  async listCameras(limit?: number, includeFrames?: boolean): Promise<CameraAPIResponse> {
    console.log('📹 Fetching cameras list...');
    
    let url = API_CONFIG.ENDPOINTS.CAMERA_MANAGEMENT.LIST;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit.toString());
    if (includeFrames) params.append('include_frames', 'true');
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const result = await apiUtils.makeAuthenticatedRequest(url, {
      method: 'GET'
    });
    
    console.log('✅ Retrieved cameras:', result.count || result.cameras?.length || 0);
    return result;
  },

  /**
   * Get a specific camera by ID
   */
  async getCamera(cameraId: string): Promise<CameraAPIResponse> {
    console.log('📹 Fetching camera:', cameraId);
    
    const result = await apiUtils.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.CAMERA_MANAGEMENT.GET(cameraId),
      { method: 'GET' }
    );
    
    console.log('✅ Retrieved camera:', result.camera?.camera_name);
    return result;
  },

  /**
   * Update a camera configuration
   */
  async updateCamera(cameraId: string, updateData: UpdateCameraRequest): Promise<CameraAPIResponse> {
    console.log('📹 Updating camera:', cameraId);
    
    const result = await apiUtils.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.CAMERA_MANAGEMENT.UPDATE(cameraId),
      {
        method: 'PUT',
        body: JSON.stringify(updateData)
      }
    );
    
    console.log('✅ Camera updated successfully:', result.camera?.camera_name);
    return result;
  },

  /**
   * Delete a camera configuration
   */
  async deleteCamera(cameraId: string): Promise<CameraAPIResponse> {
    console.log('📹 Deleting camera:', cameraId);
    
    const result = await apiUtils.makeAuthenticatedRequest(
      API_CONFIG.ENDPOINTS.CAMERA_MANAGEMENT.DELETE(cameraId),
      { method: 'DELETE' }
    );
    
    console.log('✅ Camera deleted successfully');
    return result;
  }
};

// Export types for easier importing
export type { StreamCharacteristics as StreamCharacteristicsType };
export type { APIResponse as APIResponseType };
export type { RTSPTestRequest as RTSPTestRequestType };
export type { GStreamerToolRequest as GStreamerToolRequestType };
export type { GStreamerToolResponse as GStreamerToolResponseType };
export type { CameraConfiguration as CameraConfigurationType };
export type { CreateCameraRequest as CreateCameraRequestType };
export type { UpdateCameraRequest as UpdateCameraRequestType };
export type { CameraAPIResponse as CameraAPIResponseType };
