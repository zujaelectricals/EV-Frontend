import { api } from './baseApi';
import { API_BASE_URL } from '../../lib/config';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// ASA Terms Response
export interface ASATermsResponse {
  id: number;
  version: string;
  title: string;
  full_text: string;
  effective_from: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Terms Response (same structure as ASA Terms)
export interface PaymentTermsResponse {
  id: number;
  version: string;
  title: string;
  full_text: string;
  effective_from: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Payment Terms Request Body
export interface PaymentTermsRequest {
  version: string;
  title: string;
  full_text: string;
  effective_from: string;
  is_active: boolean;
}

// Distributor Document Types
export interface DistributorDocument {
  id: number;
  title: string;
  document_type: string;
  content: string;
  file: string | null;
  version: string;
  is_required: boolean;
  effective_from: string;
  effective_until: string | null;
  is_accepted: boolean;
  user_acceptance: {
    accepted_at: string;
    accepted_version: string;
  } | null;
}

export interface DistributorDocumentsResponse {
  count?: number;
  results?: DistributorDocument[];
}

// The API can return either an array directly or an object with results
export type DistributorDocumentsApiResponse = DistributorDocument[] | DistributorDocumentsResponse;

// Create Distributor Document Request
export interface CreateDistributorDocumentRequest {
  title: string;
  document_type: 'payment_terms' | 'distributor_terms';
  content: string;
  file?: File | null;
  version: string;
  is_active: boolean;
  is_required: boolean;
  effective_from: string;
  effective_until?: string | null;
}

export const complianceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get ASA Terms
    getASATerms: builder.query<ASATermsResponse[], void>({
      queryFn: async () => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/asa/`;
          
          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] GET ASA terms error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to fetch ASA terms',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] GET ASA terms response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] GET ASA terms fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['ASATerms'],
    }),

    // Get Payment Terms
    getPaymentTerms: builder.query<PaymentTermsResponse[], void>({
      queryFn: async () => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/payment/`;
          
          console.log('📤 [Compliance API] GET payment terms request:', {
            url,
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
              'Content-Type': 'application/json',
            },
          });
          
          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] GET payment terms error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to fetch payment terms',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] GET payment terms response:', responseData);
          console.log('✅ [Compliance API] GET payment terms response (stringified):', JSON.stringify(responseData, null, 2));
          // Handle both array and single object responses
          const data = Array.isArray(responseData) ? responseData : [responseData];
          console.log('✅ [Compliance API] GET payment terms processed data:', data);
          return { data };
        } catch (error) {
          console.error('❌ [Compliance API] GET payment terms fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['PaymentTerms'],
    }),

    // Get all distributor documents
    getDistributorDocuments: builder.query<DistributorDocumentsApiResponse, void>({
      queryFn: async () => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/distributor-documents/`;
          
          let response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] GET distributor-documents error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to fetch documents',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] GET distributor-documents response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] GET distributor-documents fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      providesTags: ['DistributorDocuments'],
    }),

    // Create distributor document
    createDistributorDocument: builder.mutation<
      DistributorDocument,
      CreateDistributorDocumentRequest
    >({
      queryFn: async (data, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          // Create FormData for multipart/form-data
          const formData = new FormData();
          formData.append('title', data.title);
          formData.append('document_type', data.document_type);
          formData.append('content', data.content);
          formData.append('version', data.version);
          formData.append('is_active', data.is_active.toString());
          formData.append('is_required', data.is_required.toString());
          formData.append('effective_from', data.effective_from);
          
          if (data.file) {
            formData.append('file', data.file);
          }
          
          if (data.effective_until) {
            formData.append('effective_until', data.effective_until);
          }

          const url = `${API_BASE_URL}compliance/distributor-documents/`;
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Don't set Content-Type - browser will set it with boundary
            },
            body: formData,
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                },
                body: formData,
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to create document',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          return { data: responseData };
        } catch (error) {
          console.error('Create Distributor Document API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['DistributorDocuments'],
    }),

    // Delete distributor document
    deleteDistributorDocument: builder.mutation<void, number>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            console.error('❌ [Compliance API] DELETE distributor-documents: No access token found');
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/distributor-documents/${id}/`;
          console.log('🗑️ [Compliance API] DELETE distributor-documents URL:', url);
          console.log('🗑️ [Compliance API] DELETE distributor-documents ID:', id);
          
          let response = await fetch(url, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          console.log('🗑️ [Compliance API] DELETE response status:', response.status, response.statusText);

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🔄 [Compliance API] DELETE: Token expired, refreshing...');
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              console.log('🔄 [Compliance API] DELETE: Retrying with new token');
              response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                },
              });
              console.log('🗑️ [Compliance API] DELETE retry response status:', response.status, response.statusText);
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] DELETE distributor-documents error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to delete document',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          // Try to get response body if available (DELETE might return empty body)
          let responseData;
          try {
            const text = await response.text();
            if (text) {
              responseData = JSON.parse(text);
              console.log('✅ [Compliance API] DELETE distributor-documents response:', responseData);
            } else {
              console.log('✅ [Compliance API] DELETE distributor-documents: Success (empty response body)');
            }
          } catch (e) {
            console.log('✅ [Compliance API] DELETE distributor-documents: Success (no response body to parse)');
          }

          return { data: undefined };
        } catch (error) {
          console.error('❌ [Compliance API] DELETE distributor-documents fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['DistributorDocuments'],
    }),

    // Accept distributor document (sends OTP)
    acceptDocument: builder.mutation<any, number>({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/distributor-documents/${id}/accept/`;
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to accept document',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json().catch(() => ({}));
          return { data: responseData };
        } catch (error) {
          console.error('Accept Document API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['DistributorDocuments'],
    }),

    // Verify document acceptance with OTP
    verifyAcceptance: builder.mutation<
      any,
      { documentId: number; data: { identifier: string; otp_code: string; otp_type: string } }
    >({
      queryFn: async ({ documentId, data }, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/distributor-documents/${documentId}/verify-acceptance/`;
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
              error: {
                status: response.status,
                error: errorData.detail || errorData.message || 'Failed to verify acceptance',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json().catch(() => ({}));
          return { data: responseData };
        } catch (error) {
          console.error('Verify Acceptance API Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['DistributorDocuments'],
    }),

    // Initiate Payment Terms Acceptance (sends OTP)
    initiatePaymentTermsAcceptance: builder.mutation<
      {
        message: string;
        otp_sent: {
          email: boolean;
          sms: boolean;
        };
        terms_id: number;
        terms_version: string;
      },
      number
    >({
      queryFn: async (id, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/payment/${id}/accept/initiate/`;
          
          console.log('📤 [Compliance API] Initiate Payment Terms Acceptance:', {
            url,
            method: 'POST',
            paymentTermsId: id,
          });
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] Initiate Payment Terms Acceptance error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.error || errorData.detail || errorData.message || 'Failed to initiate payment terms acceptance',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] Initiate Payment Terms Acceptance response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] Initiate Payment Terms Acceptance fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['PaymentTerms'],
    }),

    // Verify Payment Terms Acceptance with OTP
    verifyPaymentTermsAcceptance: builder.mutation<
      {
        message: string;
        acceptance: {
          id: number;
          user: number;
          user_username: string;
          user_email: string;
          payment_terms_version: string;
          terms_title: string;
          accepted_at: string;
          ip_address: string;
          user_agent: string;
          otp_verified: boolean;
          otp_identifier: string;
          receipt_pdf_url: string | null;
          created_at: string;
        };
      },
      {
        id: number;
        data: {
          identifier: string;
          otp_code: string;
          otp_type: 'email' | 'mobile';
          generate_pdf?: boolean;
        };
      }
    >({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/payment/${id}/accept/verify/`;
          
          console.log('📤 [Compliance API] Verify Payment Terms Acceptance:', {
            url,
            method: 'POST',
            paymentTermsId: id,
            data,
          });
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] Verify Payment Terms Acceptance error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.non_field_errors?.[0] || errorData.error || errorData.detail || errorData.message || 'Failed to verify payment terms acceptance',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] Verify Payment Terms Acceptance response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] Verify Payment Terms Acceptance fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['PaymentTerms'],
    }),

    // Initiate ASA Terms Acceptance (sends OTP)
    initiateASATermsAcceptance: builder.mutation<
      {
        message: string;
        otp_sent: {
          email: boolean;
          sms: boolean;
        };
        terms_id: number;
        terms_version: string;
      },
      { id: number; checkboxes_verified: boolean }
    >({
      queryFn: async ({ id, checkboxes_verified }, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/asa/${id}/accept/initiate/`;
          
          console.log('📤 [Compliance API] Initiate ASA Terms Acceptance:', {
            url,
            method: 'POST',
            asaTermsId: id,
            checkboxes_verified,
          });
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ checkboxes_verified }),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ checkboxes_verified }),
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] Initiate ASA Terms Acceptance error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.checkboxes_verified?.[0] || errorData.error || errorData.detail || errorData.message || 'Failed to initiate ASA terms acceptance',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] Initiate ASA Terms Acceptance response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] Initiate ASA Terms Acceptance fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['ASATerms'],
    }),

    // Verify ASA Terms Acceptance with OTP
    verifyASATermsAcceptance: builder.mutation<
      {
        message: string;
        acceptance: {
          id: number;
          user: number;
          user_username: string;
          user_email: string;
          terms_version: string;
          terms_title: string;
          accepted_at: string;
          ip_address: string;
          user_agent: string;
          otp_verified: boolean;
          otp_identifier: string;
          agreement_pdf_url: string;
          pdf_hash: string;
          created_at: string;
        };
      },
      {
        id: number;
        data: {
          identifier: string;
          otp_code: string;
          otp_type: 'email' | 'mobile';
        };
      }
    >({
      queryFn: async ({ id, data }, _api, _extraOptions, baseQuery) => {
        try {
          const { accessToken } = getAuthTokens();
          if (!accessToken) {
            return {
              error: {
                status: 'CUSTOM_ERROR' as const,
                error: 'No access token found',
                data: { message: 'No access token found' },
              } as FetchBaseQueryError,
            };
          }

          const url = `${API_BASE_URL}compliance/terms/asa/${id}/accept/verify/`;
          
          console.log('📤 [Compliance API] Verify ASA Terms Acceptance:', {
            url,
            method: 'POST',
            asaTermsId: id,
            data,
          });
          
          let response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              const { accessToken: newToken } = getAuthTokens();
              response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
              });
            }
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [Compliance API] Verify ASA Terms Acceptance error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            return {
              error: {
                status: response.status,
                error: errorData.non_field_errors?.[0] || errorData.error || errorData.detail || errorData.message || 'Failed to verify ASA terms acceptance',
                data: errorData,
              } as FetchBaseQueryError,
            };
          }

          const responseData = await response.json();
          console.log('✅ [Compliance API] Verify ASA Terms Acceptance response:', responseData);
          return { data: responseData };
        } catch (error) {
          console.error('❌ [Compliance API] Verify ASA Terms Acceptance fetch error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: ['ASATerms'],
    }),
  }),
});

export const {
  useGetASATermsQuery,
  useGetPaymentTermsQuery,
  useGetDistributorDocumentsQuery,
  useCreateDistributorDocumentMutation,
  useDeleteDistributorDocumentMutation,
  useAcceptDocumentMutation,
  useVerifyAcceptanceMutation,
  useInitiatePaymentTermsAcceptanceMutation,
  useVerifyPaymentTermsAcceptanceMutation,
  useInitiateASATermsAcceptanceMutation,
  useVerifyASATermsAcceptanceMutation,
} = complianceApi;
