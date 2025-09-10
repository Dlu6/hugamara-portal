// src/api/apiClient.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;
// console.log("🔥🔥🔥🔥API_BASE_URL", BASE_URL);

const getBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    // In production the call center backend is proxied by Nginx at /mayday-api
    return "/mayday-api";
  }
  // In development, prefer explicit env (falls back to CRA proxy if undefined)
  return BASE_URL || "/api";
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for authentication
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
