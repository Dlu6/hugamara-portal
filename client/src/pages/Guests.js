import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchGuests,
  fetchGuestStats,
  fetchGuestHistory,
  createGuest,
  updateGuest,
  deleteGuest,
  setFormData,
  setFormErrors,
  setShowModal,
  setEditingGuest,
  setShowDetails,
  setSelectedGuest,
  setFilters,
  setCurrentPage,
  resetForm,
  clearError,
  clearFormError,
  selectGuests,
  selectGuestStats,
  selectGuestHistory,
  selectGuestsLoading,
  selectGuestsStatsLoading,
  selectGuestsError,
  selectGuestsFormData,
  selectGuestsFormErrors,
  selectShowGuestsModal,
  selectEditingGuest,
  selectShowGuestDetails,
  selectGuestsFilters,
  selectGuestsCurrentPage,
  selectGuestsTotalPages,
  selectGuestsTotal,
} from "../store/slices/guestsSlice";

const Guests = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  const [submitting, setSubmitting] = useState(false);

  const guests = useSelector(selectGuests);
  const guestStats = useSelector(selectGuestStats);
  const guestHistory = useSelector(selectGuestHistory);
  const loading = useSelector(selectGuestsLoading);
  const statsLoading = useSelector(selectGuestsStatsLoading);
  const error = useSelector(selectGuestsError);
  const formData = useSelector(selectGuestsFormData);
  const formErrors = useSelector(selectGuestsFormErrors);
  const showModal = useSelector(selectShowGuestsModal);
  const editingGuest = useSelector(selectEditingGuest);
  const showDetails = useSelector(selectShowGuestDetails);
  const filters = useSelector(selectGuestsFilters);
  const currentPage = useSelector(selectGuestsCurrentPage);
  const totalPages = useSelector(selectGuestsTotalPages);
  const total = useSelector(selectGuestsTotal);

  useEffect(() => {
    const params = {
      page: currentPage,
      limit: filters.limit,
      search: filters.search,
      loyaltyTier: filters.loyaltyTier || undefined,
      isActive:
        filters.isActive === "all" ? undefined : filters.isActive === "active",
    };
    dispatch(fetchGuests(params));
    dispatch(fetchGuestStats());
  }, [
    dispatch,
    currentPage,
    filters.search,
    filters.loyaltyTier,
    filters.isActive,
    filters.limit,
  ]);

  useEffect(() => {
    if (error) {
      showError("Operation failed", error);
      dispatch(clearError());
    }

    // console.log("[Guests] Modal visibility changed", { showModal, submitting });
    if (!showModal && submitting) {
      setSubmitting(false);
    }
  }, [error, showError, dispatch, showModal]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      setFormData({
        [name]: type === "checkbox" ? checked : value,
      })
    );

    // Clear error for this field
    if (formErrors[name]) {
      dispatch(clearFormError(name));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("[Guests] onSubmit fired", { submitting, showModal });
    if (submitting) {
      return; // prevent double submission
    }
    setSubmitting(true);
    // console.log("[Guests] Submitting set to true, proceeding with save");
    try {
      const sanitizeGuestPayload = (data) => {
        const cleaned = { ...data };
        const optionalStringFields = [
          "email",
          "phone",
          "dateOfBirth",
          "gender",
          "address",
          "city",
          "country",
          "preferences",
          "allergies",
          "dietaryRestrictions",
          "notes",
        ];

        optionalStringFields.forEach((field) => {
          if (cleaned[field] === "" || cleaned[field] === undefined) {
            delete cleaned[field];
          }
        });

        ["loyaltyPoints", "totalSpent", "visitCount"].forEach((field) => {
          const val = cleaned[field];
          if (val === "" || val === null || val === undefined) {
            delete cleaned[field];
          } else if (!Number.isNaN(Number(val))) {
            cleaned[field] = Number(val);
          }
        });

        return cleaned;
      };

      const payload = sanitizeGuestPayload(formData);

      if (editingGuest) {
        // console.log("[Guests] Dispatch updateGuest", { id: editingGuest.id, payload });
        const result = await dispatch(
          updateGuest({
            id: editingGuest.id,
            guestData: payload,
          })
        ).unwrap();
        // console.log("[Guests] updateGuest fulfilled", result);
        showSuccess("Guest updated successfully");
      } else {
        // console.log("[Guests] Dispatch createGuest", payload);
        const result = await dispatch(createGuest(payload)).unwrap();
        // console.log("[Guests] createGuest fulfilled", result);
        showSuccess("Guest created successfully");
      }

      // Close modal after successful save and refresh lightweight stats only
      // console.log("[Guests] Closing modal after success");
      closeModal();
      dispatch(fetchGuestStats());
    } catch (error) {
      // Error handling is done in the slice
      // console.error("[Guests] Submit error", error);
    } finally {
      setSubmitting(false);
      // console.log("[Guests] Submitting set to false (finally)");
    }
  };

  const handleEdit = (guest) => {
    dispatch(setEditingGuest(guest));
    dispatch(setShowModal(true));
  };

  const handleDelete = async (guest) => {
    if (
      window.confirm(
        `Are you sure you want to deactivate ${guest.firstName} ${guest.lastName}?`
      )
    ) {
      try {
        await dispatch(deleteGuest(guest.id)).unwrap();
        showSuccess("Guest deactivated successfully");

        // Refresh data
        const params = {
          page: currentPage,
          limit: filters.limit,
          search: filters.search,
          loyaltyTier: filters.loyaltyTier || undefined,
          isActive:
            filters.isActive === "all"
              ? undefined
              : filters.isActive === "active",
        };
        dispatch(fetchGuests(params));
        dispatch(fetchGuestStats());
      } catch (error) {
        // Error handling is done in the slice
      }
    }
  };

  const handleViewDetails = async (guest) => {
    try {
      const result = await dispatch(fetchGuestHistory(guest.id)).unwrap();
      dispatch(setSelectedGuest({ guest, history: result }));
      dispatch(setShowDetails(true));
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const openCreateModal = () => {
    dispatch(resetForm());
    dispatch(setShowModal(true));
  };

  const closeModal = () => {
    dispatch(setShowModal(false));
    dispatch(setEditingGuest(null));
    dispatch(resetForm());
  };

  const handleSearchChange = (e) => {
    dispatch(setFilters({ search: e.target.value }));
  };

  const handleLoyaltyFilterChange = (e) => {
    dispatch(setFilters({ loyaltyTier: e.target.value }));
  };

  const handleActiveFilterChange = (e) => {
    dispatch(setFilters({ isActive: e.target.value }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };

  const getLoyaltyTierColor = (tier) => {
    const colors = {
      bronze: "bg-amber-100 text-amber-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
      vip: "bg-red-100 text-red-800",
    };
    return colors[tier] || colors.bronze;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
    }).format(amount);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Guest Management</h1>
        <p className="text-gray-500">
          Manage guest information, loyalty programs, and customer relationships
        </p>
      </div>

      {/* Stats Cards */}
      {guestStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300">Total Guests</h3>
            <p className="text-2xl font-bold text-white">
              {guestStats.totalGuests}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300">Active Guests</h3>
            <p className="text-2xl font-bold text-white">
              {guestStats.activeGuests}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300">Total Revenue</h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(guestStats.totalRevenue)}
            </p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300">Avg Spent</h3>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(guestStats.avgSpent)}
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text"
              placeholder="Search guests..."
              value={filters.search}
              onChange={handleSearchChange}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <select
              value={filters.loyaltyTier}
              onChange={handleLoyaltyFilterChange}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Loyalty Tiers</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="vip">VIP</option>
            </select>
            <select
              value={filters.isActive}
              onChange={handleActiveFilterChange}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            Add Guest
          </button>
        </div>
      </div>

      {/* Guests Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Loyalty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Spending
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading && guests.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    Loading guests...
                  </td>
                </tr>
              ) : guests.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No guests found
                  </td>
                </tr>
              ) : (
                guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-700">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {guest.firstName} {guest.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          ID: {guest.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-300">
                        {guest.email && <div>{guest.email}</div>}
                        {guest.phone && <div>{guest.phone}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(
                            guest.loyaltyTier
                          )}`}
                        >
                          {guest.loyaltyTier}
                        </span>
                        <div className="text-sm text-gray-400 mt-1">
                          {guest.loyaltyPoints} points
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {formatCurrency(guest.totalSpent)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-300">
                      {guest.visitCount}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          guest.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {guest.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(guest)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEdit(guest)}
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(guest)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Guest Modal */}
      {showModal && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 ${
            submitting ? "pointer-events-none" : ""
          }`}
        >
          <div
            className={`bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto mt-16 ${
              submitting ? "opacity-95" : ""
            }`}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              {editingGuest ? "Edit Guest" : "Add New Guest"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded border focus:outline-none ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-gray-600 focus:border-blue-500"
                    }`}
                    required
                  />
                  {formErrors.firstName && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded border focus:outline-none ${
                      formErrors.lastName
                        ? "border-red-500"
                        : "border-gray-600 focus:border-blue-500"
                    }`}
                    required
                  />
                  {formErrors.lastName && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded border focus:outline-none ${
                      formErrors.email
                        ? "border-red-500"
                        : "border-gray-600 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 bg-gray-700 text-white rounded border focus:outline-none ${
                      formErrors.phone
                        ? "border-red-500"
                        : "border-gray-600 focus:border-blue-500"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Loyalty Tier
                  </label>
                  <select
                    name="loyaltyTier"
                    value={formData.loyaltyTier}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Loyalty Points
                  </label>
                  <input
                    type="number"
                    name="loyaltyPoints"
                    value={formData.loyaltyPoints}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Total Spent
                  </label>
                  <input
                    type="number"
                    name="totalSpent"
                    value={formData.totalSpent}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Visit Count
                  </label>
                  <input
                    type="number"
                    name="visitCount"
                    value={formData.visitCount}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Preferences
                </label>
                <textarea
                  name="preferences"
                  value={formData.preferences}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Dietary Restrictions
                </label>
                <textarea
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-300">
                    Marketing Consent
                  </span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                  onClick={() =>
                    console.log("[Guests] Submit button click", {
                      submitting,
                      showModal,
                      formData,
                    })
                  }
                >
                  {submitting
                    ? "Saving..."
                    : editingGuest
                    ? "Update Guest"
                    : "Create Guest"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guest Details Modal */}
      {showDetails && guestHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                Guest Details - {guestHistory.guest.firstName}{" "}
                {guestHistory.guest.lastName}
              </h2>
              <button
                onClick={() => dispatch(setShowDetails(false))}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Guest Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Guest Information
                </h3>
                <div className="bg-gray-700 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="text-gray-300">Email:</span>{" "}
                    <span className="text-white">
                      {guestHistory.guest.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Phone:</span>{" "}
                    <span className="text-white">
                      {guestHistory.guest.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Loyalty Tier:</span>{" "}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(
                        guestHistory.guest.loyaltyTier
                      )}`}
                    >
                      {guestHistory.guest.loyaltyTier}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Loyalty Points:</span>{" "}
                    <span className="text-white">
                      {guestHistory.guest.loyaltyPoints}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Total Spent:</span>{" "}
                    <span className="text-white">
                      {formatCurrency(guestHistory.guest.totalSpent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Visit Count:</span>{" "}
                    <span className="text-white">
                      {guestHistory.guest.visitCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300">Status:</span>{" "}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        guestHistory.guest.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {guestHistory.guest.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Activity
                </h3>

                {/* Recent Reservations */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-white mb-2">
                    Recent Reservations
                  </h4>
                  {guestHistory.history?.reservations?.length > 0 ? (
                    <div className="space-y-2">
                      {guestHistory.history.reservations
                        .slice(0, 3)
                        .map((reservation) => (
                          <div key={reservation.id} className="text-sm">
                            <div className="text-white">
                              {reservation.reservationNumber}
                            </div>
                            <div className="text-gray-300">
                              {new Date(reservation.date).toLocaleDateString()}{" "}
                              at {reservation.time}
                            </div>
                            <div className="text-gray-400">
                              Party of {reservation.partySize} -{" "}
                              {reservation.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No reservations found
                    </p>
                  )}
                </div>

                {/* Recent Orders */}
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-md font-medium text-white mb-2">
                    Recent Orders
                  </h4>
                  {guestHistory.history?.orders?.length > 0 ? (
                    <div className="space-y-2">
                      {guestHistory.history.orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="text-sm">
                          <div className="text-white">{order.orderNumber}</div>
                          <div className="text-gray-300">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          <div className="text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString()} -{" "}
                            {order.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No orders found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Guests;
