import axios from "axios";
import { storageService } from "./storageService";

const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8004/api"
    : "https://cs.hugamara.com/mayday-api";

class ContactService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/contacts`,
      timeout: 10000,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = storageService.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          storageService.clearAuth();
          window.location.reload();
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all contacts with filtering and pagination
  async getContacts(params = {}) {
    try {
      const response = await this.api.get("/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching contacts:", error);
      throw error;
    }
  }

  // Get a single contact by ID
  async getContactById(id) {
    try {
      const response = await this.api.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching contact:", error);
      throw error;
    }
  }

  // Create a new contact
  async createContact(contactData) {
    try {
      const response = await this.api.post("/", contactData);
      return response.data;
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  // Update a contact
  async updateContact(id, contactData) {
    try {
      const response = await this.api.put(`/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  // Delete a contact
  async deleteContact(id, permanent = false) {
    try {
      const response = await this.api.delete(`/${id}?permanent=${permanent}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }

  // Search contacts
  async searchContacts(query, limit = 10) {
    try {
      const response = await this.api.get("/search", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching contacts:", error);
      throw error;
    }
  }

  // Get contact statistics
  async getContactStats() {
    try {
      const response = await this.api.get("/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching contact stats:", error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateContacts(contactIds, updateData) {
    try {
      const response = await this.api.post("/bulk/update", {
        contactIds,
        updateData,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk updating contacts:", error);
      throw error;
    }
  }

  async bulkDeleteContacts(contactIds, permanent = false) {
    try {
      const response = await this.api.post("/bulk/delete", {
        contactIds,
        permanent,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk deleting contacts:", error);
      throw error;
    }
  }

  // Export contacts
  async exportContacts(format = "csv", filters = {}) {
    try {
      const response = await this.api.get("/export", {
        params: { format, ...filters },
        responseType: format === "csv" ? "blob" : "json",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting contacts:", error);
      throw error;
    }
  }

  // Import contacts
  async importContacts(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error importing contacts:", error);
      throw error;
    }
  }

  // Utility methods
  formatPhoneNumber(phone) {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");

    // Add country code if missing
    if (cleaned.length === 10) {
      return `+256${cleaned}`; // Default to Uganda
    } else if (cleaned.length === 9 && cleaned.startsWith("7")) {
      return `+256${cleaned}`;
    } else if (cleaned.startsWith("256")) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith("+")) {
      return cleaned;
    }

    return `+${cleaned}`;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone) {
    if (!phone || phone.trim() === "") return true; // Allow empty phones
    // Allow various phone formats: +1234567890, 1234567890, 123-456-7890, etc.
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }

  generateAvatarInitials(firstName, lastName) {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : "";
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : "";
    return firstInitial + lastInitial;
  }

  // Contact type options
  getContactTypes() {
    return [
      { value: "customer", label: "Customer" },
      { value: "prospect", label: "Prospect" },
      { value: "supplier", label: "Supplier" },
      { value: "partner", label: "Partner" },
      { value: "internal", label: "Internal" },
      { value: "other", label: "Other" },
    ];
  }

  // Priority options
  getPriorities() {
    return [
      { value: "low", label: "Low", color: "#4caf50" },
      { value: "medium", label: "Medium", color: "#ff9800" },
      { value: "high", label: "High", color: "#f44336" },
      { value: "vip", label: "VIP", color: "#9c27b0" },
    ];
  }

  // Status options
  getStatuses() {
    return [
      { value: "active", label: "Active", color: "#4caf50" },
      { value: "inactive", label: "Inactive", color: "#9e9e9e" },
      { value: "blocked", label: "Blocked", color: "#f44336" },
      { value: "deleted", label: "Deleted", color: "#757575" },
    ];
  }

  // Source options
  getSources() {
    return [
      { value: "manual", label: "Manual Entry" },
      { value: "import", label: "Import" },
      { value: "website", label: "Website" },
      { value: "referral", label: "Referral" },
      { value: "campaign", label: "Campaign" },
      { value: "other", label: "Other" },
    ];
  }

  // Preferred contact method options
  getContactMethods() {
    return [
      { value: "phone", label: "Phone" },
      { value: "email", label: "Email" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "sms", label: "SMS" },
    ];
  }
}

export default new ContactService();
