import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Vendor } from '../../types';
interface VendorState { vendors: Vendor[]; selectedVendor: Vendor | null; loading: boolean; }
const initialState: VendorState = { vendors: [], selectedVendor: null, loading: false };
const vendorSlice = createSlice({
  name: 'vendor', initialState,
  reducers: {
    setVendors: (state, action: PayloadAction<Vendor[]>) => { state.vendors = action.payload; state.loading = false; },
    setSelectedVendor: (state, action: PayloadAction<Vendor | null>) => { state.selectedVendor = action.payload; },
    updateVendor: (state, action: PayloadAction<Vendor>) => { const idx = state.vendors.findIndex(v => v._id === action.payload._id); if (idx !== -1) state.vendors[idx] = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
  },
});
export const { setVendors, setSelectedVendor, updateVendor, setLoading } = vendorSlice.actions;
export default vendorSlice.reducer;
