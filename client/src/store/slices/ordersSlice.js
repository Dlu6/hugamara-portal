import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  ordersAPI,
  tablesAPI,
  reservationsAPI,
  guestsAPI,
  menuAPI,
} from "../../services/apiClient";

// Async Thunks for CRUD operations
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (filters, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getAll(filters);
      return response?.data?.orders || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const fetchOrderById = createAsyncThunk(
  "orders/fetchOrderById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getById(id);
      return response?.data?.order || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch order details"
      );
    }
  }
);

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.create(orderData);
      return response?.data?.order || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create order"
      );
    }
  }
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.update(id, data);
      return response?.data?.order || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update order"
      );
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.patch(`${id}/status`, { status });
      return { id, status };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update order status"
      );
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id, { rejectWithValue }) => {
    try {
      await ordersAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete order"
      );
    }
  }
);

// Supporting data fetchers
export const fetchTables = createAsyncThunk(
  "orders/fetchTables",
  async (_, { rejectWithValue }) => {
    try {
      const response = await tablesAPI.getAll();
      return response?.data?.tables || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch tables"
      );
    }
  }
);

export const fetchReservations = createAsyncThunk(
  "orders/fetchReservations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await reservationsAPI.getAll();
      return response?.data?.reservations || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch reservations"
      );
    }
  }
);

export const fetchGuests = createAsyncThunk(
  "orders/fetchGuests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await guestsAPI.getAll({ limit: 100 });
      return response?.data?.guests || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch guests"
      );
    }
  }
);

export const fetchMenuItems = createAsyncThunk(
  "orders/fetchMenuItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await menuAPI.getAll({ limit: 100 });
      return response?.data?.menuItems || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch menu items"
      );
    }
  }
);

const initialState = {
  orders: [],
  selectedOrder: null,
  tables: [],
  reservations: [],
  guests: [],
  menuItems: [],
  loading: false,
  error: null,
  formData: {
    orderType: "dine_in",
    tableId: "",
    reservationId: "",
    guestId: "",
    priority: "normal",
    paymentMethod: "",
    specialInstructions: "",
    items: [],
  },
  formErrors: {},
  showForm: false,
  showDetail: { open: false, orderId: null },
  showMenuItems: false,
  filters: {
    search: "",
    status: "",
    orderType: "",
  },
};

const ordersSlice = createSlice({
  name: "orders",
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
    setShowDetail: (state, action) => {
      state.showDetail = action.payload;
    },
    setShowMenuItems: (state, action) => {
      state.showMenuItems = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
    },
    clearError: (state) => {
      state.error = null;
    },
    resetOrdersState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch order by ID
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.orders.unshift(action.payload);
        }
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order
      .addCase(updateOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update order status
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(
          (order) => order.id === action.payload.id
        );
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete order
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = state.orders.filter(
          (order) => order.id !== action.payload
        );
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.tables = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch guests
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch menu items
      .addCase(fetchMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.menuItems = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setShowDetail,
  setShowMenuItems,
  setFilters,
  resetForm,
  clearError,
  resetOrdersState,
} = ordersSlice.actions;

// Selectors
export const selectOrders = (state) => state.orders.orders;
export const selectSelectedOrder = (state) => state.orders.selectedOrder;
export const selectTables = (state) => state.orders.tables;
export const selectReservations = (state) => state.orders.reservations;
export const selectGuests = (state) => state.orders.guests;
export const selectMenuItems = (state) => state.orders.menuItems;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectOrdersFormData = (state) => state.orders.formData;
export const selectOrdersFormErrors = (state) => state.orders.formErrors;
export const selectOrdersShowForm = (state) => state.orders.showForm;
export const selectOrdersShowDetail = (state) => state.orders.showDetail;
export const selectOrdersShowMenuItems = (state) => state.orders.showMenuItems;
export const selectOrdersFilters = (state) => state.orders.filters;

export default ordersSlice.reducer;
