import { authAPI } from './apiClient';

const authService = {
  login: async (credentials) => {
    const response = await authAPI.login(credentials);
    return response.data;
  },

  logout: async () => {
    const response = await authAPI.logout();
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await authAPI.getCurrentUser();
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await authAPI.refreshToken(refreshToken);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await authAPI.changePassword(passwordData);
    return response.data;
  }
};

export default authService;
