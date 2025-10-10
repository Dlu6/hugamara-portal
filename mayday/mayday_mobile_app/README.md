# Mayday Mobile App (Expo + SIP/WebRTC) Softphone

A React Native (Expo) mobile application for connecting to our Asterisk PBX for SIP calling. Uses Redux Toolkit for state, Expo Notifications, and a Dev Client build for WebRTC.

## Runtime Configuration (VM vs. Local)

The app is configured to connect to the production backend by default, but can be configured for local development. The API base URL is resolved as follows:

1.  **Environment Variable:** If `EXPO_PUBLIC_API_BASE_URL` is set as an environment variable, its value is used. This is the recommended way to override the default for testing.
2.  **Default Configuration:** If the environment variable is not set, the app defaults to local emulator for development. In production, the runtime base URL is provided by the backend login response or `/api/system/public-config`.
3.  **Local Development (Legacy):** The logic to auto-detect emulators (`http://10.0.2.2:8004/api`) still exists but is currently overridden by the default configuration in `app.config.js`. To use a local backend, you must use the environment variable.

### Example: Running Against a Local Backend

```bash
# Start the Metro bundler pointing to a local slave-backend instance
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8004/api \
npx expo start --dev-client
```

### Example: Running Against Production (Default)

Simply running `npx expo start` will now default to the correct production URL. The `start:vm` script is still available for clarity.

```bash
# This will now connect to cs.hugamara.com
npx expo start
```

## Multi‑Tenancy Host Input (Mobile UI)

- The login screen now includes a Host field where users enter their tenant backend root, e.g. `https://cs.hugamara.com/mayday-api`.
- The app normalizes the value and guarantees the trailing `/api` segment (so the base becomes `https://cs.hugamara.com/mayday-api/api`).
- This base is used for all API calls and Socket.IO connections during the session.

If you see HTTP 404/405 on login, verify your Host is the tenant root (without `/api`) – the app will append `/api` for you.

## Credentials, Preferences, and Persistence

- Remember Me securely stores Host, Email, and Password using Expo SecureStore.
- Show/Hide password preference is also persisted.
- Android microphone permission state is persisted to SecureStore as `granted` or `denied` and shown in Settings → Media Tests.

### Logout

- Settings → Session now provides a Logout button.
- On logout, SIP is disconnected, saved auth (email/password/remember) is cleared (Host is kept), and the navigation stack is reset to Login.

## Dialer UX Enhancements

- Dialpad now provides light haptic feedback and a short tone per keypress (DTMF‑like).
- Requirements (already installed via `expo install`):
  - `expo-haptics`
  - `expo-av`

No native config is needed for these packages on Expo SDK 52.

## Login Flow

- **Endpoint:** `POST /users/agent-login`
- **Body:** `{ "email": "...", "password": "...", "isSoftphone": true }`
- **Response (relevant excerpt):**
  - `data.user.pjsip` → `{ "server", "password", "ws_servers", "ice_servers", ... }`
- The mobile app consumes this response to initialize the SIP client.

## SIP/WebRTC Requirements

- **Dev Client is Mandatory:** Expo Go does not include native WebRTC modules. You must use a Development Client built via EAS (`eas build`) or locally (`expo run:android`) to bundle `react-native-webrtc` and `expo-asset`.
- **WSS Reachability:** The WebSocket Secure endpoint must be reachable from the mobile device (e.g., `wss://cs.hugamara.com:8089/ws`) with a valid TLS certificate.
- **TURN Server:** For reliable connections on cellular networks, it is highly recommended to include a TURN server in the `ice_servers` array provided by the backend.

## Quick Start

### Step 1: Build the Dev Client (One-Time Setup)

The app requires a custom development client because of react-native-webrtc. **DO NOT use Expo Go** - it doesn't support native modules.

**Option A: Build via EAS (Recommended - builds in cloud)**

```bash
cd mayday/mayday_mobile_app
npm install
npx expo install  # Ensure all dependencies are installed
eas build --profile development --platform android
```

- Wait for build to complete (5-15 minutes)
- Download and install the .apk on your Android device
- Or use the provided QR code to install directly

**Option B: Build locally (Faster but requires Android Studio/Xcode)**

```bash
cd mayday/mayday_mobile_app
npm install
npx expo prebuild  # Generates native folders
npx expo run:android  # Builds and installs on connected device/emulator
```

For iOS:

```bash
eas build --profile development --platform ios
# Or build locally: npx expo run:ios
```

### Step 2: Start the Dev Server

```bash
npm run start
# This runs: expo start --dev-client --clear
```

**Important:** Open your custom dev client app (NOT Expo Go) on your device and scan the QR code.

### Step 3: Login and Test

On the Login screen:

- Enter Host (e.g., `https://cs.hugamara.com/mayday-api`)
- Enter Email/Password
- Toggle Remember Me if you want the values saved securely
- Login

The app will register with SIP and enable calling functionality.

## Important Notes

- **DO NOT use Expo Go** - it doesn't support react-native-webrtc
- **Use the custom dev client** you built in Step 1
- The dev client includes all native modules (WebRTC, SecureStore, etc.)
- You only need to rebuild the dev client when:
  - Adding/removing native modules
  - Changing native configuration
  - Updating major dependencies
- Metro bundler updates (code changes) happen instantly with hot reload

## Troubleshooting

- **"App hangs on startup"**: You're using Expo Go instead of the dev client. Build and install the dev client (see Step 1).
- **"Network request failed"**: Dev server not running or wrong URL. Ensure `npm run start` is running.
- **"Login failed (405)"**: The base URL likely missed `/api`. Enter `https://<tenant>/mayday-api` (the app will append `/api`).
- **"SIP registration failed"**: Ensure the login response contains a `user.pjsip` object with `server`, `password`, `ws_servers`, and `ice_servers`.
- **"Microphone Permission" keeps prompting**: Grant permission once; the app will persist status on Android. You can verify under Settings → Media Tests.
- **"Cannot find native module 'ExpoAsset'"**: The dev client wasn't built with all plugins. Run `npx expo prebuild --clean` and rebuild.

## Scripts

- `npm run start`: Starts the Metro bundler for the dev client (requires custom dev client, not Expo Go).
- `npm run start:tunnel`: Starts the bundler with a public tunnel and dev client mode.
- `npm run start:devclient`: Same as start:tunnel, useful for physical devices over the internet.
- `npm run start:vm`: Starts bundler with production VM backend URL pre-configured.
- `npm run android`: Builds and runs the app locally on Android (requires Android Studio).
- `npm run ios`: Builds and runs the app locally on iOS (requires Xcode on macOS).
- `npm run build:dev:android`: Creates a development client build for Android using EAS (cloud build).
- `npm run build:dev:ios`: Creates a development client build for iOS using EAS (cloud build).
- `npm run prebuild`: Generates native android/ios folders for local builds (run before `npm run android/ios`).

## Development Workflow

1.  **First time setup**: Build and install the dev client (see Quick Start Step 1) - only needed once.
2.  **Daily development**:
    - Start Metro bundler: `npm run start`
    - Open the dev client app on your device (not Expo Go)
    - Code changes hot-reload automatically
3.  **Backend**: Ensure the target backend (production or local) is running and reachable.
4.  **Testing calls**: Login with a user that has a `webRTC` typology. The app will navigate to the Dialer screen and attempt SIP registration.
5.  **Rebuild dev client only when**: Adding/removing native dependencies or changing native configuration.

## Additional Troubleshooting

- **Network request failed on login:**
  - Ensure the `API_BASE_URL` is set via `EXPO_PUBLIC_API_BASE_URL` for local dev, or that the backend exposes `/api/system/public-config` to advertise the correct base.
  - If using a local backend, start the bundler with the `EXPO_PUBLIC_API_BASE_URL` environment variable set correctly (e.g., `http://10.0.2.2:8004/api` for the Android emulator).
- **SIP not Registered:**
  - Verify the `ws_servers` URI in the login response is correct (e.g., `wss://cs.hugamara.com:8089/ws`).
  - Ensure the WSS port is open and the TLS certificate is valid and trusted by the device.
- **Dev client build fails:**
  - Check that your EAS account is properly configured: `npx expo whoami`
  - Verify `eas.json` has correct configuration for development builds
  - Ensure all dependencies are installed: `npm install && npx expo install`
