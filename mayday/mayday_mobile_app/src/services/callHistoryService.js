import {
  getApiBaseUrl,
  normalizeApiBaseUrl,
  ENDPOINTS,
} from "../config/endpoints";

const callHistoryService = {
  /**
   * Enhanced error handler for API responses
   */
  async handleApiResponse(response, context = "API call") {
    let responseData;
    try {
      responseData = await response.json();
    } catch (jsonError) {
      throw new Error(
        `Failed to parse response for ${context}: ${response.statusText}`
      );
    }

    if (!response.ok) {
      console.error(`[CallHistoryService] ${context} failed:`, {
        status: response.status,
        statusText: response.statusText,
        responseData,
      });

      // Handle specific error formats
      if (responseData.success === false) {
        const errorMessage =
          responseData.details || responseData.message || `${context} failed`;

        if (responseData.errorType === "JsonWebTokenError") {
          throw new Error(
            `Authentication Error: ${errorMessage}\n\nPlease log out and log in again to get a fresh token.`
          );
        } else if (responseData.errorType === "TokenExpiredError") {
          throw new Error(
            `Session Expired: ${errorMessage}\n\nYour login session has expired. Please log in again.`
          );
        } else {
          throw new Error(`${context} Error: ${errorMessage}`);
        }
      } else {
        throw new Error(
          responseData.message || `${context} failed: ${response.statusText}`
        );
      }
    }

    return responseData;
  },

  /**
   * Fetch call history for a specific extension
   * @param {string} token - Authentication token
   * @param {string} extension - User extension
   * @param {number} limit - Maximum number of records to fetch (default: 50)
   * @returns {Promise<Object>} Call history data
   */
  async getCallHistory(token, extension, limit = 50) {
    try {
      console.log(
        `[CallHistoryService] Fetching call history for extension: ${extension}`
      );

      if (!extension) {
        throw new Error("Extension is required to fetch call history");
      }

      // Handle token with or without Bearer prefix
      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      // Construct query parameters
      const params = new URLSearchParams({
        extension: extension,
        limit: limit.toString(),
      });

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.CALL_HISTORY}?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await this.handleApiResponse(response, "Get call history");

      console.log(
        `[CallHistoryService] Successfully fetched ${
          result.data?.records?.length || 0
        } call records`
      );
      return result;
    } catch (error) {
      console.error("[CallHistoryService] Error fetching call history:", error);
      throw error;
    }
  },

  /**
   * Format call duration from seconds to MM:SS format
   * @param {number} seconds - Duration in seconds
   * @returns {string} Formatted duration
   */
  formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  },

  /**
   * Format timestamp to readable format
   * @param {string|Date} timestamp - Timestamp to format
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const callDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      if (callDate.getTime() === today.getTime()) {
        // Today - show time only
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      } else if (callDate.getTime() === yesterday.getTime()) {
        // Yesterday
        return (
          "Yesterday " +
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      } else {
        // Older - show date and time
        return (
          date.toLocaleDateString() +
          " " +
          date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      }
    } catch (error) {
      console.error("[CallHistoryService] Error formatting timestamp:", error);
      return "Unknown";
    }
  },

  /**
   * Get call status icon and color based on call type and status
   * @param {Object} call - Call record
   * @returns {Object} Icon info with component and color
   */
  getCallStatusInfo(call) {
    const info = {
      icon: null,
      color: "#7f8c8d", // default gray
      title: "Unknown",
    };

    switch (call.type) {
      case "inbound":
        info.icon = "↓";
        // Green for incoming calls (regardless of status)
        info.color = "#22C55E"; // green
        if (call.status === "completed") {
          info.title = "Incoming call answered";
        } else if (call.status === "missed") {
          info.title = "Missed incoming call";
        } else {
          info.title = "Incoming call failed";
        }
        break;
      case "outbound":
        info.icon = "↑";
        // Red for outgoing calls (regardless of status)
        info.color = "#EF4444"; // red
        if (call.status === "completed") {
          info.title = "Outgoing call completed";
        } else if (call.status === "missed" || call.status === "failed") {
          info.title = "Outgoing call failed";
        } else {
          info.title = "Outgoing call";
        }
        break;
      default:
        info.icon = "📞";
        info.title = "Call";
    }

    return info;
  },

  /**
   * Format call record for display with enhanced information
   * @param {Object} call - Call record from API
   * @returns {Object} Formatted call record
   */
  formatCallRecord(call) {
    // Extract caller information
    let callerNumber = call.phoneNumber || "Unknown";
    let callerName = call.name || null;

    // For inbound calls, use userfield as the real caller number
    if (call.userfield && call.type === "inbound") {
      callerNumber = call.userfield; // The real caller number from backend
    }

    return {
      id: call.id,
      phoneNumber: callerNumber,
      name: callerName,
      type: call.type,
      status: call.status,
      duration: call.duration,
      timestamp: call.timestamp,
      // Enhanced fields
      codec: call.codec,
      transferInfo: call.transferInfo,
      holdDuration: call.holdDuration,
      recordingFile: call.recordingFile,
      billsec: call.billsec,
      disposition: call.disposition,
      calledNumber: call.calledNumber,
      userfield: call.userfield,
      // Display text
      displayName: callerName || callerNumber,
      displayDuration:
        typeof call.duration === "string" && call.duration.includes(":")
          ? call.duration
          : this.formatDuration(call.billsec || call.duration || 0),
      displayTimestamp: this.formatTimestamp(call.timestamp),
      displayCalledNumber: call.calledNumber
        ? `Dialed ${call.calledNumber}`
        : null,
      // Status info for UI
      statusInfo: this.getCallStatusInfo(call),
    };
  },

  /**
   * Get enhanced call history with formatted records
   * @param {string} token - Authentication token
   * @param {string} extension - User extension
   * @param {number} limit - Maximum number of records to fetch (default: 50)
   * @returns {Promise<Object>} Enhanced call history data
   */
  async getEnhancedCallHistory(token, extension, limit = 50) {
    try {
      const result = await this.getCallHistory(token, extension, limit);

      // Format each record with enhanced information
      if (result.data && result.data.records) {
        result.data.records = result.data.records.map((record) =>
          this.formatCallRecord(record)
        );
      }

      return result;
    } catch (error) {
      console.error(
        "[CallHistoryService] Error fetching enhanced call history:",
        error
      );
      throw error;
    }
  },
};

export default callHistoryService;
