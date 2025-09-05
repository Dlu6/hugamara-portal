import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import shiftService from "../../services/shiftService";

// Async thunks
export const fetchShifts = createAsyncThunk(
  "shifts/fetchShifts",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await shiftService.getAllShifts(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchShiftById = createAsyncThunk(
  "shifts/fetchShiftById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await shiftService.getShiftById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createShift = createAsyncThunk(
  "shifts/createShift",
  async (shiftData, { rejectWithValue }) => {
    try {
      const response = await shiftService.createShift(shiftData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateShift = createAsyncThunk(
  "shifts/updateShift",
  async ({ id, shiftData }, { rejectWithValue }) => {
    try {
      const response = await shiftService.updateShift(id, shiftData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteShift = createAsyncThunk(
  "shifts/deleteShift",
  async (id, { rejectWithValue }) => {
    try {
      const response = await shiftService.deleteShift(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchShiftStats = createAsyncThunk(
  "shifts/fetchShiftStats",
  async (period = "month", { rejectWithValue }) => {
    try {
      const response = await shiftService.getShiftStats(period);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateShiftStatus = createAsyncThunk(
  "shifts/updateShiftStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await shiftService.updateShiftStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clockIn = createAsyncThunk(
  "shifts/clockIn",
  async (id, { rejectWithValue }) => {
    try {
      const response = await shiftService.clockIn(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const clockOut = createAsyncThunk(
  "shifts/clockOut",
  async (id, { rejectWithValue }) => {
    try {
      const response = await shiftService.clockOut(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTodaysShifts = createAsyncThunk(
  "shifts/fetchTodaysShifts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await shiftService.getTodaysShifts();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUpcomingShifts = createAsyncThunk(
  "shifts/fetchUpcomingShifts",
  async (days = 7, { rejectWithValue }) => {
    try {
      const response = await shiftService.getUpcomingShifts(days);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const approveShift = createAsyncThunk(
  "shifts/approveShift",
  async (id, { rejectWithValue }) => {
    try {
      const response = await shiftService.approveShift(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  shifts: [],
  selectedShift: null,
  stats: null,
  todaysShifts: [],
  upcomingShifts: [],
  loading: false,
  statsLoading: false,
  error: null,
  formData: shiftService.getDefaultFormData(),
  formErrors: {},
  showForm: false,
  editingShift: null,
  viewingShift: null,
  statusModal: false,
  statusData: {},
  clockModal: false,
  clockData: {},
  filters: {
    search: "",
    status: "",
    shiftType: "",
    dateFrom: "",
    dateTo: "",
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  },
};

// Slice
const shiftSlice = createSlice({
  name: "shifts",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingShift: (state, action) => {
      state.editingShift = action.payload;
      if (action.payload) {
        state.formData = { ...action.payload };
        state.showForm = true;
      } else {
        state.formData = shiftService.getDefaultFormData();
        state.showForm = false;
      }
    },
    setViewingShift: (state, action) => {
      state.viewingShift = action.payload;
    },
    setStatusModal: (state, action) => {
      state.statusModal = action.payload;
    },
    setStatusData: (state, action) => {
      state.statusData = action.payload;
    },
    setClockModal: (state, action) => {
      state.clockModal = action.payload;
    },
    setClockData: (state, action) => {
      state.clockData = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.formData = shiftService.getDefaultFormData();
      state.formErrors = {};
      state.editingShift = null;
      state.showForm = false;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch shifts
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = action.payload.shifts || [];
        state.pagination = {
          currentPage: action.payload.page || 1,
          totalPages: action.payload.totalPages || 1,
          total: action.payload.total || 0,
          limit: 10,
        };
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch shift by ID
      .addCase(fetchShiftById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShiftById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedShift = action.payload.shift;
      })
      .addCase(fetchShiftById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create shift
      .addCase(createShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts.unshift(action.payload.shift);
        state.showForm = false;
        state.formData = shiftService.getDefaultFormData();
        state.formErrors = {};
      })
      .addCase(createShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update shift
      .addCase(updateShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.payload.shift.id
        );
        if (index !== -1) {
          state.shifts[index] = action.payload.shift;
        }
        state.showForm = false;
        state.editingShift = null;
        state.formData = shiftService.getDefaultFormData();
        state.formErrors = {};
      })
      .addCase(updateShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete shift
      .addCase(deleteShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.loading = false;
        state.shifts = state.shifts.filter(
          (shift) => shift.id !== action.meta.arg
        );
      })
      .addCase(deleteShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch shift stats
      .addCase(fetchShiftStats.pending, (state) => {
        state.statsLoading = true;
        state.error = null;
      })
      .addCase(fetchShiftStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchShiftStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      })
      // Update shift status
      .addCase(updateShiftStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateShiftStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.meta.arg.id
        );
        if (index !== -1) {
          state.shifts[index].status = action.meta.arg.status;
        }
        state.statusModal = false;
        state.statusData = {};
      })
      .addCase(updateShiftStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clock in
      .addCase(clockIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.meta.arg
        );
        if (index !== -1) {
          state.shifts[index].status = "in_progress";
          state.shifts[index].clockInTime = new Date().toISOString();
        }
        state.clockModal = false;
        state.clockData = {};
      })
      .addCase(clockIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clock out
      .addCase(clockOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.meta.arg
        );
        if (index !== -1) {
          state.shifts[index].status = "completed";
          state.shifts[index].clockOutTime = new Date().toISOString();
        }
        state.clockModal = false;
        state.clockData = {};
      })
      .addCase(clockOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch today's shifts
      .addCase(fetchTodaysShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodaysShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.todaysShifts = action.payload.shifts || [];
      })
      .addCase(fetchTodaysShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch upcoming shifts
      .addCase(fetchUpcomingShifts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingShifts = action.payload.shifts || [];
      })
      .addCase(fetchUpcomingShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve shift
      .addCase(approveShift.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveShift.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.shifts.findIndex(
          (shift) => shift.id === action.meta.arg
        );
        if (index !== -1) {
          state.shifts[index].isApproved = true;
          state.shifts[index].approvedAt = new Date().toISOString();
        }
      })
      .addCase(approveShift.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingShift,
  setViewingShift,
  setStatusModal,
  setStatusData,
  setClockModal,
  setClockData,
  clearError,
  resetForm,
  setPagination,
} = shiftSlice.actions;

// Selectors
export const selectShifts = (state) => state.shifts.shifts;
export const selectSelectedShift = (state) => state.shifts.selectedShift;
export const selectShiftStats = (state) => state.shifts.stats;
export const selectTodaysShifts = (state) => state.shifts.todaysShifts;
export const selectUpcomingShifts = (state) => state.shifts.upcomingShifts;
export const selectShiftsLoading = (state) => state.shifts.loading;
export const selectShiftsStatsLoading = (state) => state.shifts.statsLoading;
export const selectShiftsError = (state) => state.shifts.error;
export const selectShiftsFormData = (state) => state.shifts.formData;
export const selectShiftsFormErrors = (state) => state.shifts.formErrors;
export const selectShowShiftsForm = (state) => state.shifts.showForm;
export const selectEditingShift = (state) => state.shifts.editingShift;
export const selectViewingShift = (state) => state.shifts.viewingShift;
export const selectStatusModal = (state) => state.shifts.statusModal;
export const selectStatusData = (state) => state.shifts.statusData;
export const selectClockModal = (state) => state.shifts.clockModal;
export const selectClockData = (state) => state.shifts.clockData;
export const selectShiftsFilters = (state) => state.shifts.filters;
export const selectShiftsPagination = (state) => state.shifts.pagination;

// Memoized selector for filtered shifts
export const selectFilteredShifts = createSelector(
  [selectShifts, selectShiftsFilters],
  (shifts, filters) => {
    return shifts.filter((shift) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          shift.position,
          shift.section,
          shift.shiftType,
          shift.status,
          shift.notes,
        ];

        const matchesSearch = searchableFields.some(
          (field) => field && field.toLowerCase().includes(searchTerm)
        );

        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status && shift.status !== filters.status) {
        return false;
      }

      // Shift type filter
      if (filters.shiftType && shift.shiftType !== filters.shiftType) {
        return false;
      }

      // Date range filters
      if (filters.dateFrom) {
        const shiftDate = new Date(shift.shiftDate);
        const fromDate = new Date(filters.dateFrom);
        if (shiftDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const shiftDate = new Date(shift.shiftDate);
        const toDate = new Date(filters.dateTo);
        if (shiftDate > toDate) return false;
      }

      return true;
    });
  }
);

export default shiftSlice.reducer;
