import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User', 'Wallet', 'Binary', 'Booking', 'Payout', 'Staff', 'Growth', 'DistributorApplication', 'PoolWithdrawals', 'PendingNodes', 'BinaryStats', 'PoolBalances', 'NomineeTransfers', 'KYC'],
  endpoints: () => ({}),
});
