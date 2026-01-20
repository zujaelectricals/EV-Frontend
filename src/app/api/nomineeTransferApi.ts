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

// Note: Nominee transfers should be handled by the backend API, not stored in localStorage

export const nomineeTransferApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all nominee transfer requests
    getAllNomineeTransfers: builder.query<NomineeTransferRequest[], void>({
      query: () => ({
        url: 'nominee-transfers/',
        method: 'GET',
      }),
      providesTags: ['NomineeTransfers'],
    }),

    // Submit a nominee transfer request
    submitNomineeTransferRequest: builder.mutation<
      { success: boolean; request: NomineeTransferRequest },
      Omit<NomineeTransferRequest, 'id' | 'status' | 'requestedAt'>
    >({
      query: (body) => ({
        url: 'nominee-transfers/submit/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['NomineeTransfers'],
    }),

    // Verify nominee transfer request (admin verifies documents)
    verifyNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; verifiedBy: string; adminComments?: string }
    >({
      query: ({ requestId, verifiedBy, adminComments }) => ({
        url: `nominee-transfers/${requestId}/verify/`,
        method: 'POST',
        body: { verifiedBy, adminComments },
      }),
      invalidatesTags: ['NomineeTransfers'],
    }),

    // Approve and process nominee transfer
    approveNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; nomineeActivated?: boolean; adminComments?: string }
    >({
      query: ({ requestId, nomineeActivated, adminComments }) => ({
        url: `nominee-transfers/${requestId}/approve/`,
        method: 'POST',
        body: { nomineeActivated, adminComments },
      }),
      invalidatesTags: ['NomineeTransfers', 'PoolBalances'],
    }),

    // Reject nominee transfer request
    rejectNomineeTransfer: builder.mutation<
      { success: boolean; message: string },
      { requestId: string; adminComments: string }
    >({
      query: ({ requestId, adminComments }) => ({
        url: `nominee-transfers/${requestId}/reject/`,
        method: 'POST',
        body: { adminComments },
      }),
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

