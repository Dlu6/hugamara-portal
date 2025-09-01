import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import outletReducer from './slices/outletSlice';
import reservationReducer from './slices/reservationSlice';
import guestReducer from './slices/guestSlice';
import ticketReducer from './slices/ticketSlice';
import eventReducer from './slices/eventSlice';
import dashboardReducer from './slices/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    outlets: outletReducer,
    reservation: reservationReducer,
    guest: guestReducer,
    ticket: ticketReducer,
    event: eventReducer,
    dashboard: dashboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;