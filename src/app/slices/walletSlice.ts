import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WalletBalance {
  type: 'main' | 'binary' | 'pool' | 'redemption' | 'emi';
  balance: number;
  currency: string;
  locked: number;
  available: number;
}

interface WalletState {
  wallets: WalletBalance[];
  selectedWallet: string | null;
  isLoading: boolean;
}

const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  isLoading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallets: (state, action: PayloadAction<WalletBalance[]>) => {
      state.wallets = action.payload;
    },
    selectWallet: (state, action: PayloadAction<string>) => {
      state.selectedWallet = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setWallets, selectWallet, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
