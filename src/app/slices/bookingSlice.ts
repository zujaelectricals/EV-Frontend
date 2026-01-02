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
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
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
    },
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.push(action.payload);
    },
    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<Booking> }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload.updates };
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

export const { setBookings, addBooking, updateBooking, selectBooking, setLoading, setEMIPlans } = bookingSlice.actions;
export default bookingSlice.reducer;
