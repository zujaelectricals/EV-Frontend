/**
 * Application configuration
 * Centralized configuration for API endpoints and other settings
 */

export const API_BASE_URL = 'http://192.168.1.40:8000/api/';

/**
 * Get the API base URL
 * @returns The base URL for API requests
 */
export const getApiBaseUrl = (): string => {
  return API_BASE_URL;
};

