import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      localStorage.setItem("token", response.token);
      localStorage.setItem("refreshToken", response.refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return {};
    } catch (error) {
      // Even if logout fails on server, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return {};
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
      return rejectWithValue(
        error.response?.data || { message: "Failed to get user" }
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await authService.refreshToken(refreshToken);
      localStorage.setItem("token", response.token);
      return response;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return rejectWithValue(
        error.response?.data || { message: "Token refresh failed" }
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await authService.changePassword(passwordData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Password change failed" }
      );
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
  permissions: [],
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.permissions = user?.permissions || [];
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.permissions = [];
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
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.permissions = [];
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.permissions = [];
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.permissions = [];
      })

      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.permissions = action.payload.user?.permissions || [];
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.permissions = [];
      })

      // Refresh token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.permissions = [];
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } =
  authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserPermissions = (state) => state.auth.permissions;
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserOutlet = (state) => state.auth.user?.outlet;

// Permission checker
export const hasPermission = (stateOrPermissions, permission) => {
  const permissions = Array.isArray(stateOrPermissions)
    ? stateOrPermissions
    : stateOrPermissions?.auth?.permissions || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (stateOrPermissions, permissionsToCheck) => {
  const permissions = Array.isArray(stateOrPermissions)
    ? stateOrPermissions
    : stateOrPermissions?.auth?.permissions || [];
  return permissionsToCheck.some((p) => permissions.includes(p));
};

// Permission constants (matching backend)
export const PERMISSIONS = {
  MANAGE_USERS: "manage_users",
  VIEW_USERS: "view_users",
  MANAGE_OUTLETS: "manage_outlets",
  VIEW_OUTLETS: "view_outlets",
  MANAGE_ORDERS: "manage_orders",
  VIEW_ORDERS: "view_orders",
  PROCESS_PAYMENTS: "process_payments",
  MANAGE_RESERVATIONS: "manage_reservations",
  VIEW_RESERVATIONS: "view_reservations",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_INVENTORY: "view_inventory",
  MANAGE_MENU: "manage_menu",
  VIEW_MENU: "view_menu",
  VIEW_FINANCIAL_REPORTS: "view_financial_reports",
  MANAGE_FINANCIAL_REPORTS: "manage_financial_reports",
  MANAGE_STAFF: "manage_staff",
  VIEW_STAFF: "view_staff",
  MANAGE_SHIFTS: "manage_shifts",
  MANAGE_GUESTS: "manage_guests",
  VIEW_GUESTS: "view_guests",
  MANAGE_TICKETS: "manage_tickets",
  VIEW_TICKETS: "view_tickets",
  VIEW_ANALYTICS: "view_analytics",
  VIEW_DASHBOARD: "view_dashboard",
};

export default authSlice.reducer;
