#!/bin/bash

# WhatsApp Business Number Setup Script
# This script helps you set up your WhatsApp Business number

echo "🚀 WhatsApp Business Number Setup"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "mayday/slave-backend/.env" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected to find: mayday/slave-backend/.env"
    exit 1
fi

echo "📋 Step 1: Choose Your Provider"
echo "==============================="
echo ""
echo "1. Twilio (Recommended for developers)"
echo "   - Free trial with $15 credit"
echo "   - Easy setup, good documentation"
echo "   - Cost: ~$1-2/month per number"
echo ""
echo "2. MessageBird (WhatsApp-focused)"
echo "   - Specialized in WhatsApp Business API"
echo "   - Requires business verification"
echo "   - Cost: ~$1-2/month per number"
echo ""
echo "3. Vonage (Alternative)"
echo "   - Good alternative to Twilio"
echo "   - Similar features and pricing"
echo "   - Cost: ~$1-2/month per number"
echo ""

read -p "Enter your choice (1-3): " provider_choice

case $provider_choice in
    1)
        echo ""
        echo "🔗 Twilio Setup Instructions:"
        echo "1. Visit: https://www.twilio.com/try-twilio"
        echo "2. Sign up for a free account"
        echo "3. Go to Phone Numbers > Manage > Buy a number"
        echo "4. Select your country and features (SMS + Voice)"
        echo "5. Purchase the number (~$1/month)"
        echo ""
        echo "📱 After getting your number, you'll need:"
        echo "- Phone number (e.g., +1234567890)"
        echo "- Account SID"
        echo "- Auth Token"
        ;;
    2)
        echo ""
        echo "🔗 MessageBird Setup Instructions:"
        echo "1. Visit: https://www.messagebird.com/"
        echo "2. Sign up for a free account"
        echo "3. Go to WhatsApp > Get Started"
        echo "4. Complete business verification"
        echo "5. Wait for approval (1-2 weeks)"
        echo ""
        echo "📱 After getting approved, you'll need:"
        echo "- Phone number (e.g., +1234567890)"
        echo "- API key"
        ;;
    3)
        echo ""
        echo "🔗 Vonage Setup Instructions:"
        echo "1. Visit: https://www.vonage.com/"
        echo "2. Sign up for a free account"
        echo "3. Go to Numbers > Buy Numbers"
        echo "4. Select your country and features"
        echo "5. Purchase the number (~$1-2/month)"
        echo ""
        echo "📱 After getting your number, you'll need:"
        echo "- Phone number (e.g., +1234567890)"
        echo "- API key"
        echo "- API secret"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📝 Step 2: Configure Your Environment"
echo "====================================="
echo ""

# Check if .env file exists
if [ ! -f "mayday/slave-backend/.env" ]; then
    echo "❌ Error: .env file not found"
    echo "   Please create mayday/slave-backend/.env first"
    exit 1
fi

echo "Please enter your WhatsApp Business number details:"
echo ""

read -p "Phone Number (e.g., +1234567890): " phone_number
read -p "API Key: " api_key
read -p "API Secret (if applicable): " api_secret

# Validate phone number format
if [[ ! $phone_number =~ ^\+[1-9][0-9]{1,14}$ ]]; then
    echo "❌ Error: Invalid phone number format"
    echo "   Please use international format: +1234567890"
    exit 1
fi

echo ""
echo "🔧 Updating environment variables..."

# Update .env file
if grep -q "LIPACHAT_PHONE_NUMBER" mayday/slave-backend/.env; then
    sed -i.bak "s/LIPACHAT_PHONE_NUMBER=.*/LIPACHAT_PHONE_NUMBER=$phone_number/" mayday/slave-backend/.env
else
    echo "LIPACHAT_PHONE_NUMBER=$phone_number" >> mayday/slave-backend/.env
fi

if grep -q "LIPACHAT_API_KEY" mayday/slave-backend/.env; then
    sed -i.bak "s/LIPACHAT_API_KEY=.*/LIPACHAT_API_KEY=$api_key/" mayday/slave-backend/.env
else
    echo "LIPACHAT_API_KEY=$api_key" >> mayday/slave-backend/.env
fi

if [ ! -z "$api_secret" ]; then
    if grep -q "LIPACHAT_API_SECRET" mayday/slave-backend/.env; then
        sed -i.bak "s/LIPACHAT_API_SECRET=.*/LIPACHAT_API_SECRET=$api_secret/" mayday/slave-backend/.env
    else
        echo "LIPACHAT_API_SECRET=$api_secret" >> mayday/slave-backend/.env
    fi
fi

# Set default values for other required variables
if ! grep -q "LIPACHAT_GATEWAY_URL" mayday/slave-backend/.env; then
    echo "LIPACHAT_GATEWAY_URL=https://gateway.lipachat.com/api/v1/whatsapp" >> mayday/slave-backend/.env
fi

if ! grep -q "LIPACHAT_WEBHOOK_SECRET" mayday/slave-backend/.env; then
    echo "LIPACHAT_WEBHOOK_SECRET=$(openssl rand -hex 32)" >> mayday/slave-backend/.env
fi

echo "✅ Environment variables updated successfully!"
echo ""

echo "🧪 Step 3: Test Your Setup"
echo "=========================="
echo ""

# Check if Node.js is available
if command -v node &> /dev/null; then
    echo "Running WhatsApp setup test..."
    node test-whatsapp-setup.js
else
    echo "⚠️  Node.js not found. Please install Node.js to run the test script."
    echo "   You can test manually by running: node test-whatsapp-setup.js"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Your WhatsApp Business number is configured:"
echo "📱 Phone Number: $phone_number"
echo "🔑 API Key: ${api_key:0:8}..."
echo ""
echo "Next steps:"
echo "1. Test your setup with: node test-whatsapp-setup.js"
echo "2. Start your backend server: cd mayday/slave-backend && npm start"
echo "3. Configure webhooks in your provider's console"
echo "4. Test sending a message to your WhatsApp number"
echo ""
echo "For detailed instructions, see: WHATSAPP_BUSINESS_NUMBER_GUIDE.md"
echo ""
echo "Happy messaging! 🚀"
