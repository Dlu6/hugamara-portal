# WhatsApp Business Number Setup Guide

## 🎯 Quick Start (Recommended)

### **Option 1: Twilio (Easiest for Developers)**

1. **Sign up for Twilio**
   - Visit: https://www.twilio.com/try-twilio
   - Create a free account (includes $15 credit)
   - Verify your phone number and email

2. **Purchase a Phone Number**
   ```bash
   # In Twilio Console:
   # 1. Go to Phone Numbers > Manage > Buy a number
   # 2. Select your country
   # 3. Choose features: SMS + Voice
   # 4. Pick a number and purchase (~$1/month)
   ```

3. **Configure for WhatsApp**
   ```bash
   # Set webhook URL:
   # https://your-domain.com/api/whatsapp/webhook
   ```

### **Option 2: MessageBird (WhatsApp-focused)**

1. **Sign up for MessageBird**
   - Visit: https://www.messagebird.com/
   - Create a free account

2. **Apply for WhatsApp Business API**
   - Complete business verification
   - Wait for approval (1-2 weeks)
   - Get your WhatsApp Business number

## 📱 Phone Number Requirements

### **What You Need:**
- ✅ Real, active phone number
- ✅ Can receive SMS and voice calls
- ✅ Not already registered with WhatsApp
- ✅ In a supported country/region

### **Supported Countries:**
- 🇺🇸 United States
- 🇬🇧 United Kingdom
- 🇨🇦 Canada
- 🇦🇺 Australia
- 🇩🇪 Germany
- 🇫🇷 France
- 🇪🇸 Spain
- 🇮🇹 Italy
- 🇳🇱 Netherlands
- 🇧🇪 Belgium
- 🇸🇬 Singapore
- 🇭🇰 Hong Kong
- 🇯🇵 Japan
- 🇰🇷 South Korea
- 🇮🇳 India
- 🇧🇷 Brazil
- 🇲🇽 Mexico
- 🇦🇷 Argentina
- 🇨🇱 Chile
- 🇨🇴 Colombia
- And many more...

## 💰 Cost Comparison

| Provider | Setup Cost | Monthly Cost | Features |
|----------|------------|--------------|----------|
| **Twilio** | Free | $1-2/month | SMS, Voice, WhatsApp API |
| **MessageBird** | Free | $1-2/month | WhatsApp Business API |
| **Vonage** | Free | $1-2/month | SMS, Voice, WhatsApp API |
| **Google Voice** | Free | Free | US only, limited features |
| **Mobile Carrier** | $10-20 | $20-50/month | Full service, physical SIM |

## 🔧 Setup Instructions

### **Step 1: Choose Your Provider**

**For Quick Testing:**
- Use Twilio (easiest setup)
- Free trial with $15 credit
- Can send test messages immediately

**For Production:**
- Use MessageBird (WhatsApp-focused)
- Better WhatsApp integration
- More business features

### **Step 2: Get Your Number**

#### **Twilio Setup:**
1. Sign up at https://www.twilio.com/try-twilio
2. Verify your account
3. Go to Phone Numbers > Manage > Buy a number
4. Select country and features (SMS + Voice)
5. Purchase the number (~$1/month)

#### **MessageBird Setup:**
1. Sign up at https://www.messagebird.com/
2. Go to WhatsApp > Get Started
3. Complete business verification
4. Wait for approval (1-2 weeks)
5. Get your WhatsApp Business number

### **Step 3: Configure Your Number**

#### **Update Environment Variables:**
```bash
# Edit mayday/slave-backend/.env
LIPACHAT_PHONE_NUMBER=+1234567890  # Your new number
LIPACHAT_API_KEY=your_api_key
LIPACHAT_GATEWAY_URL=https://gateway.lipachat.com/api/v1/whatsapp
LIPACHAT_WEBHOOK_SECRET=your_webhook_secret
```

#### **Set Webhook URL:**
```bash
# In your provider's console, set webhook to:
https://your-domain.com/api/whatsapp/webhook

# For local development:
http://localhost:8004/api/whatsapp/webhook
```

### **Step 4: Test Your Setup**

Run the test script:
```bash
node test-whatsapp-setup.js
```

## 🧪 Testing Your Number

### **Test 1: Basic Connectivity**
```bash
# Test if your number can receive messages
curl -X POST "https://gateway.lipachat.com/api/v1/whatsapp" \
  -H "apiKey: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_WHATSAPP_NUMBER",
    "from": "YOUR_WHATSAPP_NUMBER",
    "message": "Test message"
  }'
```

### **Test 2: Webhook Testing**
```bash
# Test webhook endpoint
curl -X POST "http://localhost:8004/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "id": "test-123",
      "text": "Test webhook",
      "timestamp": "2024-01-01T00:00:00Z"
    },
    "contact": {
      "phoneNumber": "+1234567890"
    }
  }'
```

## 🚨 Common Issues & Solutions

### **Issue 1: Number Already Registered**
**Problem:** Phone number is already registered with WhatsApp
**Solution:** 
- Use a different number
- Or deregister the current number first

### **Issue 2: API Key Invalid**
**Problem:** Getting 401 Unauthorized errors
**Solution:**
- Check your API key is correct
- Ensure it's properly set in environment variables

### **Issue 3: Webhook Not Working**
**Problem:** Messages not being received
**Solution:**
- Check webhook URL is accessible
- Verify SSL certificate (for production)
- Check firewall settings

### **Issue 4: Number Format Issues**
**Problem:** Invalid phone number format
**Solution:**
- Use international format: +1234567890
- Include country code
- No spaces or special characters

## 📋 Pre-Launch Checklist

Before going live, ensure:

- [ ] Phone number is active and can receive SMS
- [ ] API key is valid and has proper permissions
- [ ] Webhook URL is accessible and secure
- [ ] Environment variables are properly set
- [ ] Test messages can be sent and received
- [ ] Webhook can process incoming messages
- [ ] Database is properly configured
- [ ] SSL certificate is installed (for production)

## 🔒 Security Considerations

### **API Key Security:**
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### **Webhook Security:**
- Use HTTPS in production
- Implement signature verification
- Rate limit webhook endpoints
- Log all webhook requests

## 📞 Support

### **Twilio Support:**
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com/
- Community: https://stackoverflow.com/questions/tagged/twilio

### **MessageBird Support:**
- Documentation: https://developers.messagebird.com/
- Support: https://support.messagebird.com/
- Community: https://community.messagebird.com/

### **General WhatsApp Business:**
- Documentation: https://developers.facebook.com/docs/whatsapp
- Support: https://developers.facebook.com/support/

## 🎉 Next Steps

Once you have your WhatsApp Business number:

1. **Test the integration** with the test script
2. **Configure webhooks** for real-time messaging
3. **Set up monitoring** for message delivery
4. **Train your agents** on the new system
5. **Go live** with your customers!

---

**Need Help?** If you run into any issues, check the troubleshooting section above or contact support for your chosen provider.
