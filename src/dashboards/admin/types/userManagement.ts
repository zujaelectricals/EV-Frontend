export type UserStatus = 'active' | 'inactive' | 'blocked' | 'suspended';
export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';
export type UserRole = 'user' | 'distributor' | 'staff' | 'admin';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial';

export interface UserExtended {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  kycStatus: KYCStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  joinDate: string;
  lastLogin?: string;
  totalOrders: number;
  totalSpent: number;
  paymentStatus?: PaymentStatus;
  distributorInfo?: {
    distributorId?: string;
    referralCode?: string;
    verified: boolean;
    verificationDate?: string;
  };
  kycDetails?: {
    aadharNumber?: string;
    panNumber?: string;
    submittedAt?: string;
    verifiedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    documents?: {
      aadhar?: string;
      pan?: string;
      bankStatement?: string;
    };
  };
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    accountHolderName: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  category: 'transaction' | 'kyc' | 'payout' | 'general' | 'promotional';
  createdAt: string;
}

export interface NotificationCampaign {
  id: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'in_app';
  targetUsers: 'all' | 'active' | 'paid' | 'kyc_pending' | 'custom';
  customUserIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  blockedUsers: number;
  kycPending: number;
  kycRejected: number;
  emailUnverified: number;
  mobileUnverified: number;
  newUsersThisMonth: number;
  monthlyGrowth: {
    month: string;
    count: number;
  }[];
  userSegmentation: {
    segment: string;
    count: number;
    percentage: number;
  }[];
}

