import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
interface UIState { sidebarCollapsed: boolean; globalLoading: boolean; }
const initialState: UIState = { sidebarCollapsed: false, globalLoading: false };
const uiSlice = createSlice({
  name: 'ui', initialState,
  reducers: {
    toggleSidebar: (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => { state.sidebarCollapsed = action.payload; },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => { state.globalLoading = action.payload; },
  },
});
export const { toggleSidebar, setSidebarCollapsed, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;
