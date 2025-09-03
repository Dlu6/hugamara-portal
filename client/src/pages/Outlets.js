import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchAllOutlets,
  createOutlet,
  updateOutlet,
  deleteOutlet,
  setFormData,
  setFormErrors,
  setShowCreateModal,
  setShowEditModal,
  setSelectedOutlet,
  setSearchTerm,
  resetForm,
  clearError,
  selectAllOutlets,
  selectFilteredOutlets,
  selectOutletsLoading,
  selectOutletsError,
  selectOutletsFormData,
  selectOutletsFormErrors,
  selectShowCreateModal,
  selectShowEditModal,
  selectSelectedOutlet,
  selectOutletsSearchTerm,
} from "../store/slices/outletSlice";

const Outlets = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();
  const navigate = useNavigate();

  const outlets = useSelector(selectAllOutlets);
  const filteredOutlets = useSelector(selectFilteredOutlets);
  const loading = useSelector(selectOutletsLoading);
  const error = useSelector(selectOutletsError);
  const formData = useSelector(selectOutletsFormData);
  const formErrors = useSelector(selectOutletsFormErrors);
  const showCreateModal = useSelector(selectShowCreateModal);
  const showEditModal = useSelector(selectShowEditModal);
  const selectedOutlet = useSelector(selectSelectedOutlet);
  const searchTerm = useSelector(selectOutletsSearchTerm);

  useEffect(() => {
    dispatch(fetchAllOutlets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      showError("Operation failed", error);
      dispatch(clearError());
    }
  }, [error, showError, dispatch]);

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const openCreateModal = () => {
    dispatch(resetForm());
    dispatch(setShowCreateModal(true));
  };

  const openEditModal = (outlet) => {
    dispatch(setSelectedOutlet(outlet));
    dispatch(setFormErrors({}));
    dispatch(setShowEditModal(true));
  };

  const closeCreateModal = () => {
    dispatch(setShowCreateModal(false));
    dispatch(resetForm());
  };

  const closeEditModal = () => {
    dispatch(setShowEditModal(false));
    dispatch(setSelectedOutlet(null));
    dispatch(resetForm());
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    dispatch(
      setFormData({
        [name]: type === "checkbox" ? checked : value,
      })
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(createOutlet(formData)).unwrap();
      showSuccess("Outlet created", result.name);
      dispatch(fetchAllOutlets()); // Refresh the list
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(
        updateOutlet({
          id: selectedOutlet.id,
          outletData: formData,
        })
      ).unwrap();
      showSuccess("Outlet updated", result.name);
      dispatch(fetchAllOutlets()); // Refresh the list
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this outlet?")) return;
    try {
      await dispatch(deleteOutlet(id)).unwrap();
      showSuccess("Outlet deleted", "Outlet deactivated successfully");
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Outlets</h1>
            <p className="text-gray-600">
              Manage locations and outlet settings
            </p>
          </div>
        </div>
        <button
          className="btn-primary flex items-center gap-2"
          onClick={openCreateModal}
        >
          <Plus className="w-4 h-4" />
          New Outlet
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 w-full form-input"
            placeholder="Search outlets by name, code or type..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading outlets...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOutlets.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {o.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.timezone || ""} {o.currency ? `• ${o.currency}` : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {o.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize text-gray-900">
                      {o.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          o.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {o.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                          onClick={() => openEditModal(o)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="View"
                          onClick={() => navigate(`/outlets/${o.id}`)}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => handleDelete(o.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOutlets.length === 0 && !loading && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No outlets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create Outlet
              </h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    name="name"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.name && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    name="code"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.code && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.code}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    name="type"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="nightclub">Nightclub</option>
                    <option value="hq">HQ</option>
                  </select>
                  {formErrors.type && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.type}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    name="timezone"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    placeholder="Africa/Kampala"
                  />
                  {formErrors.timezone && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.timezone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    name="currency"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    placeholder="UGX"
                  />
                  {formErrors.currency && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.currency}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    name="isActive"
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active outlet
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOutlet && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Outlet
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    name="name"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.name && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.name}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    name="code"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.code && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.code}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    name="type"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="nightclub">Nightclub</option>
                    <option value="hq">HQ</option>
                  </select>
                  {formErrors.type && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.type}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Timezone
                  </label>
                  <input
                    type="text"
                    value={formData.timezone}
                    name="timezone"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    placeholder="Africa/Kampala"
                  />
                  {formErrors.timezone && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.timezone}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    name="currency"
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    placeholder="UGX"
                  />
                  {formErrors.currency && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.currency}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    name="isActive"
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Active outlet
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Outlets;
