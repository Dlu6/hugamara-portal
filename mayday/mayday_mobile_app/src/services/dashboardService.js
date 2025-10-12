import { ENDPOINTS } from "../config/endpoints";

// This is a placeholder for our authenticated fetch helper
async function fetchWithAuth(url, options = {}) {
  const { token, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    const authHeader = token.startsWith?.("Bearer ")
      ? token
      : `Bearer ${token}`;
    headers["Authorization"] = authHeader;
  }

  const res = await fetch(url, { ...fetchOptions, headers });

  const contentType = res.headers?.get?.("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    if (isJson) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { message: `Request failed with status ${res.status}` };
      }
      const msg =
        errorData.message ||
        errorData.error ||
        errorData.detail ||
        "API request failed";
      throw new Error(msg);
    } else {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Request failed (${res.status}). Unexpected response: ${text?.slice(
          0,
          120
        )}`
      );
    }
  }

  if (!isJson) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Unexpected response format (expected JSON). ${text?.slice(0, 120)}`
    );
  }

  return res.json();
}

function toISO(d) {
  // Ensure proper ISO for query
  return new Date(d).toISOString();
}

function parseHhMmToSeconds(hhmm) {
  if (!hhmm || typeof hhmm !== "string" || !hhmm.includes(":")) return 0;
  const [m, s] = hhmm.split(":");
  const mi = parseInt(m, 10) || 0;
  const se = parseInt(s, 10) || 0;
  return mi * 60 + se;
}

/**
 * Get system-wide dashboard statistics
 * Uses the existing /admin/call-stats endpoint
 * @param {string} token - Authentication token
 * @param {string} timeRange - Time range: "today", "week", "month" (not used by backend yet)
 * @returns {Promise<Object>} System stats including active calls, agents, totals
 */
export const getSystemStats = async (token, timeRange = "today") => {
  const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.ADMIN_CALL_STATS}`;
  try {
    const response = await fetchWithAuth(url, { token });

    // Transform backend response to expected format
    // Backend returns: { waiting, talking, answered, abandoned, totalOffered, avgHoldTime, trends }
    const data = response;

    return {
      success: true,
      data: {
        activeCalls: (data.waiting || 0) + (data.talking || 0),
        activeAgents: 0, // Not available in this endpoint
        totalCalls: data.totalOffered || 0,
        answeredCalls: data.answered || 0,
        abandonedCalls: data.abandoned || 0,
        inboundCalls: 0, // Not available in this endpoint
        outboundCalls: 0, // Not available in this endpoint
        abandonRate:
          data.abandoned && data.totalOffered
            ? parseFloat(
                ((data.abandoned / data.totalOffered) * 100).toFixed(1)
              )
            : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching system stats:", error);
    throw error;
  }
};

/**
 * Get queue status and metrics
 * Uses the existing /admin/queue-activity endpoint
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Queue status data
 */
export const getQueueStatus = async (token) => {
  const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.ADMIN_QUEUE_ACTIVITY}`;
  try {
    const response = await fetchWithAuth(url, { token });

    // Backend returns: { serviceLevel, waitTime, abandonRate, totalCalls, abandonedCalls, queues }
    // Return the queues array as expected
    return {
      success: true,
      data: response.queues || [],
    };
  } catch (error) {
    console.error("Error fetching queue status:", error);
    throw error;
  }
};

/**
 * Get active agents list with status
 * Uses the /admin/call-stats endpoint to extract agent info
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Active agents data
 */
export const getActiveAgents = async (token) => {
  const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.ADMIN_CALL_STATS}`;
  try {
    const response = await fetchWithAuth(url, { token });

    // Extract active agents count from the call stats
    // The backend doesn't provide detailed agent list in this endpoint
    // Return a minimal structure for now
    return {
      success: true,
      data: [], // Empty array since detailed agent list not available
    };
  } catch (error) {
    console.error("Error fetching active agents:", error);
    // Return empty array on error to avoid breaking the UI
    return {
      success: true,
      data: [],
    };
  }
};

/**
 * Get currently active calls
 * Uses the /admin/call-stats endpoint to extract active calls info
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Active calls data
 */
export const getActiveCalls = async (token) => {
  const url = `${ENDPOINTS.BASE_URL}${ENDPOINTS.ADMIN_CALL_STATS}`;
  try {
    const response = await fetchWithAuth(url, { token });

    // Extract waiting + talking calls from the stats
    // Backend returns: { waiting, talking, ... }
    const activeCalls = (response.waiting || 0) + (response.talking || 0);

    return {
      success: true,
      data: {
        count: activeCalls,
        waiting: response.waiting || 0,
        talking: response.talking || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching active calls:", error);
    // Return zero counts on error
    return {
      success: true,
      data: {
        count: 0,
        waiting: 0,
        talking: 0,
      },
    };
  }
};

export const getMyPerformanceStats = async (
  token,
  timeframe = "today",
  extension = null
) => {
  // Primary endpoint (new)
  const primary = `${ENDPOINTS.BASE_URL}/reports/my-performance?timeframe=${timeframe}`;

  try {
    console.log("[DashboardService] Fetching my performance stats:", {
      timeframe,
      extension,
    });
    const response = await fetchWithAuth(primary, { token });
    console.log("[DashboardService] My performance response:", response);
    return response;
  } catch (primaryError) {
    console.warn(
      "[DashboardService] Primary endpoint failed:",
      primaryError.message
    );

    // Fallback 1: Try CDR call-counts endpoint if we have extension
    if (extension) {
      try {
        console.log(
          "[DashboardService] Trying CDR fallback with extension:",
          extension
        );
        const cdrUrl = `${ENDPOINTS.BASE_URL}/cdr/call-counts?extension=${extension}`;
        const cdrResponse = await fetchWithAuth(cdrUrl, { token });
        console.log("[DashboardService] CDR response:", cdrResponse);

        if (cdrResponse.success && cdrResponse.data) {
          const data = cdrResponse.data;
          // Format avgCallDuration from seconds to MM:SS
          const avgSeconds = data.avgCallDuration || 0;
          const mm = Math.floor(avgSeconds / 60);
          const ss = (avgSeconds % 60).toString().padStart(2, "0");

          return {
            success: true,
            data: {
              totalCalls: data.totalCalls || 0,
              inbound: data.inboundCalls || 0,
              outbound: data.outboundCalls || 0,
              missed: data.missedCalls || 0,
              avgHandleTime: `${mm}:${ss}`,
            },
          };
        }
      } catch (cdrError) {
        console.warn(
          "[DashboardService] CDR fallback failed:",
          cdrError.message
        );
      }
    }

    // Fallback 2: Try agent-performance endpoint
    try {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const startDate = toISO(start);
      const endDate = toISO(now);

      const fallback = `${
        ENDPOINTS.BASE_URL
      }/reports/agent-performance?startDate=${encodeURIComponent(
        startDate
      )}&endDate=${encodeURIComponent(endDate)}`;

      console.log("[DashboardService] Trying agent-performance fallback");
      const json = await fetchWithAuth(fallback, { token });

      // Normalize fallback data to expected shape
      if (Array.isArray(json)) {
        const totalCalls = json.reduce((sum, a) => sum + (a.calls || 0), 0);
        const totalWeightedSeconds = json.reduce((sum, a) => {
          const sec = parseHhMmToSeconds(a.avgHandleTime);
          const calls = a.calls || 0;
          return sum + sec * calls;
        }, 0);
        const avgSec =
          totalCalls > 0 ? Math.round(totalWeightedSeconds / totalCalls) : 0;
        const mm = Math.floor(avgSec / 60);
        const ss = (avgSec % 60).toString().padStart(2, "0");

        console.log("[DashboardService] Agent-performance fallback succeeded");
        return {
          success: true,
          data: {
            totalCalls,
            inbound: 0, // Not available in this fallback dataset
            outbound: 0, // Not available in this fallback dataset
            missed: 0, // Not available in this fallback dataset
            avgHandleTime: `${mm}:${ss}`,
          },
        };
      }
    } catch (fallbackError) {
      console.warn(
        "[DashboardService] All fallbacks failed:",
        fallbackError.message
      );
    }

    // Return empty data structure if all attempts fail
    console.error(
      "[DashboardService] All endpoints failed, returning empty data"
    );
    return {
      success: false,
      data: {
        totalCalls: 0,
        inbound: 0,
        outbound: 0,
        missed: 0,
        avgHandleTime: "0:00",
      },
    };
  }
};
