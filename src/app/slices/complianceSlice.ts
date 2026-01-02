import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ComplianceAlert {
  id: string;
  type: 'fraud' | 'duplicate' | 'risk' | 'audit';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: string;
  resolved: boolean;
}

interface ComplianceState {
  alerts: ComplianceAlert[];
  unresolvedCount: number;
  isLoading: boolean;
}

const initialState: ComplianceState = {
  alerts: [],
  unresolvedCount: 0,
  isLoading: false,
};

const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<ComplianceAlert[]>) => {
      state.alerts = action.payload;
      state.unresolvedCount = action.payload.filter((a) => !a.resolved).length;
    },
    resolveAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) {
        alert.resolved = true;
        state.unresolvedCount = state.alerts.filter((a) => !a.resolved).length;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setAlerts, resolveAlert, setLoading } = complianceSlice.actions;
export default complianceSlice.reducer;
