export type TargetCategory = 'sales' | 'leads' | 'revenue' | 'verifications' | 'approvals';
export type TargetPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type TargetStatus = 'on-track' | 'at-risk' | 'exceeded' | 'not-started';

export interface EnhancedTarget {
  id: string;
  label: string;
  category: TargetCategory;
  current: number;
  target: number;
  unit: string;
  period: TargetPeriod;
  deadline: string;
  status: TargetStatus;
  progressHistory: { date: string; value: number }[];
  milestones?: { percentage: number; reward?: number }[];
  relatedActivities?: string[];
  dailyAverageRequired?: number;
  lastUpdated?: string;
}

export type IncentiveCategory = 'sales' | 'performance' | 'milestone' | 'special';
export type IncentiveStatus = 'earned' | 'pending' | 'processing' | 'paid';

export interface EnhancedIncentive {
  id: string;
  type: string;
  category: IncentiveCategory;
  amount: number;
  status: IncentiveStatus;
  description: string;
  date: string;
  earnedDate?: string;
  paidDate?: string;
  relatedTargetId?: string;
  progress?: { current: number; target: number };
  paymentMethod?: string;
  transactionId?: string;
  taxAmount?: number;
}

