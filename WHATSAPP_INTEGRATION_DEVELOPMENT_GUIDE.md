# WhatsApp Integration Development Guide

## Hospitality Business Call Center Implementation

### Overview

This guide outlines the development process for integrating WhatsApp Business messaging into the existing call center system using Lipachat API. The integration enables agents to handle customer inquiries, bookings, and support requests through WhatsApp while maintaining proper ownership, disposition tracking, and performance metrics.

### Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   WhatsApp      │    │   Lipachat API   │    │   Slave Backend │
│   Business      │◄──►│   Gateway        │◄──►│   (Node.js)     │
│   Number        │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Agent Chat    │    │   WebSocket      │    │   Database      │
│   Interface     │◄──►│   Real-time      │◄──►│   (MySQL)       │
│   (Electron)    │    │   Updates        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Current Implementation Status ✅

#### Backend (Slave Backend)

- **Lipachat Service**: ✅ Integrated (`services/lipachatService.js`)
- **WhatsApp Controller**: ✅ Enhanced with agent ownership
- **Database Models**: ✅ Enhanced with disposition tracking
- **API Routes**: ✅ Added agent management endpoints
- **WebSocket Integration**: ✅ Real-time updates

#### Frontend Components

- **Configuration Dashboard**: ✅ Ready (`WhatsappWebConfig.js`)
- **Agent Chat Interface**: ✅ Ready (`WhatsAppElectronComponent.jsx`)

### Database Schema

#### WhatsApp Conversations Table

```sql
CREATE TABLE whatsapp_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  contactId INT NOT NULL,
  assignedAgentId UUID,
  status ENUM('open', 'pending', 'snoozed', 'resolved', 'archived'),
  priority ENUM('low', 'normal', 'high', 'urgent'),
  disposition ENUM('resolved', 'escalated', 'follow_up_required', 'booking_confirmed', 'booking_cancelled', 'complaint_resolved', 'complaint_escalated', 'inquiry_answered', 'no_response', 'wrong_number', 'spam'),
  dispositionNotes TEXT,
  dispositionDate DATETIME,
  customerType ENUM('guest', 'prospect', 'returning', 'vip', 'group'),
  serviceType ENUM('booking', 'complaint', 'inquiry', 'support', 'feedback'),
  reservationId VARCHAR(255),
  responseTime INT,
  resolutionTime INT,
  customerSatisfaction INT,
  unreadCount INT DEFAULT 0,
  lastMessageAt DATETIME,
  lockOwnerId UUID,
  lockExpiresAt DATETIME,
  tags JSON,
  metadata JSON,
  createdAt DATETIME,
  updatedAt DATETIME
);
```

### API Endpoints

#### Agent Management

- `POST /api/whatsapp/conversations/assign` - Assign conversation to agent
- `PUT /api/whatsapp/conversations/:id/disposition` - Update disposition
- `GET /api/whatsapp/agent/conversations` - Get agent's conversations
- `GET /api/whatsapp/conversations/:id` - Get conversation details
- `POST /api/whatsapp/conversations/:id/transfer` - Transfer conversation

#### Message Management

- `GET /api/whatsapp/chats` - Get all chats
- `GET /api/whatsapp/chats/:contactId/messages` - Get chat messages
- `POST /api/whatsapp/chats/:contactId/messages` - Send message
- `POST /api/whatsapp/chats/:contactId/read` - Mark as read

### Environment Configuration

#### Production Configuration (ecosystem.config.js)

For production deployment, all WhatsApp configuration is managed through the `ecosystem.config.js` file. The configuration is already set up in the `mayday-callcenter-backend` app section.

**Key Configuration Sections:**

- **WhatsApp Provider**: Choose between Facebook API or Lipachat
- **Facebook WhatsApp Business API**: Complete configuration for Facebook integration
- **Lipachat Configuration**: Alternative provider setup
- **Rate Limiting**: API call rate limiting settings
- **Webhook Configuration**: Webhook endpoints and security
- **Message Configuration**: Timeouts, limits, and template settings
- **Conversation Management**: Agent assignment and queue management
- **Notifications**: Real-time notification settings
- **Analytics**: Performance tracking and metrics

#### Development Environment Variables

For local development, add these variables to your `mayday/slave-backend/.env` file:

```bash
# ========== WHATSAPP PROVIDER CONFIGURATION ==========
# Choose your WhatsApp provider: "facebook" or "lipachat"
WHATSAPP_PROVIDER=facebook

# ========== FACEBOOK WHATSAPP BUSINESS API ==========
# Facebook WhatsApp Business API configuration (Recommended)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_facebook_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_VERIFY_TOKEN=your_verify_token

# ========== LIPACHAT WHATSAPP CONFIGURATION ==========
# Lipachat API configuration for WhatsApp Business (Alternative)
LIPACHAT_API_KEY=your_lipachat_api_key
LIPACHAT_PHONE_NUMBER=+1234567890
LIPACHAT_GATEWAY_URL=https://gateway.lipachat.com/api/v1/whatsapp
LIPACHAT_WEBHOOK_SECRET=your_webhook_secret

# ========== RATE LIMITING ==========
# Rate limiting configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Development Tasks

#### Phase 1: Core Setup (Completed ✅)

- [x] Verify Lipachat API integration
- [x] Implement agent ownership system
- [x] Add disposition tracking
- [x] Enhance database models
- [x] Create API endpoints

#### Phase 2: Frontend Integration (Completed ✅)

- [x] Update WhatsAppElectronComponent for agent ownership
- [x] Add disposition tracking UI
- [x] Implement real-time notifications
- [x] Add conversation transfer functionality
- [x] Create ChatQueueManager component
- [x] Add hospitality template system

#### Phase 3: Hospitality Features (Completed ✅)

- [x] Create hospitality-specific templates
- [x] Implement booking integration
- [x] Add customer type classification
- [x] Create service type routing

#### Phase 4: Advanced Features (Completed ✅)

- [x] Chat queue management
- [x] Agent status integration
- [x] Performance analytics
- [x] Media handling enhancement

#### Phase 5: Testing & Deployment (Pending)

- [ ] Sandbox testing
- [ ] End-to-end testing
- [ ] Production deployment
- [ ] Monitoring setup

### Hospitality-Specific Features

#### Disposition Categories

- **Booking Related**: `booking_confirmed`, `booking_cancelled`
- **Complaint Handling**: `complaint_resolved`, `complaint_escalated`
- **General Support**: `resolved`, `escalated`, `follow_up_required`
- **Quality Control**: `no_response`, `wrong_number`, `spam`

#### Customer Types

- **Guest**: Current hotel guests
- **Prospect**: Potential customers
- **Returning**: Repeat customers
- **VIP**: High-value customers
- **Group**: Group bookings

#### Service Types

- **Booking**: Reservation inquiries
- **Complaint**: Service complaints
- **Inquiry**: General questions
- **Support**: Technical support
- **Feedback**: Customer feedback

### Agent Workflow

1. **New Chat Arrives**

   - System creates conversation record
   - Assigns to available agent or queue
   - Sends real-time notification

2. **Agent Takes Chat**

   - Agent claims conversation
   - System locks conversation to agent
   - Updates status to "open"

3. **Chat Processing**

   - Agent responds to customer
   - System tracks response time
   - Updates conversation status

4. **Disposition Recording**

   - Agent selects appropriate disposition
   - Adds notes and satisfaction rating
   - System calculates resolution time

5. **Chat Resolution**
   - Conversation marked as resolved
   - Performance metrics updated
   - Agent available for new chats

### Real-time Events

#### WebSocket Events

- `whatsapp:message` - New message received
- `whatsapp:status_update` - Message status update
- `whatsapp:conversation_assigned` - Conversation assigned to agent
- `whatsapp:conversation_transferred` - Conversation transferred
- `whatsapp:disposition_updated` - Disposition updated

### Testing Strategy

#### Unit Tests

- Test Lipachat service functions
- Test conversation assignment logic
- Test disposition tracking
- Test API endpoints

#### Integration Tests

- Test webhook handling
- Test real-time updates
- Test agent workflow
- Test database operations

#### End-to-End Tests

- Test complete chat flow
- Test agent handoff
- Test disposition recording
- Test performance metrics

### Deployment Checklist

#### Pre-deployment

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Webhook URLs configured
- [ ] SSL certificates installed

#### Post-deployment

- [ ] Webhook testing
- [ ] Agent training
- [ ] Performance monitoring
- [ ] Backup procedures

### Monitoring & Analytics

#### Key Metrics

- Response time per agent
- Resolution time per conversation
- Customer satisfaction scores
- Chat volume by time period
- Disposition distribution

#### Alerts

- High response times
- Unassigned conversations
- Failed webhook deliveries
- Database connection issues

### Security Considerations

#### Data Protection

- Encrypt sensitive customer data
- Secure API endpoints
- Validate webhook signatures
- Implement rate limiting

#### Access Control

- Agent permission validation
- Conversation ownership checks
- Admin access controls
- Audit logging

### Troubleshooting

#### Common Issues

1. **Webhook not receiving messages**

   - Check webhook URL configuration
   - Verify signature validation
   - Check network connectivity

2. **Messages not sending**

   - Verify Lipachat API key
   - Check phone number format
   - Review API rate limits

3. **Real-time updates not working**
   - Check WebSocket connection
   - Verify event emission
   - Review client-side listeners

### Next Steps

1. **Immediate**: Test the current implementation with Lipachat sandbox
2. **Short-term**: Update frontend components for agent ownership
3. **Medium-term**: Implement hospitality-specific templates
4. **Long-term**: Add advanced analytics and reporting

### Support

For technical support or questions:

- Backend issues: Check `mayday/slave-backend/` logs
- Frontend issues: Check browser console and Electron logs
- API issues: Review controller logs and database queries
- Integration issues: Verify Lipachat API status and configuration

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Development Phase 2
