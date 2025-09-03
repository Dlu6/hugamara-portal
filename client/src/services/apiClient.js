import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

// console.log("🔥🔥🔥🔥API_BASE_URL", process.env.REACT_APP_API_URL);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Generic API methods
const api = {
  // GET request
  get: (url, params = {}) => apiClient.get(url, { params }),

  // POST request
  post: (url, data = {}) => apiClient.post(url, data),

  // PUT request
  put: (url, data = {}) => apiClient.put(url, data),

  // DELETE request
  delete: (url) => apiClient.delete(url),

  // PATCH request
  patch: (url, data = {}) => apiClient.patch(url, data),
};

// Resource-based API factory
export const createResourceAPI = (resource) => ({
  // Get all items
  getAll: (params = {}) => api.get(`/${resource}`, params),

  // Get single item by ID
  getById: (id) => api.get(`/${resource}/${id}`),

  // Create new item
  create: (data) => api.post(`/${resource}`, data),

  // Update item
  update: (id, data) => api.put(`/${resource}/${id}`, data),

  // Partial update
  patch: (id, data) => api.patch(`/${resource}/${id}`, data),

  // Delete item
  delete: (id) => api.delete(`/${resource}/${id}`),

  // Bulk operations
  bulkCreate: (data) => api.post(`/${resource}/bulk`, data),
  bulkUpdate: (data) => api.put(`/${resource}/bulk`, data),
  bulkDelete: (ids) => api.delete(`/${resource}/bulk`, { data: { ids } }),

  // Search
  search: (query, params = {}) =>
    api.get(`/${resource}/search`, { q: query, ...params }),

  // Count
  count: (params = {}) => api.get(`/${resource}/count`, params),
});

// Specific API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  changePassword: (data) => api.post("/auth/change-password", data),
};

export const dashboardAPI = {
  getStats: (params = {}) => api.get("/dashboard/stats", { params }),
  getActivity: (params = {}) => api.get("/dashboard/activity", { params }),
  getRevenue: (period = "week", params = {}) =>
    api.get("/dashboard/revenue", { params: { period, ...params } }),
  getTopItems: (params = {}) => api.get("/dashboard/top-items", { params }),
};

// Resource APIs
export const usersAPI = createResourceAPI("users");
export const outletsAPI = {
  ...createResourceAPI("outlets"),
  getPublic: () => api.get("/outlets/public"),
  getStats: (id) => api.get(`/outlets/${id}/stats`),
};
export const ordersAPI = createResourceAPI("orders");
export const reservationsAPI = createResourceAPI("reservations");
export const inventoryAPI = {
  ...createResourceAPI("inventory"),
  getStats: () => api.get("/inventory/stats"),
  getLowStock: () => api.get("/inventory/low-stock"),
  getExpiring: (days = 7) =>
    api.get("/inventory/expiring", { params: { days } }),
  updateStock: (id, data) => api.patch(`/inventory/${id}/stock`, data),
  bulkUpdateStock: (data) => api.patch("/inventory/bulk-stock", data),
};
export const guestsAPI = {
  ...createResourceAPI("guests"),
  getStats: (period = "month") =>
    api.get("/guests/stats", { params: { period } }),
  search: (query) => api.get("/guests/search", { params: { q: query } }),
  getByLoyaltyTier: (tier) => api.get(`/guests/loyalty/${tier}`),
  updateLoyaltyPoints: (id, data) => api.patch(`/guests/${id}/loyalty`, data),
  getHistory: (id) => api.get(`/guests/${id}/history`),
};
export const ticketsAPI = {
  ...createResourceAPI("tickets"),
  getStats: (period = "week") =>
    api.get("/tickets/stats", { params: { period } }),
  getOverdue: () => api.get("/tickets/overdue"),
  getByCategory: (category) => api.get(`/tickets/category/${category}`),
  updateStatus: (id, data) => api.patch(`/tickets/${id}/status`, data),
  addComment: (id, data) => api.post(`/tickets/${id}/comment`, data),
};
export const eventsAPI = {
  ...createResourceAPI("events"),
  getStats: (period = "month") =>
    api.get("/events/stats", { params: { period } }),
  getUpcoming: (days = 30) => api.get("/events/upcoming", { params: { days } }),
  getCalendar: (month, year) =>
    api.get("/events/calendar", { params: { month, year } }),
  getByType: (eventType) => api.get(`/events/type/${eventType}`),
  updateStatus: (id, data) => api.patch(`/events/${id}/status`, data),
  updateAttendance: (id, data) => api.patch(`/events/${id}/attendance`, data),
};
export const menuItemsAPI = createResourceAPI("menu-items");
export const menuAPI = createResourceAPI("menu");
export const tablesAPI = createResourceAPI("tables");
export const staffAPI = {
  ...createResourceAPI("staff"),
  getStats: () => api.get("/staff/stats"),
  getNewHires: (days = 90) => api.get("/staff/new-hires", { params: { days } }),
  getByDepartment: (department) => api.get(`/staff/department/${department}`),
  updatePerformance: (id, data) => api.patch(`/staff/${id}/performance`, data),
};
export const shiftsAPI = createResourceAPI("shifts");
export const paymentsAPI = {
  ...createResourceAPI("payments"),
  getStats: (period = "today") =>
    api.get("/payments/stats", { params: { period } }),
  getMethods: () => api.get("/payments/methods"),
  processPayment: (id, data) => api.patch(`/payments/${id}/process`, data),
  refundPayment: (id, data) => api.patch(`/payments/${id}/refund`, data),
};

export const reportsAPI = {
  getDashboard: (period = "week") =>
    api.get("/reports/dashboard", { params: { period } }),
  getRevenue: (params = "") => api.get(`/reports/revenue?${params}`),
  getSales: (params = "") => api.get(`/reports/sales?${params}`),
  getInventory: (params = "") => api.get(`/reports/inventory?${params}`),
  getStaff: (params = "") => api.get(`/reports/staff?${params}`),
  getEvents: (params = "") => api.get(`/reports/events?${params}`),
  getCustomers: (params = "") => api.get(`/reports/customers?${params}`),
  export: (params = "") => api.get(`/reports/export?${params}`),
};

export default api;
