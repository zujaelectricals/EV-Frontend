export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'warning' | 'violation' | 'pending_review';
export type AlertStatus = 'active' | 'investigating' | 'resolved' | 'false_positive' | 'dismissed';
export type ActionType = 'block' | 'flag' | 'verify' | 'monitor' | 'approve' | 'reject';

export interface DuplicatePANRecord {
  id: string;
  panNumber: string;
  userIds: string[];
  userNames: string[];
  userEmails: string[];
  registrationDates: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  firstDetected: string;
  lastUpdated: string;
  totalAccounts: number;
  totalInvestments: number;
  totalCommissions: number;
  suspiciousPatterns: string[];
  recommendedAction: ActionType;
  assignedTo?: string;
  notes?: string;
}

export interface BankAbuseRecord {
  id: string;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  userIds: string[];
  userNames: string[];
  transactionCount: number;
  totalAmount: number;
  suspiciousActivities: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  firstDetected: string;
  lastUpdated: string;
  flaggedReasons: string[];
  recommendedAction: ActionType;
  assignedTo?: string;
  notes?: string;
}

export interface ReferralFarmingAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  suspiciousPattern: string;
  referralCount: number;
  referralRate: number; // referrals per day
  conversionRate: number; // percentage of referrals that convert
  duplicateIPs: number;
  duplicateDevices: number;
  suspiciousReferrals: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  detectedAt: string;
  lastUpdated: string;
  recommendedAction: ActionType;
  assignedTo?: string;
  notes?: string;
}

export interface RapidGrowthSuspicion {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  growthType: 'team_size' | 'investment' | 'commission' | 'referrals' | 'combined';
  currentValue: number;
  previousValue: number;
  growthPercentage: number;
  growthPeriod: string; // e.g., "7 days", "30 days"
  expectedGrowth: number;
  deviation: number;
  riskScore: number;
  riskLevel: RiskLevel;
  status: AlertStatus;
  detectedAt: string;
  lastUpdated: string;
  suspiciousFactors: string[];
  recommendedAction: ActionType;
  assignedTo?: string;
  notes?: string;
}

export interface ComplianceMetrics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
  complianceScore: number;
  lastAuditDate: string;
  nextAuditDate: string;
}

export interface ComplianceAlert {
  id: string;
  type: 'duplicate_pan' | 'bank_abuse' | 'referral_farming' | 'rapid_growth' | 'other';
  title: string;
  description: string;
  riskLevel: RiskLevel;
  status: AlertStatus;
  detectedAt: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ComplianceFilters {
  riskLevel?: RiskLevel;
  status?: AlertStatus;
  type?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  assignedTo?: string;
  search?: string;
}

