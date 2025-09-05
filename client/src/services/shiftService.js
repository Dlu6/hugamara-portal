import api, { createResourceAPI } from "./apiClient";

class ShiftService {
  constructor() {
    this.baseAPI = createResourceAPI("shifts");
  }

  // Basic CRUD operations
  async getAllShifts(filters = {}) {
    try {
      const response = await this.baseAPI.getAll(filters);
      return response;
    } catch (error) {
      console.error("Error fetching shifts:", error);
      throw error;
    }
  }

  async getShiftById(id) {
    try {
      const response = await this.baseAPI.getById(id);
      return response;
    } catch (error) {
      console.error("Error fetching shift:", error);
      throw error;
    }
  }

  async createShift(shiftData) {
    try {
      const response = await this.baseAPI.create(shiftData);
      return response;
    } catch (error) {
      console.error("Error creating shift:", error);
      throw error;
    }
  }

  async updateShift(id, shiftData) {
    try {
      const response = await this.baseAPI.update(id, shiftData);
      return response;
    } catch (error) {
      console.error("Error updating shift:", error);
      throw error;
    }
  }

  async deleteShift(id) {
    try {
      const response = await this.baseAPI.delete(id);
      return response;
    } catch (error) {
      console.error("Error deleting shift:", error);
      throw error;
    }
  }

  // Shift-specific operations
  async getShiftStats(period = "month") {
    try {
      const response = await api.get(`/shifts/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching shift stats:", error);
      throw error;
    }
  }

  async updateShiftStatus(id, status) {
    try {
      const response = await api.patch(`/shifts/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating shift status:", error);
      throw error;
    }
  }

  async clockIn(id) {
    try {
      const response = await api.patch(`/shifts/${id}/clock-in`);
      return response.data;
    } catch (error) {
      console.error("Error clocking in:", error);
      throw error;
    }
  }

  async clockOut(id) {
    try {
      const response = await api.patch(`/shifts/${id}/clock-out`);
      return response.data;
    } catch (error) {
      console.error("Error clocking out:", error);
      throw error;
    }
  }

  async getTodaysShifts() {
    try {
      const response = await api.get("/shifts/today");
      return response.data;
    } catch (error) {
      console.error("Error fetching today's shifts:", error);
      throw error;
    }
  }

  async getUpcomingShifts(days = 7) {
    try {
      const response = await api.get(`/shifts/upcoming?days=${days}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching upcoming shifts:", error);
      throw error;
    }
  }

  async approveShift(id) {
    try {
      const response = await api.patch(`/shifts/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving shift:", error);
      throw error;
    }
  }

  // Utility methods
  formatShiftForDisplay(shift) {
    return {
      ...shift,
      formattedDate: this.formatDate(shift.shiftDate),
      formattedStartTime: this.formatTime(shift.startTime),
      formattedEndTime: this.formatTime(shift.endTime),
      duration: this.calculateDuration(shift.startTime, shift.endTime),
      statusColor: this.getStatusColor(shift.status),
      typeColor: this.getTypeColor(shift.shiftType),
    };
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  calculateDuration(startTime, endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 100) / 100;
  }

  getStatusColor(status) {
    const colors = {
      scheduled: "blue",
      confirmed: "green",
      in_progress: "yellow",
      completed: "green",
      cancelled: "red",
      no_show: "red",
    };
    return colors[status] || "gray";
  }

  getTypeColor(type) {
    const colors = {
      regular: "blue",
      overtime: "orange",
      holiday: "purple",
      weekend: "green",
      night: "indigo",
      split: "pink",
    };
    return colors[type] || "gray";
  }

  validateShiftData(data) {
    const errors = {};

    if (!data.shiftDate) {
      errors.shiftDate = "Shift date is required";
    }

    if (!data.startTime) {
      errors.startTime = "Start time is required";
    }

    if (!data.endTime) {
      errors.endTime = "End time is required";
    }

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      errors.endTime = "End time must be after start time";
    }

    if (!data.position) {
      errors.position = "Position is required";
    }

    if (!data.shiftType) {
      errors.shiftType = "Shift type is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getShiftTypeOptions() {
    return [
      { value: "regular", label: "Regular" },
      { value: "overtime", label: "Overtime" },
      { value: "holiday", label: "Holiday" },
      { value: "weekend", label: "Weekend" },
      { value: "night", label: "Night" },
      { value: "split", label: "Split" },
    ];
  }

  getStatusOptions() {
    return [
      { value: "scheduled", label: "Scheduled" },
      { value: "confirmed", label: "Confirmed" },
      { value: "in_progress", label: "In Progress" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
      { value: "no_show", label: "No Show" },
    ];
  }

  getDefaultFormData() {
    return {
      shiftDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "17:00",
      position: "",
      shiftType: "regular",
      status: "scheduled",
      section: "",
      tables: [],
      notes: "",
    };
  }
}

export default new ShiftService();
