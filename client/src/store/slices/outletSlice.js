import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import outletService from "../../services/outletService";
import outletsService from "../../services/outletsService";

// Async thunks for basic outlet operations (used by auth)
export const fetchOutlets = createAsyncThunk(
  "outlets/fetchOutlets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await outletService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch outlets" }
      );
    }
  }
);

export const fetchOutletById = createAsyncThunk(
  "outlets/fetchOutletById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await outletService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch outlet" }
      );
    }
  }
);

// Async thunks for full CRUD operations (used by Outlets page)
export const fetchAllOutlets = createAsyncThunk(
  "outlets/fetchAllOutlets",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await outletsService.getAll(params);
      return response?.data?.outlets || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch outlets"
      );
    }
  }
);

export const createOutlet = createAsyncThunk(
  "outlets/createOutlet",
  async (outletData, { rejectWithValue }) => {
    try {
      const response = await outletsService.create(outletData);
      return response?.data?.outlet || response?.data;
    } catch (error) {
      const data = error?.response?.data;
      if (Array.isArray(data?.errors) || Array.isArray(data?.details)) {
        const details = data?.errors || data?.details || [];
        const mapped = {};
        details.forEach((d) => {
          if (d?.path?.[0]) mapped[d.path[0]] = d.msg || d.message;
          if (d?.field) mapped[d.field] = d.message;
        });
        return rejectWithValue({
          message: data?.message || "Validation failed",
          errors: mapped,
        });
      }
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create outlet"
      );
    }
  }
);

export const updateOutlet = createAsyncThunk(
  "outlets/updateOutlet",
  async ({ id, outletData }, { rejectWithValue }) => {
    try {
      const response = await outletsService.update(id, outletData);
      return response?.data?.outlet || response?.data;
    } catch (error) {
      const data = error?.response?.data;
      if (Array.isArray(data?.errors) || Array.isArray(data?.details)) {
        const details = data?.errors || data?.details || [];
        const mapped = {};
        details.forEach((d) => {
          if (d?.path?.[0]) mapped[d.path[0]] = d.msg || d.message;
          if (d?.field) mapped[d.field] = d.message;
        });
        return rejectWithValue({
          message: data?.message || "Validation failed",
          errors: mapped,
        });
      }
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update outlet"
      );
    }
  }
);

export const deleteOutlet = createAsyncThunk(
  "outlets/deleteOutlet",
  async (id, { rejectWithValue }) => {
    try {
      await outletsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete outlet"
      );
    }
  }
);

// Initial state
const initialState = {
  outlets: [],
  currentOutlet: null,
  allOutlets: [], // For the Outlets management page
  selectedOutlet: null,
  loading: false,
  error: null,
  formData: {
    name: "",
    code: "",
    type: "restaurant",
    timezone: "",
    currency: "UGX",
    isActive: true,
  },
  formErrors: {},
  showCreateModal: false,
  showEditModal: false,
  searchTerm: "",
  filters: {
    type: "",
    status: "",
    search: "",
  },
};

// Outlet slice
const outletSlice = createSlice({
  name: "outlets",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOutlet: (state, action) => {
      state.currentOutlet = action.payload;
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    setShowCreateModal: (state, action) => {
      state.showCreateModal = action.payload;
    },
    setShowEditModal: (state, action) => {
      state.showEditModal = action.payload;
    },
    setSelectedOutlet: (state, action) => {
      state.selectedOutlet = action.payload;
      if (action.payload) {
        state.formData = {
          name: action.payload.name || "",
          code: action.payload.code || "",
          type: action.payload.type || "restaurant",
          timezone: action.payload.timezone || "",
          currency: action.payload.currency || "UGX",
          isActive: action.payload.isActive,
        };
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = {
        name: "",
        code: "",
        type: "restaurant",
        timezone: "",
        currency: "UGX",
        isActive: true,
      };
      state.formErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch outlets (for auth)
      .addCase(fetchOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.outlets = action.payload.outlets || action.payload;
        state.error = null;
      })
      .addCase(fetchOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch outlet by ID
      .addCase(fetchOutletById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOutletById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOutlet = action.payload.outlet || action.payload;
        state.error = null;
      })
      .addCase(fetchOutletById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Outlets (for management)
      .addCase(fetchAllOutlets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.allOutlets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Outlet
      .addCase(createOutlet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createOutlet.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.allOutlets.unshift(action.payload);
        }
        state.showCreateModal = false;
        state.formData = {
          name: "",
          code: "",
          type: "restaurant",
          timezone: "",
          currency: "UGX",
          isActive: true,
        };
      })
      .addCase(createOutlet.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Update Outlet
      .addCase(updateOutlet.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(updateOutlet.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.allOutlets.findIndex(
            (o) => o.id === action.payload.id
          );
          if (index !== -1) {
            state.allOutlets[index] = action.payload;
          }
        }
        state.showEditModal = false;
        state.selectedOutlet = null;
        state.formData = {
          name: "",
          code: "",
          type: "restaurant",
          timezone: "",
          currency: "UGX",
          isActive: true,
        };
      })
      .addCase(updateOutlet.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Delete Outlet
      .addCase(deleteOutlet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOutlet.fulfilled, (state, action) => {
        state.loading = false;
        state.allOutlets = state.allOutlets.filter(
          (o) => o.id !== action.payload
        );
      })
      .addCase(deleteOutlet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentOutlet,
  setFormData,
  setFormErrors,
  setShowCreateModal,
  setShowEditModal,
  setSelectedOutlet,
  setSearchTerm,
  setFilters,
  resetForm,
} = outletSlice.actions;

// Selectors
export const selectOutlets = (state) => state.outlets.outlets;
export const selectCurrentOutlet = (state) => state.outlets.currentOutlet;
export const selectOutletsLoading = (state) => state.outlets.loading;
export const selectOutletsError = (state) => state.outlets.error;

// New selectors for management page
export const selectAllOutlets = (state) => state.outlets.allOutlets;
export const selectSelectedOutlet = (state) => state.outlets.selectedOutlet;
export const selectOutletsFormData = (state) => state.outlets.formData;
export const selectOutletsFormErrors = (state) => state.outlets.formErrors;
export const selectShowCreateModal = (state) => state.outlets.showCreateModal;
export const selectShowEditModal = (state) => state.outlets.showEditModal;
export const selectOutletsSearchTerm = (state) => state.outlets.searchTerm;
export const selectOutletsFilters = (state) => state.outlets.filters;

export const selectFilteredOutlets = (state) => {
  const outlets = state.outlets.allOutlets;
  const searchTerm = state.outlets.searchTerm;
  const filters = state.outlets.filters;

  return outlets.filter((outlet) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        outlet.name?.toLowerCase().includes(search) ||
        outlet.code?.toLowerCase().includes(search) ||
        outlet.type?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type filter
    if (filters.type && outlet.type !== filters.type) {
      return false;
    }

    // Status filter
    if (filters.status !== "" && filters.status !== undefined) {
      const isActive = filters.status === "active";
      if (outlet.isActive !== isActive) return false;
    }

    return true;
  });
};

export default outletSlice.reducer;
