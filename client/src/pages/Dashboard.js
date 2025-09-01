import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { formatUGX } from "../utils/currency";
import dashboardService from "../services/dashboardService";
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package,
  ShoppingCart,
  ChefHat,
  BarChart3,
  Table,
  Utensils,
  Wine,
  Coffee,
  AlertCircle,
  TrendingDown,
  Loader2,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const { currentOutlet } = useSelector((state) => state.outlets);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData(currentOutlet?.id);
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
        // Fallback to mock data for development
        setDashboardData({
          revenue: {
            today: 12500,
            week: 87500,
            month: 325000,
            change: "+12.5%",
          },
          reservations: {
            booked: 45,
            seated: 38,
            noShow: 7,
            rate: "15.6%",
          },
          guests: {
            total: 156,
            new: 23,
            returning: 133,
          },
          tickets: {
            open: 8,
            resolved: 42,
            critical: 2,
          },
          inventory: {
            totalItems: 245,
            lowStock: 12,
            outOfStock: 3,
            expiringSoon: 8,
            totalValue: 45000,
          },
          menu: {
            totalItems: 89,
            available: 76,
            unavailable: 13,
            topSellers: ["Margherita Pizza", "Chicken Wings", "Caesar Salad"],
          },
          tables: {
            total: 24,
            occupied: 18,
            available: 4,
            cleaning: 2,
            reserved: 8,
          },
          staff: {
            total: 15,
            onShift: 12,
            offDuty: 3,
            overtime: 2,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentOutlet?.id]);

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary mx-auto mb-4" />
          <p className="text-text-secondary">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !dashboardData) {
    return (
      <div className="p-6">
        <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-center">
          <AlertCircle className="w-8 h-8 text-error mx-auto mb-2" />
          <p className="text-error font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-error text-white rounded hover:bg-error/80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure dashboardData exists
  if (!dashboardData) {
    return null;
  }

  const getDashboardType = () => {
    if (user?.role === "org_admin") return "executive";
    if (user?.role === "general_manager") return "outlet";
    if (user?.role === "supervisor") return "supervisor";
    return "staff";
  };

  const renderInventoryWidget = () => (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Inventory Status
        </h3>
        <Package className="w-6 h-6 text-accent-primary" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Items</span>
          <span className="font-semibold text-text-primary">
            {dashboardData.inventory.totalItems}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Low Stock</span>
          <span className="font-semibold text-warning">
            {dashboardData.inventory.lowStock}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Out of Stock</span>
          <span className="font-semibold text-error">
            {dashboardData.inventory.outOfStock}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Expiring Soon</span>
          <span className="font-semibold text-warning">
            {dashboardData.inventory.expiringSoon}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Value</span>
          <span className="font-semibold text-success">
            {formatUGX(dashboardData.inventory.totalValue)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderMenuWidget = () => (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Menu Performance
        </h3>
        <Utensils className="w-6 h-6 text-success" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Items</span>
          <span className="font-semibold text-text-primary">
            {dashboardData.menu.totalItems}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Available</span>
          <span className="font-semibold text-success">
            {dashboardData.menu.available}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Unavailable</span>
          <span className="font-semibold text-error">
            {dashboardData.menu.unavailable}
          </span>
        </div>
        <div className="mt-3">
          <span className="text-sm text-text-secondary">Top Sellers:</span>
          <div className="mt-1 space-y-1">
            {dashboardData.menu.topSellers.map((item, index) => (
              <div
                key={index}
                className="text-xs text-text-primary bg-primary-bg-accent px-2 py-1 rounded"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTableStatusWidget = () => (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Table Status
        </h3>
        <Table className="w-6 h-6 text-accent-primary" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Tables</span>
          <span className="font-semibold text-text-primary">
            {dashboardData.tables.total}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Occupied</span>
          <span className="font-semibold text-success">
            {dashboardData.tables.occupied}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Available</span>
          <span className="font-semibold text-accent-primary">
            {dashboardData.tables.available}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Cleaning</span>
          <span className="font-semibold text-warning">
            {dashboardData.tables.cleaning}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Reserved</span>
          <span className="font-semibold text-info">
            {dashboardData.tables.reserved}
          </span>
        </div>
      </div>
    </div>
  );

  const renderStaffStatusWidget = () => (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Staff Status
        </h3>
        <Users className="w-6 h-6 text-accent-primary" />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Total Staff</span>
          <span className="font-semibold text-text-primary">
            {dashboardData.staff.total}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">On Shift</span>
          <span className="font-semibold text-success">
            {dashboardData.staff.onShift}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Off Duty</span>
          <span className="font-semibold text-text-secondary">
            {dashboardData.staff.offDuty}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary">Overtime</span>
          <span className="font-semibold text-warning">
            {dashboardData.staff.overtime}
          </span>
        </div>
      </div>
    </div>
  );

  const renderExecutiveDashboard = () => (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Revenue Today
            </h3>
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatUGX(dashboardData.revenue.today)}
          </div>
          <div className="text-sm text-success">
            {dashboardData.revenue.change} vs yesterday
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Week-to-Date
            </h3>
            <span className="w-6 h-6 text-accent-primary text-2xl font-bold">
              USh
            </span>
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatUGX(dashboardData.revenue.week)}
          </div>
          <div className="text-sm text-text-secondary">
            Current week performance
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Month-to-Date
            </h3>
            <TrendingUp className="w-6 h-6 text-warning" />
          </div>
          <div className="text-3xl font-bold text-text-primary mb-2">
            {formatUGX(dashboardData.revenue.month)}
          </div>
          <div className="text-sm text-text-secondary">MTD vs Last Year</div>
        </div>
      </div>

      {/* Operations Overview */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Reservations
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Booked Today</span>
              <span className="font-semibold text-text-primary">
                {dashboardData.reservations.booked}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Seated</span>
              <span className="font-semibold text-success">
                {dashboardData.reservations.seated}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">No-Show Rate</span>
              <span className="font-semibold text-error">
                {dashboardData.reservations.rate}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Guest Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Total Guests</span>
              <span className="font-semibold text-text-primary">
                {dashboardData.guests.total}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">New Guests</span>
              <span className="font-semibold text-success">
                {dashboardData.guests.new}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Returning</span>
              <span className="font-semibold text-accent-primary">
                {dashboardData.guests.returning}
              </span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Support Tickets
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Open</span>
              <span className="font-semibold text-warning">
                {dashboardData.tickets.open}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Resolved</span>
              <span className="font-semibold text-success">
                {dashboardData.tickets.resolved}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary">Critical</span>
              <span className="font-semibold text-error">
                {dashboardData.tickets.critical}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: Inventory & Operations */}
      <div className="dashboard-grid">
        {renderInventoryWidget()}
        {renderMenuWidget()}
        {renderTableStatusWidget()}
        {renderStaffStatusWidget()}
      </div>
    </div>
  );

  const renderOutletDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">
        Outlet Operations Dashboard
      </h2>
      <p className="text-text-secondary">
        Real-time operations and performance metrics
      </p>

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Today's Operations
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">85%</div>
              <div className="text-sm text-text-secondary">Table Occupancy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent-primary">12</div>
              <div className="text-sm text-text-secondary">Active Staff</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Inventory Alerts
          </h3>
          <div className="space-y-2">
            {dashboardData.inventory.lowStock > 0 && (
              <div className="flex items-center text-warning text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                {dashboardData.inventory.lowStock} items low on stock
              </div>
            )}
            {dashboardData.inventory.outOfStock > 0 && (
              <div className="flex items-center text-error text-sm">
                <XCircle className="w-4 h-4 mr-2" />
                {dashboardData.inventory.outOfStock} items out of stock
              </div>
            )}
            {dashboardData.inventory.expiringSoon > 0 && (
              <div className="flex items-center text-warning text-sm">
                <Clock className="w-4 h-4 mr-2" />
                {dashboardData.inventory.expiringSoon} items expiring soon
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Operations */}
      <div className="dashboard-grid">
        {renderTableStatusWidget()}
        {renderInventoryWidget()}
        {renderMenuWidget()}
        {renderStaffStatusWidget()}
      </div>
    </div>
  );

  const renderSupervisorDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Shift Operations</h2>
      <p className="text-text-secondary">
        Tonight's operations and real-time monitoring
      </p>

      {/* Shift Status */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Current Shift Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Tables Seated</span>
              <span className="font-semibold text-success">24/30</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Wait Time</span>
              <span className="font-semibold text-warning">15 min avg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Active Orders</span>
              <span className="font-semibold text-accent-primary">18</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Kitchen Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Orders Pending</span>
              <span className="font-semibold text-warning">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Prep Time</span>
              <span className="font-semibold text-success">12 min avg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">86'd Items</span>
              <span className="font-semibold text-error">2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="dashboard-card">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Critical Alerts
        </h3>
        <div className="space-y-2">
          {dashboardData.inventory.lowStock > 0 && (
            <div className="flex items-center justify-between p-2 bg-warning/10 border border-warning/20 rounded">
              <span className="text-warning">Low Stock Items</span>
              <span className="text-warning font-semibold">
                {dashboardData.inventory.lowStock}
              </span>
            </div>
          )}
          {dashboardData.inventory.outOfStock > 0 && (
            <div className="flex items-center justify-between p-2 bg-error/10 border border-error/20 rounded">
              <span className="text-error">Out of Stock</span>
              <span className="text-error font-semibold">
                {dashboardData.inventory.outOfStock}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">My Tasks</h2>
      <p className="text-text-secondary">
        Your assigned tasks and responsibilities
      </p>

      {/* Personal Tasks */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Today's Assignments
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Tables Assigned</span>
              <span className="font-semibold text-accent-primary">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Active Orders</span>
              <span className="font-semibold text-warning">5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Guests Served</span>
              <span className="font-semibold text-success">23</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Kitchen Updates
          </h3>
          <div className="space-y-2">
            <div className="text-sm text-text-secondary">
              • Order #1234 ready for pickup
            </div>
            <div className="text-sm text-text-secondary">
              • Caesar Salad 86'd - use Garden Salad instead
            </div>
            <div className="text-sm text-text-secondary">
              • Margherita Pizza - 5 min prep time
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const dashboardType = getDashboardType();

    switch (dashboardType) {
      case "executive":
        return renderExecutiveDashboard();
      case "outlet":
        return renderOutletDashboard();
      case "supervisor":
        return renderSupervisorDashboard();
      case "staff":
        return renderStaffDashboard();
      default:
        return renderStaffDashboard();
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {getDashboardType() === "executive"
            ? "Executive Dashboard"
            : "Dashboard"}
        </h1>
        <p className="text-text-secondary">
          Welcome back, {user?.name || "User"}. Here's what's happening today.
        </p>
      </div>

      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
