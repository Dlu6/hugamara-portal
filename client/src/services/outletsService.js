import api, { createResourceAPI } from "./apiClient";

class OutletsService {
  constructor() {
    this.baseAPI = createResourceAPI("outlets");
  }

  async getAll(params = {}) {
    try {
      const response = await this.baseAPI.getAll(params);
      return response;
    } catch (error) {
      console.error("Get outlets error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await this.baseAPI.getById(id);
      return response;
    } catch (error) {
      console.error("Get outlet error:", error);
      throw error;
    }
  }

  async create(outletData) {
    try {
      const response = await this.baseAPI.create(outletData);
      return response;
    } catch (error) {
      console.error("Create outlet error:", error);
      throw error;
    }
  }

  async update(id, outletData) {
    try {
      const response = await this.baseAPI.update(id, outletData);
      return response;
    } catch (error) {
      console.error("Update outlet error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await this.baseAPI.delete(id);
      return response;
    } catch (error) {
      console.error("Delete outlet error:", error);
      throw error;
    }
  }

  async getOutletStats(outletId) {
    try {
      const response = await api.get(`/outlets/${outletId}/stats`);
      return response;
    } catch (error) {
      console.error("Get outlet stats error:", error);
      throw error;
    }
  }

  async updateOutletStatus(id, status) {
    try {
      const response = await api.patch(`/outlets/${id}/status`, { status });
      return response;
    } catch (error) {
      console.error("Update outlet status error:", error);
      throw error;
    }
  }

  // Helper methods for data formatting
  formatOutletForDisplay(outlet) {
    return {
      ...outlet,
      statusDisplay: outlet.isActive ? "Active" : "Inactive",
      typeDisplay:
        outlet.type?.charAt(0).toUpperCase() + outlet.type?.slice(1) ||
        "Unknown",
      locationDisplay: [outlet.timezone, outlet.currency]
        .filter(Boolean)
        .join(" • "),
    };
  }

  validateOutletData(data) {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Name is required";
    }

    if (!data.code?.trim()) {
      errors.code = "Code is required";
    }

    if (!data.type) {
      errors.type = "Type is required";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

const outletsService = new OutletsService();
export default outletsService;
