export default ({ config }) => ({
  ...config,
  name: "Mayday Mobile",
  slug: "mayday-mobile",
  scheme: "mayday",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  plugins: ["expo-secure-store", "expo-asset", "expo-font"],
  extra: {
    API_BASE_URL:
      process.env.EXPO_PUBLIC_API_BASE_URL || "https://cs.hugamara.com",
    SIP_DOMAIN: process.env.EXPO_PUBLIC_SIP_DOMAIN || "cs.hugamara.com",
    NOTIFICATIONS_CHANNEL_ID: "calls",
    eas: {
      projectId: "aed1f091-fff4-4cf0-ba26-16780122fba4",
    },
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.mayday",
    infoPlist: {
      UIBackgroundModes: ["audio", "voip", "processing"],
    },
  },
  android: {
    package: "com.mayday",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
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
