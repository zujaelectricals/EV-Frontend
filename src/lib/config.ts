/**
 * Application configuration
 * Centralized configuration for API endpoints and other settings
 */

// Fallback API base URL (for development)
const DEFAULT_API_BASE_URL = 'http://192.168.1.41:8000/api/';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

