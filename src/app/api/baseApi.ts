import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../../lib/config';

// Helper function to get auth tokens from localStorage
export const getAuthTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  try {
    const stored = localStorage.getItem('ev_nexus_auth_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        accessToken: parsed.accessToken || parsed.token || null,
        refreshToken: parsed.refreshToken || null,
      };
    }
  } catch (error) {
    console.error('Error reading auth tokens:', error);
  }
  return { accessToken: null, refreshToken: null };
};

// Interface for minimal user info stored in localStorage
interface MinimalUserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStorageData {
  accessToken: string;
  token: string;
  refreshToken: string;
  user?: MinimalUserInfo;
}

// Helper function to update auth tokens in localStorage (stores tokens + minimal user info for UI)
export const updateAuthTokens = (accessToken: string, refreshToken: string, user?: { id: string; email: string; name: string; role: string }) => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ [updateAuthTokens] window is undefined');
    return;
  }
  
  if (!accessToken || !refreshToken) {
    console.error('❌ [updateAuthTokens] Missing tokens:', { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
    return;
  }
  
  try {
    // Store tokens + minimal user info (id, email, name, role) needed for UI
    const authData: AuthStorageData = {
      accessToken,
      token: accessToken, // Keep for backward compatibility
      refreshToken,
    };
    
    // Store minimal user info if provided (needed for UI on page reload)
    if (user) {
      authData.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
    
    const key = 'ev_nexus_auth_data';
    const dataString = JSON.stringify(authData);
    localStorage.setItem(key, dataString);
    
    // Verify it was stored
    const verify = localStorage.getItem(key);
    if (verify) {
      const parsed = JSON.parse(verify);
      console.log('✅ [updateAuthTokens] Successfully stored tokens:', {
        key,
        hasAccessToken: !!parsed.accessToken,
        hasRefreshToken: !!parsed.refreshToken,
        hasUser: !!parsed.user,
        accessTokenLength: parsed.accessToken?.length || 0,
        refreshTokenLength: parsed.refreshToken?.length || 0,
      });
    } else {
      console.error('❌ [updateAuthTokens] Failed to verify storage - localStorage.getItem returned null!');
    }
  } catch (error) {
    console.error('❌ [updateAuthTokens] Error updating auth tokens:', error);
  }
};

// Helper function to clear all localStorage except ev_nexus_auth_data
export const clearNonAuthStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    // Save auth data temporarily
    const authData = localStorage.getItem('ev_nexus_auth_data');
    console.log('🔵 [clearNonAuthStorage] Saving auth data before clear:', {
      hasAuthData: !!authData,
      authDataLength: authData?.length || 0,
    });
    
    if (!authData) {
      console.warn('⚠️ [clearNonAuthStorage] No auth data to preserve, skipping clear');
      return; // Don't clear if there's no auth data to preserve
    }
    
    // Get all keys to clear (except ev_nexus_auth_data)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== 'ev_nexus_auth_data') {
        keysToRemove.push(key);
      }
    }
    
    // Remove each key individually instead of clearing all
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('✅ [clearNonAuthStorage] Cleared non-auth keys:', keysToRemove.length);
    
    // Verify auth data is still there
    const verifyAuth = localStorage.getItem('ev_nexus_auth_data');
    if (verifyAuth) {
      const parsed = JSON.parse(verifyAuth);
      console.log('✅ [clearNonAuthStorage] Auth data preserved:', {
        hasAccessToken: !!parsed.accessToken,
        hasRefreshToken: !!parsed.refreshToken,
      });
    } else {
      console.error('❌ [clearNonAuthStorage] Auth data was lost! Restoring...');
      // Emergency restore if somehow lost
      if (authData) {
        try {
          localStorage.setItem('ev_nexus_auth_data', authData);
          console.log('✅ [clearNonAuthStorage] Emergency restore successful');
        } catch (e) {
          console.error('❌ [clearNonAuthStorage] Emergency restore failed:', e);
        }
      }
    }
  } catch (error) {
    console.error('❌ [clearNonAuthStorage] Error clearing non-auth storage:', error);
  }
};

// Helper function to clear all localStorage data and logout
const clearAllStorageAndLogout = () => {
  if (typeof window === 'undefined') return;
  try {
    // Clear all localStorage data (including auth tokens on logout)
    localStorage.clear();
    
    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing storage:', error);
    // Fallback: try to redirect anyway
    window.location.href = '/login';
  }
};

// Promise to track ongoing refresh to prevent concurrent refresh calls
let refreshPromise: Promise<{ access: string; refresh: string } | null> | null = null;

// Helper function to refresh token (can be used in queryFn endpoints as well)
export const refreshAccessToken = async (): Promise<{ access: string; refresh: string } | null> => {
  // If a refresh is already in progress, wait for it instead of starting a new one
  if (refreshPromise) {
    console.log('🟡 [TOKEN REFRESH] Refresh already in progress, waiting for existing refresh...');
    return refreshPromise;
  }

  // Get refresh token BEFORE creating promise to check if we have one
  const { refreshToken } = getAuthTokens();
  
  if (!refreshToken) {
    console.log('🔴 [TOKEN REFRESH] No refresh token found');
    return null;
  }

  // Create the refresh promise IMMEDIATELY (synchronously) to prevent race conditions
  // This ensures that any concurrent calls will see the promise and wait for it
  refreshPromise = (async () => {
    // Read refresh token inside the promise to ensure we use the latest one
    const { refreshToken: currentRefreshToken } = getAuthTokens();
    
    if (!currentRefreshToken) {
      console.log('🔴 [TOKEN REFRESH] No refresh token found inside promise');
      return null;
    }

    const requestBody = { refresh: currentRefreshToken };
    console.log('🔵 [AUTH/REFRESH API] Request Body:', JSON.stringify(requestBody, null, 2));
    try {
      const response = await fetch(`${getApiBaseUrl()}auth/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.log('🔴 [AUTH/REFRESH API] Error Response:', JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          data: errorData
        }, null, 2));
        
        // Handle token errors: 401 (invalid), 400 (blacklisted or already used)
        const errorDetail = errorData?.detail || '';
        const isTokenError = response.status === 401 || 
                            (response.status === 400 && (
                              errorDetail === 'Token is blacklisted' ||
                              errorDetail.includes('already been used') ||
                              errorDetail.includes('refresh token has already been used')
                            ));
        
        if (isTokenError) {
          console.log('🔴 [TOKEN REFRESH] Refresh token is invalid, blacklisted, or already used:', errorDetail);
          clearAllStorageAndLogout();
        }
        return null;
      }

      const data = await response.json() as { access: string; refresh: string };
      console.log('🟢 [AUTH/REFRESH API] Response:', JSON.stringify(data, null, 2));
      console.log('🟢 [TOKEN REFRESH] Tokens refreshed successfully');
      
      // Preserve existing user data from localStorage before updating tokens
      let existingUser: MinimalUserInfo | undefined = undefined;
      try {
        const existingStored = localStorage.getItem('ev_nexus_auth_data');
        if (existingStored) {
          const parsed = JSON.parse(existingStored);
          if (parsed.user) {
            existingUser = parsed.user;
            console.log('🟡 [TOKEN REFRESH] Preserving existing user data:', {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
            });
          }
        }
      } catch (error) {
        console.warn('⚠️ [TOKEN REFRESH] Could not parse existing auth data to preserve user info:', error);
      }
      
      // Update tokens in localStorage while preserving user data
      updateAuthTokens(data.access, data.refresh, existingUser);
      
      return data;
    } catch (error) {
      console.error('🔴 [AUTH/REFRESH API] Error:', error);
      console.error('🔴 [TOKEN REFRESH] Error refreshing token:', error);
      return null;
    } finally {
      // Clear the promise when done so future calls can start a new refresh
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// List of public endpoints that don't require authentication
const publicEndpoints = [
  'signup',
  'verify-signup-otp',
  'send-otp',
  'verify-otp',
  'send-admin-otp',
  'verify-admin-otp',
  'login',
  'refresh',
];

// Check if an endpoint is public
const isPublicEndpoint = (url: string): boolean => {
  return publicEndpoints.some(endpoint => url.includes(`auth/${endpoint}/`));
};

// Base query with automatic token refresh
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const baseQuery = fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers, { endpoint }) => {
      // Determine if this is a public endpoint using the endpoint name
      // The endpoint name is a string that may contain the path
      const endpointStr = endpoint || '';
      
      // Only add auth header for non-public endpoints
      // Check if endpoint contains any public endpoint path
      const isPublic = publicEndpoints.some(publicEndpoint => 
        endpointStr.includes(`auth/${publicEndpoint}`) || endpointStr.includes(publicEndpoint)
      );
      
      if (!isPublic) {
        const { accessToken } = getAuthTokens();
        if (accessToken) {
          headers.set('Authorization', `Bearer ${accessToken}`);
        }
      }
      return headers;
    },
  });

  // Get the original URL for checking public endpoints and retry logic
  const originalUrl = typeof args === 'string' ? args : (args as FetchArgs).url || '';
  const originalArgs = args;

  // Execute the original query
  const result = await baseQuery(args, api, extraOptions);

  // Check if we got a 401 Unauthorized error
  if (result.error && result.error.status === 401) {
    // Don't try to refresh if this is already the refresh endpoint or a public endpoint
    if (isPublicEndpoint(originalUrl) || originalUrl.includes('auth/refresh/')) {
      // If refresh endpoint itself returns 401, clear storage and logout
      if (originalUrl.includes('auth/refresh/')) {
        console.log('🔴 [TOKEN REFRESH] Refresh token is invalid, logging out...');
        clearAllStorageAndLogout();
      }
      return result;
    }

    console.log('🟡 [TOKEN REFRESH] Access token expired, attempting to refresh...');
    
    // Try to refresh the token
    const { refreshToken } = getAuthTokens();
    
    if (!refreshToken) {
      console.log('🔴 [TOKEN REFRESH] No refresh token found, logging out...');
      clearAllStorageAndLogout();
      return result;
    }

    try {
      // Call refresh token API using the helper function
      const refreshData = await refreshAccessToken();

      if (refreshData) {
        // Retry the original query with the new access token
        const { accessToken } = getAuthTokens();
        if (accessToken) {
          // Prepare retry args
          let retryArgs: FetchArgs;
          if (typeof originalArgs === 'string') {
            retryArgs = { url: originalArgs };
          } else {
            retryArgs = { ...originalArgs };
          }
          
          // Ensure headers exist and add Authorization
          if (!retryArgs.headers) {
            retryArgs.headers = {};
          }
          retryArgs.headers = {
            ...retryArgs.headers,
            Authorization: `Bearer ${accessToken}`,
          };
          
          // Retry the original request with new token
          const retryResult = await baseQuery(retryArgs, api, extraOptions);
          return retryResult;
        }
      } else {
        // Refresh failed, logout (already handled in refreshAccessToken)
        return result;
      }
    } catch (error) {
      console.error('🔴 [TOKEN REFRESH] Error refreshing token:', error);
      clearAllStorageAndLogout();
      return result;
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Wallet', 'Binary', 'Booking', 'Payout', 'Staff', 'Growth', 'DistributorApplication', 'PoolWithdrawals', 'PendingNodes', 'BinaryStats', 'PoolBalances', 'NomineeTransfers', 'KYC', 'Inventory'],
  keepUnusedDataFor: 60, // Keep unused data in cache for 60 seconds (default is 60)
  endpoints: () => ({}),
});
