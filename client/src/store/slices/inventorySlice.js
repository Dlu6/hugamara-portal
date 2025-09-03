import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { inventoryAPI } from "../../services/apiClient";

// Async thunks
export const fetchInventory = createAsyncThunk(
  "inventory/fetchInventory",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchInventoryById = createAsyncThunk(
  "inventory/fetchInventoryById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createInventoryItem = createAsyncThunk(
  "inventory/createInventoryItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.create(itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  "inventory/updateInventoryItem",
  async ({ id, itemData }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.update(id, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  "inventory/deleteInventoryItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.delete(id);
      return { id, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  "inventory/fetchInventoryStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStock = createAsyncThunk(
  "inventory/updateStock",
  async ({ id, stockData }, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.updateStock(id, stockData);
      return { id, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getLowStockItems = createAsyncThunk(
  "inventory/getLowStockItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getLowStock();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getExpiringItems = createAsyncThunk(
  "inventory/getExpiringItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await inventoryAPI.getExpiring();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  inventory: [],
  filteredInventory: [],
  selectedItem: null,
  stats: {},
  lowStockItems: [],
  expiringItems: [],
  loading: false,
  error: null,
  filters: {
    category: "",
    search: "",
    status: "",
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  formData: {
    itemName: "",
    category: "food",
    subcategory: "",
    sku: "",
    barcode: "",
    description: "",
    unit: "piece",
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    unitCost: 0,
    supplierName: "",
    leadTime: 0,
    expiryDate: "",
    isPerishable: false,
    location: "",
    notes: "",
  },
  formErrors: {},
  showForm: false,
  editingItem: null,
  viewingItem: null,
  stockUpdateModal: null,
  stockUpdateData: {
    quantity: "",
    type: "add",
  },
};

// Inventory slice
const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    // Form management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    clearFormErrors: (state) => {
      state.formErrors = {};
    },

    // UI state management
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingItem: (state, action) => {
      state.editingItem = action.payload;
      if (action.payload) {
        state.formData = { ...action.payload };
        state.showForm = true;
      }
    },
    setViewingItem: (state, action) => {
      state.viewingItem = action.payload;
    },
    setStockUpdateModal: (state, action) => {
      state.stockUpdateModal = action.payload;
    },
    setStockUpdateData: (state, action) => {
      state.stockUpdateData = { ...state.stockUpdateData, ...action.payload };
    },

    // Filtering and search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload;
    },
    setCategoryFilter: (state, action) => {
      state.filters.category = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },

    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetInventoryState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch inventory
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload.inventory || action.payload;
        state.filteredInventory = action.payload.inventory || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
          state.pagination.totalPages = action.payload.totalPages || 0;
        }
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch inventory by ID
      .addCase(fetchInventoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedItem = action.payload.item || action.payload;
      })
      .addCase(fetchInventoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create inventory item
      .addCase(createInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const newItem = action.payload.item || action.payload;
        state.inventory.unshift(newItem);
        state.filteredInventory.unshift(newItem);
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update inventory item
      .addCase(updateInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.item || action.payload;
        const index = state.inventory.findIndex(
          (item) => item.id === updatedItem.id
        );
        if (index !== -1) {
          state.inventory[index] = updatedItem;
          state.filteredInventory[index] = updatedItem;
        }
        state.showForm = false;
        state.editingItem = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updateInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete inventory item
      .addCase(deleteInventoryItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.inventory = state.inventory.filter(
          (item) => item.id !== deletedId
        );
        state.filteredInventory = state.filteredInventory.filter(
          (item) => item.id !== deletedId
        );
      })
      .addCase(deleteInventoryItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch inventory stats
      .addCase(fetchInventoryStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats || action.payload;
      })
      .addCase(fetchInventoryStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update stock
      .addCase(updateStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        state.loading = false;
        const { id, response } = action.payload;
        const updatedItem = response.item || response;
        const index = state.inventory.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.inventory[index] = updatedItem;
          state.filteredInventory[index] = updatedItem;
        }
        state.stockUpdateModal = null;
        state.stockUpdateData = initialState.stockUpdateData;
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get low stock items
      .addCase(getLowStockItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLowStockItems.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStockItems = action.payload.items || action.payload;
      })
      .addCase(getLowStockItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get expiring items
      .addCase(getExpiringItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExpiringItems.fulfilled, (state, action) => {
        state.loading = false;
        state.expiringItems = action.payload.items || action.payload;
      })
      .addCase(getExpiringItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Export actions
export const {
  setFormData,
  resetFormData,
  setFormErrors,
  clearFormErrors,
  setShowForm,
  setEditingItem,
  setViewingItem,
  setStockUpdateModal,
  setStockUpdateData,
  setFilters,
  clearFilters,
  setSearchTerm,
  setCategoryFilter,
  setStatusFilter,
  setPagination,
  setPage,
  clearError,
  resetInventoryState,
} = inventorySlice.actions;

// Selectors
export const selectInventory = (state) => state.inventory.inventory;
export const selectFilteredInventory = (state) =>
  state.inventory.filteredInventory;
export const selectSelectedItem = (state) => state.inventory.selectedItem;
export const selectInventoryStats = (state) => state.inventory.stats;
export const selectLowStockItems = (state) => state.inventory.lowStockItems;
export const selectExpiringItems = (state) => state.inventory.expiringItems;
export const selectInventoryLoading = (state) => state.inventory.loading;
export const selectInventoryError = (state) => state.inventory.error;
export const selectInventoryFilters = (state) => state.inventory.filters;
export const selectInventoryPagination = (state) => state.inventory.pagination;
export const selectInventoryFormData = (state) => state.inventory.formData;
export const selectInventoryFormErrors = (state) => state.inventory.formErrors;
export const selectShowInventoryForm = (state) => state.inventory.showForm;
export const selectEditingItem = (state) => state.inventory.editingItem;
export const selectViewingItem = (state) => state.inventory.viewingItem;
export const selectStockUpdateModal = (state) =>
  state.inventory.stockUpdateModal;
export const selectStockUpdateData = (state) => state.inventory.stockUpdateData;

export default inventorySlice.reducer;
