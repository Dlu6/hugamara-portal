import React, { useState, useEffect, useMemo } from "react";
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
  Clock,
  ShoppingCart,
  UserCheck,
  AlertTriangle,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Settings,
  FileText,
  Database,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
} from "lucide-react";
import { useToast } from "../components/ui/ToastProvider";
import { reportsAPI } from "../services/apiClient";

// Chart components (you can replace these with your preferred charting library)
const ChartContainer = ({ children, title, className = "" }) => (
  <div className={`bg-neutral-800 p-6 rounded-lg shadow-lg ${className}`}>
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center">{children}</div>
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  subtitle,
}) => (
  <div className="bg-neutral-800 p-6 rounded-lg shadow-lg">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-neutral-400 text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold text-${color}-500 mt-1`}>{value}</p>
        {subtitle && (
          <p className="text-neutral-500 text-xs mt-1">{subtitle}</p>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-2">
            {trend === "up" ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-${color}-500/10`}>
        <Icon className={`h-6 w-6 text-${color}-500`} />
      </div>
    </div>
  </div>
);

const DataTable = ({ data, columns, title, className = "" }) => (
  <div className={`bg-neutral-800 p-6 rounded-lg shadow-lg ${className}`}>
    <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-neutral-700">
          <tr>
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-white font-medium"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-neutral-700">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className="px-4 py-3 text-neutral-300">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

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
  const [chartType, setChartType] = useState("bar");
  const [filters, setFilters] = useState({
    period: "week",
    startDate: "",
    endDate: "",
    groupBy: "day",
    category: "",
    department: "",
    eventType: "",
    status: "",
    outletId: "",
  });
  const { success: showSuccess, error: showError } = useToast();

  // Report types with enhanced metadata
  const reportTypes = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Activity,
      description: "Overview of key metrics and KPIs",
      color: "blue",
    },
    {
      id: "revenue",
      label: "Revenue",
      icon: DollarSign,
      description: "Financial performance and revenue trends",
      color: "green",
    },
    {
      id: "sales",
      label: "Sales",
      icon: TrendingUp,
      description: "Sales performance and product analytics",
      color: "purple",
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: Package,
      description: "Stock levels and inventory management",
      color: "orange",
    },
    {
      id: "staff",
      label: "Staff",
      icon: Users,
      description: "Employee performance and management",
      color: "indigo",
    },
    {
      id: "events",
      label: "Events",
      icon: Calendar,
      description: "Event management and performance",
      color: "pink",
    },
    {
      id: "customers",
      label: "Customers",
      icon: UserCheck,
      description: "Customer analytics and loyalty",
      color: "teal",
    },
  ];

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

  const formatPercentage = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Memoized calculations for better performance
  const dashboardMetrics = useMemo(() => {
    const stats = dashboardStats;
    return [
      {
        title: "Total Orders",
        value: formatNumber(stats.totalOrders || 0),
        icon: ShoppingCart,
        color: "blue",
        trend: stats.ordersTrend,
        trendValue: stats.ordersTrendValue,
        subtitle: "This period",
      },
      {
        title: "Total Revenue",
        value: formatCurrency(stats.totalRevenue || 0),
        icon: DollarSign,
        color: "green",
        trend: stats.revenueTrend,
        trendValue: stats.revenueTrendValue,
        subtitle: "This period",
      },
      {
        title: "Total Reservations",
        value: formatNumber(stats.totalReservations || 0),
        icon: Calendar,
        color: "purple",
        trend: stats.reservationsTrend,
        trendValue: stats.reservationsTrendValue,
        subtitle: "This period",
      },
      {
        title: "Avg Order Value",
        value: formatCurrency(stats.avgOrderValue || 0),
        icon: TrendingUp,
        color: "orange",
        subtitle: "Per order",
      },
      {
        title: "Active Staff",
        value: formatNumber(stats.totalStaff || 0),
        icon: Users,
        color: "indigo",
        subtitle: "Currently active",
      },
      {
        title: "Low Stock Items",
        value: formatNumber(stats.lowStockItems || 0),
        icon: AlertTriangle,
        color: "red",
        subtitle: "Need reorder",
      },
    ];
  }, [dashboardStats]);

  if (loading) {
    return (
      <div className="p-6 bg-neutral-900 text-white min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <div className="text-lg">Loading reports...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-neutral-900 text-white min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-neutral-400 mt-1">
            Comprehensive business insights and analytics dashboard
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
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isActive = activeReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => handleReportChange(report.id)}
                className={`px-4 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  isActive
                    ? `bg-${report.color}-600 text-white`
                    : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                }`}
                title={report.description}
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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {dashboardMetrics.map((metric, index) => (
              <StatCard
                key={index}
                title={metric.title}
                value={metric.value}
                icon={metric.icon}
                color={metric.color}
                trend={metric.trend}
                trendValue={metric.trendValue}
                subtitle={metric.subtitle}
              />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Revenue Trend">
              <div className="text-center text-neutral-400">
                <LineChart className="h-16 w-16 mx-auto mb-2" />
                <p>Revenue trend chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Order Distribution">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Order distribution chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {/* Top Menu Items */}
          {dashboardStats.topMenuItems &&
            dashboardStats.topMenuItems.length > 0 && (
              <DataTable
                title="Top Menu Items"
                data={dashboardStats.topMenuItems}
                columns={[
                  { key: "name", header: "Item Name" },
                  {
                    key: "quantity",
                    header: "Quantity Sold",
                    render: (value) => formatNumber(value),
                  },
                  {
                    key: "revenue",
                    header: "Revenue",
                    render: (value) => formatCurrency(value),
                  },
                  { key: "category", header: "Category" },
                ]}
              />
            )}

          {/* Low Stock Items */}
          {dashboardStats.lowStockItems &&
            dashboardStats.lowStockItems.length > 0 && (
              <DataTable
                title="Low Stock Alert"
                data={dashboardStats.lowStockItems}
                columns={[
                  { key: "itemName", header: "Item Name" },
                  { key: "category", header: "Category" },
                  {
                    key: "currentStock",
                    header: "Current Stock",
                    render: (value, row) => `${value} ${row.unit}`,
                  },
                  {
                    key: "reorderPoint",
                    header: "Reorder Point",
                    render: (value, row) => `${value} ${row.unit}`,
                  },
                  {
                    key: "unitCost",
                    header: "Unit Cost",
                    render: (value) => formatCurrency(value),
                  },
                ]}
              />
            )}
        </div>
      )}

      {/* Revenue Report */}
      {activeReport === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Revenue Trends">
              <div className="text-center text-neutral-400">
                <LineChart className="h-16 w-16 mx-auto mb-2" />
                <p>Revenue trends chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Payment Methods">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Payment methods distribution</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {revenueData.revenueData && revenueData.revenueData.length > 0 && (
            <DataTable
              title="Revenue Data"
              data={revenueData.revenueData}
              columns={[
                { key: "period", header: "Period" },
                {
                  key: "count",
                  header: "Transactions",
                  render: (value) => formatNumber(value),
                },
                {
                  key: "total",
                  header: "Total Revenue",
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "average",
                  header: "Average",
                  render: (value) => formatCurrency(value),
                },
              ]}
            />
          )}

          {revenueData.paymentMethodData &&
            revenueData.paymentMethodData.length > 0 && (
              <DataTable
                title="Payment Methods Breakdown"
                data={revenueData.paymentMethodData}
                columns={[
                  {
                    key: "method",
                    header: "Payment Method",
                    render: (value) => value.replace("_", " ").toUpperCase(),
                  },
                  {
                    key: "count",
                    header: "Transactions",
                    render: (value) => formatNumber(value),
                  },
                  {
                    key: "total",
                    header: "Total Amount",
                    render: (value) => formatCurrency(value),
                  },
                ]}
              />
            )}
        </div>
      )}

      {/* Sales Report */}
      {activeReport === "sales" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Top Selling Items">
              <div className="text-center text-neutral-400">
                <BarChart className="h-16 w-16 mx-auto mb-2" />
                <p>Top selling items chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Sales by Category">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Sales by category chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {salesData.salesData && salesData.salesData.length > 0 && (
            <DataTable
              title="Top Selling Items"
              data={salesData.salesData}
              columns={[
                { key: "name", header: "Item Name" },
                { key: "category", header: "Category" },
                {
                  key: "price",
                  header: "Unit Price",
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "totalQuantity",
                  header: "Quantity Sold",
                  render: (value) => formatNumber(value),
                },
                {
                  key: "totalRevenue",
                  header: "Total Revenue",
                  render: (value) => formatCurrency(value),
                },
              ]}
            />
          )}

          {salesData.categoryData && salesData.categoryData.length > 0 && (
            <DataTable
              title="Sales by Category"
              data={salesData.categoryData}
              columns={[
                {
                  key: "category",
                  header: "Category",
                  render: (value) => value.toUpperCase(),
                },
                {
                  key: "totalQuantity",
                  header: "Items Sold",
                  render: (value) => formatNumber(value),
                },
                {
                  key: "totalRevenue",
                  header: "Total Revenue",
                  render: (value) => formatCurrency(value),
                },
              ]}
            />
          )}
        </div>
      )}

      {/* Inventory Report */}
      {activeReport === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Inventory Overview">
              <div className="text-center text-neutral-400">
                <BarChart className="h-16 w-16 mx-auto mb-2" />
                <p>Inventory overview chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Stock Levels by Category">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Stock levels by category</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {inventoryData.inventoryData &&
            inventoryData.inventoryData.length > 0 && (
              <DataTable
                title="Inventory Items"
                data={inventoryData.inventoryData}
                columns={[
                  { key: "itemName", header: "Item Name" },
                  {
                    key: "category",
                    header: "Category",
                    render: (value) => value.toUpperCase(),
                  },
                  {
                    key: "currentStock",
                    header: "Current Stock",
                    render: (value, row) => `${value} ${row.unit}`,
                  },
                  {
                    key: "reorderPoint",
                    header: "Reorder Point",
                    render: (value, row) => `${value} ${row.unit}`,
                  },
                  {
                    key: "unitCost",
                    header: "Unit Cost",
                    render: (value) => formatCurrency(value),
                  },
                  { key: "location", header: "Location" },
                ]}
              />
            )}

          {inventoryData.categorySummary &&
            inventoryData.categorySummary.length > 0 && (
              <DataTable
                title="Inventory by Category"
                data={inventoryData.categorySummary}
                columns={[
                  {
                    key: "category",
                    header: "Category",
                    render: (value) => value.toUpperCase(),
                  },
                  {
                    key: "count",
                    header: "Items",
                    render: (value) => formatNumber(value),
                  },
                  {
                    key: "totalValue",
                    header: "Total Value",
                    render: (value) => formatCurrency(value),
                  },
                ]}
              />
            )}
        </div>
      )}

      {/* Staff Report */}
      {activeReport === "staff" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Staff by Department">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Staff by department chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Performance Distribution">
              <div className="text-center text-neutral-400">
                <BarChart className="h-16 w-16 mx-auto mb-2" />
                <p>Performance distribution chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {staffData.staffData && staffData.staffData.length > 0 && (
            <DataTable
              title="Staff Overview"
              data={staffData.staffData}
              columns={[
                { key: "employeeId", header: "Employee ID" },
                { key: "position", header: "Position" },
                {
                  key: "department",
                  header: "Department",
                  render: (value) => value.replace("_", " ").toUpperCase(),
                },
                {
                  key: "hireDate",
                  header: "Hire Date",
                  render: (value) => new Date(value).toLocaleDateString(),
                },
                {
                  key: "performanceRating",
                  header: "Performance",
                  render: (value) => value || "N/A",
                },
                {
                  key: "isActive",
                  header: "Status",
                  render: (value) => (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value
                          ? "text-green-500 bg-green-900/20"
                          : "text-red-500 bg-red-900/20"
                      }`}
                    >
                      {value ? "Active" : "Inactive"}
                    </span>
                  ),
                },
              ]}
            />
          )}

          {staffData.departmentSummary &&
            staffData.departmentSummary.length > 0 && (
              <DataTable
                title="Staff by Department"
                data={staffData.departmentSummary}
                columns={[
                  {
                    key: "department",
                    header: "Department",
                    render: (value) => value.replace("_", " ").toUpperCase(),
                  },
                  {
                    key: "count",
                    header: "Staff Members",
                    render: (value) => formatNumber(value),
                  },
                  {
                    key: "avgPerformance",
                    header: "Avg Performance",
                    render: (value) => value.toFixed(1),
                  },
                ]}
              />
            )}
        </div>
      )}

      {/* Event Report */}
      {activeReport === "events" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Events by Type">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Events by type chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Event Revenue Trends">
              <div className="text-center text-neutral-400">
                <LineChart className="h-16 w-16 mx-auto mb-2" />
                <p>Event revenue trends</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {eventData.eventData && eventData.eventData.length > 0 && (
            <DataTable
              title="Events Overview"
              data={eventData.eventData}
              columns={[
                { key: "title", header: "Event Title" },
                {
                  key: "eventType",
                  header: "Type",
                  render: (value) => value.replace("_", " ").toUpperCase(),
                },
                {
                  key: "startDate",
                  header: "Date",
                  render: (value) => new Date(value).toLocaleDateString(),
                },
                {
                  key: "actualAttendance",
                  header: "Attendance",
                  render: (value, row) =>
                    `${value || 0} / ${row.capacity || "N/A"}`,
                },
                {
                  key: "revenue",
                  header: "Revenue",
                  render: (value) => formatCurrency(value || 0),
                },
                {
                  key: "status",
                  header: "Status",
                  render: (value) => (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        value === "completed"
                          ? "text-green-500 bg-green-900/20"
                          : value === "active"
                          ? "text-blue-500 bg-blue-900/20"
                          : value === "cancelled"
                          ? "text-red-500 bg-red-900/20"
                          : "text-gray-500 bg-gray-900/20"
                      }`}
                    >
                      {value.toUpperCase()}
                    </span>
                  ),
                },
              ]}
            />
          )}

          {eventData.typeSummary && eventData.typeSummary.length > 0 && (
            <DataTable
              title="Events by Type"
              data={eventData.typeSummary}
              columns={[
                {
                  key: "eventType",
                  header: "Event Type",
                  render: (value) => value.replace("_", " ").toUpperCase(),
                },
                {
                  key: "count",
                  header: "Events",
                  render: (value) => formatNumber(value),
                },
                {
                  key: "totalRevenue",
                  header: "Total Revenue",
                  render: (value) => formatCurrency(value),
                },
                {
                  key: "avgAttendance",
                  header: "Avg Attendance",
                  render: (value) => formatNumber(value),
                },
              ]}
            />
          )}
        </div>
      )}

      {/* Customer Report */}
      {activeReport === "customers" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartContainer title="Customer Loyalty Tiers">
              <div className="text-center text-neutral-400">
                <PieChart className="h-16 w-16 mx-auto mb-2" />
                <p>Customer loyalty tiers chart</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>

            <ChartContainer title="Customer Spending Trends">
              <div className="text-center text-neutral-400">
                <LineChart className="h-16 w-16 mx-auto mb-2" />
                <p>Customer spending trends</p>
                <p className="text-xs mt-1">Data from backend API</p>
              </div>
            </ChartContainer>
          </div>

          {customerData.customerStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Customers"
                value={formatNumber(customerData.customerStats.totalCustomers)}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Avg Visits"
                value={customerData.customerStats.avgVisits.toFixed(1)}
                icon={Target}
                color="green"
              />
              <StatCard
                title="Avg Spent"
                value={formatCurrency(customerData.customerStats.avgSpent)}
                icon={DollarSign}
                color="purple"
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(customerData.customerStats.totalRevenue)}
                icon={TrendingUp}
                color="orange"
              />
            </div>
          )}

          {customerData.topCustomers &&
            customerData.topCustomers.length > 0 && (
              <DataTable
                title="Top Customers"
                data={customerData.topCustomers}
                columns={[
                  {
                    key: "firstName",
                    header: "Name",
                    render: (value, row) => `${value} ${row.lastName}`,
                  },
                  { key: "email", header: "Email" },
                  {
                    key: "totalSpent",
                    header: "Total Spent",
                    render: (value) => formatCurrency(value),
                  },
                  {
                    key: "totalVisits",
                    header: "Visits",
                    render: (value) => formatNumber(value),
                  },
                ]}
              />
            )}
        </div>
      )}
    </div>
  );
};

export default Reports;
