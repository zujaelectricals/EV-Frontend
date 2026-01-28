import { api } from './baseApi';

// ==========================================
// Comprehensive Reports API Types
// ==========================================

// Transaction History Types
export interface TransactionUser {
  id: number;
  name: string;
  email: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: string;
  date: string;
  user: TransactionUser;
  type: string;
  amount: string;
  status: string;
  description: string;
  created_at: string;
}

export interface TransactionTypeSummaryItem {
  type: string;
  count: number;
  total_amount: string;
  avg_amount: string;
  success_rate: number;
}

export interface WeeklyTrendItem {
  transactions: number;
  amount: number;
}

// Pagination info returned by API
export interface PaginationInfo {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface TransactionHistorySection {
  summary_cards: {
    total_transactions: number;
    total_amount: string;
    success_rate: number;
    failed: number;
  };
  transaction_type_summary: TransactionTypeSummaryItem[];
  weekly_trend: Record<string, WeeklyTrendItem>;
  all_transactions: TransactionItem[];
  pagination?: PaginationInfo;
}

// Investment Logs Types
export interface InvestmentTypeSummaryItem {
  type: string;
  count: number;
  total_amount: string;
  avg_amount: string;
  completed: number;
  pending: number;
}

export interface PaymentMethodSummaryItem {
  payment_method: string;
  count: number;
  total_amount: string;
  percentage: number;
}

export interface InvestmentLogsSection {
  summary_cards: {
    total_investments: number;
    total_amount: string;
    avg_investment: string;
    active_investments: number;
  };
  investment_type_summary: InvestmentTypeSummaryItem[];
  payment_method_summary: PaymentMethodSummaryItem[];
  pagination?: PaginationInfo;
}

// BV Logs Types
export interface BVTypeSummaryItem {
  type: string;
  count: number;
  total_amount: string;
  avg_amount: string;
  active: number;
}

export interface BVSourceSummaryItem {
  source: string;
  count: number;
  total_amount: string;
  percentage: number;
}

export interface BVLogsSection {
  summary_cards: {
    total_bv_generated: string;
    total_bv_distributed: string;
    total_bv_used: string;
    active_bv: string;
  };
  bv_type_summary: BVTypeSummaryItem[];
  bv_source_summary: BVSourceSummaryItem[];
  pagination?: PaginationInfo;
}

// Referral Commission Types
export interface TopReferrerPerformanceItem {
  referrer: string;
  referrals: number;
  total_amount: string;
  tds: string;
  net_amount: string;
  paid: number;
  pending: number;
}

export interface CommissionStatusSummaryItem {
  status: string;
  count: number;
  total_amount: string;
  tds: string;
  net_amount: string;
}

export interface ReferralCommissionSection {
  summary_cards: {
    total_commissions: number;
    total_amount: string;
    paid_amount: string;
    pending_amount: string;
    avg_commission: string;
  };
  top_referrer_performance: TopReferrerPerformanceItem[];
  commission_status_summary: CommissionStatusSummaryItem[];
  pagination?: PaginationInfo;
}

// Team Commission Types
export interface TopDistributorPerformanceItem {
  distributor: string;
  pairs: number;
  total_amount: string;
  tds: string;
  pool_money: string;
  net_amount: string;
  paid: number;
  pending: number;
}

export interface CommissionBreakdownByStatusItem {
  status: string;
  count: number;
  total_amount: string;
  tds: string;
  pool_money: string;
  net_amount: string;
}

export interface TeamCommissionSection {
  summary_cards: {
    total_commissions: number;
    total_pairs: number;
    total_amount: string;
    pool_money: string;
    net_payout: string;
    avg_per_pair: string;
  };
  top_distributor_performance: TopDistributorPerformanceItem[];
  commission_breakdown_by_status: CommissionBreakdownByStatusItem[];
  pagination?: PaginationInfo;
}

// Login History Types
export interface DeviceSummaryItem {
  device: string;
  count: number;
  percentage: number;
  avg_session: number;
}

export interface LoginStatusSummaryItem {
  status: string;
  count: number;
  percentage: number;
}

export interface LoginLocationSummaryItem {
  location: string;
  count: number;
  percentage: number;
}

export interface LoginHistorySection {
  summary_cards: {
    total_logins: number;
    unique_users: number;
    failed_logins: number;
    active_sessions: number;
    avg_logins_per_user: number;
  };
  device_summary: DeviceSummaryItem[];
  login_status_summary: LoginStatusSummaryItem[];
  login_location_summary: LoginLocationSummaryItem[];
}

// Notification History Types
export interface DeliveryStatusSummaryItem {
  status: string;
  count: number;
  percentage: number;
}

export interface NotificationTypePerformanceItem {
  type: string;
  sent: number;
  delivered: number;
  opened: number;
  delivery_rate: number;
  open_rate: number;
}

export interface NotificationHistorySection {
  summary_cards: {
    total_sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    failed: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
  };
  delivery_status_summary: DeliveryStatusSummaryItem[];
  notification_type_performance: NotificationTypePerformanceItem[];
  weekly_notification_volume: Record<string, number>;
  pagination?: PaginationInfo;
}

// Complete Comprehensive Reports Response
export interface ComprehensiveReportsResponse {
  transaction_history: TransactionHistorySection;
  investment_logs: InvestmentLogsSection;
  bv_logs: BVLogsSection;
  referral_commission: ReferralCommissionSection;
  team_commission: TeamCommissionSection;
  login_history: LoginHistorySection;
  notification_history: NotificationHistorySection;
}

// Query parameters for comprehensive reports
export interface ComprehensiveReportsParams {
  // Section selection
  sections?: string; // Comma-separated list of sections to include
  
  // Transaction History pagination & filters
  transaction_page?: number;
  transaction_page_size?: number;
  transaction_status?: string; // Completed, Deducted (comma-separated for multiple)
  
  // Investment Logs pagination & filters
  investment_page?: number;
  investment_page_size?: number;
  investment_status?: string; // pending, active, completed, delivered, cancelled, expired
  
  // BV Logs pagination & filters
  bv_page?: number;
  bv_page_size?: number;
  bv_status?: string; // pending, matched, processed
  
  // Referral Commission pagination
  referral_page?: number;
  referral_page_size?: number;
  
  // Team Commission pagination
  team_page?: number;
  team_page_size?: number;
  
  // Login History pagination
  login_page?: number;
  login_page_size?: number;
  
  // Notification History pagination & filters
  notification_page?: number;
  notification_page_size?: number;
  notification_status?: string; // read, unread
}

// Response structure from the API
export interface AdminDashboardResponse {
  kpi_cards: {
    active_buyers: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    total_visitors: {
      value: number;
      change: number;
      trend: 'up' | 'down';
    };
    pre_booked: {
      value: number;
      conversion: number;
    };
    paid_orders: {
      value: number;
      conversion: number;
    };
    delivered: {
      value: number;
      conversion: number;
    };
  };
  booking_trends: {
    normal_users: {
      months: string[];
      bookings: number[];
      growth: number;
    };
    staff_users: {
      months: string[];
      bookings: number[];
      growth: number;
    };
  };
  payment_distribution: {
    full_payment: {
      count: number;
      percentage: number;
    };
    emi: {
      count: number;
      percentage: number;
    };
    wallet: {
      count: number;
      percentage: number;
    };
    mixed: {
      count: number;
      percentage: number;
    };
  };
  staff_performance: Array<{
    name: string;
    achievement: number;
  }>;
  buyer_growth_trend: {
    normal_users: {
      months: string[];
      active_buyers: number[];
      total_buyers: number[];
    };
    staff_users: {
      months: string[];
      active_buyers: number[];
      total_buyers: number[];
    };
  };
  buyer_segments: {
    normal_users: {
      active_buyers: number;
      inactive: number;
      pre_booked: number;
      new_this_month: number;
    };
    staff_users: {
      active_buyers: number;
      inactive: number;
      pre_booked: number;
      new_this_month: number;
    };
  };
  sales_funnel: {
    normal_users: Array<{
      stage: string;
      count: number;
      percentage: number;
      drop_off: number | null;
    }>;
    staff_users: Array<{
      stage: string;
      count: number;
      percentage: number;
      drop_off: number | null;
    }>;
  };
  conversion_rates: {
    normal_users: Array<{
      from: string;
      to: string;
      rate: number;
      change: number;
      trend: 'up' | 'down';
      converted_count: number;
    }>;
    staff_users: Array<{
      from: string;
      to: string;
      rate: number;
      change: number;
      trend: 'up' | 'down';
      converted_count: number;
    }>;
  };
  pre_bookings: {
    normal_users: {
      kpi_cards: {
        total_pre_bookings: number;
        pending: number;
        confirmed: number;
        total_amount: number;
      };
      summary: {
        total_count: number;
        pending_count: number;
        confirmed_count: number;
        expired_count: number;
        total_amount: number;
      };
    };
    staff_users: {
      kpi_cards: {
        total_pre_bookings: number;
        pending: number;
        confirmed: number;
        total_amount: number;
      };
      summary: {
        total_count: number;
        pending_count: number;
        confirmed_count: number;
        expired_count: number;
        total_amount: number;
      };
    };
  };
  emi_orders: {
    normal_users: {
      kpi_cards: {
        total_emi_orders: number;
        active_emis: number;
        monthly_collection: number;
        pending_amount: number;
      };
      collection_trend: {
        months: string[];
        amounts: number[];
        order_counts: number[];
      };
      summary: {
        total_count: number;
        active_count: number;
        completed_count: number;
        cancelled_count: number;
        total_collected: number;
        total_pending: number;
      };
    };
    staff_users: {
      kpi_cards: {
        total_emi_orders: number;
        active_emis: number;
        monthly_collection: number;
        pending_amount: number;
      };
      collection_trend: {
        months: string[];
        amounts: number[];
        order_counts: number[];
      };
      summary: {
        total_count: number;
        active_count: number;
        completed_count: number;
        cancelled_count: number;
        total_collected: number;
        total_pending: number;
      };
    };
  };
  cancelled_orders: {
    normal_users: {
      kpi_cards: {
        total_cancelled: number;
        total_amount: number;
        refund_pending: number;
        cancellation_rate: number;
      };
      cancellation_trend: {
        months: string[];
        counts: number[];
      };
      summary: {
        total_count: number;
        total_amount: number;
        refund_pending_count: number;
        refund_processed_count: number;
        total_refunded_amount: number;
        pending_refund_amount: number;
      };
    };
    staff_users: {
      kpi_cards: {
        total_cancelled: number;
        total_amount: number;
        refund_pending: number;
        cancellation_rate: number;
      };
      cancellation_trend: {
        months: string[];
        counts: number[];
      };
      summary: {
        total_count: number;
        total_amount: number;
        refund_pending_count: number;
        refund_processed_count: number;
        total_refunded_amount: number;
        pending_refund_amount: number;
      };
    };
  };
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => 'reports/admin-dashboard/',
      providesTags: ['Growth'],
    }),
    
    // Comprehensive Reports Endpoint - fetches all report sections with pagination & filters
    getComprehensiveReports: builder.query<ComprehensiveReportsResponse, ComprehensiveReportsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        
        if (params) {
          // Section selection
          if (params.sections) queryParams.append('sections', params.sections);
          
          // Transaction History params
          if (params.transaction_page) queryParams.append('transaction_page', params.transaction_page.toString());
          if (params.transaction_page_size) queryParams.append('transaction_page_size', params.transaction_page_size.toString());
          if (params.transaction_status) queryParams.append('transaction_status', params.transaction_status);
          
          // Investment Logs params
          if (params.investment_page) queryParams.append('investment_page', params.investment_page.toString());
          if (params.investment_page_size) queryParams.append('investment_page_size', params.investment_page_size.toString());
          if (params.investment_status) queryParams.append('investment_status', params.investment_status);
          
          // BV Logs params
          if (params.bv_page) queryParams.append('bv_page', params.bv_page.toString());
          if (params.bv_page_size) queryParams.append('bv_page_size', params.bv_page_size.toString());
          if (params.bv_status) queryParams.append('bv_status', params.bv_status);
          
          // Referral Commission params
          if (params.referral_page) queryParams.append('referral_page', params.referral_page.toString());
          if (params.referral_page_size) queryParams.append('referral_page_size', params.referral_page_size.toString());
          
          // Team Commission params
          if (params.team_page) queryParams.append('team_page', params.team_page.toString());
          if (params.team_page_size) queryParams.append('team_page_size', params.team_page_size.toString());
          
          // Login History params
          if (params.login_page) queryParams.append('login_page', params.login_page.toString());
          if (params.login_page_size) queryParams.append('login_page_size', params.login_page_size.toString());
          
          // Notification History params
          if (params.notification_page) queryParams.append('notification_page', params.notification_page.toString());
          if (params.notification_page_size) queryParams.append('notification_page_size', params.notification_page_size.toString());
          if (params.notification_status) queryParams.append('notification_status', params.notification_status);
        }
        
        const queryString = queryParams.toString();
        return `reports/comprehensive/${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Growth'],
      // Keep data fresh for 5 minutes
      keepUnusedDataFor: 300,
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetComprehensiveReportsQuery,
} = reportsApi;

