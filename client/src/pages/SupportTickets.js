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
  fetchTicketById,
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
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // console.log("Fetching tickets with filters:", filters);
    // console.log("Current user:", user);
    dispatch(fetchTickets(filters));
    dispatch(fetchTicketStats());
  }, [dispatch, filters, user]);

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
    dispatch(fetchTicketById(ticket.id));
  };

  const openStatusModal = (ticket) => {
    if (ticket.status === "closed") return; // Prevent status updates on closed tickets
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
      const errData = error?.response?.data;
      if (errData?.details && Array.isArray(errData.details)) {
        const errors = {};
        errData.details.forEach((detail) => {
          if (detail?.field && detail?.message) {
            errors[detail.field] = detail.message;
          }
        });
        dispatch(setFormErrors(errors));
        const firstMsg =
          errData.details[0]?.message || errData.message || "Validation Error";
        showError("Validation Error", firstMsg);
      } else {
        showError("Failed to save ticket", errData?.message || "");
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
      // Refresh viewing ticket details so timeline updates immediately
      if (statusModal?.id) {
        dispatch(fetchTicketById(statusModal.id));
      }
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
      // Refresh viewing ticket details to show the new comment in the timeline
      if (commentModal?.id) {
        dispatch(fetchTicketById(commentModal.id));
      }
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
    if (!category) return "Other";
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatPriority = (priority) => {
    if (!priority) return "Medium";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const formatStatus = (status) => {
    if (!status) return "Open";
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

  // Timeline styles per action
  const getTimelineStyle = (action) => {
    const styles = {
      created: {
        dot: "bg-green-500",
        label: "text-green-400",
        pill: "bg-green-900/30 text-green-300",
      },
      status_changed: {
        dot: "bg-amber-500",
        label: "text-amber-400",
        pill: "bg-amber-900/30 text-amber-300",
      },
      commented: {
        dot: "bg-purple-500",
        label: "text-purple-400",
        pill: "bg-purple-900/30 text-purple-300",
      },
      assigned: {
        dot: "bg-cyan-500",
        label: "text-cyan-400",
        pill: "bg-cyan-900/30 text-cyan-300",
      },
      escalated: {
        dot: "bg-red-500",
        label: "text-red-400",
        pill: "bg-red-900/30 text-red-300",
      },
      priority_changed: {
        dot: "bg-pink-500",
        label: "text-pink-400",
        pill: "bg-pink-900/30 text-pink-300",
      },
      category_changed: {
        dot: "bg-blue-500",
        label: "text-blue-400",
        pill: "bg-blue-900/30 text-blue-300",
      },
      resolved: {
        dot: "bg-emerald-500",
        label: "text-emerald-400",
        pill: "bg-emerald-900/30 text-emerald-300",
      },
      closed: {
        dot: "bg-gray-400",
        label: "text-gray-300",
        pill: "bg-gray-800/60 text-gray-200",
      },
      reopened: {
        dot: "bg-indigo-500",
        label: "text-indigo-400",
        pill: "bg-indigo-900/30 text-indigo-300",
      },
    };
    return (
      styles[action] || {
        dot: "bg-neutral-500",
        label: "text-neutral-300",
        pill: "bg-neutral-800/60 text-neutral-300",
      }
    );
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
              {/* {console.log("Tickets in render:", tickets)} */}
              {tickets
                .filter((ticket) => ticket && ticket.id)
                .map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="border-t border-neutral-700 hover:bg-neutral-750"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-white">
                          {ticket.ticketNumber || "N/A"}
                        </div>
                        <div className="text-sm text-neutral-400 truncate max-w-xs">
                          {ticket.title || "No title"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-neutral-300">
                        {formatCategory(ticket.category || "other")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.priority || "medium"
                        )}`}
                      >
                        {formatPriority(ticket.priority || "medium")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(
                          ticket.status || "open"
                        )}`}
                      >
                        {getStatusIcon(ticket.status || "open")}
                        {formatStatus(ticket.status || "open")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">
                      {ticket.location || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-white">
                        {ticket.createdAt
                          ? getTimeAgo(ticket.createdAt)
                          : "N/A"}
                      </div>
                      {ticket.creator && (
                        <div className="text-xs text-neutral-400">
                          by {ticket.creator.firstName}{" "}
                          {ticket.creator.lastName}
                        </div>
                      )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
          <div
            className="bg-neutral-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
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
                    onChange={(e) => {
                      dispatch(setFormData({ title: e.target.value }));
                      if (formErrors.title)
                        dispatch(
                          setFormErrors({ ...formErrors, title: undefined })
                        );
                    }}
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
                    onChange={(e) => {
                      dispatch(setFormData({ description: e.target.value }));
                      if (formErrors.description)
                        dispatch(
                          setFormErrors({
                            ...formErrors,
                            description: undefined,
                          })
                        );
                    }}
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
                      onChange={(e) => {
                        dispatch(setFormData({ category: e.target.value }));
                        if (formErrors.category)
                          dispatch(
                            setFormErrors({
                              ...formErrors,
                              category: undefined,
                            })
                          );
                      }}
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
                      onChange={(e) => {
                        dispatch(setFormData({ priority: e.target.value }));
                        if (formErrors.priority)
                          dispatch(
                            setFormErrors({
                              ...formErrors,
                              priority: undefined,
                            })
                          );
                      }}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
          <div
            className="bg-neutral-800 p-6 rounded-lg w-96 shadow-2xl border border-neutral-700"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
          <div
            className="bg-neutral-800 p-6 rounded-lg w-96 shadow-2xl border border-neutral-700"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-[9999] p-4 pt-20 overflow-y-auto">
          <div
            className="bg-neutral-800 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-700"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(255, 255, 255, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
            }}
          >
            <h2 className="text-xl font-bold text-white mb-6">
              Ticket Details - {viewingTicket.ticketNumber}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Ticket Information */}
              <div className="space-y-4">
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Ticket Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-neutral-400">Title:</span>
                      <p className="text-white mt-1">{viewingTicket.title}</p>
                    </div>
                    <div>
                      <span className="text-neutral-400">Description:</span>
                      <p className="text-white mt-1">
                        {viewingTicket.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                      <div>
                        <span className="text-neutral-400">Location:</span>
                        <span className="text-white ml-2">
                          {viewingTicket.location || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* People Involved */}
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    People Involved
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-neutral-400">Created by:</span>
                      <div className="text-white mt-1">
                        {viewingTicket.creator ? (
                          <div>
                            <div className="font-medium">
                              {viewingTicket.creator.firstName}{" "}
                              {viewingTicket.creator.lastName}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {viewingTicket.creator.email} •{" "}
                              {viewingTicket.creator.role}
                            </div>
                          </div>
                        ) : (
                          "Unknown"
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Assigned to:</span>
                      <div className="text-white mt-1">
                        {viewingTicket.assignee ? (
                          <div>
                            <div className="font-medium">
                              {viewingTicket.assignee.firstName}{" "}
                              {viewingTicket.assignee.lastName}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {viewingTicket.assignee.email} •{" "}
                              {viewingTicket.assignee.role}
                            </div>
                          </div>
                        ) : (
                          "Unassigned"
                        )}
                      </div>
                    </div>
                    {viewingTicket.escalatedToUser && (
                      <div>
                        <span className="text-neutral-400">Escalated to:</span>
                        <div className="text-white mt-1">
                          <div className="font-medium">
                            {viewingTicket.escalatedToUser.firstName}{" "}
                            {viewingTicket.escalatedToUser.lastName}
                          </div>
                          <div className="text-sm text-neutral-400">
                            {viewingTicket.escalatedToUser.email} •{" "}
                            {viewingTicket.escalatedToUser.role}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SLA Information */}
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    SLA Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">SLA Target:</span>
                      <span className="text-white">
                        {viewingTicket.slaTarget || 0} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">
                        Actual Resolution:
                      </span>
                      <span className="text-white">
                        {viewingTicket.actualResolutionTime || 0} minutes
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">SLA Breached:</span>
                      <span
                        className={`font-medium ${
                          viewingTicket.slaBreached
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {viewingTicket.slaBreached ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Timeline */}
              <div className="bg-neutral-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Incident Timeline
                </h3>
                <div className="space-y-4">
                  {viewingTicket.history && viewingTicket.history.length > 0 ? (
                    <div className="space-y-3">
                      {viewingTicket.history.map((entry, index) => (
                        <div key={entry.id} className="flex gap-3">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full mt-2 ${
                                getTimelineStyle(entry.action).dot
                              }`}
                            ></div>
                            {index < viewingTicket.history.length - 1 && (
                              <div className="w-px h-8 bg-neutral-600 ml-1.5"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`font-medium ${
                                getTimelineStyle(entry.action).label
                              }`}
                            >
                              {entry.action
                                .replace("_", " ")
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div className="text-sm text-neutral-400">
                              {entry.performedByUser
                                ? `${entry.performedByUser.firstName} ${entry.performedByUser.lastName}`
                                : "System"}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {new Date(entry.createdAt).toLocaleString()}
                            </div>
                            {entry.comment && (
                              <div className="text-sm text-neutral-300 mt-1">
                                {entry.comment}
                              </div>
                            )}
                            {entry.oldValue && entry.newValue && (
                              <div
                                className={`text-xs inline-flex items-center gap-2 px-2 py-1 rounded ${
                                  getTimelineStyle(entry.action).pill
                                } mt-2`}
                              >
                                <span>From: {entry.oldValue}</span>
                                <span>→</span>
                                <span>To: {entry.newValue}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-neutral-400 text-center py-4">
                      No timeline data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {viewingTicket.resolutionNotes && (
              <div className="mt-6 bg-neutral-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Resolution Notes
                </h3>
                <p className="text-white">{viewingTicket.resolutionNotes}</p>
              </div>
            )}

            <div className="flex mt-6">
              <div className="ml-auto">
                <button
                  onClick={() => dispatch(setViewingTicket(null))}
                  className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
