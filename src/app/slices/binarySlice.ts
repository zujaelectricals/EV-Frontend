import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BinaryStats {
  totalLeftPV: number;
  totalRightPV: number;
  totalPairs: number;
  monthlyEarnings: number;
  ceilingUsed: number;
  ceilingLimit: number;
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
    selectNode: (state, action: PayloadAction<string>) => {
      state.selectedNode = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setStats, selectNode, setLoading } = binarySlice.actions;
export default binarySlice.reducer;
