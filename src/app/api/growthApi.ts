import { api } from './baseApi';

export interface GrowthMetrics {
  evBookings: { value: number; change: number; trend: 'up' | 'down' };
  activeBuyers: { value: number; change: number; trend: 'up' | 'down' };
  distributorNetwork: { value: number; change: number; trend: 'up' | 'down' };
  binaryPairVelocity: { value: number; change: number; trend: 'up' | 'down' };
  monthlyRevenue: { value: number; change: number; trend: 'up' | 'down' };
  redemptionRate: { value: number; change: number; trend: 'up' | 'down' };
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

const mockGrowthMetrics: GrowthMetrics = {
  evBookings: { value: 1250, change: 15.2, trend: 'up' },
  activeBuyers: { value: 8450, change: 8.5, trend: 'up' },
  distributorNetwork: { value: 2340, change: 12.3, trend: 'up' },
  binaryPairVelocity: { value: 456, change: -2.1, trend: 'down' },
  monthlyRevenue: { value: 25600000, change: 22.5, trend: 'up' },
  redemptionRate: { value: 78.5, change: 5.2, trend: 'up' },
};

const mockBookingTrends: ChartData[] = [
  { name: 'Jan', value: 65 },
  { name: 'Feb', value: 85 },
  { name: 'Mar', value: 120 },
  { name: 'Apr', value: 150 },
  { name: 'May', value: 180 },
  { name: 'Jun', value: 220 },
  { name: 'Jul', value: 280 },
  { name: 'Aug', value: 320 },
  { name: 'Sep', value: 380 },
  { name: 'Oct', value: 450 },
  { name: 'Nov', value: 520 },
  { name: 'Dec', value: 600 },
];

const mockNetworkGrowth: ChartData[] = [
  { name: 'Jan', value: 120, value2: 80 },
  { name: 'Feb', value: 180, value2: 120 },
  { name: 'Mar', value: 250, value2: 180 },
  { name: 'Apr', value: 320, value2: 250 },
  { name: 'May', value: 400, value2: 320 },
  { name: 'Jun', value: 480, value2: 400 },
];

const mockPaymentTypes: ChartData[] = [
  { name: 'Full Payment', value: 45 },
  { name: 'EMI', value: 35 },
  { name: 'Wallet', value: 15 },
  { name: 'Mixed', value: 5 },
];

const mockStaffPerformance: ChartData[] = [
  { name: 'Rahul', value: 85 },
  { name: 'Priya', value: 92 },
  { name: 'Amit', value: 78 },
  { name: 'Sneha', value: 88 },
  { name: 'Vikram', value: 70 },
];

export const growthApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGrowthMetrics: builder.query<GrowthMetrics, void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return { data: mockGrowthMetrics };
      },
      providesTags: ['Growth'],
    }),
    getBookingTrends: builder.query<ChartData[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockBookingTrends };
      },
    }),
    getNetworkGrowth: builder.query<ChartData[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return { data: mockNetworkGrowth };
      },
    }),
    getPaymentTypes: builder.query<ChartData[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return { data: mockPaymentTypes };
      },
    }),
    getStaffPerformance: builder.query<ChartData[], void>({
      queryFn: async () => {
        await new Promise((resolve) => setTimeout(resolve, 250));
        return { data: mockStaffPerformance };
      },
    }),
  }),
});

export const {
  useGetGrowthMetricsQuery,
  useGetBookingTrendsQuery,
  useGetNetworkGrowthQuery,
  useGetPaymentTypesQuery,
  useGetStaffPerformanceQuery,
} = growthApi;
