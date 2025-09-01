import api from "./apiClient";

// User management API endpoints
export const userAPI = {
  // Get all users
  getAllUsers: (params = {}) => api.get("/users", params),

  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),

  // Create new user
  createUser: (userData) => api.post("/users", userData),

  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),

  // Get users by outlet
  getUsersByOutlet: (outletId) => api.get(`/users/outlet/${outletId}`),

  // Get users by role
  getUsersByRole: (role) => api.get(`/users/role/${role}`),

  // Change user password
  changeUserPassword: (id, passwordData) =>
    api.post(`/users/${id}/change-password`, passwordData),

  // Activate/deactivate user
  toggleUserStatus: (id) => api.patch(`/users/${id}/toggle-status`),

  // Get user permissions
  getUserPermissions: (id) => api.get(`/users/${id}/permissions`),

  // Update user permissions
  updateUserPermissions: (id, permissions) =>
    api.put(`/users/${id}/permissions`, { permissions }),

  // Get user activity
  getUserActivity: (id) => api.get(`/users/${id}/activity`),

  // Search users
  searchUsers: (query, params = {}) =>
    api.get("/users/search", { q: query, ...params }),

  // Bulk operations
  bulkCreateUsers: (users) => api.post("/users/bulk", { users }),
  bulkUpdateUsers: (updates) => api.put("/users/bulk", { updates }),
  bulkDeleteUsers: (ids) => api.delete("/users/bulk", { data: { ids } }),

  // User statistics
  getUserStats: () => api.get("/users/stats"),
  getUsersByRoleStats: () => api.get("/users/stats/by-role"),
  getUsersByOutletStats: () => api.get("/users/stats/by-outlet"),
};

// User service class with business logic
class UserService {
  // Get all users with optional filtering
  async getAllUsers(filters = {}) {
    try {
      const params = new URLSearchParams();

      if (filters.role) params.append("role", filters.role);
      if (filters.outletId) params.append("outletId", filters.outletId);
      if (filters.isActive !== undefined)
        params.append("isActive", filters.isActive);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", filters.page);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await userAPI.getAllUsers(params.toString());
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Create a new user
  async createUser(userData) {
    try {
      const response = await userAPI.createUser(userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Update an existing user
  async updateUser(userId, userData) {
    try {
      const response = await userAPI.updateUser(userId, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete a user
  async deleteUser(userId) {
    try {
      const response = await userAPI.deleteUser(userId);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Get users by outlet
  async getUsersByOutlet(outletId) {
    try {
      const response = await userAPI.getUsersByOutlet(outletId);
      return response.data;
    } catch (error) {
      console.error("Error fetching users by outlet:", error);
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const response = await userAPI.getUsersByRole(role);
      return response.data;
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, filters = {}) {
    try {
      const response = await userAPI.searchUsers(query, filters);
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw error;
    }
  }

  // Change user password
  async changeUserPassword(userId, passwordData) {
    try {
      const response = await userAPI.changeUserPassword(userId, passwordData);
      return response.data;
    } catch (error) {
      console.error("Error changing user password:", error);
      throw error;
    }
  }

  // Toggle user status (activate/deactivate)
  async toggleUserStatus(userId) {
    try {
      const response = await userAPI.toggleUserStatus(userId);
      return response.data;
    } catch (error) {
      console.error("Error toggling user status:", error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const response = await userAPI.getUserPermissions(userId);
      return response.data;
    } catch (error) {
      console.error("Error fetching user permissions:", error);
      throw error;
    }
  }

  // Update user permissions
  async updateUserPermissions(userId, permissions) {
    try {
      const response = await userAPI.updateUserPermissions(userId, permissions);
      return response.data;
    } catch (error) {
      console.error("Error updating user permissions:", error);
      throw error;
    }
  }

  // Get user activity
  async getUserActivity(userId) {
    try {
      const response = await userAPI.getUserActivity(userId);
      return response.data;
    } catch (error) {
      console.error("Error fetching user activity:", error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      const response = await userAPI.getUserStats();
      return response.data;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw error;
    }
  }

  // Get users by role statistics
  async getUsersByRoleStats() {
    try {
      const response = await userAPI.getUsersByRoleStats();
      return response.data;
    } catch (error) {
      console.error("Error fetching users by role stats:", error);
      throw error;
    }
  }

  // Get users by outlet statistics
  async getUsersByOutletStats() {
    try {
      const response = await userAPI.getUsersByOutletStats();
      return response.data;
    } catch (error) {
      console.error("Error fetching users by outlet stats:", error);
      throw error;
    }
  }

  // Bulk create users
  async bulkCreateUsers(users) {
    try {
      const response = await userAPI.bulkCreateUsers(users);
      return response.data;
    } catch (error) {
      console.error("Error bulk creating users:", error);
      throw error;
    }
  }

  // Bulk update users
  async bulkUpdateUsers(updates) {
    try {
      const response = await userAPI.bulkUpdateUsers(updates);
      return response.data;
    } catch (error) {
      console.error("Error bulk updating users:", error);
      throw error;
    }
  }

  // Bulk delete users
  async bulkDeleteUsers(userIds) {
    try {
      const response = await userAPI.bulkDeleteUsers(userIds);
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting users:", error);
      throw error;
    }
  }

  // Validate user data
  validateUserData(userData) {
    const errors = [];

    if (!userData.firstName || userData.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters long");
    }

    if (!userData.lastName || userData.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters long");
    }

    if (!userData.email || !this.isValidEmail(userData.email)) {
      errors.push("Please enter a valid email address");
    }

    if (!userData.role) {
      errors.push("Please select a role");
    }

    if (userData.password && userData.password.length < 6) {
      errors.push("Password must be at least 6 characters long");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format user data for display
  formatUserForDisplay(user) {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      displayRole: this.getRoleDisplayName(user.role),
      displayOutlet: user.outlet?.name || "No outlet assigned",
      displayStatus: user.isActive ? "Active" : "Inactive",
      lastLoginFormatted: user.lastLoginAt
        ? new Date(user.lastLoginAt).toLocaleDateString()
        : "Never",
    };
  }

  // Get role display name
  getRoleDisplayName(role) {
    const roleNames = {
      org_admin: "Organization Admin",
      general_manager: "General Manager",
      supervisor: "Supervisor",
      staff: "Staff",
      marketing_crm: "Marketing & CRM",
      finance: "Finance",
    };
    return roleNames[role] || role;
  }

  // Get role color class
  getRoleColorClass(role) {
    const roleColors = {
      org_admin: "bg-red-100 text-red-800",
      general_manager: "bg-blue-100 text-blue-800",
      supervisor: "bg-green-100 text-green-800",
      staff: "bg-gray-100 text-gray-800",
      marketing_crm: "bg-purple-100 text-purple-800",
      finance: "bg-yellow-100 text-yellow-800",
    };
    return roleColors[role] || "bg-gray-100 text-gray-800";
  }
}

// Export singleton instance
const userService = new UserService();
export default userService;
