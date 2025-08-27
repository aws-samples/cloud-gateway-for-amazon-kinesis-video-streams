import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { apiUtils, API_CONFIG } from '../api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateRTSPUrl', () => {
    it('should return invalid for empty URL', () => {
      const result = apiUtils.validateRTSPUrl('');
      expect(result).toEqual({
        isValid: false,
        error: 'RTSP URL is required'
      });
    });

    it('should return invalid for non-RTSP URL', () => {
      const result = apiUtils.validateRTSPUrl('http://example.com');
      expect(result).toEqual({
        isValid: false,
        error: 'URL must start with rtsp://'
      });
    });

    it('should return invalid for malformed URL', () => {
      const result = apiUtils.validateRTSPUrl('rtsp://invalid url with spaces');
      expect(result).toEqual({
        isValid: false,
        error: 'Invalid URL format'
      });
    });

    it('should return valid for proper RTSP URL', () => {
      const result = apiUtils.validateRTSPUrl('rtsp://user:pass@example.com:554/stream');
      expect(result).toEqual({
        isValid: true
      });
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(apiUtils.formatFileSize(0)).toBe('0 B');
      expect(apiUtils.formatFileSize(1024)).toBe('1.0 KB');
      expect(apiUtils.formatFileSize(1048576)).toBe('1.0 MB');
      expect(apiUtils.formatFileSize(45405)).toBe('44.3 KB');
    });
  });

  describe('formatDuration', () => {
    it('should format milliseconds correctly', () => {
      expect(apiUtils.formatDuration(500)).toBe('500ms');
      expect(apiUtils.formatDuration(1500)).toBe('1.5s');
      expect(apiUtils.formatDuration(65000)).toBe('1.1min');
    });
  });

  describe('makeRequest', () => {
    it('should make successful API request', async () => {
      const mockResponse = {
        stream_characteristics: {
          video: { codec: 'H.264' }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const payload = {
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics' as const,
        capture_frame: true
      };

      const result = await apiUtils.generatePipeline(payload);

      expect(mockFetch).toHaveBeenCalledWith(
        API_CONFIG.PIPELINE_GENERATOR_ENDPOINT,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: expect.any(AbortSignal)
        }
      );

      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const payload = {
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics' as const
      };

      await expect(apiUtils.generatePipeline(payload)).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const payload = {
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics' as const
      };

      await expect(apiUtils.generatePipeline(payload)).rejects.toThrow('Network error');
    });

    it('should handle timeout', async () => {
      // Mock fetch to reject with AbortError after a delay
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            const abortError = new Error('The operation was aborted.');
            abortError.name = 'AbortError';
            reject(abortError);
          }, 100);
        });
      });

      const payload = {
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics' as const
      };

      await expect(apiUtils.generatePipeline(payload)).rejects.toThrow('Request timed out');
    });

    it('should handle unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const payload = {
        rtsp_url: 'rtsp://test.com/stream',
        mode: 'characteristics' as const
      };

      await expect(apiUtils.generatePipeline(payload)).rejects.toThrow('Unknown error occurred during API request');
    });
  });
});
