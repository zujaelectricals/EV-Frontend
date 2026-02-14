import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { API_BASE_URL } from '../../lib/config';

// Payout response interface
export interface PayoutResponse {
  id: number;
  requested_amount: string;
  tds_amount: string;
  net_amount: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  bank_details?: BankDetails[];
  emi_auto_filled: boolean;
  emi_amount: string;
  created_at: string;
  processed_at: string | null;
  completed_at: string | null;
  transaction_id: string | null;
  rejection_reason: string;
  notes: string;
  reason?: string;
  user_email: string;
  wallet_balance: string;
  user?: number;
  wallet?: number;
}

// Withdrawal history item interface
export interface WithdrawalHistoryItem {
  id: number;
  requested_amount: string;
  tds_amount: string;
  net_amount: string;
  status: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  created_at: string;
  completed_at: string;
  transaction_id: string;
}

// Wallet summary interface
export interface WalletSummary {
  current_balance: string;
  total_earned: string;
  total_withdrawn: string;
}

// Bank details interface
export interface BankDetails {
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
}

// Payouts paginated response
export interface PayoutsPaginatedResponse {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
  results: PayoutResponse[];
}

// Complete payouts list response interface
export interface PayoutsListResponse {
  wallet_summary: WalletSummary;
  bank_details: BankDetails[];
  withdrawal_history: WithdrawalHistoryItem[];
  payouts: PayoutsPaginatedResponse;
}

export interface GetPayoutsParams {
  status?: 'pending' | 'processing' | 'completed' | 'rejected' | 'cancelled';
  date_from?: string; // YYYY-MM-DD format
  date_to?: string; // YYYY-MM-DD format
  period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'last_year' | 'all_time';
  page?: number;
  page_size?: number;
}

// Create payout request interface
export interface CreatePayoutRequest {
  requested_amount: number;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  emi_auto_filled?: boolean;
  reason?: string;
}

// Create payout response interface
export interface CreatePayoutResponse {
  id: number;
  requested_amount: string;
  tds_amount: string;
  net_amount: string;
  status: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  account_holder_name: string;
  created_at: string;
  message?: string;
}

export const payoutApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPayout: builder.mutation<CreatePayoutResponse, CreatePayoutRequest>({
      queryFn: async (payoutData) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}payout/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const requestBodyString = JSON.stringify(payoutData);
          console.log('📤 [CREATE PAYOUT API] ========================================');
          console.log('📤 [CREATE PAYOUT API] Request URL:', url);
          console.log('📤 [CREATE PAYOUT API] Request Method: POST');
          console.log('📤 [CREATE PAYOUT API] Request Body (Formatted):', JSON.stringify(payoutData, null, 2));
          console.log('📤 [CREATE PAYOUT API] Request Body (Raw String):', requestBodyString);
          console.log('📤 [CREATE PAYOUT API] Request Headers:', headers);
          console.log('📤 [CREATE PAYOUT API] ========================================');
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          console.log('📥 [CREATE PAYOUT API] Response Status:', response.status);
          console.log('📥 [CREATE PAYOUT API] Response Status Text:', response.statusText);
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [CREATE PAYOUT API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [CREATE PAYOUT API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [CREATE PAYOUT API] ========================================');
            console.error('❌ [CREATE PAYOUT API] Error Response Status:', response.status);
            console.error('❌ [CREATE PAYOUT API] Error Response Status Text:', response.statusText);
            console.error('❌ [CREATE PAYOUT API] Error Response Data (Formatted):', JSON.stringify(errorData, null, 2));
            console.error('❌ [CREATE PAYOUT API] Error Response Data (Raw):', errorData);
            console.error('❌ [CREATE PAYOUT API] ========================================');
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [CREATE PAYOUT API] ========================================');
          console.log('✅ [CREATE PAYOUT API] Success Response (Formatted):', JSON.stringify(data, null, 2));
          console.log('✅ [CREATE PAYOUT API] Success Response (Raw):', data);
          console.log('✅ [CREATE PAYOUT API] Response Status:', response.status);
          console.log('✅ [CREATE PAYOUT API] ========================================');
          
          return { data };
        } catch (error) {
          console.error('❌ [CREATE PAYOUT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: [
        { type: 'Payout', id: 'LIST' },
        { type: 'Payout', id: 'LIST-all' },
        { type: 'Payout', id: 'LIST-pending' },
        { type: 'Payout', id: 'LIST-completed' },
      ],
    }),
    getPayouts: builder.query<PayoutsListResponse, GetPayoutsParams | void>({
      queryFn: async (params) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          
          // Build query string
          const queryParams = new URLSearchParams();
          if (params && typeof params === 'object') {
            if (params.status) queryParams.append('status', params.status);
            if (params.date_from) queryParams.append('date_from', params.date_from);
            if (params.date_to) queryParams.append('date_to', params.date_to);
            if (params.period) queryParams.append('period', params.period);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.page_size) queryParams.append('page_size', params.page_size.toString());
          }
          
          const queryString = queryParams.toString();
          const url = `${baseUrl}payout/${queryString ? `?${queryString}` : ''}`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          // Console log the request
          console.log('📤 [PAYOUTS LIST API] ========================================');
          console.log('📤 [PAYOUTS LIST API] Request URL:', url);
          console.log('📤 [PAYOUTS LIST API] Request Method: GET');
          console.log('📤 [PAYOUTS LIST API] Query Params (Object):', JSON.stringify(params || {}, null, 2));
          console.log('📤 [PAYOUTS LIST API] Query String:', queryString || '(none)');
          console.log('📤 [PAYOUTS LIST API] Request Headers:', JSON.stringify(headers, null, 2));
          console.log('📤 [PAYOUTS LIST API] Request Body: (GET request - no body)');
          console.log('📤 [PAYOUTS LIST API] ========================================');
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [PAYOUTS LIST API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [PAYOUTS LIST API] Retrying request with new token...');
                // Rebuild URL with query params for retry
                const retryUrl = `${baseUrl}payout/${queryString ? `?${queryString}` : ''}`;
                response = await fetch(retryUrl, {
                  method: 'GET',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error (logout handled in refreshAccessToken)
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [PAYOUTS LIST API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('📥 [PAYOUTS LIST API] ========================================');
          console.log('📥 [PAYOUTS LIST API] Response Status:', response.status);
          console.log('📥 [PAYOUTS LIST API] Response Status Text:', response.statusText);
          console.log('📥 [PAYOUTS LIST API] Success Response (Formatted):', JSON.stringify(data, null, 2));
          console.log('📥 [PAYOUTS LIST API] Success Response (Raw):', data);
          console.log('📥 [PAYOUTS LIST API] ========================================');
          
          return { data };
        } catch (error) {
          console.error('❌ [PAYOUTS LIST API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      // Serialize query params for proper caching
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const status = queryArgs?.status || 'all';
        const page = queryArgs?.page || 1;
        const page_size = queryArgs?.page_size || 20;
        const period = queryArgs?.period || 'all_time';
        const date_from = queryArgs?.date_from || '';
        const date_to = queryArgs?.date_to || '';
        return `${endpointName}(${JSON.stringify({ status, page, page_size, period, date_from, date_to })})`;
      },
      // Provide cache tags
      providesTags: (result, error, queryArgs) => {
        const status = queryArgs?.status || 'all';
        const tags: Array<{ type: 'Payout'; id: string | number }> = [
          { type: 'Payout', id: 'LIST' },
          { type: 'Payout', id: `LIST-${status}` },
        ];
        
        // Add individual payout tags if results exist
        if (result?.payouts?.results) {
          tags.push(
            ...result.payouts.results.map((payout) => ({
              type: 'Payout' as const,
              id: payout.id,
            }))
          );
        }
        
        return tags;
      },
    }),
    processPayout: builder.mutation<PayoutResponse, { id: number; notes?: string }>({
      queryFn: async ({ id, notes }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}payout/${id}/process/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const requestBody = notes ? { notes } : {};
          const requestBodyString = JSON.stringify(requestBody);
          
          console.log('📤 [PROCESS PAYOUT API] ========================================');
          console.log('📤 [PROCESS PAYOUT API] Request URL:', url);
          console.log('📤 [PROCESS PAYOUT API] Request Method: POST');
          console.log('📤 [PROCESS PAYOUT API] Payout ID:', id);
          console.log('📤 [PROCESS PAYOUT API] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
          console.log('📤 [PROCESS PAYOUT API] Request Body (Raw String):', requestBodyString);
          console.log('📤 [PROCESS PAYOUT API] Request Headers:', headers);
          console.log('📤 [PROCESS PAYOUT API] ========================================');
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          console.log('📥 [PROCESS PAYOUT API] Response Status:', response.status);
          console.log('📥 [PROCESS PAYOUT API] Response Status Text:', response.statusText);
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [PROCESS PAYOUT API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [PROCESS PAYOUT API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [PROCESS PAYOUT API] ========================================');
            console.error('❌ [PROCESS PAYOUT API] Error Response Status:', response.status);
            console.error('❌ [PROCESS PAYOUT API] Error Response Status Text:', response.statusText);
            console.error('❌ [PROCESS PAYOUT API] Error Response Data (Formatted):', JSON.stringify(errorData, null, 2));
            console.error('❌ [PROCESS PAYOUT API] Error Response Data (Raw):', errorData);
            console.error('❌ [PROCESS PAYOUT API] ========================================');
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [PROCESS PAYOUT API] ========================================');
          console.log('✅ [PROCESS PAYOUT API] Success Response (Formatted):', JSON.stringify(data, null, 2));
          console.log('✅ [PROCESS PAYOUT API] Success Response (Raw):', data);
          console.log('✅ [PROCESS PAYOUT API] Response Status:', response.status);
          console.log('✅ [PROCESS PAYOUT API] ========================================');
          
          return { data };
        } catch (error) {
          console.error('❌ [PROCESS PAYOUT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payout', id },
        { type: 'Payout', id: 'LIST' },
        { type: 'Payout', id: 'LIST-pending' },
        { type: 'Payout', id: 'LIST-processing' },
      ],
    }),
    completePayout: builder.mutation<PayoutResponse, { id: number; transaction_id?: string; notes?: string }>({
      queryFn: async ({ id, transaction_id, notes }) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          const url = `${baseUrl}payout/${id}/complete/`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          const requestBody: { transaction_id?: string; notes?: string } = {};
          if (transaction_id) requestBody.transaction_id = transaction_id;
          if (notes) requestBody.notes = notes;
          
          const requestBodyString = JSON.stringify(requestBody);
          
          console.log('📤 [COMPLETE PAYOUT API] ========================================');
          console.log('📤 [COMPLETE PAYOUT API] Request URL:', url);
          console.log('📤 [COMPLETE PAYOUT API] Request Method: POST');
          console.log('📤 [COMPLETE PAYOUT API] Payout ID:', id);
          console.log('📤 [COMPLETE PAYOUT API] Request Body (Formatted):', JSON.stringify(requestBody, null, 2));
          console.log('📤 [COMPLETE PAYOUT API] Request Body (Raw String):', requestBodyString);
          console.log('📤 [COMPLETE PAYOUT API] Request Headers:', headers);
          console.log('📤 [COMPLETE PAYOUT API] ========================================');
          
          let response = await fetch(url, {
            method: 'POST',
            headers,
            body: requestBodyString,
          });
          
          console.log('📥 [COMPLETE PAYOUT API] Response Status:', response.status);
          console.log('📥 [COMPLETE PAYOUT API] Response Status Text:', response.statusText);
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [COMPLETE PAYOUT API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [COMPLETE PAYOUT API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'POST',
                  headers,
                  body: requestBodyString,
                });
              }
            } else {
              // Refresh failed, return 401 error
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                },
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [COMPLETE PAYOUT API] ========================================');
            console.error('❌ [COMPLETE PAYOUT API] Error Response Status:', response.status);
            console.error('❌ [COMPLETE PAYOUT API] Error Response Status Text:', response.statusText);
            console.error('❌ [COMPLETE PAYOUT API] Error Response Data (Formatted):', JSON.stringify(errorData, null, 2));
            console.error('❌ [COMPLETE PAYOUT API] Error Response Data (Raw):', errorData);
            console.error('❌ [COMPLETE PAYOUT API] ========================================');
            return {
              error: {
                status: response.status,
                data: errorData,
              },
            };
          }
          
          const data = await response.json();
          console.log('✅ [COMPLETE PAYOUT API] ========================================');
          console.log('✅ [COMPLETE PAYOUT API] Success Response (Formatted):', JSON.stringify(data, null, 2));
          console.log('✅ [COMPLETE PAYOUT API] Success Response (Raw):', data);
          console.log('✅ [COMPLETE PAYOUT API] Response Status:', response.status);
          console.log('✅ [COMPLETE PAYOUT API] ========================================');
          
          return { data };
        } catch (error) {
          console.error('❌ [COMPLETE PAYOUT API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            },
          };
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payout', id },
        { type: 'Payout', id: 'LIST' },
        { type: 'Payout', id: 'LIST-processing' },
        { type: 'Payout', id: 'LIST-completed' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const { 
  useGetPayoutsQuery,
  useCreatePayoutMutation,
  useProcessPayoutMutation,
  useCompletePayoutMutation
} = payoutApi;

