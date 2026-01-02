import { api } from './baseApi';

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
  }),
});

export const { useGetWalletsQuery, useGetTransactionsQuery } = walletApi;
