# Google Play Store Submission Guide - Mayday Mobile v1.1.0

## Pre-Submission Checklist

### 1. Version Updates ✅
- [x] `app.config.js` version: **1.1.0**
- [x] `app.config.js` android.versionCode: **2**
- [x] `package.json` version: **1.1.0**
- [x] `README.md` changelog: **Updated**

### 2. Code Quality
- [ ] Run tests (if available)
- [ ] Verify all features work on a real Android device
- [ ] Test incoming and outgoing calls
- [ ] Verify login/logout flow
- [ ] Test "Remember Me" functionality
- [ ] Check dialer keypad responsiveness

### 3. Assets Required
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, recommended 4-8)
  - Login screen
  - Dialer screen
  - Active call screen
  - Settings screen
- [ ] Privacy policy URL
- [ ] App description and release notes

## Build & Submit Process

### Step 1: Build Production APK/AAB

```bash
cd /Users/Mydhe\ Files/Hugamara/mayday/mayday_mobile_app

# Ensure you're logged into EAS
npx expo whoami

# If not logged in:
npx eas login

# Build production app bundle for Play Store
eas build --platform android --profile production
```

This will:
- Build an Android App Bundle (`.aab`) file
- Use the `production` profile from `eas.json`
- Set `developmentClient: false` for a standalone app
- Upload to EAS servers

**Expected build time:** 10-20 minutes

### Step 2: Download the Build

Once the build completes, you'll receive:
- A download link in the terminal
- An email notification
- Access via: https://expo.dev/accounts/YOUR_ACCOUNT/projects/mayday-mobile/builds

Download the `.aab` file to your computer.

### Step 3: Submit to Play Store

#### Option A: Automatic Submission via EAS (Recommended)

```bash
# Submit the build directly to Play Store
eas submit --platform android --profile production

# Follow the prompts:
# - Select the build to submit
# - Provide Google Service Account key (if first time)
```

**Note:** This requires a Google Play Console service account with API access. See "Setting Up Google Service Account" below.

#### Option B: Manual Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new app if first submission)
3. Navigate to **Production** → **Create new release**
4. Upload the `.aab` file
5. Fill in release details (see below)
6. Submit for review

## Release Information

### Release Name
```
Version 1.1.0 (Build 2)
```

### Release Notes (What's New)

```
🎉 What's New in Version 1.1.0:

📞 Improved Call Quality
• Enhanced call connectivity on cellular networks
• Added TURN server support for reliable connections
• Fixed audio streaming issues

✨ Better User Experience
• Redesigned dialer with modern look and feel
• Improved keypad button alignment
• Added visual shadows for better depth perception
• New call icon for cleaner interface

🔐 Security Enhancements
• Removed hardcoded test credentials
• Improved credential storage with Remember Me feature

🐛 Bug Fixes
• Fixed number alignment on keypad buttons
• Resolved audio stream errors during calls
• Improved call button state management
```

### App Description (Short - 80 characters max)
```
Professional SIP softphone for Asterisk PBX with WebRTC calling
```

### App Description (Full - 4000 characters max)

```
Mayday Mobile - Professional VoIP Softphone

Mayday Mobile is a powerful, enterprise-grade SIP softphone application designed for seamless integration with Asterisk PBX systems. Make and receive high-quality voice calls over the internet using WebRTC technology.

KEY FEATURES:

📞 Crystal Clear Calling
• HD voice quality with advanced WebRTC technology
• Reliable connections on WiFi and cellular networks
• TURN server support for NAT traversal
• Real-time call status and duration tracking

🎛️ Professional Dialer
• Modern, intuitive keypad interface
• Haptic feedback on button press
• DTMF tone support
• Call history with timestamps

🔐 Secure & Private
• Secure credential storage
• TLS/WSS encrypted connections
• Remember Me for convenient login
• No data collection or tracking

⚙️ Enterprise Ready
• Multi-tenant support
• Custom host configuration
• SIP registration status indicator
• Background call handling

📊 Call Management
• View call history
• Track call duration
• Monitor connection status
• Performance dashboard

TECHNICAL SPECIFICATIONS:

• Protocol: SIP over WebSocket Secure (WSS)
• Audio Codec: Opus, G.711
• Network: IPv4/IPv6, NAT traversal with TURN
• Platform: React Native with Expo
• Backend: Asterisk PBX 20.x+

REQUIREMENTS:

• Android 5.0 (Lollipop) or higher
• Active internet connection (WiFi or cellular)
• Valid SIP account credentials
• Microphone permission for calls

PERMISSIONS EXPLAINED:

• INTERNET: Required for VoIP calling
• RECORD_AUDIO: Required for microphone access during calls
• MODIFY_AUDIO_SETTINGS: Required for audio routing (speaker/earpiece)
• WAKE_LOCK: Keeps device awake during active calls
• FOREGROUND_SERVICE: Maintains call connection in background
• POST_NOTIFICATIONS: Call notifications and status updates

SUPPORT:

For technical support, feature requests, or bug reports, please contact our support team or visit our website.

NOTE: This app requires a valid SIP account from a compatible Asterisk PBX server. Contact your organization's IT department for account credentials.
```

### Category
```
Business > Communication
```

### Content Rating
```
Everyone
```

### Target Age Group
```
18+
```

### Privacy Policy
You'll need to provide a privacy policy URL. Create a simple one that covers:
- What data you collect (minimal: credentials, call logs)
- How you use it (authentication, call history)
- Data storage (local + server)
- Third-party services (if any)
- User rights (data deletion, access)

## Setting Up Google Service Account (For EAS Submit)

### 1. Create Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (or create one)
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**
5. Name it: `expo-play-store-submission`
6. Grant role: **Service Account User**

### 2. Generate JSON Key

1. Click on the service account you created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Choose **JSON** format
5. Download the JSON file

### 3. Link to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Setup** → **API access**
3. Click **Link** (or **Create new service account**)
4. Select your service account from the list
5. Grant permissions: **Admin (all permissions)**
6. Save changes

### 4. Configure EAS

```bash
# During first submit, EAS will prompt for the service account key
# Provide the path to your downloaded JSON file
eas submit --platform android --profile production
```

## Post-Submission

### Review Process

- **Initial Review:** 1-7 days (typically 2-3 days)
- **Updates:** Faster reviews (usually within 24 hours)
- You'll receive email notifications about review status

### After Approval

1. **App will be live** on Play Store within a few hours
2. **Monitor crash reports** in Play Console
3. **Respond to user reviews** regularly
4. **Track installation metrics**

### Play Store Listing

Once approved, your app will be available at:
```
https://play.google.com/store/apps/details?id=com.mayday
```

## Rollout Strategy

For first release or major updates, consider a **staged rollout**:

1. Start with **10%** of users
2. Monitor for crashes/issues for 24 hours
3. Increase to **50%** if stable
4. After 48 hours, release to **100%**

This can be configured in Play Console under:
**Production** → **Releases** → **Manage release** → **Rollout percentage**

## Troubleshooting Build Issues

### Build Fails

```bash
# Clear EAS cache and rebuild
eas build --platform android --profile production --clear-cache
```

### Version Conflict

```bash
# Ensure versionCode is higher than previous release
# Edit app.config.js and increment android.versionCode
```

### Signing Issues

```bash
# Let EAS manage signing automatically
# Ensure credentialsSource is "remote" in eas.json
```

## Quick Command Reference

```bash
# Check current version
cat app.config.js | grep version

# Build production
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

## Checklist Summary

- [ ] All version numbers updated
- [ ] Production build created successfully
- [ ] App tested on real Android device
- [ ] Screenshots and graphics prepared
- [ ] Release notes written
- [ ] Privacy policy available
- [ ] Service account configured (if using EAS submit)
- [ ] App uploaded to Play Console
- [ ] Release submitted for review
- [ ] Monitoring crash reports post-launch

## Next Steps After Play Store Approval

1. **Marketing:**
   - Share Play Store link with users
   - Add download badge to website
   - Announce on social media

2. **Monitoring:**
   - Set up crash reporting alerts
   - Monitor user reviews daily
   - Track installation metrics

3. **Future Updates:**
   - Increment versionCode for each release
   - Maintain changelog in README.md
   - Plan feature roadmap based on user feedback

---

**Good luck with your Play Store submission! 🚀**
