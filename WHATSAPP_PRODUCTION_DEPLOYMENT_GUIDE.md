# WhatsApp Production Deployment Guide

## 🚀 **Production Configuration with ecosystem.config.js**

This guide explains how to deploy the WhatsApp integration in production using PM2 ecosystem configuration instead of .env files.

## 📋 **Prerequisites**

- PM2 installed globally: `npm install -g pm2`
- Production server with Node.js
- MySQL database
- SSL certificate for webhook endpoints
- WhatsApp Business API credentials (Facebook or Lipachat)

## 🔧 **Configuration Overview**

### **Production Environment Variables**

All WhatsApp configuration is managed through the `ecosystem.config.js` file in the `mayday-callcenter-backend` app section. This approach provides:

- **Centralized Configuration**: All settings in one file
- **Environment Separation**: Different configs for dev/staging/prod
- **PM2 Integration**: Automatic process management
- **Security**: No .env files in production
- **Scalability**: Easy to manage multiple instances

## 📝 **ecosystem.config.js Structure**

### **WhatsApp Provider Configuration**

```javascript
// ========== WHATSAPP PROVIDER CONFIGURATION ==========
// Choose your WhatsApp provider: "facebook" or "lipachat"
WHATSAPP_PROVIDER: "facebook",
```

### **Facebook WhatsApp Business API Configuration**

```javascript
// ========== FACEBOOK WHATSAPP BUSINESS API ==========
WHATSAPP_API_URL: "https://graph.facebook.com/v18.0",
WHATSAPP_ACCESS_TOKEN: "your_facebook_access_token",
WHATSAPP_PHONE_NUMBER_ID: "your_phone_number_id",
WHATSAPP_BUSINESS_ACCOUNT_ID: "your_business_account_id",
WHATSAPP_VERIFY_TOKEN: "your_verify_token",
```

### **Lipachat Configuration (Alternative)**

```javascript
// ========== LIPACHAT WHATSAPP CONFIGURATION ==========
LIPACHAT_API_KEY: "your_lipachat_api_key",
LIPACHAT_PHONE_NUMBER: "+1234567890",
LIPACHAT_GATEWAY_URL: "https://gateway.lipachat.com/api/v1/whatsapp",
LIPACHAT_WEBHOOK_SECRET: "your_webhook_secret",
```

### **Rate Limiting Configuration**

```javascript
// ========== RATE LIMITING ==========
RATE_LIMIT_WINDOW_MS: "900000",        // 15 minutes
RATE_LIMIT_MAX_REQUESTS: "100",        // Max requests per window
```

### **Webhook Configuration**

```javascript
// ========== WHATSAPP WEBHOOK CONFIGURATION ==========
WHATSAPP_WEBHOOK_URL: "https://cs.hugamara.com/api/whatsapp/webhook",
WHATSAPP_WEBHOOK_VERIFY_TOKEN: "your_webhook_verify_token",
```

### **Message Configuration**

```javascript
// ========== WHATSAPP MESSAGE CONFIGURATION ==========
WHATSAPP_MESSAGE_TIMEOUT: "30000",                    // 30 seconds
WHATSAPP_TEMPLATE_APPROVAL_REQUIRED: "true",          // Require template approval
WHATSAPP_MEDIA_UPLOAD_TIMEOUT: "60000",               // 1 minute
WHATSAPP_MAX_MESSAGE_LENGTH: "4096",                  // Max message length
WHATSAPP_MAX_MEDIA_SIZE_MB: "16",                     // Max media file size
```

### **Conversation Management**

```javascript
// ========== WHATSAPP CONVERSATION MANAGEMENT ==========
WHATSAPP_CONVERSATION_TIMEOUT: "1800000",             // 30 minutes
WHATSAPP_AGENT_RESPONSE_TIMEOUT: "300000",            // 5 minutes
WHATSAPP_AUTO_ASSIGN_ENABLED: "true",                 // Auto-assign conversations
WHATSAPP_QUEUE_MAX_SIZE: "100",                       // Max queue size
WHATSAPP_CONVERSATION_CLEANUP_INTERVAL: "3600000",    // 1 hour
```

### **Notification Configuration**

```javascript
// ========== WHATSAPP NOTIFICATION CONFIGURATION ==========
WHATSAPP_NOTIFICATION_ENABLED: "true",                // Enable notifications
WHATSAPP_SOUND_NOTIFICATIONS: "true",                 // Sound notifications
WHATSAPP_EMAIL_NOTIFICATIONS: "false",                // Email notifications
WHATSAPP_SLACK_NOTIFICATIONS: "false",                // Slack notifications
```

### **Analytics Configuration**

```javascript
// ========== WHATSAPP ANALYTICS ==========
WHATSAPP_ANALYTICS_ENABLED: "true",                   // Enable analytics
WHATSAPP_METRICS_RETENTION_DAYS: "90",                // Keep metrics for 90 days
WHATSAPP_PERFORMANCE_TRACKING: "true",                // Track performance
```

## 🚀 **Deployment Steps**

### **Step 1: Update Configuration**

1. **Edit ecosystem.config.js**:

   ```bash
   nano ecosystem.config.js
   ```

2. **Update WhatsApp credentials**:

   - Replace `your_facebook_access_token` with your actual token
   - Replace `your_phone_number_id` with your phone number ID
   - Replace `your_business_account_id` with your business account ID
   - Replace `your_verify_token` with your webhook verify token

3. **Choose your provider**:
   - Set `WHATSAPP_PROVIDER: "facebook"` for Facebook API
   - Set `WHATSAPP_PROVIDER: "lipachat"` for Lipachat

### **Step 2: Database Setup**

1. **Run database migrations**:

   ```bash
   cd mayday/slave-backend
   npm run migrate
   ```

2. **Verify database connection**:
   ```bash
   curl https://cs.hugamara.com/api/whatsapp/health
   ```

### **Step 3: Deploy with PM2**

1. **Stop existing processes**:

   ```bash
   pm2 stop all
   ```

2. **Start with ecosystem config**:

   ```bash
   pm2 start ecosystem.config.js
   ```

3. **Save PM2 configuration**:
   ```bash
   pm2 save
   pm2 startup
   ```

### **Step 4: Configure Webhook**

1. **Update webhook URL** in your WhatsApp provider:

   - **Facebook**: https://developers.facebook.com/
   - **Lipachat**: https://lipachat.com/dashboard

2. **Set webhook URL**:

   ```
   https://cs.hugamara.com/api/whatsapp/webhook
   ```

3. **Set verify token** (use the same token from ecosystem.config.js)

### **Step 5: Test Integration**

1. **Test API health**:

   ```bash
   curl https://cs.hugamara.com/api/whatsapp/health
   ```

2. **Test webhook**:

   - Send a test message to your WhatsApp number
   - Check PM2 logs: `pm2 logs mayday-callcenter-backend`

3. **Test agent interface**:
   - Open the Electron softphone application
   - Verify WhatsApp conversations are loading
   - Test sending a message

## 📊 **Monitoring and Maintenance**

### **PM2 Commands**

```bash
# View all processes
pm2 list

# View logs
pm2 logs mayday-callcenter-backend

# Restart service
pm2 restart mayday-callcenter-backend

# Monitor resources
pm2 monit

# View process details
pm2 show mayday-callcenter-backend
```

### **Health Checks**

1. **API Health Endpoint**:

   ```bash
   curl https://cs.hugamara.com/api/whatsapp/health
   ```

2. **Database Health**:

   ```bash
   curl https://cs.hugamara.com/api/whatsapp/health
   ```

3. **Webhook Health**:
   - Check webhook delivery status in your provider dashboard
   - Monitor webhook logs in PM2

### **Log Management**

1. **View logs**:

   ```bash
   pm2 logs mayday-callcenter-backend --lines 100
   ```

2. **Log rotation**:
   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 30
   ```

## 🔒 **Security Considerations**

### **Environment Variables**

- **Never commit** ecosystem.config.js with real credentials
- **Use environment-specific** configuration files
- **Rotate credentials** regularly
- **Monitor access** to configuration files

### **Webhook Security**

1. **Verify webhook signatures**:

   - Facebook: Use `X-Hub-Signature-256` header
   - Lipachat: Use `X-Lipachat-Signature` header

2. **Use HTTPS** for all webhook endpoints
3. **Implement rate limiting** on webhook endpoints
4. **Log all webhook requests** for security monitoring

### **API Security**

1. **Use permanent access tokens** (not temporary ones)
2. **Implement proper authentication** for all API endpoints
3. **Use HTTPS** for all API communications
4. **Monitor API usage** and implement alerts

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Issue 1: Webhook Not Receiving Messages**

**Symptoms:**

- Messages sent to WhatsApp number not appearing in system
- Webhook logs show no incoming requests

**Solutions:**

1. Check webhook URL is accessible: `curl https://cs.hugamara.com/api/whatsapp/webhook`
2. Verify webhook configuration in provider dashboard
3. Check SSL certificate is valid
4. Verify verify token matches configuration

#### **Issue 2: Messages Not Sending**

**Symptoms:**

- API calls to send messages failing
- Error logs show authentication issues

**Solutions:**

1. Verify access token is valid and not expired
2. Check phone number ID is correct
3. Verify API URL is correct
4. Check rate limiting settings

#### **Issue 3: Database Connection Issues**

**Symptoms:**

- Health check endpoint returns 500 error
- Database queries failing

**Solutions:**

1. Check database credentials in ecosystem.config.js
2. Verify database server is running
3. Check network connectivity
4. Verify database permissions

#### **Issue 4: PM2 Process Issues**

**Symptoms:**

- Process not starting
- Process crashing repeatedly

**Solutions:**

1. Check PM2 logs: `pm2 logs mayday-callcenter-backend`
2. Verify Node.js version compatibility
3. Check memory usage: `pm2 monit`
4. Verify all dependencies are installed

### **Debug Commands**

```bash
# Check PM2 status
pm2 status

# View detailed logs
pm2 logs mayday-callcenter-backend --lines 200

# Check system resources
pm2 monit

# Restart with verbose logging
pm2 restart mayday-callcenter-backend --log-date-format="YYYY-MM-DD HH:mm:ss Z"

# Check environment variables
pm2 show mayday-callcenter-backend
```

## 📈 **Performance Optimization**

### **PM2 Configuration**

1. **Adjust memory limits**:

   ```javascript
   max_memory_restart: "1G";
   ```

2. **Configure instances**:

   ```javascript
   instances: 1,  // Single instance for WhatsApp
   exec_mode: "fork"
   ```

3. **Set restart policies**:
   ```javascript
   autorestart: true,
   watch: false,
   ```

### **Database Optimization**

1. **Add indexes** for frequently queried fields
2. **Optimize queries** for conversation retrieval
3. **Implement connection pooling**
4. **Monitor query performance**

### **API Optimization**

1. **Implement caching** for frequently accessed data
2. **Use connection pooling** for external APIs
3. **Implement retry logic** for failed requests
4. **Monitor API response times**

## 🎯 **Best Practices**

### **Configuration Management**

1. **Use version control** for ecosystem.config.js
2. **Create environment-specific** configuration files
3. **Document all configuration changes**
4. **Test configuration changes** in staging first

### **Deployment Process**

1. **Always test** in staging environment first
2. **Use blue-green deployment** for zero downtime
3. **Monitor logs** during deployment
4. **Have rollback plan** ready

### **Monitoring**

1. **Set up alerts** for critical issues
2. **Monitor key metrics** (response time, error rate, etc.)
3. **Regular health checks** of all components
4. **Log analysis** for performance insights

## 📞 **Support and Maintenance**

### **Regular Maintenance Tasks**

1. **Weekly**: Check PM2 logs for errors
2. **Monthly**: Review API usage and costs
3. **Quarterly**: Update dependencies and security patches
4. **Annually**: Review and update configuration

### **Emergency Procedures**

1. **Service Down**: Check PM2 status and restart if needed
2. **Database Issues**: Check database connectivity and credentials
3. **API Issues**: Verify provider status and credentials
4. **Webhook Issues**: Check webhook configuration and SSL

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready

For technical support or questions about this deployment guide, please refer to the troubleshooting section above or contact the development team.
