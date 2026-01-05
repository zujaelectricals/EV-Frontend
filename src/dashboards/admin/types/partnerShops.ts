import { PartnerShop } from '@/app/slices/redemptionSlice';

// Extended PartnerShop with admin fields
export interface PartnerShopExtended extends PartnerShop {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  commissionRate: number;
  paymentTerms: string;
  contractStartDate: string;
  contractEndDate?: string;
  totalRedemptions: number;
  totalValue: number;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
  taxId?: string;
  registrationNumber?: string;
}

// Product mapping with shop relationship
export interface ShopProductMapping {
  id: string;
  shopId: string;
  shopName: string;
  productId: string;
  productName: string;
  productDescription?: string;
  productImage?: string;
  productCategory: string;
  points: number;
  available: boolean;
  stockQuantity?: number;
  priority: number; // Display order
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

// Commission structure
export interface CommissionStructure {
  id: string;
  shopId: string;
  shopName: string;
  baseRate: number; // Percentage
  tierRates?: {
    minRedemptions: number;
    rate: number;
  }[];
  paymentSchedule: 'weekly' | 'monthly' | 'quarterly';
  paymentMethod: 'bank_transfer' | 'upi' | 'wallet';
  bankDetails?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
    accountHolderName: string;
  };
  upiId?: string;
  walletAddress?: string;
  lastPayoutDate?: string;
  nextPayoutDate?: string;
  totalEarnings: number;
  pendingEarnings: number;
  minimumPayoutThreshold: number;
  autoPayout: boolean;
}

// Redemption analytics
export interface RedemptionAnalytics {
  shopId: string;
  shopName: string;
  totalRedemptions: number;
  totalValue: number;
  monthlyData: {
    month: string;
    redemptions: number;
    value: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    redemptions: number;
  }[];
}

// Redemption transaction with extended details
export interface RedemptionTransactionExtended {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  shopId: string;
  shopName: string;
  productId: string;
  productName: string;
  productImage?: string;
  points: number;
  value: number; // Equivalent monetary value
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  redeemedAt: string;
  processedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  notes?: string;
}

// Partner shop metrics
export interface PartnerShopMetrics {
  totalShops: number;
  activeShops: number;
  pendingShops: number;
  suspendedShops: number;
  totalRedemptions: number;
  totalRedemptionValue: number;
  totalCommissionPaid: number;
  pendingCommission: number;
  averageCommissionRate: number;
}

