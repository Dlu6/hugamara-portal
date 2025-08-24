import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Async thunks
export const fetchReservations = createAsyncThunk(
  "reservations/fetchReservations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/reservations`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch reservations"
      );
    }
  }
);

export const createReservation = createAsyncThunk(
  "reservations/createReservation",
  async (reservationData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/reservations`,
        reservationData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create reservation"
      );
    }
  }
);

export const updateReservation = createAsyncThunk(
  "reservations/updateReservation",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/reservations/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update reservation"
      );
    }
  }
);

export const deleteReservation = createAsyncThunk(
  "reservations/deleteReservation",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/reservations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete reservation"
      );
    }
  }
);

const initialState = {
  reservations: [],
  loading: false,
  error: null,
  selectedReservation: null,
};

const reservationSlice = createSlice({
  name: "reservations",
  initialState,
  reducers: {
    setSelectedReservation: (state, action) => {
      state.selectedReservation = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch reservations
      .addCase(fetchReservations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReservations.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = action.payload;
      })
      .addCase(fetchReservations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create reservation
      .addCase(createReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations.push(action.payload);
      })
      .addCase(createReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update reservation
      .addCase(updateReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReservation.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reservations.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.reservations[index] = action.payload;
        }
      })
      .addCase(updateReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete reservation
      .addCase(deleteReservation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReservation.fulfilled, (state, action) => {
        state.loading = false;
        state.reservations = state.reservations.filter(
          (r) => r.id !== action.payload
        );
      })
      .addCase(deleteReservation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedReservation, clearError } = reservationSlice.actions;
export default reservationSlice.reducer;
