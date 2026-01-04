import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PaymentMethod = 'full' | 'emi' | 'flexible';
export type BookingStatus = 'pre-booked' | 'pending' | 'confirmed' | 'delivered' | 'cancelled' | 'refunded';

export interface EMIPlan {
  id: string;
  months: number;
  monthlyAmount: number;
  interestRate: number;
  totalAmount: number;
}

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  status: BookingStatus;
  preBookingAmount: number;
  totalAmount: number;
  remainingAmount: number;
  totalPaid: number; // Total amount paid so far (including pre-booking and additional payments)
  paymentMethod: PaymentMethod;
  emiPlan?: EMIPlan;
  paymentDueDate?: string;
  paymentStatus: 'pending' | 'partial' | 'completed' | 'overdue' | 'refunded';
  isActiveBuyer: boolean;
  redemptionPoints: number;
  redemptionEligible: boolean;
  bookedAt: string;
  referredBy?: string;
  referralBonus?: number;
  tdsDeducted?: number;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: string | null;
  isLoading: boolean;
  emiPlans: EMIPlan[];
  currentUserId: string | null; // Track current user to load their bookings
}

// Helper functions for localStorage
const getBookingsStorageKey = (userId: string | null): string => {
  return `ev_nexus_bookings_${userId || 'guest'}`;
};

const getStoredBookings = (userId: string | null): Booking[] => {
  if (typeof window === 'undefined') return [];
  try {
    const storageKey = getBookingsStorageKey(userId);
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
  }
  return [];
};

const saveBookingsToStorage = (userId: string | null, bookings: Booking[]): void => {
  if (typeof window === 'undefined') return;
  try {
    const storageKey = getBookingsStorageKey(userId);
    localStorage.setItem(storageKey, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
};

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  currentUserId: null,
  emiPlans: [
    { id: 'emi-12', months: 12, monthlyAmount: 0, interestRate: 8, totalAmount: 0 },
    { id: 'emi-18', months: 18, monthlyAmount: 0, interestRate: 10, totalAmount: 0 },
    { id: 'emi-24', months: 24, monthlyAmount: 0, interestRate: 12, totalAmount: 0 },
  ],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
      // Save to localStorage whenever bookings are set
      if (state.currentUserId) {
        saveBookingsToStorage(state.currentUserId, action.payload);
      }
    },
    loadBookingsForUser: (state, action: PayloadAction<string | null>) => {
      const userId = action.payload;
      state.currentUserId = userId;
      const storedBookings = getStoredBookings(userId);
      state.bookings = storedBookings;
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      // If currentUserId is set but bookings array is empty, try to load from localStorage first
      if (state.currentUserId && state.bookings.length === 0) {
        const storedBookings = getStoredBookings(state.currentUserId);
        if (storedBookings.length > 0) {
          state.bookings = storedBookings;
        }
      }
      
      // Check if booking already exists (by id) to avoid duplicates
      const existingIndex = state.bookings.findIndex(b => b.id === action.payload.id);
      if (existingIndex === -1) {
        state.bookings.push(action.payload);
      } else {
        // Update existing booking if it already exists
        state.bookings[existingIndex] = action.payload;
      }
      
      // Save to localStorage whenever a booking is added
      // Note: Middleware also handles this, but we do it here too for redundancy
      if (state.currentUserId) {
        saveBookingsToStorage(state.currentUserId, state.bookings);
      }
    },
    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<Booking> }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload.updates };
        // Save to localStorage whenever a booking is updated
        if (state.currentUserId) {
          saveBookingsToStorage(state.currentUserId, state.bookings);
        }
      }
    },
    selectBooking: (state, action: PayloadAction<string>) => {
      state.selectedBooking = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setEMIPlans: (state, action: PayloadAction<EMIPlan[]>) => {
      state.emiPlans = action.payload;
    },
  },
});

export const { setBookings, loadBookingsForUser, addBooking, updateBooking, selectBooking, setLoading, setEMIPlans } = bookingSlice.actions;
export default bookingSlice.reducer;
