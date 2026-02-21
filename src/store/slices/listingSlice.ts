import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Listing } from '../../types';
interface ListingState { listings: Listing[]; selectedListing: Listing | null; loading: boolean; }
const initialState: ListingState = { listings: [], selectedListing: null, loading: false };
const listingSlice = createSlice({
  name: 'listing', initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Listing[]>) => { state.listings = action.payload; state.loading = false; },
    setSelectedListing: (state, action: PayloadAction<Listing | null>) => { state.selectedListing = action.payload; },
    updateListing: (state, action: PayloadAction<Listing>) => { const idx = state.listings.findIndex(l => l._id === action.payload._id); if (idx !== -1) state.listings[idx] = action.payload; },
    setLoading: (state, action: PayloadAction<boolean>) => { state.loading = action.payload; },
  },
});
export const { setListings, setSelectedListing, updateListing, setLoading } = listingSlice.actions;
export default listingSlice.reducer;
