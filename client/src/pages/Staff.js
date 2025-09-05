import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  RefreshCw,
  Download,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  fetchStaffStats,
  updateStaffStatus,
  updateStaffPerformance,
  setFilters,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingStaff,
  setViewingStaff,
  setPerformanceModal,
  setPerformanceData,
  clearError,
} from "../store/slices/staffSlice";
import {
  selectStaff,
  selectFilteredStaff,
  selectStaffStats,
  selectStaffLoading,
  selectStaffError,
  selectStaffFilters,
  selectStaffFormData,
  selectStaffFormErrors,
  selectShowStaffForm,
  selectEditingStaff,
  selectViewingStaff,
  selectPerformanceModal,
  selectPerformanceData,
} from "../store/slices/staffSlice";
import { selectCurrentUser, selectUserRole } from "../store/slices/authSlice";
import { useUserPermissions } from "../hooks/useUserPermissions";
import { useDepartments } from "../hooks/useDepartments";
import { generateEmployeeId } from "../utils/employeeIdGenerator";
import DepartmentManager from "../components/DepartmentManager";

const Staff = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  // Redux state
  const staff = useSelector(selectStaff);
  const filteredStaff = useSelector(selectFilteredStaff);
  const stats = useSelector(selectStaffStats);
  const loading = useSelector(selectStaffLoading);
  const error = useSelector(selectStaffError);
  const filters = useSelector(selectStaffFilters);
  const formData = useSelector(selectStaffFormData);
  const formErrors = useSelector(selectStaffFormErrors);
  const showForm = useSelector(selectShowStaffForm);
  const editingStaff = useSelector(selectEditingStaff);
  const viewingStaff = useSelector(selectViewingStaff);
  const performanceModal = useSelector(selectPerformanceModal);
  const performanceData = useSelector(selectPerformanceData);

  // Custom hooks
  const { user, userRole, canManageDepartments, canManageStaff, canViewStaff } =
    useUserPermissions();
  const { departments, addDepartment, formatDepartmentName } = useDepartments();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchStaff());
    dispatch(fetchStaffStats());
  }, [dispatch]);

  // Handle search and filtering
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleDepartmentFilter = (department) => {
    setSelectedDepartment(department);
    dispatch(setFilters({ department }));
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    dispatch(setFilters({ status }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    dispatch(setFormData({ [name]: newValue }));
  };

  const handleNestedInputChange = (parentKey, field, value) => {
    dispatch(
      setFormData({
        [parentKey]: {
          ...formData[parentKey],
          [field]: value,
        },
      })
    );
  };

  const handleArrayChange = (name, value) => {
    dispatch(setFormData({ [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingStaff) {
        await dispatch(
          updateStaff({
            id: editingStaff.id,
            staffData: formData,
          })
        ).unwrap();
        showSuccess("Staff member updated successfully");
      } else {
        await dispatch(createStaff(formData)).unwrap();
        showSuccess("Staff member created successfully");
      }

      dispatch(setShowForm(false));
      dispatch(setEditingStaff(null));
      dispatch(fetchStaff());
      dispatch(fetchStaffStats());
    } catch (error) {
      showError(error.message || "Failed to save staff member");
    }
  };

  const handleEdit = (staffMember) => {
    dispatch(setEditingStaff(staffMember));
    dispatch(setFormData(staffMember));
    dispatch(setShowForm(true));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await dispatch(deleteStaff(id)).unwrap();
        showSuccess("Staff member deleted successfully");
        dispatch(fetchStaff());
        dispatch(fetchStaffStats());
      } catch (error) {
        showError(error.message || "Failed to delete staff member");
      }
    }
  };

  const handleView = (staffMember) => {
    dispatch(setViewingStaff(staffMember));
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateStaffStatus({ id, status })).unwrap();
      showSuccess("Staff status updated successfully");
      dispatch(fetchStaff());
      dispatch(fetchStaffStats());
    } catch (error) {
      showError(error.message || "Failed to update staff status");
    }
  };

  const handlePerformanceUpdate = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        updateStaffPerformance({
          id: performanceModal.id,
          performanceData,
        })
      ).unwrap();

      showSuccess("Performance updated successfully");
      dispatch(setPerformanceModal(null));
      dispatch(
        setPerformanceData({
          rating: 0,
          comments: "",
          goals: [],
          achievements: [],
        })
      );
      dispatch(fetchStaff());
    } catch (error) {
      showError(error.message || "Failed to update performance");
    }
  };

  const resetForm = () => {
    dispatch(
      setFormData({
        employeeId: generateEmployeeId(), // Auto-generate employee ID
        firstName: "", // Add missing name fields
        lastName: "",
        position: "",
        department: "front_of_house",
        departmentId: "", // New field for department selection
        hireDate: "",
        terminationDate: null, // Use null instead of empty string for optional dates
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
      })
    );
    dispatch(setFormErrors({}));
  };

  const openCreateForm = () => {
    resetForm();
    dispatch(setEditingStaff(null));
    dispatch(setShowForm(true));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Use the formatDepartmentName from the hook
  const formatDepartment = formatDepartmentName;

  const getDepartmentColor = (department) => {
    const colorMap = {
      front_of_house: "bg-blue-100 text-blue-800",
      back_of_house: "bg-green-100 text-green-800",
      management: "bg-purple-100 text-purple-800",
      bar: "bg-yellow-100 text-yellow-800",
      kitchen: "bg-red-100 text-red-800",
      service: "bg-indigo-100 text-indigo-800",
      cleaning: "bg-gray-100 text-gray-800",
      security: "bg-orange-100 text-orange-800",
      maintenance: "bg-teal-100 text-teal-800",
      other: "bg-neutral-100 text-neutral-800",
    };
    return colorMap[department] || "bg-neutral-100 text-neutral-800";
  };

  const getStatusColor = (isActive) => {
    return isActive ? "text-green-600" : "text-red-600";
  };

  const getStatusIcon = (isActive) => {
    return isActive ? UserCheck : UserX;
  };

  const getCategoryOptions = () => [
    { value: "front_of_house", label: "Front of House" },
    { value: "back_of_house", label: "Back of House" },
    { value: "management", label: "Management" },
    { value: "bar", label: "Bar" },
    { value: "kitchen", label: "Kitchen" },
    { value: "service", label: "Service" },
    { value: "cleaning", label: "Cleaning" },
    { value: "security", label: "Security" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Other" },
  ];

  const getPayFrequencyOptions = () => [
    { value: "hourly", label: "Hourly" },
    { value: "salary", label: "Salary" },
  ];

  const getRelationshipOptions = () => [
    { value: "spouse", label: "Spouse" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "child", label: "Child" },
    { value: "friend", label: "Friend" },
    { value: "other", label: "Other" },
  ];

  const getSkillOptions = () => [
    { value: "customer_service", label: "Customer Service" },
    { value: "food_preparation", label: "Food Preparation" },
    { value: "bartending", label: "Bartending" },
    { value: "waiting", label: "Waiting" },
    { value: "cleaning", label: "Cleaning" },
    { value: "cash_handling", label: "Cash Handling" },
    { value: "inventory_management", label: "Inventory Management" },
    { value: "team_leadership", label: "Team Leadership" },
    { value: "problem_solving", label: "Problem Solving" },
    { value: "multitasking", label: "Multitasking" },
  ];

  const getCertificationOptions = () => [
    { value: "food_safety", label: "Food Safety Certification" },
    { value: "alcohol_service", label: "Alcohol Service Certification" },
    { value: "first_aid", label: "First Aid Certification" },
    { value: "cpr", label: "CPR Certification" },
    { value: "fire_safety", label: "Fire Safety Certification" },
    { value: "customer_service", label: "Customer Service Certification" },
  ];

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <div className="bg-neutral-800 rounded-lg shadow-lg p-6 border border-neutral-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-${color}-100 bg-opacity-20`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-neutral-400">{title}</p>
            <p className="text-2xl font-semibold text-white">{value}</p>
            {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading && staff.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Staff Management
            </h1>
            <p className="text-neutral-400 mt-1">
              Manage your staff members, track performance, and handle
              scheduling
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(fetchStaff())}
              className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={openCreateForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Staff
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Staff"
          value={stats.totalStaff || 0}
          icon={Users}
          color="blue"
          subtitle="All employees"
        />
        <StatCard
          title="Active Staff"
          value={stats.activeStaff || 0}
          icon={UserCheck}
          color="green"
          subtitle="Currently working"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments || 0}
          icon={Award}
          color="purple"
          subtitle="Active departments"
        />
        <StatCard
          title="Avg Performance"
          value={stats.averagePerformance || 0}
          icon={TrendingUp}
          color="yellow"
          subtitle="Overall rating"
        />
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 rounded-lg shadow-lg p-6 mb-6 border border-neutral-700">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <DepartmentManager
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentFilter}
            onDepartmentAdd={addDepartment}
            canAddDepartments={canManageDepartments()}
            placeholder="All Departments"
            className="flex-1"
          />

          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-neutral-800 divide-y divide-neutral-700">
              {filteredStaff.map((staffMember) => {
                const StatusIcon = getStatusIcon(staffMember.isActive);
                return (
                  <tr key={staffMember.id} className="hover:bg-neutral-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {staffMember.firstName} {staffMember.lastName}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {staffMember.employeeId &&
                            `ID: ${staffMember.employeeId}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDepartmentColor(
                          staffMember.department
                        )}`}
                      >
                        {formatDepartment(staffMember.department)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {staffMember.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {staffMember.payFrequency === "hourly"
                        ? `${formatCurrency(staffMember.hourlyRate)}/hr`
                        : `${formatCurrency(staffMember.salary)}/yr`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Award
                              key={i}
                              className={`w-4 h-4 ${
                                i < (staffMember.performanceRating || 0)
                                  ? "text-yellow-400"
                                  : "text-neutral-400"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-neutral-400">
                          {staffMember.performanceRating || 0}/5
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-2 ${getStatusColor(
                          staffMember.isActive
                        )}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm">
                          {staffMember.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(staffMember)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(staffMember)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            dispatch(setPerformanceModal(staffMember))
                          }
                          className="text-green-400 hover:text-green-300"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleStatusUpdate(
                              staffMember.id,
                              !staffMember.isActive
                            )
                          }
                          className={`${
                            staffMember.isActive
                              ? "text-red-400 hover:text-red-300"
                              : "text-green-400 hover:text-green-300"
                          }`}
                        >
                          {staffMember.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(staffMember.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              No staff members
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Get started by adding a new staff member.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateForm}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 sm:p-6 z-50 overflow-y-auto">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-5xl w-full my-4 sm:my-8 border border-neutral-700 min-h-fit max-h-[90vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 p-6 rounded-t-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h2>
                <button
                  onClick={() => dispatch(setShowForm(false))}
                  className="text-neutral-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      readOnly
                      className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded-lg text-neutral-300 cursor-not-allowed"
                      title="Employee ID is auto-generated by the system"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Auto-generated by the system
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formErrors.lastName && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Position *
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formErrors.position && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.position}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Department *
                    </label>
                    <DepartmentManager
                      departments={departments}
                      selectedDepartment={formData.departmentId}
                      onDepartmentChange={(value) =>
                        handleInputChange({
                          target: { name: "departmentId", value },
                        })
                      }
                      onDepartmentAdd={addDepartment}
                      canAddDepartments={canManageDepartments()}
                      placeholder="Select Department"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Hire Date *
                    </label>
                    <input
                      type="date"
                      name="hireDate"
                      value={formData.hireDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formErrors.hireDate && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.hireDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Termination Date
                    </label>
                    <input
                      type="date"
                      name="terminationDate"
                      value={formData.terminationDate || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-neutral-400 mt-1">
                      Leave empty if employee is still active
                    </p>
                    {formErrors.terminationDate && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.terminationDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Pay Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Pay Frequency *
                    </label>
                    <select
                      name="payFrequency"
                      value={formData.payFrequency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {getPayFrequencyOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.payFrequency === "hourly" && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Hourly Rate *
                      </label>
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {formErrors.hourlyRate && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors.hourlyRate}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.payFrequency === "salary" && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Annual Salary *
                      </label>
                      <input
                        type="number"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {formErrors.salary && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors.salary}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact?.name || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emergencyContact",
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {formErrors.emergencyContactName && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors.emergencyContactName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.emergencyContact?.phone || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emergencyContact",
                            "phone",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                      {formErrors.emergencyContactPhone && (
                        <p className="text-red-400 text-xs mt-1">
                          {formErrors.emergencyContactPhone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Relationship
                      </label>
                      <select
                        value={formData.emergencyContact?.relationship || ""}
                        onChange={(e) =>
                          handleNestedInputChange(
                            "emergencyContact",
                            "relationship",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select relationship</option>
                        {getRelationshipOptions().map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills and Certifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Skills
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getSkillOptions().map((skill) => (
                        <label key={skill.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              formData.skills?.includes(skill.value) || false
                            }
                            onChange={(e) => {
                              const currentSkills = formData.skills || [];
                              const newSkills = e.target.checked
                                ? [...currentSkills, skill.value]
                                : currentSkills.filter(
                                    (s) => s !== skill.value
                                  );
                              handleArrayChange("skills", newSkills);
                            }}
                            className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-neutral-300">
                            {skill.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Certifications
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getCertificationOptions().map((cert) => (
                        <label key={cert.value} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              formData.certifications?.includes(cert.value) ||
                              false
                            }
                            onChange={(e) => {
                              const currentCerts =
                                formData.certifications || [];
                              const newCerts = e.target.checked
                                ? [...currentCerts, cert.value]
                                : currentCerts.filter((c) => c !== cert.value);
                              handleArrayChange("certifications", newCerts);
                            }}
                            className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-neutral-300">
                            {cert.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-neutral-300">
                      Active Employee
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => dispatch(setShowForm(false))}
                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingStaff ? "Update Staff" : "Create Staff"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Performance Update Modal */}
      {performanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full border border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Update Performance - {performanceModal.firstName}{" "}
                  {performanceModal.lastName}
                </h3>
                <button
                  onClick={() => dispatch(setPerformanceModal(null))}
                  className="text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handlePerformanceUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Performance Rating (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => dispatch(setPerformanceData({ rating }))}
                        className={`p-2 rounded ${
                          performanceData.rating >= rating
                            ? "bg-yellow-600 text-white"
                            : "bg-neutral-700 text-neutral-400 hover:bg-neutral-600"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Comments
                  </label>
                  <textarea
                    value={performanceData.comments}
                    onChange={(e) =>
                      dispatch(setPerformanceData({ comments: e.target.value }))
                    }
                    rows="3"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => dispatch(setPerformanceModal(null))}
                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Performance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Staff Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full border border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {viewingStaff.firstName} {viewingStaff.lastName}
                </h3>
                <button
                  onClick={() => dispatch(setViewingStaff(null))}
                  className="text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Employee ID:</span>
                      <span className="text-white">
                        {viewingStaff.employeeId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Name:</span>
                      <span className="text-white">
                        {viewingStaff.firstName} {viewingStaff.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Position:</span>
                      <span className="text-white">
                        {viewingStaff.position}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Department:</span>
                      <span className="text-white">
                        {formatDepartment(viewingStaff.department)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Hire Date:</span>
                      <span className="text-white">
                        {viewingStaff.hireDate
                          ? new Date(viewingStaff.hireDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Pay Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Pay Frequency:</span>
                      <span className="text-white capitalize">
                        {viewingStaff.payFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Rate:</span>
                      <span className="text-white">
                        {viewingStaff.payFrequency === "hourly"
                          ? `${formatCurrency(viewingStaff.hourlyRate)}/hour`
                          : `${formatCurrency(viewingStaff.salary)}/year`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Performance:</span>
                      <span className="text-white">
                        {viewingStaff.performanceRating || 0}/5
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Status:</span>
                      <span
                        className={`${getStatusColor(viewingStaff.isActive)}`}
                      >
                        {viewingStaff.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingStaff.emergencyContact && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Name:</span>
                      <span className="text-white ml-2">
                        {viewingStaff.emergencyContact.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Phone:</span>
                      <span className="text-white ml-2">
                        {viewingStaff.emergencyContact.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Relationship:</span>
                      <span className="text-white ml-2 capitalize">
                        {viewingStaff.emergencyContact.relationship}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewingStaff.skills && viewingStaff.skills.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingStaff.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-blue-100 bg-opacity-20 text-blue-300 rounded-full text-xs"
                      >
                        {getSkillOptions().find((s) => s.value === skill)
                          ?.label || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingStaff.certifications &&
                viewingStaff.certifications.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-neutral-300 mb-2">
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {viewingStaff.certifications.map((cert) => (
                        <span
                          key={cert}
                          className="px-2 py-1 bg-green-100 bg-opacity-20 text-green-300 rounded-full text-xs"
                        >
                          {getCertificationOptions().find(
                            (c) => c.value === cert
                          )?.label || cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {viewingStaff.notes && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Notes
                  </h4>
                  <p className="text-sm text-white">{viewingStaff.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => dispatch(setViewingStaff(null))}
                  className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    dispatch(setViewingStaff(null));
                    handleEdit(viewingStaff);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Staff;
