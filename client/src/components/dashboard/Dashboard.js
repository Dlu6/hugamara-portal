import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  BarChart3,
  Users,
  ShoppingCart,
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Table as TableIcon,
} from "lucide-react";
import { formatCurrency } from "../../utils/currency";
import { dashboardAPI } from "../../services/apiClient";
import UnifiedLayout from "../layout/UnifiedLayout";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState({
    recentOrders: [],
    recentReservations: [],
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topMenuItems, setTopMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState("week");

  useEffect(() => {
    fetchDashboardData();
  }, [revenuePeriod]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getActivity(),
      ]);

      setStats(statsRes.data.stats || statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color = "blue",
    trend,
    subtitle,
  }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {trend && (
          <div
            className={`text-sm ${
              trend > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend > 0 ? "+" : ""}
            {trend}%
          </div>
        )}
      </div>
    </div>
  );

  const SimpleChart = ({ data, period }) => {
    const maxRevenue = Math.max(...data.map((d) => d.revenue));

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          <select
            value={period}
            onChange={(e) => setRevenuePeriod(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
        <div className="flex items-end space-x-2 h-32">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${
                    maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
                  }%`,
                  minHeight: item.revenue > 0 ? "4px" : "2px",
                }}
              />
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {new Date(item.date).getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-sm text-gray-600">
          Total:{" "}
          {formatCurrency(data.reduce((sum, item) => sum + item.revenue, 0))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <UnifiedLayout title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </UnifiedLayout>
    );
  }

  return (
    <UnifiedLayout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {new Date().toLocaleDateString("en-UG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            - {user?.outlet?.name}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(stats.todayRevenue)}
            icon={DollarSign}
            color="green"
            subtitle="Daily earnings"
          />
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            icon={ShoppingCart}
            color="blue"
            subtitle={`${stats.pendingOrders} pending`}
          />
          <StatCard
            title="Today's Reservations"
            value={stats.todayReservations}
            icon={Calendar}
            color="purple"
            subtitle={`${stats.confirmedReservations} confirmed`}
          />
          <StatCard
            title="Table Occupancy"
            value={`${stats.occupiedTables}/${stats.totalTables}`}
            icon={TableIcon}
            color="orange"
            subtitle={`${stats.availableTables} available`}
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Weekly Revenue"
            value={formatCurrency(stats.weeklyRevenue)}
            icon={TrendingUp}
            color="indigo"
          />
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats.monthlyRevenue)}
            icon={BarChart3}
            color="pink"
          />
          <StatCard
            title="Total Guests"
            value={stats.totalGuests}
            icon={Users}
            color="cyan"
          />
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={AlertTriangle}
            color="red"
            subtitle={stats.lowStockItems > 0 ? "Needs attention" : "All good"}
          />
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <SimpleChart data={revenueData} period={revenuePeriod} />

          {/* Top Menu Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Top Menu Items (This Month)
            </h3>
            <div className="space-y-3">
              {topMenuItems.length > 0 ? (
                topMenuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {item.totalSold || 0} sold
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatCurrency((item.totalSold || 0) * item.price)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No sales data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Orders
              </h3>
            </div>
            <div className="p-6">
              {recentActivity.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full ${
                            order.status === "completed"
                              ? "bg-green-100"
                              : order.status === "preparing"
                              ? "bg-yellow-100"
                              : "bg-blue-100"
                          }`}
                        >
                          {order.status === "completed" ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {order.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent orders
                </p>
              )}
            </div>
          </div>

          {/* Recent Reservations */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Reservations
              </h3>
            </div>
            <div className="p-6">
              {recentActivity.recentReservations.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.recentReservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <div
                          className={`p-2 rounded-full ${
                            reservation.status === "confirmed"
                              ? "bg-green-100"
                              : reservation.status === "pending"
                              ? "bg-yellow-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <Calendar
                            className={`h-4 w-4 ${
                              reservation.status === "confirmed"
                                ? "text-green-600"
                                : reservation.status === "pending"
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-900">
                            {reservation.reservationNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            Party of {reservation.partySize} •{" "}
                            {reservation.status}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {new Date(
                            reservation.reservationDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No recent reservations
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalMenuItems}
              </p>
              <p className="text-sm text-gray-600">Menu Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.avgOrderValue)}
              </p>
              <p className="text-sm text-gray-600">Avg Order Value</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((stats.occupiedTables / stats.totalTables) * 100) ||
                  0}
                %
              </p>
              <p className="text-sm text-gray-600">Table Utilization</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {stats.lowStockItems === 0 ? "✓" : stats.lowStockItems}
              </p>
              <p className="text-sm text-gray-600">Inventory Status</p>
            </div>
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default Dashboard;
