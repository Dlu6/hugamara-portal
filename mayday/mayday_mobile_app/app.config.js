export default ({ config }) => ({
  ...config,
  name: "Mayday Mobile",
  slug: "mayday-mobile",
  scheme: "mayday",
  plugins: ["expo-secure-store", "expo-asset"],
  extra: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL ||
      "https://cs.hugamara.com/mayday-api/api",
    SIP_DOMAIN: process.env.EXPO_PUBLIC_SIP_DOMAIN || "cs.hugamara.com",
    NOTIFICATIONS_CHANNEL_ID: "calls",
    eas: {
      projectId: "aed1f091-fff4-4cf0-ba26-16780122fba4",
    },
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.hugamara.mayday",
    infoPlist: {
      UIBackgroundModes: ["audio", "voip", "processing"],
    },
  },
  android: {
    package: "com.hugamara.mayday",
    permissions: [
      "INTERNET",
      "RECORD_AUDIO",
      "MODIFY_AUDIO_SETTINGS",
      "WAKE_LOCK",
      "FOREGROUND_SERVICE",
      "POST_NOTIFICATIONS",
    ],
  },
});
