import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Users,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  Tag,
  Star,
  Music,
  Gift,
  Building,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchEvents,
  fetchEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  updateEventAttendance,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingEvent,
  setViewingEvent,
  setStatusModal,
  setStatusData,
  setAttendanceModal,
  setAttendanceData,
  setFilters,
  resetForm,
  clearError,
  selectEvents,
  selectFilteredEvents,
  selectEventStats,
  selectEventsLoading,
  selectEventsStatsLoading,
  selectEventsError,
  selectEventsFormData,
  selectEventsFormErrors,
  selectShowEventsForm,
  selectEditingEvent,
  selectViewingEvent,
  selectStatusModal,
  selectStatusData,
  selectAttendanceModal,
  selectAttendanceData,
  selectEventsFilters,
} from "../store/slices/eventsSlice";

const EventManagement = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  const events = useSelector(selectEvents);
  const filteredEvents = useSelector(selectFilteredEvents);
  const stats = useSelector(selectEventStats);
  const loading = useSelector(selectEventsLoading);
  const statsLoading = useSelector(selectEventsStatsLoading);
  const error = useSelector(selectEventsError);
  const formData = useSelector(selectEventsFormData);
  const formErrors = useSelector(selectEventsFormErrors);
  const showForm = useSelector(selectShowEventsForm);
  const editingEvent = useSelector(selectEditingEvent);
  const viewingEvent = useSelector(selectViewingEvent);
  const statusModal = useSelector(selectStatusModal);
  const statusData = useSelector(selectStatusData);
  const attendanceModal = useSelector(selectAttendanceModal);
  const attendanceData = useSelector(selectAttendanceData);
  const filters = useSelector(selectEventsFilters);

  useEffect(() => {
    dispatch(fetchEvents());
    dispatch(fetchEventStats());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError("Operation failed", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.eventType) params.append("eventType", filters.eventType);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);

    dispatch(fetchEvents(params.toString()));
  };

  const openCreateModal = () => {
    dispatch(resetForm());
    dispatch(setShowForm(true));
  };

  const openEditModal = (event) => {
    dispatch(setEditingEvent(event));
    dispatch(setShowForm(true));
  };

  const openViewModal = (event) => {
    dispatch(setViewingEvent(event));
  };

  const openStatusModal = (event) => {
    dispatch(setStatusModal(event));
  };

  const openAttendanceModal = (event) => {
    dispatch(setAttendanceModal(event));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      setFormData({
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? name.includes("Price") ||
              name.includes("Cost") ||
              name.includes("budget") ||
              name.includes("revenue")
              ? parseFloat(value) || 0
              : parseInt(value) || 0
            : value,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        const result = await dispatch(
          updateEvent({
            id: editingEvent.id,
            eventData: formData,
          })
        ).unwrap();
        showSuccess("Event updated successfully");
      } else {
        const result = await dispatch(createEvent(formData)).unwrap();
        showSuccess("Event created successfully");
      }
      dispatch(fetchEvents());
      dispatch(fetchEventStats());
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await dispatch(deleteEvent(id)).unwrap();
      showSuccess("Event deleted successfully");
      dispatch(fetchEvents());
      dispatch(fetchEventStats());
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateEventStatus({
          id: statusModal.id,
          statusData,
        })
      ).unwrap();
      showSuccess("Event status updated successfully");
      dispatch(fetchEvents());
      dispatch(fetchEventStats());
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleAttendanceUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateEventAttendance({
          id: attendanceModal.id,
          attendanceData,
        })
      ).unwrap();
      showSuccess("Event attendance updated successfully");
      dispatch(fetchEvents());
      dispatch(fetchEventStats());
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      birthday: Gift,
      anniversary: Star,
      corporate: Building,
      live_band: Music,
      dj_night: Music,
      special_dinner: Star,
      wine_tasting: Star,
      other: Calendar,
    };
    const Icon = icons[type] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "text-gray-500 bg-gray-900/20",
      published: "text-blue-500 bg-blue-900/20",
      active: "text-green-500 bg-green-900/20",
      completed: "text-emerald-500 bg-emerald-900/20",
      cancelled: "text-red-500 bg-red-900/20",
    };
    return colors[status] || "text-neutral-500 bg-neutral-900/20";
  };

  const getStatusIcon = (status) => {
    const icons = {
      draft: Clock,
      published: CheckCircle,
      active: CheckCircle,
      completed: CheckCircle,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-3 w-3" />;
  };

  const formatType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading events...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Event Management</h1>
          <p className="text-neutral-400 mt-1">
            Manage events, bookings, and special occasions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalEvents || 0}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Upcoming</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.upcomingEvents || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Completed</p>
              <p className="text-2xl font-bold text-emerald-500">
                {stats.completedEvents || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-500">
                {formatCurrency(stats.totalRevenue || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Attendance</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats.totalAttendance || 0}
              </p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
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
                placeholder="Search events..."
                value={filters.search}
                onChange={(e) =>
                  dispatch(setFilters({ search: e.target.value }))
                }
                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg w-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.eventType}
            onChange={(e) =>
              dispatch(setFilters({ eventType: e.target.value }))
            }
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="corporate">Corporate</option>
            <option value="live_band">Live Band</option>
            <option value="dj_night">DJ Night</option>
            <option value="special_dinner">Special Dinner</option>
            <option value="wine_tasting">Wine Tasting</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => dispatch(setFilters({ dateFrom: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Date & Time
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Attendance
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Revenue
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
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="border-t border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {event.title}
                      </div>
                      <div className="text-sm text-neutral-400 truncate max-w-xs">
                        {event.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(event.eventType)}
                      <span className="text-white">
                        {formatType(event.eventType)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-neutral-400">
                      {event.startTime} - {event.endTime}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {event.actualAttendance || 0} / {event.capacity || "N/A"}
                    </div>
                    {event.expectedAttendance && (
                      <div className="text-sm text-neutral-400">
                        Expected: {event.expectedAttendance}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {formatCurrency(event.revenue || 0)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {getStatusIcon(event.status)}
                      {formatStatus(event.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(event)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openEditModal(event)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Edit Event"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openStatusModal(event)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Update Status"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openAttendanceModal(event)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Update Attendance"
                      >
                        <Users className="h-3 w-3" />
                      </button>
                      {["draft", "cancelled"].includes(event.status) && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEvents.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.title
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Event Type *
                    </label>
                    <select
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.eventType
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="birthday">Birthday</option>
                      <option value="anniversary">Anniversary</option>
                      <option value="corporate">Corporate</option>
                      <option value="live_band">Live Band</option>
                      <option value="dj_night">DJ Night</option>
                      <option value="special_dinner">Special Dinner</option>
                      <option value="wine_tasting">Wine Tasting</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.eventType && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.eventType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.startDate
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.startDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.endDate
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.endDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.endDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.startTime
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.startTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.startTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.endTime
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.endTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.endTime}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Expected Attendance
                    </label>
                    <input
                      type="number"
                      name="expectedAttendance"
                      value={formData.expectedAttendance}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Budget (UGX)
                    </label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Marketing Plan
                  </label>
                  <textarea
                    name="marketingPlan"
                    value={formData.marketingPlan}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isTicketed"
                    name="isTicketed"
                    checked={formData.isTicketed}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="isTicketed" className="text-neutral-300">
                    Ticketed Event
                  </label>
                </div>

                {formData.isTicketed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Ticket Price (UGX)
                      </label>
                      <input
                        type="number"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="1000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-1">
                        Ticket Quantity
                      </label>
                      <input
                        type="number"
                        name="ticketQuantity"
                        value={formData.ticketQuantity}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                  </button>
                  <button
                    type="button"
                    onClick={() => dispatch(setShowForm(false))}
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

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Update Status - {statusModal.title}
            </h2>
            <form onSubmit={handleStatusUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={statusData.status}
                    onChange={(e) =>
                      dispatch(setStatusData({ status: e.target.value }))
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Status"}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setStatusModal(null))}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendance Update Modal */}
      {attendanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Update Attendance - {attendanceModal.title}
            </h2>
            <form onSubmit={handleAttendanceUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Actual Attendance *
                  </label>
                  <input
                    type="number"
                    value={attendanceData.actualAttendance}
                    onChange={(e) =>
                      dispatch(
                        setAttendanceData({
                          actualAttendance: parseInt(e.target.value) || 0,
                        })
                      )
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Attendance"}
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setAttendanceModal(null))}
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
      {viewingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              Event Details - {viewingEvent.title}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400">Type:</span>
                <span className="text-white ml-2">
                  {formatType(viewingEvent.eventType)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Date:</span>
                <span className="text-white ml-2">
                  {new Date(viewingEvent.startDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Time:</span>
                <span className="text-white ml-2">
                  {viewingEvent.startTime} - {viewingEvent.endTime}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Capacity:</span>
                <span className="text-white ml-2">
                  {viewingEvent.capacity || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Attendance:</span>
                <span className="text-white ml-2">
                  {viewingEvent.actualAttendance || 0} /{" "}
                  {viewingEvent.expectedAttendance || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Revenue:</span>
                <span className="text-white ml-2">
                  {formatCurrency(viewingEvent.revenue || 0)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    viewingEvent.status
                  )}`}
                >
                  {formatStatus(viewingEvent.status)}
                </span>
              </div>
              {viewingEvent.description && (
                <div>
                  <span className="text-neutral-400">Description:</span>
                  <p className="text-white mt-1">{viewingEvent.description}</p>
                </div>
              )}
              {viewingEvent.marketingPlan && (
                <div>
                  <span className="text-neutral-400">Marketing Plan:</span>
                  <p className="text-white mt-1">
                    {viewingEvent.marketingPlan}
                  </p>
                </div>
              )}
              {viewingEvent.notes && (
                <div>
                  <span className="text-neutral-400">Notes:</span>
                  <p className="text-white mt-1">{viewingEvent.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => dispatch(setViewingEvent(null))}
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

export default EventManagement;
