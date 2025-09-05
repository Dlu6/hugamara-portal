import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import outletReducer from "./slices/outletSlice";
import reservationReducer from "./slices/reservationSlice";
import guestReducer from "./slices/guestSlice";
import ticketReducer from "./slices/ticketSlice";
import eventReducer from "./slices/eventSlice";
import eventsReducer from "./slices/eventsSlice";
import guestsReducer from "./slices/guestsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import menuReducer from "./slices/menuSlice";
import inventoryReducer from "./slices/inventorySlice";
import staffReducer from "./slices/staffSlice";
import shiftReducer from "./slices/shiftSlice";
import settingsReducer from "./slices/settingsSlice";
import ordersReducer from "./slices/ordersSlice";
import paymentsReducer from "./slices/paymentsSlice";
import tablesReducer from "./slices/tablesSlice";
import reservationsReducer from "./slices/reservationsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    outlets: outletReducer,
    reservation: reservationReducer,
    guest: guestReducer,
    ticket: ticketReducer,
    event: eventReducer,
    events: eventsReducer,
    guests: guestsReducer,
    dashboard: dashboardReducer,
    menu: menuReducer,
    inventory: inventoryReducer,
    staff: staffReducer,
    shifts: shiftReducer,
    settings: settingsReducer,
    orders: ordersReducer,
    payments: paymentsReducer,
    tables: tablesReducer,
    reservations: reservationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
        ignoredPaths: [
          "payload.headers",
          "payload.config",
          "payload.request",
          "payload.response",
        ],
      },
    }),
});

export default store;
