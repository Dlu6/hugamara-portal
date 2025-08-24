import React, { useState } from "react";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { formatUGX, getUGXSymbol } from "../utils/currency";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock inventory data
  const inventoryData = {
    overview: {
      totalItems: 245,
      totalValue: 45000,
      lowStock: 12,
      outOfStock: 3,
      expiringSoon: 8,
      recentlyAdded: 15,
    },
    items: [
      {
        id: 1,
        name: "Chicken Breast",
        category: "food",
        subcategory: "protein",
        currentStock: 25.5,
        unit: "kg",
        unitCost: 8.5,
        reorderPoint: 20,
        supplier: "Fresh Foods Ltd",
        lastUpdated: "2024-01-15",
        status: "normal",
      },
      {
        id: 2,
        name: "Tomatoes",
        category: "food",
        subcategory: "vegetables",
        currentStock: 8.2,
        unit: "kg",
        unitCost: 3.2,
        reorderPoint: 15,
        supplier: "Local Market",
        lastUpdated: "2024-01-14",
        status: "low",
      },
      {
        id: 3,
        name: "Red Wine",
        category: "alcohol",
        subcategory: "wine",
        currentStock: 0,
        unit: "bottles",
        unitCost: 25.0,
        reorderPoint: 10,
        supplier: "Wine Importers",
        lastUpdated: "2024-01-10",
        status: "out",
      },
      {
        id: 4,
        name: "Olive Oil",
        category: "food",
        subcategory: "pantry",
        currentStock: 12.8,
        unit: "liters",
        unitCost: 15.0,
        reorderPoint: 8,
        supplier: "Mediterranean Foods",
        lastUpdated: "2024-01-13",
        status: "normal",
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "normal":
        return "text-success";
      case "low":
        return "text-warning";
      case "out":
        return "text-error";
      default:
        return "text-text-secondary";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "low":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "out":
        return <XCircle className="w-4 h-4 text-error" />;
      default:
        return <Package className="w-4 h-4 text-text-secondary" />;
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Total Inventory
            </h3>
            <Package className="w-6 h-6 text-accent-primary" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {inventoryData.overview.totalItems}
          </div>
          <div className="text-sm text-text-secondary">Items in stock</div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Total Value
            </h3>
            <span className="w-6 h-6 text-success text-2xl font-bold">USh</span>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatUGX(inventoryData.overview.totalValue)}
          </div>
          <div className="text-sm text-text-secondary">Current stock value</div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Low Stock
            </h3>
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="text-3xl font-bold text-warning mb-2">
            {inventoryData.overview.lowStock}
          </div>
          <div className="text-sm text-text-secondary">
            Items below reorder point
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Out of Stock
            </h3>
            <XCircle className="w-6 h-6 text-error" />
          </div>
          <div className="text-3xl font-bold text-error mb-2">
            {inventoryData.overview.outOfStock}
          </div>
          <div className="text-sm text-text-secondary">Items unavailable</div>
        </div>
      </div>

      {/* Alerts */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Critical Alerts
        </h3>
        <div className="space-y-3">
          {inventoryData.overview.lowStock > 0 && (
            <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-warning mr-3" />
                <span className="text-warning font-medium">
                  Low Stock Items
                </span>
              </div>
              <span className="text-warning font-semibold">
                {inventoryData.overview.lowStock} items
              </span>
            </div>
          )}
          {inventoryData.overview.outOfStock > 0 && (
            <div className="flex items-center justify-between p-3 bg-error/10 border border-error/20 rounded">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-error mr-3" />
                <span className="text-error font-medium">
                  Out of Stock Items
                </span>
              </div>
              <span className="text-error font-semibold">
                {inventoryData.overview.outOfStock} items
              </span>
            </div>
          )}
          {inventoryData.overview.expiringSoon > 0 && (
            <div className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-warning mr-3" />
                <span className="text-warning font-medium">
                  Items Expiring Soon
                </span>
              </div>
              <span className="text-warning font-semibold">
                {inventoryData.overview.expiringSoon} items
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderItemsTab = () => (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Search inventory items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-primary-bg-secondary border border-border text-text-primary rounded-md focus:outline-none focus:border-accent-primary"
        >
          <option value="all">All Categories</option>
          <option value="food">Food</option>
          <option value="beverage">Beverage</option>
          <option value="alcohol">Alcohol</option>
          <option value="cleaning">Cleaning</option>
          <option value="packaging">Packaging</option>
        </select>
        <button className="px-4 py-2 bg-accent-primary text-white rounded-md hover:bg-accent-primary/90 transition-colors">
          <Plus className="w-4 h-4 mr-2 inline" />
          Add Item
        </button>
      </div>

      {/* Inventory Table */}
      <div className="dashboard-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary">
            Inventory Items
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent rounded">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 text-text-secondary hover:text-text-primary hover:bg-primary-bg-accent rounded">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-text-secondary font-medium">
                  Item
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Category
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Stock
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Unit Cost
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Status
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Supplier
                </th>
                <th className="text-left p-3 text-text-secondary font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border hover:bg-primary-bg-accent"
                >
                  <td className="p-3">
                    <div>
                      <div className="font-medium text-text-primary">
                        {item.name}
                      </div>
                      <div className="text-sm text-text-secondary">
                        {item.subcategory}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="capitalize text-text-primary">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <span
                        className={`font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.currentStock} {item.unit}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary">
                      {formatUGX(item.unitCost)}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center">
                      {getStatusIcon(item.status)}
                      <span
                        className={`ml-2 capitalize ${getStatusColor(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-text-primary">{item.supplier}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-text-secondary hover:text-accent-primary hover:bg-primary-bg-accent rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-text-secondary hover:text-accent-primary hover:bg-primary-bg-accent rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-text-secondary hover:text-error hover:bg-primary-bg-accent rounded">
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
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Inventory Management
        </h1>
        <p className="text-text-secondary">
          Monitor stock levels, track costs, and manage suppliers
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("items")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "items"
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            Items
          </button>
          <button
            onClick={() => setActiveTab("suppliers")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "suppliers"
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            Suppliers
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reports"
                ? "border-accent-primary text-accent-primary"
                : "border-transparent text-text-secondary hover:text-text-primary hover:border-border"
            }`}
          >
            Reports
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverviewTab()}
      {activeTab === "items" && renderItemsTab()}
      {activeTab === "suppliers" && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Suppliers
          </h3>
          <p className="text-text-secondary">
            Supplier management coming soon...
          </p>
        </div>
      )}
      {activeTab === "reports" && (
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Reports
          </h3>
          <p className="text-text-secondary">
            Inventory reports coming soon...
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
