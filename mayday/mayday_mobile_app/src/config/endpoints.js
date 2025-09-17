import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

function computeBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL || extra.API_BASE_URL;
  if (explicit) return explicit; // honor explicit config

  const sipDomain = process.env.EXPO_PUBLIC_SIP_DOMAIN || extra.SIP_DOMAIN;
  if (sipDomain && /(^|\.)hugamara\.com$/i.test(sipDomain)) {
    // Use production ingress path used by chrome softphone
    return `https://${sipDomain}/mayday-api`;
  }

  // Local development defaults
  if (Platform.OS === 'android') {
    // Android emulator maps host loopback to 10.0.2.2
    return 'http://10.0.2.2:8004/api';
  }
  // iOS simulator/mac
  return 'http://127.0.0.1:8004/api';
}

export const ENDPOINTS = {
  BASE_URL: computeBaseUrl(),
  LOGIN: '/users/agent-login',
  LICENSE_CURRENT: '/licenses/current',
  CREATE_SESSION: '/licenses/create-session',
  END_SESSION: '/licenses/end-session'
};
