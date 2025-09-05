import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  XCircle,
  User,
  MapPin,
  Tag,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchTickets,
  fetchTicketStats,
  createTicket,
  updateTicket,
  deleteTicket,
  updateTicketStatus,
  addTicketComment,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingTicket,
  setViewingTicket,
  setStatusModal,
  setStatusData,
  setCommentModal,
  setCommentData,
  setFilters,
  resetForm,
  clearError,
  selectTickets,
  selectTicketStats,
  selectTicketsLoading,
  selectTicketsStatsLoading,
  selectTicketsError,
  selectTicketsFormData,
  selectTicketsFormErrors,
  selectTicketsShowForm,
  selectTicketsEditingTicket,
  selectTicketsViewingTicket,
  selectTicketsStatusModal,
  selectTicketsStatusData,
  selectTicketsCommentModal,
  selectTicketsCommentData,
  selectTicketsFilters,
} from "../store/slices/ticketSlice";

const SupportTickets = () => {
  const dispatch = useDispatch();
  const tickets = useSelector(selectTickets);
  const stats = useSelector(selectTicketStats);
  const loading = useSelector(selectTicketsLoading);
  const statsLoading = useSelector(selectTicketsStatsLoading);
  const error = useSelector(selectTicketsError);
  const formData = useSelector(selectTicketsFormData);
  const formErrors = useSelector(selectTicketsFormErrors);
  const showForm = useSelector(selectTicketsShowForm);
  const editingTicket = useSelector(selectTicketsEditingTicket);
  const viewingTicket = useSelector(selectTicketsViewingTicket);
  const statusModal = useSelector(selectTicketsStatusModal);
  const statusData = useSelector(selectTicketsStatusData);
  const commentModal = useSelector(selectTicketsCommentModal);
  const commentData = useSelector(selectTicketsCommentData);
  const filters = useSelector(selectTicketsFilters);

  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    dispatch(fetchTickets(filters));
    dispatch(fetchTicketStats());
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      showError("Error", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const openCreateModal = () => {
    dispatch(resetForm());
    dispatch(setShowForm(true));
  };

  const openEditModal = (ticket) => {
    dispatch(
      setFormData({
        title: ticket.title || "",
        description: ticket.description || "",
        category: ticket.category || "other",
        priority: ticket.priority || "medium",
        status: ticket.status || "open",
        location: ticket.location || "",
        estimatedResolutionTime: ticket.estimatedResolutionTime || 0,
        tags: ticket.tags || [],
        resolutionNotes: ticket.resolutionNotes || "",
      })
    );
    dispatch(setEditingTicket(ticket));
    dispatch(setShowForm(true));
  };

  const openViewModal = (ticket) => {
    dispatch(setViewingTicket(ticket));
  };

  const openStatusModal = (ticket) => {
    dispatch(setStatusModal(ticket));
    dispatch(
      setStatusData({
        status: ticket.status,
        resolutionNotes: ticket.resolutionNotes || "",
      })
    );
  };

  const openCommentModal = (ticket) => {
    dispatch(setCommentModal(ticket));
    dispatch(setCommentData({ comment: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(setFormErrors({}));

      if (editingTicket) {
        await dispatch(
          updateTicket({ id: editingTicket.id, data: formData })
        ).unwrap();
        showSuccess("Ticket updated successfully");
      } else {
        await dispatch(createTicket(formData)).unwrap();
        showSuccess("Ticket created successfully");
      }

      dispatch(setShowForm(false));
      dispatch(resetForm());
      dispatch(fetchTickets(filters));
      dispatch(fetchTicketStats());
    } catch (error) {
      console.error("Failed to save ticket:", error);
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        dispatch(setFormErrors(errors));
      } else {
        showError(
          "Failed to save ticket",
          error?.response?.data?.message || ""
        );
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;

    try {
      await dispatch(deleteTicket(id)).unwrap();
      showSuccess("Ticket deleted successfully");
      dispatch(fetchTickets(filters));
      dispatch(fetchTicketStats());
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      showError(
        "Failed to delete ticket",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateTicketStatus({ id: statusModal.id, statusData })
      ).unwrap();
      showSuccess("Ticket status updated successfully");
      dispatch(setStatusModal(null));
      dispatch(fetchTickets(filters));
      dispatch(fetchTicketStats());
    } catch (error) {
      console.error("Failed to update ticket status:", error);
      showError(
        "Failed to update ticket status",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        addTicketComment({ id: commentModal.id, commentData })
      ).unwrap();
      showSuccess("Comment added successfully");
      dispatch(setCommentModal(null));
      dispatch(fetchTickets(filters));
    } catch (error) {
      console.error("Failed to add comment:", error);
      showError("Failed to add comment", error?.response?.data?.message || "");
    }
  };

  const handleSearch = () => {
    dispatch(fetchTickets(filters));
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-500 bg-green-900/20",
      medium: "text-blue-500 bg-blue-900/20",
      high: "text-orange-500 bg-orange-900/20",
      critical: "text-red-500 bg-red-900/20",
    };
    return colors[priority] || "text-neutral-500 bg-neutral-900/20";
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "text-red-500 bg-red-900/20",
      in_progress: "text-orange-500 bg-orange-900/20",
      waiting: "text-blue-500 bg-blue-900/20",
      resolved: "text-green-500 bg-green-900/20",
      closed: "text-gray-500 bg-gray-900/20",
    };
    return colors[status] || "text-neutral-500 bg-neutral-900/20";
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: XCircle,
      in_progress: Clock,
      waiting: Clock,
      resolved: CheckCircle,
      closed: CheckCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-3 w-3" />;
  };

  const formatCategory = (category) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatPriority = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatStatus = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffTime = now - created;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading tickets...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Support Tickets</h1>
          <p className="text-neutral-400 mt-1">
            Manage customer support tickets and issues
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Tickets</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalTickets || 0}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Open Tickets</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.openTickets || 0}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Resolved</p>
              <p className="text-2xl font-bold text-green-500">
                {stats.resolvedTickets || 0}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats.overdueTickets || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Avg Resolution</p>
              <p className="text-2xl font-bold text-purple-500">
                {Math.round(stats.avgResolutionTime || 0)}m
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
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
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) =>
                  dispatch(setFilters({ search: e.target.value }))
                }
                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg w-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.category}
            onChange={(e) => dispatch(setFilters({ category: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="guest_complaint">Guest Complaint</option>
            <option value="equipment_failure">Equipment Failure</option>
            <option value="safety_security">Safety & Security</option>
            <option value="facility">Facility</option>
            <option value="it">IT</option>
            <option value="hr">HR</option>
            <option value="supplier">Supplier</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => dispatch(setFilters({ priority: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="waiting">Waiting</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className="border-t border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-sm text-neutral-400 truncate max-w-xs">
                        {ticket.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-neutral-300">
                      {formatCategory(ticket.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {formatPriority(ticket.priority)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      {formatStatus(ticket.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {ticket.location || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {getTimeAgo(ticket.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(ticket)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openEditModal(ticket)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Edit Ticket"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openStatusModal(ticket)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Update Status"
                      >
                        <CheckCircle className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openCommentModal(ticket)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Add Comment"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </button>
                      {ticket.status === "closed" && (
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                          title="Delete Ticket"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
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
                {editingTicket ? "Edit Ticket" : "Create Ticket"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      dispatch(setFormData({ title: e.target.value }))
                    }
                    className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.title ? "border-red-500" : "border-neutral-600"
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
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      dispatch(setFormData({ description: e.target.value }))
                    }
                    className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.description
                        ? "border-red-500"
                        : "border-neutral-600"
                    }`}
                    rows="4"
                    required
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        dispatch(setFormData({ category: e.target.value }))
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.category
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="guest_complaint">Guest Complaint</option>
                      <option value="equipment_failure">
                        Equipment Failure
                      </option>
                      <option value="safety_security">Safety & Security</option>
                      <option value="facility">Facility</option>
                      <option value="it">IT</option>
                      <option value="hr">HR</option>
                      <option value="supplier">Supplier</option>
                      <option value="other">Other</option>
                    </select>
                    {formErrors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.category}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Priority *
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) =>
                        dispatch(setFormData({ priority: e.target.value }))
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.priority
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    {formErrors.priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.priority}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        dispatch(setFormData({ location: e.target.value }))
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Est. Resolution (minutes)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedResolutionTime}
                      onChange={(e) =>
                        dispatch(
                          setFormData({
                            estimatedResolutionTime:
                              parseInt(e.target.value) || 0,
                          })
                        )
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingTicket ? "Update Ticket" : "Create Ticket"}
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
              Update Status - {statusModal.ticketNumber}
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
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting">Waiting</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Resolution Notes
                  </label>
                  <textarea
                    value={statusData.resolutionNotes}
                    onChange={(e) =>
                      dispatch(
                        setStatusData({
                          resolutionNotes: e.target.value,
                        })
                      )
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Status
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

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Add Comment - {commentModal.ticketNumber}
            </h2>
            <form onSubmit={handleAddComment}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Comment *
                  </label>
                  <textarea
                    value={commentData.comment}
                    onChange={(e) =>
                      dispatch(
                        setCommentData({
                          comment: e.target.value,
                        })
                      )
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Comment
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(setCommentModal(null))}
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
      {viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              Ticket Details - {viewingTicket.ticketNumber}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400">Title:</span>
                <p className="text-white mt-1">{viewingTicket.title}</p>
              </div>
              <div>
                <span className="text-neutral-400">Description:</span>
                <p className="text-white mt-1">{viewingTicket.description}</p>
              </div>
              <div>
                <span className="text-neutral-400">Category:</span>
                <span className="text-white ml-2">
                  {formatCategory(viewingTicket.category)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Priority:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                    viewingTicket.priority
                  )}`}
                >
                  {formatPriority(viewingTicket.priority)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    viewingTicket.status
                  )}`}
                >
                  {formatStatus(viewingTicket.status)}
                </span>
              </div>
              {viewingTicket.location && (
                <div>
                  <span className="text-neutral-400">Location:</span>
                  <span className="text-white ml-2">
                    {viewingTicket.location}
                  </span>
                </div>
              )}
              <div>
                <span className="text-neutral-400">Created:</span>
                <span className="text-white ml-2">
                  {new Date(viewingTicket.createdAt).toLocaleString()}
                </span>
              </div>
              {viewingTicket.resolutionNotes && (
                <div>
                  <span className="text-neutral-400">Resolution Notes:</span>
                  <p className="text-white mt-1">
                    {viewingTicket.resolutionNotes}
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => dispatch(setViewingTicket(null))}
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

export default SupportTickets;
