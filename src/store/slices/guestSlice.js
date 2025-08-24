import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// Async thunks
export const fetchGuests = createAsyncThunk(
  "guests/fetchGuests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/guests`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch guests");
    }
  }
);

export const createGuest = createAsyncThunk(
  "guests/createGuest",
  async (guestData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/guests`, guestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create guest");
    }
  }
);

export const updateGuest = createAsyncThunk(
  "guests/updateGuest",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/guests/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update guest");
    }
  }
);

export const deleteGuest = createAsyncThunk(
  "guests/deleteGuest",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/guests/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete guest");
    }
  }
);

const initialState = {
  guests: [],
  loading: false,
  error: null,
  selectedGuest: null,
};

const guestSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    setSelectedGuest: (state, action) => {
      state.selectedGuest = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch guests
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create guest
      .addCase(createGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.guests.push(action.payload);
      })
      .addCase(createGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update guest
      .addCase(updateGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGuest.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.guests.findIndex((g) => g.id === action.payload.id);
        if (index !== -1) {
          state.guests[index] = action.payload;
        }
      })
      .addCase(updateGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete guest
      .addCase(deleteGuest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGuest.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = state.guests.filter((g) => g.id !== action.payload);
      })
      .addCase(deleteGuest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedGuest, clearError } = guestSlice.actions;
export default guestSlice.reducer;
