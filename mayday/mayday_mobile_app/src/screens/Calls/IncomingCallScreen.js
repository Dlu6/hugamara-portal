import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { answerCall, hangupCall } from "../../services/sipClient";
import { playRingtone, stopRingtone } from "../../services/ringtoneService";
import { updateCallStatus } from "../../store/slices/callSlice";

export default function IncomingCallScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const caller = route?.params?.caller || "Unknown";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start ringtone
    playRingtone();

    // Create pulsing animation for the incoming call indicator
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      stopRingtone();
      pulse.stop();
    };
  }, [pulseAnim]);

  const handleAnswer = () => {
    stopRingtone(); // Stop before answering
    // Update status to connecting immediately for better UX
    dispatch(updateCallStatus("connecting"));
    answerCall();
    navigation.replace("Call", { number: caller });
  };

  const handleDecline = () => {
    stopRingtone(); // Stop before declining
    hangupCall();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Caller Info Section */}
      <View style={styles.callerSection}>
        <Animated.View
          style={[
            styles.avatarContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons name="person" size={80} color="#FFFFFF" />
        </Animated.View>

        <Text style={styles.incomingText}>Incoming Call</Text>
        <Text style={styles.callerName}>{caller}</Text>
        <Text style={styles.callerSubtext}>Mobile</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          onPress={handleDecline}
          style={[styles.actionButton, styles.declineButton]}
        >
          <Ionicons name="close" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAnswer}
          style={[styles.actionButton, styles.answerButton]}
        >
          <Ionicons name="call" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Action Labels */}
      <View style={styles.labelsSection}>
        <Text style={styles.actionLabel}>Decline</Text>
        <Text style={styles.actionLabel}>Accept</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 100,
    paddingBottom: 60,
    paddingHorizontal: 24,
  },
  callerSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  incomingText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  callerName: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  callerSubtext: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  actionsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 16,
  },
  actionButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  declineButton: {
    backgroundColor: "#FF3B30",
  },
  answerButton: {
    backgroundColor: "#34C759",
  },
  labelsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: -0.2,
    width: 80,
    textAlign: "center",
  },
});
