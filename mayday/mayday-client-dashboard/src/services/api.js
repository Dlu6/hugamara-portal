import apiClient from "../api/apiClient";
import licenseService from "./licenseService";

// Admin API for user management
export const adminAPI = {
  getUsers: () => apiClient.get("/admin/users"),
  updateUser: (id, userData) => apiClient.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),
  verifyUser: (id) => apiClient.put(`/admin/users/${id}/verify`),
};

// License API - re-export the license service
export const licenseAPI = licenseService;
