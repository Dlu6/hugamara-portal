import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Constants from "expo-constants";
import { useSelector } from "react-redux";

export default function SettingsScreen() {
  const extra = Constants?.expoConfig?.extra || {};
  const { registered, registering, domain } = useSelector((s) => s.sip);
  const { user } = useSelector((s) => s.auth);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.label}>SIP Status</Text>
        <Text style={styles.value}>
          {registering
            ? "Registering…"
            : registered
            ? "Registered"
            : "Not Registered"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>User</Text>
        <Text style={styles.value}>{user?.email || "—"}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>API Base URL</Text>
        <Text style={styles.value}>
          {extra.API_BASE_URL || "Auto (emulator/VM logic)"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>SIP Domain</Text>
        <Text style={styles.value}>{extra.SIP_DOMAIN || domain || "—"}</Text>
      </View>

      <TouchableOpacity style={styles.testBtn}>
        <Text style={styles.testText}>Send Test Notification</Text>
      </TouchableOpacity>
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
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  label: { color: "#9CA3AF", marginBottom: 6 },
  value: { color: "#FFFFFF", fontWeight: "600" },
  testBtn: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    marginTop: 8,
  },
  testText: { color: "#FFFFFF", fontWeight: "700" },
});
