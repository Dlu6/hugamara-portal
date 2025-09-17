import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { setConnecting } from '../../store/slices/sipSlice';
import { initializeSIP } from '../../services/sipClient';
import Constants from 'expo-constants';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { status } = useSelector((s) => s.auth);

  const onLogin = async () => {
    try {
      // Compute host like the chrome extension: /mayday-api on *.hugamara.com else /api
      const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
      const base = process.env.EXPO_PUBLIC_API_BASE_URL || extra.API_BASE_URL;
      let host = base;
      if (!host) {
        const sipDomain = process.env.EXPO_PUBLIC_SIP_DOMAIN || extra.SIP_DOMAIN || '';
        if ((/(^|\.)hugamara\.com$/i).test(sipDomain || '')) {
          host = `https://${sipDomain}/mayday-api`;
        } else {
          host = 'http://10.0.2.2:8004/api';
        }
      }

      const res = await dispatch(login({ email, password, hostOverride: host })).unwrap();
      dispatch(setConnecting(true));
      const data = res?.data || res;
      const pjsip = data?.user?.pjsip || {};
      try {
        const ok = await initializeSIP({
          server: pjsip.server,
          extension: data?.user?.extension,
          password: pjsip.password || password,
          wsServers: pjsip.ws_servers || [],
          iceServers: pjsip.ice_servers || []
        });
        if (!ok) {
          console.warn('SIP init skipped or failed (likely Expo Go without Dev Client). Navigating anyway.');
        }
      } catch (sipErr) {
        console.warn('SIP init error:', sipErr?.message);
      }
      navigation.replace('Dialer');
    } catch (e) {
      console.warn('Login error:', e?.message);
    } finally {
      dispatch(setConnecting(false));
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
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity onPress={onLogin} style={styles.button}>
        <Text style={styles.buttonText}>{status === 'loading' ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A', padding: 24, justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: '600', marginBottom: 24 },
  input: { backgroundColor: '#111827', color: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#1F2937' },
  button: { backgroundColor: '#111827', padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#374151', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  buttonText: { color: '#FFFFFF', fontWeight: '600' }
});
