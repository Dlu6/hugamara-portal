import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import guestsService from "../../services/guestsService";

// Async Thunks
export const fetchGuests = createAsyncThunk(
  "guests/fetchGuests",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await guestsService.getAll(params);
      return {
        guests: response?.data?.guests || response?.guests || [],
        totalPages: response?.data?.totalPages || response?.totalPages || 1,
        currentPage: response?.data?.currentPage || response?.currentPage || 1,
        total: response?.data?.total || response?.total || 0,
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guests"
      );
    }
  }
);

export const fetchGuestById = createAsyncThunk(
  "guests/fetchGuestById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await guestsService.getById(id);
      return response?.guest || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guest"
      );
    }
  }
);

export const createGuest = createAsyncThunk(
  "guests/createGuest",
  async (guestData, { rejectWithValue }) => {
    try {
      const response = await guestsService.create(guestData);
      return response?.guest || response?.data;
    } catch (error) {
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        return rejectWithValue({
          message: error?.response?.data?.message || "Validation failed",
          errors,
        });
      }
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create guest"
      );
    }
  }
);

export const updateGuest = createAsyncThunk(
  "guests/updateGuest",
  async ({ id, guestData }, { rejectWithValue }) => {
    try {
      const response = await guestsService.update(id, guestData);
      return response?.guest || response?.data;
    } catch (error) {
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        return rejectWithValue({
          message: error?.response?.data?.message || "Validation failed",
          errors,
        });
      }
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update guest"
      );
    }
  }
);

export const deleteGuest = createAsyncThunk(
  "guests/deleteGuest",
  async (id, { rejectWithValue }) => {
    try {
      await guestsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete guest"
      );
    }
  }
);

export const fetchGuestStats = createAsyncThunk(
  "guests/fetchGuestStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await guestsService.getStats();
      return response?.data?.stats || response?.stats || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guest stats"
      );
    }
  }
);

export const fetchGuestHistory = createAsyncThunk(
  "guests/fetchGuestHistory",
  async (id, { rejectWithValue }) => {
    try {
      const response = await guestsService.getHistory(id);
      return response?.data || response;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guest history"
      );
    }
  }
);

export const updateLoyaltyPoints = createAsyncThunk(
  "guests/updateLoyaltyPoints",
  async ({ id, pointsData }, { rejectWithValue }) => {
    try {
      const response = await guestsService.updateLoyaltyPoints(id, pointsData);
      return { id, pointsData, guest: response?.guest || response?.data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update loyalty points"
      );
    }
  }
);

export const updateLoyaltyTier = createAsyncThunk(
  "guests/updateLoyaltyTier",
  async ({ id, tierData }, { rejectWithValue }) => {
    try {
      const response = await guestsService.updateLoyaltyTier(id, tierData);
      return { id, tierData, guest: response?.guest || response?.data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update loyalty tier"
      );
    }
  }
);

export const fetchGuestsByTier = createAsyncThunk(
  "guests/fetchGuestsByTier",
  async (tier, { rejectWithValue }) => {
    try {
      const response = await guestsService.getGuestsByTier(tier);
      return response?.guests || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guests by tier"
      );
    }
  }
);

export const fetchTopGuests = createAsyncThunk(
  "guests/fetchTopGuests",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await guestsService.getTopGuests(limit);
      return response?.guests || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch top guests"
      );
    }
  }
);

// Initial State
const initialState = {
  guests: [],
  guestsByTier: [],
  topGuests: [],
  selectedGuest: null,
  guestHistory: null,
  stats: {},
  loading: false,
  statsLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  total: 0,
  formData: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    country: "Uganda",
    preferences: "",
    allergies: "",
    dietaryRestrictions: "",
    loyaltyPoints: 0,
    loyaltyTier: "bronze",
    totalSpent: 0,
    visitCount: 0,
    isActive: true,
    marketingConsent: false,
    notes: "",
  },
  formErrors: {},
  showModal: false,
  editingGuest: null,
  showDetails: false,
  filters: {
    search: "",
    loyaltyTier: "",
    isActive: "all",
    page: 1,
    limit: 10,
  },
};

// Slice
const guestsSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    setShowModal: (state, action) => {
      state.showModal = action.payload;
    },
    setEditingGuest: (state, action) => {
      state.editingGuest = action.payload;
      if (action.payload) {
        state.formData = {
          firstName: action.payload.firstName || "",
          lastName: action.payload.lastName || "",
          email: action.payload.email || "",
          phone: action.payload.phone || "",
          dateOfBirth: action.payload.dateOfBirth || "",
          gender: action.payload.gender || "",
          address: action.payload.address || "",
          city: action.payload.city || "",
          country: action.payload.country || "Uganda",
          preferences: action.payload.preferences || "",
          allergies: action.payload.allergies || "",
          dietaryRestrictions: action.payload.dietaryRestrictions || "",
          loyaltyPoints: action.payload.loyaltyPoints || 0,
          loyaltyTier: action.payload.loyaltyTier || "bronze",
          totalSpent: action.payload.totalSpent || 0,
          visitCount: action.payload.visitCount || 0,
          isActive:
            action.payload.isActive !== undefined
              ? action.payload.isActive
              : true,
          marketingConsent: action.payload.marketingConsent || false,
          notes: action.payload.notes || "",
        };
      }
    },
    setShowDetails: (state, action) => {
      state.showDetails = action.payload;
    },
    setSelectedGuest: (state, action) => {
      state.selectedGuest = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    resetForm: (state) => {
      state.formData = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        country: "Uganda",
        preferences: "",
        allergies: "",
        dietaryRestrictions: "",
        loyaltyPoints: 0,
        loyaltyTier: "bronze",
        totalSpent: 0,
        visitCount: 0,
        isActive: true,
        marketingConsent: false,
        notes: "",
      };
      state.formErrors = {};
      state.editingGuest = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearFormError: (state, action) => {
      if (state.formErrors[action.payload]) {
        delete state.formErrors[action.payload];
      }
    },
    resetGuestsState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Guests
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload.guests;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.total = action.payload.total;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Guest By ID
      .addCase(fetchGuestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuestById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGuest = action.payload;
      })
      .addCase(fetchGuestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Guest
      .addCase(createGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.guests.unshift(action.payload);
        }
        state.showModal = false;
        state.formData = {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          city: "",
          country: "Uganda",
          preferences: "",
          allergies: "",
          dietaryRestrictions: "",
          loyaltyPoints: 0,
          loyaltyTier: "bronze",
          totalSpent: 0,
          visitCount: 0,
          isActive: true,
          marketingConsent: false,
          notes: "",
        };
        state.editingGuest = null;
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Update Guest
      .addCase(updateGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.guests.findIndex(
            (g) => g.id === action.payload.id
          );
          if (index !== -1) {
            state.guests[index] = action.payload;
          }
        }
        state.showModal = false;
        state.editingGuest = null;
        state.formData = {
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          address: "",
          city: "",
          country: "Uganda",
          preferences: "",
          allergies: "",
          dietaryRestrictions: "",
          loyaltyPoints: 0,
          loyaltyTier: "bronze",
          totalSpent: 0,
          visitCount: 0,
          isActive: true,
          marketingConsent: false,
          notes: "",
        };
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Delete Guest
      .addCase(deleteGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = state.guests.filter((g) => g.id !== action.payload);
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Guest Stats
      .addCase(fetchGuestStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchGuestStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchGuestStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Fetch Guest History
      .addCase(fetchGuestHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.guestHistory = action.payload;
      })
      .addCase(fetchGuestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Loyalty Points
      .addCase(updateLoyaltyPoints.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLoyaltyPoints.fulfilled, (state, action) => {
        state.loading = false;
        const { id, pointsData } = action.payload;
        const index = state.guests.findIndex((g) => g.id === id);
        if (index !== -1) {
          state.guests[index].loyaltyPoints = pointsData.loyaltyPoints;
        }
      })
      .addCase(updateLoyaltyPoints.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Loyalty Tier
      .addCase(updateLoyaltyTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLoyaltyTier.fulfilled, (state, action) => {
        state.loading = false;
        const { id, tierData } = action.payload;
        const index = state.guests.findIndex((g) => g.id === id);
        if (index !== -1) {
          state.guests[index].loyaltyTier = tierData.loyaltyTier;
        }
      })
      .addCase(updateLoyaltyTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Guests By Tier
      .addCase(fetchGuestsByTier.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuestsByTier.fulfilled, (state, action) => {
        state.loading = false;
        state.guestsByTier = action.payload;
      })
      .addCase(fetchGuestsByTier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Top Guests
      .addCase(fetchTopGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.topGuests = action.payload;
      })
      .addCase(fetchTopGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const {
  setFormData,
  setFormErrors,
  setShowModal,
  setEditingGuest,
  setShowDetails,
  setSelectedGuest,
  setFilters,
  setCurrentPage,
  resetForm,
  clearError,
  clearFormError,
  resetGuestsState,
} = guestsSlice.actions;

// Selectors
export const selectGuests = (state) => state.guests.guests;
export const selectGuestsByTier = (state) => state.guests.guestsByTier;
export const selectTopGuests = (state) => state.guests.topGuests;
export const selectSelectedGuest = (state) => state.guests.selectedGuest;
export const selectGuestHistory = (state) => state.guests.guestHistory;
export const selectGuestStats = (state) => state.guests.stats;
export const selectGuestsLoading = (state) => state.guests.loading;
export const selectGuestsStatsLoading = (state) => state.guests.statsLoading;
export const selectGuestsError = (state) => state.guests.error;
export const selectGuestsFormData = (state) => state.guests.formData;
export const selectGuestsFormErrors = (state) => state.guests.formErrors;
export const selectShowGuestsModal = (state) => state.guests.showModal;
export const selectEditingGuest = (state) => state.guests.editingGuest;
export const selectShowGuestDetails = (state) => state.guests.showDetails;
export const selectGuestsFilters = (state) => state.guests.filters;
export const selectGuestsCurrentPage = (state) => state.guests.currentPage;
export const selectGuestsTotalPages = (state) => state.guests.totalPages;
export const selectGuestsTotal = (state) => state.guests.total;

export const selectFilteredGuests = (state) => {
  const guests = state.guests.guests;
  const filters = state.guests.filters;

  return guests.filter((guest) => {
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        guest.firstName?.toLowerCase().includes(search) ||
        guest.lastName?.toLowerCase().includes(search) ||
        guest.email?.toLowerCase().includes(search) ||
        guest.phone?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Loyalty tier filter
    if (filters.loyaltyTier && guest.loyaltyTier !== filters.loyaltyTier) {
      return false;
    }

    // Active status filter
    if (filters.isActive !== "all") {
      const isActive = filters.isActive === "active";
      if (guest.isActive !== isActive) return false;
    }

    return true;
  });
};

export default guestsSlice.reducer;
