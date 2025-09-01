import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import userService from "../../services/userService";

// Async thunks
export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getAllUsers(filters);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to create user" }
      );
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(userId, userData);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update user" }
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.deleteUser(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to delete user" }
      );
    }
  }
);

export const fetchUsersByOutlet = createAsyncThunk(
  "users/fetchUsersByOutlet",
  async (outletId, { rejectWithValue }) => {
    try {
      const response = await userService.getUsersByOutlet(outletId);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users by outlet" }
      );
    }
  }
);

export const fetchUsersByRole = createAsyncThunk(
  "users/fetchUsersByRole",
  async (role, { rejectWithValue }) => {
    try {
      const response = await userService.getUsersByRole(role);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch users by role" }
      );
    }
  }
);

export const searchUsers = createAsyncThunk(
  "users/searchUsers",
  async ({ query, filters = {} }, { rejectWithValue }) => {
    try {
      const response = await userService.searchUsers(query, filters);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to search users" }
      );
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "users/toggleUserStatus",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.toggleUserStatus(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to toggle user status" }
      );
    }
  }
);

export const changeUserPassword = createAsyncThunk(
  "users/changeUserPassword",
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const response = await userService.changeUserPassword(
        userId,
        passwordData
      );
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to change password" }
      );
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  "users/fetchUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getUserStats();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user stats" }
      );
    }
  }
);

export const fetchUserPermissions = createAsyncThunk(
  "users/fetchUserPermissions",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userService.getUserPermissions(userId);
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to fetch user permissions" }
      );
    }
  }
);

export const updateUserPermissions = createAsyncThunk(
  "users/updateUserPermissions",
  async ({ userId, permissions }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUserPermissions(
        userId,
        permissions
      );
      return { userId, ...response };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to update user permissions" }
      );
    }
  }
);

// Initial state
const initialState = {
  users: [],
  filteredUsers: [],
  selectedUser: null,
  userStats: null,
  userPermissions: {},
  loading: false,
  error: null,
  filters: {
    role: "",
    outletId: "",
    isActive: null,
    search: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

// User slice
const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        role: "",
        outletId: "",
        isActive: null,
        search: "",
      };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateUserInList: (state, action) => {
      const updatedUser = action.payload;
      const index = state.users.findIndex((user) => user.id === updatedUser.id);
      if (index !== -1) {
        state.users[index] = updatedUser;
      }
    },
    removeUserFromList: (state, action) => {
      const userId = action.payload;
      state.users = state.users.filter((user) => user.id !== userId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || [];
        state.filteredUsers = action.payload.users || [];
        state.pagination = {
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 0,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload.user);
        state.filteredUsers.unshift(action.payload.user);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.user;
        const userIndex = state.users.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (userIndex !== -1) {
          state.users[userIndex] = updatedUser;
        }
        const filteredIndex = state.filteredUsers.findIndex(
          (user) => user.id === updatedUser.id
        );
        if (filteredIndex !== -1) {
          state.filteredUsers[filteredIndex] = updatedUser;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        const userId = action.payload.userId;
        state.users = state.users.filter((user) => user.id !== userId);
        state.filteredUsers = state.filteredUsers.filter(
          (user) => user.id !== userId
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch users by outlet
      .addCase(fetchUsersByOutlet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByOutlet.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredUsers = action.payload.users || [];
      })
      .addCase(fetchUsersByOutlet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch users by role
      .addCase(fetchUsersByRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersByRole.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredUsers = action.payload.users || [];
      })
      .addCase(fetchUsersByRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.filteredUsers = action.payload.users || [];
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle user status
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, user } = action.payload;
        const userIndex = state.users.findIndex((u) => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex] = user;
        }
        const filteredIndex = state.filteredUsers.findIndex(
          (u) => u.id === userId
        );
        if (filteredIndex !== -1) {
          state.filteredUsers[filteredIndex] = user;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change user password
      .addCase(changeUserPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user stats
      .addCase(fetchUserStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.loading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user permissions
      .addCase(fetchUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, permissions } = action.payload;
        state.userPermissions[userId] = permissions;
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user permissions
      .addCase(updateUserPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserPermissions.fulfilled, (state, action) => {
        state.loading = false;
        const { userId, permissions } = action.payload;
        state.userPermissions[userId] = permissions;
      })
      .addCase(updateUserPermissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedUser,
  clearSelectedUser,
  setFilters,
  clearFilters,
  setPagination,
  updateUserInList,
  removeUserFromList,
} = userSlice.actions;

// Selectors
export const selectAllUsers = (state) => state.users.users;
export const selectFilteredUsers = (state) => state.users.filteredUsers;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUserStats = (state) => state.users.userStats;
export const selectUserPermissions = (state) => state.users.userPermissions;
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersError = (state) => state.users.error;
export const selectUsersFilters = (state) => state.users.filters;
export const selectUsersPagination = (state) => state.users.pagination;

export default userSlice.reducer;
