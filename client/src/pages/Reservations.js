import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Search, Filter, X, ChevronDown } from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchReservations,
  fetchTables,
  fetchGuests,
  createReservation,
  updateReservation,
  deleteReservation,
  updateReservationStatus,
  seatReservation,
  createGuest,
  createOrderFromReservation,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingReservation,
  setViewingReservation,
  setSeatModal,
  setGuestForm,
  setGuestFormErrors,
  setShowGuestForm,
  setFilters,
  resetForm,
  resetGuestForm,
  clearError,
  selectReservations,
  selectFilteredReservations,
  selectTables,
  selectGuests,
  selectReservationsLoading,
  selectTablesLoading,
  selectGuestsLoading,
  selectReservationsError,
  selectReservationsFormData,
  selectReservationsFormErrors,
  selectShowReservationsForm,
  selectEditingReservation,
  selectViewingReservation,
  selectSeatModal,
  selectGuestForm,
  selectGuestFormErrors,
  selectShowGuestForm,
  selectReservationsFilters,
  selectAvailableTables,
} from "../store/slices/reservationsSlice";

const Reservations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();

  // State for improved date picker
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [dateRange, setDateRange] = React.useState({
    start: "",
    end: "",
  });
  const datePickerRef = React.useRef(null);

  // Redux selectors
  const reservations = useSelector(selectReservations);
  const filteredReservations = useSelector(selectFilteredReservations);
  const tables = useSelector(selectTables);
  const guests = useSelector(selectGuests);
  const loading = useSelector(selectReservationsLoading);
  const tablesLoading = useSelector(selectTablesLoading);
  const guestsLoading = useSelector(selectGuestsLoading);
  const error = useSelector(selectReservationsError);
  const formData = useSelector(selectReservationsFormData);
  const formErrors = useSelector(selectReservationsFormErrors);
  const showForm = useSelector(selectShowReservationsForm);
  const editingReservation = useSelector(selectEditingReservation);
  const viewingReservation = useSelector(selectViewingReservation);
  const seatModal = useSelector(selectSeatModal);
  const guestForm = useSelector(selectGuestForm);
  const guestFormErrors = useSelector(selectGuestFormErrors);
  const showGuestForm = useSelector(selectShowGuestForm);
  const filters = useSelector(selectReservationsFilters);
  const availableTables = useSelector(selectAvailableTables);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchReservations());
    dispatch(fetchTables());
    dispatch(fetchGuests());
  }, [dispatch]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Show error messages
  useEffect(() => {
    if (error) {
      showError("Operation failed", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  // Event handlers
  const handleSearch = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status }));
  };

  const handleDateFilter = (date) => {
    dispatch(setFilters({ date }));
  };

  // Helper functions for improved date picker
  const getQuickDateOptions = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return [
      {
        label: "Today",
        value: "today",
        start: today.toISOString().split("T")[0],
        end: today.toISOString().split("T")[0],
      },
      {
        label: "Tomorrow",
        value: "tomorrow",
        start: tomorrow.toISOString().split("T")[0],
        end: tomorrow.toISOString().split("T")[0],
      },
      {
        label: "This Week",
        value: "thisWeek",
        start: startOfWeek.toISOString().split("T")[0],
        end: endOfWeek.toISOString().split("T")[0],
      },
      {
        label: "This Month",
        value: "thisMonth",
        start: startOfMonth.toISOString().split("T")[0],
        end: endOfMonth.toISOString().split("T")[0],
      },
      {
        label: "Next 7 Days",
        value: "next7Days",
        start: today.toISOString().split("T")[0],
        end: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    ];
  };

  const handleQuickDateSelect = (option) => {
    if (option.value === "custom") {
      setShowDatePicker(true);
      return;
    }

    setDateRange({
      start: option.start,
      end: option.end,
    });

    // Apply the date filter
    dispatch(
      setFilters({
        date: option.start,
        dateRange:
          option.start !== option.end
            ? { start: option.start, end: option.end }
            : null,
      })
    );

    setShowDatePicker(false);
  };

  const handleCustomDateRange = () => {
    if (dateRange.start && dateRange.end) {
      dispatch(
        setFilters({
          date: dateRange.start,
          dateRange: { start: dateRange.start, end: dateRange.end },
        })
      );
    }
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setDateRange({ start: "", end: "" });
    dispatch(setFilters({ date: "", dateRange: null }));
    setShowDatePicker(false);
  };

  const formatDateDisplay = () => {
    if (filters.date) {
      const date = new Date(filters.date);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
    return "Select date";
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    dispatch(
      setFormData({
        [name]: type === "number" ? parseInt(value || 0) : value,
      })
    );
  };

  const handleGuestInputChange = (e) => {
    const { name, value } = e.target;
    dispatch(setGuestForm({ [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReservation) {
        const result = await dispatch(
          updateReservation({
            id: editingReservation.id,
            reservationData: formData,
          })
        ).unwrap();
        showSuccess("Reservation updated", "Updated successfully");
      } else {
        const result = await dispatch(createReservation(formData)).unwrap();
        showSuccess("Reservation created", "Saved successfully");
      }
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleCreateGuest = async () => {
    try {
      const result = await dispatch(createGuest(guestForm)).unwrap();
      showSuccess("Guest added", "Guest created and selected");
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateReservationStatus({ id, status })).unwrap();
      showSuccess("Status updated", status);
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleSeatReservation = async () => {
    if (!seatModal.tableId) return;
    try {
      await dispatch(
        seatReservation({
          id: seatModal.reservationId,
          tableId: seatModal.tableId,
        })
      ).unwrap();
      showSuccess("Reservation seated", "Table assigned");
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleCreateOrder = async (reservation) => {
    try {
      await dispatch(createOrderFromReservation(reservation)).unwrap();
      showSuccess(
        "Order created",
        `Order created for reservation ${reservation.reservationNumber}`
      );
      navigate("/orders");
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const openCreateForm = () => {
    dispatch(resetForm());
    dispatch(setShowForm(true));
  };

  const closeForm = () => {
    dispatch(setShowForm(false));
    dispatch(setEditingReservation(null));
    dispatch(resetForm());
  };

  const openSeatModal = (reservationId) => {
    dispatch(
      setSeatModal({
        open: true,
        reservationId,
        tableId: "",
      })
    );
  };

  const closeSeatModal = () => {
    dispatch(
      setSeatModal({
        open: false,
        reservationId: null,
        tableId: "",
      })
    );
  };

  const toggleGuestForm = () => {
    dispatch(setShowGuestForm(!showGuestForm));
    if (showGuestForm) {
      dispatch(resetGuestForm());
    }
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-600/20 text-green-300";
      case "pending":
        return "bg-amber-600/20 text-amber-300";
      case "seated":
        return "bg-blue-600/20 text-blue-300";
      case "completed":
        return "bg-emerald-600/20 text-emerald-300";
      case "cancelled":
        return "bg-red-600/20 text-red-300";
      case "no_show":
        return "bg-gray-600/20 text-gray-300";
      default:
        return "bg-neutral-700 text-gray-200";
    }
  };

  const getStatusOptions = () => [
    "pending",
    "confirmed",
    "seated",
    "completed",
    "cancelled",
    "no_show",
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
            <p className="text-gray-600">
              Manage table reservations and seating
            </p>
          </div>
        </div>
        <button
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          New Reservation
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={handleSearch}
              className="pl-10 w-full form-input"
              placeholder="Search reservations..."
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full form-input"
            >
              <option value="">All Statuses</option>
              {getStatusOptions().map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="w-full form-input flex items-center justify-between text-left"
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <span
                  className={filters.date ? "text-gray-300" : "text-gray-300"}
                >
                  {formatDateDisplay()}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {showDatePicker && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-white">
                      Select Date
                    </h3>
                    {filters.date && (
                      <button
                        onClick={clearDateFilter}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Date Options */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                      Quick Select
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {getQuickDateOptions().map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleQuickDateSelect(option)}
                          className="text-left px-3 py-2 text-sm rounded-md border border-neutral-600 hover:bg-neutral-800 hover:border-neutral-500 transition-colors text-gray-200 hover:text-white"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Date Range */}
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">
                      Custom Range
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          From
                        </label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              start: e.target.value,
                            }))
                          }
                          className="w-full text-xs bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 focus:outline-none focus:border-accent-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-300 mb-1">
                          To
                        </label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) =>
                            setDateRange((prev) => ({
                              ...prev,
                              end: e.target.value,
                            }))
                          }
                          className="w-full text-xs bg-neutral-800 border border-neutral-600 text-white rounded px-2 py-1 focus:outline-none focus:border-accent-primary"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleCustomDateRange}
                      disabled={!dateRange.start || !dateRange.end}
                      className="w-full px-3 py-2 text-sm bg-accent-primary text-white rounded-md hover:bg-accent-primary/90 disabled:bg-neutral-600 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={() =>
                dispatch(
                  setFilters({
                    search: "",
                    status: "",
                    date: "",
                    partySize: "",
                  })
                )
              }
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-neutral-900 rounded-lg shadow-lg border border-neutral-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-800 text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Guest</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time</th>
                <th className="px-4 py-3 text-left">Party Size</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr
                  key={reservation.id}
                  className="border-t border-neutral-800 text-white"
                >
                  <td className="px-4 py-3">
                    {reservation.guest
                      ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
                      : `Guest ID: ${reservation.guestId}`}
                  </td>
                  <td className="px-4 py-3">{reservation.reservationDate}</td>
                  <td className="px-4 py-3">{reservation.reservationTime}</td>
                  <td className="px-4 py-3">{reservation.partySize}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={reservation.status}
                        onChange={(e) =>
                          handleStatusUpdate(reservation.id, e.target.value)
                        }
                        className="rounded px-2 py-1 text-sm bg-neutral-800 border border-neutral-700 text-gray-100"
                      >
                        {getStatusOptions().map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      {reservation.status === "confirmed" && (
                        <button
                          className="text-sm px-2 py-1 border border-neutral-700 bg-neutral-800 text-gray-100 rounded hover:bg-neutral-700"
                          onClick={() => openSeatModal(reservation.id)}
                        >
                          Seat
                        </button>
                      )}
                      {reservation.status === "seated" && (
                        <button
                          className="text-sm px-2 py-1 border border-green-700 bg-green-800 text-green-100 rounded ml-2 hover:bg-green-700"
                          onClick={() => handleCreateOrder(reservation)}
                        >
                          Create Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReservations.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No reservations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Reservation Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">
              {editingReservation ? "Edit Reservation" : "New Reservation"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Guest Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-neutral-300">Guest</label>
                    <button
                      type="button"
                      className="text-xs px-2 py-1 rounded bg-neutral-800 border border-neutral-700 hover:bg-neutral-700"
                      onClick={toggleGuestForm}
                    >
                      {showGuestForm ? "Close" : "Quick add"}
                    </button>
                  </div>
                  <select
                    name="guestId"
                    value={formData.guestId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    required
                  >
                    <option value="">Select guest</option>
                    {guests.map((guest) => (
                      <option key={guest.id} value={guest.id}>
                        {guest.firstName} {guest.lastName}
                        {guest.phone ? ` • ${guest.phone}` : ""}
                      </option>
                    ))}
                  </select>
                  {formErrors.guestId && (
                    <div className="text-xs text-red-400 mt-1">
                      {formErrors.guestId}
                    </div>
                  )}

                  {/* Quick Guest Form */}
                  {showGuestForm && (
                    <div className="mt-3 space-y-2 p-3 rounded bg-neutral-800 border border-neutral-700">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={guestForm.firstName}
                          onChange={handleGuestInputChange}
                          className="w-1/2 p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                          required
                        />
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={guestForm.lastName}
                          onChange={handleGuestInputChange}
                          className="w-1/2 p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                          required
                        />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone (optional)"
                        value={guestForm.phone}
                        onChange={handleGuestInputChange}
                        className="w-full p-2 border rounded bg-neutral-900 border-neutral-700 text-white placeholder-neutral-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCreateGuest}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                          disabled={guestsLoading}
                        >
                          {guestsLoading ? "Saving..." : "Save guest"}
                        </button>
                        <button
                          type="button"
                          onClick={toggleGuestForm}
                          className="bg-neutral-700 text-white px-3 py-1.5 rounded text-sm hover:bg-neutral-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date, Time, Party Size, Special Requests */}
                <div>
                  <label className="block text-sm text-neutral-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="reservationDate"
                    value={formData.reservationDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="reservationTime"
                    value={formData.reservationTime}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">
                    Party Size
                  </label>
                  <input
                    type="number"
                    name="partySize"
                    value={formData.partySize}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400"
                    rows="3"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingReservation
                    ? "Update"
                    : "Create"}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Reservation Modal */}
      {seatModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 text-white p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold mb-4">Assign Table</h2>
            <div className="space-y-4">
              <select
                value={seatModal.tableId}
                onChange={(e) =>
                  dispatch(setSeatModal({ tableId: e.target.value }))
                }
                className="w-full p-2 border rounded bg-neutral-800 border-neutral-700 text-white"
              >
                <option value="">Select table</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.tableNumber} • {table.minCapacity}-
                    {table.maxCapacity}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSeatReservation}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={!seatModal.tableId || loading}
              >
                {loading ? "Seating..." : "Confirm"}
              </button>
              <button
                onClick={closeSeatModal}
                className="bg-neutral-700 text-white px-4 py-2 rounded hover:bg-neutral-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
