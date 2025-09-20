import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { registerSip } from "../../store/slices/sipSlice";

export default function LoginMobileScreen({ navigation }) {
  const [email, setEmail] = useState("mobile@gmail.com");
  const [password, setPassword] = useState("12345");
  const dispatch = useDispatch();
  const authStatus = useSelector((s) => s.auth.status);
  const sipConnecting = useSelector((s) => s.sip.connecting);

  const isLoading = authStatus === "loading" || sipConnecting;

  const onLogin = async () => {
    try {
      const loginResult = await dispatch(login({ email, password })).unwrap();
      const data = loginResult?.data || loginResult;

      if (data && data.user && data.user.pjsip) {
        const pjsip = data.user.pjsip;
        const sipConfig = {
          server: pjsip.server,
          extension: data.user.extension,
          password: pjsip.password, // Use the specific SIP password from the payload
          wsServers: pjsip.ws_servers || [],
          iceServers: pjsip.ice_servers || [],
        };

        // Dispatch the thunk to handle SIP registration
        await dispatch(registerSip(sipConfig)).unwrap();

        // Navigate to the main app screen on successful login and SIP registration
        navigation.replace("Main");
      } else {
        throw new Error(
          "Login response did not include valid SIP credentials."
        );
      }
    } catch (e) {
      console.warn("Login or SIP Registration Error:", e?.message || e);
      // Here you could show an alert to the user
      // Alert.alert("Login Failed", e?.message || "An unknown error occurred.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mayday Mobile</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        onPress={onLogin}
        style={styles.button}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
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
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#111827",
    color: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  button: {
    backgroundColor: "#1D4ED8", // A more prominent blue
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 12,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "600" },
});
