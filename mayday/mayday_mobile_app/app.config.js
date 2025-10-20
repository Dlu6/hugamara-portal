export default ({ config }) => ({
  ...config,
  name: "Mayday Mobile",
  slug: "mayday-mobile",
  scheme: "mayday",
  version: "1.2.2",
  orientation: "portrait",
  icon: "./assets/mayday-icon.png",
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
    bundleIdentifier: "com.maydaymobile",
    infoPlist: {
      UIBackgroundModes: ["audio", "voip", "processing"],
    },
  },
  android: {
    package: "com.maydaymobile",
    versionCode: 9,
    targetSdkVersion: 35,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#005370",
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
