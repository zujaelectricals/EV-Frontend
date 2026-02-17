import { api } from './baseApi';
import { API_BASE_URL } from '../../lib/config';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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
  }),
});

export const {
  useGetDistributorDocumentsQuery,
  useCreateDistributorDocumentMutation,
  useDeleteDistributorDocumentMutation,
  useAcceptDocumentMutation,
  useVerifyAcceptanceMutation,
} = complianceApi;
