import api, { createResourceAPI } from "./apiClient";

class EventsService {
  constructor() {
    this.baseAPI = createResourceAPI("events");
  }

  async getAll(params = {}) {
    try {
      const response = await this.baseAPI.getAll(params);
      return response;
    } catch (error) {
      console.error("Get events error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await this.baseAPI.getById(id);
      return response;
    } catch (error) {
      console.error("Get event error:", error);
      throw error;
    }
  }

  async create(eventData) {
    try {
      const response = await this.baseAPI.create(eventData);
      return response;
    } catch (error) {
      console.error("Create event error:", error);
      throw error;
    }
  }

  async update(id, eventData) {
    try {
      const response = await this.baseAPI.update(id, eventData);
      return response;
    } catch (error) {
      console.error("Update event error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await this.baseAPI.delete(id);
      return response;
    } catch (error) {
      console.error("Delete event error:", error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await api.get("/events/stats");
      return response;
    } catch (error) {
      console.error("Get event stats error:", error);
      throw error;
    }
  }

  async updateStatus(id, statusData) {
    try {
      const response = await api.patch(`/events/${id}/status`, statusData);
      return response;
    } catch (error) {
      console.error("Update event status error:", error);
      throw error;
    }
  }

  async updateAttendance(id, attendanceData) {
    try {
      const response = await api.patch(
        `/events/${id}/attendance`,
        attendanceData
      );
      return response;
    } catch (error) {
      console.error("Update event attendance error:", error);
      throw error;
    }
  }

  async getUpcomingEvents(limit = 10) {
    try {
      const response = await api.get(`/events/upcoming?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Get upcoming events error:", error);
      throw error;
    }
  }

  async getEventsByType(eventType) {
    try {
      const response = await api.get(`/events/by-type/${eventType}`);
      return response;
    } catch (error) {
      console.error("Get events by type error:", error);
      throw error;
    }
  }

  async getEventsByStatus(status) {
    try {
      const response = await api.get(`/events/by-status/${status}`);
      return response;
    } catch (error) {
      console.error("Get events by status error:", error);
      throw error;
    }
  }

  // Helper methods for data formatting
  formatEventForDisplay(event) {
    return {
      ...event,
      typeDisplay: this.formatType(event.eventType),
      statusDisplay: this.formatStatus(event.status),
      dateDisplay: new Date(event.startDate).toLocaleDateString(),
      timeDisplay: `${event.startTime} - ${event.endTime}`,
      attendanceDisplay: `${event.actualAttendance || 0} / ${
        event.capacity || "N/A"
      }`,
      revenueDisplay: this.formatCurrency(event.revenue || 0),
    };
  }

  formatType(type) {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  formatStatus(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  getTimeAgo(date) {
    const now = new Date();
    const eventDate = new Date(date);
    const diffTime = now - eventDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  }

  getStatusColor(status) {
    const colors = {
      draft: "text-gray-500 bg-gray-900/20",
      published: "text-blue-500 bg-blue-900/20",
      active: "text-green-500 bg-green-900/20",
      completed: "text-emerald-500 bg-emerald-900/20",
      cancelled: "text-red-500 bg-red-900/20",
    };
    return colors[status] || "text-neutral-500 bg-neutral-900/20";
  }

  validateEventData(data) {
    const errors = {};

    if (!data.title?.trim()) {
      errors.title = "Title is required";
    }

    if (!data.eventType) {
      errors.eventType = "Event type is required";
    }

    if (!data.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!data.endDate) {
      errors.endDate = "End date is required";
    }

    if (!data.startTime) {
      errors.startTime = "Start time is required";
    }

    if (!data.endTime) {
      errors.endTime = "End time is required";
    }

    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) > new Date(data.endDate)
    ) {
      errors.endDate = "End date must be after start date";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

const eventsService = new EventsService();
export default eventsService;
