import { api } from './baseApi';
import { User, DistributorInfo } from '../slices/authSlice';

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
  distributorId: string;
  mobileNumber: string;
  signature: File | null;
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

// Mock storage for applications (in real app, this would be in a database)
let mockApplications: DistributorApplication[] = [];

export const distributorApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
        const signatureBase64 = applicationData.signature
          ? await fileToBase64(applicationData.signature)
          : null;

        // Get userId from applicationData or generate one
        const userId = applicationData.userId || `user-${Date.now()}`;
        
        const application: DistributorApplication = {
          id: `APP-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          userId: userId,
          applicationData: {
            ...applicationData,
            vehicleImage: vehicleImageBase64 as any, // Store as base64 string
            signature: signatureBase64 as any, // Store as base64 string
          },
          status: 'pending',
          submittedAt: new Date().toISOString(),
        };

        mockApplications.push(application);
        
        // Store in localStorage for persistence
        localStorage.setItem('distributor_applications', JSON.stringify(mockApplications));

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
        
        // Load from localStorage
        const stored = localStorage.getItem('distributor_applications');
        if (stored) {
          try {
            mockApplications = JSON.parse(stored);
          } catch (e) {
            mockApplications = [];
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
        
        // Load from localStorage
        const stored = localStorage.getItem('distributor_applications');
        if (stored) {
          mockApplications = JSON.parse(stored);
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
        
        // Load from localStorage
        const stored = localStorage.getItem('distributor_applications');
        if (stored) {
          mockApplications = JSON.parse(stored);
        }
        
        const application = mockApplications.find(app => app.id === applicationId);
        if (!application) {
          return { error: { status: 404, data: 'Application not found' } };
        }

        application.status = 'approved';
        application.reviewedAt = new Date().toISOString();
        application.reviewedBy = 'admin-user-id';
        application.comments = comments;

        // Save back to localStorage
        localStorage.setItem('distributor_applications', JSON.stringify(mockApplications));

        // Update user's distributor status in localStorage (in real app, this would be done via backend)
        // This is a mock implementation - in production, the backend would update the user record
        const userData = localStorage.getItem('redux-persist:auth');
        if (userData) {
          try {
            const authData = JSON.parse(userData);
            if (authData.user) {
              authData.user.isDistributor = true;
              if (authData.user.distributorInfo) {
                authData.user.distributorInfo.isVerified = true;
                authData.user.distributorInfo.verificationStatus = 'approved';
              }
              localStorage.setItem('redux-persist:auth', JSON.stringify(authData));
            }
          } catch (e) {
            console.error('Error updating user status:', e);
          }
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

    rejectDistributorApplication: builder.mutation<
      { success: boolean; application: DistributorApplication },
      { applicationId: string; comments: string }
    >({
      queryFn: async ({ applicationId, comments }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Load from localStorage
        const stored = localStorage.getItem('distributor_applications');
        if (stored) {
          mockApplications = JSON.parse(stored);
        }
        
        const application = mockApplications.find(app => app.id === applicationId);
        if (!application) {
          return { error: { status: 404, data: 'Application not found' } };
        }

        application.status = 'rejected';
        application.reviewedAt = new Date().toISOString();
        application.reviewedBy = 'admin-user-id';
        application.comments = comments;

        // Save back to localStorage
        localStorage.setItem('distributor_applications', JSON.stringify(mockApplications));

        return {
          data: {
            success: true,
            application,
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

export const {
  useSubmitDistributorApplicationMutation,
  useGetDistributorApplicationQuery,
  useGetAllDistributorApplicationsQuery,
  useApproveDistributorApplicationMutation,
  useRejectDistributorApplicationMutation,
} = distributorApi;

