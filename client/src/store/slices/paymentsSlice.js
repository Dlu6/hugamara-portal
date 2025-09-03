import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentsAPI, ordersAPI } from "../../services/apiClient";

// Async Thunks for CRUD operations
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.paymentMethod)
        params.append("paymentMethod", filters.paymentMethod);
      if (filters?.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom);

      const response = await paymentsAPI.getAll(params.toString());
      return response.payments || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  "payments/fetchPaymentStats",
  async (period = "today", { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getStats(period);
      return response.stats || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch payment stats"
      );
    }
  }
);

export const fetchOrders = createAsyncThunk(
  "payments/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ordersAPI.getAll();
      return response.orders || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.create(paymentData);
      return response.payment;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create payment"
      );
    }
  }
);

export const updatePayment = createAsyncThunk(
  "payments/updatePayment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.update(id, data);
      return response.payment;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update payment"
      );
    }
  }
);

export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (id, { rejectWithValue }) => {
    try {
      await paymentsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete payment"
      );
    }
  }
);

export const processPayment = createAsyncThunk(
  "payments/processPayment",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.processPayment(id, data);
      return response.payment;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to process payment"
      );
    }
  }
);

export const refundPayment = createAsyncThunk(
  "payments/refundPayment",
  async ({ id, refundData }, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.refundPayment(id, refundData);
      return response.payment;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to refund payment"
      );
    }
  }
);

export const getPaymentMethods = createAsyncThunk(
  "payments/getPaymentMethods",
  async (_, { rejectWithValue }) => {
    try {
      const response = await paymentsAPI.getMethods();
      return response.methods || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch payment methods"
      );
    }
  }
);

const initialState = {
  payments: [],
  orders: [],
  stats: {},
  paymentMethods: [],
  loading: false,
  error: null,
  formData: {
    orderId: "",
    amount: 0,
    currency: "UGX",
    paymentMethod: "cash",
    paymentStatus: "pending",
    transactionId: "",
    referenceNumber: "",
    cardType: "",
    cardLast4: "",
    mobileMoneyProvider: "",
    mobileMoneyNumber: "",
    bankName: "",
    accountNumber: "",
    tipAmount: 0,
    serviceCharge: 0,
    taxAmount: 0,
    discountAmount: 0,
    discountReason: "",
    notes: "",
  },
  formErrors: {},
  showForm: false,
  editingPayment: null,
  viewingPayment: null,
  refundModal: null,
  refundData: {
    refundReason: "",
    refundAmount: 0,
  },
  filters: {
    search: "",
    paymentMethod: "",
    paymentStatus: "",
    dateFrom: "",
  },
};

const paymentsSlice = createSlice({
  name: "payments",
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
    setEditingPayment: (state, action) => {
      state.editingPayment = action.payload;
    },
    setViewingPayment: (state, action) => {
      state.viewingPayment = action.payload;
    },
    setRefundModal: (state, action) => {
      state.refundModal = action.payload;
    },
    setRefundData: (state, action) => {
      state.refundData = { ...state.refundData, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
      state.editingPayment = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPaymentsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments.unshift(action.payload);
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update payment
      .addCase(updatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(
          (payment) => payment.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        state.showForm = false;
        state.editingPayment = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = state.payments.filter(
          (payment) => payment.id !== action.payload
        );
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(
          (payment) => payment.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Refund payment
      .addCase(refundPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refundPayment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payments.findIndex(
          (payment) => payment.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        }
        state.refundModal = null;
        state.refundData = initialState.refundData;
      })
      .addCase(refundPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get payment methods
      .addCase(getPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingPayment,
  setViewingPayment,
  setRefundModal,
  setRefundData,
  setFilters,
  resetForm,
  clearError,
  resetPaymentsState,
} = paymentsSlice.actions;

// Selectors
export const selectPayments = (state) => state.payments.payments;
export const selectPaymentStats = (state) => state.payments.stats;
export const selectPaymentOrders = (state) => state.payments.orders;
export const selectPaymentMethods = (state) => state.payments.paymentMethods;
export const selectPaymentsLoading = (state) => state.payments.loading;
export const selectPaymentsError = (state) => state.payments.error;
export const selectPaymentsFormData = (state) => state.payments.formData;
export const selectPaymentsFormErrors = (state) => state.payments.formErrors;
export const selectPaymentsShowForm = (state) => state.payments.showForm;
export const selectPaymentsEditingPayment = (state) =>
  state.payments.editingPayment;
export const selectPaymentsViewingPayment = (state) =>
  state.payments.viewingPayment;
export const selectPaymentsRefundModal = (state) => state.payments.refundModal;
export const selectPaymentsRefundData = (state) => state.payments.refundData;
export const selectPaymentsFilters = (state) => state.payments.filters;

export default paymentsSlice.reducer;
