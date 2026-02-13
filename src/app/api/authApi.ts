import { api } from './baseApi';
import { getAuthTokens } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';
import type { User, KYCDetails } from '../slices/authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignupRequest {
  first_name: string;
  last_name: string;
  email: string;
  mobile: string;
  gender: string;
  date_of_birth: string;
  pan_card: string;
  referral_code: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface SignupResponse {
  message: string;
  signup_token: string;
}

export interface VerifySignupOTPRequest {
  signup_token: string;
  otp_code: string;
}

export interface VerifySignupOTPResponse {
  user: {
    id: number;
    username: string;
    email: string;
    mobile: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active_buyer: boolean;
    is_distributor: boolean;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface SendOTPRequest {
  identifier: string;
  otp_type: 'email' | 'mobile';
}

export interface SendOTPResponse {
  message: string;
  sent_to: string[];
}

export interface VerifyOTPRequest {
  identifier: string;
  otp_code: string;
  otp_type: 'email' | 'mobile';
}

export interface VerifyOTPResponse {
  user: {
    id: number;
    username: string;
    email: string;
    mobile: string;
    role: string;
    is_active_buyer: boolean;
    is_distributor: boolean;
  };
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface LogoutRequest {
  refresh: string;
}

export interface LogoutResponse {
  message: string;
}

// Mock user data (for admin, staff, distributor demo accounts)
const mockUsers: Record<string, User> = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@zuja.com',
    role: 'admin',
    isDistributor: false,
    phone: '9497279195',
    joinedAt: '2024-01-01',
  },
  staff: {
    id: '2',
    name: 'Staff Member',
    email: 'staff@zuja.com',
    role: 'staff',
    isDistributor: false,
    phone: '9497279196',
    joinedAt: '2024-03-15',
  },
  distributor: {
    id: '3',
    name: 'John Distributor',
    email: 'distributor@zuja.com',
    role: 'user',
    isDistributor: true,
    phone: '9497279197',
    joinedAt: '2024-02-20',
  },
  user: {
    id: '4',
    name: 'Regular User',
    email: 'user@zuja.com',
    role: 'user',
    isDistributor: false,
    phone: '9497279195',
    joinedAt: '2024-06-10',
  },
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation<SignupResponse, SignupRequest>({
      query: (body) => {
        console.log('🔵 [SIGNUP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/signup/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: SignupResponse) => {
        console.log('🟢 [SIGNUP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [SIGNUP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    verifySignupOTP: builder.mutation<VerifySignupOTPResponse, VerifySignupOTPRequest>({
      query: (body) => {
        console.log('🔵 [VERIFY SIGNUP OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/verify-signup-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: VerifySignupOTPResponse) => {
        console.log('🟢 [VERIFY SIGNUP OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [VERIFY SIGNUP OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    sendOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (body) => {
        console.log('🔵 [SEND OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/send-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: SendOTPResponse) => {
        console.log('🟢 [SEND OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [SEND OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    verifyOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (body) => {
        console.log('🔵 [VERIFY OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/verify-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: VerifyOTPResponse) => {
        console.log('🟢 [VERIFY OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [VERIFY OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    sendAdminOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (body) => {
        console.log('🔵 [SEND ADMIN OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/send-admin-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: SendOTPResponse) => {
        console.log('🟢 [SEND ADMIN OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [SEND ADMIN OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    verifyAdminOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (body) => {
        console.log('🔵 [VERIFY ADMIN OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/verify-admin-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: VerifyOTPResponse) => {
        console.log('🟢 [VERIFY ADMIN OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [VERIFY ADMIN OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    sendUniversalOTP: builder.mutation<SendOTPResponse, SendOTPRequest>({
      query: (body) => {
        console.log('🔵 [SEND UNIVERSAL OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/send-universal-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: SendOTPResponse) => {
        console.log('🟢 [SEND UNIVERSAL OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [SEND UNIVERSAL OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    verifyUniversalOTP: builder.mutation<VerifyOTPResponse, VerifyOTPRequest>({
      query: (body) => {
        console.log('🔵 [VERIFY UNIVERSAL OTP API] Request Body:', JSON.stringify(body, null, 2));
        return {
          url: 'auth/verify-universal-otp/',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response: VerifyOTPResponse) => {
        console.log('🟢 [VERIFY UNIVERSAL OTP API] Response:', JSON.stringify(response, null, 2));
        return response;
      },
      transformErrorResponse: (response: { status?: number; data?: unknown; error?: string } | unknown) => {
        console.log('🔴 [VERIFY UNIVERSAL OTP API] Error Response:', JSON.stringify(response, null, 2));
        return response;
      },
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async ({ email, password }) => {
        console.log('🔵 [LOGIN API] Request Body:', JSON.stringify({ email, password: '***' }, null, 2));
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // First check mock users (for demo accounts)
        let userType = 'user';
        if (email.includes('admin')) userType = 'admin';
        else if (email.includes('staff')) userType = 'staff';
        else if (email.includes('distributor')) userType = 'distributor';
        
        // Check if it's a mock user (demo accounts don't require password check)
        if (mockUsers[userType] && email === mockUsers[userType].email) {
          const user = { ...mockUsers[userType] };
          // Set default KYC status for mock users (not stored in localStorage)
          user.kycStatus = 'not_submitted';
          
          const response: LoginResponse = {
            user,
            token: 'mock-jwt-token-' + user.id,
          };
          console.log('🟢 [LOGIN API] Response (Mock User):', JSON.stringify(response, null, 2));
          return { data: response };
        }
        
        // User not found or invalid credentials
        // Note: Real user authentication should be handled by the backend API
        const errorResponse: FetchBaseQueryError = {
          status: 'CUSTOM_ERROR' as const,
          error: 'Invalid email or password',
        };
        console.log('🔴 [LOGIN API] Error Response:', JSON.stringify(errorResponse, null, 2));
        return { error: errorResponse };
      },
    }),
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      queryFn: async (body) => {
        // Get tokens from localStorage for the request
        const { accessToken } = getAuthTokens();
        console.log('🔵 [LOGOUT API] Request Body:', JSON.stringify(body, null, 2));
        
        try {
          const response = await fetch(`${getApiBaseUrl()}auth/logout/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify(body),
          });

          const data = await response.json();
          
          if (!response.ok) {
            console.log('🔴 [LOGOUT API] Error Response:', JSON.stringify(data, null, 2));
            return {
              error: {
                status: response.status,
                data: data,
              },
            };
          }

          console.log('🟢 [LOGOUT API] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.log('🔴 [LOGOUT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
    }),
    getCurrentUser: builder.query<User, void>({
      queryFn: async () => {
        // Use users/profile/ instead of auth/me/
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
          return {
            error: {
              status: 'UNAUTHORIZED' as const,
              error: 'No access token found',
            },
          };
        }

        try {
          const response = await fetch(`${getApiBaseUrl()}users/profile/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch profile' }));
            return {
              error: {
                status: response.status,
                data: error,
              },
            };
          }

          const data = await response.json();
          console.log('📥 [AUTH API - getCurrentUser] Raw response:', data);
          // Transform the response to match User interface
          const transformedUser: User = {
            id: String(data.id),
            name: `${data.first_name} ${data.last_name}`.trim() || data.username,
            email: data.email,
            role: data.role as 'admin' | 'staff' | 'user',
            isDistributor: data.is_distributor,
            phone: data.mobile,
            joinedAt: data.date_joined,
            kycStatus: data.kyc_status || 'not_submitted',
            avatar: data.profile_picture || undefined,
          };
          console.log('🔄 [AUTH API - getCurrentUser] Transformed user:', transformedUser);
          
          return { data: transformedUser };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            },
          };
        }
      },
      providesTags: ['User'],
    }),
  }),
});

export const { 
  useSignupMutation, 
  useVerifySignupOTPMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSendAdminOTPMutation,
  useVerifyAdminOTPMutation,
  useSendUniversalOTPMutation,
  useVerifyUniversalOTPMutation,
  useLoginMutation, 
  useLogoutMutation, 
  useGetCurrentUserQuery 
} = authApi;
