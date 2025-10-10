# Mayday Mobile App - Development & Deployment Notes

## Development Setup

### Prerequisites

- Expo account logged in: `npx expo login`
- EAS account/project linked: `npx expo whoami`, `npx expo init:sync` if needed
- **IMPORTANT**: This app requires a custom dev client - DO NOT use Expo Go

### First Time Setup

```bash
cd mayday/mayday_mobile_app
npm install
npx expo install  # Ensure all dependencies are installed
```

### Building Dev Client (Required for Development)

**Option A: EAS Build (Cloud)**

```bash
eas build --profile development --platform android
# Wait for build, then install .apk on device
```

**Option B: Local Build (Faster)**

```bash
npx expo prebuild  # Generates native folders
npx expo run:android  # Builds and installs on device/emulator
```

### Running the App

```bash
npm run start  # Now uses --dev-client flag
# Open custom dev client app (NOT Expo Go) and scan QR code
```

## Key Features

- **Host Configuration**: Entered at runtime in Login screen and persisted securely
- **Audio Permissions**: Requested at first call test/login and persisted
- **DTMF Feedback**: Haptics and tones using `expo-haptics` and `expo-av`
- **WebRTC Calling**: Full SIP/WebRTC support (requires dev client)
- **Multi-tenant**: Supports different backend hosts per tenant

## Publishing to Play Store (Android) using EAS

### Prerequisites

- Play Console account with an app created (package `com.hugamara.mayday` per app.config.js)
- Keystore managed by EAS (we use credentialsSource: remote)

### Build (AAB for Play Store)

```bash
cd mayday/mayday_mobile_app
npx expo install # ensure deps
eas build --profile production --platform android
```

### Submit to Play Console (Internal testing track)

```bash
eas submit --profile production --platform android
```

### Notes

- If using a new Play Console app, ensure the package `com.hugamara.mayday` matches and upload an initial AAB via EAS
- The production build includes all native modules (WebRTC, SecureStore, etc.)

## Troubleshooting

### App Hangs on Startup

- **Cause**: Using Expo Go instead of dev client
- **Fix**: Build and install the custom dev client (see First Time Setup)

### WebRTC Not Working

- **Cause**: Running in Expo Go or dev client not built with WebRTC
- **Fix**: Ensure you're using the custom dev client, not Expo Go

### Build Issues

- Run `npx expo prebuild --clean` before rebuilding
- Ensure all dependencies are installed: `npm install && npx expo install`
- Check EAS configuration: `npx expo whoami`
