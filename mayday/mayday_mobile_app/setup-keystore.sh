#!/bin/bash

# Mayday Mobile App - Keystore Setup Script
# This script sets up the production keystore for local Gradle builds
# Run this after: eas credentials -p android (download keystore)

set -e

echo "🔐 Setting up Mayday Mobile production keystore..."

# Create permanent keystore directory (outside android/ folder)
mkdir -p keystores

# Check if keystore was downloaded
if [ -f "@dlu6__mayday-mobile.jks" ]; then
    echo "✅ Found downloaded keystore"
    cp "@dlu6__mayday-mobile.jks" keystores/production.jks
    echo "✅ Copied keystore to keystores/production.jks"
elif [ -f "keystores/production.jks" ]; then
    echo "✅ Keystore already exists in keystores/production.jks"
else
    echo "❌ Error: Keystore not found!"
    echo ""
    echo "Please run:"
    echo "  eas credentials -p android"
    echo "Then select: production → Keystore → Download existing keystore"
    echo "After download, run this script again."
    exit 1
fi

# Create keystore.properties with correct credentials
cat > keystores/keystore.properties << 'EOF'
storeFile=../../keystores/production.jks
storePassword=ee64022f12abc313e905e6c83e5a1ef5
keyAlias=a3c49bed78c613403ece489ad0bcae3c
keyPassword=c862b57f2642aed35e5117ec7f8373a3
EOF

echo "✅ Created keystores/keystore.properties"

# Copy keystore.properties to android/ if it exists
if [ -d "android" ]; then
    cp keystores/keystore.properties android/keystore.properties
    echo "✅ Copied keystore.properties to android/"
fi

# Verify keystore
echo ""
echo "🔍 Verifying keystore..."
keytool -list -v -keystore keystores/production.jks -storepass ee64022f12abc313e905e6c83e5a1ef5 2>&1 | grep "SHA1:"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Expected SHA1: DB:17:93:2B:8D:6F:DA:F3:8C:E8:95:F7:BC:BC:1C:67:CC:2F:BD:64"
echo ""
echo "Next steps:"
echo "  1. Run: npx expo prebuild --clean"
echo "  2. Run: ./setup-keystore.sh  (to restore keystore after prebuild)"
echo "  3. Run: cd android && ./gradlew bundleRelease --no-daemon"
