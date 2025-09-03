import React, { useState, useEffect } from "react";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Filter,
  Download,
  Upload,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import { inventoryAPI } from "../services/apiClient";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState({
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
    expiryDate: "",
    isPerishable: false,
    location: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [stockUpdateModal, setStockUpdateModal] = useState(null);
  const [stockUpdateData, setStockUpdateData] = useState({
    quantity: "",
    type: "add",
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchInventory();
    fetchStats();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter === "lowStock") params.append("lowStock", "true");
      if (statusFilter === "expired") params.append("expired", "true");

      const response = await inventoryAPI.getAll(params.toString());
      setInventory(response.inventory || []);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
      showError(
        "Failed to fetch inventory",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await inventoryAPI.getStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error("Failed to fetch inventory stats:", error);
    }
  };

  const resetForm = () => {
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
      expiryDate: "",
      isPerishable: false,
      location: "",
      notes: "",
    });
    setFormErrors({});
    setEditingItem(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditModal = (item) => {
    setFormData({
      itemName: item.itemName || "",
      category: item.category || "food",
      subcategory: item.subcategory || "",
      sku: item.sku || "",
      barcode: item.barcode || "",
      description: item.description || "",
      unit: item.unit || "piece",
      currentStock: item.currentStock || 0,
      minimumStock: item.minimumStock || 0,
      maximumStock: item.maximumStock || 0,
      reorderPoint: item.reorderPoint || 0,
      unitCost: item.unitCost || 0,
      supplierName: item.supplierName || "",
      leadTime: item.leadTime || 0,
      expiryDate: item.expiryDate ? item.expiryDate.split("T")[0] : "",
      isPerishable: item.isPerishable || false,
      location: item.location || "",
      notes: item.notes || "",
    });
    setEditingItem(item);
    setShowForm(true);
  };

  const openViewModal = (item) => {
    setViewingItem(item);
  };

  const openStockUpdateModal = (item) => {
    setStockUpdateModal(item);
    setStockUpdateData({ quantity: "", type: "add" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormErrors({});

      if (editingItem) {
        await inventoryAPI.update(editingItem.id, formData);
        showSuccess("Inventory item updated successfully");
      } else {
        await inventoryAPI.create(formData);
        showSuccess("Inventory item created successfully");
      }

      setShowForm(false);
      resetForm();
      fetchInventory();
      fetchStats();
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      if (error?.response?.data?.details) {
        const errors = {};
        error.response.data.details.forEach((detail) => {
          errors[detail.field] = detail.message;
        });
        setFormErrors(errors);
      } else {
        showError(
          "Failed to save inventory item",
          error?.response?.data?.message || ""
        );
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inventory item?"))
      return;

    try {
      await inventoryAPI.delete(id);
      showSuccess("Inventory item deleted successfully");
      fetchInventory();
      fetchStats();
    } catch (error) {
      console.error("Failed to delete inventory item:", error);
      showError(
        "Failed to delete inventory item",
        error?.response?.data?.message || ""
      );
    }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.updateStock(stockUpdateModal.id, stockUpdateData);
      showSuccess("Stock updated successfully");
      setStockUpdateModal(null);
      fetchInventory();
      fetchStats();
    } catch (error) {
      console.error("Failed to update stock:", error);
      showError("Failed to update stock", error?.response?.data?.message || "");
    }
  };

  const getStatusColor = (item) => {
    if (item.currentStock <= 0) return "text-red-500 bg-red-900/20";
    if (item.currentStock <= item.reorderPoint)
      return "text-amber-500 bg-amber-900/20";
    if (item.isPerishable && item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate - now) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 0) return "text-red-500 bg-red-900/20";
      if (daysUntilExpiry <= 7) return "text-orange-500 bg-orange-900/20";
    }
    return "text-green-500 bg-green-900/20";
  };

  const getStatusText = (item) => {
    if (item.currentStock <= 0) return "Out of Stock";
    if (item.currentStock <= item.reorderPoint) return "Low Stock";
    if (item.isPerishable && item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const now = new Date();
      const daysUntilExpiry = Math.ceil(
        (expiryDate - now) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 0) return "Expired";
      if (daysUntilExpiry <= 7) return "Expiring Soon";
    }
    return "In Stock";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredInventory = inventory.filter((item) => {
    if (statusFilter === "lowStock" && item.currentStock > item.reorderPoint)
      return false;
    if (statusFilter === "expired" && item.isPerishable && item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const now = new Date();
      return expiryDate > now;
    }
    return true;
  });

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Inventory Management
          </h1>
          <p className="text-neutral-400 mt-1">
            Manage your inventory items, stock levels, and alerts
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-white">
                {stats.totalItems || 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Low Stock</p>
              <p className="text-2xl font-bold text-amber-500">
                {stats.lowStockCount || 0}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-500">
                {stats.outOfStockCount || 0}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats.expiringCount || 0}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(stats.totalValue || 0)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
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
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg w-full text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="food">Food</option>
            <option value="beverage">Beverage</option>
            <option value="alcohol">Alcohol</option>
            <option value="cleaning">Cleaning</option>
            <option value="packaging">Packaging</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="lowStock">Low Stock</option>
            <option value="expired">Expired</option>
          </select>

          <button
            onClick={fetchInventory}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-neutral-800 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Item
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-white font-medium">
                  Unit Cost
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
              {filteredInventory.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-neutral-700 hover:bg-neutral-750"
                >
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-white">
                        {item.itemName}
                      </div>
                      {item.sku && (
                        <div className="text-sm text-neutral-400">
                          SKU: {item.sku}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize text-neutral-300">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white">
                      {item.currentStock} {item.unit}
                    </div>
                    <div className="text-sm text-neutral-400">
                      Reorder: {item.reorderPoint}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {item.unitCost ? formatCurrency(item.unitCost) : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item
                      )}`}
                    >
                      {getStatusText(item)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openViewModal(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Edit Item"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openStockUpdateModal(item)}
                        className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Update Stock"
                      >
                        <TrendingUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-sm transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
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
                {editingItem ? "Edit Inventory Item" : "Add Inventory Item"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) =>
                        setFormData({ ...formData, itemName: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.itemName
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.itemName && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.itemName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.category
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                    >
                      <option value="food">Food</option>
                      <option value="beverage">Beverage</option>
                      <option value="alcohol">Alcohol</option>
                      <option value="cleaning">Cleaning</option>
                      <option value="packaging">Packaging</option>
                      <option value="equipment">Equipment</option>
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
                      SKU
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.unit
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      required
                    />
                    {formErrors.unit && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.unit}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Current Stock *
                    </label>
                    <input
                      type="number"
                      value={formData.currentStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currentStock: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.currentStock
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      min="0"
                      step="0.1"
                      required
                    />
                    {formErrors.currentStock && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.currentStock}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Reorder Point *
                    </label>
                    <input
                      type="number"
                      value={formData.reorderPoint}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          reorderPoint: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={`w-full p-2 bg-neutral-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.reorderPoint
                          ? "border-red-500"
                          : "border-neutral-600"
                      }`}
                      min="0"
                      step="0.1"
                      required
                    />
                    {formErrors.reorderPoint && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.reorderPoint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Unit Cost (UGX)
                    </label>
                    <input
                      type="number"
                      value={formData.unitCost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unitCost: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Supplier
                    </label>
                    <input
                      type="text"
                      value={formData.supplierName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          supplierName: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPerishable"
                    checked={formData.isPerishable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isPerishable: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <label htmlFor="isPerishable" className="text-neutral-300">
                    Perishable Item
                  </label>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {editingItem ? "Update Item" : "Add Item"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
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

      {/* Stock Update Modal */}
      {stockUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96">
            <h2 className="text-lg font-bold text-white mb-4">
              Update Stock - {stockUpdateModal.itemName}
            </h2>
            <form onSubmit={handleStockUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Current Stock
                  </label>
                  <div className="text-white font-medium">
                    {stockUpdateModal.currentStock} {stockUpdateModal.unit}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Operation
                  </label>
                  <select
                    value={stockUpdateData.type}
                    onChange={(e) =>
                      setStockUpdateData({
                        ...stockUpdateData,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="add">Add Stock</option>
                    <option value="subtract">Subtract Stock</option>
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
                    className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => setStockUpdateModal(null)}
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
      {viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-4">
              Item Details - {viewingItem.itemName}
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-neutral-400">Category:</span>
                <span className="text-white ml-2 capitalize">
                  {viewingItem.category}
                </span>
              </div>
              {viewingItem.sku && (
                <div>
                  <span className="text-neutral-400">SKU:</span>
                  <span className="text-white ml-2">{viewingItem.sku}</span>
                </div>
              )}
              <div>
                <span className="text-neutral-400">Current Stock:</span>
                <span className="text-white ml-2">
                  {viewingItem.currentStock} {viewingItem.unit}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Reorder Point:</span>
                <span className="text-white ml-2">
                  {viewingItem.reorderPoint} {viewingItem.unit}
                </span>
              </div>
              {viewingItem.unitCost && (
                <div>
                  <span className="text-neutral-400">Unit Cost:</span>
                  <span className="text-white ml-2">
                    {formatCurrency(viewingItem.unitCost)}
                  </span>
                </div>
              )}
              {viewingItem.supplierName && (
                <div>
                  <span className="text-neutral-400">Supplier:</span>
                  <span className="text-white ml-2">
                    {viewingItem.supplierName}
                  </span>
                </div>
              )}
              {viewingItem.location && (
                <div>
                  <span className="text-neutral-400">Location:</span>
                  <span className="text-white ml-2">
                    {viewingItem.location}
                  </span>
                </div>
              )}
              {viewingItem.expiryDate && (
                <div>
                  <span className="text-neutral-400">Expiry Date:</span>
                  <span className="text-white ml-2">
                    {new Date(viewingItem.expiryDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {viewingItem.description && (
                <div>
                  <span className="text-neutral-400">Description:</span>
                  <p className="text-white mt-1">{viewingItem.description}</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setViewingItem(null)}
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

export default Inventory;
