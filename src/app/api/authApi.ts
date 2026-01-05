import { api } from './baseApi';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  isDistributor: boolean;
  avatar?: string;
  phone?: string;
  joinedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

const STORAGE_KEY = 'ev_nexus_users';

// Helper function to get users from localStorage
function getStoredUsers(): Array<{ id: string; name: string; email: string; password: string; phone?: string; dateOfBirth?: string; aadhar?: string; joinedAt: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

// Mock user data (for admin, staff, distributor demo accounts)
const mockUsers: Record<string, User> = {
  admin: {
    id: '1',
    name: 'Admin User',
    email: 'admin@zuja.com',
    role: 'admin',
    isDistributor: false,
    phone: '9497279195',
    joinedAt: '2024-01-01',
  },
  staff: {
    id: '2',
    name: 'Staff Member',
    email: 'staff@zuja.com',
    role: 'staff',
    isDistributor: false,
    phone: '9497279196',
    joinedAt: '2024-03-15',
  },
  distributor: {
    id: '3',
    name: 'John Distributor',
    email: 'distributor@zuja.com',
    role: 'user',
    isDistributor: true,
    phone: '9497279197',
    joinedAt: '2024-02-20',
  },
  user: {
    id: '4',
    name: 'Regular User',
    email: 'user@zuja.com',
    role: 'user',
    isDistributor: false,
    phone: '9497279195',
    joinedAt: '2024-06-10',
  },
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      queryFn: async ({ email, password }) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // First check mock users (for demo accounts)
        let userType = 'user';
        if (email.includes('admin')) userType = 'admin';
        else if (email.includes('staff')) userType = 'staff';
        else if (email.includes('distributor')) userType = 'distributor';
        
        // Check if it's a mock user (demo accounts don't require password check)
        if (mockUsers[userType] && email === mockUsers[userType].email) {
          const user = { ...mockUsers[userType] };
          
          // Load KYC status from localStorage for mock users too
          const KYC_STORAGE_KEY = 'ev_nexus_kyc_data';
          try {
            const kycDataStr = localStorage.getItem(KYC_STORAGE_KEY);
            if (kycDataStr) {
              const kycData = JSON.parse(kycDataStr);
              const userKYC = kycData[user.id];
              if (userKYC) {
                user.kycStatus = userKYC.kycStatus;
                user.kycDetails = userKYC.kycDetails;
              } else {
                user.kycStatus = 'not_submitted';
              }
            } else {
              user.kycStatus = 'not_submitted';
            }
          } catch (error) {
            console.error('Error loading KYC data:', error);
            user.kycStatus = 'not_submitted';
          }
          
          return {
            data: {
              user,
              token: 'mock-jwt-token-' + user.id,
            },
          };
        }
        
        // Check registered users from localStorage
        const storedUsers = getStoredUsers();
        const storedUser = storedUsers.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        
        if (storedUser) {
          // Load KYC status from localStorage
          const KYC_STORAGE_KEY = 'ev_nexus_kyc_data';
          let kycStatus: 'not_submitted' | 'pending' | 'verified' | 'rejected' | undefined = undefined;
          let kycDetails: any = undefined;
          
          try {
            const kycDataStr = localStorage.getItem(KYC_STORAGE_KEY);
            if (kycDataStr) {
              const kycData = JSON.parse(kycDataStr);
              const userKYC = kycData[storedUser.id];
              if (userKYC) {
                kycStatus = userKYC.kycStatus;
                kycDetails = userKYC.kycDetails;
              }
            }
          } catch (error) {
            console.error('Error loading KYC data:', error);
          }
          
          // Convert stored user to User type
          const user: User = {
            id: storedUser.id,
            name: storedUser.name,
            email: storedUser.email,
            role: 'user',
            isDistributor: false,
            phone: storedUser.phone,
            joinedAt: storedUser.joinedAt,
            kycStatus: kycStatus || 'not_submitted',
            kycDetails: kycDetails,
          };
          
          return {
            data: {
              user,
              token: 'mock-jwt-token-' + user.id,
            },
          };
        }
        
        // User not found or invalid credentials
        return {
          error: {
            status: 'UNAUTHORIZED',
            data: 'Invalid email or password',
          },
        };
      },
    }),
    logout: builder.mutation<void, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: undefined };
      },
    }),
    getCurrentUser: builder.query<User, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockUsers.distributor };
      },
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetCurrentUserQuery } = authApi;
