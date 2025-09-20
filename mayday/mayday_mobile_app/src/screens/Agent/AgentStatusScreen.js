import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAgentStatus,
  pauseAgent,
  unpauseAgent,
  fetchAgentProfile,
} from "../../store/slices/agentSlice";

export default function AgentStatusScreen() {
  const dispatch = useDispatch();
  const { isPaused, pauseReason, status, profile } = useSelector(
    (s) => s.agent
  );
  const { user, extension } = useSelector((s) => s.auth);

  useEffect(() => {
    // Fetch initial status and profile when the component mounts
    dispatch(fetchAgentStatus());
    dispatch(fetchAgentProfile());
  }, [dispatch]);

  const handleTogglePause = () => {
    if (isPaused) {
      dispatch(unpauseAgent());
    } else {
      // For now, we use a default reason. A modal could be added later.
      dispatch(pauseAgent("Manual Pause"));
    }
  };

  const isLoading = status === "loading";

  const email = profile?.email || user?.email || "—";
  const localPart = typeof email === "string" ? email.split("@")[0] : "—";
  const name =
    profile?.fullName ||
    profile?.full_name ||
    profile?.username ||
    profile?.name ||
    user?.fullName ||
    user?.username ||
    user?.name ||
    localPart ||
    "—";
  const ext = profile?.extension || extension || user?.extension || "—";

  // Status indicator mapping
  let statusText = "Available";
  let statusColor = "#22C55E"; // green
  if (status === "loading") {
    statusText = "Updating…";
    statusColor = "#F59E0B"; // amber
  } else if (status === "failed") {
    statusText = "Error";
    statusColor = "#EF4444"; // red
  } else if (isPaused) {
    statusText = `Paused${pauseReason ? ` (${pauseReason})` : ""}`;
    statusColor = "#EF4444"; // red
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Status</Text>

      {/* Agent Details */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Agent Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.valueStrong}>{name}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{email}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Extension</Text>
          <Text style={styles.value}>{ext}</Text>
        </View>
      </View>

      {/* Pause/Availability */}
      <View style={styles.card}>
        <Text style={styles.label}>Current Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={styles.value}>{statusText}</Text>
        </View>

        <TouchableOpacity
          onPress={handleTogglePause}
          style={[styles.btn, isPaused && styles.btnActive]}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnText}>{isPaused ? "Resume" : "Pause"}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0A", padding: 24 },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 12,
  },
  sectionTitle: { color: "#9CA3AF", marginBottom: 8, fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  label: { color: "#9CA3AF", marginBottom: 6 },
  value: { color: "#FFFFFF", fontWeight: "600" },
  valueStrong: { color: "#FFFFFF", fontWeight: "700" },
  valueBlock: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginBottom: 16,
    fontSize: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 10 },
  btn: {
    backgroundColor: "#1D4ED8",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnActive: {
    backgroundColor: "#B91C1C", // Red when paused
  },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
