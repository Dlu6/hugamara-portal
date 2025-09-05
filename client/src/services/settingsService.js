import apiClient from "./apiClient";

const settingsService = {
  // System Settings
  getSystemSettings: async () => {
    const response = await apiClient.get("/settings/system");
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await apiClient.put("/settings/system", { settings });
    return response.data;
  },

  // Outlet Information
  updateOutletInfo: async (outletData) => {
    const response = await apiClient.put("/settings/outlet", outletData);
    return response.data;
  },

  // User Preferences
  getUserPreferences: async () => {
    const response = await apiClient.get("/settings/preferences");
    return response.data;
  },

  updateUserPreferences: async (preferences) => {
    const response = await apiClient.put("/settings/preferences", {
      preferences,
    });
    return response.data;
  },

  // Roles and Permissions
  getRolesAndPermissions: async () => {
    const response = await apiClient.get("/settings/roles-permissions");
    return response.data;
  },

  updateRolePermissions: async (roleId, permissionIds) => {
    const response = await apiClient.put(
      `/settings/roles/${roleId}/permissions`,
      { permissionIds }
    );
    return response.data;
  },

  // System Statistics
  getSystemStats: async () => {
    const response = await apiClient.get("/settings/stats");
    return response.data;
  },

  // Backup and Restore
  backupSystemData: async () => {
    const response = await apiClient.post("/settings/backup");
    return response.data;
  },

  restoreSystemData: async (backupData) => {
    const response = await apiClient.post("/settings/restore", { backupData });
    return response.data;
  },

  // Utility functions
  formatOperatingHours: (hours) => {
    if (!hours || typeof hours !== "object") return {};

    const formatted = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      if (hours[day]) {
        formatted[day] = {
          isOpen: hours[day].isOpen || false,
          openTime: hours[day].openTime || "09:00",
          closeTime: hours[day].closeTime || "17:00",
        };
      } else {
        formatted[day] = {
          isOpen: false,
          openTime: "09:00",
          closeTime: "17:00",
        };
      }
    });

    return formatted;
  },

  validateOperatingHours: (hours) => {
    const errors = {};
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    days.forEach((day) => {
      if (hours[day] && hours[day].isOpen) {
        const openTime = hours[day].openTime;
        const closeTime = hours[day].closeTime;

        if (!openTime || !closeTime) {
          errors[day] = "Both open and close times are required when open";
        } else if (openTime >= closeTime) {
          errors[day] = "Close time must be after open time";
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  formatCurrency: (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  formatPercentage: (value) => {
    return `${(value * 100).toFixed(2)}%`;
  },
};

export default settingsService;
