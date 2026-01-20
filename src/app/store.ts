import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/baseApi';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import binaryReducer from './slices/binarySlice';
import bookingReducer from './slices/bookingSlice';
import payoutReducer from './slices/payoutSlice';
import growthReducer from './slices/growthSlice';
import staffReducer from './slices/staffSlice';
import complianceReducer from './slices/complianceSlice';
import redemptionReducer from './slices/redemptionSlice';
import wishlistReducer from './slices/wishlistSlice';

// Note: Bookings are managed by the backend API, not stored in localStorage
// Removed booking persistence middleware as bookings should come from the API

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    wallet: walletReducer,
    binary: binaryReducer,
    booking: bookingReducer,
    payout: payoutReducer,
    growth: growthReducer,
    staff: staffReducer,
    compliance: complianceReducer,
    redemption: redemptionReducer,
    wishlist: wishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
