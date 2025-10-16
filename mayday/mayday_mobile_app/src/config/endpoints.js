import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

let currentBaseUrl;
let currentApiUrl;

function computeDefaultBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL || extra.API_BASE_URL;
  if (explicit) {
    // If explicit URL already has /mayday-api/api, strip it to get base
    return explicit.replace(/\/mayday-api\/api$/, "");
  }

  // Default to production base URL (without /mayday-api/api)
  return "https://cs.hugamara.com";
}

currentBaseUrl = computeDefaultBaseUrl();
currentApiUrl = `${currentBaseUrl}/mayday-api/api`;

export const setApiBaseUrl = (url) => {
  if (typeof url === "string" && url.trim()) {
    const trimmed = url.trim();
    // Store the full API URL
    currentApiUrl = trimmed;
    // Extract and store just the base URL (strip /mayday-api/api)
    currentBaseUrl = trimmed.replace(/\/mayday-api\/api$/, "");
  }
};

// Returns the base URL (without /mayday-api/api suffix)
export const getApiBaseUrl = () => currentBaseUrl;

// Returns the full API URL (with /mayday-api/api suffix)
export const getFullApiUrl = () => currentApiUrl;

// Normalize a user-provided base URL (ensure protocol, strip trailing slash)
export const normalizeApiBaseUrl = (url) => {
  if (typeof url !== "string") return currentApiUrl;
  let u = url.trim();
  if (!u) return currentApiUrl;
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
    return currentApiUrl;
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
  // Contacts endpoints
  CONTACTS: "/contacts",
  CONTACT_BY_ID: "/contacts",
  CONTACT_STATS: "/contacts/stats",
  CONTACT_SEARCH: "/contacts/search",
};
