# Facebook WhatsApp Business API Setup Guide

## 🎯 **Complete Step-by-Step Guide**

This guide will help you configure your existing WhatsApp number with Facebook's WhatsApp Business API.

## ⚠️ **Important Prerequisites**

Before starting, you need to:

1. **Delete your existing WhatsApp account** (you'll lose chat history)
2. **Have a business** (not personal use)
3. **Have business documents** for verification
4. **Have access to the phone number** for verification

## 📱 **Step 1: Delete Your Existing WhatsApp Account**

### **1.1 Backup Important Data**

```bash
# Before deleting, make sure to:
# - Export important chat history
# - Save important media files
# - Note down important contacts
# - Take screenshots of important conversations
```

### **1.2 Delete WhatsApp Account**

1. Open WhatsApp on your phone
2. Go to **Settings** > **Account** > **Delete My Account**
3. Enter your phone number: `+1234567890`
4. Select **"Delete My Account"**
5. Confirm deletion

**⚠️ Warning**: This action is irreversible. You'll lose all chat history and media.

## 🏢 **Step 2: Create Meta Business Account**

### **2.1 Go to Business Manager**

1. Visit: https://business.facebook.com/
2. Click **"Create Account"**
3. Fill in your business details:
   - **Business name**: Your company name
   - **Your name**: Your full name
   - **Business email**: Your business email
   - **Business phone**: Your business phone number

### **2.2 Complete Business Verification**

1. Go to **Business Settings** > **Security** > **Business Verification**
2. Click **"Start Verification"**
3. Upload required documents:
   - **Business registration certificate**
   - **Tax ID or business license**
   - **Proof of business address**
4. Submit for review
5. Wait for verification (1-3 business days)

**📧 You'll receive an email when verification is complete.**

## 🔧 **Step 3: Create Facebook App**

### **3.1 Go to Facebook Developers**

1. Visit: https://developers.facebook.com/
2. Click **"My Apps"** > **"Create App"**
3. Choose **"Business"** as app type
4. Fill in app details:
   - **App name**: "Your Business WhatsApp API"
   - **App contact email**: Your business email
   - **Business account**: Select the one you created

### **3.2 Add WhatsApp Product**

1. In your app dashboard, click **"Add Product"**
2. Find **"WhatsApp"** and click **"Set Up"**
3. You'll see the WhatsApp configuration page

## 📞 **Step 4: Add Your Phone Number**

### **4.1 Add Phone Number**

1. In the WhatsApp section, click **"Add Phone Number"**
2. Enter your existing phone number (the one you deleted from WhatsApp)
3. Choose verification method:
   - **SMS** (recommended)
   - **Voice call**
4. Click **"Send Code"**

### **4.2 Verify Phone Number**

1. Check your phone for the verification code
2. Enter the code in the Facebook interface
3. Click **"Verify"**
4. Your number will be registered with the Business API

## 🔑 **Step 5: Get Your API Credentials**

### **5.1 Get Access Token**

1. In WhatsApp section, go to **"API Setup"**
2. Copy your **"Temporary access token"**
3. **Important**: This token expires in 24 hours
4. For production, you'll need a **"Permanent access token"**

### **5.2 Get Phone Number ID**

1. In the same section, copy your **"Phone number ID"**
2. This is a unique identifier for your number (e.g., `123456789012345`)

### **5.3 Get Business Account ID**

1. Go to **Business Settings** > **WhatsApp Business Accounts**
2. Copy your **"WhatsApp Business Account ID"**
3. This is a unique identifier for your business account

## 🔧 **Step 6: Configure Your Environment**

### **6.1 Production Configuration (ecosystem.config.js)**

For production deployment, update the `ecosystem.config.js` file in the `mayday-callcenter-backend` app section:

```javascript
// ========== WHATSAPP PROVIDER CONFIGURATION ==========
WHATSAPP_PROVIDER: "facebook",

// ========== FACEBOOK WHATSAPP BUSINESS API ==========
WHATSAPP_API_URL: "https://graph.facebook.com/v18.0",
WHATSAPP_ACCESS_TOKEN: "your_access_token_here",
WHATSAPP_PHONE_NUMBER_ID: "your_phone_number_id_here",
WHATSAPP_BUSINESS_ACCOUNT_ID: "your_business_account_id_here",
WHATSAPP_VERIFY_TOKEN: "your_random_verify_token_here",
WHATSAPP_WEBHOOK_URL: "https://cs.hugamara.com/api/whatsapp/webhook",
```

### **6.2 Development Configuration (.env)**

For local development, add these variables to your `mayday/slave-backend/.env` file:

```bash
# Edit mayday/slave-backend/.env
WHATSAPP_PROVIDER=facebook
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
WHATSAPP_VERIFY_TOKEN=your_random_verify_token_here
```

### **6.2 Generate Verify Token**

```bash
# Generate a random verify token
openssl rand -hex 16
# Copy the output and use it as WHATSAPP_VERIFY_TOKEN
```

## 🔗 **Step 7: Configure Webhook**

### **7.1 Set Up Webhook URL**

1. Go to: https://developers.facebook.com/
2. Select your app
3. Go to **WhatsApp** > **Configuration**
4. In the **"Webhook"** section:
   - **Callback URL**: `https://your-domain.com/api/whatsapp/webhook`
   - **Verify Token**: Your random verify token from step 6.2
5. Click **"Verify and Save"**

### **7.2 Subscribe to Webhook Events**

1. In the same section, click **"Manage"**
2. Subscribe to these events:
   - **messages**
   - **message_deliveries**
   - **message_reads**
3. Click **"Subscribe"**

## 🧪 **Step 8: Test Your Setup**

### **8.1 Test API Connection**

```bash
# Test if your API is working
curl -X GET "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### **8.2 Test Sending a Message**

```bash
# Test sending a message
curl -X POST "https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "YOUR_PHONE_NUMBER",
    "type": "text",
    "text": {
      "body": "Hello! This is a test message from your WhatsApp Business API."
    }
  }'
```

### **8.3 Test Webhook**

1. Send a message to your WhatsApp number
2. Check your webhook endpoint logs
3. Verify the message is received and processed

## 🚀 **Step 9: Go Live**

### **9.1 Get Permanent Access Token**

1. Go to **Business Settings** > **WhatsApp Business Accounts**
2. Click **"System Users"**
3. Create a new system user
4. Generate a permanent access token
5. Update your environment variables

### **9.2 Configure Production Webhook**

1. Update webhook URL to your production domain
2. Ensure SSL certificate is installed
3. Test webhook in production environment

## 📊 **Step 10: Monitor and Optimize**

### **10.1 Monitor Usage**

1. Check Facebook Developer Console for API usage
2. Monitor message delivery rates
3. Track webhook performance

### **10.2 Optimize Performance**

1. Implement rate limiting
2. Add error handling
3. Monitor response times

## 🆘 **Troubleshooting**

### **Common Issues:**

#### **Issue 1: "Phone number already registered"**

**Solution**: Make sure you deleted your existing WhatsApp account completely.

#### **Issue 2: "Access token expired"**

**Solution**: Generate a new access token or use a permanent token.

#### **Issue 3: "Webhook verification failed"**

**Solution**: Check that your webhook URL is accessible and the verify token matches.

#### **Issue 4: "Business verification pending"**

**Solution**: Wait for verification to complete (1-3 business days).

### **Getting Help:**

- **Facebook Developer Documentation**: https://developers.facebook.com/docs/whatsapp
- **Facebook Developer Community**: https://developers.facebook.com/community/
- **WhatsApp Business API Support**: https://developers.facebook.com/support/

## 🎉 **Congratulations!**

You've successfully set up your existing WhatsApp number with Facebook's WhatsApp Business API. You can now:

- ✅ Send and receive messages programmatically
- ✅ Use your existing phone number
- ✅ Pay only for messages you send (free tier available)
- ✅ Scale your business communications
- ✅ Integrate with your call center system

## 📋 **Next Steps**

1. **Test the integration** with your call center system
2. **Train your agents** on the new WhatsApp interface
3. **Set up monitoring** for message delivery
4. **Configure templates** for common responses
5. **Go live** with your customers!

---

**Need Help?** If you run into any issues, check the troubleshooting section above or contact Facebook Developer Support.
