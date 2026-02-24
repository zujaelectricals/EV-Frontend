import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// JWT token utilities
interface JWTPayload {
  exp?: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at time
  [key: string]: unknown;
}

/**
 * Decode JWT token without verification (client-side only)
 * Returns null if token is invalid or cannot be decoded
 */
export function decodeJWT(token: string | null): JWTPayload | null {
  if (!token) return null;
  
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ [JWT] Invalid token format');
      return null;
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as JWTPayload;
  } catch (error) {
    console.error('❌ [JWT] Error decoding token:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired or will expire soon
 * @param token - The JWT token to check
 * @param bufferSeconds - Buffer time in seconds before expiry to consider token as "expiring soon" (default: 60 seconds)
 * @returns true if token is expired or expiring soon, false otherwise
 */
export function isTokenExpiredOrExpiringSoon(token: string | null, bufferSeconds: number = 60): boolean {
  if (!token) return true;
  
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    // If we can't decode or there's no expiry, assume it's expired for safety
    console.warn('⚠️ [JWT] Token has no expiry claim, treating as expired');
    return true;
  }
  
  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = bufferSeconds * 1000;
  
  // Token is expired or will expire within buffer time
  return expiryTime <= (currentTime + bufferTime);
}

/**
 * Get the time until token expires in milliseconds
 * Returns null if token is invalid or has no expiry
 */
export function getTokenExpiryTime(token: string | null): number | null {
  if (!token) return null;
  
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;
  
  const expiryTime = payload.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  return Math.max(0, expiryTime - currentTime);
}

/**
 * Format a date to DD/MM/YYYY format for UI display
 * @param date - Date string, Date object, or null/undefined
 * @param separator - Separator to use between date parts (default: '/')
 * @returns Formatted date string in DD/MM/YYYY or DD-MM-YYYY format, or 'N/A' if invalid
 */
export function formatDisplayDate(date: string | Date | null | undefined, separator: '/' | '-' = '/'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}${separator}${month}${separator}${year}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Format a date with time to DD/MM/YYYY HH:mm format for UI display
 * @param date - Date string, Date object, or null/undefined
 * @param separator - Separator to use between date parts (default: '/')
 * @returns Formatted date string in DD/MM/YYYY HH:mm or DD-MM-YYYY HH:mm format, or 'N/A' if invalid
 */
export function formatDisplayDateTime(date: string | Date | null | undefined, separator: '/' | '-' = '/'): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    
    return `${day}${separator}${month}${separator}${year} ${hours}:${minutes}`;
  } catch {
    return 'N/A';
  }
}