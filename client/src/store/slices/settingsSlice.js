import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import settingsService from "../../services/settingsService";

// Async thunks
export const fetchSystemSettings = createAsyncThunk(
  "settings/fetchSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.getSystemSettings();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system settings"
      );
    }
  }
);

export const updateSystemSettings = createAsyncThunk(
  "settings/updateSystemSettings",
  async (settings, { rejectWithValue }) => {
    try {
      const data = await settingsService.updateSystemSettings(settings);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update system settings"
      );
    }
  }
);

export const updateOutletInfo = createAsyncThunk(
  "settings/updateOutletInfo",
  async (outletData, { rejectWithValue }) => {
    try {
      const data = await settingsService.updateOutletInfo(outletData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update outlet information"
      );
    }
  }
);

export const fetchUserPreferences = createAsyncThunk(
  "settings/fetchUserPreferences",
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.getUserPreferences();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user preferences"
      );
    }
  }
);

export const updateUserPreferences = createAsyncThunk(
  "settings/updateUserPreferences",
  async (preferences, { rejectWithValue }) => {
    try {
      const data = await settingsService.updateUserPreferences(preferences);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update user preferences"
      );
    }
  }
);

export const fetchRolesAndPermissions = createAsyncThunk(
  "settings/fetchRolesAndPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.getRolesAndPermissions();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch roles and permissions"
      );
    }
  }
);

export const updateRolePermissions = createAsyncThunk(
  "settings/updateRolePermissions",
  async ({ roleId, permissionIds }, { rejectWithValue }) => {
    try {
      const data = await settingsService.updateRolePermissions(
        roleId,
        permissionIds
      );
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update role permissions"
      );
    }
  }
);

export const fetchSystemStats = createAsyncThunk(
  "settings/fetchSystemStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.getSystemStats();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch system statistics"
      );
    }
  }
);

export const backupSystemData = createAsyncThunk(
  "settings/backupSystemData",
  async (_, { rejectWithValue }) => {
    try {
      const data = await settingsService.backupSystemData();
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to backup system data"
      );
    }
  }
);

export const restoreSystemData = createAsyncThunk(
  "settings/restoreSystemData",
  async (backupData, { rejectWithValue }) => {
    try {
      const data = await settingsService.restoreSystemData(backupData);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to restore system data"
      );
    }
  }
);

const initialState = {
  // System Settings
  outlet: null,
  systemSettings: {},

  // User Preferences
  userPreferences: {},

  // Roles and Permissions
  roles: [],
  permissions: [],

  // System Statistics
  systemStats: {},

  // UI State
  loading: false,
  error: null,

  // Form States
  outletForm: {
    name: "",
    address: "",
    phone: "",
    email: "",
    timezone: "UTC",
    currency: "USD",
    taxRate: 0.1,
    serviceCharge: 0.05,
    deliveryFee: 0,
    operatingHours: {},
  },

  settingsForm: {
    maxTables: 50,
    maxStaffPerShift: 20,
    reservationTimeLimit: 30,
    orderTimeout: 15,
    autoLogoutTime: 480,
    enableNotifications: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    defaultLanguage: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    theme: "light",
  },

  preferencesForm: {
    theme: "light",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    dashboard: {
      defaultView: "overview",
      showCharts: true,
      refreshInterval: 30,
    },
  },

  // Validation
  outletFormErrors: {},
  settingsFormErrors: {},
  preferencesFormErrors: {},

  // Active Tab
  activeTab: "outlet",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    // Form Management
    updateOutletForm: (state, action) => {
      state.outletForm = { ...state.outletForm, ...action.payload };
    },

    updateSettingsForm: (state, action) => {
      state.settingsForm = { ...state.settingsForm, ...action.payload };
    },

    updatePreferencesForm: (state, action) => {
      state.preferencesForm = { ...state.preferencesForm, ...action.payload };
    },

    // Form Validation
    setOutletFormErrors: (state, action) => {
      state.outletFormErrors = action.payload;
    },

    setSettingsFormErrors: (state, action) => {
      state.settingsFormErrors = action.payload;
    },

    setPreferencesFormErrors: (state, action) => {
      state.preferencesFormErrors = action.payload;
    },

    clearFormErrors: (state) => {
      state.outletFormErrors = {};
      state.settingsFormErrors = {};
      state.preferencesFormErrors = {};
    },

    // UI State
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset Forms
    resetOutletForm: (state) => {
      state.outletForm = initialState.outletForm;
      state.outletFormErrors = {};
    },

    resetSettingsForm: (state) => {
      state.settingsForm = initialState.settingsForm;
      state.settingsFormErrors = {};
    },

    resetPreferencesForm: (state) => {
      state.preferencesForm = initialState.preferencesForm;
      state.preferencesFormErrors = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch System Settings
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.outlet = action.payload.outlet;
        state.systemSettings = action.payload.systemSettings;

        // Update forms with fetched data
        if (action.payload.outlet) {
          state.outletForm = {
            name: action.payload.outlet.name || "",
            address: action.payload.outlet.address || "",
            phone: action.payload.outlet.phone || "",
            email: action.payload.outlet.email || "",
            timezone: action.payload.outlet.timezone || "UTC",
            currency: action.payload.outlet.currency || "USD",
            taxRate: action.payload.outlet.taxRate || 0.1,
            serviceCharge: action.payload.outlet.serviceCharge || 0.05,
            deliveryFee: action.payload.outlet.deliveryFee || 0,
            operatingHours: action.payload.outlet.operatingHours || {},
          };
        }

        state.settingsForm = {
          ...state.settingsForm,
          ...action.payload.systemSettings,
        };
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update System Settings
      .addCase(updateSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.systemSettings = action.payload.settings;
        state.settingsForm = {
          ...state.settingsForm,
          ...action.payload.settings,
        };
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Outlet Info
      .addCase(updateOutletInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOutletInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.outlet = action.payload.outlet;
        state.outletForm = { ...state.outletForm, ...action.payload.outlet };
      })
      .addCase(updateOutletInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch User Preferences
      .addCase(fetchUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.userPreferences = action.payload.preferences;
        state.preferencesForm = {
          ...state.preferencesForm,
          ...action.payload.preferences,
        };
      })
      .addCase(fetchUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update User Preferences
      .addCase(updateUserPreferences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPreferences.fulfilled, (state, action) => {
        state.loading = false;
        state.userPreferences = action.payload.preferences;
        state.preferencesForm = {
          ...state.preferencesForm,
          ...action.payload.preferences,
        };
      })
      .addCase(updateUserPreferences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Roles and Permissions
      .addCase(fetchRolesAndPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRolesAndPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload.roles;
        state.permissions = action.payload.permissions;
      })
      .addCase(fetchRolesAndPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Role Permissions
      .addCase(updateRolePermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRole = action.payload.role;
        const roleIndex = state.roles.findIndex(
          (role) => role.id === updatedRole.id
        );
        if (roleIndex !== -1) {
          state.roles[roleIndex] = updatedRole;
        }
      })
      .addCase(updateRolePermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch System Stats
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Backup System Data
      .addCase(backupSystemData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(backupSystemData.fulfilled, (state, action) => {
        state.loading = false;
        // Handle backup success
      })
      .addCase(backupSystemData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Restore System Data
      .addCase(restoreSystemData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restoreSystemData.fulfilled, (state, action) => {
        state.loading = false;
        // Handle restore success
      })
      .addCase(restoreSystemData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  updateOutletForm,
  updateSettingsForm,
  updatePreferencesForm,
  setOutletFormErrors,
  setSettingsFormErrors,
  setPreferencesFormErrors,
  clearFormErrors,
  setActiveTab,
  clearError,
  resetOutletForm,
  resetSettingsForm,
  resetPreferencesForm,
} = settingsSlice.actions;

export default settingsSlice.reducer;
