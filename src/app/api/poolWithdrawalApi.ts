import { api } from './baseApi';

export interface PoolWithdrawalRequest {
  id: string;
  userId: string;
  distributorId: string;
  distributorName: string;
  amount: number;
  reason: 'vehicle_purchase' | 'emergency' | 'pf' | 'resignation' | 'other';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
  adminComments?: string;
  emergency?: boolean; // Flag for emergency withdrawals
  priority?: 'high' | 'medium' | 'low'; // Priority level for emergency requests
}

// Note: Withdrawal requests should be handled by the backend API, not stored in localStorage

export const poolWithdrawalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all withdrawal requests (for admin)
    getAllWithdrawalRequests: builder.query<PoolWithdrawalRequest[], void>({
      query: () => ({
        url: 'pool-withdrawals/',
        method: 'GET',
      }),
      providesTags: ['PoolWithdrawals'],
    }),

    // Get withdrawal requests for a specific user
    getUserWithdrawalRequests: builder.query<PoolWithdrawalRequest[], string>({
      query: (userId) => ({
        url: `pool-withdrawals/user/${userId}/`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'PoolWithdrawals', id: userId }],
    }),

    // Get emergency withdrawal requests only (for admin)
    getEmergencyWithdrawalRequests: builder.query<PoolWithdrawalRequest[], void>({
      query: () => ({
        url: 'pool-withdrawals/emergency/',
        method: 'GET',
      }),
      providesTags: ['PoolWithdrawals'],
    }),

    // Submit a withdrawal request
    submitWithdrawalRequest: builder.mutation<
      { success: boolean; request: PoolWithdrawalRequest },
      Omit<PoolWithdrawalRequest, 'id' | 'status' | 'requestedAt'>
    >({
      query: (body) => ({
        url: 'pool-withdrawals/submit/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PoolWithdrawals'],
    }),

    // Approve withdrawal request (admin only)
    approveWithdrawalRequest: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments?: string }
    >({
      query: ({ requestId, adminComments }) => ({
        url: `pool-withdrawals/${requestId}/approve/`,
        method: 'POST',
        body: { adminComments },
      }),
      invalidatesTags: ['PoolWithdrawals'],
    }),

    // Reject withdrawal request (admin only)
    rejectWithdrawalRequest: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments: string }
    >({
      query: ({ requestId, adminComments }) => ({
        url: `pool-withdrawals/${requestId}/reject/`,
        method: 'POST',
        body: { adminComments },
      }),
      invalidatesTags: ['PoolWithdrawals'],
    }),
  }),
});

export const {
  useGetAllWithdrawalRequestsQuery,
  useGetUserWithdrawalRequestsQuery,
  useGetEmergencyWithdrawalRequestsQuery,
  useSubmitWithdrawalRequestMutation,
  useApproveWithdrawalRequestMutation,
  useRejectWithdrawalRequestMutation,
} = poolWithdrawalApi;

