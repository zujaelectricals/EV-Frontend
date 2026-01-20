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

const setStoredAuth = (accessToken: string | null, refreshToken?: string | null, user?: User | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (accessToken) {
      // Store tokens + minimal user info (id, email, name, role) needed for UI
      const authData: any = { 
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
        };
      }
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving auth data to localStorage:', error);
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
      if (action.payload.accessToken) {
        state.accessToken = action.payload.accessToken;
        state.token = action.payload.accessToken; // Keep token for backward compatibility
      } else if (action.payload.token) {
        state.token = action.payload.token;
        state.accessToken = action.payload.token;
      }
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      state.isAuthenticated = true;
      // Store tokens + minimal user info in localStorage
      setStoredAuth(
        action.payload.accessToken || action.payload.token || null,
        action.payload.refreshToken || null,
        action.payload.user
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      setStoredAuth(null);
      // Clear auth tokens from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Don't update localStorage - user data is not stored there, only tokens
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
        // Don't update localStorage - user data is not stored there, only tokens
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
