import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Icon from "../../utils/icons";
import { useSelector } from "react-redux";
import { makeCall } from "../../services/sipClient";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

export default function DialerScreen({ navigation, route }) {
  const [number, setNumber] = useState(route?.params?.prefillNumber || "");
  const { registered, connecting } = useSelector((s) => s.sip);
  const soundRef = useRef(null);

  // Update number if prefillNumber changes
  useEffect(() => {
    if (route?.params?.prefillNumber) {
      setNumber(route.params.prefillNumber);
    }
  }, [route?.params?.prefillNumber]);

  const call = () => {
    if (!registered || !number) return;
    // The useSIP hook will now handle dispatching the call action and navigating
    makeCall(number);
  };

  const playKeyTone = async () => {
    try {
      // Lazily create a short tone from a tiny embedded wav (100ms 440Hz)
      const uri =
        "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQgAAAAgICAfHx8eHh4eHh4dHR0cHBwcG9vb25ubm1tbGxsbGtra2pqampqampqa2tra2xsbG1tbm5ub29vcHBwcHR0dHh4eHh4eH4fHyAgICA=";
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { volume: 0.5 }
        );
        soundRef.current = sound;
      }
      await soundRef.current.replayAsync();
    } catch (_) {}
  };

  const append = async (digit) => {
    setNumber((prev) => `${prev}${digit}`);
    Haptics.selectionAsync();
    playKeyTone();
  };
  const backspace = () => setNumber((prev) => prev.slice(0, -1));
  const clearAll = () => setNumber("");

  let statusText = registered ? "Registered" : "Not Registered";
  let statusColor = registered ? "#22C55E" : "#9CA3AF";
  if (connecting) {
    statusText = "Registering…";
    statusColor = "#F59E0B";
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Dialer</Text>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>

      {/* Number Display */}
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

      {/* Keypad Grid */}
      <View style={styles.keypadContainer}>
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

        {/* Call Button */}
        <View style={styles.callButtonContainer}>
          <TouchableOpacity
            onPress={call}
            style={[
              styles.callBtn,
              (!registered || !number.trim()) && styles.disabledBtn,
            ]}
            disabled={!registered || !number.trim()}
          >
            <Icon name="call" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
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
    marginBottom: 16,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 10 },
  statusText: { 
    color: "#FFFFFF", 
    fontWeight: "600",
    fontSize: 13,
  },
  numberDisplayWrap: {
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 24,
    shadowColor: "white",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  numberDisplay: {
    color: "#FFFFFF",
    fontSize: 22,
    paddingVertical: 10,
    textAlignVertical: "center",
  },
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
  keypadContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 24,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: 12,
    rowGap: 12,
  },
  key: {
    width: "31%",
    height: 70,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  keyText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  callButtonContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 30,
  },
  callBtn: {
    width: 70,
    height: 70,
    backgroundColor: "#22C55E",
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  disabledBtn: { 
    opacity: 0.4,
    backgroundColor: "#6B7280",
  },
});
