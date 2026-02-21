import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser } from '../../types';
interface AuthState { user: AdminUser | null; token: string | null; isAuthenticated: boolean; loading: boolean; error: string | null; }
const initialState: AuthState = { user: null, token: null, isAuthenticated: false, loading: false, error: null };
const authSlice = createSlice({
  name: 'auth', initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
    setCredentials: (state, action: PayloadAction<{ user: AdminUser; token: string }>) => { state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; state.error = null; },
    setError: (state, action: PayloadAction<string>) => { state.error = action.payload; state.loading = false; },
    clearAuth: () => initialState,
  },
});
export const { setLoading, setCredentials, setError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
