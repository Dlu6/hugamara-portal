import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ticketsAPI } from "../../services/apiClient";

// Async Thunks for CRUD operations
export const fetchTickets = createAsyncThunk(
  "tickets/fetchTickets",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.category) params.append("category", filters.category);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.status) params.append("status", filters.status);

      const response = await ticketsAPI.getAll(params.toString());
      return response.tickets || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch tickets"
      );
    }
  }
);

export const fetchTicketStats = createAsyncThunk(
  "tickets/fetchTicketStats",
  async (period = "week", { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.getStats(period);
      return response.stats || {};
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch ticket stats"
      );
    }
  }
);

export const createTicket = createAsyncThunk(
  "tickets/createTicket",
  async (ticketData, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.create(ticketData);
      return response.ticket;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to create ticket"
      );
    }
  }
);

export const updateTicket = createAsyncThunk(
  "tickets/updateTicket",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.update(id, data);
      return response.ticket;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update ticket"
      );
    }
  }
);

export const deleteTicket = createAsyncThunk(
  "tickets/deleteTicket",
  async (id, { rejectWithValue }) => {
    try {
      await ticketsAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete ticket"
      );
    }
  }
);

export const updateTicketStatus = createAsyncThunk(
  "tickets/updateTicketStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.updateStatus(id, statusData);
      return response.ticket;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update ticket status"
      );
    }
  }
);

export const addTicketComment = createAsyncThunk(
  "tickets/addTicketComment",
  async ({ id, commentData }, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.addComment(id, commentData);
      return response.ticket;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to add comment"
      );
    }
  }
);

export const getOverdueTickets = createAsyncThunk(
  "tickets/getOverdueTickets",
  async (_, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.getOverdue();
      return response.tickets || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch overdue tickets"
      );
    }
  }
);

export const getTicketsByCategory = createAsyncThunk(
  "tickets/getTicketsByCategory",
  async (category, { rejectWithValue }) => {
    try {
      const response = await ticketsAPI.getByCategory(category);
      return response.tickets || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch tickets by category"
      );
    }
  }
);

const initialState = {
  tickets: [],
  stats: {},
  overdueTickets: [],
  ticketsByCategory: [],
  loading: false,
  statsLoading: false,
  error: null,
  formData: {
    title: "",
    description: "",
    category: "other",
    priority: "medium",
    status: "open",
    location: "",
    estimatedResolutionTime: 0,
    tags: [],
    resolutionNotes: "",
  },
  formErrors: {},
  showForm: false,
  editingTicket: null,
  viewingTicket: null,
  statusModal: null,
  statusData: {
    status: "open",
    resolutionNotes: "",
  },
  commentModal: null,
  commentData: { comment: "" },
  filters: {
    search: "",
    category: "",
    priority: "",
    status: "",
  },
};

const ticketSlice = createSlice({
  name: "tickets",
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
    setEditingTicket: (state, action) => {
      state.editingTicket = action.payload;
    },
    setViewingTicket: (state, action) => {
      state.viewingTicket = action.payload;
    },
    setStatusModal: (state, action) => {
      state.statusModal = action.payload;
    },
    setStatusData: (state, action) => {
      state.statusData = { ...state.statusData, ...action.payload };
    },
    setCommentModal: (state, action) => {
      state.commentModal = action.payload;
    },
    setCommentData: (state, action) => {
      state.commentData = { ...state.commentData, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = initialState.formData;
      state.formErrors = {};
      state.editingTicket = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTicketsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch ticket stats
      .addCase(fetchTicketStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchTicketStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTicketStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // Create ticket
      .addCase(createTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.showForm = false;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(createTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update ticket
      .addCase(updateTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicket.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (ticket) => ticket.id === action.payload.id
        );
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        state.showForm = false;
        state.editingTicket = null;
        state.formData = initialState.formData;
        state.formErrors = {};
      })
      .addCase(updateTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete ticket
      .addCase(deleteTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTicket.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = state.tickets.filter(
          (ticket) => ticket.id !== action.payload
        );
      })
      .addCase(deleteTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update ticket status
      .addCase(updateTicketStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (ticket) => ticket.id === action.payload.id
        );
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        state.statusModal = null;
        state.statusData = initialState.statusData;
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add ticket comment
      .addCase(addTicketComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTicketComment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tickets.findIndex(
          (ticket) => ticket.id === action.payload.id
        );
        if (index !== -1) {
          state.tickets[index] = action.payload;
        }
        state.commentModal = null;
        state.commentData = initialState.commentData;
      })
      .addCase(addTicketComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get overdue tickets
      .addCase(getOverdueTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOverdueTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueTickets = action.payload;
      })
      .addCase(getOverdueTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get tickets by category
      .addCase(getTicketsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTicketsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.ticketsByCategory = action.payload;
      })
      .addCase(getTicketsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingTicket,
  setViewingTicket,
  setStatusModal,
  setStatusData,
  setCommentModal,
  setCommentData,
  setFilters,
  resetForm,
  clearError,
  resetTicketsState,
} = ticketSlice.actions;

// Selectors
export const selectTickets = (state) => state.ticket.tickets;
export const selectTicketStats = (state) => state.ticket.stats;
export const selectTicketsLoading = (state) => state.ticket.loading;
export const selectTicketsStatsLoading = (state) => state.ticket.statsLoading;
export const selectTicketsError = (state) => state.ticket.error;
export const selectTicketsFormData = (state) => state.ticket.formData;
export const selectTicketsFormErrors = (state) => state.ticket.formErrors;
export const selectTicketsShowForm = (state) => state.ticket.showForm;
export const selectTicketsEditingTicket = (state) => state.ticket.editingTicket;
export const selectTicketsViewingTicket = (state) => state.ticket.viewingTicket;
export const selectTicketsStatusModal = (state) => state.ticket.statusModal;
export const selectTicketsStatusData = (state) => state.ticket.statusData;
export const selectTicketsCommentModal = (state) => state.ticket.commentModal;
export const selectTicketsCommentData = (state) => state.ticket.commentData;
export const selectTicketsFilters = (state) => state.ticket.filters;
export const selectOverdueTickets = (state) => state.ticket.overdueTickets;
export const selectTicketsByCategory = (state) =>
  state.ticket.ticketsByCategory;

export default ticketSlice.reducer;
