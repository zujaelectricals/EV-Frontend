export type TransactionType = 'payment' | 'refund' | 'commission' | 'payout' | 'redemption' | 'wallet' | 'other';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';
export type InvestmentType = 'pre_booking' | 'full_payment' | 'emi' | 'top_up';
export type BVTransactionType = 'generated' | 'distributed' | 'used' | 'expired';
export type CommissionType = 'referral' | 'binary' | 'pool' | 'incentive' | 'milestone';
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
export type LoginStatus = 'success' | 'failed' | 'blocked';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
  userId?: string;
  searchQuery?: string;
  [key: string]: any;
}

export interface TransactionReport {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  paymentMethod?: string;
  gateway?: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentReport {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: InvestmentType;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  vehicleName?: string;
  emiPlan?: {
    monthlyAmount: number;
    totalMonths: number;
    interestRate: number;
  };
  redemptionPoints?: number;
  redemptionEligible: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface BVReport {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  distributorId?: string;
  distributorName?: string;
  type: BVTransactionType;
  amount: number;
  leftBV?: number;
  rightBV?: number;
  balance: number;
  source: 'booking' | 'commission' | 'transfer' | 'adjustment';
  description: string;
  createdAt: string;
  expiresAt?: string;
}

export interface CommissionReport {
  id: string;
  commissionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: CommissionType;
  amount: number;
  tds: number;
  poolMoney?: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  relatedTransactionId?: string;
  referredUserId?: string;
  referredUserName?: string;
  pairCount?: number;
  createdAt: string;
  paidAt?: string;
  payoutId?: string;
}

export interface LoginHistoryReport {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  loginTime: string;
  logoutTime?: string;
  ipAddress: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  status: LoginStatus;
  sessionDuration?: number; // minutes
  userAgent: string;
}

export interface NotificationHistoryReport {
  id: string;
  notificationId: string;
  type: NotificationType;
  subject: string;
  body: string;
  recipientCount: number;
  sentAt: string;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  deliveryRate: number; // percentage
  openRate: number; // percentage
  clickRate: number; // percentage
  status: 'sent' | 'sending' | 'failed' | 'cancelled';
  campaignId?: string;
  segment?: string;
}

export interface ReportAnalytics {
  totalTransactions: number;
  totalAmount: number;
  totalInvestments: number;
  totalInvestmentAmount: number;
  totalBV: number;
  totalCommissions: number;
  totalCommissionAmount: number;
  activeUsers: number;
  notificationsSent: number;
  monthlyData: {
    month: string;
    transactions: number;
    investments: number;
    commissions: number;
    amount: number;
  }[];
  transactionTypeDistribution: {
    type: TransactionType;
    count: number;
    amount: number;
  }[];
  commissionTypeDistribution: {
    type: CommissionType;
    count: number;
    amount: number;
  }[];
}

