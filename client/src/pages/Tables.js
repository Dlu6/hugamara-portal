import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Table as TableIcon,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchTables,
  fetchOutlets,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingTable,
  setViewingTable,
  setFilters,
  resetForm,
  clearError,
  selectTables,
  selectFilteredTables,
  selectOutlets,
  selectTablesLoading,
  selectTablesError,
  selectTablesFormData,
  selectTablesFormErrors,
  selectShowTablesForm,
  selectEditingTable,
  selectViewingTable,
  selectTablesFilters,
} from "../store/slices/tablesSlice";

const Tables = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  // Redux selectors
  const tables = useSelector(selectTables);
  const filteredTables = useSelector(selectFilteredTables);
  const outlets = useSelector(selectOutlets);
  const loading = useSelector(selectTablesLoading);
  const error = useSelector(selectTablesError);
  const formData = useSelector(selectTablesFormData);
  const formErrors = useSelector(selectTablesFormErrors);
  const showForm = useSelector(selectShowTablesForm);
  const editingTable = useSelector(selectEditingTable);
  const viewingTable = useSelector(selectViewingTable);
  const filters = useSelector(selectTablesFilters);

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchTables());
    dispatch(fetchOutlets());
  }, [dispatch]);

  // Handle filter changes
  useEffect(() => {
    if (filters.outletId) {
      dispatch(fetchTables({ outletId: filters.outletId }));
    }
  }, [dispatch, filters.outletId]);

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

  const handleOutletFilter = (outletId) => {
    dispatch(setFilters({ outletId }));
  };

  const handleStatusFilter = (status) => {
    dispatch(setFilters({ status }));
  };

  const handleTypeFilter = (tableType) => {
    dispatch(setFilters({ tableType }));
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    dispatch(
      setFormData({
        [name]: type === "number" ? parseInt(value || 0) : value,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTable) {
        const result = await dispatch(
          updateTable({
            id: editingTable.id,
            tableData: formData,
          })
        ).unwrap();
        showSuccess("Table updated", result.tableNumber);
      } else {
        const result = await dispatch(createTable(formData)).unwrap();
        showSuccess("Table created", result.tableNumber);
      }
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleEdit = (table) => {
    dispatch(setEditingTable(table));
    dispatch(setShowForm(true));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete table?")) return;
    try {
      await dispatch(deleteTable(id)).unwrap();
      showSuccess("Table deleted", "Marked out of service");
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const handleView = (table) => {
    dispatch(setViewingTable(table));
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await dispatch(updateTableStatus({ id, status })).unwrap();
      showSuccess("Status updated", `Table status changed to ${status}`);
    } catch (error) {
      // Error handling is done in the slice
    }
  };

  const resetFormData = () => {
    dispatch(resetForm());
    dispatch(setFormErrors({}));
  };

  const openCreateForm = () => {
    resetFormData();
    dispatch(setShowForm(true));
  };

  const closeForm = () => {
    dispatch(setShowForm(false));
    dispatch(setEditingTable(null));
    resetFormData();
  };

  const clearFilters = () => {
    dispatch(
      setFilters({
        search: "",
        outletId: "",
        status: "",
        tableType: "",
      })
    );
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-blue-100 text-blue-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "cleaning":
        return "bg-purple-100 text-purple-800";
      case "maintenance":
        return "bg-orange-100 text-orange-800";
      case "out_of_service":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTableType = (type) => {
    return type?.replace(/_/g, " ") || "";
  };

  const formatStatus = (status) => {
    return status?.replace(/_/g, " ") || "";
  };

  const getTableTypeOptions = () => [
    "standard",
    "booth",
    "bar",
    "high_top",
    "outdoor",
    "private",
    "vip",
    "wheelchair_accessible",
  ];

  const getStatusOptions = () => [
    "available",
    "occupied",
    "reserved",
    "cleaning",
    "maintenance",
    "out_of_service",
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TableIcon className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tables</h1>
            <p className="text-gray-600">Manage seating tables and capacity</p>
          </div>
        </div>
        <button
          className="btn-primary inline-flex items-center gap-2"
          onClick={openCreateForm}
        >
          <Plus className="w-4 h-4" /> New Table
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={filters.search}
              onChange={handleSearch}
              className="pl-10 w-full form-input"
              placeholder="Search tables..."
            />
          </div>

          {/* Outlet Filter */}
          <div>
            <select
              value={filters.outletId}
              onChange={(e) => handleOutletFilter(e.target.value)}
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

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full form-input"
            >
              <option value="">All Statuses</option>
              {getStatusOptions().map((status) => (
                <option key={status} value={status}>
                  {formatStatus(status)}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.tableType}
              onChange={(e) => handleTypeFilter(e.target.value)}
              className="w-full form-input"
            >
              <option value="">All Types</option>
              {getTableTypeOptions().map((type) => (
                <option key={type} value={type}>
                  {formatTableType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-center">
            <button onClick={clearFilters} className="btn-secondary w-full">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Tables List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tables...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
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
                {filteredTables.map((table) => (
                  <tr key={table.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.tableNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {table.minCapacity}-{table.maxCapacity} (cap{" "}
                      {table.capacity})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                      {formatTableType(table.tableType)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          table.status
                        )}`}
                      >
                        {formatStatus(table.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                          onClick={() => handleEdit(table)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                          onClick={() => handleDelete(table.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTables.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No tables found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingTable ? "Edit Table" : "New Table"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Outlet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Outlet
                  </label>
                  <select
                    name="outletId"
                    value={formData.outletId}
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  >
                    <option value="">Select outlet</option>
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

                {/* Table Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Table Number
                  </label>
                  <input
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                    required
                  />
                  {formErrors.tableNumber && (
                    <div className="text-xs text-red-600 mt-1">
                      {formErrors.tableNumber}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                  />
                </div>

                {/* Capacity Fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min={1}
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Min
                    </label>
                    <input
                      type="number"
                      name="minCapacity"
                      min={1}
                      value={formData.minCapacity}
                      onChange={handleInputChange}
                      className="mt-1 w-full form-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      min={1}
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      className="mt-1 w-full form-input"
                    />
                  </div>
                </div>

                {/* Table Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="tableType"
                    value={formData.tableType}
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                  >
                    {getTableTypeOptions().map((type) => (
                      <option key={type} value={type}>
                        {formatTableType(type)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 w-full form-input"
                  >
                    {getStatusOptions().map((status) => (
                      <option key={status} value={status}>
                        {formatStatus(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : editingTable ? "Update" : "Create"}
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

export default Tables;
