import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PayoutType = 'referral' | 'binary' | 'pool' | 'incentive' | 'milestone';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Milestone {
  id: string;
  name: string;
  target: number;
  reward: number;
  achieved: boolean;
  achievedAt?: string;
}

export interface Payout {
  id: string;
  amount: number;
  type: PayoutType;
  status: PayoutStatus;
  description: string;
  milestoneId?: string;
  requestedAt: string;
  processedAt?: string;
  tds?: number;
  netAmount?: number;
}

interface PayoutState {
  payouts: Payout[];
  pendingAmount: number;
  milestones: Milestone[];
  isLoading: boolean;
}

const initialState: PayoutState = {
  payouts: [],
  pendingAmount: 0,
  milestones: [
    { id: 'm1', name: 'First 3 Referrals', target: 3, reward: 1000, achieved: false },
    { id: 'm2', name: 'Binary Account Enablement', target: 3, reward: 2000, achieved: false },
    { id: 'm3', name: '5 Pairs Completed', target: 5, reward: 5000, achieved: false },
    { id: 'm4', name: '10 Pairs Completed', target: 10, reward: 10000, achieved: false },
  ],
  isLoading: false,
};

const payoutSlice = createSlice({
  name: 'payout',
  initialState,
  reducers: {
    setPayouts: (state, action: PayloadAction<Payout[]>) => {
      state.payouts = action.payload;
    },
    addPayout: (state, action: PayloadAction<Payout>) => {
      state.payouts.push(action.payload);
      if (action.payload.status === 'pending' || action.payload.status === 'processing') {
        state.pendingAmount += action.payload.amount;
      }
    },
    updatePayout: (state, action: PayloadAction<{ id: string; status: PayoutStatus }>) => {
      const payout = state.payouts.find(p => p.id === action.payload.id);
      if (payout) {
        const oldStatus = payout.status;
        payout.status = action.payload.status;
        
        // Update pending amount
        if ((oldStatus === 'pending' || oldStatus === 'processing') && 
            (action.payload.status === 'completed' || action.payload.status === 'failed')) {
          state.pendingAmount -= payout.amount;
        }
      }
    },
    setPendingAmount: (state, action: PayloadAction<number>) => {
      state.pendingAmount = action.payload;
    },
    setMilestones: (state, action: PayloadAction<Milestone[]>) => {
      state.milestones = action.payload;
    },
    achieveMilestone: (state, action: PayloadAction<string>) => {
      const milestone = state.milestones.find(m => m.id === action.payload);
      if (milestone && !milestone.achieved) {
        milestone.achieved = true;
        milestone.achievedAt = new Date().toISOString();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPayouts, addPayout, updatePayout, setPendingAmount, setMilestones, achieveMilestone, setLoading } = payoutSlice.actions;
export default payoutSlice.reducer;
