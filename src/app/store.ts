import { configureStore, Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/baseApi';
import authReducer from './slices/authSlice';
import walletReducer from './slices/walletSlice';
import binaryReducer from './slices/binarySlice';
import bookingReducer, { addBooking, updateBooking, setBookings } from './slices/bookingSlice';
import payoutReducer from './slices/payoutSlice';
import growthReducer from './slices/growthSlice';
import staffReducer from './slices/staffSlice';
import complianceReducer from './slices/complianceSlice';
import redemptionReducer from './slices/redemptionSlice';
import wishlistReducer from './slices/wishlistSlice';

// Helper function to save bookings to localStorage
const saveBookingsToStorage = (userId: string | null, bookings: any[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = `ev_nexus_bookings_${userId || 'guest'}`;
    localStorage.setItem(storageKey, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
};

// Middleware to persist bookings to localStorage
const bookingPersistenceMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action);
  
  // After the action is processed, check if bookings changed
  if (addBooking.match(action) || updateBooking.match(action) || setBookings.match(action)) {
    const state = store.getState() as ReturnType<typeof store.getState>;
    const userId = state.auth.user?.id || null;
    const bookings = state.booking.bookings;
    
    // Always save to localStorage if we have a user ID
    if (userId && bookings.length >= 0) {
      saveBookingsToStorage(userId, bookings);
    }
  }
  
  return result;
};

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
    getDefaultMiddleware().concat(api.middleware, bookingPersistenceMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
