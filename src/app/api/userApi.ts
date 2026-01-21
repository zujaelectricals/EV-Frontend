import { api } from './baseApi';
import { getAuthTokens } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';
import type { User } from '../slices/authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Response structure from users/profile/
export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  mobile: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  role: string;
  is_distributor: boolean;
  is_active_buyer: boolean;
  referral_code: string;
  referred_by: string | null;
  kyc_status: 'not_submitted' | 'pending' | 'verified' | 'approved' | 'rejected' | null;
  nominee_exists: boolean;
  date_joined: string;
  binary_commission_active: boolean;
  binary_pairs_matched: number;
  left_leg_count: number;
  right_leg_count: number;
  carry_forward_left: number;
  carry_forward_right: number;
}

// KYC submission request (multipart/form-data)
export interface KYCSubmissionRequest {
  pan_number: string;
  aadhaar_number: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  pan_document: File;
  aadhaar_front: File;
  aadhaar_back: File;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  bank_passbook: File;
}

export interface KYCSubmissionResponse {
  success: boolean;
  message: string;
  kyc_status: 'pending';
}

// Nominee submission request (multipart/form-data)
export interface NomineeSubmissionRequest {
  full_name: string;
  relationship: string;
  date_of_birth: string;
  mobile: string;
  email: string;
  address_line1: string;
  city: string;
  state: string;
  pincode: string;
  id_proof_type: string;
  id_proof_number: string;
  id_proof_document?: File; // Optional when editing existing nominee
  nomineeId?: number; // Optional - if provided, will use PUT method for update
}

export interface NomineeSubmissionResponse {
  success: boolean;
  message: string;
}

// Nominee details response (single nominee object)
export interface NomineeDetails {
  id: number;
  full_name: string;
  relationship: string;
  date_of_birth: string;
  mobile: string;
  email: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  id_proof_type: string;
  id_proof_number: string;
  id_proof_document?: string; // URL to the document
  created_at?: string;
  updated_at?: string;
  kyc_status?: string;
  kyc_submitted_at?: string;
  kyc_verified_at?: string | null;
  kyc_rejection_reason?: string;
  user?: number;
  kyc_verified_by?: number | null;
}

// Paginated nominee response
export interface NomineeDetailsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NomineeDetails[];
}

// Helper function to transform UserProfileResponse to User
const transformUserProfile = (profile: UserProfileResponse): User => {
  // Always create distributorInfo if user has a referral_code or is a distributor
  const shouldIncludeDistributorInfo = profile.is_distributor || profile.referral_code;
  
  return {
    id: String(profile.id),
    name: `${profile.first_name} ${profile.last_name}`.trim() || profile.username,
    email: profile.email,
    role: profile.role as 'admin' | 'staff' | 'user',
    isDistributor: profile.is_distributor,
    phone: profile.mobile,
    joinedAt: profile.date_joined,
    kycStatus: profile.kyc_status || 'not_submitted',
    distributorInfo: shouldIncludeDistributorInfo ? {
      isDistributor: profile.is_distributor,
      isVerified: profile.kyc_status === 'approved' || profile.kyc_status === 'verified',
      verificationStatus: profile.kyc_status === 'approved' || profile.kyc_status === 'verified' ? 'approved' : profile.kyc_status === 'rejected' ? 'rejected' : 'pending',
      referralCode: profile.referral_code || '',
      referredBy: profile.referred_by || undefined,
      leftCount: profile.left_leg_count || 0,
      rightCount: profile.right_leg_count || 0,
      totalReferrals: (profile.left_leg_count || 0) + (profile.right_leg_count || 0),
      binaryActivated: profile.binary_commission_active || false,
      activationBonusCredited: false,
      totalCommissionEarned: 0,
      pairsBeyondLimit: 0,
      poolMoney: 0,
    } : undefined,
  };
};

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET users/profile/ - Get current user profile
    getUserProfile: builder.query<User, void>({
      queryFn: async () => {
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
              } as FetchBaseQueryError,
            };
          }

          const data: UserProfileResponse = await response.json();
          console.log('📥 [USER PROFILE API] Raw response:', data);
          const transformedUser = transformUserProfile(data);
          console.log('🔄 [USER PROFILE API] Transformed user:', transformedUser);
          
          return { data: transformedUser };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['User'],
    }),

    // GET users/profile/ - Get raw user profile data (for editing)
    getUserProfileRaw: builder.query<UserProfileResponse, void>({
      queryFn: async () => {
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
              } as FetchBaseQueryError,
            };
          }

          const data: UserProfileResponse = await response.json();
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['User'],
    }),

    // POST users/kyc/ - Submit KYC documents with multipart/form-data
    submitKYC: builder.mutation<KYCSubmissionResponse, KYCSubmissionRequest>({
      queryFn: async (body) => {
        console.log('🔵 [KYC API] ========== Starting KYC submission ==========');
        
        // Get access token from localStorage
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
          console.error('❌ [KYC API] No access token found in localStorage');
          return {
            error: {
              status: 'UNAUTHORIZED' as const,
              error: 'No access token found',
            },
          };
        }

        // Log token info (first 10 and last 10 chars for security)
        const tokenPreview = accessToken.length > 20 
          ? `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}`
          : '***';
        console.log('🔵 [KYC API] Access token found in localStorage:', tokenPreview);
        console.log('🔵 [KYC API] Token length:', accessToken.length);

        try {
          // Create FormData for multipart/form-data
          console.log('🔵 [KYC API] Creating FormData from request body...');
          const formData = new FormData();
          
          // Log request body details
          console.log('📤 [KYC API] Request Body:', {
            pan_number: body.pan_number,
            aadhaar_number: body.aadhaar_number,
            address_line1: body.address_line1,
            address_line2: body.address_line2,
            city: body.city,
            state: body.state,
            pincode: body.pincode,
            country: body.country,
            bank_name: body.bank_name,
            account_number: body.account_number,
            ifsc_code: body.ifsc_code,
            account_holder_name: body.account_holder_name,
            pan_document: body.pan_document ? `File: ${body.pan_document.name} (${body.pan_document.size} bytes, type: ${body.pan_document.type})` : 'null',
            aadhaar_front: body.aadhaar_front ? `File: ${body.aadhaar_front.name} (${body.aadhaar_front.size} bytes, type: ${body.aadhaar_front.type})` : 'null',
            aadhaar_back: body.aadhaar_back ? `File: ${body.aadhaar_back.name} (${body.aadhaar_back.size} bytes, type: ${body.aadhaar_back.type})` : 'null',
            bank_passbook: body.bank_passbook ? `File: ${body.bank_passbook.name} (${body.bank_passbook.size} bytes, type: ${body.bank_passbook.type})` : 'null',
          });
          
          formData.append('pan_number', body.pan_number);
          formData.append('aadhaar_number', body.aadhaar_number);
          formData.append('address_line1', body.address_line1);
          if (body.address_line2) {
            formData.append('address_line2', body.address_line2);
          }
          formData.append('city', body.city);
          formData.append('state', body.state);
          formData.append('pincode', body.pincode);
          formData.append('country', body.country);
          formData.append('pan_document', body.pan_document);
          formData.append('aadhaar_front', body.aadhaar_front);
          formData.append('aadhaar_back', body.aadhaar_back);
          formData.append('bank_name', body.bank_name);
          formData.append('account_number', body.account_number);
          formData.append('ifsc_code', body.ifsc_code);
          formData.append('account_holder_name', body.account_holder_name);
          formData.append('bank_passbook', body.bank_passbook);

          // Log FormData entries
          console.log('📤 [KYC API] FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
            key,
            value: value instanceof File 
              ? `File: ${value.name} (${value.size} bytes, type: ${value.type})` 
              : String(value),
          })));

          const apiUrl = `${getApiBaseUrl()}users/kyc/`;
          console.log('🔵 [KYC API] Making POST request to:', apiUrl);
          console.log('🔵 [KYC API] Request headers:', {
            'Authorization': `Bearer ${tokenPreview}`,
            'Content-Type': 'multipart/form-data (with boundary - set by browser)',
          });
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Don't set Content-Type - browser will set it with boundary
            },
            body: formData,
          });

          console.log('📥 [KYC API] Response status:', response.status, response.statusText);
          console.log('📥 [KYC API] Response headers:', Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to submit KYC' }));
            console.error('❌ [KYC API] Error response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data: KYCSubmissionResponse = await response.json();
          console.log('✅ [KYC API] Success! Response data:', JSON.stringify(data, null, 2));
          console.log('✅ [KYC API] ========== KYC submission completed ==========');
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['User', 'KYC'],
    }),

    // PUT users/update_profile/ - Update user profile
    updateProfile: builder.mutation<UserProfileResponse, Partial<UserProfileResponse>>({
      queryFn: async (body) => {
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
          const response = await fetch(`${getApiBaseUrl()}users/update_profile/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data: UserProfileResponse = await response.json();
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['User'],
    }),

    // POST/PUT users/nominee/ - Submit/Update nominee details with multipart/form-data
    submitNominee: builder.mutation<NomineeSubmissionResponse, NomineeSubmissionRequest>({
      queryFn: async (body) => {
        const isUpdate = !!body.nomineeId;
        const method = isUpdate ? 'PUT' : 'POST';
        console.log(`🔵 [NOMINEE API] ========== Starting Nominee ${isUpdate ? 'update' : 'submission'} ==========`);
        
        // Get access token from localStorage
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
          console.error('❌ [NOMINEE API] No access token found in localStorage');
          return {
            error: {
              status: 'UNAUTHORIZED' as const,
              error: 'No access token found',
            },
          };
        }

        // Log token info (first 10 and last 10 chars for security)
        const tokenPreview = accessToken.length > 20 
          ? `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}`
          : '***';
        console.log('🔵 [NOMINEE API] Access token found in localStorage:', tokenPreview);

        try {
          // Create FormData for multipart/form-data
          console.log(`🔵 [NOMINEE API] Creating FormData from request body (${method})...`);
          const formData = new FormData();
          
          // Log request body details
          console.log(`📤 [NOMINEE API] Request Body (${method}):`, {
            nomineeId: body.nomineeId,
            isUpdate: isUpdate,
            full_name: body.full_name,
            relationship: body.relationship,
            date_of_birth: body.date_of_birth,
            mobile: body.mobile,
            email: body.email,
            address_line1: body.address_line1,
            city: body.city,
            state: body.state,
            pincode: body.pincode,
            id_proof_type: body.id_proof_type,
            id_proof_number: body.id_proof_number,
            id_proof_document: body.id_proof_document ? `File: ${body.id_proof_document.name} (${body.id_proof_document.size} bytes, type: ${body.id_proof_document.type})` : 'null',
          });
          
          formData.append('full_name', body.full_name);
          formData.append('relationship', body.relationship);
          formData.append('date_of_birth', body.date_of_birth);
          formData.append('mobile', body.mobile);
          formData.append('email', body.email);
          formData.append('address_line1', body.address_line1);
          formData.append('city', body.city);
          formData.append('state', body.state);
          formData.append('pincode', body.pincode);
          formData.append('id_proof_type', body.id_proof_type);
          formData.append('id_proof_number', body.id_proof_number);
          // Only append file if provided (optional when editing)
          if (body.id_proof_document) {
            formData.append('id_proof_document', body.id_proof_document);
          }

          // Log FormData entries
          const formDataEntries = Array.from(formData.entries()).map(([key, value]) => ({
            key,
            value: value instanceof File 
              ? `File: ${value.name} (${value.size} bytes, type: ${value.type})` 
              : String(value),
          }));
          console.log(`📤 [NOMINEE API] FormData entries (${method}):`, formDataEntries);
          console.log(`📤 [NOMINEE API] FormData entries (stringified) (${method}):`, JSON.stringify(formDataEntries, null, 2));

          // Use PUT endpoint with ID for updates, POST for new nominees
          const apiUrl = isUpdate 
            ? `${getApiBaseUrl()}users/nominee/${body.nomineeId}/`
            : `${getApiBaseUrl()}users/nominee/`;
          
          console.log(`🔵 [NOMINEE API] Making ${method} request to:`, apiUrl);
          console.log(`📤 [NOMINEE API] ${method} Request Body Summary:`, {
            url: apiUrl,
            method: method,
            contentType: 'multipart/form-data',
            nomineeId: body.nomineeId,
            isUpdate: isUpdate,
            fields: {
              full_name: body.full_name,
              relationship: body.relationship,
              date_of_birth: body.date_of_birth,
              mobile: body.mobile,
              email: body.email,
              address_line1: body.address_line1,
              city: body.city,
              state: body.state,
              pincode: body.pincode,
              id_proof_type: body.id_proof_type,
              id_proof_number: body.id_proof_number,
              id_proof_document: body.id_proof_document ? 'Included' : 'Not included',
            },
            totalFields: formDataEntries.length,
          });
          
          const response = await fetch(apiUrl, {
            method: method,
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Don't set Content-Type - browser will set it with boundary for multipart/form-data
            },
            body: formData,
          });

          console.log(`📥 [NOMINEE API] Response status (${method}):`, response.status, response.statusText);
          console.log(`📥 [NOMINEE API] Response headers (${method}):`, Object.fromEntries(response.headers.entries()));
          
          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Failed to ${isUpdate ? 'update' : 'submit'} nominee details` }));
            console.error(`❌ [NOMINEE API] Error response (${method}):`, error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
              };
            }

          const data: NomineeSubmissionResponse = await response.json();
          console.log(`✅ [NOMINEE API] Success! Response data (${method}):`, JSON.stringify(data, null, 2));
          console.log(`✅ [NOMINEE API] ========== Nominee ${isUpdate ? 'update' : 'submission'} completed ==========`);
          return { data };
        } catch (error) {
          console.error('❌ [NOMINEE API] Fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['User'],
    }),

    // GET users/nominee/ - Get nominee details
    getNomineeDetails: builder.query<NomineeDetails | null, void>({
      queryFn: async () => {
        console.log('🔵 [NOMINEE GET API] ========== Starting Nominee fetch ==========');
        
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
          console.error('❌ [NOMINEE GET API] No access token found');
          return {
            error: {
              status: 'UNAUTHORIZED' as const,
              error: 'No access token found',
            },
          };
        }

        try {
          const apiUrl = `${getApiBaseUrl()}users/nominee/`;
          console.log('🔵 [NOMINEE GET API] Making GET request to:', apiUrl);
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          console.log('📥 [NOMINEE GET API] Response status:', response.status, response.statusText);
          console.log('📥 [NOMINEE GET API] Response headers:', Object.fromEntries(response.headers.entries()));

          if (!response.ok) {
            // If 404, nominee doesn't exist yet - return 404 status
            if (response.status === 404) {
              console.log('ℹ️ [NOMINEE GET API] Nominee not found (404)');
              return {
                error: {
                  status: 404,
                  data: { message: 'Nominee not found' },
                } as FetchBaseQueryError,
              };
            }
            
            const error = await response.json().catch(() => ({ message: 'Failed to fetch nominee details' }));
            console.error('❌ [NOMINEE GET API] Error response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const responseData: NomineeDetailsResponse = await response.json();
          console.log('✅ [NOMINEE GET API] Success! Response data:', JSON.stringify(responseData, null, 2));
          
          // Extract the first nominee from results array, or return null if no nominees exist
          const nomineeData = responseData.results && responseData.results.length > 0 
            ? responseData.results[0] 
            : null;
          
          console.log('✅ [NOMINEE GET API] Extracted nominee data:', JSON.stringify(nomineeData, null, 2));
          console.log('✅ [NOMINEE GET API] ========== Nominee fetch completed ==========');
          return { data: nomineeData };
        } catch (error) {
          console.error('❌ [NOMINEE GET API] Fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['User'],
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useGetUserProfileRawQuery,
  useSubmitKYCMutation,
  useUpdateProfileMutation,
  useSubmitNomineeMutation,
  useGetNomineeDetailsQuery,
} = userApi;

