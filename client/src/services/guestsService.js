import api, { createResourceAPI } from "./apiClient";

class GuestsService {
  constructor() {
    this.baseAPI = createResourceAPI("guests");
  }

  async getAll(params = {}) {
    try {
      const response = await this.baseAPI.getAll(params);
      return response;
    } catch (error) {
      console.error("Get guests error:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const response = await this.baseAPI.getById(id);
      return response;
    } catch (error) {
      console.error("Get guest error:", error);
      throw error;
    }
  }

  async create(guestData) {
    try {
      const response = await this.baseAPI.create(guestData);
      // Normalize to return the created guest object directly
      return response?.data?.guest || response?.data || response;
    } catch (error) {
      console.error("Create guest error:", error);
      throw error;
    }
  }

  async update(id, guestData) {
    try {
      const response = await this.baseAPI.update(id, guestData);
      // Normalize updated guest shape
      return response?.data?.guest || response?.data || response;
    } catch (error) {
      console.error("Update guest error:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const response = await this.baseAPI.delete(id);
      return response;
    } catch (error) {
      console.error("Delete guest error:", error);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await api.get("/guests/stats");
      return response;
    } catch (error) {
      console.error("Get guest stats error:", error);
      throw error;
    }
  }

  async getHistory(id) {
    try {
      const response = await api.get(`/guests/${id}/history`);
      return response;
    } catch (error) {
      console.error("Get guest history error:", error);
      throw error;
    }
  }

  async updateLoyaltyPoints(id, pointsData) {
    try {
      const response = await api.patch(
        `/guests/${id}/loyalty-points`,
        pointsData
      );
      return response;
    } catch (error) {
      console.error("Update loyalty points error:", error);
      throw error;
    }
  }

  async updateLoyaltyTier(id, tierData) {
    try {
      const response = await api.patch(`/guests/${id}/loyalty-tier`, tierData);
      return response;
    } catch (error) {
      console.error("Update loyalty tier error:", error);
      throw error;
    }
  }

  async getGuestsByTier(tier) {
    try {
      const response = await api.get(`/guests/by-tier/${tier}`);
      return response;
    } catch (error) {
      console.error("Get guests by tier error:", error);
      throw error;
    }
  }

  async getTopGuests(limit = 10) {
    try {
      const response = await api.get(`/guests/top?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Get top guests error:", error);
      throw error;
    }
  }

  async exportGuests(params = {}) {
    try {
      const response = await api.get("/guests/export", { params });
      return response;
    } catch (error) {
      console.error("Export guests error:", error);
      throw error;
    }
  }

  // Helper methods for data formatting
  formatGuestForDisplay(guest) {
    return {
      ...guest,
      fullName: `${guest.firstName} ${guest.lastName}`,
      loyaltyTierDisplay: this.formatLoyaltyTier(guest.loyaltyTier),
      statusDisplay: guest.isActive ? "Active" : "Inactive",
      totalSpentDisplay: this.formatCurrency(guest.totalSpent),
    };
  }

  formatLoyaltyTier(tier) {
    return tier?.charAt(0).toUpperCase() + tier?.slice(1) || "Bronze";
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }

  getLoyaltyTierColor(tier) {
    const colors = {
      bronze: "bg-amber-100 text-amber-800",
      silver: "bg-gray-100 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
      vip: "bg-red-100 text-red-800",
    };
    return colors[tier] || colors.bronze;
  }

  validateGuestData(data) {
    const errors = {};

    if (!data.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!data.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (data.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  getDefaultFormData() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      city: "",
      country: "Uganda",
      preferences: "",
      allergies: "",
      dietaryRestrictions: "",
      loyaltyPoints: 0,
      loyaltyTier: "bronze",
      totalSpent: 0,
      visitCount: 0,
      isActive: true,
      marketingConsent: false,
      notes: "",
    };
  }
}

const guestsService = new GuestsService();
export default guestsService;
