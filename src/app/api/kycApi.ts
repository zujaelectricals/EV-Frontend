import { api } from './baseApi';
import { KYCDetails } from '../slices/authSlice';

// Note: KYC data should be handled by the backend API, not stored in localStorage

export interface UploadKYCDocumentsRequest {
  userId: string;
  aadharNumber?: string;
  panNumber?: string;
  documents: {
    aadhar?: string; // base64 or URL
    pan?: string;
    bankStatement?: string;
  };
}

export interface UploadKYCDocumentsResponse {
  success: boolean;
  kycStatus: 'pending';
  message: string;
}

export interface ApproveKYCRequest {
  userId: string;
  verifiedBy: string; // Admin/Staff name
}

export interface RejectKYCRequest {
  userId: string;
  rejectionReason: string;
  rejectedBy: string; // Admin/Staff name
}

export interface KYCStatusResponse {
  userId: string;
  kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  kycDetails?: KYCDetails;
}

export interface PendingKYCUser {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  kycStatus: 'pending';
  kycDetails: KYCDetails;
}

export const kycApi = api.injectEndpoints({
  endpoints: (builder) => ({
    uploadKYCDocuments: builder.mutation<UploadKYCDocumentsResponse, UploadKYCDocumentsRequest>({
      query: (body) => ({
        url: 'kyc/upload/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'KYC'],
    }),
    
    getKYCStatus: builder.query<KYCStatusResponse, string>({
      query: (userId) => ({
        url: `kyc/status/${userId}/`,
        method: 'GET',
      }),
      providesTags: ['User', 'KYC'],
    }),
    
    approveKYC: builder.mutation<{ success: boolean; message: string }, ApproveKYCRequest>({
      query: (body) => ({
        url: 'kyc/approve/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'KYC'],
    }),
    
    rejectKYC: builder.mutation<{ success: boolean; message: string }, RejectKYCRequest>({
      query: (body) => ({
        url: 'kyc/reject/',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User', 'KYC'],
    }),
    
    getPendingKYC: builder.query<PendingKYCUser[], void>({
      query: () => ({
        url: 'kyc/pending/',
        method: 'GET',
      }),
      providesTags: ['User', 'KYC'],
    }),
  }),
});

export const {
  useUploadKYCDocumentsMutation,
  useGetKYCStatusQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  useGetPendingKYCQuery,
} = kycApi;

