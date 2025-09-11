import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import {
  fetchInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  fetchInventoryStats,
  updateStock,
  getLowStockItems,
  getExpiringItems,
  generateSKU,
  setFilters,
  setFormData,
  setFormErrors,
  setShowForm,
  setEditingItem,
  setViewingItem,
  clearError,
} from "../store/slices/inventorySlice";
import {
  selectInventory,
  selectFilteredInventory,
  selectInventoryStats,
  selectInventoryLoading,
  selectInventoryError,
  selectInventoryFilters,
  selectInventoryFormData,
  selectInventoryFormErrors,
  selectShowInventoryForm,
  selectEditingItem,
  selectViewingItem,
  selectLowStockItems,
  selectExpiringItems,
} from "../store/slices/inventorySlice";

const Inventory = () => {
  const dispatch = useDispatch();
  const { success: showSuccess, error: showError } = useToast();

  // Redux state
  const inventory = useSelector(selectInventory);
  const filteredInventory = useSelector(selectFilteredInventory);
  const stats = useSelector(selectInventoryStats);
  const loading = useSelector(selectInventoryLoading);
  const error = useSelector(selectInventoryError);
  const filters = useSelector(selectInventoryFilters);
  const formData = useSelector(selectInventoryFormData);
  const formErrors = useSelector(selectInventoryFormErrors);
  const showForm = useSelector(selectShowInventoryForm);
  const editingItem = useSelector(selectEditingItem);
  const viewingItem = useSelector(selectViewingItem);
  const lowStockItems = useSelector(selectLowStockItems);
  const expiringItems = useSelector(selectExpiringItems);

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiring, setShowExpiring] = useState(false);
  const [stockUpdateModal, setStockUpdateModal] = useState(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    quantity: "",
    type: "add",
  });

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchInventory());
    dispatch(fetchInventoryStats());
    dispatch(getLowStockItems());
    dispatch(getExpiringItems());
  }, [dispatch]);

  // Handle search and filtering
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(setFilters({ search: value }));
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    dispatch(setFilters({ category }));
  };

  // Apply local filters to inventory
  const getFilteredInventory = () => {
    let filtered = [...inventory];

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(filters.search.toLowerCase()) ||
          (item.description &&
            item.description
              .toLowerCase()
              .includes(filters.search.toLowerCase())) ||
          (item.sku &&
            item.sku.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Apply low stock filter
    if (showLowStock) {
      filtered = filtered.filter(
        (item) => item.currentStock <= item.minimumStock
      );
    }

    // Apply expiring filter
    if (showExpiring) {
      filtered = filtered.filter((item) => {
        if (!item.isPerishable || !item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const diffTime = expiryDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
      });
    }

    return filtered;
  };

  const displayInventory = getFilteredInventory();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    // Handle date fields - convert empty strings to null
    if (name === "expiryDate" && value === "") {
      newValue = null;
    }

    dispatch(setFormData({ [name]: newValue }));

    // Auto-generate SKU when category changes and SKU is empty
    if (name === "category" && !formData.sku) {
      handleGenerateSKU(value);
    }
  };

  const handleGenerateSKU = async (category) => {
    if (!category) return;

    try {
      await dispatch(generateSKU({ category })).unwrap();
    } catch (error) {
      console.error("Failed to generate SKU:", error);
    }
  };

  const handleArrayChange = (name, value) => {
    dispatch(setFormData({ [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await dispatch(
          updateInventoryItem({
            id: editingItem.id,
            itemData: formData,
          })
        ).unwrap();
        showSuccess("Inventory item updated successfully");
      } else {
        await dispatch(createInventoryItem(formData)).unwrap();
        showSuccess("Inventory item created successfully");
      }

      dispatch(setShowForm(false));
      dispatch(setEditingItem(null));
      dispatch(fetchInventory());
      dispatch(fetchInventoryStats());
    } catch (error) {
      showError(error.message || "Failed to save inventory item");
    }
  };

  const handleEdit = (item) => {
    dispatch(setEditingItem(item));
    dispatch(setFormData(item));
    dispatch(setShowForm(true));
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this inventory item?")
    ) {
      try {
        await dispatch(deleteInventoryItem(id)).unwrap();
        showSuccess("Inventory item deleted successfully");
        dispatch(fetchInventory());
        dispatch(fetchInventoryStats());
      } catch (error) {
        showError(error.message || "Failed to delete inventory item");
      }
    }
  };

  const handleView = (item) => {
    dispatch(setViewingItem(item));
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        updateStock({
          id: stockUpdateModal.id,
          stockData: stockUpdateData,
        })
      ).unwrap();

      showSuccess("Stock updated successfully");
      setStockUpdateModal(null);
      setStockUpdateData({ quantity: "", type: "add" });
      dispatch(fetchInventory());
      dispatch(fetchInventoryStats());
    } catch (error) {
      showError(error.message || "Failed to update stock");
    }
  };

  const resetForm = () => {
    dispatch(
      setFormData({
        itemName: "",
        category: "food",
        subcategory: "",
        sku: "",
        barcode: "",
        description: "",
        unit: "piece",
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 0,
        reorderPoint: 0,
        unitCost: 0,
        supplierName: "",
        leadTime: 0,
        expiryDate: null,
        isPerishable: false,
        location: "",
        notes: "",
      })
    );
    dispatch(setFormErrors({}));
  };

  const openCreateForm = () => {
    resetForm();
    dispatch(setEditingItem(null));
    dispatch(setShowForm(true));
    // Generate initial SKU for new items
    setTimeout(() => {
      handleGenerateSKU("food");
    }, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCategory = (category) => {
    const categoryMap = {
      food: "Food",
      beverage: "Beverage",
      cleaning: "Cleaning Supplies",
      equipment: "Equipment",
      packaging: "Packaging",
      other: "Other",
    };
    return categoryMap[category] || category;
  };

  const getStatusColor = (item) => {
    if (item.currentStock <= item.minimumStock) return "text-red-600";
    if (item.currentStock <= item.reorderPoint) return "text-yellow-600";
    return "text-green-600";
  };

  const getStatusIcon = (item) => {
    if (item.currentStock <= item.minimumStock) return AlertTriangle;
    if (item.currentStock <= item.reorderPoint) return TrendingDown;
    return TrendingUp;
  };

  const getCategoryOptions = () => [
    { value: "food", label: "Food" },
    { value: "beverage", label: "Beverage" },
    { value: "cleaning", label: "Cleaning Supplies" },
    { value: "equipment", label: "Equipment" },
    { value: "packaging", label: "Packaging" },
    { value: "other", label: "Other" },
  ];

  const getUnitOptions = () => [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "Kilogram" },
    { value: "liter", label: "Liter" },
    { value: "box", label: "Box" },
    { value: "bottle", label: "Bottle" },
    { value: "pack", label: "Pack" },
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

  if (loading && inventory.length === 0) {
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
              <Package className="w-8 h-8 text-blue-400" />
              Inventory Management
            </h1>
            <p className="text-neutral-400 mt-1">
              Manage your inventory items, track stock levels, and monitor
              supplies
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => dispatch(fetchInventory())}
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
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Items"
          value={stats.totalItems || 0}
          icon={Package}
          color="blue"
          subtitle="All inventory items"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStockItems || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Items below minimum"
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(stats.totalValue || 0)}
          icon={DollarSign}
          color="green"
          subtitle="Inventory worth"
        />
        <StatCard
          title="Expiring Soon"
          value={stats.expiringItems || 0}
          icon={Calendar}
          color="yellow"
          subtitle="Items expiring in 7 days"
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
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {getCategoryOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showLowStock
                ? "bg-red-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </button>

          <button
            onClick={() => setShowExpiring(!showExpiring)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showExpiring
                ? "bg-yellow-600 text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Expiring
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Total Value
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
              {displayInventory.map((item) => {
                const StatusIcon = getStatusIcon(item);
                return (
                  <tr key={item.id} className="hover:bg-neutral-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.itemName}
                        </div>
                        <div className="text-sm text-neutral-400">
                          {item.sku && `SKU: ${item.sku}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 bg-opacity-20 text-blue-300">
                        {formatCategory(item.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {item.currentStock} {item.unit}
                      </div>
                      <div className="text-xs text-neutral-400">
                        Min: {item.minimumStock}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(item.unitCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(item.currentStock * item.unitCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-2 ${getStatusColor(
                          item
                        )}`}
                      >
                        <StatusIcon className="w-4 h-4" />
                        <span className="text-sm">
                          {item.currentStock <= item.minimumStock
                            ? "Low Stock"
                            : item.currentStock <= item.reorderPoint
                            ? "Reorder"
                            : "In Stock"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(item)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStockUpdateModal(item)}
                          className="text-green-400 hover:text-green-300"
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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

        {displayInventory.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-neutral-400" />
            <h3 className="mt-2 text-sm font-medium text-white">
              No inventory items
            </h3>
            <p className="mt-1 text-sm text-neutral-400">
              Get started by creating a new inventory item.
            </p>
            <div className="mt-6">
              <button
                onClick={openCreateForm}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 sm:p-6 z-[9999] overflow-y-auto">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full mt-8 sm:mt-12 mb-4 sm:mb-8 border border-neutral-700 min-h-fit max-h-[90vh] overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-neutral-800 border-b border-neutral-700 px-6 pt-6 pb-4 rounded-t-lg z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingItem
                    ? "Edit Inventory Item"
                    : "Add New Inventory Item"}
                </h2>
                <button
                  onClick={() => dispatch(setShowForm(false))}
                  className="text-neutral-400 hover:text-white text-3xl font-bold p-2 hover:bg-neutral-700 rounded-full transition-colors"
                  title="Close Form"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {formErrors.itemName && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.itemName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {getCategoryOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      SKU
                      <span className="text-xs text-neutral-500 ml-1">
                        (Auto-generated)
                      </span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Will be auto-generated"
                        readOnly={!editingItem}
                      />
                      {!editingItem && formData.category && (
                        <button
                          type="button"
                          onClick={() => handleGenerateSKU(formData.category)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          title="Generate new SKU"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {formErrors.sku && (
                      <p className="text-red-400 text-xs mt-1">
                        {formErrors.sku}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {getUnitOptions().map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      name="currentStock"
                      value={formData.currentStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Minimum Stock *
                    </label>
                    <input
                      type="number"
                      name="minimumStock"
                      value={formData.minimumStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Unit Cost *
                    </label>
                    <input
                      type="number"
                      name="unitCost"
                      value={formData.unitCost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplierName"
                      value={formData.supplierName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                    rows="3"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPerishable"
                      checked={formData.isPerishable}
                      onChange={handleInputChange}
                      className="rounded border-neutral-600 bg-neutral-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-neutral-300">
                      Perishable Item
                    </span>
                  </label>
                </div>

                {formData.isPerishable && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

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
                    {editingItem ? "Update Item" : "Create Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-md w-full border border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Update Stock - {stockUpdateModal.itemName}
                </h3>
                <button
                  onClick={() => setStockUpdateModal(null)}
                  className="text-neutral-400 hover:text-white"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Current Stock: {stockUpdateModal.currentStock}{" "}
                    {stockUpdateModal.unit}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Update Type
                  </label>
                  <select
                    value={stockUpdateData.type}
                    onChange={(e) =>
                      setStockUpdateData({
                        ...stockUpdateData,
                        type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Add Stock</option>
                    <option value="remove">Remove Stock</option>
                    <option value="set">Set Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={stockUpdateData.quantity}
                    onChange={(e) =>
                      setStockUpdateData({
                        ...stockUpdateData,
                        quantity: e.target.value,
                      })
                    }
                    min="0"
                    className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStockUpdateModal(null)}
                    className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Item Modal */}
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-800 rounded-lg shadow-xl max-w-2xl w-full border border-neutral-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {viewingItem.itemName}
                </h3>
                <button
                  onClick={() => dispatch(setViewingItem(null))}
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
                      <span className="text-neutral-400">SKU:</span>
                      <span className="text-white">
                        {viewingItem.sku || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Category:</span>
                      <span className="text-white">
                        {formatCategory(viewingItem.category)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Unit:</span>
                      <span className="text-white">{viewingItem.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Supplier:</span>
                      <span className="text-white">
                        {viewingItem.supplierName || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Stock Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Current Stock:</span>
                      <span className="text-white">
                        {viewingItem.currentStock} {viewingItem.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Minimum Stock:</span>
                      <span className="text-white">
                        {viewingItem.minimumStock} {viewingItem.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Unit Cost:</span>
                      <span className="text-white">
                        {formatCurrency(viewingItem.unitCost)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Total Value:</span>
                      <span className="text-white">
                        {formatCurrency(
                          viewingItem.currentStock * viewingItem.unitCost
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {viewingItem.description && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-neutral-300 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-white">
                    {viewingItem.description}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => dispatch(setViewingItem(null))}
                  className="px-4 py-2 text-neutral-300 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    dispatch(setViewingItem(null));
                    handleEdit(viewingItem);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
