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
  addedToTeamNetwork?: boolean; // Track if user has been added to distributor's team network
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: string | null;
  isLoading: boolean;
  emiPlans: EMIPlan[];
  currentUserId: string | null; // Track current user to load their bookings
}

// Note: Bookings should be handled by the backend API, not stored in localStorage

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
      // Bookings are managed by the backend API, not localStorage
    },
    loadBookingsForUser: (state, action: PayloadAction<string | null>) => {
      const userId = action.payload;
      state.currentUserId = userId;
      // Bookings should be loaded from the backend API
      state.bookings = [];
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      // Check if booking already exists (by id) to avoid duplicates
      const existingIndex = state.bookings.findIndex(b => b.id === action.payload.id);
      if (existingIndex === -1) {
        state.bookings.push(action.payload);
      } else {
        // Update existing booking if it already exists
        state.bookings[existingIndex] = action.payload;
      }
      // Bookings are managed by the backend API, not localStorage
    },
    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<Booking> }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload.updates };
      }
      // Bookings are managed by the backend API, not localStorage
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
