import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Payout {
  id: string;
  amount: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
}

interface PayoutState {
  payouts: Payout[];
  pendingAmount: number;
  isLoading: boolean;
}

const initialState: PayoutState = {
  payouts: [],
  pendingAmount: 0,
  isLoading: false,
};

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setPayouts: (state, action: PayloadAction<Payout[]>) => {
      state.payouts = action.payload;
    },
    setPendingAmount: (state, action: PayloadAction<number>) => {
      state.pendingAmount = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPayouts, setPendingAmount, setLoading } = payoutSlice.actions;
export default payoutSlice.reducer;
