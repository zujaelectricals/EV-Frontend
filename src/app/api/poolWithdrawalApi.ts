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

const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'ev_nexus_pool_withdrawal_requests';

// Helper functions for localStorage
function getWithdrawalRequestsFromStorage(): PoolWithdrawalRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WITHDRAWAL_REQUESTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading withdrawal requests from localStorage:', error);
    return [];
  }
}

function saveWithdrawalRequestsToStorage(requests: PoolWithdrawalRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WITHDRAWAL_REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (error) {
    console.error('Error saving withdrawal requests to localStorage:', error);
  }
}

export const poolWithdrawalApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all withdrawal requests (for admin)
    getAllWithdrawalRequests: builder.query<PoolWithdrawalRequest[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const requests = getWithdrawalRequestsFromStorage();
        // Sort by requested date (newest first) - create a copy to avoid mutating frozen array
        const sortedRequests = [...requests].sort((a, b) => 
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
        return { data: sortedRequests };
      },
      providesTags: ['PoolWithdrawals'],
    }),

    // Get withdrawal requests for a specific user
    getUserWithdrawalRequests: builder.query<PoolWithdrawalRequest[], string>({
      queryFn: async (userId: string) => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const allRequests = getWithdrawalRequestsFromStorage();
        const userRequests = allRequests.filter(req => req.userId === userId);
        // Create a copy to avoid mutating frozen array
        const sortedRequests = [...userRequests].sort((a, b) => 
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
        return { data: sortedRequests };
      },
      providesTags: (result, error, userId) => [{ type: 'PoolWithdrawals', id: userId }],
    }),

    // Get emergency withdrawal requests only (for admin)
    getEmergencyWithdrawalRequests: builder.query<PoolWithdrawalRequest[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const allRequests = getWithdrawalRequestsFromStorage();
        const emergencyRequests = allRequests.filter(req => 
          req.reason === 'emergency' || req.emergency === true
        );
        // Sort by priority (high -> medium -> low) then by date (newest first) - create a copy to avoid mutating frozen array
        const sortedRequests = [...emergencyRequests].sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority || 'low'] || 1;
          const bPriority = priorityOrder[b.priority || 'low'] || 1;
          if (bPriority !== aPriority) {
            return bPriority - aPriority;
          }
          return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
        });
        return { data: sortedRequests };
      },
      providesTags: ['PoolWithdrawals'],
    }),

    // Submit a withdrawal request
    submitWithdrawalRequest: builder.mutation<
      { success: boolean; request: PoolWithdrawalRequest },
      Omit<PoolWithdrawalRequest, 'id' | 'status' | 'requestedAt'>
    >({
      queryFn: async (requestData) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Calculate priority for emergency requests
        let priority: 'high' | 'medium' | 'low' = 'low';
        if (requestData.reason === 'emergency' || requestData.emergency) {
          // High priority: amount > 50000 or explicitly marked as emergency
          // Medium priority: amount between 20000-50000
          // Low priority: amount < 20000
          if (requestData.amount > 50000) {
            priority = 'high';
          } else if (requestData.amount > 20000) {
            priority = 'medium';
          }
        }

        const request: PoolWithdrawalRequest = {
          ...requestData,
          id: `withdrawal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          emergency: requestData.reason === 'emergency' || requestData.emergency || false,
          priority: requestData.priority || priority,
        };

        const requests = getWithdrawalRequestsFromStorage();
        // Create a new array to avoid mutating frozen array
        const updatedRequests = [...requests, request];
        saveWithdrawalRequestsToStorage(updatedRequests);

        console.log('Withdrawal request saved:', {
          requestId: request.id,
          totalRequests: updatedRequests.length,
          storageKey: WITHDRAWAL_REQUESTS_STORAGE_KEY,
        });

        return { data: { success: true, request } };
      },
      invalidatesTags: ['PoolWithdrawals'],
    }),

    // Approve withdrawal request (admin only)
    approveWithdrawalRequest: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments?: string }
    >({
      queryFn: async ({ requestId, adminComments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const requests = getWithdrawalRequestsFromStorage();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return {
            error: { status: 'NOT_FOUND', data: 'Withdrawal request not found' },
          };
        }

        const request = requests[requestIndex];
        
        if (request.status !== 'pending') {
          return {
            error: { status: 'BAD_REQUEST', data: `Request is already ${request.status}` },
          };
        }

        // Update request status
        const updatedRequest: PoolWithdrawalRequest = {
          ...request,
          status: 'approved',
          processedAt: new Date().toISOString(),
          processedBy: 'admin-user-id', // In real app, get from auth
          adminComments,
        };

        // Create a new array to avoid mutating frozen array
        const updatedRequests = [
          ...requests.slice(0, requestIndex),
          updatedRequest,
          ...requests.slice(requestIndex + 1),
        ];
        saveWithdrawalRequestsToStorage(updatedRequests);

        // Update user's pool money in localStorage (deduct the amount)
        try {
          const accountsKey = 'ev_nexus_multiple_accounts';
          const storedAccounts = localStorage.getItem(accountsKey);
          if (storedAccounts) {
            const accounts = JSON.parse(storedAccounts);
            const updatedAccounts = accounts.map((acc: any) => {
              if (acc.user && (acc.user.id === request.userId || 
                  acc.user.id?.startsWith(request.userId) || 
                  request.userId.startsWith(acc.user.id))) {
                const currentPoolMoney = acc.user.distributorInfo?.poolMoney || 0;
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    distributorInfo: {
                      ...acc.user.distributorInfo,
                      poolMoney: Math.max(0, currentPoolMoney - request.amount),
                    },
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
          }

          // Also update current auth storage
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData.user && (authData.user.id === request.userId || 
                authData.user.id?.startsWith(request.userId) || 
                request.userId.startsWith(authData.user.id))) {
              const currentPoolMoney = authData.user.distributorInfo?.poolMoney || 0;
              authData.user.distributorInfo = {
                ...authData.user.distributorInfo,
                poolMoney: Math.max(0, currentPoolMoney - request.amount),
              };
              localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
            }
          }
        } catch (error) {
          console.error('Error updating pool money after approval:', error);
        }

        return {
          data: {
            success: true,
            message: `Withdrawal request approved. ₹${request.amount.toLocaleString()} has been processed.`,
          },
        };
      },
      invalidatesTags: ['PoolWithdrawals'],
    }),

    // Reject withdrawal request (admin only)
    rejectWithdrawalRequest: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments: string }
    >({
      queryFn: async ({ requestId, adminComments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const requests = getWithdrawalRequestsFromStorage();
        const requestIndex = requests.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return {
            error: { status: 'NOT_FOUND', data: 'Withdrawal request not found' },
          };
        }

        const request = requests[requestIndex];
        
        if (request.status !== 'pending') {
          return {
            error: { status: 'BAD_REQUEST', data: `Request is already ${request.status}` },
          };
        }

        // Update request status
        const updatedRequest: PoolWithdrawalRequest = {
          ...request,
          status: 'rejected',
          processedAt: new Date().toISOString(),
          processedBy: 'admin-user-id', // In real app, get from auth
          adminComments,
        };

        // Create a new array to avoid mutating frozen array
        const updatedRequests = [
          ...requests.slice(0, requestIndex),
          updatedRequest,
          ...requests.slice(requestIndex + 1),
        ];
        saveWithdrawalRequestsToStorage(updatedRequests);

        // Restore pool money to user (since it was deducted when request was made)
        try {
          const accountsKey = 'ev_nexus_multiple_accounts';
          const storedAccounts = localStorage.getItem(accountsKey);
          if (storedAccounts) {
            const accounts = JSON.parse(storedAccounts);
            const updatedAccounts = accounts.map((acc: any) => {
              if (acc.user && (acc.user.id === request.userId || 
                  acc.user.id?.startsWith(request.userId) || 
                  request.userId.startsWith(acc.user.id))) {
                const currentPoolMoney = acc.user.distributorInfo?.poolMoney || 0;
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    distributorInfo: {
                      ...acc.user.distributorInfo,
                      poolMoney: currentPoolMoney + request.amount, // Restore the amount
                    },
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
          }

          // Also update current auth storage
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData.user && (authData.user.id === request.userId || 
                authData.user.id?.startsWith(request.userId) || 
                request.userId.startsWith(authData.user.id))) {
              const currentPoolMoney = authData.user.distributorInfo?.poolMoney || 0;
              authData.user.distributorInfo = {
                ...authData.user.distributorInfo,
                poolMoney: currentPoolMoney + request.amount, // Restore the amount
              };
              localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
            }
          }
        } catch (error) {
          console.error('Error restoring pool money after rejection:', error);
        }

        return {
          data: {
            success: true,
            message: 'Withdrawal request rejected. Pool money has been restored.',
          },
        };
      },
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

