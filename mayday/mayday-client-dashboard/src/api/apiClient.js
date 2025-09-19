// src/api/apiClient.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;
// console.log("🔥🔥🔥🔥API_BASE_URL", BASE_URL);

const getBaseUrl = () => {
  // Always prefer explicit env
  if (BASE_URL) return BASE_URL;
  // If served under /callcenter, our API is proxied at /mayday
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/callcenter")
  ) {
    return "/mayday";
  }
  // Default by environment
  if (process.env.NODE_ENV === "production") return "/mayday";
  return "/mayday"; // sensible fallback to work with nginx proxy in dev/prod
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
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    // Normalize token to avoid double "Bearer " prefixes
    const normalizedToken = storedToken.startsWith("Bearer ")
      ? storedToken.split(" ")[1]
      : storedToken;
    config.headers.Authorization = `Bearer ${normalizedToken}`;
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
