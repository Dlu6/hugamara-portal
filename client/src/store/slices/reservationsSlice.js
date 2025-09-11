import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import {
  reservationsAPI,
  tablesAPI,
  guestsAPI,
  ordersAPI,
} from "../../services/apiClient";
import api from "../../services/apiClient";

// Async Thunks for CRUD operations
export const fetchReservations = createAsyncThunk(
  "reservations/fetchReservations",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.getAll(filters);
      return response?.data?.reservations || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch reservations"
      );
    }
  }
);

export const fetchTables = createAsyncThunk(
  "reservations/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.getAll();
      return response?.data?.tables || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tables"
      );
    }
  }
);

export const fetchGuests = createAsyncThunk(
  "reservations/fetchGuests",
  async (params = { limit: 100 }, { rejectWithValue }) => {
    try {
      const response = await guestsAPI.getAll(params);
      return response?.data?.guests || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch guests"
      );
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservations/createReservation",
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.create(reservationData);
      return response?.data?.reservation || response?.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || "Failed to create reservation",
        errors:
          error.response?.data?.errors || error.response?.data?.details || [],
      });
    }
  }
);

export const updateReservation = createAsyncThunk(
  "reservations/updateReservation",
  async ({ id, reservationData }, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.update(id, reservationData);
      return response?.data?.reservation || response?.data;
    } catch (error) {
      return rejectWithValue({
        message:
          error.response?.data?.message || "Failed to update reservation",
        errors:
          error.response?.data?.errors || error.response?.data?.details || [],
      });
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservations/deleteReservation",
  async (id, { rejectWithValue }) => {
    try {
      await reservationsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete reservation"
      );
    }
  }
);

export const updateReservationStatus = createAsyncThunk(
  "reservations/updateReservationStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/reservations/${id}/status`, {
        status,
      });
      return {
        id,
        status,
        data: response?.data?.reservation || response?.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update reservation status"
      );
    }
  }
);

export const seatReservation = createAsyncThunk(
  "reservations/seatReservation",
  async ({ id, tableId }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/reservations/${id}/seat`, { tableId });
      return {
        id,
        tableId,
        data: response?.data?.reservation || response?.data,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to seat reservation"
      );
    }
  }
);

export const createGuest = createAsyncThunk(
  "reservations/createGuest",
  async (guestData, { rejectWithValue }) => {
    try {
      const response = await guestsAPI.create(guestData);
      return response?.data?.guest || response?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to create guest",
        errors:
          error.response?.data?.errors || error.response?.data?.details || [],
      });
    }
  }
);

export const createOrderFromReservation = createAsyncThunk(
  "reservations/createOrderFromReservation",
  async (reservation, { rejectWithValue }) => {
    try {
      const orderData = {
        orderType: "dine_in",
        tableId: reservation.tableId,
        reservationId: reservation.id,
        guestId: reservation.guestId,
        priority: "normal",
        specialInstructions: `Order for reservation ${reservation.reservationNumber}`,
      };
      const response = await ordersAPI.create(orderData);
      return response?.data?.order || response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }
);

const initialState = {
  reservations: [],
  tables: [],
  guests: [],
  filteredReservations: [],
  loading: false,
  tablesLoading: false,
  guestsLoading: false,
  error: null,
  formData: {
    guestId: "",
    reservationDate: "",
    reservationTime: "",
    partySize: 1,
    specialRequests: "",
  },
  formErrors: {},
  showForm: false,
  editingReservation: null,
  viewingReservation: null,
  seatModal: {
    open: false,
    reservationId: null,
    tableId: "",
  },
  guestForm: {
    firstName: "",
    lastName: "",
    phone: "",
  },
  guestFormErrors: {},
  showGuestForm: false,
  filters: {
    search: "",
    status: "",
    date: "",
    partySize: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const reservationsSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingReservation: (state, action) => {
      state.editingReservation = action.payload;
      if (action.payload) {
        state.formData = {
          guestId: action.payload.guestId || "",
          reservationDate: action.payload.reservationDate || "",
          reservationTime: action.payload.reservationTime || "",
          partySize: action.payload.partySize || 1,
          specialRequests: action.payload.specialRequests || "",
        };
      }
    },
    setViewingReservation: (state, action) => {
      state.viewingReservation = action.payload;
    },
    setSeatModal: (state, action) => {
      state.seatModal = { ...state.seatModal, ...action.payload };
    },
    setGuestForm: (state, action) => {
      state.guestForm = { ...state.guestForm, ...action.payload };
    },
    setGuestFormErrors: (state, action) => {
      state.guestFormErrors = action.payload;
    },
    setShowGuestForm: (state, action) => {
      state.showGuestForm = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters to reservations
      state.filteredReservations = state.reservations.filter((reservation) => {
        const { search, status, date, partySize } = state.filters;

        // Search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesSearch =
            reservation.reservationNumber
              ?.toLowerCase()
              .includes(searchLower) ||
            reservation.guest?.firstName?.toLowerCase().includes(searchLower) ||
            reservation.guest?.lastName?.toLowerCase().includes(searchLower) ||
            reservation.guest?.phone?.toLowerCase().includes(searchLower) ||
            reservation.specialRequests?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (status && reservation.status !== status) return false;

        // Date filter
        if (date && reservation.reservationDate !== date) return false;

        // Party size filter
        if (partySize && reservation.partySize !== parseInt(partySize))
          return false;

        return true;
      });
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
      state.editingReservation = null;
    },
    resetGuestForm: (state) => {
      state.guestForm = initialState.guestForm;
      state.guestFormErrors = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    resetReservationsState: (state) => {
      return { ...initialState, tables: state.tables, guests: state.guests };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = Array.isArray(action.payload)
          ? action.payload
          : [];
        state.filteredReservations = state.reservations;
        state.pagination.total = state.reservations.length;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Tables
      .addCase(fetchTables.pending, (state) => {
        state.tablesLoading = true;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.tablesLoading = false;
        state.tables = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.tablesLoading = false;
        state.error = action.payload;
      })

      // Fetch Guests
      .addCase(fetchGuests.pending, (state) => {
        state.guestsLoading = true;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.guestsLoading = false;
        state.guests = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.guestsLoading = false;
        state.error = action.payload;
      })

      // Create Reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.reservations.unshift(action.payload);
          state.filteredReservations = state.reservations;
        }
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        if (action.payload?.errors) {
          const errors = {};
          action.payload.errors.forEach((error) => {
            if (error.field) {
              errors[error.field] = error.message;
            }
          });
          state.formErrors = errors;
        }
      })

      // Update Reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.reservations.findIndex(
            (r) => r.id === action.payload.id
          );
          if (index !== -1) {
            state.reservations[index] = action.payload;
            state.filteredReservations = state.reservations;
          }
        }
        state.showForm = false;
        state.editingReservation = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
        if (action.payload?.errors) {
          const errors = {};
          action.payload.errors.forEach((error) => {
            if (error.field) {
              errors[error.field] = error.message;
            }
          });
          state.formErrors = errors;
        }
      })

      // Delete Reservation
      .addCase(deleteReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = state.reservations.filter(
          (r) => r.id !== action.payload
        );
        state.filteredReservations = state.reservations;
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Reservation Status
      .addCase(updateReservationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservationStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, status, data } = action.payload;
        const index = state.reservations.findIndex((r) => r.id === id);
        if (index !== -1) {
          if (data) {
            state.reservations[index] = data;
          } else {
            state.reservations[index].status = status;
          }
          state.filteredReservations = state.reservations;
        }
      })
      .addCase(updateReservationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Seat Reservation
      .addCase(seatReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(seatReservation.fulfilled, (state, action) => {
        state.loading = false;
        const { id, tableId, data } = action.payload;
        const index = state.reservations.findIndex((r) => r.id === id);
        if (index !== -1) {
          if (data) {
            state.reservations[index] = data;
          } else {
            state.reservations[index].status = "seated";
            state.reservations[index].tableId = tableId;
          }
          state.filteredReservations = state.reservations;
        }
        state.seatModal = initialState.seatModal;
      })
      .addCase(seatReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Guest
      .addCase(createGuest.pending, (state) => {
        state.guestsLoading = true;
        state.error = null;
        state.guestFormErrors = {};
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.guestsLoading = false;
        if (action.payload?.id) {
          state.guests.unshift(action.payload);
          state.formData.guestId = action.payload.id;
        }
        state.showGuestForm = false;
        state.guestForm = initialState.guestForm;
        state.guestFormErrors = {};
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.guestsLoading = false;
        state.error = action.payload?.message || action.payload;
        if (action.payload?.errors) {
          const errors = {};
          action.payload.errors.forEach((error) => {
            if (error.field) {
              errors[error.field] = error.message;
            }
          });
          state.guestFormErrors = errors;
        }
      })

      // Create Order from Reservation
      .addCase(createOrderFromReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrderFromReservation.fulfilled, (state, action) => {
        state.loading = false;
        // Order created successfully - no state changes needed here
        // The navigation will be handled in the component
      })
      .addCase(createOrderFromReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingReservation,
  setViewingReservation,
  setSeatModal,
  setGuestForm,
  setGuestFormErrors,
  setShowGuestForm,
  setFilters,
  resetForm,
  resetGuestForm,
  clearError,
  resetReservationsState,
} = reservationsSlice.actions;

// Selectors
export const selectReservations = (state) => state.reservations.reservations;
export const selectFilteredReservations = (state) =>
  state.reservations.filteredReservations;
export const selectTables = (state) => state.reservations.tables;
export const selectGuests = (state) => state.reservations.guests;
export const selectReservationsLoading = (state) => state.reservations.loading;
export const selectTablesLoading = (state) => state.reservations.tablesLoading;
export const selectGuestsLoading = (state) => state.reservations.guestsLoading;
export const selectReservationsError = (state) => state.reservations.error;
export const selectReservationsFormData = (state) =>
  state.reservations.formData;
export const selectReservationsFormErrors = (state) =>
  state.reservations.formErrors;
export const selectShowReservationsForm = (state) =>
  state.reservations.showForm;
export const selectEditingReservation = (state) =>
  state.reservations.editingReservation;
export const selectViewingReservation = (state) =>
  state.reservations.viewingReservation;
export const selectSeatModal = (state) => state.reservations.seatModal;
export const selectGuestForm = (state) => state.reservations.guestForm;
export const selectGuestFormErrors = (state) =>
  state.reservations.guestFormErrors;
export const selectShowGuestForm = (state) => state.reservations.showGuestForm;
export const selectReservationsFilters = (state) => state.reservations.filters;
export const selectReservationsPagination = (state) =>
  state.reservations.pagination;

// Computed selectors
export const selectAvailableTables = createSelector(
  [(state) => state.reservations.tables],
  (tables) =>
    tables.filter((table) => table.status === "available" && table.isActive)
);

export const selectReservationsByStatus = (status) =>
  createSelector([(state) => state.reservations.reservations], (reservations) =>
    reservations.filter((reservation) => reservation.status === status)
  );

export default reservationsSlice.reducer;
