import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { tablesAPI, outletsAPI } from "../../services/apiClient";

// Async Thunks for CRUD operations
export const fetchTables = createAsyncThunk(
  "tables/fetchTables",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.getAll(filters);
      return response?.data?.tables || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tables"
      );
    }
  }
);

export const fetchOutlets = createAsyncThunk(
  "tables/fetchOutlets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await outletsAPI.getAll();
      return response?.data?.outlets || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch outlets"
      );
    }
  }
);

export const createTable = createAsyncThunk(
  "tables/createTable",
  async (tableData, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.create(tableData);
      return response?.data?.table || response?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to create table",
        errors:
          error.response?.data?.errors || error.response?.data?.details || [],
      });
    }
  }
);

export const updateTable = createAsyncThunk(
  "tables/updateTable",
  async ({ id, tableData }, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.update(id, tableData);
      return response?.data?.table || response?.data;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || "Failed to update table",
        errors:
          error.response?.data?.errors || error.response?.data?.details || [],
      });
    }
  }
);

export const deleteTable = createAsyncThunk(
  "tables/deleteTable",
  async (id, { rejectWithValue }) => {
    try {
      await tablesAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete table"
      );
    }
  }
);

export const updateTableStatus = createAsyncThunk(
  "tables/updateTableStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.update(id, { status });
      return response?.data?.table || response?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update table status"
      );
    }
  }
);

const initialState = {
  tables: [],
  outlets: [],
  filteredTables: [],
  loading: false,
  error: null,
  formData: {
    outletId: "",
    tableNumber: "",
    name: "",
    capacity: 2,
    minCapacity: 1,
    maxCapacity: 8,
    tableType: "standard",
    status: "available",
    isActive: true,
  },
  formErrors: {},
  showForm: false,
  editingTable: null,
  viewingTable: null,
  filters: {
    search: "",
    outletId: "",
    status: "",
    tableType: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const tablesSlice = createSlice({
  name: "tables",
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
    setEditingTable: (state, action) => {
      state.editingTable = action.payload;
      if (action.payload) {
        state.formData = {
          outletId: action.payload.outletId || "",
          tableNumber: action.payload.tableNumber || "",
          name: action.payload.name || "",
          capacity: action.payload.capacity || 2,
          minCapacity: action.payload.minCapacity || 1,
          maxCapacity: action.payload.maxCapacity || 8,
          tableType: action.payload.tableType || "standard",
          status: action.payload.status || "available",
          isActive:
            action.payload.isActive !== undefined
              ? action.payload.isActive
              : true,
        };
      }
    },
    setViewingTable: (state, action) => {
      state.viewingTable = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Apply filters to tables
      state.filteredTables = state.tables.filter((table) => {
        const { search, outletId, status, tableType } = state.filters;

        // Search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesSearch =
            table.tableNumber?.toLowerCase().includes(searchLower) ||
            table.name?.toLowerCase().includes(searchLower) ||
            table.tableType?.toLowerCase().includes(searchLower) ||
            table.status?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }

        // Outlet filter
        if (outletId && table.outletId !== outletId) return false;

        // Status filter
        if (status && table.status !== status) return false;

        // Table type filter
        if (tableType && table.tableType !== tableType) return false;

        return true;
      });
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
      state.editingTable = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTablesState: (state) => {
      return { ...initialState, outlets: state.outlets };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = Array.isArray(action.payload) ? action.payload : [];
        state.filteredTables = state.tables;
        state.pagination.total = state.tables.length;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Outlets
      .addCase(fetchOutlets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOutlets.fulfilled, (state, action) => {
        state.loading = false;
        state.outlets = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOutlets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Table
      .addCase(createTable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createTable.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.tables.unshift(action.payload);
          state.filteredTables = state.tables;
        }
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createTable.rejected, (state, action) => {
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

      // Update Table
      .addCase(updateTable.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.tables.findIndex(
            (t) => t.id === action.payload.id
          );
          if (index !== -1) {
            state.tables[index] = action.payload;
            state.filteredTables = state.tables;
          }
        }
        state.showForm = false;
        state.editingTable = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updateTable.rejected, (state, action) => {
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

      // Delete Table
      .addCase(deleteTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = state.tables.filter((t) => t.id !== action.payload);
        state.filteredTables = state.tables;
      })
      .addCase(deleteTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Table Status
      .addCase(updateTableStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTableStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.tables.findIndex(
            (t) => t.id === action.payload.id
          );
          if (index !== -1) {
            state.tables[index] = action.payload;
            state.filteredTables = state.tables;
          }
        }
      })
      .addCase(updateTableStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingTable,
  setViewingTable,
  setFilters,
  resetForm,
  clearError,
  resetTablesState,
} = tablesSlice.actions;

// Selectors
export const selectTables = (state) => state.tables.tables;
export const selectFilteredTables = (state) => state.tables.filteredTables;
export const selectOutlets = (state) => state.tables.outlets;
export const selectTablesLoading = (state) => state.tables.loading;
export const selectTablesError = (state) => state.tables.error;
export const selectTablesFormData = (state) => state.tables.formData;
export const selectTablesFormErrors = (state) => state.tables.formErrors;
export const selectShowTablesForm = (state) => state.tables.showForm;
export const selectEditingTable = (state) => state.tables.editingTable;
export const selectViewingTable = (state) => state.tables.viewingTable;
export const selectTablesFilters = (state) => state.tables.filters;
export const selectTablesPagination = (state) => state.tables.pagination;

export default tablesSlice.reducer;
