import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchContacts,
  searchContacts,
  setSearchQuery,
  clearSearchResults,
  setFilters,
  clearErrors,
} from "../../store/slices/contactsSlice";

export default function ContactsScreen({ navigation }) {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Redux state
  const {
    contacts,
    searchResults,
    loading,
    loadingSearch,
    error,
    searchError,
    isSearching,
    pagination,
    filters,
  } = useSelector((state) => state.contacts);

  // Debug Redux state
  // console.log("[ContactsScreen] Redux state:", {
  //   contactsCount: contacts.length,
  //   searchResultsCount: searchResults.length,
  //   loading,
  //   loadingSearch,
  //   error,
  //   searchError,
  //   isSearching,
  //   pagination,
  //   filters,
  // });

  const {
    token,
    user,
    extension,
    status: authStatus,
  } = useSelector((state) => state.auth);

  // Debug auth state
  // console.log("[ContactsScreen] Auth state:", {
  //   token: token ? "present" : "missing",
  //   user: user ? user.email || "present" : "missing",
  //   extension: extension || "missing",
  //   authStatus,
  // });

  // Load contacts on mount
  useEffect(() => {
    // console.log(
    //   "[ContactsScreen] useEffect - token:",
    //   token ? "present" : "missing"
    // );
    // console.log("[ContactsScreen] useEffect - filters:", filters);
    // console.log("[ContactsScreen] useEffect - authStatus:", authStatus);

    if (token && authStatus === "succeeded") {
      // console.log("[ContactsScreen] Fetching contacts...");
      dispatch(fetchContacts(filters));
    } else if (!token || authStatus === "failed") {
      console.log(
        "[ContactsScreen] No token or auth failed - redirecting to login"
      );
      // Redirect to login screen
      navigation.navigate("Login");
    }
  }, [dispatch, token, authStatus, navigation]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim()) {
      const timeout = setTimeout(() => {
        dispatch(setSearchQuery(query));
        dispatch(searchContacts({ query, options: {} }));
      }, 500);
      setSearchTimeout(timeout);
    } else {
      dispatch(clearSearchResults());
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [query, dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Handle refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSearching && query.trim()) {
        await dispatch(searchContacts({ query, options: {} }));
      } else {
        await dispatch(fetchContacts(filters));
      }
    } catch (error) {
      console.error("Error refreshing contacts:", error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, isSearching, query, filters]);

  // Handle contact press
  const handleContactPress = (contact) => {
    // Navigate to contact detail screen
    if (navigation) {
      navigation.navigate("ContactDetail", { contactId: contact.id });
    } else {
      console.log("Contact pressed:", contact);
    }
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && pagination.currentPage < pagination.totalPages) {
      const nextPage = pagination.currentPage + 1;
      dispatch(fetchContacts({ ...filters, page: nextPage }));
    }
  };

  // Render contact item
  const renderContactItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => handleContactPress(item)}
    >
      <View style={styles.contactHeader}>
        <Text style={styles.name}>{item.displayName}</Text>
        {item.company && (
          <Text style={styles.company}>{item.displayCompany}</Text>
        )}
      </View>
      <View style={styles.contactDetails}>
        {item.displayPhone !== "No phone" && (
          <View style={styles.contactRow}>
            <Ionicons name="call" size={14} color="#22C55E" />
            <Text style={styles.phone}> {item.displayPhone}</Text>
          </View>
        )}
        {item.displayEmail !== "No email" && (
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={14} color="#3B82F6" />
            <Text style={styles.email}> {item.displayEmail}</Text>
          </View>
        )}
      </View>
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTags}>+{item.tags.length - 3} more</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  // Render loading footer
  const renderFooter = () => {
    if (loading && pagination.currentPage > 1) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator color="#3B82F6" size="small" />
          <Text style={styles.loadingText}>Loading more contacts...</Text>
        </View>
      );
    }
    return null;
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#3B82F6" size="large" />
          <Text style={styles.emptyText}>Loading contacts...</Text>
        </View>
      );
    }

    if (isSearching && searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No contacts found for "{query}"</Text>
          <TouchableOpacity
            style={styles.clearSearchButton}
            onPress={() => setQuery("")}
          >
            <Text style={styles.clearSearchText}>Clear search</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No contacts available</Text>
        <Text style={styles.emptySubtext}>
          Contacts will appear here when they are added to the system
        </Text>
      </View>
    );
  };

  // Get data to display
  const displayData = isSearching ? searchResults : contacts;
  const isLoading = loading || loadingSearch;

  // Don't render if user is not authenticated (will redirect to login)
  if (!token || authStatus !== "succeeded") {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#3B82F6" size="large" />
        <Text style={styles.emptyText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contacts</Text>

      {/* Search Input */}
      <TextInput
        style={styles.search}
        placeholder="Search by name, company, or phone"
        placeholderTextColor="#9CA3AF"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Error Display */}
      {(error || searchError) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || searchError}</Text>
        </View>
      )}

      {/* Contacts List */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        renderItem={renderContactItem}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]}
            tintColor="#3B82F6"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />

      {/* Search Status */}
      {isSearching && (
        <View style={styles.searchStatus}>
          <Text style={styles.searchStatusText}>
            Searching for "{query}"...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  search: {
    backgroundColor: "#111827",
    color: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
  },
  item: {
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactHeader: {
    marginBottom: 8,
  },
  name: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 2,
  },
  company: {
    color: "#9CA3AF",
    fontSize: 14,
    fontStyle: "italic",
  },
  contactDetails: {
    marginTop: 8,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  phone: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  email: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#374151",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: "#D1D5DB",
    fontSize: 12,
    fontWeight: "500",
  },
  moreTags: {
    color: "#9CA3AF",
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  clearSearchButton: {
    backgroundColor: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },
  clearSearchText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginLeft: 8,
  },
  searchStatus: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#374151",
  },
  searchStatusText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
  },
});
