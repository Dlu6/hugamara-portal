import { dashboardAPI } from "./apiClient";

const dashboardService = {
  // Unified dashboard data for client rendering
  getDashboardData: async (outletId, period = "week") => {
    const params = outletId ? { outletId } : {};

    const [statsRes, activityRes, revenueRes, topItemsRes] = await Promise.all([
      dashboardAPI.getStats(params),
      dashboardAPI.getActivity(params),
      dashboardAPI.getRevenue(period, params),
      dashboardAPI.getTopItems(params),
    ]);

    const stats = statsRes.data?.stats || statsRes.data || {};
    const activity = activityRes.data || {};
    const revenueSeries = revenueRes.data?.revenueData || revenueRes.data || [];
    const topItems = topItemsRes.data?.topMenuItems || topItemsRes.data || [];

    // Normalize shape expected by Dashboard page
    return {
      revenue: {
        today: stats.todayRevenue || 0,
        week: stats.weeklyRevenue || 0,
        month: stats.monthlyRevenue || 0,
        change: "+0%",
      },
      reservations: {
        booked: stats.todayReservations || 0,
        seated: stats.confirmedReservations || 0,
        noShow: 0,
        rate: "0%",
      },
      guests: {
        total: stats.totalGuests || 0,
        new: 0,
        returning: stats.totalGuests || 0,
      },
      tickets: {
        open: 0,
        resolved: 0,
        critical: 0,
      },
      inventory: {
        totalItems: stats.totalMenuItems || 0,
        lowStock: stats.lowStockItems || 0,
        outOfStock: 0,
        expiringSoon: 0,
        totalValue: 0,
      },
      menu: {
        totalItems: stats.totalMenuItems || 0,
        available: stats.totalMenuItems || 0,
        unavailable: 0,
        topSellers: topItems.map((i) => i.name),
      },
      tables: {
        total: stats.totalTables || 0,
        occupied: stats.occupiedTables || 0,
        available: stats.availableTables || 0,
        cleaning: 0,
        reserved: 0,
      },
      staff: {
        total: 0,
        onShift: 0,
        offDuty: 0,
        overtime: 0,
      },
      activity,
      revenueSeries,
    };
  },
};

export default dashboardService;
