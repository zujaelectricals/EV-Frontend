import { api } from './baseApi';
import { getAuthTokens } from './baseApi';
import { getApiBaseUrl } from '../../lib/config';
import { User, DistributorInfo } from '../slices/authSlice';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface DistributorApplicationData {
  // Vehicle Selection Details
  vehicleImage: File | null;
  vehicleModel: string;
  vehicleMRP: string;
  bookingOrderNo: string;
  
  // Payment Mode
  paymentMode: 'full' | 'installment';
  
  // Payment Details
  advancePaid: string;
  balanceAmount: string;
  installmentMode: 'monthly' | 'weekly';
  installmentAmount: string;
  
  // Distributor Incentive Consent
  incentiveConsent: boolean;
  
  // Declaration
  declarationAccepted: boolean;
  
  // Refund Policy
  refundPolicyAccepted: boolean;
  
  // Applicant Details
  applicantName: string;
  mobileNumber: string;
  date: string;
  place: string;
  
  // User ID
  userId?: string;
}

export interface DistributorApplication {
  id: string;
  userId: string;
  applicationData: DistributorApplicationData;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
}

// New API response format from users/distributor-application/
export interface DistributorApplicationResponse {
  id: number;
  user_email: string;
  user_username: string;
  user_full_name: string;
  reviewed_by: number | null;
  is_distributor_terms_and_conditions_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected';
  company_name: string | null;
  business_registration_number: string | null;
  tax_id: string | null;
  years_in_business: number | null;
  previous_distribution_experience: string | null;
  product_interest: string | null;
  reference_name: string | null;
  reference_contact: string | null;
  reference_relationship: string | null;
  business_license: string | null;
  tax_documents: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string;
  user: number;
}

// Mock storage for applications (in real app, this would be in a database)
let mockApplications: DistributorApplication[] = [];

export const distributorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // New API endpoint: POST users/distributor-application/
    submitDistributorApplicationNew: builder.mutation<
      DistributorApplicationResponse,
      { is_distributor_terms_and_conditions_accepted: boolean }
    >({
      queryFn: async (body) => {
        const { accessToken } = getAuthTokens();
        
        if (!accessToken) {
          return {
            error: {
              status: 'UNAUTHORIZED' as const,
              error: 'No access token found',
            },
          };
        }

        try {
          // Create FormData for multipart/form-data
          const formData = new FormData();
          formData.append('is_distributor_terms_and_conditions_accepted', 
            body.is_distributor_terms_and_conditions_accepted.toString()
          );

          const response = await fetch(`${getApiBaseUrl()}users/distributor-application/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              // Don't set Content-Type - browser will set it with boundary for multipart/form-data
            },
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Failed to submit distributor application' }));
            return {
              error: {
                status: response.status,
                data: error,
              } as FetchBaseQueryError,
            };
          }

          const data: DistributorApplicationResponse = await response.json();
          return { data };
        } catch (error) {
          return {
            error: {
              status: 'FETCH_ERROR' as const,
              error: String(error),
            } as FetchBaseQueryError,
          };
        }
      },
      invalidatesTags: ['User', 'DistributorApplication'],
    }),

    submitDistributorApplication: builder.mutation<
      { success: boolean; application: DistributorApplication },
      DistributorApplicationData
    >({
      queryFn: async (applicationData) => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        // Convert files to base64 for mock storage (in real app, upload to cloud storage)
        const vehicleImageBase64 = applicationData.vehicleImage 
          ? await fileToBase64(applicationData.vehicleImage)
          : null;

        // Get userId from applicationData or generate one
        const userId = applicationData.userId || `user-${Date.now()}`;
        
        const application: DistributorApplication = {
          id: `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId,
          applicationData: {
            ...applicationData,
            vehicleImage: vehicleImageBase64 as any, // Store as base64 string
          },
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };

        mockApplications.push(application);
        
        // Store in localStorage for persistence (without base64 images to save space)
        // Create a version without base64 images for storage
        const storageApplications = mockApplications.map(app => ({
          ...app,
          applicationData: {
            ...app.applicationData,
            // Replace base64 strings with placeholders to save space
            vehicleImage: (app.applicationData.vehicleImage && typeof app.applicationData.vehicleImage === 'string' && app.applicationData.vehicleImage.startsWith('data:')) 
              ? '[IMAGE_STORED]' 
              : app.applicationData.vehicleImage,
          },
        }));
        
        const storageResult = safeLocalStorageSet('distributor_applications', JSON.stringify(storageApplications));
        if (!storageResult.success) {
          console.warn('Failed to save to localStorage:', storageResult.error);
          // Still return success since the application is in memory
          // In production, this would be handled by the backend
        }

        return {
          data: {
            success: true,
            application,
          },
        };
      },
      invalidatesTags: ['DistributorApplication'],
    }),

    getDistributorApplication: builder.query<DistributorApplication | null, string>({
      queryFn: async (userId) => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Load from localStorage (only if not already in memory)
        if (mockApplications.length === 0) {
          const stored = localStorage.getItem('distributor_applications');
          if (stored) {
            try {
              mockApplications = JSON.parse(stored);
            } catch (e) {
              console.error('Error parsing stored applications:', e);
              mockApplications = [];
            }
          }
        }
        
        // Find application by userId (exact match or starts with)
        const application = mockApplications.find(app => 
          app.userId === userId || app.userId?.startsWith(userId) || userId.startsWith(app.userId || '')
        );
        return { data: application || null };
      },
      providesTags: ['DistributorApplication'],
    }),

    getAllDistributorApplications: builder.query<DistributorApplication[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // Load from localStorage (only if not already in memory)
        if (mockApplications.length === 0) {
          const stored = localStorage.getItem('distributor_applications');
          if (stored) {
            try {
              mockApplications = JSON.parse(stored);
            } catch (e) {
              console.error('Error parsing stored applications:', e);
              mockApplications = [];
            }
          }
        }
        
        return { data: mockApplications };
      },
      providesTags: ['DistributorApplication'],
    }),

    approveDistributorApplication: builder.mutation<
      { success: boolean; application: DistributorApplication },
      { applicationId: string; comments?: string }
    >({
      queryFn: async ({ applicationId, comments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Load from localStorage (only if not already in memory)
        if (mockApplications.length === 0) {
          const stored = localStorage.getItem('distributor_applications');
          if (stored) {
            try {
              mockApplications = JSON.parse(stored);
            } catch (e) {
              console.error('Error parsing stored applications:', e);
              mockApplications = [];
            }
          }
        }
        
        const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
        if (applicationIndex === -1) {
          return { error: { status: 404, data: 'Application not found' } };
        }

        // Create a new application object instead of mutating the existing one
        const application = mockApplications[applicationIndex];
        const updatedApplication: DistributorApplication = {
          ...application,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'admin-user-id',
          comments: comments,
        };

        // Create a new array with the updated application instead of mutating the existing array
        mockApplications = [
          ...mockApplications.slice(0, applicationIndex),
          updatedApplication,
          ...mockApplications.slice(applicationIndex + 1)
        ];

        // Save back to localStorage (without base64 images)
        const storageApplications = mockApplications.map(app => ({
          ...app,
          applicationData: {
            ...app.applicationData,
            // Replace base64 strings with placeholders to save space
            vehicleImage: (app.applicationData.vehicleImage && typeof app.applicationData.vehicleImage === 'string' && app.applicationData.vehicleImage.startsWith('data:')) 
              ? '[IMAGE_STORED]' 
              : app.applicationData.vehicleImage,
          },
        }));
        
        const storageResult = safeLocalStorageSet('distributor_applications', JSON.stringify(storageApplications));
        if (!storageResult.success) {
          console.warn('Failed to save to localStorage:', storageResult.error);
        }

        // Update user's distributor status in localStorage (in real app, this would be done via backend)
        // This is a mock implementation - in production, the backend would update the user record
        // Find the user by userId from the application
        const userId = updatedApplication.userId;
        if (userId) {
          try {
            // First, update the profile switcher's stored accounts
            // This is critical because the user might not be currently logged in when staff approves
            const accountsKey = 'ev_nexus_multiple_accounts';
            const storedAccounts = localStorage.getItem(accountsKey);
            let foundUser: any = null;
            
            if (storedAccounts) {
              try {
                const accounts = JSON.parse(storedAccounts);
                const updatedAccounts = accounts.map((acc: any) => {
                  // Multiple matching strategies to find the user
                  const idMatches = acc.user && (
                    acc.user.id === userId || 
                    acc.user.id?.startsWith(userId) || 
                    userId.startsWith(acc.user.id) ||
                    acc.user.id?.includes(userId) ||
                    userId.includes(acc.user.id)
                  );
                  
                  // Also try matching by email or mobile number from application
                  const emailMatches = acc.user && updatedApplication.applicationData.mobileNumber &&
                    (acc.user.email === updatedApplication.applicationData.mobileNumber ||
                     acc.user.phone === updatedApplication.applicationData.mobileNumber);
                  
                  if (acc.user && (idMatches || emailMatches)) {
                    console.log('Found matching user for approval:', {
                      userId,
                      accountUserId: acc.user.id,
                      accountEmail: acc.user.email,
                      applicationMobile: updatedApplication.applicationData.mobileNumber
                    });
                    // Update the user's distributor status
                    const updatedUser = {
                      ...acc.user,
                      isDistributor: true,
                      distributorInfo: acc.user.distributorInfo ? {
                        ...acc.user.distributorInfo,
                        isDistributor: true,
                        isVerified: true,
                        verificationStatus: 'approved',
                      } : {
                        isDistributor: true,
                        isVerified: true,
                        verificationStatus: 'approved',
                        referralCode: `REF${userId.slice(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                        leftCount: 0,
                        rightCount: 0,
                        totalReferrals: 0,
                        binaryActivated: false,
                        poolMoney: 0,
                        joinedAt: updatedApplication.submittedAt,
                      },
                    };
                    
                    foundUser = updatedUser;
                    
                    return {
                      ...acc,
                      user: updatedUser,
                      lastUsed: new Date().toISOString(),
                    };
                  }
                  return acc;
                });
                
                if (foundUser) {
                  localStorage.setItem(accountsKey, JSON.stringify(updatedAccounts));
                }
              } catch (accountError) {
                console.warn('Could not update profile switcher accounts:', accountError);
              }
            }
            
            // Also update the current auth storage if this user is currently logged in
            const authDataStr = localStorage.getItem('ev_nexus_auth_data');
            if (authDataStr) {
              const authData = JSON.parse(authDataStr);
              if (authData.user && (authData.user.id === userId || authData.user.id?.startsWith(userId) || userId.startsWith(authData.user.id))) {
                // Update the user's distributor status
                authData.user.isDistributor = true;
                if (!authData.user.distributorInfo) {
                  // Initialize distributorInfo if it doesn't exist
                  authData.user.distributorInfo = {
                    isDistributor: true,
                    isVerified: true,
                    verificationStatus: 'approved',
                    referralCode: `REF${userId.slice(0, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                    leftCount: 0,
                    rightCount: 0,
                    totalReferrals: 0,
                    binaryActivated: false,
                    activationBonusCredited: false,
                    totalCommissionEarned: 0,
                    pairsBeyondLimit: 0,
                    pairsAtActivation: 0,
                    poolMoney: 0,
                    joinedAt: updatedApplication.submittedAt,
                  };
                } else {
                  // Update existing distributorInfo
                  authData.user.distributorInfo.isDistributor = true;
                  authData.user.distributorInfo.isVerified = true;
                  authData.user.distributorInfo.verificationStatus = 'approved';
                }
                localStorage.setItem('ev_nexus_auth_data', JSON.stringify(authData));
              }
            }
          } catch (e) {
            console.error('Error updating user status:', e);
          }
        }

        return {
          data: {
            success: true,
            application: updatedApplication,
          },
        };
      },
      invalidatesTags: ['DistributorApplication'],
    }),

    rejectDistributorApplication: builder.mutation<
      { success: boolean; application: DistributorApplication },
      { applicationId: string; comments: string }
    >({
      queryFn: async ({ applicationId, comments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Load from localStorage (only if not already in memory)
        if (mockApplications.length === 0) {
          const stored = localStorage.getItem('distributor_applications');
          if (stored) {
            try {
              mockApplications = JSON.parse(stored);
            } catch (e) {
              console.error('Error parsing stored applications:', e);
              mockApplications = [];
            }
          }
        }
        
        const applicationIndex = mockApplications.findIndex(app => app.id === applicationId);
        if (applicationIndex === -1) {
          return { error: { status: 404, data: 'Application not found' } };
        }

        // Create a new application object instead of mutating the existing one
        const application = mockApplications[applicationIndex];
        const updatedApplication: DistributorApplication = {
          ...application,
          status: 'rejected',
          reviewedAt: new Date().toISOString(),
          reviewedBy: 'admin-user-id',
          comments: comments,
        };

        // Create a new array with the updated application instead of mutating the existing array
        mockApplications = [
          ...mockApplications.slice(0, applicationIndex),
          updatedApplication,
          ...mockApplications.slice(applicationIndex + 1)
        ];

        // Save back to localStorage (without base64 images)
        const storageApplications = mockApplications.map(app => ({
          ...app,
          applicationData: {
            ...app.applicationData,
            // Replace base64 strings with placeholders to save space
            vehicleImage: (app.applicationData.vehicleImage && typeof app.applicationData.vehicleImage === 'string' && app.applicationData.vehicleImage.startsWith('data:')) 
              ? '[IMAGE_STORED]' 
              : app.applicationData.vehicleImage,
          },
        }));
        
        const storageResult = safeLocalStorageSet('distributor_applications', JSON.stringify(storageApplications));
        if (!storageResult.success) {
          console.warn('Failed to save to localStorage:', storageResult.error);
        }

        return {
          data: {
            success: true,
            application: updatedApplication,
          },
        };
      },
      invalidatesTags: ['DistributorApplication'],
    }),
  }),
});

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Helper function to safely save to localStorage with quota handling
function safeLocalStorageSet(key: string, value: string): { success: boolean; error?: string } {
  try {
    // Check if we're approaching quota (rough estimate: 4MB limit for safety)
    const currentSize = new Blob([value]).size;
    if (currentSize > 4 * 1024 * 1024) { // 4MB
      return { success: false, error: 'Data too large to store in localStorage' };
    }

    localStorage.setItem(key, value);
    return { success: true };
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      // Try to clean up old data
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored);
          // Keep only the 10 most recent applications
          if (Array.isArray(data) && data.length > 10) {
            const sorted = data.sort((a: any, b: any) => 
              new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime()
            );
            const recent = sorted.slice(0, 10);
            localStorage.setItem(key, JSON.stringify(recent));
            // Try again with cleaned data
            return safeLocalStorageSet(key, value);
          }
        }
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      return { success: false, error: 'Storage quota exceeded. Please clear some data and try again.' };
    }
    return { success: false, error: error.message || 'Failed to save to localStorage' };
  }
}

export const {
  useSubmitDistributorApplicationNewMutation,
  useSubmitDistributorApplicationMutation,
  useGetDistributorApplicationQuery,
  useGetAllDistributorApplicationsQuery,
  useApproveDistributorApplicationMutation,
  useRejectDistributorApplicationMutation,
} = distributorApi;

