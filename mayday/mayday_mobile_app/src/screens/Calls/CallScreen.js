import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import {
  hangupCurrent,
  toggleMute,
  toggleHold,
  toggleSpeaker,
} from "../../store/slices/callSlice";
import { getUA } from "../../services/sipClient";

export default function CallScreen({ navigation, route }) {
  const number = route?.params?.number || "Unknown";
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const format = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `${m}:${r}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>In Call</Text>
      <Text style={styles.number}>{number}</Text>
      <Text style={styles.timer}>{format(seconds)}</Text>

      <View style={styles.grid}>
        <TouchableOpacity onPress={() => setMuted(!muted)} style={styles.tile}>
          <Text style={styles.tileText}>{muted ? "Unmute" : "Mute"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setOnHold(!onHold)}
          style={styles.tile}
        >
          <Text style={styles.tileText}>{onHold ? "Resume" : "Hold"}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSpeaker(!speaker)}
          style={styles.tile}
        >
          <Text style={styles.tileText}>
            {speaker ? "Earpiece" : "Speaker"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Dialer")}
          style={styles.tile}
        >
          <Text style={styles.tileText}>Keypad</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => navigation.replace("Dialer")}
        style={styles.hangupBig}
      >
        <Text style={styles.hangupText}>Hang Up</Text>
      </TouchableOpacity>
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
  number: { color: "#9CA3AF", marginTop: 8 },
  timer: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    marginVertical: 20,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    columnGap: 12,
    marginBottom: 24,
  },
  tile: {
    width: "48%",
    backgroundColor: "#111827",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  tileText: { color: "#FFFFFF", fontWeight: "700" },
  hangupBig: {
    backgroundColor: "#B91C1C",
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: "#7F1D1D",
  },
  hangupText: { color: "#FFFFFF", fontWeight: "800", fontSize: 16 },
});
