// API Configuration
export const API_CONFIG = {
  // Pipeline Generator API endpoint
  PIPELINE_GENERATOR_ENDPOINT: 'https://44gtbahskk.execute-api.us-east-1.amazonaws.com/prod/generate-pipeline',
  
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

// Export types for easier importing
export type { StreamCharacteristics as StreamCharacteristicsType };
export type { APIResponse as APIResponseType };
export type { RTSPTestRequest as RTSPTestRequestType };
