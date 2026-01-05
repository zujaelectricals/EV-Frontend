import { api } from './baseApi';
import { KYCDetails } from '../slices/authSlice';

const KYC_STORAGE_KEY = 'ev_nexus_kyc_data';

// Helper function to get KYC data from localStorage
function getStoredKYC(): Record<string, { userId: string; kycDetails: KYCDetails; kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected' }> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(KYC_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading KYC data from localStorage:', error);
    return {};
  }
}

// Helper function to save KYC data to localStorage
function setStoredKYC(data: Record<string, { userId: string; kycDetails: KYCDetails; kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected' }>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving KYC data to localStorage:', error);
  }
}

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
      queryFn: async ({ userId, aadharNumber, panNumber, documents }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const kycData = getStoredKYC();
        const submittedAt = new Date().toISOString();
        
        kycData[userId] = {
          userId,
          kycStatus: 'pending',
          kycDetails: {
            aadharNumber,
            panNumber,
            documents,
            submittedAt,
          },
        };
        
        setStoredKYC(kycData);
        
        return {
          data: {
            success: true,
            kycStatus: 'pending',
            message: 'KYC documents uploaded successfully. Pending verification.',
          },
        };
      },
      invalidatesTags: ['User'],
    }),
    
    getKYCStatus: builder.query<KYCStatusResponse, string>({
      queryFn: async (userId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const kycData = getStoredKYC();
        const userKYC = kycData[userId];
        
        if (userKYC) {
          return {
            data: {
              userId,
              kycStatus: userKYC.kycStatus,
              kycDetails: userKYC.kycDetails,
            },
          };
        }
        
        return {
          data: {
            userId,
            kycStatus: 'not_submitted',
          },
        };
      },
      providesTags: ['User', 'KYC'],
    }),
    
    approveKYC: builder.mutation<{ success: boolean; message: string }, ApproveKYCRequest>({
      queryFn: async ({ userId, verifiedBy }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const kycData = getStoredKYC();
        const userKYC = kycData[userId];
        
        if (!userKYC) {
          return {
            error: {
              status: 'NOT_FOUND',
              data: 'KYC not found for this user',
            },
          };
        }
        
        userKYC.kycStatus = 'verified';
        userKYC.kycDetails = {
          ...userKYC.kycDetails,
          verifiedAt: new Date().toISOString(),
          verifiedBy,
        };
        
        setStoredKYC(kycData);
        
        // Update user's auth state in localStorage for all stored auth sessions
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            if (authData.user && authData.user.id === userId) {
              authData.user.kycStatus = 'verified';
              authData.user.kycDetails = userKYC.kycDetails;
              localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
            }
          } catch (e) {
            console.error('Error updating auth data:', e);
          }
        }
        
        // Also check for multiple accounts storage
        const multipleAccountsKey = 'ev_nexus_multiple_accounts';
        const multipleAccountsStr = localStorage.getItem(multipleAccountsKey);
        if (multipleAccountsStr) {
          try {
            const multipleAccounts = JSON.parse(multipleAccountsStr);
            const updatedAccounts = multipleAccounts.map((acc: any) => {
              if (acc.user && acc.user.id === userId) {
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    kycStatus: 'verified',
                    kycDetails: userKYC.kycDetails,
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(multipleAccountsKey, JSON.stringify(updatedAccounts));
          } catch (e) {
            console.error('Error updating multiple accounts:', e);
          }
        }
        
        return {
          data: {
            success: true,
            message: 'KYC approved successfully',
          },
        };
      },
      invalidatesTags: ['User', 'KYC'],
    }),
    
    rejectKYC: builder.mutation<{ success: boolean; message: string }, RejectKYCRequest>({
      queryFn: async ({ userId, rejectionReason, rejectedBy }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        const kycData = getStoredKYC();
        const userKYC = kycData[userId];
        
        if (!userKYC) {
          return {
            error: {
              status: 'NOT_FOUND',
              data: 'KYC not found for this user',
            },
          };
        }
        
        userKYC.kycStatus = 'rejected';
        userKYC.kycDetails = {
          ...userKYC.kycDetails,
          rejectedAt: new Date().toISOString(),
          rejectionReason,
          verifiedBy: rejectedBy,
        };
        
        setStoredKYC(kycData);
        
        // Update user's auth state in localStorage for all stored auth sessions
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        if (authDataStr) {
          try {
            const authData = JSON.parse(authDataStr);
            if (authData.user && authData.user.id === userId) {
              authData.user.kycStatus = 'rejected';
              authData.user.kycDetails = userKYC.kycDetails;
              localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
            }
          } catch (e) {
            console.error('Error updating auth data:', e);
          }
        }
        
        // Also check for multiple accounts storage
        const multipleAccountsKey = 'ev_nexus_multiple_accounts';
        const multipleAccountsStr = localStorage.getItem(multipleAccountsKey);
        if (multipleAccountsStr) {
          try {
            const multipleAccounts = JSON.parse(multipleAccountsStr);
            const updatedAccounts = multipleAccounts.map((acc: any) => {
              if (acc.user && acc.user.id === userId) {
                return {
                  ...acc,
                  user: {
                    ...acc.user,
                    kycStatus: 'rejected',
                    kycDetails: userKYC.kycDetails,
                  },
                };
              }
              return acc;
            });
            localStorage.setItem(multipleAccountsKey, JSON.stringify(updatedAccounts));
          } catch (e) {
            console.error('Error updating multiple accounts:', e);
          }
        }
        
        return {
          data: {
            success: true,
            message: 'KYC rejected successfully',
          },
        };
      },
      invalidatesTags: ['User', 'KYC'],
    }),
    
    getPendingKYC: builder.query<PendingKYCUser[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        const kycData = getStoredKYC();
        const pendingUsers: PendingKYCUser[] = [];
        
        // Get auth data to get user names
        const authDataStr = localStorage.getItem('ev_nexus_auth_data');
        let authData: any = null;
        if (authDataStr) {
          try {
            authData = JSON.parse(authDataStr);
          } catch (e) {
            console.error('Error parsing auth data:', e);
          }
        }
        
        // Get all users from localStorage
        const usersKey = 'ev_nexus_users';
        const storedUsers = localStorage.getItem(usersKey);
        let allUsers: any[] = [];
        if (storedUsers) {
          try {
            allUsers = JSON.parse(storedUsers);
          } catch (e) {
            console.error('Error parsing users:', e);
          }
        }
        
        Object.values(kycData).forEach((kyc) => {
          if (kyc.kycStatus === 'pending') {
            // Try to find user info
            let userName = 'Unknown User';
            let userEmail = '';
            let userPhone = '';
            
            // Check current auth
            if (authData?.user?.id === kyc.userId) {
              userName = authData.user.name || 'Unknown User';
              userEmail = authData.user.email || '';
              userPhone = authData.user.phone || '';
            } else {
              // Check stored users
              const user = allUsers.find((u: any) => u.id === kyc.userId);
              if (user) {
                userName = user.name || 'Unknown User';
                userEmail = user.email || '';
                userPhone = user.phone || '';
              }
            }
            
            pendingUsers.push({
              userId: kyc.userId,
              name: userName,
              email: userEmail,
              phone: userPhone,
              kycStatus: 'pending',
              kycDetails: kyc.kycDetails,
            });
          }
        });
        
        return {
          data: pendingUsers,
        };
      },
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

