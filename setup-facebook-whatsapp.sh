#!/bin/bash

# Facebook WhatsApp Business API Setup Script
# This script helps you configure your existing number with Facebook API

echo "🚀 Facebook WhatsApp Business API Setup"
echo "======================================="
echo ""

# Check if we're in the right directory
if [ ! -f "mayday/slave-backend/.env" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected to find: mayday/slave-backend/.env"
    exit 1
fi

echo "📋 Prerequisites Checklist:"
echo "=========================="
echo ""
echo "Before proceeding, ensure you have:"
echo "✅ Deleted your existing WhatsApp account"
echo "✅ Created a Meta Business Account"
echo "✅ Completed business verification"
echo "✅ Created a Facebook App"
echo "✅ Added WhatsApp product to your app"
echo "✅ Added your phone number to WhatsApp"
echo ""

read -p "Have you completed all prerequisites? (y/n): " prerequisites_done

if [ "$prerequisites_done" != "y" ]; then
    echo ""
    echo "Please complete the prerequisites first:"
    echo "1. Visit: https://business.facebook.com/"
    echo "2. Create Business Manager account"
    echo "3. Complete business verification"
    echo "4. Visit: https://developers.facebook.com/"
    echo "5. Create app and add WhatsApp product"
    echo "6. Add your phone number"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo ""
echo "🔑 Step 1: Get Your API Credentials"
echo "==================================="
echo ""

echo "Please get your credentials from Facebook Developer Console:"
echo "1. Go to: https://developers.facebook.com/"
echo "2. Select your app"
echo "3. Go to WhatsApp > API Setup"
echo ""

read -p "Enter your Access Token: " access_token
read -p "Enter your Phone Number ID: " phone_number_id
read -p "Enter your Business Account ID: " business_account_id

# Generate a random verify token
verify_token=$(openssl rand -hex 16)

echo ""
echo "🔧 Step 2: Update Environment Variables"
echo "======================================"
echo ""

# Update .env file
echo "Updating mayday/slave-backend/.env..."

# Set WhatsApp provider to Facebook
if grep -q "WHATSAPP_PROVIDER" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_PROVIDER=.*/WHATSAPP_PROVIDER=facebook/" mayday/slave-backend/.env
else
    echo "WHATSAPP_PROVIDER=facebook" >> mayday/slave-backend/.env
fi

# Update Facebook API credentials
if grep -q "WHATSAPP_ACCESS_TOKEN" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_ACCESS_TOKEN=.*/WHATSAPP_ACCESS_TOKEN=$access_token/" mayday/slave-backend/.env
else
    echo "WHATSAPP_ACCESS_TOKEN=$access_token" >> mayday/slave-backend/.env
fi

if grep -q "WHATSAPP_PHONE_NUMBER_ID" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_PHONE_NUMBER_ID=.*/WHATSAPP_PHONE_NUMBER_ID=$phone_number_id/" mayday/slave-backend/.env
else
    echo "WHATSAPP_PHONE_NUMBER_ID=$phone_number_id" >> mayday/slave-backend/.env
fi

if grep -q "WHATSAPP_BUSINESS_ACCOUNT_ID" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_BUSINESS_ACCOUNT_ID=.*/WHATSAPP_BUSINESS_ACCOUNT_ID=$business_account_id/" mayday/slave-backend/.env
else
    echo "WHATSAPP_BUSINESS_ACCOUNT_ID=$business_account_id" >> mayday/slave-backend/.env
fi

if grep -q "WHATSAPP_VERIFY_TOKEN" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_VERIFY_TOKEN=.*/WHATSAPP_VERIFY_TOKEN=$verify_token/" mayday/slave-backend/.env
else
    echo "WHATSAPP_VERIFY_TOKEN=$verify_token" >> mayday/slave-backend/.env
fi

# Set API URL
if grep -q "WHATSAPP_API_URL" mayday/slave-backend/.env; then
    sed -i.bak "s/WHATSAPP_API_URL=.*/WHATSAPP_API_URL=https:\/\/graph.facebook.com\/v18.0/" mayday/slave-backend/.env
else
    echo "WHATSAPP_API_URL=https://graph.facebook.com/v18.0" >> mayday/slave-backend/.env
fi

echo "✅ Environment variables updated successfully!"
echo ""

echo "🔗 Step 3: Configure Webhook"
echo "============================"
echo ""

# Get the webhook URL
webhook_url="https://your-domain.com/api/whatsapp/webhook"
if [ ! -z "$1" ]; then
    webhook_url="$1/api/whatsapp/webhook"
else
    read -p "Enter your webhook URL (e.g., https://your-domain.com): " webhook_domain
    webhook_url="$webhook_domain/api/whatsapp/webhook"
fi

echo "Webhook URL: $webhook_url"
echo "Verify Token: $verify_token"
echo ""

echo "📝 Step 4: Configure Webhook in Facebook"
echo "======================================="
echo ""
echo "1. Go to: https://developers.facebook.com/"
echo "2. Select your app"
echo "3. Go to WhatsApp > Configuration"
echo "4. In the 'Webhook' section:"
echo "   - Callback URL: $webhook_url"
echo "   - Verify Token: $verify_token"
echo "5. Click 'Verify and Save'"
echo ""

echo "🧪 Step 5: Test Your Setup"
echo "========================="
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
echo "Your WhatsApp Business API is configured:"
echo "📱 Phone Number: Your existing number"
echo "🔑 Access Token: ${access_token:0:8}..."
echo "🆔 Phone Number ID: $phone_number_id"
echo "🏢 Business Account ID: $business_account_id"
echo "🔗 Webhook URL: $webhook_url"
echo ""
echo "Next steps:"
echo "1. Configure webhook in Facebook Developer Console"
echo "2. Test your setup with: node test-whatsapp-setup.js"
echo "3. Start your backend server: cd mayday/slave-backend && npm start"
echo "4. Test sending a message to your WhatsApp number"
echo ""
echo "For detailed instructions, see: WHATSAPP_NUMBER_OPTIONS_GUIDE.md"
echo ""
echo "Happy messaging! 🚀"
