import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Shield,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";
import {
  selectCurrentUser,
  selectUserPermissions,
  hasPermission,
} from "../store/slices/authSlice";
import { usersAPI, outletsAPI } from "../services/apiClient";
import { useToast } from "../components/ui/ToastProvider";

const UserManagement = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const userPermissions = useSelector(selectUserPermissions);

  const [users, setUsers] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterOutlet, setFilterOutlet] = useState("");
  const { success: showSuccess, error: showError, info: showInfo } = useToast();

  // Form state for create/edit user
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "staff",
    outletId: "",
    isActive: true,
  });

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Role definitions with descriptions
  const roles = [
    {
      value: "org_admin",
      label: "Organization Admin",
      description: "Full system access across all outlets",
    },
    {
      value: "general_manager",
      label: "General Manager",
      description: "Outlet management and operations",
    },
    {
      value: "supervisor",
      label: "Supervisor",
      description: "Team supervision and operational tasks",
    },
    { value: "staff", label: "Staff", description: "Basic operational tasks" },
    {
      value: "marketing_crm",
      label: "Marketing & CRM",
      description: "Guest management and marketing",
    },
    {
      value: "finance",
      label: "Finance",
      description: "Financial reporting and payments",
    },
  ];

  // Check permissions
  const canManageUsers = hasPermission(userPermissions, "manage_users");
  const canViewUsers = hasPermission(userPermissions, "view_users");

  useEffect(() => {
    if (!canViewUsers) {
      // Redirect to unauthorized page
      return;
    }

    fetchUsers();
    fetchOutlets();
  }, [canViewUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await usersAPI.getAll();
      const list = res?.data?.users || res?.data || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError(
        "Failed to load users",
        error?.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchOutlets = async () => {
    try {
      // Prefer authenticated outlets list; fall back to public if needed
      try {
        const res = await outletsAPI.getAll();
        const list = res?.data?.outlets || res?.data || [];
        setOutlets(Array.isArray(list) ? list : []);
      } catch (err) {
        const res = await outletsAPI.getPublic();
        const list = res?.data?.outlets || res?.data || [];
        setOutlets(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error("Failed to fetch outlets:", error);
      showError(
        "Failed to load outlets",
        error?.response?.data?.message || "Please try again"
      );
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, password };
      setFormErrors({});
      const res = await usersAPI.create(payload);
      const created = res?.data?.user || res?.data;
      if (created?.id) {
        // Optimistically update list
        setUsers((prev) => [created, ...prev]);
        showSuccess("User created", `${created.firstName} ${created.lastName}`);
      } else {
        // Fallback to refresh
        await fetchUsers();
      }
      setShowCreateModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "staff",
        outletId: "",
        isActive: true,
      });
      setPassword("");
    } catch (error) {
      console.error("Failed to create user:", error);
      const data = error?.response?.data;
      const message = data?.message || "Failed to create user";
      if (Array.isArray(data?.details)) {
        const mapped = {};
        data.details.forEach((d) => {
          if (d?.field && d?.message) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Create user failed", message);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});
      const res = await usersAPI.update(selectedUser.id, { ...formData });
      const updated = res?.data?.user || res?.data;
      if (updated?.id) {
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id ? updated : u))
        );
        showSuccess("User updated", `${updated.firstName} ${updated.lastName}`);
      } else {
        await fetchUsers();
      }
      setShowEditModal(false);
      setSelectedUser(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "staff",
        outletId: "",
        isActive: true,
      });
    } catch (error) {
      console.error("Failed to update user:", error);
      const data = error?.response?.data;
      const message = data?.message || "Failed to update user";
      if (Array.isArray(data?.details)) {
        const mapped = {};
        data.details.forEach((d) => {
          if (d?.field && d?.message) mapped[d.field] = d.message;
        });
        setFormErrors(mapped);
      }
      showError("Update user failed", message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      // Reflect soft-delete (isActive=false) by removing or updating status
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showSuccess("User deleted", "The user was deactivated successfully");
    } catch (error) {
      console.error("Failed to delete user:", error);
      showError(
        "Delete user failed",
        error?.response?.data?.message || "Please try again"
      );
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormErrors({});
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      outletId: user.outlet?.id || "",
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const getRoleInfo = (role) => {
    return (
      roles.find((r) => r.value === role) || {
        label: role,
        description: "Unknown role",
      }
    );
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !filterRole || user.role === filterRole;
    const matchesOutlet = !filterOutlet || user.outlet?.id === filterOutlet;

    return matchesSearch && matchesRole && matchesOutlet;
  });

  if (!canViewUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage users, roles, and access permissions across all outlets
              </p>
            </div>
            {canManageUsers && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Add New User
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full form-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full form-input"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Outlet
              </label>
              <select
                value={filterOutlet}
                onChange={(e) => setFilterOutlet(e.target.value)}
                className="w-full form-input"
              >
                <option value="">All Outlets</option>
                {outlets.map((outlet) => (
                  <option key={outlet.id} value={outlet.id}>
                    {outlet.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterRole("");
                  setFilterOutlet("");
                }}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outlet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600">
                                  {user.firstName[0]}
                                  {user.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {roleInfo.label}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {roleInfo.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {user.outlet?.name || "No outlet assigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canManageUsers && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Create New User
                </h3>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1 w-full form-input"
                      />
                      {formErrors.firstName && (
                        <div className="text-xs text-red-600 mt-1">
                          {formErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-1 w-full form-input"
                      />
                      {formErrors.lastName && (
                        <div className="text-xs text-red-600 mt-1">
                          {formErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    />
                    {formErrors.email && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    />
                    {formErrors.phone && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.role}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Outlet
                    </label>
                    <select
                      value={formData.outletId}
                      onChange={(e) =>
                        setFormData({ ...formData, outletId: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    >
                      <option value="">Select an outlet</option>
                      {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.outletId && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.outletId}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 w-full form-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {formErrors.password && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.password}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active user
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Edit User
                </h3>
                <form onSubmit={handleEditUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        className="mt-1 w-full form-input"
                      />
                      {formErrors.firstName && (
                        <div className="text-xs text-red-600 mt-1">
                          {formErrors.firstName}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className="mt-1 w-full form-input"
                      />
                      {formErrors.lastName && (
                        <div className="text-xs text-red-600 mt-1">
                          {formErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    />
                    {formErrors.email && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    />
                    {formErrors.phone && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.phone}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    {formErrors.role && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.role}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Outlet
                    </label>
                    <select
                      value={formData.outletId}
                      onChange={(e) =>
                        setFormData({ ...formData, outletId: e.target.value })
                      }
                      className="mt-1 w-full form-input"
                    >
                      <option value="">Select an outlet</option>
                      {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.outletId && (
                      <div className="text-xs text-red-600 mt-1">
                        {formErrors.outletId}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active user
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      Update User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
