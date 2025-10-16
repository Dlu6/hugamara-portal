import {
  getApiBaseUrl,
  normalizeApiBaseUrl,
  ENDPOINTS,
} from "../config/endpoints";

const contactsService = {
  /**
   * Fetch contacts with pagination and filtering
   * @param {string} token - Authentication token
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Contacts data with pagination
   */
  async getContacts(token, options = {}) {
    try {
      console.log("[ContactsService] Fetching contacts with options:", options);

      const {
        page = 1,
        limit = 20,
        search = "",
        contactType = "",
        status = "all",
        priority = "",
        tags = "",
        assignedAgentId = "",
        sortBy = "lastInteraction",
        sortOrder = "DESC",
      } = options;

      // Handle token with or without Bearer prefix
      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search: search,
        contactType: contactType,
        status: status,
        priority: priority,
        tags: tags,
        assignedAgentId: assignedAgentId,
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const fullUrl = `${baseUrl}${ENDPOINTS.CONTACTS}?${params}`;

      console.log("[ContactsService] Raw base URL:", rawBaseUrl);
      console.log("[ContactsService] Processed base URL:", baseUrl);
      console.log("[ContactsService] Full URL:", fullUrl);
      console.log(
        "[ContactsService] Auth header:",
        authHeader.substring(0, 20) + "..."
      );

      const response = await fetch(fullUrl, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      // console.log("[ContactsService] Successfully fetched contacts:", {
      //   count: result.data?.length || 0,
      //   totalItems: result.pagination?.totalItems || 0,
      // });

      // Format contacts for display
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map((contact) => this.formatContact(contact));
      }

      return result;
    } catch (error) {
      console.error("[ContactsService] Error fetching contacts:", error);
      throw error;
    }
  },

  /**
   * Get a single contact by ID
   * @param {string} token - Authentication token
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Contact data
   */
  async getContactById(token, contactId) {
    try {
      console.log("[ContactsService] Fetching contact by ID:", contactId);

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.CONTACT_BY_ID}/${contactId}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(
        "[ContactsService] Successfully fetched contact:",
        result.data?.id
      );

      return result;
    } catch (error) {
      console.error("[ContactsService] Error fetching contact by ID:", error);
      throw error;
    }
  },

  /**
   * Search contacts
   * @param {string} token - Authentication token
   * @param {string} query - Search query
   * @param {Object} options - Additional search options
   * @returns {Promise<Object>} Search results
   */
  async searchContacts(token, query, options = {}) {
    try {
      console.log("[ContactsService] Searching contacts:", { query, options });

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const params = new URLSearchParams({
        q: query,
        ...options,
      });

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.CONTACT_SEARCH}?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[ContactsService] Search results:", {
        count: result.data?.length || 0,
        query,
      });

      // Format search results for display
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map((contact) => this.formatContact(contact));
      }

      return result;
    } catch (error) {
      console.error("[ContactsService] Error searching contacts:", error);
      throw error;
    }
  },

  /**
   * Get contact statistics
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Contact statistics
   */
  async getContactStats(token) {
    try {
      console.log("[ContactsService] Fetching contact statistics");

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(`${baseUrl}${ENDPOINTS.CONTACT_STATS}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[ContactsService] Successfully fetched contact stats");

      return result;
    } catch (error) {
      console.error("[ContactsService] Error fetching contact stats:", error);
      throw error;
    }
  },

  /**
   * Create a new contact
   * @param {string} token - Authentication token
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   */
  async createContact(token, contactData) {
    try {
      console.log("[ContactsService] Creating contact:", contactData.firstName);

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(`${baseUrl}${ENDPOINTS.CONTACTS}`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log(
        "[ContactsService] Successfully created contact:",
        result.data?.id
      );

      return result;
    } catch (error) {
      console.error("[ContactsService] Error creating contact:", error);
      throw error;
    }
  },

  /**
   * Update a contact
   * @param {string} token - Authentication token
   * @param {string} contactId - Contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise<Object>} Updated contact
   */
  async updateContact(token, contactId, contactData) {
    try {
      console.log("[ContactsService] Updating contact:", contactId);

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.CONTACT_BY_ID}/${contactId}`,
        {
          method: "PUT",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(contactData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[ContactsService] Successfully updated contact:", contactId);

      return result;
    } catch (error) {
      console.error("[ContactsService] Error updating contact:", error);
      throw error;
    }
  },

  /**
   * Delete a contact
   * @param {string} token - Authentication token
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteContact(token, contactId) {
    try {
      console.log("[ContactsService] Deleting contact:", contactId);

      let authHeader;
      if (token.startsWith("Bearer ")) {
        authHeader = token;
      } else {
        authHeader = `Bearer ${token}`;
      }

      const rawBaseUrl = getApiBaseUrl();
      // Check if the base URL already includes the API path
      const baseUrl = rawBaseUrl.includes("/mayday-api/api")
        ? rawBaseUrl
        : normalizeApiBaseUrl(rawBaseUrl);
      const response = await fetch(
        `${baseUrl}${ENDPOINTS.CONTACT_BY_ID}/${contactId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("[ContactsService] Successfully deleted contact:", contactId);

      return result;
    } catch (error) {
      console.error("[ContactsService] Error deleting contact:", error);
      throw error;
    }
  },

  /**
   * Format contact for display
   * @param {Object} contact - Contact object from API
   * @returns {Object} Formatted contact
   */
  formatContact(contact) {
    return {
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName || ""}`.trim(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      jobTitle: contact.jobTitle,
      primaryPhone: contact.primaryPhone,
      secondaryPhone: contact.secondaryPhone,
      email: contact.email,
      website: contact.website,
      address: contact.address,
      city: contact.city,
      state: contact.state,
      country: contact.country,
      postalCode: contact.postalCode,
      contactType: contact.contactType,
      status: contact.status,
      priority: contact.priority,
      tags: contact.tags || [],
      notes: contact.notes,
      assignedAgentId: contact.assignedAgentId,
      lastInteraction: contact.lastInteraction,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
      // Display helpers
      displayName: `${contact.firstName} ${contact.lastName || ""}`.trim(),
      displayPhone:
        contact.primaryPhone || contact.secondaryPhone || "No phone",
      displayEmail: contact.email || "No email",
      displayCompany: contact.company || "No company",
    };
  },
};

export default contactsService;
