import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import contactsService from "../../services/contactsService";

// Async thunks
export const fetchContacts = createAsyncThunk(
  "contacts/fetchContacts",
  async (options = {}, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.getContacts(token, options);
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error fetching contacts:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContactById = createAsyncThunk(
  "contacts/fetchContactById",
  async (contactId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.getContactById(token, contactId);
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error fetching contact by ID:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const searchContacts = createAsyncThunk(
  "contacts/searchContacts",
  async ({ query, options = {} }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.searchContacts(
        token,
        query,
        options
      );
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error searching contacts:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchContactStats = createAsyncThunk(
  "contacts/fetchContactStats",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.getContactStats(token);
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error fetching contact stats:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const createContact = createAsyncThunk(
  "contacts/createContact",
  async (contactData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.createContact(token, contactData);
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error creating contact:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateContact = createAsyncThunk(
  "contacts/updateContact",
  async ({ contactId, contactData }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.updateContact(
        token,
        contactId,
        contactData
      );
      return response;
    } catch (error) {
      console.error("[ContactsSlice] Error updating contact:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const deleteContact = createAsyncThunk(
  "contacts/deleteContact",
  async (contactId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await contactsService.deleteContact(token, contactId);
      return { contactId, response };
    } catch (error) {
      console.error("[ContactsSlice] Error deleting contact:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Contact list data
  contacts: [],
  currentContact: null,
  searchResults: [],

  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  },

  // Statistics
  stats: {
    totalContacts: 0,
    activeContacts: 0,
    inactiveContacts: 0,
    byType: {},
    byStatus: {},
    byPriority: {},
  },

  // Loading states
  loading: false,
  loadingContact: false,
  loadingSearch: false,
  loadingStats: false,
  creating: false,
  updating: false,
  deleting: false,

  // Error states
  error: null,
  contactError: null,
  searchError: null,
  statsError: null,
  createError: null,
  updateError: null,
  deleteError: null,

  // Filters and search
  filters: {
    search: "",
    contactType: "",
    status: "all",
    priority: "",
    tags: "",
    assignedAgentId: "",
    sortBy: "lastInteraction",
    sortOrder: "DESC",
  },

  // UI state
  searchQuery: "",
  isSearching: false,
  lastSearchQuery: "",
};

// Slice
const contactsSlice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    // Clear errors
    clearErrors: (state) => {
      state.error = null;
      state.contactError = null;
      state.searchError = null;
      state.statsError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    // Clear search results
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.isSearching = false;
      state.searchError = null;
    },

    // Set filters
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = {
        search: "",
        contactType: "",
        status: "all",
        priority: "",
        tags: "",
        assignedAgentId: "",
        sortBy: "lastInteraction",
        sortOrder: "DESC",
      };
    },

    // Set search query
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },

    // Clear current contact
    clearCurrentContact: (state) => {
      state.currentContact = null;
      state.contactError = null;
    },

    // Update contact in list (for optimistic updates)
    updateContactInList: (state, action) => {
      const { contactId, updates } = action.payload;
      const index = state.contacts.findIndex(
        (contact) => contact.id === contactId
      );
      if (index !== -1) {
        state.contacts[index] = { ...state.contacts[index], ...updates };
      }
    },

    // Remove contact from list (for optimistic deletes)
    removeContactFromList: (state, action) => {
      const contactId = action.payload;
      state.contacts = state.contacts.filter(
        (contact) => contact.id !== contactId
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch contacts
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch contact by ID
    builder
      .addCase(fetchContactById.pending, (state) => {
        state.loadingContact = true;
        state.contactError = null;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.loadingContact = false;
        state.currentContact = action.payload.data;
        state.contactError = null;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.loadingContact = false;
        state.contactError = action.payload;
      });

    // Search contacts
    builder
      .addCase(searchContacts.pending, (state) => {
        state.loadingSearch = true;
        state.isSearching = true;
        state.searchError = null;
      })
      .addCase(searchContacts.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchResults = action.payload.data || [];
        state.lastSearchQuery = state.searchQuery;
        state.searchError = null;
      })
      .addCase(searchContacts.rejected, (state, action) => {
        state.loadingSearch = false;
        state.isSearching = false;
        state.searchError = action.payload;
      });

    // Fetch contact stats
    builder
      .addCase(fetchContactStats.pending, (state) => {
        state.loadingStats = true;
        state.statsError = null;
      })
      .addCase(fetchContactStats.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.stats = action.payload.data || state.stats;
        state.statsError = null;
      })
      .addCase(fetchContactStats.rejected, (state, action) => {
        state.loadingStats = false;
        state.statsError = action.payload;
      });

    // Create contact
    builder
      .addCase(createContact.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        state.creating = false;
        if (action.payload.data) {
          state.contacts.unshift(action.payload.data);
          state.pagination.totalItems += 1;
        }
        state.createError = null;
      })
      .addCase(createContact.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload;
      });

    // Update contact
    builder
      .addCase(updateContact.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        state.updating = false;
        if (action.payload.data) {
          const index = state.contacts.findIndex(
            (contact) => contact.id === action.payload.data.id
          );
          if (index !== -1) {
            state.contacts[index] = action.payload.data;
          }
          if (state.currentContact?.id === action.payload.data.id) {
            state.currentContact = action.payload.data;
          }
        }
        state.updateError = null;
      })
      .addCase(updateContact.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload;
      });

    // Delete contact
    builder
      .addCase(deleteContact.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.deleting = false;
        const { contactId } = action.payload;
        state.contacts = state.contacts.filter(
          (contact) => contact.id !== contactId
        );
        if (state.currentContact?.id === contactId) {
          state.currentContact = null;
        }
        state.pagination.totalItems = Math.max(
          0,
          state.pagination.totalItems - 1
        );
        state.deleteError = null;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload;
      });
  },
});

// Export actions
export const {
  clearErrors,
  clearSearchResults,
  setFilters,
  resetFilters,
  setSearchQuery,
  clearCurrentContact,
  updateContactInList,
  removeContactFromList,
} = contactsSlice.actions;

// Export reducer
export default contactsSlice.reducer;
