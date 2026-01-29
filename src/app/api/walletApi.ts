import { api } from './baseApi';
import { getAuthTokens, refreshAccessToken } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface WalletBalance {
  type: 'main' | 'binary' | 'pool' | 'redemption' | 'emi';
  balance: number;
  currency: string;
  locked: number;
  available: number;
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  walletType: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Wallet Transaction API Response Interface
export interface WalletTransaction {
  id: number;
  user_name: string;
  user_email: string;
  wallet: number;
  transaction_type: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  reference_id: number | null;
  reference_type: string | null;
  created_at: string;
  tds_amount: string;
}

export interface WalletTransactionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WalletTransaction[];
}

export interface GetWalletTransactionsParams {
  page?: number;
  page_size?: number;
  user_id?: number;
  transaction_type?: string;
  start_date?: string; // YYYY-MM-DD format
  end_date?: string; // YYYY-MM-DD format
}

const mockWallets: WalletBalance[] = [
  { type: 'main', balance: 125000, currency: 'INR', locked: 5000, available: 120000, lastUpdated: '2024-12-20' },
  { type: 'binary', balance: 45600, currency: 'INR', locked: 0, available: 45600, lastUpdated: '2024-12-20' },
  { type: 'pool', balance: 15000, currency: 'INR', locked: 15000, available: 0, lastUpdated: '2024-12-20' },
  { type: 'redemption', balance: 8500, currency: 'INR', locked: 0, available: 8500, lastUpdated: '2024-12-20' },
  { type: 'emi', balance: 35000, currency: 'INR', locked: 10000, available: 25000, lastUpdated: '2024-12-20' },
];

const mockTransactions: Transaction[] = [
  { id: '1', type: 'credit', amount: 5000, description: 'Binary pair match bonus', walletType: 'binary', status: 'completed', createdAt: '2024-12-20' },
  { id: '2', type: 'debit', amount: 15000, description: 'EV Booking payment', walletType: 'main', status: 'completed', createdAt: '2024-12-19' },
  { id: '3', type: 'credit', amount: 2500, description: 'Pool wallet distribution', walletType: 'pool', status: 'pending', createdAt: '2024-12-18' },
  { id: '4', type: 'credit', amount: 1000, description: 'Redemption bonus', walletType: 'redemption', status: 'completed', createdAt: '2024-12-17' },
  { id: '5', type: 'debit', amount: 5000, description: 'EMI payment', walletType: 'emi', status: 'completed', createdAt: '2024-12-15' },
];

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWallets: builder.query<WalletBalance[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { data: mockWallets };
      },
      providesTags: ['Wallet'],
    }),
    getTransactions: builder.query<Transaction[], { limit?: number }>({
      queryFn: async ({ limit = 10 }) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockTransactions.slice(0, limit) };
      },
    }),
    getWalletTransactions: builder.query<WalletTransactionsResponse, GetWalletTransactionsParams | void>({
      queryFn: async (params) => {
        try {
          const { accessToken } = getAuthTokens();
          const baseUrl = getApiBaseUrl();
          
          // Build query string
          const queryParams = new URLSearchParams();
          if (params && typeof params === 'object') {
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.page_size) queryParams.append('page_size', params.page_size.toString());
            if (params.user_id) queryParams.append('user_id', params.user_id.toString());
            if (params.transaction_type) queryParams.append('transaction_type', params.transaction_type);
            if (params.start_date) queryParams.append('start_date', params.start_date);
            if (params.end_date) queryParams.append('end_date', params.end_date);
          }
          
          const queryString = queryParams.toString();
          const url = `${baseUrl}wallet/transactions/${queryString ? `?${queryString}` : ''}`;
          
          const headers: HeadersInit = {
            'Content-Type': 'application/json',
          };
          
          if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
          }
          
          console.log('📤 [WALLET TRANSACTIONS API] ========================================');
          console.log('📤 [WALLET TRANSACTIONS API] Request URL:', url);
          console.log('📤 [WALLET TRANSACTIONS API] Request Method: GET');
          console.log('📤 [WALLET TRANSACTIONS API] Query Params:', JSON.stringify(params || {}, null, 2));
          console.log('📤 [WALLET TRANSACTIONS API] ========================================');
          
          let response = await fetch(url, {
            method: 'GET',
            headers,
          });
          
          // Handle 401 Unauthorized - try to refresh token
          if (response.status === 401) {
            console.log('🟡 [WALLET TRANSACTIONS API] Access token expired, attempting to refresh...');
            const refreshData = await refreshAccessToken();
            
            if (refreshData) {
              // Retry the request with new token
              const { accessToken } = getAuthTokens();
              if (accessToken) {
                headers['Authorization'] = `Bearer ${accessToken}`;
                console.log('🔄 [WALLET TRANSACTIONS API] Retrying request with new token...');
                response = await fetch(url, {
                  method: 'GET',
                  headers,
                });
              }
            } else {
              // Refresh failed, return 401 error
              const errorData = await response.json().catch(() => ({}));
              return {
                error: {
                  status: response.status,
                  data: errorData,
                } as FetchBaseQueryError,
              };
            }
          }
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ [WALLET TRANSACTIONS API] Error Response:', {
              status: response.status,
              statusText: response.statusText,
              data: errorData,
            });
            return {
              error: {
                status: response.status,
                data: errorData,
              } as FetchBaseQueryError,
            };
          }
          
          const data = await response.json();
          console.log('✅ [WALLET TRANSACTIONS API] Success Response:', data);
          
          return { data };
        } catch (error) {
          console.error('❌ [WALLET TRANSACTIONS API] Error:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const page = queryArgs?.page || 1;
        const page_size = queryArgs?.page_size || 20;
        const user_id = queryArgs?.user_id || '';
        const transaction_type = queryArgs?.transaction_type || '';
        const start_date = queryArgs?.start_date || '';
        const end_date = queryArgs?.end_date || '';
        return `${endpointName}(${JSON.stringify({ page, page_size, user_id, transaction_type, start_date, end_date })})`;
      },
      providesTags: ['Wallet'],
    }),
  }),
});

export const { useGetWalletsQuery, useGetTransactionsQuery, useGetWalletTransactionsQuery } = walletApi;
