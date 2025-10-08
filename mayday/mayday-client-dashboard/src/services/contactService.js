import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8004/api";

class ContactService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
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
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Get all contacts with pagination and filters
  async getContacts(params = {}) {
    try {
      const response = await this.api.get("/contacts", { params });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      throw error;
    }
  }

  // Get contact by ID
  async getContactById(id) {
    try {
      const response = await this.api.get(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contact:", error);
      throw error;
    }
  }

  // Create new contact
  async createContact(contactData) {
    try {
      const response = await this.api.post("/contacts", contactData);
      return response.data;
    } catch (error) {
      console.error("Failed to create contact:", error);
      throw error;
    }
  }

  // Update contact
  async updateContact(id, contactData) {
    try {
      const response = await this.api.put(`/contacts/${id}`, contactData);
      return response.data;
    } catch (error) {
      console.error("Failed to update contact:", error);
      throw error;
    }
  }

  // Delete contact
  async deleteContact(id) {
    try {
      const response = await this.api.delete(`/contacts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete contact:", error);
      throw error;
    }
  }

  // Search contacts
  async searchContacts(query, limit = 10) {
    try {
      const response = await this.api.get("/contacts/search", {
        params: { q: query, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search contacts:", error);
      throw error;
    }
  }

  // Get contact statistics
  async getContactStats() {
    try {
      const response = await this.api.get("/contacts/stats");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch contact stats:", error);
      throw error;
    }
  }

  // Bulk operations
  async bulkUpdateContacts(contactIds, updateData) {
    try {
      const response = await this.api.put("/contacts/bulk-update", {
        contactIds,
        updateData,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to bulk update contacts:", error);
      throw error;
    }
  }

  async bulkDeleteContacts(contactIds) {
    try {
      const response = await this.api.delete("/contacts/bulk-delete", {
        data: { contactIds },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to bulk delete contacts:", error);
      throw error;
    }
  }

  // Export contacts
  async exportContacts(format = "csv", filters = {}) {
    try {
      const response = await this.api.get("/contacts/export", {
        params: { format, ...filters },
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Failed to export contacts:", error);
      throw error;
    }
  }

  // Import contacts
  async importContacts(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/contacts/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to import contacts:", error);
      throw error;
    }
  }

  // Utility methods
  formatPhoneNumber(phone) {
    if (!phone) return "";
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, "");
    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone) {
    if (!phone) return true; // Allow empty phone
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
    return phoneRegex.test(phone);
  }

  generateAvatarInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return first + last;
  }

  // Get contact types
  getContactTypes() {
    return [
      { value: "customer", label: "Customer" },
      { value: "lead", label: "Lead" },
      { value: "prospect", label: "Prospect" },
      { value: "vendor", label: "Vendor" },
      { value: "partner", label: "Partner" },
    ];
  }

  // Get priorities
  getPriorities() {
    return [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ];
  }

  // Get statuses
  getStatuses() {
    return [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "pending", label: "Pending" },
      { value: "blocked", label: "Blocked" },
    ];
  }

  // Get sources
  getSources() {
    return [
      { value: "manual", label: "Manual Entry" },
      { value: "import", label: "Import" },
      { value: "website", label: "Website" },
      { value: "referral", label: "Referral" },
      { value: "social", label: "Social Media" },
      { value: "advertisement", label: "Advertisement" },
    ];
  }

  // Get contact methods
  getContactMethods() {
    return [
      { value: "phone", label: "Phone" },
      { value: "email", label: "Email" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "sms", label: "SMS" },
      { value: "mail", label: "Mail" },
    ];
  }
}

export default new ContactService();
