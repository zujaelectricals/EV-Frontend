import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StaffMember {
  id: string;
  name: string;
  department: string;
  performance: number;
  targets: number;
  achieved: number;
}

interface StaffState {
  members: StaffMember[];
  selectedMember: string | null;
  isLoading: boolean;
}

const initialState: StaffState = {
  members: [],
  selectedMember: null,
  isLoading: false,
};

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setMembers: (state, action: PayloadAction<StaffMember[]>) => {
      state.members = action.payload;
    },
    selectMember: (state, action: PayloadAction<string>) => {
      state.selectedMember = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setMembers, selectMember, setLoading } = staffSlice.actions;
export default staffSlice.reducer;
