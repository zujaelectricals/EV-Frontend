import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BinaryPair {
  id: string;
  leftUserId: string;
  rightUserId: string;
  leftAmount: number;
  rightAmount: number;
  commission: number;
  tds: number;
  netAmount: number;
  poolMoney: number;
  createdAt: string;
}

export interface BinaryStats {
  totalLeftPV: number;
  totalRightPV: number;
  totalPairs: number;
  maxPairs: number; // 10 pairs max
  monthlyEarnings: number;
  totalEarnings: number;
  tdsDeducted: number;
  poolMoney: number;
  ceilingAmount: number; // 20% of total earnings
  ceilingUsed: number;
  ceilingLimit: number; // Max ₹20,000
  binaryActivated: boolean;
  pairs: BinaryPair[];
}

interface BinaryState {
  stats: BinaryStats | null;
  selectedNode: string | null;
  isLoading: boolean;
}

const initialState: BinaryState = {
  stats: null,
  selectedNode: null,
  isLoading: false,
};

const binarySlice = createSlice({
  name: 'binary',
  initialState,
  reducers: {
    setStats: (state, action: PayloadAction<BinaryStats>) => {
      state.stats = action.payload;
    },
    addPair: (state, action: PayloadAction<BinaryPair>) => {
      if (state.stats) {
        state.stats.pairs.push(action.payload);
        state.stats.totalPairs += 1;
        state.stats.monthlyEarnings += action.payload.netAmount;
        state.stats.totalEarnings += action.payload.netAmount;
        state.stats.tdsDeducted += action.payload.tds;
        state.stats.poolMoney += action.payload.poolMoney;
        
        // Calculate ceiling (20% of total earnings, max ₹20,000)
        const ceiling = Math.min(state.stats.totalEarnings * 0.2, 20000);
        state.stats.ceilingAmount = ceiling;
      }
    },
    selectNode: (state, action: PayloadAction<string>) => {
      state.selectedNode = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setStats, addPair, selectNode, setLoading } = binarySlice.actions;
export default binarySlice.reducer;
