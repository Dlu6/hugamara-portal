import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import { reportsAPI } from "../services/apiClient";

const Reports = () => {
  const [dashboardStats, setDashboardStats] = useState({});
  const [revenueData, setRevenueData] = useState({});
  const [salesData, setSalesData] = useState({});
  const [inventoryData, setInventoryData] = useState({});
  const [staffData, setStaffData] = useState({});
  const [eventData, setEventData] = useState({});
  const [customerData, setCustomerData] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState("dashboard");
  const [filters, setFilters] = useState({
    period: "week",
    startDate: "",
    endDate: "",
    groupBy: "day",
    category: "",
    department: "",
    eventType: "",
    status: "",
  });
  const { success: showSuccess, error: showError } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, [filters.period]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboard(filters.period);
      setDashboardStats(response.stats || {});
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      showError(
        "Failed to fetch dashboard stats",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.groupBy) params.append("groupBy", filters.groupBy);

      const response = await reportsAPI.getRevenue(params.toString());
      setRevenueData(response || {});
    } catch (error) {
      console.error("Failed to fetch revenue report:", error);
      showError(
        "Failed to fetch revenue report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.category) params.append("category", filters.category);

      const response = await reportsAPI.getSales(params.toString());
      setSalesData(response || {});
    } catch (error) {
      console.error("Failed to fetch sales report:", error);
      showError(
        "Failed to fetch sales report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.lowStock) params.append("lowStock", filters.lowStock);

      const response = await reportsAPI.getInventory(params.toString());
      setInventoryData(response || {});
    } catch (error) {
      console.error("Failed to fetch inventory report:", error);
      showError(
        "Failed to fetch inventory report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.isActive) params.append("isActive", filters.isActive);

      const response = await reportsAPI.getStaff(params.toString());
      setStaffData(response || {});
    } catch (error) {
      console.error("Failed to fetch staff report:", error);
      showError(
        "Failed to fetch staff report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchEventReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.eventType) params.append("eventType", filters.eventType);
      if (filters.status) params.append("status", filters.status);

      const response = await reportsAPI.getEvents(params.toString());
      setEventData(response || {});
    } catch (error) {
      console.error("Failed to fetch event report:", error);
      showError(
        "Failed to fetch event report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await reportsAPI.getCustomers(params.toString());
      setCustomerData(response || {});
    } catch (error) {
      console.error("Failed to fetch customer report:", error);
      showError(
        "Failed to fetch customer report",
        error?.response?.data?.message || ""
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (reportType) => {
    setActiveReport(reportType);

    switch (reportType) {
      case "revenue":
        fetchRevenueReport();
        break;
      case "sales":
        fetchSalesReport();
        break;
      case "inventory":
        fetchInventoryReport();
        break;
      case "staff":
        fetchStaffReport();
        break;
      case "events":
        fetchEventReport();
        break;
      case "customers":
        fetchCustomerReport();
        break;
      default:
        fetchDashboardStats();
    }
  };

  const handleExport = async (format = "csv") => {
    try {
      const params = new URLSearchParams();
      params.append("reportType", activeReport);
      params.append("format", format);

      // Add current filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await reportsAPI.export(params.toString());

      if (format === "csv") {
        // Handle CSV download
        const blob = new Blob([response], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${activeReport}_report.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      showSuccess("Report exported successfully");
    } catch (error) {
      console.error("Failed to export report:", error);
      showError(
        "Failed to export report",
        error?.response?.data?.message || ""
      );
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("en-US").format(number);
  };

  const getReportIcon = (reportType) => {
    const icons = {
      dashboard: Activity,
      revenue: DollarSign,
      sales: TrendingUp,
      inventory: Package,
      staff: Users,
      events: Calendar,
      customers: Users,
    };
    const Icon = icons[reportType] || BarChart3;
    return <Icon className="h-4 w-4" />;
  };

  if (loading)
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading reports...</div>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-neutral-400 mt-1">
            Comprehensive business insights and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleExport("csv")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("json")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: Activity },
            { id: "revenue", label: "Revenue", icon: DollarSign },
            { id: "sales", label: "Sales", icon: TrendingUp },
            { id: "inventory", label: "Inventory", icon: Package },
            { id: "staff", label: "Staff", icon: Users },
            { id: "events", label: "Events", icon: Calendar },
            { id: "customers", label: "Customers", icon: Users },
          ].map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => handleReportChange(report.id)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  activeReport === report.id
                    ? "bg-blue-600 text-white"
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-neutral-800 p-4 rounded-lg shadow-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Period
            </label>
            <select
              value={filters.period}
              onChange={(e) =>
                setFilters({ ...filters, period: e.target.value })
              }
              className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Group By
            </label>
            <select
              value={filters.groupBy}
              onChange={(e) =>
                setFilters({ ...filters, groupBy: e.target.value })
              }
              className="px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hour">Hour</option>
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <button
            onClick={() => handleReportChange(activeReport)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mt-6"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {activeReport === "dashboard" && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(dashboardStats.totalOrders || 0)}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(dashboardStats.totalRevenue || 0)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Reservations</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {formatNumber(dashboardStats.totalReservations || 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-neutral-800 p-4 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Avg Order Value</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {formatCurrency(dashboardStats.avgOrderValue || 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Top Menu Items */}
          {dashboardStats.topMenuItems &&
            dashboardStats.topMenuItems.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Top Menu Items
                </h3>
                <div className="space-y-3">
                  {dashboardStats.topMenuItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-neutral-400 text-sm">
                            Quantity: {formatNumber(item.quantity)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-bold">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Low Stock Items */}
          {dashboardStats.lowStockItems &&
            dashboardStats.lowStockItems.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Low Stock Alert
                </h3>
                <div className="space-y-3">
                  {dashboardStats.lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium">
                          {item.itemName}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {item.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-500 font-bold">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          Reorder: {item.reorderPoint}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Revenue Report */}
      {activeReport === "revenue" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Revenue Trends
            </h3>
            {revenueData.revenueData && revenueData.revenueData.length > 0 ? (
              <div className="space-y-3">
                {revenueData.revenueData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{item.period}</p>
                      <p className="text-neutral-400 text-sm">
                        {formatNumber(item.count)} payments
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">
                        {formatCurrency(item.total)}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Avg: {formatCurrency(item.average)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400">
                No revenue data available for the selected period.
              </p>
            )}
          </div>

          {revenueData.paymentMethodData &&
            revenueData.paymentMethodData.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {revenueData.paymentMethodData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium capitalize">
                          {item.method.replace("_", " ")}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {formatNumber(item.count)} transactions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-bold">
                          {formatCurrency(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Sales Report */}
      {activeReport === "sales" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Top Selling Items
            </h3>
            {salesData.salesData && salesData.salesData.length > 0 ? (
              <div className="space-y-3">
                {salesData.salesData.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-blue-500">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-neutral-400 text-sm">
                          {item.category} • {formatCurrency(item.price)} each
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Qty: {formatNumber(item.totalQuantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400">
                No sales data available for the selected period.
              </p>
            )}
          </div>

          {salesData.categoryData && salesData.categoryData.length > 0 && (
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">
                Sales by Category
              </h3>
              <div className="space-y-3">
                {salesData.categoryData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium capitalize">
                        {item.category}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {formatNumber(item.totalQuantity)} items sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory Report */}
      {activeReport === "inventory" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Inventory Overview
            </h3>
            {inventoryData.inventoryData &&
            inventoryData.inventoryData.length > 0 ? (
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
                        Reorder Point
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Unit Cost
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.inventoryData.map((item) => (
                      <tr key={item.id} className="border-t border-neutral-700">
                        <td className="px-4 py-3 text-white">
                          {item.itemName}
                        </td>
                        <td className="px-4 py-3 text-neutral-300 capitalize">
                          {item.category}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {item.reorderPoint} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {formatCurrency(item.unitCost || 0)}
                        </td>
                        <td className="px-4 py-3 text-neutral-300">
                          {item.location || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400">No inventory data available.</p>
            )}
          </div>

          {inventoryData.categorySummary &&
            inventoryData.categorySummary.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Inventory by Category
                </h3>
                <div className="space-y-3">
                  {inventoryData.categorySummary.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium capitalize">
                          {item.category}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {formatNumber(item.count)} items
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-bold">
                          {formatCurrency(item.totalValue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Staff Report */}
      {activeReport === "staff" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Staff Overview
            </h3>
            {staffData.staffData && staffData.staffData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Department
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Hire Date
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Performance
                      </th>
                      <th className="px-4 py-3 text-left text-white font-medium">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffData.staffData.map((staff) => (
                      <tr
                        key={staff.id}
                        className="border-t border-neutral-700"
                      >
                        <td className="px-4 py-3 text-white">
                          {staff.employeeId}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {staff.position}
                        </td>
                        <td className="px-4 py-3 text-neutral-300 capitalize">
                          {staff.department.replace("_", " ")}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {new Date(staff.hireDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {staff.performanceRating || "N/A"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              staff.isActive
                                ? "text-green-500 bg-green-900/20"
                                : "text-red-500 bg-red-900/20"
                            }`}
                          >
                            {staff.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-neutral-400">No staff data available.</p>
            )}
          </div>

          {staffData.departmentSummary &&
            staffData.departmentSummary.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Staff by Department
                </h3>
                <div className="space-y-3">
                  {staffData.departmentSummary.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                    >
                      <div>
                        <p className="text-white font-medium capitalize">
                          {item.department.replace("_", " ")}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {formatNumber(item.count)} staff members
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-500 font-bold">
                          Avg: {item.avgPerformance.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Event Report */}
      {activeReport === "events" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Events Overview
            </h3>
            {eventData.eventData && eventData.eventData.length > 0 ? (
              <div className="space-y-3">
                {eventData.eventData.map((event) => (
                  <div key={event.id} className="p-4 bg-neutral-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.status === "completed"
                            ? "text-green-500 bg-green-900/20"
                            : event.status === "active"
                            ? "text-blue-500 bg-blue-900/20"
                            : event.status === "cancelled"
                            ? "text-red-500 bg-red-900/20"
                            : "text-gray-500 bg-gray-900/20"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-400">Date</p>
                        <p className="text-white">
                          {new Date(event.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Attendance</p>
                        <p className="text-white">
                          {event.actualAttendance || 0} /{" "}
                          {event.capacity || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Revenue</p>
                        <p className="text-white">
                          {formatCurrency(event.revenue || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-400">Type</p>
                        <p className="text-white capitalize">
                          {event.eventType.replace("_", " ")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-400">
                No event data available for the selected period.
              </p>
            )}
          </div>

          {eventData.typeSummary && eventData.typeSummary.length > 0 && (
            <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">
                Events by Type
              </h3>
              <div className="space-y-3">
                {eventData.typeSummary.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium capitalize">
                        {item.eventType.replace("_", " ")}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        {formatNumber(item.count)} events
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-bold">
                        {formatCurrency(item.totalRevenue)}
                      </p>
                      <p className="text-neutral-400 text-sm">
                        Avg: {formatNumber(item.avgAttendance)} attendees
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer Report */}
      {activeReport === "customers" && (
        <div className="space-y-6">
          <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
              Customer Statistics
            </h3>
            {customerData.customerStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <p className="text-neutral-400 text-sm">Total Customers</p>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(customerData.customerStats.totalCustomers)}
                  </p>
                </div>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <p className="text-neutral-400 text-sm">Avg Visits</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {customerData.customerStats.avgVisits.toFixed(1)}
                  </p>
                </div>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <p className="text-neutral-400 text-sm">Avg Spent</p>
                  <p className="text-2xl font-bold text-green-500">
                    {formatCurrency(customerData.customerStats.avgSpent)}
                  </p>
                </div>
                <div className="bg-neutral-700 p-4 rounded-lg">
                  <p className="text-neutral-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {formatCurrency(customerData.customerStats.totalRevenue)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {customerData.topCustomers &&
            customerData.topCustomers.length > 0 && (
              <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4">
                  Top Customers
                </h3>
                <div className="space-y-3">
                  {customerData.topCustomers.map((customer, index) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-500">
                          #{index + 1}
                        </span>
                        <div>
                          <p className="text-white font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-neutral-400 text-sm">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-500 font-bold">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                        <p className="text-neutral-400 text-sm">
                          {formatNumber(customer.totalVisits)} visits
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Reports;
