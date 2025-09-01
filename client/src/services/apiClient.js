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
export const inventoryAPI = createResourceAPI("inventory");
export const guestsAPI = createResourceAPI("guests");
export const ticketsAPI = createResourceAPI("tickets");
export const eventsAPI = createResourceAPI("events");
export const menuItemsAPI = createResourceAPI("menu-items");
export const tablesAPI = createResourceAPI("tables");
export const staffAPI = createResourceAPI("staff");
export const shiftsAPI = createResourceAPI("shifts");
export const paymentsAPI = createResourceAPI("payments");

export default api;
