import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DashboardStats } from '../../types';
interface DashboardState { stats: DashboardStats | null; loading: boolean; }
const initialState: DashboardState = { stats: null, loading: false };
const dashboardSlice = createSlice({
  name: 'dashboard', initialState,
  reducers: {
    setStats: (state, action: PayloadAction<DashboardStats>) => { state.stats = action.payload; state.loading = false; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
  },
});
export const { setStats, setLoading } = dashboardSlice.actions;
export default dashboardSlice.reducer;
