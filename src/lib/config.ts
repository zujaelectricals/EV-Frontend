/**
 * Application configuration
 * Centralized configuration for API endpoints and other settings
 */

// Fallback API base URL (for development)
const DEFAULT_API_BASE_URL = 'http://192.168.1.40:8000/api/';

/**
 * Get the API base URL from environment variables or fallback to default
 * Supports both NEXT_PUBLIC_* (Next.js style) and VITE_* (Vite style) environment variables
 * @returns The base URL for API requests
 */
export const getApiBaseUrl = (): string => {
  // Check for NEXT_PUBLIC_API_BASE_URL (Next.js style, as requested)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Check for VITE_API_BASE_URL (Vite standard)
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Fallback to default
  return DEFAULT_API_BASE_URL;
};

// Export default for backward compatibility
export const API_BASE_URL = getApiBaseUrl();

