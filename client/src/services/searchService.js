import apiClient from "./apiClient";

const searchService = {
  // Global search across all entities
  globalSearch: async (query, limit = 10) => {
    try {
      // console.log(
      //   "Global search called with query:",
      //   JSON.stringify(query),
      //   "limit:",
      //   limit
      // );
      // console.log("Query type:", typeof query, "Length:", query?.length);

      // More robust validation
      const trimmedQuery = query?.toString().trim();
      if (!trimmedQuery || trimmedQuery.length < 2) {
        console.log("Query too short, returning empty results");
        return {
          results: {
            guests: [],
            orders: [],
            reservations: [],
            menuItems: [],
            inventory: [],
            staff: [],
            events: [],
            tickets: [],
          },
          total: 0,
        };
      }

      // console.log("Making API call with query:", trimmedQuery);
      const response = await apiClient.get(
        `/search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Global search error:", error);

      // Handle validation errors gracefully
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("validation")
      ) {
        // console.log("Validation error from backend, returning empty results");
        return {
          results: {
            guests: [],
            orders: [],
            reservations: [],
            menuItems: [],
            inventory: [],
            staff: [],
            events: [],
            tickets: [],
          },
          total: 0,
        };
      }

      throw error;
    }
  },

  // Quick search for autocomplete/suggestions
  quickSearch: async (query, type = null) => {
    try {
      console.log(
        "Quick search called with query:",
        JSON.stringify(query),
        "type:",
        type
      );
      // console.log("Query type:", typeof query, "Length:", query?.length);

      // More robust validation
      const trimmedQuery = query?.toString().trim();
      if (!trimmedQuery || trimmedQuery.length < 2) {
        console.log("Query too short, returning empty suggestions");
        return { suggestions: [] };
      }

      // console.log("Making API call with query:", trimmedQuery);
      const url = type
        ? `/search/quick?q=${encodeURIComponent(
            trimmedQuery
          )}&type=${encodeURIComponent(type)}`
        : `/search/quick?q=${encodeURIComponent(trimmedQuery)}`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Quick search error:", error);

      // Handle validation errors gracefully
      if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes("validation")
      ) {
        console.log(
          "Validation error from backend, returning empty suggestions"
        );
        return { suggestions: [] };
      }

      throw error;
    }
  },

  // Search specific entity types
  searchGuests: async (query) => {
    try {
      const response = await apiClient.get(
        `/guests/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    } catch (error) {
      console.error("Search guests error:", error);
      throw error;
    }
  },

  searchOrders: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/orders?search=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search orders error:", error);
      throw error;
    }
  },

  searchReservations: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/reservations?search=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search reservations error:", error);
      throw error;
    }
  },

  searchMenuItems: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/menu?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search menu items error:", error);
      throw error;
    }
  },

  searchInventory: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/inventory?search=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search inventory error:", error);
      throw error;
    }
  },

  searchStaff: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/staff?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search staff error:", error);
      throw error;
    }
  },

  searchEvents: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/events?search=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search events error:", error);
      throw error;
    }
  },

  searchTickets: async (query, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/tickets?search=${encodeURIComponent(
          query
        )}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Search tickets error:", error);
      throw error;
    }
  },
};

export default searchService;
