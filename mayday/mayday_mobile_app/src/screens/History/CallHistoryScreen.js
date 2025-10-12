import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCallHistory,
  setHistoryFilters,
} from "../../store/slices/callSlice";
import { makeCall } from "../../services/sipClient";

export default function CallHistoryScreen({ navigation }) {
  const dispatch = useDispatch();
  const { token, extension } = useSelector((s) => s.auth);
  const { callHistory, callHistoryLoading, callHistoryError, historyFilters } =
    useSelector((s) => s.call);

  const [searchText, setSearchText] = useState("");

  // Load call history on mount
  useEffect(() => {
    if (token && extension) {
      dispatch(fetchCallHistory({ token, extension, limit: 50 }));
    }
  }, [dispatch, token, extension]);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: callHistory.length,
      inbound: callHistory.filter((c) => c.type === "inbound").length,
      outbound: callHistory.filter((c) => c.type === "outbound").length,
      missed: callHistory.filter((c) => c.status === "missed").length,
    };
  }, [callHistory]);

  // Filter call history based on current filters
  const filteredHistory = useMemo(() => {
    let filtered = callHistory;

    // Filter by type
    if (historyFilters.type !== "all") {
      if (historyFilters.type === "missed") {
        filtered = filtered.filter((call) => call.status === "missed");
      } else {
        filtered = filtered.filter((call) => call.type === historyFilters.type);
      }
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(
        (call) =>
          call.phoneNumber.toLowerCase().includes(searchLower) ||
          (call.name && call.name.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [callHistory, historyFilters.type, searchText]);

  const handleRefresh = () => {
    if (token && extension) {
      dispatch(fetchCallHistory({ token, extension, limit: 50 }));
    }
  };

  const handleFilterChange = (type) => {
    dispatch(setHistoryFilters({ type }));
  };

  const handleCallPress = (call) => {
    if (call.phoneNumber && call.phoneNumber !== "Unknown") {
      // Navigate to Dialer tab and populate the number field
      navigation.navigate("Dialer", {
        prefillNumber: call.phoneNumber,
      });
    } else {
      Alert.alert("Error", "Cannot dial this number");
    }
  };

  const renderCallItem = ({ item }) => {
    const statusInfo = item.statusInfo;

    return (
      <TouchableOpacity
        style={styles.callItem}
        onPress={() => handleCallPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.callItemLeft}>
          <View
            style={[styles.callIcon, { backgroundColor: statusInfo.color }]}
          >
            <Text style={styles.callIconText}>{statusInfo.icon}</Text>
          </View>
          <View style={styles.callDetails}>
            <Text style={styles.callNumber}>{item.displayName}</Text>
            <Text style={styles.callMeta}>
              {item.displayTimestamp} • {item.displayDuration}
            </Text>
            {item.displayCalledNumber && (
              <Text style={styles.calledNumber}>
                {item.displayCalledNumber}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCallPress(item)}
        >
          <Text style={styles.callButtonText}>📞</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (type, label, count) => {
    const isActive = historyFilters.type === type;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => handleFilterChange(type)}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (callHistoryLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.emptyText}>Loading call history...</Text>
        </View>
      );
    }

    if (callHistoryError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.emptyText}>Failed to load call history</Text>
          <Text style={styles.errorText}>{callHistoryError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📞</Text>
        <Text style={styles.emptyText}>No calls found</Text>
        <Text style={styles.emptySubtext}>
          {searchText
            ? "Try adjusting your search"
            : "Your call history will appear here"}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Call History</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={callHistoryLoading}>
          <Text
            style={[
              styles.refreshIcon,
              { color: callHistoryLoading ? "#9CA3AF" : "#22C55E" },
            ]}
          >
            ↻
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by number or name..."
          placeholderTextColor="#9CA3AF"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All", filterCounts.all)}
        {renderFilterButton("inbound", "Inbound", filterCounts.inbound)}
        {renderFilterButton("outbound", "Outbound", filterCounts.outbound)}
        {renderFilterButton("missed", "Missed", filterCounts.missed)}
      </View>

      {/* Call List */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCallItem}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={callHistoryLoading}
            onRefresh={handleRefresh}
            tintColor="#22C55E"
            colors={["#22C55E"]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredHistory.length === 0 ? styles.emptyListContainer : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 24,
    paddingTop: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  clearIcon: {
    color: "#9CA3AF",
    fontSize: 18,
    fontWeight: "bold",
  },
  refreshIcon: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filterContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#1F2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  filterButtonActive: {
    backgroundColor: "#22C55E",
    borderColor: "#22C55E",
  },
  filterButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "600",
  },
  filterButtonTextActive: {
    color: "#FFFFFF",
  },
  callItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  callItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  callIconText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  callDetails: {
    flex: 1,
  },
  callNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  callMeta: {
    color: "#9CA3AF",
    fontSize: 14,
    marginBottom: 2,
  },
  calledNumber: {
    color: "#6B7280",
    fontSize: 12,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  callButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 48,
  },
  errorIcon: {
    fontSize: 48,
  },
  emptyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
