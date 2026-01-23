import { api } from './baseApi';

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
    months: string[];
    bookings: number[];
    growth: number;
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
    months: string[];
    active_buyers: number[];
    total_buyers: number[];
  };
  buyer_segments: {
    active_buyers: number;
    inactive: number;
    pre_booked: number;
    new_this_month: number;
  };
  sales_funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
    drop_off: number | null;
  }>;
  conversion_rates: Array<{
    from: string;
    to: string;
    rate: number;
    change: number;
    trend: 'up' | 'down';
    converted_count: number;
  }>;
  pre_bookings?: {
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
  emi_orders?: {
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
  cancelled_orders?: {
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
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboard: builder.query<AdminDashboardResponse, void>({
      query: () => 'reports/admin-dashboard/',
      providesTags: ['Growth'],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
} = reportsApi;

