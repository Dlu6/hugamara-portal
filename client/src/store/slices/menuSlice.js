import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import menuService from "../../services/menuService";

// Async thunks
export const fetchMenuItems = createAsyncThunk(
  "menu/fetchMenuItems",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await menuService.getAllMenuItems(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMenuItemById = createAsyncThunk(
  "menu/fetchMenuItemById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuItemById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createMenuItem = createAsyncThunk(
  "menu/createMenuItem",
  async (menuData, { rejectWithValue }) => {
    try {
      const response = await menuService.createMenuItem(menuData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateMenuItem = createAsyncThunk(
  "menu/updateMenuItem",
  async ({ id, menuData }, { rejectWithValue }) => {
    try {
      const response = await menuService.updateMenuItem(id, menuData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteMenuItem = createAsyncThunk(
  "menu/deleteMenuItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.deleteMenuItem(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchMenuStats = createAsyncThunk(
  "menu/fetchMenuStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await menuService.getMenuStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchMenuItems = createAsyncThunk(
  "menu/searchMenuItems",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await menuService.searchMenuItems(query, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleAvailability = createAsyncThunk(
  "menu/toggleAvailability",
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.toggleAvailability(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleFeatured = createAsyncThunk(
  "menu/toggleFeatured",
  async (id, { rejectWithValue }) => {
    try {
      const response = await menuService.toggleFeatured(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  menuItems: [],
  filteredMenuItems: [],
  selectedMenuItem: null,
  menuStats: {},
  loading: false,
  error: null,
  filters: {
    category: "",
    search: "",
    availability: "",
    featured: "",
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  formData: {
    name: "",
    description: "",
    category: "main_course",
    subcategory: "",
    price: 0,
    cost: 0,
    isAvailable: true,
    isFeatured: false,
    allergens: [],
    dietaryTags: [],
    preparationTime: 0,
    calories: 0,
    imageUrl: "",
    ingredients: [],
    nutritionalInfo: {},
    tags: [],
  },
  formErrors: {},
  showForm: false,
  editingMenuItem: null,
  viewingMenuItem: null,
};

// Menu slice
const menuSlice = createSlice({
  name: "menu",
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
    setEditingMenuItem: (state, action) => {
      state.editingMenuItem = action.payload;
      if (action.payload) {
        state.formData = { ...action.payload };
        state.showForm = true;
      }
    },
    setViewingMenuItem: (state, action) => {
      state.viewingMenuItem = action.payload;
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
    resetMenuState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch menu items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = action.payload.menuItems || action.payload;
        state.filteredMenuItems = action.payload.menuItems || action.payload;
        if (action.payload.total !== undefined) {
          state.pagination.total = action.payload.total;
          state.pagination.totalPages = action.payload.totalPages || 0;
        }
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch menu item by ID
      .addCase(fetchMenuItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItemById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMenuItem = action.payload.menuItem || action.payload;
      })
      .addCase(fetchMenuItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create menu item
      .addCase(createMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const newMenuItem = action.payload.menuItem || action.payload;
        state.menuItems.unshift(newMenuItem);
        state.filteredMenuItems.unshift(newMenuItem);
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update menu item
      .addCase(updateMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedMenuItem = action.payload.menuItem || action.payload;
        const index = state.menuItems.findIndex(
          (item) => item.id === updatedMenuItem.id
        );
        if (index !== -1) {
          state.menuItems[index] = updatedMenuItem;
          state.filteredMenuItems[index] = updatedMenuItem;
        }
        state.showForm = false;
        state.editingMenuItem = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updateMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete menu item
      .addCase(deleteMenuItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.menuItems = state.menuItems.filter(
          (item) => item.id !== deletedId
        );
        state.filteredMenuItems = state.filteredMenuItems.filter(
          (item) => item.id !== deletedId
        );
      })
      .addCase(deleteMenuItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch menu stats
      .addCase(fetchMenuStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuStats.fulfilled, (state, action) => {
        state.loading = false;
        state.menuStats = action.payload.stats || action.payload;
      })
      .addCase(fetchMenuStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search menu items
      .addCase(searchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredMenuItems = action.payload.menuItems || action.payload;
      })
      .addCase(searchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle availability
      .addCase(toggleAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAvailability.fulfilled, (state, action) => {
        state.loading = false;
        const { id, response } = action.payload;
        const updatedMenuItem = response.menuItem || response;
        const index = state.menuItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.menuItems[index] = updatedMenuItem;
          state.filteredMenuItems[index] = updatedMenuItem;
        }
      })
      .addCase(toggleAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle featured
      .addCase(toggleFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFeatured.fulfilled, (state, action) => {
        state.loading = false;
        const { id, response } = action.payload;
        const updatedMenuItem = response.menuItem || response;
        const index = state.menuItems.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.menuItems[index] = updatedMenuItem;
          state.filteredMenuItems[index] = updatedMenuItem;
        }
      })
      .addCase(toggleFeatured.rejected, (state, action) => {
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
  setEditingMenuItem,
  setViewingMenuItem,
  setFilters,
  clearFilters,
  setSearchTerm,
  setCategoryFilter,
  setPagination,
  setPage,
  clearError,
  resetMenuState,
} = menuSlice.actions;

// Selectors
export const selectMenuItems = (state) => state.menu.menuItems;
export const selectFilteredMenuItems = (state) => state.menu.filteredMenuItems;
export const selectSelectedMenuItem = (state) => state.menu.selectedMenuItem;
export const selectMenuStats = (state) => state.menu.menuStats;
export const selectMenuLoading = (state) => state.menu.loading;
export const selectMenuError = (state) => state.menu.error;
export const selectMenuFilters = (state) => state.menu.filters;
export const selectMenuPagination = (state) => state.menu.pagination;
export const selectMenuFormData = (state) => state.menu.formData;
export const selectMenuFormErrors = (state) => state.menu.formErrors;
export const selectShowMenuForm = (state) => state.menu.showForm;
export const selectEditingMenuItem = (state) => state.menu.editingMenuItem;
export const selectViewingMenuItem = (state) => state.menu.viewingMenuItem;

export default menuSlice.reducer;
