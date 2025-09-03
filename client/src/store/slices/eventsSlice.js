import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import eventsService from "../../services/eventsService";

// Async Thunks
export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await eventsService.getAll(params);
      return response?.events || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch events"
      );
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await eventsService.getById(id);
      return response?.event || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch event"
      );
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await eventsService.create(eventData);
      return response?.event || response?.data;
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
        error?.response?.data?.message || "Failed to create event"
      );
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await eventsService.update(id, eventData);
      return response?.event || response?.data;
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
        error?.response?.data?.message || "Failed to update event"
      );
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      await eventsService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to delete event"
      );
    }
  }
);

export const fetchEventStats = createAsyncThunk(
  "events/fetchEventStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getStats();
      return response?.stats || response?.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch event stats"
      );
    }
  }
);

export const updateEventStatus = createAsyncThunk(
  "events/updateEventStatus",
  async ({ id, statusData }, { rejectWithValue }) => {
    try {
      const response = await eventsService.updateStatus(id, statusData);
      return { id, statusData, event: response?.event || response?.data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update event status"
      );
    }
  }
);

export const updateEventAttendance = createAsyncThunk(
  "events/updateEventAttendance",
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await eventsService.updateAttendance(id, attendanceData);
      return { id, attendanceData, event: response?.event || response?.data };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to update event attendance"
      );
    }
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  "events/fetchUpcomingEvents",
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await eventsService.getUpcomingEvents(limit);
      return response?.events || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch upcoming events"
      );
    }
  }
);

export const fetchEventsByType = createAsyncThunk(
  "events/fetchEventsByType",
  async (eventType, { rejectWithValue }) => {
    try {
      const response = await eventsService.getEventsByType(eventType);
      return response?.events || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch events by type"
      );
    }
  }
);

export const fetchEventsByStatus = createAsyncThunk(
  "events/fetchEventsByStatus",
  async (status, { rejectWithValue }) => {
    try {
      const response = await eventsService.getEventsByStatus(status);
      return response?.events || response?.data || [];
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch events by status"
      );
    }
  }
);

// Initial State
const initialState = {
  events: [],
  upcomingEvents: [],
  eventsByType: [],
  eventsByStatus: [],
  selectedEvent: null,
  stats: {},
  loading: false,
  statsLoading: false,
  error: null,
  formData: {
    title: "",
    description: "",
    eventType: "other",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    capacity: 0,
    expectedAttendance: 0,
    actualAttendance: 0,
    isTicketed: false,
    ticketPrice: 0,
    ticketQuantity: 0,
    status: "draft",
    budget: 0,
    actualCost: 0,
    revenue: 0,
    performers: [],
    requirements: [],
    marketingPlan: "",
    notes: "",
    tags: [],
  },
  formErrors: {},
  showForm: false,
  editingEvent: null,
  viewingEvent: null,
  statusModal: null,
  statusData: { status: "draft" },
  attendanceModal: null,
  attendanceData: { actualAttendance: 0 },
  filters: {
    search: "",
    eventType: "",
    status: "",
    dateFrom: "",
  },
};

// Slice
const eventsSlice = createSlice({
  name: "events",
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
    setEditingEvent: (state, action) => {
      state.editingEvent = action.payload;
      if (action.payload) {
        state.formData = {
          title: action.payload.title || "",
          description: action.payload.description || "",
          eventType: action.payload.eventType || "other",
          startDate: action.payload.startDate
            ? action.payload.startDate.split("T")[0]
            : "",
          endDate: action.payload.endDate
            ? action.payload.endDate.split("T")[0]
            : "",
          startTime: action.payload.startTime || "",
          endTime: action.payload.endTime || "",
          capacity: action.payload.capacity || 0,
          expectedAttendance: action.payload.expectedAttendance || 0,
          actualAttendance: action.payload.actualAttendance || 0,
          isTicketed: action.payload.isTicketed || false,
          ticketPrice: action.payload.ticketPrice || 0,
          ticketQuantity: action.payload.ticketQuantity || 0,
          status: action.payload.status || "draft",
          budget: action.payload.budget || 0,
          actualCost: action.payload.actualCost || 0,
          revenue: action.payload.revenue || 0,
          performers: action.payload.performers || [],
          requirements: action.payload.requirements || [],
          marketingPlan: action.payload.marketingPlan || "",
          notes: action.payload.notes || "",
          tags: action.payload.tags || [],
        };
      }
    },
    setViewingEvent: (state, action) => {
      state.viewingEvent = action.payload;
    },
    setStatusModal: (state, action) => {
      state.statusModal = action.payload;
      if (action.payload) {
        state.statusData = { status: action.payload.status };
      }
    },
    setStatusData: (state, action) => {
      state.statusData = { ...state.statusData, ...action.payload };
    },
    setAttendanceModal: (state, action) => {
      state.attendanceModal = action.payload;
      if (action.payload) {
        state.attendanceData = {
          actualAttendance: action.payload.actualAttendance || 0,
        };
      }
    },
    setAttendanceData: (state, action) => {
      state.attendanceData = { ...state.attendanceData, ...action.payload };
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = {
        title: "",
        description: "",
        eventType: "other",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        capacity: 0,
        expectedAttendance: 0,
        actualAttendance: 0,
        isTicketed: false,
        ticketPrice: 0,
        ticketQuantity: 0,
        status: "draft",
        budget: 0,
        actualCost: 0,
        revenue: 0,
        performers: [],
        requirements: [],
        marketingPlan: "",
        notes: "",
        tags: [],
      };
      state.formErrors = {};
      state.editingEvent = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetEventsState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Event By ID
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          state.events.unshift(action.payload);
        }
        state.showForm = false;
        state.formData = {
          title: "",
          description: "",
          eventType: "other",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          capacity: 0,
          expectedAttendance: 0,
          actualAttendance: 0,
          isTicketed: false,
          ticketPrice: 0,
          ticketQuantity: 0,
          status: "draft",
          budget: 0,
          actualCost: 0,
          revenue: 0,
          performers: [],
          requirements: [],
          marketingPlan: "",
          notes: "",
          tags: [],
        };
        state.editingEvent = null;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Update Event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.formErrors = {};
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          const index = state.events.findIndex(
            (e) => e.id === action.payload.id
          );
          if (index !== -1) {
            state.events[index] = action.payload;
          }
        }
        state.showForm = false;
        state.editingEvent = null;
        state.formData = {
          title: "",
          description: "",
          eventType: "other",
          startDate: "",
          endDate: "",
          startTime: "",
          endTime: "",
          capacity: 0,
          expectedAttendance: 0,
          actualAttendance: 0,
          isTicketed: false,
          ticketPrice: 0,
          ticketQuantity: 0,
          status: "draft",
          budget: 0,
          actualCost: 0,
          revenue: 0,
          performers: [],
          requirements: [],
          marketingPlan: "",
          notes: "",
          tags: [],
        };
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        if (action.payload?.errors) {
          state.formErrors = action.payload.errors;
        }
        state.error = action.payload?.message || action.payload;
      })

      // Delete Event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Event Stats
      .addCase(fetchEventStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchEventStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload || {};
      })
      .addCase(fetchEventStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })

      // Update Event Status
      .addCase(updateEventStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, statusData } = action.payload;
        const index = state.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.events[index].status = statusData.status;
        }
        state.statusModal = null;
      })
      .addCase(updateEventStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Event Attendance
      .addCase(updateEventAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEventAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const { id, attendanceData } = action.payload;
        const index = state.events.findIndex((e) => e.id === id);
        if (index !== -1) {
          state.events[index].actualAttendance =
            attendanceData.actualAttendance;
        }
        state.attendanceModal = null;
      })
      .addCase(updateEventAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Upcoming Events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingEvents = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Events By Type
      .addCase(fetchEventsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.eventsByType = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchEventsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Events By Status
      .addCase(fetchEventsByStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventsByStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.eventsByStatus = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchEventsByStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const {
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingEvent,
  setViewingEvent,
  setStatusModal,
  setStatusData,
  setAttendanceModal,
  setAttendanceData,
  setFilters,
  resetForm,
  clearError,
  resetEventsState,
} = eventsSlice.actions;

// Selectors
export const selectEvents = (state) => state.events.events;
export const selectUpcomingEvents = (state) => state.events.upcomingEvents;
export const selectEventsByType = (state) => state.events.eventsByType;
export const selectEventsByStatus = (state) => state.events.eventsByStatus;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventStats = (state) => state.events.stats;
export const selectEventsLoading = (state) => state.events.loading;
export const selectEventsStatsLoading = (state) => state.events.statsLoading;
export const selectEventsError = (state) => state.events.error;
export const selectEventsFormData = (state) => state.events.formData;
export const selectEventsFormErrors = (state) => state.events.formErrors;
export const selectShowEventsForm = (state) => state.events.showForm;
export const selectEditingEvent = (state) => state.events.editingEvent;
export const selectViewingEvent = (state) => state.events.viewingEvent;
export const selectStatusModal = (state) => state.events.statusModal;
export const selectStatusData = (state) => state.events.statusData;
export const selectAttendanceModal = (state) => state.events.attendanceModal;
export const selectAttendanceData = (state) => state.events.attendanceData;
export const selectEventsFilters = (state) => state.events.filters;

export const selectFilteredEvents = (state) => {
  const events = state.events.events;
  const filters = state.events.filters;

  return events.filter((event) => {
    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchesSearch =
        event.title?.toLowerCase().includes(search) ||
        event.description?.toLowerCase().includes(search) ||
        event.eventType?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Event type filter
    if (filters.eventType && event.eventType !== filters.eventType) {
      return false;
    }

    // Status filter
    if (filters.status && event.status !== filters.status) {
      return false;
    }

    // Date filter
    if (filters.dateFrom) {
      const eventDate = new Date(event.startDate);
      const filterDate = new Date(filters.dateFrom);
      if (eventDate < filterDate) return false;
    }

    return true;
  });
};

export default eventsSlice.reducer;
