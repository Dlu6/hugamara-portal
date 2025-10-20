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

## Publishing to Play Store (Android)

### Prerequisites

- Play Console account with an app created (package `com.maydaymobile` per app.config.js)
- Keystore configured (either EAS-managed or local)

### Method 1: Build Using EAS (Cloud Build)

**Pros:** Easy, no local setup needed  
**Cons:** Limited free builds (resets monthly), requires internet

```bash
cd mayday/mayday_mobile_app
npx expo install # ensure deps
eas build --profile production --platform android
```

**Submit to Play Console:**

```bash
eas submit --profile production --platform android
```

### Method 2: Build Locally with Gradle (No EAS Limits) - RECOMMENDED

**Pros:** Unlimited builds, faster iteration, no cloud dependency  
**Cons:** Requires Android SDK setup and one-time keystore configuration

#### Prerequisites

- Android SDK installed at `~/Library/Android/sdk` (macOS) or appropriate location
- Java JDK 17+
- Production keystore (downloaded from EAS once, saved permanently)

#### One-Time Keystore Setup

```bash
cd mayday/mayday_mobile_app

# 1. Download keystore from EAS (only needed once)
eas credentials -p android
# Select: production → Keystore → Download existing keystore → no

# 2. Run setup script to save keystore permanently
./setup-keystore.sh

# This creates keystores/ folder outside android/ so it never gets deleted
```
#####FOR FUTURE BUILDS
#### Build Steps (Every Build) ~ SKIPS EAS BUILD LIMITATIONS

```bash
cd mayday/mayday_mobile_app

# 1. Generate native Android code
npx expo prebuild --clean --platform android

# 2. Configure Android SDK location
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# 3. Restore keystore configuration (prebuild deletes android/)
./setup-keystore.sh

# 4. Set API level 35 (Play Store requirement)
echo "android.targetSdkVersion=35" >> android/gradle.properties

# 5. Build production AAB
cd android && ./gradlew bundleRelease --no-daemon

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

#### Build APK Instead (for direct installation)

```bash
cd android
./gradlew assembleRelease --no-daemon

# Output: android/app/build/outputs/apk/release/app-release.apk
```

#### Clean Build (if errors occur)

```bash
# Stop all Gradle daemons
./gradlew --stop

# Clean build directories
rm -rf android/.gradle android/app/build android/build
rm -rf node_modules/@react-native/gradle-plugin/.gradle
rm -rf node_modules/expo-dev-launcher/expo-dev-launcher-gradle-plugin/.gradle

# Rebuild
./gradlew bundleRelease --no-daemon
```

### Signing Key Issues

#### Problem: "App Bundle is signed with the wrong key"

**Error Example:**
```
Your Android App Bundle is signed with the wrong key. 
Expected SHA1: DB:17:93:2B:8D:6F:DA:F3:8C:E8:95:F7:BC:BC:1C:67:CC:2F:BD:64
Actual SHA1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

**Cause:** The AAB was signed with a different keystore than what Play Store expects.

#### Solution 1: Use EAS-Managed Keystore (Recommended)

If you previously used EAS builds, use EAS to build:

```bash
eas build --profile production --platform android
```

EAS will automatically use the correct keystore stored in their servers.

#### Solution 2: Configure Gradle to Use Correct Keystore

If building locally, configure the signing key in `android/app/build.gradle`:

1. **Get keystore from EAS:**

```bash
eas credentials -p android
# Download the keystore file and note the password/alias
```

2. **Or use your existing keystore** (if you have the original .jks/.keystore file)

3. **Configure signing in gradle:**

Edit `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("path/to/your/keystore.jks")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            // ... other config
        }
    }
}
```

4. **Rebuild:**

```bash
cd android
./gradlew bundleRelease
```

#### Solution 3: Verify Keystore Fingerprint

Check your keystore's SHA1 fingerprint:

```bash
keytool -list -v -keystore path/to/your/keystore.jks -alias your-key-alias
```

Compare the SHA1 with what Play Store expects.

### Notes

- The package name is `com.maydaymobile`
- Production builds include all native modules (WebRTC, SecureStore, etc.)
- For first-time Play Store upload, you must use the correct signing key
- After first upload, all subsequent builds must use the same key

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
