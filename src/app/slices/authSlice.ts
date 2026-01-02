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
  poolMoney: number;
  nominee?: Nominee;
  joinedAt?: string;
}

export interface PreBookingInfo {
  hasPreBooked: boolean;
  preBookingAmount: number;
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
}

// Helper functions for localStorage
const getStoredAuth = (): { user: User | null; token: string | null } => {
  if (typeof window === 'undefined') return { user: null, token: null };
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        user: parsed.user || null,
        token: parsed.token || null,
      };
    }
  } catch (error) {
    console.error('Error reading auth data from localStorage:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  return { user: null, token: null };
};

const setStoredAuth = (user: User | null, token: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user && token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
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
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage
const storedAuth = getStoredAuth();
const initialState: AuthState = {
  user: storedAuth.user,
  token: storedAuth.token,
  isAuthenticated: !!(storedAuth.user && storedAuth.token),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      setStoredAuth(action.payload.user, action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      setStoredAuth(null, null);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update localStorage when user is updated
        if (state.token) {
          setStoredAuth(state.user, state.token);
        }
      }
    },
    updatePreBooking: (state, action: PayloadAction<PreBookingInfo>) => {
      if (state.user) {
        state.user.preBookingInfo = action.payload;
        // Update localStorage when pre-booking is updated
        if (state.token) {
          setStoredAuth(state.user, state.token);
        }
      }
    },
    updateDistributorInfo: (state, action: PayloadAction<Partial<DistributorInfo>>) => {
      if (state.user && state.user.distributorInfo) {
        state.user.distributorInfo = { ...state.user.distributorInfo, ...action.payload };
        // Update localStorage when distributor info is updated
        if (state.token) {
          setStoredAuth(state.user, state.token);
        }
      }
    },
  },
});

export const { setCredentials, logout, setLoading, updateUser, updatePreBooking, updateDistributorInfo } = authSlice.actions;

// Export helper function to check authentication (checks both Redux state and localStorage)
export const isUserAuthenticated = (): boolean => {
  const stored = getStoredAuth();
  return !!(stored.user && stored.token);
};

export default authSlice.reducer;
