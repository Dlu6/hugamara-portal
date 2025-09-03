import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  DollarSign,
  Filter,
  Award,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import { staffAPI } from "../services/apiClient";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
    employeeId: "",
    position: "",
    department: "front_of_house",
    hireDate: "",
    terminationDate: "",
    isActive: true,
    hourlyRate: 0,
    salary: 0,
    payFrequency: "hourly",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
    skills: [],
    certifications: [],
    performanceRating: 0,
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [performanceModal, setPerformanceModal] = useState(null);
  const [performanceData, setPerformanceData] = useState({
    performanceRating: 0,
    reviewNotes: "",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchStaff();
    fetchStats();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (departmentFilter) params.append("department", departmentFilter);
      if (statusFilter !== "") params.append("isActive", statusFilter);

      const response = await staffAPI.getAll(params.toString());
      setStaff(response.staff || []);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      showError("Failed to fetch staff", error?.response?.data?.message || "");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await staffAPI.getStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error("Failed to fetch staff stats:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      employeeId: "",
      position: "",
      department: "front_of_house",
      hireDate: "",
      terminationDate: "",
      isActive: true,
      hourlyRate: 0,
      salary: 0,
      payFrequency: "hourly",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
      skills: [],
      certifications: [],
      performanceRating: 0,
      notes: "",
    });
    setFormErrors({});
    setEditingStaff(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditModal = (staffMember) => {
    setFormData({
      employeeId: staffMember.employeeId || "",
      position: staffMember.position || "",
      department: staffMember.department || "front_of_house",
      hireDate: staffMember.hireDate ? staffMember.hireDate.split("T")[0] : "",
      terminationDate: staffMember.terminationDate
        ? staffMember.terminationDate.split("T")[0]
        : "",
      isActive: staffMember.isActive || true,
      hourlyRate: staffMember.hourlyRate || 0,
      salary: staffMember.salary || 0,
      payFrequency: staffMember.payFrequency || "hourly",
      emergencyContact: staffMember.emergencyContact || {
        name: "",
        phone: "",
        relationship: "",
      },
      skills: staffMember.skills || [],
      certifications: staffMember.certifications || [],
      performanceRating: staffMember.performanceRating || 0,
      notes: staffMember.notes || "",
    });
    setEditingStaff(staffMember);
    setShowForm(true);
  };

  const openViewModal = (staffMember) => {
    setViewingStaff(staffMember);
  };

  const openPerformanceModal = (staffMember) => {
    setPerformanceModal(staffMember);
    setPerformanceData({
      performanceRating: staffMember.performanceRating || 0,
      reviewNotes: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});

      if (editingStaff) {
        await staffAPI.update(editingStaff.id, formData);
        showSuccess("Staff member updated successfully");
      } else {
        await staffAPI.create(formData);
        showSuccess("Staff member created successfully");
      }

      setShowForm(false);
      resetForm();
      fetchStaff();
      fetchStats();
    } catch (error) {
      console.error("Failed to save staff member:", error);
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        setFormErrors(errors);
      } else {
        showError(
          "Failed to save staff member",
          error?.response?.data?.message || ""
        );
      }
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to terminate this staff member?")
    )
      return;

    try {
      await staffAPI.delete(id);
      showSuccess("Staff member terminated successfully");
      fetchStaff();
      fetchStats();
    } catch (error) {
      console.error("Failed to terminate staff member:", error);
      showError(
        "Failed to terminate staff member",
        error?.response?.data?.message || ""
      );
    }
  };

  const handlePerformanceUpdate = async (e) => {
    e.preventDefault();
    try {
      await staffAPI.updatePerformance(performanceModal.id, performanceData);
      showSuccess("Performance updated successfully");
      setPerformanceModal(null);
      fetchStaff();
    } catch (error) {
      console.error("Failed to update performance:", error);
      showError(
        "Failed to update performance",
        error?.response?.data?.message || ""
      );
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      front_of_house: "text-blue-500 bg-blue-900/20",
      back_of_house: "text-green-500 bg-green-900/20",
      kitchen: "text-orange-500 bg-orange-900/20",
      bar: "text-purple-500 bg-purple-900/20",
      management: "text-red-500 bg-red-900/20",
      security: "text-gray-500 bg-gray-900/20",
      cleaning: "text-cyan-500 bg-cyan-900/20",
      maintenance: "text-yellow-500 bg-yellow-900/20",
    };
    return colors[department] || "text-neutral-500 bg-neutral-900/20";
  };

  const formatDepartment = (department) => {
    return department
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTenure = (hireDate) => {
    const now = new Date();
    const hire = new Date(hireDate);
    const diffTime = now - hire;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
      return `${years}y ${months}m`;
    } else if (months > 0) {
      return `${months}m`;
    } else {
      return `${diffDays}d`;
    }
  };

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading staff...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Staff Management</h1>
          <p className="text-neutral-400 mt-1">
            Manage your staff members, performance, and departments
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Staff
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Staff</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalStaff || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Active Staff</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.activeStaff || 0}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">New Hires</p>
              <p className="text-2xl font-bold text-amber-500">
                {stats.newHires || 0}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Avg Performance</p>
              <p className="text-2xl font-bold text-purple-500">
                {stats.avgPerformance?.toFixed(1) || "0.0"}
              </p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.inactiveStaff || 0}
              </p>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg w-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="front_of_house">Front of House</option>
            <option value="back_of_house">Back of House</option>
            <option value="kitchen">Kitchen</option>
            <option value="bar">Bar</option>
            <option value="management">Management</option>
            <option value="security">Security</option>
            <option value="cleaning">Cleaning</option>
            <option value="maintenance">Maintenance</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            onClick={fetchStaff}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Department
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Tenure
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Pay Rate
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Performance
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {staff.map((staffMember) => (
                <tr
                  key={staffMember.id}
                  className="border-t border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {staffMember.employeeId}
                      </div>
                      <div className="text-sm text-neutral-400">
                        Hired:{" "}
                        {new Date(staffMember.hireDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDepartmentColor(
                        staffMember.department
                      )}`}
                    >
                      {formatDepartment(staffMember.department)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {staffMember.position}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {getTenure(staffMember.hireDate)}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {staffMember.hourlyRate
                      ? formatCurrency(staffMember.hourlyRate) + "/hr"
                      : staffMember.salary
                      ? formatCurrency(staffMember.salary) +
                        "/" +
                        staffMember.payFrequency
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-white">
                        {staffMember.performanceRating || "N/A"}
                      </span>
                      {staffMember.performanceRating && (
                        <Award className="h-3 w-3 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        staffMember.isActive
                          ? "text-green-500 bg-green-900/20"
                          : "text-red-500 bg-red-900/20"
                      }`}
                    >
                      {staffMember.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(staffMember)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openEditModal(staffMember)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Edit Staff"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openPerformanceModal(staffMember)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Update Performance"
                      >
                        <Award className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(staffMember.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Terminate Staff"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingStaff ? "Edit Staff Member" : "Add Staff Member"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Auto-generated if empty"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.position
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.position && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.position}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Department *
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.department
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="front_of_house">Front of House</option>
                      <option value="back_of_house">Back of House</option>
                      <option value="kitchen">Kitchen</option>
                      <option value="bar">Bar</option>
                      <option value="management">Management</option>
                      <option value="security">Security</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    {formErrors.department && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.department}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Hire Date *
                    </label>
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) =>
                        setFormData({ ...formData, hireDate: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.hireDate
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.hireDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.hireDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Pay Frequency *
                    </label>
                    <select
                      value={formData.payFrequency}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          payFrequency: e.target.value,
                        })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.payFrequency
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="hourly">Hourly</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    {formErrors.payFrequency && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.payFrequency}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Hourly Rate (UGX)
                    </label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hourlyRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Salary (UGX)
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Performance Rating
                    </label>
                    <input
                      type="number"
                      value={formData.performanceRating}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          performanceRating: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-neutral-300">
                    Active Staff Member
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingStaff ? "Update Staff" : "Add Staff"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Performance Update Modal */}
      {performanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Update Performance - {performanceModal.employeeId}
            </h2>
            <form onSubmit={handlePerformanceUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Performance Rating (0-5)
                  </label>
                  <input
                    type="number"
                    value={performanceData.performanceRating}
                    onChange={(e) =>
                      setPerformanceData({
                        ...performanceData,
                        performanceRating: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="5"
                    step="0.1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Review Notes
                  </label>
                  <textarea
                    value={performanceData.reviewNotes}
                    onChange={(e) =>
                      setPerformanceData({
                        ...performanceData,
                        reviewNotes: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Performance
                </button>
                <button
                  type="button"
                  onClick={() => setPerformanceModal(null)}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              Staff Details - {viewingStaff.employeeId}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400">Position:</span>
                <span className="text-white ml-2">{viewingStaff.position}</span>
              </div>
              <div>
                <span className="text-neutral-400">Department:</span>
                <span className="text-white ml-2">
                  {formatDepartment(viewingStaff.department)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Hire Date:</span>
                <span className="text-white ml-2">
                  {new Date(viewingStaff.hireDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Tenure:</span>
                <span className="text-white ml-2">
                  {getTenure(viewingStaff.hireDate)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Pay Rate:</span>
                <span className="text-white ml-2">
                  {viewingStaff.hourlyRate
                    ? formatCurrency(viewingStaff.hourlyRate) + "/hr"
                    : viewingStaff.salary
                    ? formatCurrency(viewingStaff.salary) +
                      "/" +
                      viewingStaff.payFrequency
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Performance Rating:</span>
                <span className="text-white ml-2">
                  {viewingStaff.performanceRating || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    viewingStaff.isActive
                      ? "text-green-500 bg-green-900/20"
                      : "text-red-500 bg-red-900/20"
                  }`}
                >
                  {viewingStaff.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {viewingStaff.notes && (
                <div>
                  <span className="text-neutral-400">Notes:</span>
                  <p className="text-white mt-1">{viewingStaff.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setViewingStaff(null)}
                className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
