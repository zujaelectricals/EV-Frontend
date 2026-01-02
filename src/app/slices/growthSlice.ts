import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GrowthMetrics {
  evBookings: { value: number; change: number; trend: 'up' | 'down' };
  activeBuyers: { value: number; change: number; trend: 'up' | 'down' };
  distributorNetwork: { value: number; change: number; trend: 'up' | 'down' };
  binaryPairVelocity: { value: number; change: number; trend: 'up' | 'down' };
}

interface GrowthState {
  metrics: GrowthMetrics | null;
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  isLoading: boolean;
}

const initialState: GrowthState = {
  metrics: null,
  selectedPeriod: 'month',
  isLoading: false,
};

const growthSlice = createSlice({
  name: 'growth',
  initialState,
  reducers: {
    setMetrics: (state, action: PayloadAction<GrowthMetrics>) => {
      state.metrics = action.payload;
    },
    setPeriod: (state, action: PayloadAction<'week' | 'month' | 'quarter' | 'year'>) => {
      state.selectedPeriod = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setMetrics, setPeriod, setLoading } = growthSlice.actions;
export default growthSlice.reducer;
