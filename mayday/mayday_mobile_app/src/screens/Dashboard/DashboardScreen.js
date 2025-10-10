import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { fetchMyPerformanceStats } from "../../store/slices/dashboardSlice";
import io from "socket.io-client";
import Constants from "expo-constants";
import { getApiBaseUrl } from "../../config/endpoints";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const { stats, status, error } = useSelector((s) => s.dashboard);
  const { user } = useSelector((s) => s.auth);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchMyPerformanceStats("today"));

    // Realtime updates via Socket.IO (best-effort)
    const extra = Constants?.expoConfig?.extra || {};
    const baseUrl = getApiBaseUrl() || extra.API_BASE_URL || "";
    const socketUrl = baseUrl.replace(/\/api$/, "");

    let socket;
    try {
      socket = io(socketUrl, { transports: ["websocket"], path: "/socket.io" });
      socket.on("connect", () => {
        // Optionally authenticate/identify here if backend supports it
      });
      // If backend emits call updates, re-fetch quick personal stats
      const refresh = () => dispatch(fetchMyPerformanceStats("today"));
      socket.on("call_started", refresh);
      socket.on("call_ended", refresh);
      socket.on("stats_updated", refresh);
    } catch (e) {
      // Ignore socket wiring errors; fallback interval below covers updates
    }

    // Fallback polling every 60s to keep numbers fresh if socket is unavailable
    const id = setInterval(
      () => dispatch(fetchMyPerformanceStats("today")),
      60000
    );

    return () => {
      clearInterval(id);
      if (socket && socket.connected) socket.close();
    };
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchMyPerformanceStats("today")).unwrap();
    } finally {
      setRefreshing(false);
    }
  };

  const errorMessage =
    typeof error === "string" ? error : error?.message || "Failed to load";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>
              Good {getTimeOfDay()}
              {user?.username ? `, ${user.username}` : ""}!
            </Text>
            <Text style={styles.screenTitle}>Dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={status === "loading"}
            style={styles.refreshButton}
          >
            <Ionicons
              name="refresh"
              size={20}
              color="#FFFFFF"
              style={[styles.refreshIcon, refreshing && styles.refreshing]}
            />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.totalCalls || 0}</Text>
            <Text style={styles.quickStatLabel}>Total Calls</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {(stats.inbound || 0) - (stats.missed || 0)}
            </Text>
            <Text style={styles.quickStatLabel}>Answered</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats.avgHandleTime || "0:00"}
            </Text>
            <Text style={styles.quickStatLabel}>Avg Time</Text>
          </View>
        </View>
      </View>

      {/* Loading State */}
      {status === "loading" && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3B82F6" size="large" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      )}

      {/* Error State */}
      {status === "failed" && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      {status === "succeeded" && (
        <View style={styles.contentSection}>
          {/* Call Metrics Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Call Metrics</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                icon="arrow-down-circle"
                iconColor="#22C55E"
                title="Inbound"
                value={String(stats.inbound || 0)}
              />
              <MetricCard
                icon="arrow-up-circle"
                iconColor="#3B82F6"
                title="Outbound"
                value={String(stats.outbound || 0)}
              />
              <MetricCard
                icon="close-circle"
                iconColor="#EF4444"
                title="Missed"
                value={String(stats.missed || 0)}
              />
              <MetricCard
                icon="checkmark-circle"
                iconColor="#10B981"
                title="Answered"
                value={String((stats.inbound || 0) - (stats.missed || 0))}
              />
            </View>
          </View>

          {/* Performance Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance</Text>
            <View style={styles.performanceCard}>
              <View style={styles.performanceItem}>
                <View style={styles.performanceIcon}>
                  <Ionicons name="timer" size={24} color="#F59E0B" />
                </View>
                <View style={styles.performanceContent}>
                  <Text style={styles.performanceValue}>
                    {stats.avgHandleTime || "0:00"}
                  </Text>
                  <Text style={styles.performanceLabel}>
                    Average Handle Time
                  </Text>
                </View>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceItem}>
                <View style={styles.performanceIcon}>
                  <Ionicons name="call" size={24} color="#34D399" />
                </View>
                <View style={styles.performanceContent}>
                  <Text style={styles.performanceValue}>
                    {stats.totalCalls || 0}
                  </Text>
                  <Text style={styles.performanceLabel}>Total Calls Today</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

function MetricCard({ icon, title, value, iconColor }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View
          style={[styles.metricIcon, { backgroundColor: iconColor + "20" }]}
        >
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );
}

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header Section - Apple-style with pronounced shadows
  headerSection: {
    backgroundColor: "#1C1C1E",
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },
  greeting: {
    color: "#8E8E93",
    textTransform: "capitalize",
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  screenTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  refreshButton: {
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A3A3C",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  refreshIcon: {
    transform: [{ rotate: "0deg" }],
    marginRight: 6,
  },
  refreshing: {
    transform: [{ rotate: "180deg" }],
  },
  refreshText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  // Quick Stats - Apple card style with pronounced shadows
  quickStatsRow: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  quickStatItem: {
    flex: 1,
    alignItems: "center",
  },
  quickStatValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  quickStatLabel: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: "#3A3A3C",
    marginHorizontal: 20,
  },

  // Content Section
  contentSection: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    letterSpacing: -0.4,
  },

  // Metrics Grid - Apple card grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: "#2C2C2E",
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 7,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 16,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  metricTitle: {
    color: "#8E8E93",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: -0.1,
  },

  // Performance Card - Apple style with pronounced shadows
  performanceCard: {
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  performanceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  performanceIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceContent: {
    flex: 1,
  },
  performanceValue: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  performanceLabel: {
    color: "#8E8E93",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  performanceDivider: {
    height: 1,
    backgroundColor: "#3A3A3C",
    marginVertical: 20,
  },

  // Loading & Error States - Apple style
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    color: "#8E8E93",
    fontSize: 15,
    marginTop: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 17,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 24,
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
