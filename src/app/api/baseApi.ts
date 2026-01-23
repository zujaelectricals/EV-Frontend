import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { getApiBaseUrl } from '../../lib/config';
import { isTokenExpiredOrExpiringSoon, getTokenExpiryTime } from '../../lib/utils';

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
// CRITICAL: This must be atomic and synchronous to prevent race conditions
// Also broadcasts token updates to other tabs/windows for multi-tab synchronization
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

    // CRITICAL: Update localStorage synchronously and atomically
    localStorage.setItem(key, dataString);

    // MULTI-TAB SYNC: Clear any refresh locks since we just got new tokens
    // The old token lock is no longer valid
    releaseRefreshLock();

    // MULTI-TAB SYNC: Broadcast token update to other tabs/windows
    // This ensures all tabs use the same tokens and prevents "token already used" errors
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key,
        newValue: dataString,
        oldValue: localStorage.getItem(key), // Get old value before update
        storageArea: localStorage,
      }));
      // Also use a custom event for same-tab listeners
      window.dispatchEvent(new CustomEvent('authTokensUpdated', {
        detail: { accessToken, refreshToken, user },
      }));
      console.log('📡 [updateAuthTokens] Broadcasted token update to other tabs');
    } catch (broadcastError) {
      console.warn('⚠️ [updateAuthTokens] Failed to broadcast token update:', broadcastError);
      // Continue even if broadcast fails
    }

    // Note: tokenInUse is managed in refreshAccessToken, not here
    // This function just stores the tokens

    // Verify it was stored
    const verify = localStorage.getItem(key);
    if (verify) {
      const parsed = JSON.parse(verify);
      const tokensMatch = parsed.refreshToken === refreshToken && parsed.accessToken === accessToken;
      console.log('✅ [updateAuthTokens] Successfully stored tokens:', {
        key,
        hasAccessToken: !!parsed.accessToken,
        hasRefreshToken: !!parsed.refreshToken,
        hasUser: !!parsed.user,
        tokensMatch,
        newRefreshTokenPrefix: refreshToken.substring(0, 20) + '...',
      });

      if (!tokensMatch) {
        console.error('❌ [updateAuthTokens] Token mismatch after storage! This should not happen.');
        // Try to fix it
        localStorage.setItem(key, dataString);
      }
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

// Persistent logging system that survives redirects
const LOGOUT_LOG_KEY = 'ev_nexus_logout_log';
const MAX_LOG_ENTRIES = 50;

interface LogoutLogEntry {
  timestamp: string;
  reason: string;
  details: Record<string, unknown>;
  stackTrace?: string;
}

const addLogoutLog = (reason: string, details: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;

  try {
    const existingLogs = sessionStorage.getItem(LOGOUT_LOG_KEY);
    const logs: LogoutLogEntry[] = existingLogs ? JSON.parse(existingLogs) : [];

    const newEntry: LogoutLogEntry = {
      timestamp: new Date().toISOString(),
      reason,
      details,
      stackTrace: new Error().stack,
    };

    logs.push(newEntry);

    // Keep only the last MAX_LOG_ENTRIES entries
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.shift();
    }

    sessionStorage.setItem(LOGOUT_LOG_KEY, JSON.stringify(logs));
    console.error('🔴 [LOGOUT TRIGGERED]', reason, details);
  } catch (error) {
    console.error('Failed to save logout log:', error);
  }
};

// Export function to get logout logs (for debugging)
export const getLogoutLogs = (): LogoutLogEntry[] => {
  if (typeof window === 'undefined') return [];
  try {
    const logs = sessionStorage.getItem(LOGOUT_LOG_KEY);
    return logs ? JSON.parse(logs) : [];
  } catch {
    return [];
  }
};

// Helper function to clear all localStorage data and logout
const clearAllStorageAndLogout = (reason: string = 'Unknown reason', details: Record<string, unknown> = {}) => {
  if (typeof window === 'undefined') return;

  try {
    // Log the logout event with details BEFORE clearing
    const { accessToken, refreshToken } = getAuthTokens();
    const accessTokenExpiry = refreshToken ? getTokenExpiryTime(accessToken) : null;
    const refreshTokenExpiry = refreshToken ? getTokenExpiryTime(refreshToken) : null;

    addLogoutLog(reason, {
      ...details,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenExpiryMinutes: accessTokenExpiry ? Math.round(accessTokenExpiry / 60000) : null,
      refreshTokenExpiryHours: refreshTokenExpiry ? Math.round(refreshTokenExpiry / 3600000 * 10) / 10 : null,
      currentTime: new Date().toISOString(),
    });

    // Clear all localStorage data (including auth tokens on logout)
    // But preserve the logout log in sessionStorage (which survives redirects)
    localStorage.clear();

    // Redirect to login page
    window.location.href = '/login';
  } catch (error) {
    console.error('Error clearing storage:', error);
    addLogoutLog('Error during logout', { error: String(error) });
    // Fallback: try to redirect anyway
    window.location.href = '/login';
  }
};

// Promise to track ongoing refresh to prevent concurrent refresh calls
// This is module-level to prevent multiple refreshes across the same tab
let refreshPromise: Promise<{ access: string; refresh: string } | null> | null = null;

// Track the refresh token that's currently being used in an active refresh (per-tab)
// This is set when we start using a token and cleared when the refresh completes
// CRITICAL: This prevents the same token from being used in multiple concurrent refreshes within the same tab
let tokenInUse: string | null = null;

// Lock to prevent race conditions when creating the refresh promise
// This ensures only one promise is created even if multiple calls happen simultaneously
let isCreatingRefreshPromise = false;

// MULTI-TAB SYNC: Use localStorage to coordinate token refresh across tabs
// This prevents multiple tabs from using the same refresh token simultaneously
const REFRESH_LOCK_KEY = 'ev_nexus_refresh_lock';
const REFRESH_LOCK_TIMEOUT = 10000; // 10 seconds - if lock is older than this, consider it stale

interface RefreshLock {
  tokenPrefix: string; // First 20 chars of token for identification
  tabId: string; // Unique identifier for this tab
  timestamp: number; // When the lock was acquired
}

// Generate a unique tab ID for this session
const getTabId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let tabId = sessionStorage.getItem('ev_nexus_tab_id');
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('ev_nexus_tab_id', tabId);
  }
  return tabId;
};

// Check if a token is currently being used in another tab
const isTokenInUseInAnotherTab = (token: string): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const lockData = localStorage.getItem(REFRESH_LOCK_KEY);
    if (!lockData) return false;

    const lock: RefreshLock = JSON.parse(lockData);
    const currentTabId = getTabId();

    // If it's our own lock, it's not "another tab"
    if (lock.tabId === currentTabId) return false;

    // Check if lock is stale (older than timeout)
    const lockAge = Date.now() - lock.timestamp;
    if (lockAge > REFRESH_LOCK_TIMEOUT) {
      console.warn('⚠️ [MULTI-TAB SYNC] Found stale refresh lock, clearing it', {
        lockAge,
        lockTabId: lock.tabId,
        currentTabId,
      });
      localStorage.removeItem(REFRESH_LOCK_KEY);
      return false;
    }

    // Check if the token matches (using prefix for comparison)
    const tokenPrefix = token.substring(0, 20);
    if (lock.tokenPrefix === tokenPrefix) {
      console.warn('⚠️ [MULTI-TAB SYNC] Token is being used in another tab', {
        lockTabId: lock.tabId,
        currentTabId,
        lockAge,
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ [MULTI-TAB SYNC] Error checking refresh lock:', error);
    return false;
  }
};

// Acquire a lock for using a specific token
const acquireRefreshLock = (token: string): boolean => {
  if (typeof window === 'undefined') return true; // Server-side, allow it

  try {
    const currentTabId = getTabId();
    const tokenPrefix = token.substring(0, 20);

    // Check if another tab has a lock
    if (isTokenInUseInAnotherTab(token)) {
      return false; // Another tab is using this token
    }

    // Acquire the lock
    const lock: RefreshLock = {
      tokenPrefix,
      tabId: currentTabId,
      timestamp: Date.now(),
    };

    localStorage.setItem(REFRESH_LOCK_KEY, JSON.stringify(lock));
    console.log('🔒 [MULTI-TAB SYNC] Acquired refresh lock', {
      tokenPrefix,
      tabId: currentTabId,
    });

    return true;
  } catch (error) {
    console.error('❌ [MULTI-TAB SYNC] Error acquiring refresh lock:', error);
    return false; // Fail safe - don't proceed if we can't acquire lock
  }
};

// Release the refresh lock
const releaseRefreshLock = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const lockData = localStorage.getItem(REFRESH_LOCK_KEY);
    if (lockData) {
      const lock: RefreshLock = JSON.parse(lockData);
      const currentTabId = getTabId();

      // Only release if it's our lock
      if (lock.tabId === currentTabId) {
        localStorage.removeItem(REFRESH_LOCK_KEY);
        console.log('🔓 [MULTI-TAB SYNC] Released refresh lock', {
          tabId: currentTabId,
        });
      }
    }
  } catch (error) {
    console.error('❌ [MULTI-TAB SYNC] Error releasing refresh lock:', error);
  }
};

// Helper function to refresh token (can be used in queryFn endpoints as well)
export const refreshAccessToken = async (): Promise<{ access: string; refresh: string } | null> => {
  // CRITICAL: Check if refresh is in progress FIRST (atomic check)
  // If a refresh is already in progress, wait for it instead of starting a new one
  if (refreshPromise) {
    console.log('🟡 [TOKEN REFRESH] Refresh already in progress, waiting for existing refresh...');
    try {
      const result = await refreshPromise;
      // If we got a result, the tokens were updated, so we're good
      return result;
    } catch (error) {
      console.error('🔴 [TOKEN REFRESH] Error waiting for existing refresh:', error);
      return null;
    }
  }

  // CRITICAL: Check if we're currently creating a promise (prevents race condition)
  // This ensures only one promise is created even if multiple calls happen simultaneously
  if (isCreatingRefreshPromise) {
    console.log('🟡 [TOKEN REFRESH] Refresh promise is being created, waiting...');
    // Wait a brief moment and check again
    await new Promise(resolve => setTimeout(resolve, 100));
    // Now check if a promise was created
    if (refreshPromise) {
      try {
        return await refreshPromise;
      } catch (error) {
        console.error('🔴 [TOKEN REFRESH] Error waiting for promise:', error);
        return null;
      }
    }
    // If still no promise, something went wrong, but don't create another one
    console.warn('⚠️ [TOKEN REFRESH] Promise creation seems stuck, returning null');
    return null;
  }

  // Quick pre-check to see if we have a refresh token (without creating promise yet)
  const { refreshToken: preCheckToken } = getAuthTokens();
  if (!preCheckToken) {
    console.log('🔴 [TOKEN REFRESH] No refresh token found');
    return null;
  }

  // CRITICAL: Check if this EXACT token is currently being used in an active refresh (same tab)
  // If it is, we MUST wait for that refresh to complete - we cannot use the same token twice
  if (tokenInUse === preCheckToken) {
    console.warn('⚠️ [TOKEN REFRESH] This exact token is currently being used in a refresh (same tab), waiting...');
    // Wait for the refresh to complete
    if (refreshPromise) {
      try {
        const result = await refreshPromise;
        console.log('🟢 [TOKEN REFRESH] Waited for refresh to complete');
        return result;
      } catch (error) {
        console.error('🔴 [TOKEN REFRESH] Error waiting for token refresh:', error);
        return null;
      }
    } else {
      // No promise but token is marked as in use - wait briefly for it to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      // Re-check
      if (refreshPromise) {
        try {
          return await refreshPromise;
        } catch (error) {
          return null;
        }
      }
      // If still no promise, clear the marker and continue
      console.warn('⚠️ [TOKEN REFRESH] Token was in use but no refresh found - clearing marker');
      tokenInUse = null;
    }
  }

  // CRITICAL: Check if this token is being used in ANOTHER TAB
  // MULTI-TAB SYNC: Use localStorage to coordinate across tabs
  if (isTokenInUseInAnotherTab(preCheckToken)) {
    console.warn('⚠️ [TOKEN REFRESH] Token is being used in another tab, waiting for it to complete...');
    // Wait for the other tab to complete (check every 200ms, max 5 seconds)
    const maxWaitTime = 5000;
    const checkInterval = 200;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, checkInterval));

      // Check if token is still in use in another tab
      if (!isTokenInUseInAnotherTab(preCheckToken)) {
        // Token is no longer in use, re-read it (it might have been updated)
        const updatedTokens = getAuthTokens();
        if (updatedTokens.refreshToken && updatedTokens.refreshToken !== preCheckToken) {
          console.log('📡 [MULTI-TAB SYNC] Token was updated by another tab, using new token');
          // Another tab refreshed, we should use the new token
          // But we can't refresh again with the new token here - return null and let the caller retry
          return null;
        }
        // Token is still the same, we can proceed
        break;
      }
    }

    // If we timed out, check one more time
    if (isTokenInUseInAnotherTab(preCheckToken)) {
      console.warn('⚠️ [TOKEN REFRESH] Timeout waiting for other tab, proceeding anyway (lock may be stale)');
    }
  }

  // CRITICAL: Try to acquire a cross-tab lock for this token
  // This prevents multiple tabs from using the same token simultaneously
  if (!acquireRefreshLock(preCheckToken)) {
    console.warn('⚠️ [TOKEN REFRESH] Failed to acquire refresh lock, another tab may be using this token');
    // Wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!acquireRefreshLock(preCheckToken)) {
      console.error('🔴 [TOKEN REFRESH] Could not acquire refresh lock after retry, aborting');
      return null;
    }
  }

  // CRITICAL: Mark the token as "in use" IMMEDIATELY and SYNCHRONOUSLY before creating the promise
  // This prevents any concurrent calls from using the same token
  // We do this BEFORE creating the promise to make it truly atomic
  tokenInUse = preCheckToken;
  console.log('🔵 [TOKEN REFRESH] Marked token as in use BEFORE creating promise:', {
    tokenPrefix: preCheckToken.substring(0, 20) + '...',
  });

  // CRITICAL: Capture the token we marked as "in use" for use inside the promise
  const expectedToken = preCheckToken;

  // CRITICAL: Set the lock BEFORE creating the promise to prevent race conditions
  isCreatingRefreshPromise = true;

  // Create the refresh promise IMMEDIATELY (synchronously) to prevent race conditions
  // This ensures that any concurrent calls will see the promise and wait for it
  refreshPromise = (async () => {
    // Clear the creation lock immediately after promise is created
    isCreatingRefreshPromise = false;

    // CRITICAL: Read refresh token from localStorage RIGHT BEFORE using it
    // Since we're inside the refreshPromise, we know no other refresh is happening concurrently
    // But we already marked tokenInUse = expectedToken above, so verify we still have the same token
    const tokens = getAuthTokens();
    const tokenToUse = tokens.refreshToken;

    if (!tokenToUse) {
      console.log('🔴 [TOKEN REFRESH] No refresh token found inside promise');
      tokenInUse = null; // Clear marker on error
      return null;
    }

    // CRITICAL: Verify the token matches what we marked as "in use"
    // If it doesn't match, it means another refresh completed and updated it
    // In that case, we should use the new token instead
    if (tokenToUse !== expectedToken) {
      console.warn('⚠️ [TOKEN REFRESH] Token changed between check and use - using new token', {
        expectedPrefix: expectedToken.substring(0, 20) + '...',
        actualPrefix: tokenToUse.substring(0, 20) + '...',
      });
      // Update tokenInUse to the new token (tokenToUse is already the new token)
      tokenInUse = tokenToUse;
    }
    // Otherwise, tokenInUse is already set to expectedToken (which equals tokenToUse)

    console.log('🔵 [TOKEN REFRESH] Using refresh token:', {
      tokenPrefix: tokenToUse.substring(0, 20) + '...',
      tokenMatches: tokenToUse === expectedToken,
      tokenInUseMatches: tokenInUse === tokenToUse,
    });

    // Check if refresh token is expired BEFORE attempting to refresh
    // This prevents unnecessary API calls and helps identify the issue early
    const refreshTokenExpiryTime = getTokenExpiryTime(tokenToUse);
    if (isTokenExpiredOrExpiringSoon(tokenToUse, 0)) {
      const expiryTimeMinutes = refreshTokenExpiryTime ? Math.round(refreshTokenExpiryTime / 60000) : null;
      const expiryTimeHours = refreshTokenExpiryTime ? Math.round(refreshTokenExpiryTime / 3600000 * 10) / 10 : null;
      console.log('🔴 [TOKEN REFRESH] Refresh token is expired, logging out...', {
        expiryTime: refreshTokenExpiryTime,
        expiryTimeMinutes,
        expiryTimeHours,
        currentTime: Date.now(),
      });
      // Clear the "in use" marker since we're not using it
      tokenInUse = null;
      clearAllStorageAndLogout('Refresh token expired', {
        expiryTime: refreshTokenExpiryTime,
        expiryTimeMinutes,
        expiryTimeHours,
        location: 'refreshAccessToken - inside promise',
      });
      return null;
    } else {
      // Log token expiry info for debugging
      if (refreshTokenExpiryTime) {
        const minutesUntilExpiry = Math.round(refreshTokenExpiryTime / 60000);
        const hoursUntilExpiry = Math.round(minutesUntilExpiry / 60 * 10) / 10;
        console.log('🟢 [TOKEN REFRESH] Refresh token is valid, expires in:', {
          minutes: minutesUntilExpiry,
          hours: hoursUntilExpiry,
          tokenPrefix: tokenToUse.substring(0, 20) + '...',
        });
      }
    }

    // CRITICAL: Read the refresh token ONE MORE TIME right before the API call
    // This ensures we ALWAYS use the absolute latest token, even if another tab updated it
    // This is the final read before making the API call - must be the latest token
    const finalTokenCheck = getAuthTokens();
    const finalRefreshToken = finalTokenCheck.refreshToken;

    if (!finalRefreshToken) {
      console.error('🔴 [TOKEN REFRESH] No refresh token found in final check before API call');
      tokenInUse = null;
      return null;
    }

    // If the token changed since we last read it, use the new one
    // This handles the case where another tab refreshed and updated localStorage
    if (finalRefreshToken !== tokenToUse) {
      console.warn('⚠️ [TOKEN REFRESH] Token was updated by another tab, using latest token', {
        oldPrefix: tokenToUse.substring(0, 20) + '...',
        newPrefix: finalRefreshToken.substring(0, 20) + '...',
      });
      // Update tokenInUse to the latest token
      tokenInUse = finalRefreshToken;
    }

    // CRITICAL: Always use the latest token from localStorage for the API call
    // This ensures we never use a stale token
    const requestBody = { refresh: finalRefreshToken };
    console.log('🔵 [AUTH/REFRESH API] Request Body (using latest token):', {
      refreshTokenPrefix: finalRefreshToken.substring(0, 20) + '...',
      refreshTokenLength: finalRefreshToken.length,
      tokenWasUpdated: finalRefreshToken !== tokenToUse,
    });

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
        const errorDetail = errorData?.detail || errorData?.message || '';
        const errorDetailLower = errorDetail.toLowerCase();

        // Only logout on actual REFRESH TOKEN errors, not access token errors
        // Check for specific refresh token error messages
        const isRefreshTokenError = response.status === 401 ||
          (response.status === 400 && (
            errorDetailLower === 'token is blacklisted' ||
            errorDetailLower.includes('refresh token') && (
              errorDetailLower.includes('already been used') ||
              errorDetailLower.includes('has already been used') ||
              errorDetailLower.includes('is invalid') ||
              errorDetailLower.includes('is expired') ||
              errorDetailLower.includes('expired')
            ) ||
            (errorDetailLower.includes('token is invalid') && errorDetailLower.includes('refresh')) ||
            (errorDetailLower.includes('token is expired') && errorDetailLower.includes('refresh'))
          ));

        // CRITICAL: Clear the "in use" marker on error
        // If it's a refresh token error, the token is invalid and we're logging out anyway
        // If it's a network error, clear it so we can retry
        tokenInUse = null;

        // Only logout on actual refresh token errors, not on network errors (5xx) or access token errors
        if (isRefreshTokenError) {
          console.log('🔴 [TOKEN REFRESH] Refresh token is invalid, blacklisted, expired, or already used:', errorDetail);
          // Don't clear tokenInUse here - we're logging out anyway
          clearAllStorageAndLogout('Refresh token error from API', {
            status: response.status,
            errorDetail,
            isRefreshTokenError: true,
            location: 'refreshAccessToken - API error',
            tokenUsed: finalRefreshToken.substring(0, 20) + '...',
          });
        } else {
          // Network error, access token error, or other non-refresh-token errors - don't logout
          console.warn('⚠️ [TOKEN REFRESH] Refresh failed with non-refresh-token error, not logging out:', errorDetail);
          // This might be an access token error or network issue - return null to let the caller handle it
        }
        return null;
      }

      const data = await response.json() as { access: string; refresh: string };

      // CRITICAL: Validate that we got both tokens
      if (!data.access || !data.refresh) {
        console.error('❌ [TOKEN REFRESH] Invalid response - missing tokens:', {
          hasAccess: !!data.access,
          hasRefresh: !!data.refresh,
        });
        // Clear the "in use" marker since refresh failed
        tokenInUse = null;
        return null;
      }

      console.log('🟢 [AUTH/REFRESH API] Response received:', {
        accessTokenPrefix: data.access.substring(0, 20) + '...',
        newRefreshTokenPrefix: data.refresh.substring(0, 20) + '...',
        oldRefreshTokenPrefix: tokenToUse.substring(0, 20) + '...',
        tokensRotated: tokenToUse !== data.refresh, // Check if refresh token was rotated
      });

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

      // CRITICAL: Update tokens IMMEDIATELY and atomically
      // updateAuthTokens will store the new tokens
      // We also clear tokenInUse and set it to the new token to track it
      updateAuthTokens(data.access, data.refresh, existingUser);

      // Clear the old token marker and set it to the new token
      // This ensures any waiting refreshes know the new token is available
      tokenInUse = data.refresh;

      // Verify the update was successful
      const verifyTokens = getAuthTokens();
      if (verifyTokens.refreshToken !== data.refresh) {
        console.error('❌ [TOKEN REFRESH] Token update verification failed! Retrying...', {
          expectedPrefix: data.refresh.substring(0, 20) + '...',
          actualPrefix: verifyTokens.refreshToken?.substring(0, 20) + '...',
        });
        // Try to update again - this is critical
        updateAuthTokens(data.access, data.refresh, existingUser);
      }

      // Final verification
      const finalVerify = getAuthTokens();
      if (finalVerify.refreshToken === data.refresh) {
        console.log('✅ [TOKEN REFRESH] Tokens refreshed and stored successfully', {
          newRefreshTokenPrefix: data.refresh.substring(0, 20) + '...',
          oldRefreshTokenPrefix: finalRefreshToken.substring(0, 20) + '...',
          tokenRotated: finalRefreshToken !== data.refresh,
          tokenInUseUpdated: tokenInUse === data.refresh,
        });
      } else {
        console.error('❌ [TOKEN REFRESH] CRITICAL: Token update failed after retry!', {
          expected: data.refresh.substring(0, 20) + '...',
          actual: finalVerify.refreshToken?.substring(0, 20) + '...',
        });
        // Try one more time
        updateAuthTokens(data.access, data.refresh, existingUser);
        tokenInUse = data.refresh;
      }

      return data;
    } catch (error) {
      // Network errors or other exceptions - don't logout, might be temporary
      console.error('🔴 [AUTH/REFRESH API] Network error or exception:', error);
      console.warn('⚠️ [TOKEN REFRESH] Error refreshing token (network/exception), not logging out - might be temporary');
      return null;
    } finally {
      // CRITICAL: Always release the cross-tab lock when done
      releaseRefreshLock();

      // Clear the promise when done so future calls can start a new refresh
      refreshPromise = null;
      isCreatingRefreshPromise = false; // Also clear the lock
      // Clear tokenInUse only if it matches the token we used (in case of errors)
      // If refresh succeeded, tokenInUse should already be set to the new token
      // Use finalRefreshToken (the token we actually sent in the API call) for comparison
      if (tokenInUse === finalRefreshToken) {
        // This means the refresh didn't complete successfully or token wasn't rotated
        // But wait - if refresh succeeded, tokenInUse should be the new token, not the old one
        // So we should only clear if it still matches the old token (meaning refresh failed)
        const currentTokens = getAuthTokens();
        if (currentTokens.refreshToken === finalRefreshToken) {
          // Token wasn't updated, refresh must have failed - clear the marker
          tokenInUse = null;
        }
        // Otherwise, tokenInUse is already set to the new token, so leave it
      }
    }
  })();

  // Clear the lock in case promise creation fails synchronously (shouldn't happen, but safety)
  isCreatingRefreshPromise = false;

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
  // Token refresh will only happen reactively when we receive a 401 Unauthorized response
  const result = await baseQuery(args, api, extraOptions);

  // Check if we got a 401 Unauthorized error
  if (result.error && result.error.status === 401) {
    // Don't try to refresh if this is already the refresh endpoint or a public endpoint
    if (isPublicEndpoint(originalUrl) || originalUrl.includes('auth/refresh/')) {
      // If refresh endpoint itself returns 401, check if refresh token is expired
      if (originalUrl.includes('auth/refresh/')) {
        const { refreshToken: currentRefreshToken } = getAuthTokens();
        if (!currentRefreshToken || isTokenExpiredOrExpiringSoon(currentRefreshToken, 0)) {
          const refreshTokenExpiry = currentRefreshToken ? getTokenExpiryTime(currentRefreshToken) : null;
          console.log('🔴 [TOKEN REFRESH] Refresh token is expired or invalid, logging out...');
          clearAllStorageAndLogout('Refresh endpoint returned 401 - token expired', {
            hasRefreshToken: !!currentRefreshToken,
            refreshTokenExpiry: refreshTokenExpiry ? Math.round(refreshTokenExpiry / 3600000 * 10) / 10 : null,
            location: 'baseQueryWithReauth - refresh endpoint 401',
          });
        } else {
          // Refresh endpoint returned 401 but token seems valid - might be a backend issue
          console.warn('⚠️ [TOKEN REFRESH] Refresh endpoint returned 401 but token appears valid, not logging out');
        }
      }
      return result;
    }

    console.log('🟡 [TOKEN REFRESH] Access token expired, attempting to refresh...');

    // Try to refresh the token
    const { refreshToken } = getAuthTokens();

    if (!refreshToken) {
      console.log('🔴 [TOKEN REFRESH] No refresh token found, logging out...');
      clearAllStorageAndLogout('No refresh token found during 401 retry', {
        location: 'baseQueryWithReauth - no refresh token',
        originalUrl,
      });
      return result;
    }

    try {
      // Call refresh token API using the helper function
      const refreshData = await refreshAccessToken();

      if (refreshData) {
        // Retry the original query with the new access token
        const { accessToken } = getAuthTokens();
        if (accessToken) {
          // Prepare retry args - preserve all original request properties
          let retryArgs: FetchArgs;
          if (typeof originalArgs === 'string') {
            // If args is just a string (URL), create a minimal FetchArgs object
            retryArgs = { 
              url: originalArgs,
              method: 'GET', // Default to GET for string URLs
            };
          } else {
            // Preserve all original request properties (method, body, headers, etc.)
            retryArgs = {
              url: originalArgs.url,
              method: originalArgs.method, // Preserve method (GET, POST, PUT, DELETE, PATCH)
              body: originalArgs.body, // Preserve body (including FormData, JSON, etc.)
              params: originalArgs.params, // Preserve query params if any
              responseHandler: originalArgs.responseHandler, // Preserve response handler if any
              validateStatus: originalArgs.validateStatus, // Preserve status validation if any
              // Preserve headers but update Authorization
              headers: {
                ...originalArgs.headers,
                Authorization: `Bearer ${accessToken}`,
              },
            };
          }

          // If headers weren't set in the else branch (shouldn't happen, but safety check)
          if (!retryArgs.headers) {
            retryArgs.headers = {};
          }
          // Ensure Authorization header is set
          retryArgs.headers = {
            ...retryArgs.headers,
            Authorization: `Bearer ${accessToken}`,
          };

          console.log('🔄 [TOKEN REFRESH] Retrying request with new token:', {
            url: retryArgs.url,
            method: retryArgs.method || 'GET',
            hasBody: !!retryArgs.body,
            bodyType: retryArgs.body ? (retryArgs.body instanceof FormData ? 'FormData' : typeof retryArgs.body) : 'none',
          });

          // Retry the original request with new token
          const retryResult = await baseQuery(retryArgs, api, extraOptions);
          return retryResult;
        }
      } else {
        // Refresh failed - check if it's because refresh token is expired
        // If refresh token is expired, logout (already handled in refreshAccessToken)
        // Otherwise, just return the error result without logging out
        const { refreshToken: currentRefreshToken } = getAuthTokens();
        if (!currentRefreshToken || isTokenExpiredOrExpiringSoon(currentRefreshToken, 0)) {
          // Refresh token is missing or expired - logout already handled
          return result;
        }
        // Refresh failed for other reasons (network, etc.) - don't logout, just return error
        console.warn('⚠️ [TOKEN REFRESH] Refresh failed but refresh token still valid, not logging out');
        return result;
      }
    } catch (error) {
      // Network errors or other exceptions - don't logout, might be temporary
      console.error('🔴 [TOKEN REFRESH] Exception during refresh, not logging out (might be temporary):', error);
      // Don't logout on exceptions - could be network issues
      return result;
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Wallet', 'Binary', 'Booking', 'Payout', 'Staff', 'Growth', 'DistributorApplication', 'PoolWithdrawals', 'PendingNodes', 'BinaryStats', 'PoolBalances', 'NomineeTransfers', 'KYC', 'Inventory', 'Settings'],
  keepUnusedDataFor: 60, // Keep unused data in cache for 60 seconds (default is 60)
  endpoints: () => ({}),
});
