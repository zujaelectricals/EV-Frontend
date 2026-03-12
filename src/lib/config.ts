/**
 * Application configuration
 * Centralized configuration for API endpoints and other settings
 */

// Fallback API base URL (for development)
const DEFAULT_API_BASE_URL = 'https://ev-backend-api-dca5g4adcrgwhbfg.southindia-01.azurewebsites.net/api/';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

