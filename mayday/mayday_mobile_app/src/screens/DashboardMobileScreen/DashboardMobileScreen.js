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
import Icon from "../../utils/icons";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMyPerformanceStats,
  fetchSystemStats,
  fetchQueueStatus,
  fetchActiveAgents,
  fetchActiveCalls,
  setTimeRange,
} from "../../store/slices/dashboardSlice";
import io from "socket.io-client";
import Constants from "expo-constants";
import { getApiBaseUrl } from "../../config/endpoints";

const { width } = Dimensions.get("window");

export default function DashboardMobileScreen() {
  const dispatch = useDispatch();
  const {
    stats,
    systemStats,
    queueStatus,
    activeAgents,
    activeCalls,
    timeRange,
    status,
    systemStatsStatus,
    queueStatusStatus,
    activeAgentsStatus,
    activeCallsStatus,
    error,
  } = useSelector((s) => s.dashboard);
  const { user } = useSelector((s) => s.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRangeIndex, setTimeRangeIndex] = useState(0);

  useEffect(() => {
    // Fetch all dashboard data
    const timeRanges = ["today", "week", "month"];
    const currentTimeRange = timeRanges[timeRangeIndex];

    dispatch(fetchMyPerformanceStats(currentTimeRange));
    dispatch(fetchSystemStats(currentTimeRange));
    dispatch(fetchQueueStatus());
    dispatch(fetchActiveAgents());
    dispatch(fetchActiveCalls());

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
      // If backend emits call updates, re-fetch all stats
      const refresh = () => {
        dispatch(fetchMyPerformanceStats(currentTimeRange));
        dispatch(fetchSystemStats(currentTimeRange));
        dispatch(fetchQueueStatus());
        dispatch(fetchActiveAgents());
        dispatch(fetchActiveCalls());
      };
      socket.on("call_started", refresh);
      socket.on("call_ended", refresh);
      socket.on("stats_updated", refresh);
      socket.on("agent_status_changed", refresh);
    } catch (e) {
      // Ignore socket wiring errors; fallback interval below covers updates
    }

    // Fallback polling every 60s to keep numbers fresh if socket is unavailable
    const id = setInterval(() => {
      dispatch(fetchMyPerformanceStats(currentTimeRange));
      dispatch(fetchSystemStats(currentTimeRange));
      dispatch(fetchQueueStatus());
      dispatch(fetchActiveAgents());
      dispatch(fetchActiveCalls());
    }, 60000);

    return () => {
      clearInterval(id);
      if (socket && socket.connected) socket.close();
    };
  }, [dispatch, timeRangeIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const timeRanges = ["today", "week", "month"];
      const currentTimeRange = timeRanges[timeRangeIndex];

      await Promise.all([
        dispatch(fetchMyPerformanceStats(currentTimeRange)).unwrap(),
        dispatch(fetchSystemStats(currentTimeRange)).unwrap(),
        dispatch(fetchQueueStatus()).unwrap(),
        dispatch(fetchActiveAgents()).unwrap(),
        dispatch(fetchActiveCalls()).unwrap(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTimeRangeChange = (index) => {
    setTimeRangeIndex(index);
    dispatch(setTimeRange(index));
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
            <Icon
              name="refresh"
              size={20}
              color="#FFFFFF"
              style={[styles.refreshIcon, refreshing && styles.refreshing]}
            />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <View style={styles.timeRangeTabs}>
            {["Today", "Week", "Month"].map((label, index) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.timeRangeTab,
                  timeRangeIndex === index && styles.timeRangeTabActive,
                ]}
                onPress={() => handleTimeRangeChange(index)}
              >
                <Text
                  style={[
                    styles.timeRangeTabText,
                    timeRangeIndex === index && styles.timeRangeTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* System Overview Stats */}
        <View style={styles.systemOverviewContainer}>
          <Text style={styles.systemOverviewTitle}>System Overview</Text>
          <View style={styles.systemStatsGrid}>
            <SystemStatCard
              icon="call"
              iconColor="#2196F3"
              title="Waiting Calls"
              value={systemStats.activeCalls || 0}
              subtitle="Active Calls"
            />
            <SystemStatCard
              icon="checkmark-circle"
              iconColor="#4CAF50"
              title="Answered Calls"
              value={systemStats.answeredCalls || 0}
              subtitle={
                timeRangeIndex === 0
                  ? "Today"
                  : timeRangeIndex === 1
                  ? "This Week"
                  : "This Month"
              }
            />
            <SystemStatCard
              icon="close-circle"
              iconColor="#F44336"
              title="Abandoned Calls"
              value={systemStats.abandonedCalls || 0}
              subtitle={`${
                timeRangeIndex === 0
                  ? "Today"
                  : timeRangeIndex === 1
                  ? "This Week"
                  : "This Month"
              } (${systemStats.abandonRate || 0}%)`}
            />
            <SystemStatCard
              icon="stats-chart"
              iconColor="#9C27B0"
              title="Total Calls"
              value={systemStats.totalCalls || 0}
              subtitle={
                timeRangeIndex === 0
                  ? "Today"
                  : timeRangeIndex === 1
                  ? "This Week"
                  : "This Month"
              }
            />
          </View>
        </View>

        {/* Quick Personal Stats Row */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.totalCalls || 0}</Text>
            <Text style={styles.quickStatLabel}>My Total Calls</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {(stats.inbound || 0) - (stats.missed || 0)}
            </Text>
            <Text style={styles.quickStatLabel}>My Answered</Text>
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

      {/* Loading State - Only show on initial load */}
      {status === "loading" && stats.totalCalls === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#3B82F6" size="large" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      )}

      {/* Error State */}
      {status === "failed" && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color="#EF4444" />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content - Show if we have any data or after first load */}
      {(status === "succeeded" ||
        systemStatsStatus === "succeeded" ||
        stats.totalCalls > 0) && (
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
                  <Icon name="timer" size={24} color="#F59E0B" />
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
                  <Icon name="call" size={24} color="#34D399" />
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
          <Icon name={icon} size={20} color={iconColor} />
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>
  );
}

function SystemStatCard({ icon, title, value, subtitle, iconColor }) {
  return (
    <View style={styles.systemStatCard}>
      <View style={styles.systemStatHeader}>
        <View
          style={[styles.systemStatIcon, { backgroundColor: iconColor + "20" }]}
        >
          <Icon name={icon} size={24} color={iconColor} />
        </View>
      </View>
      <Text style={styles.systemStatValue}>{value}</Text>
      <Text style={styles.systemStatTitle}>{title}</Text>
      {subtitle && <Text style={styles.systemStatSubtitle}>{subtitle}</Text>}
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

  // Time Range Selector
  timeRangeContainer: {
    marginBottom: 24,
  },
  timeRangeTabs: {
    flexDirection: "row",
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 4,
  },
  timeRangeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  timeRangeTabActive: {
    backgroundColor: "#007AFF",
  },
  timeRangeTabText: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
  },
  timeRangeTabTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // System Overview
  systemOverviewContainer: {
    marginBottom: 24,
  },
  systemOverviewTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  systemStatsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  systemStatCard: {
    width: (width - 72) / 2,
    backgroundColor: "#2C2C2E",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  systemStatHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 12,
  },
  systemStatIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  systemStatValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  systemStatTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  systemStatSubtitle: {
    color: "#8E8E93",
    fontSize: 12,
    fontWeight: "400",
    letterSpacing: -0.1,
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
  metricIconEmoji: {
    fontSize: 20,
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
