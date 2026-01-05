import { PayoutType, PayoutStatus } from '@/app/slices/payoutSlice';

// Extended Payout with admin fields
export interface PayoutExtended {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  amount: number;
  type: PayoutType;
  status: PayoutStatus | 'approved' | 'rejected';
  description: string;
  milestoneId?: string;
  requestedAt: string;
  approvedAt?: string;
  processedAt?: string;
  rejectedAt?: string;
  cancelledAt?: string;
  tds?: number;
  netAmount?: number;
  bankDetails: {
    accountNumber: string;
    accountHolderName: string;
    ifsc: string;
    bankName: string;
    branch?: string;
  };
  upiId?: string;
  walletAddress?: string;
  paymentMethod: 'bank_transfer' | 'upi' | 'wallet';
  transactionId?: string;
  failureReason?: string;
  rejectionReason?: string;
  approvedBy?: string;
  processedBy?: string;
  notes?: string;
}

// Bank Settlement Batch
export interface SettlementBatch {
  id: string;
  batchNumber: string;
  settlementDate: string;
  totalPayouts: number;
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  bankReference?: string;
  transactionId?: string;
  initiatedAt: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  initiatedBy: string;
  payoutIds: string[];
  fileUrl?: string; // Settlement file URL
}

// Payout Analytics
export interface PayoutAnalytics {
  totalPayouts: number;
  totalAmount: number;
  pendingCount: number;
  pendingAmount: number;
  approvedCount: number;
  approvedAmount: number;
  rejectedCount: number;
  rejectedAmount: number;
  completedCount: number;
  completedAmount: number;
  failedCount: number;
  failedAmount: number;
  averagePayoutAmount: number;
  monthlyData: {
    month: string;
    count: number;
    amount: number;
  }[];
  typeDistribution: {
    type: PayoutType;
    count: number;
    amount: number;
  }[];
}

// Payout Filters
export interface PayoutFilters {
  status?: PayoutStatus[];
  type?: PayoutType[];
  dateRange?: {
    start: string;
    end: string;
  };
  minAmount?: number;
  maxAmount?: number;
  userId?: string;
}

