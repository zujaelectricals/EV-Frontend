import { api } from './baseApi';

export interface DistributorDocument {
  id: number;
  created_by_username: string;
  acceptance_count: number;
  title: string;
  document_type: 'distributor_terms' | 'payment_terms';
  content: string;
  file: string;
  version: string;
  is_active: boolean;
  is_required: boolean;
  created_at: string;
  updated_at: string;
  effective_from: string;
  effective_until: string | null;
  created_by: number;
}

export interface AcceptDocumentResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export interface VerifyAcceptanceRequest {
  identifier: string;
  otp_code: string;
  otp_type: 'email' | 'mobile';
}

export interface VerifyAcceptanceResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}

export const complianceApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDistributorDocuments: builder.query<DistributorDocument[], void>({
      query: () => 'compliance/distributor-documents/',
      providesTags: ['DistributorApplication'],
    }),
    acceptDocument: builder.mutation<AcceptDocumentResponse, number>({
      query: (documentId) => ({
        url: `compliance/distributor-documents/${documentId}/accept/`,
        method: 'POST',
      }),
      invalidatesTags: ['DistributorApplication'],
    }),
    verifyAcceptance: builder.mutation<VerifyAcceptanceResponse, { documentId: number; data: VerifyAcceptanceRequest }>({
      query: ({ documentId, data }) => ({
        url: `compliance/distributor-documents/${documentId}/verify-acceptance/`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['DistributorApplication'],
    }),
  }),
});

export const {
  useGetDistributorDocumentsQuery,
  useAcceptDocumentMutation,
  useVerifyAcceptanceMutation,
} = complianceApi;

