# Mayday Mobile App (Expo + SIP/WebRTC) Softphone

A React Native (Expo) mobile application for connecting to our Asterisk PBX for SIP calling. Uses Redux Toolkit for state, Expo Notifications, and a Dev Client build for WebRTC.

## Runtime Configuration (VM vs. Local)

The app is configured to connect to the production backend by default, but can be configured for local development. The API base URL is resolved as follows:

1.  **Environment Variable:** If `EXPO_PUBLIC_API_BASE_URL` is set as an environment variable, its value is used. This is the recommended way to override the default for testing.
2.  **Default Configuration:** If the environment variable is not set, the app defaults to the production backend: `https://cs.hugamara.com/mayday-api/api`.
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

## Scripts

- `npm run start`: Starts the Metro bundler for the dev client (defaults to production backend).
- `npm run start:devclient`: Starts the bundler with a public tunnel, useful for physical devices.
- `npm run start:vm`: An explicit script to start the bundler pointing to the production VM backend.
- `npm run build:dev:android`: Creates a development client build for Android using EAS.

## Development Checklist

1.  Ensure the target backend (production or local) is running and reachable.
2.  Install the Development Client on your device/emulator (via EAS build or `expo run:android`).
3.  Start the Metro bundler with the correct environment variables if not using the default.
4.  Login with a user that has a `webRTC` typology. The app will navigate to the Dialer screen and attempt SIP registration.

## Troubleshooting

- **Network request failed on login:**
  - This almost always means the app can't reach the backend.
  - Verify the `API_BASE_URL` in `app.config.js` is correct (`https://cs.hugamara.com/mayday-api/api`).
  - If using a local backend, ensure you have started the bundler with the `EXPO_PUBLIC_API_BASE_URL` environment variable set correctly (e.g., `http://10.0.2.2:8004/api` for the Android emulator).
- **Cannot find native module 'ExpoAsset':**
  - Ensure the `expo-asset` plugin is in your `app.config.js`: `plugins: ["expo-asset"]`. Rebuild the dev client if you add it.
- **SIP not Registered:**
  - Verify the `ws_servers` URI in the login response is correct (e.g., `wss://cs.hugamara.com:8089/ws`).
  - Ensure the WSS port is open and the TLS certificate is valid and trusted by the device.
