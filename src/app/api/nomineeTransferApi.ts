import { api } from './baseApi';
import { Nominee } from '@/app/slices/authSlice';

export interface NomineeTransferRequest {
  id: string;
  distributorId: string;
  distributorName: string;
  nomineeId?: string;
  nominee: Nominee;
  poolAmount: number;
  status: 'pending' | 'verified' | 'approved' | 'transferred' | 'rejected';
  deathCertificate?: string; // URL or base64 placeholder
  requestedAt: string;
  verifiedAt?: string;
  transferredAt?: string;
  adminComments?: string;
  nomineeActivated?: boolean; // If nominee chose to continue as distributor
  verifiedBy?: string;
  processedBy?: string;
}

const NOMINEE_TRANSFERS_STORAGE_KEY = 'ev_nexus_nominee_transfers';

// Helper functions for localStorage
function getNomineeTransfersFromStorage(): NomineeTransferRequest[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOMINEE_TRANSFERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading nominee transfers from localStorage:', error);
    return [];
  }
}

function saveNomineeTransfersToStorage(transfers: NomineeTransferRequest[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOMINEE_TRANSFERS_STORAGE_KEY, JSON.stringify(transfers));
  } catch (error) {
    console.error('Error saving nominee transfers to localStorage:', error);
  }
}

export const nomineeTransferApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all nominee transfer requests
    getAllNomineeTransfers: builder.query<NomineeTransferRequest[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        const transfers = getNomineeTransfersFromStorage();
        // Sort by requested date (newest first)
        transfers.sort((a, b) => 
          new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        );
        return { data: transfers };
      },
      providesTags: ['NomineeTransfers'],
    }),

    // Submit a nominee transfer request
    submitNomineeTransferRequest: builder.mutation<
      { success: boolean; request: NomineeTransferRequest },
      Omit<NomineeTransferRequest, 'id' | 'status' | 'requestedAt'>
    >({
      queryFn: async (requestData) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const request: NomineeTransferRequest = {
          ...requestData,
          id: `nominee-transfer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          status: 'pending',
          requestedAt: new Date().toISOString(),
        };

        const transfers = getNomineeTransfersFromStorage();
        transfers.push(request);
        saveNomineeTransfersToStorage(transfers);

        return { data: { success: true, request } };
      },
      invalidatesTags: ['NomineeTransfers'],
    }),

    // Verify nominee transfer request (admin verifies documents)
    verifyNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; verifiedBy: string; adminComments?: string }
    >({
      queryFn: async ({ requestId, verifiedBy, adminComments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const transfers = getNomineeTransfersFromStorage();
        const requestIndex = transfers.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return {
            error: { status: 'NOT_FOUND', data: 'Transfer request not found' },
          };
        }

        const request = transfers[requestIndex];
        
        if (request.status !== 'pending') {
          return {
            error: { status: 'BAD_REQUEST', data: `Request is already ${request.status}` },
          };
        }

        const updatedRequest: NomineeTransferRequest = {
          ...request,
          status: 'verified',
          verifiedAt: new Date().toISOString(),
          verifiedBy,
          adminComments,
        };

        transfers[requestIndex] = updatedRequest;
        saveNomineeTransfersToStorage(transfers);

        return {
          data: {
            success: true,
            message: 'Nominee transfer request verified successfully.',
          },
        };
      },
      invalidatesTags: ['NomineeTransfers'],
    }),

    // Approve and process nominee transfer
    approveNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; nomineeActivated?: boolean; adminComments?: string }
    >({
      queryFn: async ({ requestId, nomineeActivated, adminComments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const transfers = getNomineeTransfersFromStorage();
        const requestIndex = transfers.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return {
            error: { status: 'NOT_FOUND', data: 'Transfer request not found' },
          };
        }

        const request = transfers[requestIndex];
        
        if (request.status !== 'verified') {
          return {
            error: { status: 'BAD_REQUEST', data: 'Request must be verified before approval' },
          };
        }

        // Update request status
        const updatedRequest: NomineeTransferRequest = {
          ...request,
          status: 'transferred',
          transferredAt: new Date().toISOString(),
          processedBy: 'admin-user-id', // In real app, get from auth
          nomineeActivated: nomineeActivated || false,
          adminComments,
        };

        transfers[requestIndex] = updatedRequest;
        saveNomineeTransfersToStorage(transfers);

        // Transfer pool money to nominee (update localStorage)
        try {
          const accountsKey = 'ev_nexus_multiple_accounts';
          const storedAccounts = localStorage.getItem(accountsKey);
          if (storedAccounts) {
            const accounts = JSON.parse(storedAccounts);
            const updatedAccounts = accounts.map((acc: any) => {
              // Find the distributor account and zero out pool money
              if (acc.user && acc.user.id === request.distributorId) {
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    distributorInfo: {
                      ...acc.user.distributorInfo,
                      poolMoney: 0, // Transfer complete, pool money moved
                    },
                  },
                };
              }
              // If nominee is being activated as distributor, create/update their account
              if (nomineeActivated && acc.user && acc.user.email === request.nominee.email) {
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    isDistributor: true,
                    distributorInfo: {
                      ...acc.user.distributorInfo || {},
                      isDistributor: true,
                      isVerified: true,
                      verificationStatus: 'approved',
                      poolMoney: request.poolAmount, // Transfer pool money
                      joinedAt: new Date().toISOString(),
                    },
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
          }

          // Also update current auth storage if it's the distributor
          const authDataStr = localStorage.getItem('ev_nexus_auth_data');
          if (authDataStr) {
            const authData = JSON.parse(authDataStr);
            if (authData.user && authData.user.id === request.distributorId) {
              authData.user.distributorInfo = {
                ...authData.user.distributorInfo,
                poolMoney: 0,
              };
              localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
            }
          }
        } catch (error) {
          console.error('Error transferring pool money:', error);
        }

        return {
          data: {
            success: true,
            message: `Pool money of ₹${request.poolAmount.toLocaleString()} transferred to nominee${nomineeActivated ? ' and nominee activated as distributor' : ''}.`,
          },
        };
      },
      invalidatesTags: ['NomineeTransfers', 'PoolBalances'],
    }),

    // Reject nominee transfer request
    rejectNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments: string }
    >({
      queryFn: async ({ requestId, adminComments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const transfers = getNomineeTransfersFromStorage();
        const requestIndex = transfers.findIndex(req => req.id === requestId);
        
        if (requestIndex === -1) {
          return {
            error: { status: 'NOT_FOUND', data: 'Transfer request not found' },
          };
        }

        const request = transfers[requestIndex];
        
        if (request.status === 'transferred' || request.status === 'rejected') {
          return {
            error: { status: 'BAD_REQUEST', data: `Request is already ${request.status}` },
          };
        }

        const updatedRequest: NomineeTransferRequest = {
          ...request,
          status: 'rejected',
          processedBy: 'admin-user-id', // In real app, get from auth
          adminComments,
        };

        transfers[requestIndex] = updatedRequest;
        saveNomineeTransfersToStorage(transfers);

        return {
          data: {
            success: true,
            message: 'Nominee transfer request rejected.',
          },
        };
      },
      invalidatesTags: ['NomineeTransfers'],
    }),
  }),
});

export const {
  useGetAllNomineeTransfersQuery,
  useSubmitNomineeTransferRequestMutation,
  useVerifyNomineeTransferMutation,
  useApproveNomineeTransferMutation,
  useRejectNomineeTransferMutation,
} = nomineeTransferApi;

