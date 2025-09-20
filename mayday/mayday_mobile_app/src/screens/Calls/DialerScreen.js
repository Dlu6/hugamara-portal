import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";
import { makeCall } from "../../services/sipClient";

export default function DialerScreen({ navigation }) {
  const [number, setNumber] = useState("");
  const { registered } = useSelector((s) => s.sip);

  const call = () => {
    if (!registered || !number) return;
    // The useSIP hook will now handle dispatching the call action and navigating
    makeCall(number);
  };

  const append = (digit) => setNumber((prev) => `${prev}${digit}`);
  const backspace = () => setNumber((prev) => prev.slice(0, -1));
  const clearAll = () => setNumber("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Dialer {registered ? "• Registered" : "• Not Registered"}
      </Text>

      <View style={styles.numberDisplayWrap}>
        <TextInput
          style={styles.numberDisplay}
          value={number}
          onChangeText={setNumber}
          placeholder="Enter number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />
        <View style={styles.editRow}>
          <TouchableOpacity
            onPress={backspace}
            onLongPress={clearAll}
            style={styles.editBtn}
          >
            <Text style={styles.editText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map(
          (d) => (
            <TouchableOpacity
              key={d}
              onPress={() => append(d)}
              style={styles.key}
            >
              <Text style={styles.keyText}>{d}</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <TouchableOpacity
        onPress={call}
        style={[styles.callBtn, (!registered || !number) && styles.disabledBtn]}
        disabled={!registered || !number}
      >
        <Text style={styles.callText}>Call</Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => navigation.navigate("History")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={styles.secondaryBtn}
        >
          <Text style={styles.secondaryText}>Settings</Text>
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
    fontWeight: "600",
    marginBottom: 16,
  },
  numberDisplayWrap: {
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  numberDisplay: { color: "#FFFFFF", fontSize: 22, paddingVertical: 8 },
  editRow: { flexDirection: "row", justifyContent: "flex-end" },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#0F172A",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  editText: { color: "#FFFFFF", fontWeight: "700" },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: 12,
    rowGap: 12,
  },
  key: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  keyText: { color: "#FFFFFF", fontSize: 22, fontWeight: "700" },
  callBtn: {
    backgroundColor: "#0B9246",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  callText: { color: "#FFFFFF", fontWeight: "700" },
  disabledBtn: { opacity: 0.5 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 12,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  secondaryText: { color: "#FFFFFF", fontWeight: "600" },
});
