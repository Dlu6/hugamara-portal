import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { endCall } from "../../store/slices/callSlice";
import { hangupCall, toggleHold, toggleMute } from "../../services/sipClient";

export default function CallScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const number = route?.params?.number || "Unknown";
  const callState = useSelector((s) => s.call.active);
  const { isMuted, isOnHold, status } = callState || {};

  const [speaker, setSpeaker] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleHangup = () => {
    hangupCall();
    dispatch(endCall());
    navigation.replace("Main", { screen: "Dialer" });
  };

  const format = (s) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `${m}:${r}`;
  };

  const getStatusText = () => {
    if (isOnHold) return "On Hold";
    if (status === "connecting") return "Connecting...";
    if (status === "ringing") return "Ringing...";
    if (status === "active") return "Call Accepted";
    if (status === "connected") return "Connected";
    return "In Call";
  };

  const getStatusColor = () => {
    if (isOnHold) return "#F59E0B";
    if (status === "connecting") return "#8E8E93";
    if (status === "ringing") return "#3B82F6";
    if (status === "active") return "#10B981";
    if (status === "connected") return "#34C759";
    return "#34C759";
  };

  return (
    <View style={styles.container}>
      {/* Call Info Section */}
      <View style={styles.callInfoSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color="#FFFFFF" />
        </View>

        <Text style={styles.number}>{number}</Text>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        <Text style={styles.timer}>{format(seconds)}</Text>
      </View>

      {/* Control Buttons Grid */}
      <View style={styles.controlsSection}>
        <View style={styles.controlsGrid}>
          {/* Row 1 */}
          <ControlButton
            icon={isMuted ? "mic-off" : "mic"}
            label={isMuted ? "Unmute" : "Mute"}
            onPress={toggleMute}
            active={isMuted}
          />
          <ControlButton
            icon="keypad"
            label="Keypad"
            onPress={() => {
              /* TODO: Implement keypad modal */
            }}
          />

          {/* Row 2 */}
          <ControlButton
            icon={speaker ? "volume-high" : "volume-low"}
            label={speaker ? "Speaker" : "Speaker"}
            onPress={() => setSpeaker(!speaker)}
            active={speaker}
          />
          <ControlButton
            icon={isOnHold ? "play" : "pause"}
            label={isOnHold ? "Resume" : "Hold"}
            onPress={toggleHold}
            active={isOnHold}
          />
        </View>
      </View>

      {/* Hang Up Button */}
      <View style={styles.hangupSection}>
        <TouchableOpacity onPress={handleHangup} style={styles.hangupButton}>
          <Ionicons name="call" size={32} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.hangupLabel}>End Call</Text>
      </View>
    </View>
  );
}

function ControlButton({ icon, label, onPress, active }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.controlButton, active && styles.controlButtonActive]}
    >
      <Ionicons name={icon} size={28} color="#FFFFFF" />
      <Text style={styles.controlLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  callInfoSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  number: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  timer: {
    color: "#8E8E93",
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  controlsSection: {
    paddingVertical: 24,
  },
  controlsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 8,
  },
  controlButtonActive: {
    backgroundColor: "#3A3A3C",
  },
  controlLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    letterSpacing: -0.1,
  },
  hangupSection: {
    alignItems: "center",
    paddingTop: 32,
  },
  hangupButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "135deg" }],
    shadowColor: "#FF3B30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
  },
  hangupLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
});
