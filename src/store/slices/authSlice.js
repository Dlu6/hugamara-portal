import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      console.log("Login thunk response:", response);
      return response;
    } catch (error) {
      console.log("Login thunk error:", error);
      return rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Logout failed");
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to get user");
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null,
  outletId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setOutlet: (state, action) => {
      state.outletId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("Login fulfilled - action.payload:", action.payload);
        console.log(
          "Login fulfilled - action.payload.user:",
          action.payload?.user
        );

        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload?.user || null;
        state.token = action.payload?.token || null;
        state.role = action.payload?.user?.role || null;
        state.outletId = action.payload?.user?.outletId || null;

        if (action.payload?.token) {
          localStorage.setItem("token", action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        console.log("Login rejected - action.payload:", action.payload);
        console.log("Login rejected - action.error:", action.error);

        state.loading = false;
        state.error = action.payload || action.error?.message || "Login failed";
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.role = null;
        state.outletId = null;
        localStorage.removeItem("token");
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        console.log(
          "GetCurrentUser fulfilled - action.payload:",
          action.payload
        );

        state.loading = false;
        state.user = action.payload?.user || action.payload;
        state.isAuthenticated = true;
        state.role = (action.payload?.user || action.payload)?.role || null;
        state.outletId =
          (action.payload?.user || action.payload)?.outletId || null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setOutlet } = authSlice.actions;
export default authSlice.reducer;
