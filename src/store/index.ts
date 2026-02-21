import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import dashboardReducer from './slices/dashboardSlice';
import vendorReducer from './slices/vendorSlice';
import listingReducer from './slices/listingSlice';
import uiReducer from './slices/uiSlice';
export const store = configureStore({
  reducer: { auth: authReducer, dashboard: dashboardReducer, vendor: vendorReducer, listing: listingReducer, ui: uiReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
