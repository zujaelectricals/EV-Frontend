import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken, setProfilePicture } from './baseApi';
import { API_BASE_URL } from '../../lib/config';
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
  referral_link?: string;
  referred_by: string | null;
  kyc_status: 'not_submitted' | 'pending' | 'verified' | 'approved' | 'rejected' | null;
  nominee_exists: boolean;
  nominee_kyc_status: 'not_submitted' | 'pending' | 'verified' | 'approved' | 'rejected' | null;
  date_joined: string;
  binary_commission_active: boolean;
  binary_pairs_matched: number;
  left_leg_count: number;
  right_leg_count: number;
  carry_forward_left: number;
  carry_forward_right: number;
  is_distributor_terms_and_conditions_accepted: boolean | null;
  distributor_application_status: 'pending' | 'approved' | 'rejected' | null;
  profile_picture?: string; // URL to the profile picture
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

// Nominee KYC submission response
export interface NomineeKYCSubmissionResponse {
  success: boolean;
  message: string;
  nominee_kyc_status: 'pending';
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
    kycStatus: profile.kyc_status === 'approved' ? 'verified' : (profile.kyc_status || 'not_submitted'),
    distributorApplicationStatus: profile.distributor_application_status,
    avatar: profile.profile_picture || undefined,
    distributorInfo: shouldIncludeDistributorInfo ? {
      isDistributor: profile.is_distributor,
      isVerified: profile.kyc_status === 'approved' || profile.kyc_status === 'verified',
      // Use distributor_application_status when available, otherwise fall back to KYC status mapping
      // Only set verificationStatus if distributor_application_status exists, otherwise undefined
      verificationStatus: profile.distributor_application_status
        ? profile.distributor_application_status
        : profile.kyc_status === 'approved' || profile.kyc_status === 'verified'
          ? 'approved'
          : profile.kyc_status === 'rejected'
            ? 'rejected'
            : undefined,
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
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
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

          // Store profile picture in localStorage if it exists and has changed
          if (data.profile_picture) {
            const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
            if (currentStoredPicture !== data.profile_picture) {
              setProfilePicture(data.profile_picture);
              console.log('✅ [USER PROFILE API] Profile picture updated in localStorage');
            }
          } else {
            // Clear profile picture if it's not in the response
            const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
            if (currentStoredPicture) {
              setProfilePicture(null);
              console.log('✅ [USER PROFILE API] Profile picture cleared from localStorage');
            }
          }

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
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
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
          
          // Store profile picture in localStorage if it exists and has changed
          if (data.profile_picture) {
            const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
            if (currentStoredPicture !== data.profile_picture) {
              setProfilePicture(data.profile_picture);
              console.log('✅ [USER PROFILE RAW API] Profile picture updated in localStorage');
            }
          } else {
            // Clear profile picture if it's not in the response
            const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
            if (currentStoredPicture) {
              setProfilePicture(null);
              console.log('✅ [USER PROFILE RAW API] Profile picture cleared from localStorage');
            }
          }
          
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

        // Helper function to create FormData from body
        const createFormData = () => {
          const formData = new FormData();
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
          return formData;
        };

        // Get access token from localStorage
        let { accessToken } = getAuthTokens();

        if (!accessToken) {
          console.error('❌ [KYC API] No access token found in localStorage');
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        // Log token info (first 10 and last 10 chars for security)
        const tokenPreview = accessToken.length > 20
          ? `${accessToken.substring(0, 10)}...${accessToken.substring(accessToken.length - 10)}`
          : '***';
        console.log('🔵 [KYC API] Access token found in localStorage:', tokenPreview);
        console.log('🔵 [KYC API] Token length:', accessToken.length);

        try {
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

          // Create FormData for multipart/form-data
          console.log('🔵 [KYC API] Creating FormData from request body...');
          let formData = createFormData();

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

          let response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Don't set Content-Type - browser will set it with boundary
            },
            body: formData,
          });

          console.log('📥 [KYC API] Response status:', response.status, response.statusText);
          console.log('📥 [KYC API] Response headers:', Object.fromEntries(response.headers.entries()));

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [KYC API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              // Retry the request with new token
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [KYC API] Retrying request with new token...');
                
                // Recreate FormData (can't reuse after being sent)
                formData = createFormData();
                
                // Log retry FormData entries
                console.log('📤 [KYC API] Retry FormData entries:', Array.from(formData.entries()).map(([key, value]) => ({
                  key,
                  value: value instanceof File
                    ? `File: ${value.name} (${value.size} bytes, type: ${value.type})`
                    : String(value),
                })));

                response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    // Don't set Content-Type - browser will set it with boundary
                  },
                  body: formData,
                });

                console.log('📥 [KYC API] Retry response status:', response.status, response.statusText);
              } else {
                // Refresh succeeded but no new token found
                const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
                return {
                  error: {
                    status: 401,
                    data: error,
                  } as FetchBaseQueryError,
                };
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

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
          console.error('❌ [KYC API] Fetch error:', error);
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

    // PATCH users/update_profile/ - Update user profile (supports multipart/form-data when profile_picture is included)
    updateProfile: builder.mutation<UserProfileResponse, Partial<UserProfileResponse> & { profile_picture?: File }>({
      queryFn: async (body) => {
        console.log('🔵 [PROFILE UPDATE API] ========== Starting Profile Update ==========');
        console.log('🔵 [PROFILE UPDATE API] Request body type check:', {
          hasProfilePicture: body.profile_picture instanceof File,
          profilePictureType: typeof body.profile_picture,
          profilePictureValue: body.profile_picture instanceof File 
            ? `File: ${body.profile_picture.name} (${body.profile_picture.size} bytes, type: ${body.profile_picture.type})`
            : body.profile_picture,
        });

        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const hasProfilePicture = body.profile_picture instanceof File;
          
          // If profile_picture is included, use multipart/form-data
          if (hasProfilePicture) {
            const formData = new FormData();
            
            // Add all text fields to FormData
            if (body.first_name) formData.append('first_name', body.first_name);
            if (body.last_name) formData.append('last_name', body.last_name);
            if (body.email) formData.append('email', body.email);
            if (body.mobile) formData.append('mobile', body.mobile);
            if (body.gender) formData.append('gender', body.gender);
            if (body.date_of_birth) formData.append('date_of_birth', body.date_of_birth);
            if (body.address_line1) formData.append('address_line1', body.address_line1);
            if (body.address_line2) formData.append('address_line2', body.address_line2);
            if (body.city) formData.append('city', body.city);
            if (body.state) formData.append('state', body.state);
            if (body.pincode) formData.append('pincode', body.pincode);
            if (body.country) formData.append('country', body.country);
            
            // Add profile picture file - ensure it's a File object
            if (body.profile_picture instanceof File) {
              formData.append('profile_picture', body.profile_picture);
              console.log('📤 [PROFILE UPDATE API] Added profile_picture file to FormData:', {
                name: body.profile_picture.name,
                size: body.profile_picture.size,
                type: body.profile_picture.type,
              });
            } else {
              console.error('❌ [PROFILE UPDATE API] profile_picture is not a File object:', body.profile_picture);
            }

            console.log('📤 [PROFILE UPDATE API] Using multipart/form-data (profile_picture included)');
            const formDataEntries = Array.from(formData.entries()).map(([key, value]) => ({
              key,
              value: value instanceof File
                ? `File: ${value.name} (${value.size} bytes, type: ${value.type})`
                : String(value),
            }));
            console.log('📤 [PROFILE UPDATE API] FormData entries:', formDataEntries);

            let response = await fetch(`${getApiBaseUrl()}users/update_profile/`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                // Don't set Content-Type - browser will set it with boundary for multipart/form-data
              },
              body: formData,
            });

            // Handle 401 Unauthorized - try to refresh token
            if (response.status === 401) {
              console.log('🟡 [PROFILE UPDATE API] Access token expired, attempting to refresh...');
              const refreshData = await refreshAccessToken();

              if (refreshData) {
                const { accessToken: newAccessToken } = getAuthTokens();
                if (newAccessToken) {
                  console.log('🔄 [PROFILE UPDATE API] Retrying request with new token...');
                  // Recreate FormData (can't reuse after being sent)
                  const retryFormData = new FormData();
                  if (body.first_name) retryFormData.append('first_name', body.first_name);
                  if (body.last_name) retryFormData.append('last_name', body.last_name);
                  if (body.email) retryFormData.append('email', body.email);
                  if (body.mobile) retryFormData.append('mobile', body.mobile);
                  if (body.gender) retryFormData.append('gender', body.gender);
                  if (body.date_of_birth) retryFormData.append('date_of_birth', body.date_of_birth);
                  if (body.address_line1) retryFormData.append('address_line1', body.address_line1);
                  if (body.address_line2) retryFormData.append('address_line2', body.address_line2);
                  if (body.city) retryFormData.append('city', body.city);
                  if (body.state) retryFormData.append('state', body.state);
                  if (body.pincode) retryFormData.append('pincode', body.pincode);
                  if (body.country) retryFormData.append('country', body.country);
                  if (body.profile_picture instanceof File) {
                    retryFormData.append('profile_picture', body.profile_picture);
                  }

                  response = await fetch(`${getApiBaseUrl()}users/update_profile/`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${newAccessToken}`,
                    },
                    body: retryFormData,
                  });
                }
              }
            }

            if (!response.ok) {
              const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
              console.error('❌ [PROFILE UPDATE API] Error response:', error);
              return {
                error: {
                  status: response.status,
                  data: error,
                } as FetchBaseQueryError,
              };
            }

            const data: UserProfileResponse = await response.json();
            console.log('✅ [PROFILE UPDATE API] Profile updated successfully with multipart/form-data');
            
            // Store profile picture in localStorage if it exists and has changed
            if (data.profile_picture) {
              const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
              if (currentStoredPicture !== data.profile_picture) {
                setProfilePicture(data.profile_picture);
                console.log('✅ [PROFILE UPDATE API] Profile picture updated in localStorage');
              }
            } else {
              // Clear profile picture if it's not in the response
              const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
              if (currentStoredPicture) {
                setProfilePicture(null);
                console.log('✅ [PROFILE UPDATE API] Profile picture cleared from localStorage');
              }
            }
            
            console.log('✅ [PROFILE UPDATE API] ========== Profile Update Completed ==========');
            return { data };
          } else {
            // If no profile_picture, use application/json
            console.log('📤 [PROFILE UPDATE API] Using application/json (no profile_picture)');
            // Remove profile_picture from body if it exists but isn't a File
            const { profile_picture, ...jsonBody } = body;
            console.log('📤 [PROFILE UPDATE API] Request body:', JSON.stringify(jsonBody, null, 2));

            let response = await fetch(`${getApiBaseUrl()}users/update_profile/`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(jsonBody),
            });

            // Handle 401 Unauthorized - try to refresh token
            if (response.status === 401) {
              console.log('🟡 [PROFILE UPDATE API] Access token expired, attempting to refresh...');
              const refreshData = await refreshAccessToken();

              if (refreshData) {
                const { accessToken: newAccessToken } = getAuthTokens();
                if (newAccessToken) {
                  console.log('🔄 [PROFILE UPDATE API] Retrying request with new token...');
                  response = await fetch(`${getApiBaseUrl()}users/update_profile/`, {
                    method: 'PUT',
                    headers: {
                      'Authorization': `Bearer ${newAccessToken}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jsonBody),
                  });
                }
              }
            }

            if (!response.ok) {
              const error = await response.json().catch(() => ({ message: 'Failed to update profile' }));
              console.error('❌ [PROFILE UPDATE API] Error response:', error);
              return {
                error: {
                  status: response.status,
                  data: error,
                } as FetchBaseQueryError,
              };
            }

            const data: UserProfileResponse = await response.json();
            console.log('✅ [PROFILE UPDATE API] Profile updated successfully with application/json');
            
            // Store profile picture in localStorage if it exists and has changed
            if (data.profile_picture) {
              const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
              if (currentStoredPicture !== data.profile_picture) {
                setProfilePicture(data.profile_picture);
                console.log('✅ [PROFILE UPDATE API] Profile picture updated in localStorage');
              }
            } else {
              // Clear profile picture if it's not in the response
              const currentStoredPicture = localStorage.getItem('ev_nexus_profile_picture');
              if (currentStoredPicture) {
                setProfilePicture(null);
                console.log('✅ [PROFILE UPDATE API] Profile picture cleared from localStorage');
              }
            }
            
            console.log('✅ [PROFILE UPDATE API] ========== Profile Update Completed ==========');
            return { data };
          }
        } catch (error) {
          console.error('❌ [PROFILE UPDATE API] Fetch error:', error);
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
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
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
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
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

    // POST users/nominee/submit-kyc/ - Submit nominee KYC for verification
    submitNomineeKYC: builder.mutation<NomineeKYCSubmissionResponse, void>({
      queryFn: async () => {
        console.log('🔵 [NOMINEE KYC API] ========== Starting Nominee KYC Submission ==========');

        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          console.error('❌ [NOMINEE KYC API] No access token found in localStorage');
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const apiUrl = `${getApiBaseUrl()}users/nominee/submit-kyc/`;
          console.log('🔵 [NOMINEE KYC API] Making POST request to:', apiUrl);

          let response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [NOMINEE KYC API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [NOMINEE KYC API] Retrying request with new token...');
                response = await fetch(apiUrl, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to submit nominee KYC' }));
            console.error('❌ [NOMINEE KYC API] Error response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data: NomineeKYCSubmissionResponse = await response.json();
          console.log('✅ [NOMINEE KYC API] Success! Response:', data);
          console.log('✅ [NOMINEE KYC API] ========== Nominee KYC Submission Completed ==========');
          return { data };
        } catch (error) {
          console.error('❌ [NOMINEE KYC API] Fetch error:', error);
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

    // GET users/normal/ - Get list of normal users (for admin)
    getNormalUsers: builder.query<{
      count: number;
      next: string | null;
      previous: string | null;
      results: UserProfileResponse[];
    }, {
      page?: number;
      page_size?: number;
      is_distributor?: boolean;
      date_joined_from?: string;
      date_joined_to?: string;
      ordering?: string;
      search?: string;
    }>({
      queryFn: async (params = {}) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          // Build query string
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.page_size) queryParams.append('page_size', params.page_size.toString());
          if (params.is_distributor !== undefined) queryParams.append('is_distributor', params.is_distributor.toString());
          if (params.date_joined_from) queryParams.append('date_joined_from', params.date_joined_from);
          if (params.date_joined_to) queryParams.append('date_joined_to', params.date_joined_to);
          if (params.ordering) queryParams.append('ordering', params.ordering);
          if (params.search) queryParams.append('search', params.search);

          const queryString = queryParams.toString();
          const url = `${getApiBaseUrl()}users/normal/${queryString ? `?${queryString}` : ''}`;

          console.log('📤 [USER API - getNormalUsers] Request URL:', url);
          console.log('📤 [USER API - getNormalUsers] Query Params:', params);

          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - getNormalUsers] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              // Retry the request with new token
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - getNormalUsers] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch users' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('📥 [USER API - getNormalUsers] Response:', data);

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
      // Serialize query args for proper caching - each combination of params gets its own cache entry
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page = 1, page_size = 20, ordering = '-date_joined', is_distributor, search } = queryArgs || {};
        return `${endpointName}(${JSON.stringify({ page, page_size, ordering, is_distributor, search })})`;
      },
      providesTags: ['User'],
    }),

    // GET users/{id}/ - Get single user by ID (for admin)
    getUserById: builder.query<UserProfileResponse, number>({
      queryFn: async (userId) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          let response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - getUserById] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              // Retry the request with new token
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - getUserById] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch user' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data: UserProfileResponse = await response.json();
          console.log('📥 [USER API - getUserById] Response:', data);

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

    // PUT users/{id}/ - Update user by ID (for admin)
    updateUserById: builder.mutation<UserProfileResponse, {
      userId: number; data: {
        first_name: string;
        last_name: string;
        email: string;
        mobile: string;
        gender: string;
        date_of_birth: string;
        address_line1: string;
        address_line2?: string;
        city: string;
        state: string;
        pincode: string;
        country?: string;
      }
    }>({
      queryFn: async ({ userId, data }) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const requestBody = JSON.stringify(data);
          console.log('📤 [USER API - updateUserById] Request URL:', `${getApiBaseUrl()}users/${userId}/`);
          console.log('📤 [USER API - updateUserById] Request Body:', requestBody);
          console.log('📤 [USER API - updateUserById] Request Body (Parsed):', JSON.stringify(data, null, 2));

          let response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: requestBody,
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - updateUserById] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              // Retry the request with new token
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - updateUserById] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: requestBody,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to update user' }));
            console.error('❌ [USER API - updateUserById] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const responseData: UserProfileResponse = await response.json();
          console.log('✅ [USER API - updateUserById] Response Status:', response.status);
          console.log('✅ [USER API - updateUserById] Response Data:', JSON.stringify(responseData, null, 2));

          return { data: responseData };
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

    // DELETE users/{id}/ - Delete user by ID (for admin)
    deleteUserById: builder.mutation<{ success: boolean; message: string }, number>({
      queryFn: async (userId) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          console.log('📤 [USER API - deleteUserById] Request URL:', `${getApiBaseUrl()}users/${userId}/`);
          console.log('📤 [USER API - deleteUserById] User ID:', userId);

          let response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - deleteUserById] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              // Retry the request with new token
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - deleteUserById] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/${userId}/`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to delete user' }));
            console.error('❌ [USER API - deleteUserById] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          // DELETE requests typically return 204 No Content or 200 with a message
          let responseData: { success: boolean; message: string } = { success: true, message: 'User deleted successfully' };
          if (response.status !== 204) {
            try {
              responseData = await response.json();
            } catch {
              // If no JSON response, use default
            }
          }

          console.log('✅ [USER API - deleteUserById] Response Status:', response.status);
          console.log('✅ [USER API - deleteUserById] Response Data:', JSON.stringify(responseData, null, 2));

          return { data: responseData };
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

    // GET users/kyc/list_all/ - List all KYC documents with pagination and filtering (Admin only)
    getKYCList: builder.query<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        kyc_type: string;
        id: number;
        user_id: number;
        user_email: string;
        user_username: string;
        user_full_name: string;
        reviewed_by: {
          id: number;
          fullname: string;
          email: string;
          profile_picture_url: string | null;
        } | null;
        status: 'pending' | 'approved' | 'rejected';
        pan_number: string | null;
        aadhaar_number: string | null;
        address_line1: string;
        address_line2: string;
        city: string;
        state: string;
        pincode: string;
        country: string | null;
        pan_document: string | null;
        aadhaar_front: string | null;
        aadhaar_back: string | null;
        bank_name: string | null;
        account_number: string | null;
        ifsc_code: string | null;
        account_holder_name: string | null;
        bank_passbook: string | null;
        submitted_at: string;
        reviewed_at: string | null;
        rejection_reason: string;
        // Nominee-specific fields
        nominee_full_name?: string;
        relationship?: string;
        date_of_birth?: string;
        mobile?: string;
        email?: string;
        id_proof_type?: string;
        id_proof_number?: string;
        id_proof_document?: string;
      }>;
    }, {
      page?: number;
      page_size?: number;
      status?: 'pending' | 'approved' | 'rejected';
      submitted_date_from?: string;
      submitted_date_to?: string;
      reviewed_date_from?: string;
      reviewed_date_to?: string;
      user_id?: number;
      user_role?: 'admin' | 'staff' | 'user';
      ordering?: string;
    }>({
      queryFn: async (params) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          // Build query string
          const queryParams = new URLSearchParams();
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.page_size) queryParams.append('page_size', params.page_size.toString());
          if (params.status) queryParams.append('status', params.status);
          if (params.submitted_date_from) queryParams.append('submitted_date_from', params.submitted_date_from);
          if (params.submitted_date_to) queryParams.append('submitted_date_to', params.submitted_date_to);
          if (params.reviewed_date_from) queryParams.append('reviewed_date_from', params.reviewed_date_from);
          if (params.reviewed_date_to) queryParams.append('reviewed_date_to', params.reviewed_date_to);
          if (params.user_id) queryParams.append('user_id', params.user_id.toString());
          if (params.user_role) queryParams.append('user_role', params.user_role);
          if (params.ordering) queryParams.append('ordering', params.ordering);

          const queryString = queryParams.toString();
          const url = `${getApiBaseUrl()}users/kyc/list_all/${queryString ? `?${queryString}` : ''}`;

          console.log('📤 [USER API - getKYCList] Request URL:', url);
          console.log('📤 [USER API - getKYCList] Query Params:', params);

          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - getKYCList] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - getKYCList] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch KYC list' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('📥 [USER API - getKYCList] Response:', JSON.stringify(data, null, 2));
          console.log('📥 [USER API - getKYCList] Response Count:', data.count);
          console.log('📥 [USER API - getKYCList] Results Count:', data.results?.length || 0);
          return { data };
        } catch (error) {
          console.error('❌ [USER API - getKYCList] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      providesTags: ['KYC'],
    }),

    // POST users/kyc/{id}/update-status/ - Update KYC status (Approve/Reject) (Admin only)
    updateKYCStatus: builder.mutation<{ success: boolean; message: string }, { kycId: number; status: 'approved' | 'rejected'; reason?: string }>({
      queryFn: async ({ kycId, status, reason }) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const requestBody: { status: string; reason?: string } = { status };
          if (status === 'rejected' && reason) {
            requestBody.reason = reason;
          }

          console.log('📤 [USER API - updateKYCStatus] Request URL:', `${getApiBaseUrl()}users/kyc/${kycId}/update-status/`);
          console.log('📤 [USER API - updateKYCStatus] Request Body:', JSON.stringify(requestBody, null, 2));

          let response = await fetch(`${getApiBaseUrl()}users/kyc/${kycId}/update-status/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - updateKYCStatus] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - updateKYCStatus] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/kyc/${kycId}/update-status/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Failed to ${status} KYC` }));
            console.error('❌ [USER API - updateKYCStatus] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('✅ [USER API - updateKYCStatus] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.error('❌ [USER API - updateKYCStatus] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['KYC', 'User'],
    }),

    // POST users/nominee/{id}/approve/ - Approve nominee KYC (Admin only)
    approveNomineeKYC: builder.mutation<{ success: boolean; message: string }, { nomineeId: number }>({
      queryFn: async ({ nomineeId }) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const requestBody = { status: 'approved' };

          console.log('📤 [USER API - approveNomineeKYC] Request URL:', `${getApiBaseUrl()}users/nominee/${nomineeId}/approve/`);
          console.log('📤 [USER API - approveNomineeKYC] Request Body:', JSON.stringify(requestBody, null, 2));

          let response = await fetch(`${getApiBaseUrl()}users/nominee/${nomineeId}/approve/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - approveNomineeKYC] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - approveNomineeKYC] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/nominee/${nomineeId}/approve/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to approve nominee KYC' }));
            console.error('❌ [USER API - approveNomineeKYC] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('✅ [USER API - approveNomineeKYC] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.error('❌ [USER API - approveNomineeKYC] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['KYC', 'User'],
    }),

    // POST users/nominee/{id}/reject/ - Reject nominee KYC (Admin only)
    rejectNomineeKYC: builder.mutation<{ success: boolean; message: string }, { nomineeId: number; reason: string }>({
      queryFn: async ({ nomineeId, reason }) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const requestBody = { reason };

          console.log('📤 [USER API - rejectNomineeKYC] Request URL:', `${getApiBaseUrl()}users/nominee/${nomineeId}/reject/`);
          console.log('📤 [USER API - rejectNomineeKYC] Request Body:', JSON.stringify(requestBody, null, 2));

          let response = await fetch(`${getApiBaseUrl()}users/nominee/${nomineeId}/reject/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - rejectNomineeKYC] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - rejectNomineeKYC] Retrying request with new token...');
                response = await fetch(`${getApiBaseUrl()}users/nominee/${nomineeId}/reject/`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to reject nominee KYC' }));
            console.error('❌ [USER API - rejectNomineeKYC] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('✅ [USER API - rejectNomineeKYC] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.error('❌ [USER API - rejectNomineeKYC] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['KYC', 'User'],
    }),

    // GET users/distributor-application/list_all/ - List all distributor applications (Admin only)
    getDistributorApplications: builder.query<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        user_email: string;
        user_username: string;
        user_full_name: string;
        reviewed_by: number | null;
        is_distributor_terms_and_conditions_accepted: boolean;
        status: 'pending' | 'approved' | 'rejected';
        company_name: string | null;
        business_registration_number: string | null;
        tax_id: string | null;
        years_in_business: number | null;
        previous_distribution_experience: string | null;
        product_interest: string | null;
        reference_name: string | null;
        reference_contact: string | null;
        reference_relationship: string | null;
        business_license: string | null;
        tax_documents: string | null;
        submitted_at: string;
        reviewed_at: string | null;
        rejection_reason: string;
        user: number;
      }>;
    }, void>({
      queryFn: async () => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const url = `${getApiBaseUrl()}users/distributor-application/list_all/`;
          console.log('📤 [USER API - getDistributorApplications] Request URL:', url);

          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - getDistributorApplications] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - getDistributorApplications] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to fetch distributor applications' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('📥 [USER API - getDistributorApplications] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.error('❌ [USER API - getDistributorApplications] Error:', error);
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

    // POST users/distributor-application/{id}/update-status/ - Update distributor application status (Admin only)
    updateDistributorApplicationStatus: builder.mutation<
      { success: boolean; message: string },
      { applicationId: number; status: 'approved' | 'rejected'; reason?: string }
    >({
      queryFn: async ({ applicationId, status, reason }) => {
        const { accessToken } = getAuthTokens();

        if (!accessToken) {
          return {
            error: {
              status: 401,
              data: { message: 'No access token found' },
            } as FetchBaseQueryError,
          };
        }

        try {
          const requestBody: { status: string; reason?: string } = { status };
          if (status === 'rejected' && reason) {
            requestBody.reason = reason;
          }

          const url = `${getApiBaseUrl()}users/distributor-application/${applicationId}/update-status/`;
          console.log('📤 [USER API - updateDistributorApplicationStatus] Request URL:', url);
          console.log('📤 [USER API - updateDistributorApplicationStatus] Request Body:', JSON.stringify(requestBody, null, 2));

          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [USER API - updateDistributorApplicationStatus] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();

            if (refreshData) {
              const { accessToken: newAccessToken } = getAuthTokens();
              if (newAccessToken) {
                console.log('🔄 [USER API - updateDistributorApplicationStatus] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${newAccessToken}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody),
                });
              }
            } else {
              const error = await response.json().catch(() => ({ message: 'Authentication failed' }));
              return {
                error: {
                  status: 401,
                  data: error,
                } as FetchBaseQueryError,
              };
            }
          }

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: `Failed to ${status} distributor application` }));
            console.error('❌ [USER API - updateDistributorApplicationStatus] Error Response:', error);
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data = await response.json();
          console.log('✅ [USER API - updateDistributorApplicationStatus] Response:', JSON.stringify(data, null, 2));
          return { data };
        } catch (error) {
          console.error('❌ [USER API - updateDistributorApplicationStatus] Error:', error);
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
  }),
});

export const {
  useGetUserProfileQuery,
  useGetUserProfileRawQuery,
  useSubmitKYCMutation,
  useUpdateProfileMutation,
  useSubmitNomineeMutation,
  useGetNomineeDetailsQuery,
  useSubmitNomineeKYCMutation,
  useGetNormalUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useDeleteUserByIdMutation,
  useGetKYCListQuery,
  useUpdateKYCStatusMutation,
  useApproveNomineeKYCMutation,
  useRejectNomineeKYCMutation,
  useGetDistributorApplicationsQuery,
  useUpdateDistributorApplicationStatusMutation,
} = userApi;

