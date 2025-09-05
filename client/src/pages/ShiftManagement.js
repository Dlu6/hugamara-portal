import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Clock,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Calendar,
  Filter,
  Award,
  UserCheck,
  UserX,
  RefreshCw,
  Download,
  Upload,
  Play,
  Square,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchShifts,
  createShift,
  updateShift,
  deleteShift,
  fetchShiftStats,
  updateShiftStatus,
  clockIn,
  clockOut,
  fetchTodaysShifts,
  fetchUpcomingShifts,
  approveShift,
  setFilters,
  setFormData,
  setShowForm,
  setEditingShift,
  setViewingShift,
  setStatusModal,
  setStatusData,
  setClockModal,
  setClockData,
  clearError,
  resetForm,
} from "../store/slices/shiftSlice";
import {
  selectShifts,
  selectFilteredShifts,
  selectShiftStats,
  selectShiftsLoading,
  selectShiftsError,
  selectShiftsFilters,
  selectShiftsFormData,
  selectShiftsFormErrors,
  selectShowShiftsForm,
  selectEditingShift,
  selectViewingShift,
  selectStatusModal,
  selectStatusData,
  selectClockModal,
  selectClockData,
  selectTodaysShifts,
  selectUpcomingShifts,
} from "../store/slices/shiftSlice";

const ShiftManagement = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  // Redux state
  const shifts = useSelector(selectShifts);
  const filteredShifts = useSelector(selectFilteredShifts);
  const stats = useSelector(selectShiftStats);
  const loading = useSelector(selectShiftsLoading);
  const error = useSelector(selectShiftsError);
  const filters = useSelector(selectShiftsFilters);
  const formData = useSelector(selectShiftsFormData);
  const formErrors = useSelector(selectShiftsFormErrors);
  const showForm = useSelector(selectShowShiftsForm);
  const editingShift = useSelector(selectEditingShift);
  const viewingShift = useSelector(selectViewingShift);
  const statusModal = useSelector(selectStatusModal);
  const statusData = useSelector(selectStatusData);
  const clockModal = useSelector(selectClockModal);
  const clockData = useSelector(selectClockData);
  const todaysShifts = useSelector(selectTodaysShifts);
  const upcomingShifts = useSelector(selectUpcomingShifts);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchShifts());
    dispatch(fetchShiftStats());
    dispatch(fetchTodaysShifts());
    dispatch(fetchUpcomingShifts());
  }, [dispatch]);

  // Handle search and filtering
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    dispatch(setFilters({ status }));
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    dispatch(setFilters({ shiftType: type }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFormData({ [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingShift) {
        await dispatch(
          updateShift({ id: editingShift.id, shiftData: formData })
        );
        showSuccess("Shift updated successfully");
      } else {
        await dispatch(createShift(formData));
        showSuccess("Shift created successfully");
      }
      dispatch(resetForm());
      dispatch(fetchShifts());
    } catch (error) {
      showError(error.message || "Failed to save shift");
    }
  };

  const handleEdit = (shift) => {
    dispatch(setEditingShift(shift));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shift?")) {
      try {
        await dispatch(deleteShift(id));
        showSuccess("Shift deleted successfully");
        dispatch(fetchShifts());
      } catch (error) {
        showError(error.message || "Failed to delete shift");
      }
    }
  };

  const handleView = (shift) => {
    dispatch(setViewingShift(shift));
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateShiftStatus({ id: statusData.id, status: statusData.status })
      );
      showSuccess("Shift status updated successfully");
      dispatch(setStatusModal(false));
      dispatch(setStatusData({}));
      dispatch(fetchShifts());
    } catch (error) {
      showError(error.message || "Failed to update shift status");
    }
  };

  const handleClockIn = async (id) => {
    try {
      await dispatch(clockIn(id));
      showSuccess("Clocked in successfully");
      dispatch(fetchShifts());
    } catch (error) {
      showError(error.message || "Failed to clock in");
    }
  };

  const handleClockOut = async (id) => {
    try {
      await dispatch(clockOut(id));
      showSuccess("Clocked out successfully");
      dispatch(fetchShifts());
    } catch (error) {
      showError(error.message || "Failed to clock out");
    }
  };

  const openCreateForm = () => {
    dispatch(resetForm());
    dispatch(setShowForm(true));
  };

  const closeForm = () => {
    dispatch(resetForm());
  };

  const openStatusModal = (shift) => {
    dispatch(setStatusData({ id: shift.id, status: shift.status }));
    dispatch(setStatusModal(true));
  };

  const closeStatusModal = () => {
    dispatch(setStatusModal(false));
    dispatch(setStatusData({}));
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeColor = (type) => {
    const colors = {
      regular: "bg-blue-100 text-blue-800",
      overtime: "bg-orange-100 text-orange-800",
      holiday: "bg-purple-100 text-purple-800",
      weekend: "bg-green-100 text-green-800",
      night: "bg-indigo-100 text-indigo-800",
      split: "bg-pink-100 text-pink-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shift Management</h1>
          <p className="text-gray-600">Manage staff shifts and time tracking</p>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Shift</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Shifts"
            value={stats.totalShifts || 0}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Completed"
            value={stats.completedShifts || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Pending"
            value={stats.pendingShifts || 0}
            icon={AlertCircle}
            color="yellow"
          />
          <StatCard
            title="Total Hours"
            value={`${stats.totalHours || 0}h`}
            icon={TrendingUp}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => handleTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="overtime">Overtime</option>
            <option value="holiday">Holiday</option>
            <option value="weekend">Weekend</option>
            <option value="night">Night</option>
            <option value="split">Split</option>
          </select>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredShifts.map((shift) => (
                <tr key={shift.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(shift.shiftDate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTime(shift.startTime)} -{" "}
                        {formatTime(shift.endTime)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {shift.position}
                    </div>
                    {shift.section && (
                      <div className="text-sm text-gray-500">
                        {shift.section}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                        shift.shiftType
                      )}`}
                    >
                      {shift.shiftType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        shift.status
                      )}`}
                    >
                      {shift.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shift.totalHours ? `${shift.totalHours}h` : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(shift)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(shift)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {shift.status === "scheduled" && (
                        <button
                          onClick={() => handleClockIn(shift.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      {shift.status === "in_progress" && (
                        <button
                          onClick={() => handleClockOut(shift.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openStatusModal(shift)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingShift ? "Edit Shift" : "Create New Shift"}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Date
                  </label>
                  <input
                    type="date"
                    name="shiftDate"
                    value={formData.shiftDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.shiftDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.shiftDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.position && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.position}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.startTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.startTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formErrors.endTime && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.endTime}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Shift Type
                  </label>
                  <select
                    name="shiftType"
                    value={formData.shiftType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="overtime">Overtime</option>
                    <option value="holiday">Holiday</option>
                    <option value="weekend">Weekend</option>
                    <option value="night">Night</option>
                    <option value="split">Split</option>
                  </select>
                  {formErrors.shiftType && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.shiftType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingShift ? "Update Shift" : "Create Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Update Shift Status</h3>
            <form onSubmit={handleStatusUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={statusData.status}
                  onChange={(e) =>
                    dispatch(
                      setStatusData({ ...statusData, status: e.target.value })
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeStatusModal}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftManagement;
