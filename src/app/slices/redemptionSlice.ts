import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PartnerShop {
  id: string;
  name: string;
  category: string;
  logo?: string;
  description?: string;
}

export interface RedemptionProduct {
  id: string;
  shopId: string;
  shopName: string;
  name: string;
  description: string;
  points: number;
  image?: string;
  category: string;
  available: boolean;
}

export interface RedemptionTransaction {
  id: string;
  productId: string;
  productName: string;
  points: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  redeemedAt: string;
  processedAt?: string;
}

export interface RedemptionState {
  partnerShops: PartnerShop[];
  products: RedemptionProduct[];
  transactions: RedemptionTransaction[];
  availablePoints: number;
  isLoading: boolean;
}

const initialState: RedemptionState = {
  partnerShops: [],
  products: [],
  transactions: [],
  availablePoints: 0,
  isLoading: false,
};

const redemptionSlice = createSlice({
  name: 'redemption',
  initialState,
  reducers: {
    setPartnerShops: (state, action: PayloadAction<PartnerShop[]>) => {
      state.partnerShops = action.payload;
    },
    setProducts: (state, action: PayloadAction<RedemptionProduct[]>) => {
      state.products = action.payload;
    },
    setTransactions: (state, action: PayloadAction<RedemptionTransaction[]>) => {
      state.transactions = action.payload;
    },
    addTransaction: (state, action: PayloadAction<RedemptionTransaction>) => {
      state.transactions.push(action.payload);
      state.availablePoints -= action.payload.points;
    },
    setAvailablePoints: (state, action: PayloadAction<number>) => {
      state.availablePoints = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setPartnerShops, setProducts, setTransactions, addTransaction, setAvailablePoints, setLoading } = redemptionSlice.actions;
export default redemptionSlice.reducer;

