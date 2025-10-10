import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

let currentBaseUrl;

function computeDefaultBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL || extra.API_BASE_URL;
  if (explicit) return explicit; // honor explicit config

  // Default to production base URL (without /mayday-api/api)
  return "https://cs.hugamara.com";
}

currentBaseUrl = computeDefaultBaseUrl();

export const setApiBaseUrl = (url) => {
  if (typeof url === "string" && url.trim()) {
    currentBaseUrl = url.trim();
  }
};

export const getApiBaseUrl = () => currentBaseUrl;

// Normalize a user-provided base URL (ensure protocol, strip trailing slash)
export const normalizeApiBaseUrl = (url) => {
  if (typeof url !== "string") return currentBaseUrl;
  let u = url.trim();
  if (!u) return currentBaseUrl;
  // Add protocol if missing
  if (!/^https?:\/\//i.test(u)) {
    u = `https://${u}`;
  }
  // Remove trailing slash
  u = u.replace(/\/$/, "");
  // Always append /mayday-api/api for the backend endpoint
  return `${u}/mayday-api/api`;
};

export const ENDPOINTS = {
  get BASE_URL() {
    return currentBaseUrl;
  },
  LOGIN: "/users/agent-login",
  LICENSE_CURRENT: "/licenses/current",
  CREATE_SESSION: "/licenses/create-session",
  END_SESSION: "/licenses/end-session",
  CALL_HISTORY: "/cdr/call-history",
  CALL_COUNTS: "/cdr/call-counts",
  // Dashboard endpoints (using existing admin endpoints)
  ADMIN_CALL_STATS: "/admin/call-stats",
  ADMIN_QUEUE_ACTIVITY: "/admin/queue-activity",
  ADMIN_HISTORICAL_STATS: "/admin/historical-stats",
  MY_PERFORMANCE: "/reports/my-performance",
};
