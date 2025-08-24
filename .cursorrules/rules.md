# Hugamara Hospitality App - Development Rules

## Project Overview
Hugamara operates 6 hospitality outlets (3 non-lodging + 3 restaurants) with a comprehensive dashboard system for operations, CRM, reservations, and analytics.

## Tech Stack Requirements
- **Frontend**: React with JavaScript (ES6), function-based components only
- **Backend**: Node.js/Express
- **Database**: MySQL (RDS) for OLTP, S3 for media
- **Cloud**: AWS (EC2/ECS, RDS, S3, CloudFront, Lambda)
- **Telephony**: Asterisk integration
- **Analytics**: Power BI or equivalent
- **UI**: Dark theme with shadows, no gradients

## Architecture Principles
1. **RBAC (Role-Based Access Control)**: 6 distinct access levels from Org Admin to Staff
2. **Multi-tenant**: Outlet-scoped data with cross-outlet visibility for HQ
3. **Real-time**: Live dashboards with WebSocket/SSE for operational data
4. **Scalable**: Microservices architecture for different business domains
5. **Secure**: PII protection, audit trails, least privilege access

## Core Modules (MVP - 3 weeks)
1. **Authentication & RBAC System**
2. **Outlet Management & Switching**
3. **Dashboard Framework** (Executive, Outlet, Supervisor, Staff views)
4. **Reservations & Waitlist Management**
5. **Basic CRM & Guest Profiles**
6. **Ticketing System**
7. **User Management**

## Development Standards
- **Components**: ES6 function-based components only, no class components
- **Styling**: Dark theme with shadows, no gradients, responsive design
- **State Management**: Redux Toolkit or Zustand for global state
- **API**: RESTful with OpenAPI/Swagger documentation
- **Testing**: Jest + React Testing Library
- **Code Quality**: ESLint, Prettier, ES6+ syntax

## Database Schema Requirements
- **Multi-tenant**: outlet_id on all relevant tables
- **Audit trails**: created_by, updated_by, created_at, updated_at
- **Soft deletes**: is_deleted flag instead of hard deletes
- **PII protection**: encryption for sensitive guest data

## Security Requirements
- JWT tokens with refresh mechanism
- Role-based API endpoints
- Data masking for PII based on user role
- Audit logging for sensitive operations
- Rate limiting and input validation

## Performance Requirements
- Dashboard load time < 3 seconds
- Real-time updates < 1 second
- Support for 100+ concurrent users per outlet
- Mobile-responsive design

## Integration Points
- **POS Systems**: Real-time order sync
- **Payment Gateways**: Secure payment processing
- **Communication**: SMS, Email, WhatsApp APIs
- **Asterisk**: Call center integration
- **Power BI**: Analytics data export

## File Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Route-based page components
├── services/           # API calls and business logic
├── utils/              # Helper functions and constants
├── styles/             # Global styles and themes
├── assets/             # Images, icons, static files
└── hooks/              # Custom React hooks
```

## Naming Conventions
- **Components**: PascalCase (e.g., `ReservationCard`)
- **Files**: kebab-case (e.g., `reservation-card.jsx`)
- **Variables**: camelCase (e.g., `reservationData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RESERVATIONS`)
- **Functions**: camelCase (e.g., `handleReservation`)

## Component Guidelines
- One component per file
- Use ES6 function syntax with arrow functions
- Use destructuring for props
- Implement error boundaries for critical components
- Add loading states and error handling
- Use React hooks (useState, useEffect, useContext, etc.)

## API Design
- RESTful endpoints with consistent naming
- Standard HTTP status codes
- Error response format: `{ error: string, code: string, details?: any }`
- Pagination for list endpoints
- Filtering and sorting support

## Testing Requirements
- Unit tests for all utility functions
- Component tests for critical UI components
- Integration tests for API endpoints
- E2E tests for critical user flows
- Minimum 80% code coverage

## Documentation
- README with setup instructions
- API documentation with examples
- Component storybook for UI components
- Database schema documentation
- Deployment and environment setup guide