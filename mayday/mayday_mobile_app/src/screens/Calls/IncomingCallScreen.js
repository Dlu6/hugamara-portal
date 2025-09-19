import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function IncomingCallScreen({ navigation, route }) {
  const caller = route?.params?.caller || "Unknown";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Incoming Call</Text>
      <Text style={styles.sub}>{caller}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.replace("Call", { number: caller })}
          style={[styles.btn, styles.answer]}
        >
          <Text style={styles.btnText}>Answer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.btn, styles.reject]}
        >
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  sub: { color: "#9CA3AF", marginTop: 8, marginBottom: 16 },
  row: { flexDirection: "row", gap: 12 },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 80,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  answer: { backgroundColor: "#0B9246", marginRight: 12 },
  reject: { backgroundColor: "#B91C1C" },
  btnText: { color: "#FFFFFF", fontWeight: "700" },
});
