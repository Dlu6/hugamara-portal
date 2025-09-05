import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import staffService from "../../services/staffService";

// Async thunks
export const fetchStaff = createAsyncThunk(
  "staff/fetchStaff",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await staffService.getAllStaff(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchStaffById = createAsyncThunk(
  "staff/fetchStaffById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createStaff = createAsyncThunk(
  "staff/createStaff",
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await staffService.createStaff(staffData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStaff = createAsyncThunk(
  "staff/updateStaff",
  async ({ id, staffData }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaff(id, staffData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteStaff = createAsyncThunk(
  "staff/deleteStaff",
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.deleteStaff(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchStaffStats = createAsyncThunk(
  "staff/fetchStaffStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const searchStaff = createAsyncThunk(
  "staff/searchStaff",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await staffService.searchStaff(query, filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStaffStatus = createAsyncThunk(
  "staff/updateStaffStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaffStatus(id, status);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStaffPerformance = createAsyncThunk(
  "staff/updateStaffPerformance",
  async ({ id, performanceData }, { rejectWithValue }) => {
    try {
      const response = await staffService.updatePerformance(
        id,
        performanceData
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStaffByDepartment = createAsyncThunk(
  "staff/getStaffByDepartment",
  async ({ department, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffByDepartment(
        department,
        filters
      );
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStaffSchedule = createAsyncThunk(
  "staff/getStaffSchedule",
  async ({ id, dateRange }, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffSchedule(id, dateRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateStaffSchedule = createAsyncThunk(
  "staff/updateStaffSchedule",
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaffSchedule(id, scheduleData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStaffAttendance = createAsyncThunk(
  "staff/getStaffAttendance",
  async ({ id, dateRange }, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffAttendance(id, dateRange);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const recordAttendance = createAsyncThunk(
  "staff/recordAttendance",
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await staffService.recordAttendance(id, attendanceData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const getStaffPayroll = createAsyncThunk(
  "staff/getStaffPayroll",
  async ({ id, period }, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffPayroll(id, period);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const generatePayroll = createAsyncThunk(
  "staff/generatePayroll",
  async ({ period, staffIds = [] }, { rejectWithValue }) => {
    try {
      const response = await staffService.generatePayroll(period, staffIds);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const initialState = {
  staff: [],
  filteredStaff: [],
  selectedStaff: null,
  stats: {},
  loading: false,
  error: null,
  filters: {
    department: "",
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
    employeeId: "",
    position: "",
    department: "front_of_house",
    hireDate: "",
    terminationDate: "",
    isActive: true,
    hourlyRate: 0,
    salary: 0,
    payFrequency: "hourly",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    skills: [],
    certifications: [],
    performanceRating: 0,
    notes: "",
  },
  formErrors: {},
  showForm: false,
  editingStaff: null,
  viewingStaff: null,
  performanceModal: null,
  performanceData: {
    rating: 0,
    comments: "",
    goals: [],
    achievements: [],
  },
  scheduleModal: null,
  scheduleData: {
    date: "",
    startTime: "",
    endTime: "",
    breakTime: 0,
    notes: "",
  },
  attendanceModal: null,
  attendanceData: {
    date: "",
    checkIn: "",
    checkOut: "",
    hours: 0,
    notes: "",
  },
};

// Staff slice
const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    // Filter and search
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload;
    },
    setDepartmentFilter: (state, action) => {
      state.filters.department = action.payload;
    },
    setStatusFilter: (state, action) => {
      state.filters.status = action.payload;
    },

    // Pagination
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },

    // Form management
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    setFormErrors: (state, action) => {
      state.formErrors = action.payload;
    },
    setShowForm: (state, action) => {
      state.showForm = action.payload;
    },
    setEditingStaff: (state, action) => {
      state.editingStaff = action.payload;
    },
    setViewingStaff: (state, action) => {
      state.viewingStaff = action.payload;
    },

    // Modal management
    setPerformanceModal: (state, action) => {
      state.performanceModal = action.payload;
    },
    setPerformanceData: (state, action) => {
      state.performanceData = { ...state.performanceData, ...action.payload };
    },
    setScheduleModal: (state, action) => {
      state.scheduleModal = action.payload;
    },
    setScheduleData: (state, action) => {
      state.scheduleData = { ...state.scheduleData, ...action.payload };
    },
    setAttendanceModal: (state, action) => {
      state.attendanceModal = action.payload;
    },
    setAttendanceData: (state, action) => {
      state.attendanceData = { ...state.attendanceData, ...action.payload };
    },

    // Selection
    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload;
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Reset state
    resetStaffState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch staff
      .addCase(fetchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.loading = false;
        // Extract only the data portion, avoiding non-serializable values
        const responseData = action.payload?.data || action.payload;
        state.staff = responseData?.staff || responseData || [];
        state.filteredStaff = responseData?.staff || responseData || [];
        state.pagination = responseData?.pagination || state.pagination;
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch staff by ID
      .addCase(fetchStaffById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffById.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload?.data || action.payload;
        state.selectedStaff = responseData?.staff || responseData;
      })
      .addCase(fetchStaffById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create staff
      .addCase(createStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload.data || action.payload;
        const newStaff = responseData.staff || responseData;
        state.staff.unshift(newStaff);
        state.filteredStaff.unshift(newStaff);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff
      .addCase(updateStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload.data || action.payload;
        const updatedStaff = responseData.staff || responseData;
        const index = state.staff.findIndex(
          (staff) => staff.id === updatedStaff.id
        );
        if (index !== -1) {
          state.staff[index] = updatedStaff;
          state.filteredStaff[index] = updatedStaff;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete staff
      .addCase(deleteStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload.id;
        state.staff = state.staff.filter((staff) => staff.id !== deletedId);
        state.filteredStaff = state.filteredStaff.filter(
          (staff) => staff.id !== deletedId
        );
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch staff stats
      .addCase(fetchStaffStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload?.stats || action.payload;
      })
      .addCase(fetchStaffStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search staff
      .addCase(searchStaff.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchStaff.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredStaff = action.payload.staff || action.payload;
      })
      .addCase(searchStaff.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff status
      .addCase(updateStaffStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { id, response } = action.payload;
        const updatedStaff = response.staff || response;
        const index = state.staff.findIndex((staff) => staff.id === id);
        if (index !== -1) {
          state.staff[index] = updatedStaff;
          state.filteredStaff[index] = updatedStaff;
        }
      })
      .addCase(updateStaffStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff performance
      .addCase(updateStaffPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffPerformance.fulfilled, (state, action) => {
        state.loading = false;
        const { id, performanceData } = action.meta.arg;
        const responseData = action.payload.data || action.payload;
        const updatedStaff = responseData.staff || responseData;

        // Update the staff member in the list
        const index = state.staff.findIndex((staff) => staff.id === id);
        if (index !== -1) {
          state.staff[index] = { ...state.staff[index], ...updatedStaff };
          state.filteredStaff[index] = {
            ...state.filteredStaff[index],
            ...updatedStaff,
          };
        }
      })
      .addCase(updateStaffPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get staff by department
      .addCase(getStaffByDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffByDepartment.fulfilled, (state, action) => {
        state.loading = false;
        const responseData = action.payload.data || action.payload;
        state.filteredStaff = responseData.staff || responseData || [];
      })
      .addCase(getStaffByDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get staff schedule
      .addCase(getStaffSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffSchedule.fulfilled, (state, action) => {
        state.loading = false;
        // Handle schedule data
      })
      .addCase(getStaffSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update staff schedule
      .addCase(updateStaffSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStaffSchedule.fulfilled, (state, action) => {
        state.loading = false;
        // Handle schedule update
      })
      .addCase(updateStaffSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get staff attendance
      .addCase(getStaffAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Handle attendance data
      })
      .addCase(getStaffAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Record attendance
      .addCase(recordAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordAttendance.fulfilled, (state, action) => {
        state.loading = false;
        // Handle attendance recording
      })
      .addCase(recordAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get staff payroll
      .addCase(getStaffPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStaffPayroll.fulfilled, (state, action) => {
        state.loading = false;
        // Handle payroll data
      })
      .addCase(getStaffPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Generate payroll
      .addCase(generatePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        // Handle payroll generation
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  setSearchTerm,
  setDepartmentFilter,
  setStatusFilter,
  setPage,
  setLimit,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingStaff,
  setViewingStaff,
  setPerformanceModal,
  setPerformanceData,
  setScheduleModal,
  setScheduleData,
  setAttendanceModal,
  setAttendanceData,
  setSelectedStaff,
  clearError,
  resetStaffState,
} = staffSlice.actions;

// Selectors
export const selectStaff = (state) => state.staff.staff;
export const selectFilteredStaff = (state) => state.staff.filteredStaff;
export const selectSelectedStaff = (state) => state.staff.selectedStaff;
export const selectStaffStats = (state) => state.staff.stats;
export const selectStaffLoading = (state) => state.staff.loading;
export const selectStaffError = (state) => state.staff.error;
export const selectStaffFilters = (state) => state.staff.filters;
export const selectStaffPagination = (state) => state.staff.pagination;
export const selectStaffFormData = (state) => state.staff.formData;
export const selectStaffFormErrors = (state) => state.staff.formErrors;
export const selectShowStaffForm = (state) => state.staff.showForm;
export const selectEditingStaff = (state) => state.staff.editingStaff;
export const selectViewingStaff = (state) => state.staff.viewingStaff;
export const selectPerformanceModal = (state) => state.staff.performanceModal;
export const selectPerformanceData = (state) => state.staff.performanceData;
export const selectScheduleModal = (state) => state.staff.scheduleModal;
export const selectScheduleData = (state) => state.staff.scheduleData;
export const selectAttendanceModal = (state) => state.staff.attendanceModal;
export const selectAttendanceData = (state) => state.staff.attendanceData;

export default staffSlice.reducer;
