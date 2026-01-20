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
  if (typeof window === 'undefined') return;
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
    
    localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
  } catch (error) {
    console.error('Error updating auth tokens:', error);
  }
};

// Helper function to clear all localStorage except ev_nexus_auth_data
export const clearNonAuthStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    // Save auth data temporarily
    const authData = localStorage.getItem('ev_nexus_auth_data');
    
    // Clear all localStorage
    localStorage.clear();
    
    // Restore only auth data (tokens)
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        // Only restore tokens, not user data
        const tokensOnly = {
          accessToken: parsed.accessToken || parsed.token || null,
          token: parsed.accessToken || parsed.token || null,
          refreshToken: parsed.refreshToken || null,
        };
        localStorage.setItem('ev_nexus_auth_data', JSON.stringify(tokensOnly));
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    
    // Explicitly remove ev_nexus_multiple_accounts if it somehow still exists
    localStorage.removeItem('ev_nexus_multiple_accounts');
  } catch (error) {
    console.error('Error clearing non-auth storage:', error);
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

// Helper function to refresh token (can be used in queryFn endpoints as well)
export const refreshAccessToken = async (): Promise<{ access: string; refresh: string } | null> => {
  const { refreshToken } = getAuthTokens();
  
  if (!refreshToken) {
    console.log('🔴 [TOKEN REFRESH] No refresh token found');
    return null;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.log('🔴 [TOKEN REFRESH] Refresh token is invalid');
        clearAllStorageAndLogout();
      }
      return null;
    }

    const data = await response.json() as { access: string; refresh: string };
    console.log('🟢 [TOKEN REFRESH] Tokens refreshed successfully');
    
    // Update tokens in localStorage
    updateAuthTokens(data.access, data.refresh);
    
    return data;
  } catch (error) {
    console.error('🔴 [TOKEN REFRESH] Error refreshing token:', error);
    return null;
  }
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
