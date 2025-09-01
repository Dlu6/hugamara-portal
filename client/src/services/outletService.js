import { outletsAPI } from './apiClient';

const outletService = {
  // Get all outlets (public endpoint for login)
  getAll: async () => {
    const response = await outletsAPI.getPublic();
    return response;
  },

  // Get outlet by ID
  getById: async (id) => {
    const response = await outletsAPI.getById(id);
    return response.data;
  },

  // Get outlets with statistics
  getOutletsWithStats: async () => {
    const response = await outletsAPI.getAll({ include: 'stats' });
    return response.data;
  },

  // Get outlet dashboard data
  getDashboardData: async (outletId) => {
    const response = await outletsAPI.getStats(outletId);
    return response.data;
  },

  // Update outlet settings
  updateSettings: async (outletId, settings) => {
    const response = await outletsAPI.patch(outletId, { settings });
    return response.data;
  },
};

export default outletService;
