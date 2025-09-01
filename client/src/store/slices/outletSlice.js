import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import outletService from '../../services/outletService';

// Async thunks
export const fetchOutlets = createAsyncThunk(
  'outlets/fetchOutlets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await outletService.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch outlets' });
    }
  }
);

export const fetchOutletById = createAsyncThunk(
  'outlets/fetchOutletById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await outletService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch outlet' });
    }
  }
);

// Initial state
const initialState = {
  outlets: [],
  currentOutlet: null,
  loading: false,
  error: null
};

// Outlet slice
const outletSlice = createSlice({
  name: 'outlets',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentOutlet: (state, action) => {
      state.currentOutlet = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch outlets
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
      });
  }
});

export const { clearError, setCurrentOutlet } = outletSlice.actions;

// Selectors
export const selectOutlets = (state) => state.outlets.outlets;
export const selectCurrentOutlet = (state) => state.outlets.currentOutlet;
export const selectOutletsLoading = (state) => state.outlets.loading;
export const selectOutletsError = (state) => state.outlets.error;

export default outletSlice.reducer;
