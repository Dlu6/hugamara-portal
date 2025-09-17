import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function AgentStatusScreen() {
  const [inQueue, setInQueue] = useState(true);
  const [paused, setPaused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Status</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Queue Sign-in</Text>
        <Text style={styles.value}>{inQueue ? "Signed In" : "Signed Out"}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setInQueue(true)} style={styles.btn}>
            <Text style={styles.btnText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setInQueue(false)}
            style={styles.btn}
          >
            <Text style={styles.btnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pause</Text>
        <Text style={styles.value}>{paused ? "Paused" : "Available"}</Text>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setPaused(true)} style={styles.btn}>
            <Text style={styles.btnText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setPaused(false)} style={styles.btn}>
            <Text style={styles.btnText}>Resume</Text>
          </TouchableOpacity>
        </View>
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
  label: { color: "#9CA3AF", marginBottom: 6 },
  value: { color: "#FFFFFF", fontWeight: "700", marginBottom: 8 },
  row: { flexDirection: "row", gap: 12 },
  btn: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#374151",
  },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
