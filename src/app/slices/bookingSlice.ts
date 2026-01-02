import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Booking {
  id: string;
  vehicleId: string;
  vehicleName: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  amount: number;
  emiPlan?: string;
  bookedAt: string;
}

interface BookingState {
  bookings: Booking[];
  selectedBooking: string | null;
  isLoading: boolean;
}

const initialState: BookingState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
    },
    selectBooking: (state, action: PayloadAction<string>) => {
      state.selectedBooking = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setBookings, selectBooking, setLoading } = bookingSlice.actions;
export default bookingSlice.reducer;
