import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// localStorage key for authentication
const AUTH_STORAGE_KEY = 'ev_nexus_auth_data';

export interface Nominee {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  aadhar?: string;
}

export interface DistributorInfo {
  isDistributor: boolean;
  isVerified: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  referralCode: string;
  referredBy?: string;
  leftCount: number;
  rightCount: number;
  totalReferrals: number;
  binaryActivated: boolean;
  activationBonusCredited: boolean;
  totalCommissionEarned: number;
  pairsBeyondLimit: number;
  pairsAtActivation?: number; // Track pairs count when binary was activated
  poolMoney: number;
  nominee?: Nominee;
  joinedAt?: string;
}

export interface PreBookingInfo {
  hasPreBooked: boolean;
  preBookingAmount: number; // Initial pre-booking amount
  totalPaid: number; // Total amount paid so far (including pre-booking and additional payments)
  preBookingDate?: string;
  vehicleId?: string;
  vehicleName?: string;
  isActiveBuyer: boolean;
  remainingAmount: number;
  paymentDueDate?: string;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'overdue' | 'refunded';
  redemptionPoints: number;
  redemptionEligible: boolean;
  redemptionDate?: string;
  isDistributorEligible?: boolean; // True if pre-booked at least ₹5000
  wantsToJoinDistributor?: boolean; // User opted to join distributor program during pre-booking
}

export interface KYCDetails {
  aadharNumber?: string;
  panNumber?: string;
  submittedAt?: string;
  verifiedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  verifiedBy?: string; // Admin/Staff name who verified
  documents?: {
    aadhar?: string; // File URL or base64
    pan?: string;
    bankStatement?: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  isDistributor: boolean;
  avatar?: string;
  phone?: string;
  joinedAt: string;
  distributorInfo?: DistributorInfo;
  preBookingInfo?: PreBookingInfo;
  kycStatus?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  kycDetails?: KYCDetails;
  distributorApplicationStatus?: 'pending' | 'approved' | 'rejected' | null;
}

// Helper functions for localStorage - stores tokens + minimal user info
const getStoredAuth = (): { token: string | null; accessToken?: string | null; refreshToken?: string | null; user?: Partial<User> } => {
  if (typeof window === 'undefined') return { token: null };
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        token: parsed.token || parsed.accessToken || null, // Support both old and new format
        accessToken: parsed.accessToken || parsed.token || null,
        refreshToken: parsed.refreshToken || null,
        user: parsed.user || null, // Minimal user info (id, email, name, role)
      };
    }
  } catch (error) {
    console.error('Error reading auth data from localStorage:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return { token: null };
};

const setStoredAuth = (accessToken: string | null, refreshToken?: string | null, user?: User | null, forceRemove: boolean = false): void => {
  if (typeof window === 'undefined') {
    console.warn('⚠️ [setStoredAuth] window is undefined');
    return;
  }
  
  try {
    if (accessToken) {
      // Store tokens + minimal user info (id, email, name, role) needed for UI
      const authData: { 
        accessToken: string; 
        token: string; 
        refreshToken?: string; 
        user?: Partial<User>;
      } = { 
        accessToken,
        token: accessToken, // Keep for backward compatibility
      };
      if (refreshToken) authData.refreshToken = refreshToken;
      
      // Store minimal user info if provided (needed for UI on page reload)
      if (user) {
        authData.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isDistributor: user.isDistributor,
          kycStatus: user.kycStatus,
          phone: user.phone,
          distributorInfo: user.distributorInfo,
          distributorApplicationStatus: user.distributorApplicationStatus,
        };
        
        // Store profile picture separately in localStorage if it exists
        if (user.avatar) {
          try {
            localStorage.setItem('ev_nexus_profile_picture', user.avatar);
          } catch (error) {
            console.error('Error storing profile picture:', error);
          }
        }
      }
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      
      // Verify it was stored
      const verify = localStorage.getItem(AUTH_STORAGE_KEY);
      if (verify) {
        const parsed = JSON.parse(verify);
        console.log('✅ [setStoredAuth] Successfully stored tokens:', {
          key: AUTH_STORAGE_KEY,
          hasAccessToken: !!parsed.accessToken,
          hasRefreshToken: !!parsed.refreshToken,
          hasUser: !!parsed.user,
        });
      } else {
        console.error('❌ [setStoredAuth] Failed to verify storage - localStorage.getItem returned null!');
      }
    } else {
      // Only remove if explicitly forced (logout) or if there's no existing auth data
      const existingAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (forceRemove) {
        console.log('🔵 [setStoredAuth] Force removing auth data (logout)');
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } else if (!existingAuth) {
        console.log('🔵 [setStoredAuth] No existing auth data, nothing to remove');
      } else {
        // Don't clear existing valid tokens if accessToken is null but we already have tokens
        console.warn('⚠️ [setStoredAuth] accessToken is null but existing auth data found. Preserving existing tokens.');
        console.warn('⚠️ [setStoredAuth] This might indicate an issue - tokens should not be null during normal operations.');
      }
    }
  } catch (error) {
    console.error('❌ [setStoredAuth] Error saving auth data to localStorage:', error);
  }
};

interface AuthState {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage (tokens + minimal user info)
const storedAuth = getStoredAuth();
// Create user object from stored data if available
const createUserFromStored = (): User | null => {
  if (!storedAuth.user) {
    console.log('🟡 [AUTH INIT] No user data in localStorage');
    return null;
  }
  
  // Get required fields with fallbacks
  const id = storedAuth.user.id;
  const email = storedAuth.user.email;
  const name = storedAuth.user.name;
  const role = storedAuth.user.role;
  
  // Only create user if we have minimum required fields (id and email are critical)
  if (!id || !email) {
    console.warn('⚠️ [AUTH INIT] Missing critical user fields (id or email):', { 
      hasId: !!id, 
      hasEmail: !!email, 
      hasName: !!name,
      hasRole: !!role 
    });
    return null;
  }
  
  // Create user object with defaults for missing optional fields
  const userObj: User = {
    id: String(id), // Ensure it's a string
    name: name || email.split('@')[0] || 'User', // Use email prefix if name missing
    email: String(email),
    role: (role || 'user') as 'admin' | 'staff' | 'user',
    isDistributor: storedAuth.user.isDistributor || false,
    phone: storedAuth.user.phone,
    joinedAt: storedAuth.user.joinedAt || new Date().toISOString(),
    kycStatus: storedAuth.user.kycStatus,
    kycDetails: storedAuth.user.kycDetails,
    distributorInfo: storedAuth.user.distributorInfo,
    preBookingInfo: storedAuth.user.preBookingInfo,
    distributorApplicationStatus: storedAuth.user.distributorApplicationStatus,
  };
  
  console.log('🟢 [AUTH INIT] User loaded from localStorage:', { id: userObj.id, email: userObj.email, name: userObj.name });
  return userObj;
};

const initialState: AuthState = {
  user: createUserFromStored(),
  token: storedAuth.token || storedAuth.accessToken || null,
  accessToken: storedAuth.accessToken || storedAuth.token || null,
  refreshToken: storedAuth.refreshToken || null,
  isAuthenticated: !!(storedAuth.token || storedAuth.accessToken), // Check tokens only
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token?: string; accessToken?: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      
      // CRITICAL: Always read the LATEST tokens from localStorage first
      // This prevents overwriting refreshed tokens with stale Redux state
      const latestAuth = getStoredAuth();
      
      // Update Redux state with new tokens if provided, otherwise use latest from localStorage
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        state.token = action.payload.accessToken; // Keep token for backward compatibility
      } else if (action.payload.token) {
        state.token = action.payload.token;
        state.accessToken = action.payload.token;
      } else if (latestAuth.accessToken || latestAuth.token) {
        // No new tokens provided, use latest from localStorage to keep Redux in sync
        state.accessToken = latestAuth.accessToken || latestAuth.token || null;
        state.token = latestAuth.token || latestAuth.accessToken || null;
      }
      
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      } else if (latestAuth.refreshToken) {
        // No new refresh token provided, use latest from localStorage to keep Redux in sync
        state.refreshToken = latestAuth.refreshToken;
      }
      
      state.isAuthenticated = true;
      
      // CRITICAL: When storing, prioritize new tokens from action, then latest from localStorage
      // NEVER use stale Redux state tokens - always get fresh from localStorage
      const accessTokenToStore = action.payload.accessToken || action.payload.token || latestAuth.accessToken || latestAuth.token;
      const refreshTokenToStore = action.payload.refreshToken || latestAuth.refreshToken;
      
      if (accessTokenToStore) {
        setStoredAuth(
          accessTokenToStore,
          refreshTokenToStore || null,
          action.payload.user
        );
        
        // Store profile picture separately in localStorage if it exists
        if (action.payload.user.avatar) {
          try {
            localStorage.setItem('ev_nexus_profile_picture', action.payload.user.avatar);
          } catch (error) {
            console.error('Error storing profile picture:', error);
          }
        }
        
        // Log if we're using tokens from localStorage (to detect if Redux was stale)
        if (!action.payload.accessToken && !action.payload.token && (latestAuth.accessToken || latestAuth.token)) {
          console.log('🟡 [setCredentials] Using latest tokens from localStorage (no new tokens provided)', {
            hasAccessToken: !!accessTokenToStore,
            hasRefreshToken: !!refreshTokenToStore,
            refreshTokenPrefix: refreshTokenToStore?.substring(0, 20) + '...',
          });
        }
      } else {
        console.warn('⚠️ [setCredentials] No tokens available to store!');
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      // Force remove on logout
      setStoredAuth(null, null, null, true);
      // Clear auth tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        // Clear profile picture from localStorage
        localStorage.removeItem('ev_nexus_profile_picture');
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage with new user data
        // CRITICAL: Always read latest tokens from localStorage to avoid overwriting refreshed tokens
        const latestAuth = getStoredAuth();
        if (latestAuth.accessToken || latestAuth.token) {
          setStoredAuth(
            latestAuth.accessToken || latestAuth.token || '',
            latestAuth.refreshToken || null,
            state.user
          );
        }
        
        // Store profile picture separately in localStorage if it exists
        if (action.payload.avatar !== undefined) {
          try {
            if (action.payload.avatar) {
              localStorage.setItem('ev_nexus_profile_picture', action.payload.avatar);
            } else {
              localStorage.removeItem('ev_nexus_profile_picture');
            }
          } catch (error) {
            console.error('Error storing profile picture:', error);
          }
        }
      }
    },
    updatePreBooking: (state, action: PayloadAction<PreBookingInfo>) => {
      if (state.user) {
        state.user.preBookingInfo = action.payload;
        // Don't update localStorage - user data is not stored there, only tokens
      }
    },
    updateDistributorInfo: (state, action: PayloadAction<Partial<DistributorInfo>>) => {
      if (state.user) {
        // Initialize distributorInfo if it doesn't exist
        if (!state.user.distributorInfo) {
          state.user.distributorInfo = {
            isDistributor: false,
            isVerified: false,
            verificationStatus: 'pending',
            referralCode: '',
            leftCount: 0,
            rightCount: 0,
            totalReferrals: 0,
            binaryActivated: false,
            activationBonusCredited: false,
            totalCommissionEarned: 0,
            pairsBeyondLimit: 0,
            poolMoney: 0,
          };
        }
        state.user.distributorInfo = { ...state.user.distributorInfo, ...action.payload };
        
        // Update isDistributor based on distributorInfo
        if (action.payload.isDistributor !== undefined) {
          state.user.isDistributor = action.payload.isDistributor;
        }
        
        // Update localStorage with new user data
        // CRITICAL: Always read latest tokens from localStorage to avoid overwriting refreshed tokens
        const latestAuth = getStoredAuth();
        if (latestAuth.accessToken || latestAuth.token) {
          setStoredAuth(
            latestAuth.accessToken || latestAuth.token || '',
            latestAuth.refreshToken || null,
            state.user
          );
        }
      }
    },
    updateKYCStatus: (state, action: PayloadAction<{ kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected'; kycDetails?: Partial<KYCDetails> }>) => {
      if (state.user) {
        state.user.kycStatus = action.payload.kycStatus;
        if (action.payload.kycDetails) {
          state.user.kycDetails = { ...state.user.kycDetails, ...action.payload.kycDetails };
        }
        // Don't update localStorage - user data is not stored there, only tokens
      }
    },
  },
});

export const { setCredentials, logout, setLoading, updateUser, updatePreBooking, updateDistributorInfo, updateKYCStatus } = authSlice.actions;

// Export helper function to check authentication (checks tokens in localStorage)
export const isUserAuthenticated = (): boolean => {
  const stored = getStoredAuth();
  return !!(stored.token || stored.accessToken);
};

export default authSlice.reducer;
