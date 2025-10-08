# Contact Management System

A comprehensive contact management system integrated into the Mayday Call Center Electron Softphone application.

## 🎯 Overview

The Contact Management System provides a complete solution for managing customer contacts, integrating seamlessly with WhatsApp, calling, and other communication channels. It serves as the foundation for building a robust customer relationship management (CRM) system within the call center.

## 🏗️ Architecture

### Backend Components

1. **Contact Model** (`mayday/slave-backend/models/contactModel.js`)

   - Comprehensive data model with validation
   - Support for multiple contact types, priorities, and statuses
   - WhatsApp integration fields
   - Custom fields and social media support
   - Full-text search capabilities

2. **Contact Controller** (`mayday/slave-backend/controllers/contactController.js`)

   - Full CRUD operations
   - Advanced filtering and pagination
   - Bulk operations support
   - Search and export functionality
   - Statistics and analytics

3. **Contact Routes** (`mayday/slave-backend/routes/contactRoutes.js`)
   - RESTful API endpoints
   - Authentication middleware
   - Input validation

### Frontend Components

1. **Contact Service** (`mayday/electron-softphone/src/services/contactService.js`)

   - API integration layer
   - Data validation utilities
   - Phone number formatting
   - Email validation
   - Avatar generation

2. **Contacts Component** (`mayday/electron-softphone/src/components/Contacts.jsx`)
   - Modern Material-UI interface
   - Advanced search and filtering
   - Grid and list view modes
   - Contact form with validation
   - WhatsApp integration
   - Call integration

## 🚀 Features

### Core Contact Management

- **Complete Contact Profiles**: Store comprehensive contact information including personal details, company information, multiple phone numbers, email addresses, and addresses
- **Contact Classification**: Categorize contacts by type (customer, prospect, supplier, partner, internal, other), priority (low, medium, high, VIP), and status (active, inactive, blocked, deleted)
- **Advanced Search**: Full-text search across all contact fields with real-time filtering
- **Tagging System**: Flexible tagging and categorization system for better organization
- **Custom Fields**: Extensible custom fields for specific business needs
- **Social Media Integration**: Store social media profiles and links

### Communication Integration

- **WhatsApp Integration**: Direct WhatsApp chat initiation from contact profiles
- **Call Integration**: One-click calling from contact cards with dial pad integration
- **Email Integration**: Direct email composition and tracking
- **SMS Integration**: SMS capabilities through the contact interface

### Data Management

- **CSV Import/Export**: Complete CSV import and export functionality with validation and error handling
- **Smart Data Validation**: Comprehensive validation for phone numbers, emails, and contact types with automatic mapping
- **Bulk Operations**: Mass update and delete operations for efficient contact management
- **Duplicate Detection**: Automatic detection of duplicate phone numbers
- **Audit Trail**: Track creation, modification, and interaction history
- **Empty Row Handling**: Automatic skipping of empty rows during CSV import
- **Error Reporting**: Detailed error reporting with row-specific validation messages

### User Experience

- **Responsive Design**: Works seamlessly across different screen sizes
- **Modern UI**: Clean, intuitive interface using Material-UI components
- **Real-time Updates**: Live updates when contacts are modified
- **Keyboard Shortcuts**: Efficient navigation and operation
- **Accessibility**: Full accessibility support

## 📊 Database Schema

### Contacts Table

```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firstName VARCHAR NOT NULL,
  lastName VARCHAR,
  company VARCHAR,
  jobTitle VARCHAR,
  primaryPhone VARCHAR NOT NULL UNIQUE,
  secondaryPhone VARCHAR,
  email VARCHAR,
  website VARCHAR,
  address TEXT,
  city VARCHAR,
  state VARCHAR,
  country VARCHAR,
  postalCode VARCHAR,
  contactType ENUM('customer', 'prospect', 'supplier', 'partner', 'internal', 'other') DEFAULT 'customer',
  source ENUM('manual', 'import', 'website', 'referral', 'campaign', 'other') DEFAULT 'manual',
  status ENUM('active', 'inactive', 'blocked', 'deleted') DEFAULT 'active',
  priority ENUM('low', 'medium', 'high', 'vip') DEFAULT 'medium',
  preferredContactMethod ENUM('phone', 'email', 'whatsapp', 'sms') DEFAULT 'phone',
  preferredLanguage VARCHAR DEFAULT 'en',
  timezone VARCHAR DEFAULT 'UTC',
  tags TEXT DEFAULT '[]',
  categories TEXT DEFAULT '[]',
  notes TEXT,
  customFields TEXT DEFAULT '{}',
  socialMedia TEXT DEFAULT '{}',
  whatsappNumber VARCHAR,
  whatsappOptIn BOOLEAN DEFAULT false,
  assignedAgentId UUID REFERENCES users(id),
  createdBy UUID NOT NULL REFERENCES users(id),
  lastContacted TIMESTAMP,
  lastInteraction TIMESTAMP,
  nextFollowUp TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Indexes

- `contacts_primary_phone_unique`: Unique index on primary phone
- `contacts_email_index`: Index on email (where not null)
- `contacts_type_index`: Index on contact type
- `contacts_status_index`: Index on status
- `contacts_assigned_agent_index`: Index on assigned agent
- `contacts_created_by_index`: Index on creator
- `contacts_last_interaction_index`: Index on last interaction

## 🔌 API Endpoints

### Contact Management

- `GET /api/contacts` - Get all contacts with filtering and pagination
- `GET /api/contacts/:id` - Get a specific contact
- `POST /api/contacts` - Create a new contact
- `PUT /api/contacts/:id` - Update a contact
- `DELETE /api/contacts/:id` - Delete a contact (soft delete)

### Search and Analytics

- `GET /api/contacts/search` - Search contacts
- `GET /api/contacts/stats` - Get contact statistics
- `GET /api/contacts/export` - Export contacts to CSV

### Bulk Operations

- `POST /api/contacts/bulk/update` - Bulk update contacts
- `POST /api/contacts/bulk/delete` - Bulk delete contacts

### Import/Export

- `POST /api/contacts/import` - Import contacts from CSV with validation and error handling
- `GET /api/contacts/export` - Export contacts to CSV with filtering options

### CSV Import Features

- **File Validation**: Automatic validation of CSV file format and required fields
- **Data Mapping**: Smart mapping of common contact type values (e.g., "lead" → "prospect")
- **Error Handling**: Detailed error reporting with row-specific validation messages
- **Empty Row Skipping**: Automatic detection and skipping of empty rows
- **Bulk Processing**: Efficient processing of large CSV files
- **Progress Tracking**: Real-time progress indicators during import process

## 🛠️ Setup and Installation

### Backend Setup

1. **Create the contacts table**:

   ```bash
   cd mayday/slave-backend
   node scripts/create-contacts-table.mjs
   ```

2. **Update associations** (already done in `models/associations.js`):

   ```javascript
   import { setupContactAssociations } from "./models/associations.js";
   setupContactAssociations(UserModel, ContactModel);
   ```

3. **Routes are already configured** in `server.js`:
   ```javascript
   app.use("/api/contacts", contactRoutes);
   ```

### Frontend Setup

The Contacts component is already integrated into the main Appbar component. No additional setup is required.

## 📱 Usage

### Accessing Contacts

1. Open the Electron Softphone application
2. Click on the "Contacts" menu item in the sidebar
3. The contacts interface will open with all your contacts

### Creating a New Contact

1. Click the "Add Contact" button
2. Fill in the contact form with required information:
   - First Name (required)
   - Primary Phone (required)
   - Other fields as needed
3. Click "Create" to save the contact

### Searching and Filtering

1. Use the search bar to find contacts by name, phone, email, or company
2. Use the filter dropdowns to filter by:
   - Contact Type (Customer, Prospect, Supplier, etc.)
   - Status (Active, Inactive, Blocked, Deleted)
   - Priority (Low, Medium, High, VIP)

### WhatsApp Integration

1. From a contact card, click the WhatsApp icon
2. This will open the WhatsApp component with the contact pre-loaded
3. You can start chatting immediately

### Call Integration

1. From a contact card, click the phone icon
2. This will populate the dial pad with the contact's phone number
3. You can then initiate the call

### CSV Import

1. Navigate to the Contact Manager section in the callcenter dashboard
2. Click on "Import Contacts" in the sidebar
3. Upload a CSV file with the following format:
   - **Required columns**: `firstName`, `primaryPhone`
   - **Optional columns**: `lastName`, `email`, `company`, `type`, `secondaryPhone`, `whatsappNumber`, `jobTitle`, `notes`
   - **Contact Types**: customer, prospect, supplier, partner, internal, other (or lead, client, vendor, associate, staff - will be automatically mapped)
4. Review any validation errors and fix them if needed
5. Click "Import Contacts" to process the file
6. View the import summary with success/failure counts

### CSV Export

1. Navigate to the Contact Manager section
2. Use filters to select the contacts you want to export
3. Click the "Export" button
4. The system will generate and download a CSV file with the filtered contacts

## 🔧 Configuration

### Contact Types

The system supports the following contact types:

- Customer
- Prospect
- Supplier
- Partner
- Internal
- Other

### Priorities

Contact priorities are:

- Low (Green)
- Medium (Orange)
- High (Red)
- VIP (Purple)

### Statuses

Contact statuses are:

- Active (Green)
- Inactive (Gray)
- Blocked (Red)
- Deleted (Dark Gray)

## 🚀 Future Enhancements

### Planned Features

1. **Advanced Analytics**: Contact interaction analytics and reporting
2. **Contact Scoring**: Automatic contact scoring based on interactions
3. **Workflow Automation**: Automated follow-up and task creation
4. **Integration APIs**: Third-party CRM integration capabilities
5. **Mobile App**: Mobile contact management application
6. **Advanced Search**: Elasticsearch integration for better search
7. **Contact Merging**: Duplicate contact detection and merging
8. **Custom Fields**: Dynamic custom field creation
9. **Contact Templates**: Pre-defined contact templates
10. **Bulk Import**: Advanced import with mapping and validation

### Integration Opportunities

1. **CRM Systems**: Salesforce, HubSpot, Pipedrive integration
2. **Email Marketing**: Mailchimp, Constant Contact integration
3. **Social Media**: LinkedIn, Facebook, Twitter integration
4. **Calendar**: Google Calendar, Outlook integration
5. **Document Management**: File attachment and document storage

## 🐛 Troubleshooting

### Common Issues

1. **Contact not saving**: Check that required fields (firstName, primaryPhone) are filled
2. **Phone validation errors**: Ensure phone numbers are in E.164 format (+country code)
3. **Email validation errors**: Check email format is valid
4. **Duplicate phone numbers**: System prevents duplicate primary phone numbers
5. **WhatsApp integration not working**: Ensure WhatsApp number is properly formatted
6. **CSV import errors**:
   - Ensure CSV has required columns: `firstName`, `primaryPhone`
   - Check that contact types are valid (customer, prospect, supplier, partner, internal, other)
   - Remove empty rows from CSV file
   - Ensure phone numbers are in valid format
7. **CSV import "No file uploaded"**: Check that file is properly selected and is a CSV file
8. **Contact type validation errors**: Invalid contact types will be automatically mapped (e.g., "lead" → "prospect")

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=contact-service
```

## 📝 API Examples

### Create a Contact

```javascript
const contactData = {
  firstName: "John",
  lastName: "Doe",
  company: "Acme Corp",
  primaryPhone: "+256700123456",
  email: "john.doe@acme.com",
  contactType: "customer",
  priority: "high",
  tags: ["VIP", "Important"],
  notes: "Key customer, handle with care",
};

const response = await contactService.createContact(contactData);
```

### Search Contacts

```javascript
const searchResults = await contactService.searchContacts("John", 10);
```

### Update Contact

```javascript
const updatedContact = await contactService.updateContact(contactId, {
  priority: "vip",
  notes: "Updated notes",
});
```

### Export Contacts

```javascript
const csvData = await contactService.exportContacts("csv", {
  contactType: "customer",
  status: "active",
});
```

### CSV Import Example

```javascript
// Example CSV file format
const csvContent = `firstName,lastName,primaryPhone,email,company,type,secondaryPhone,whatsappNumber,jobTitle,notes
John,Doe,+1234567890,john.doe@example.com,Acme Corporation,customer,+1234567891,+1234567890,Software Engineer,Regular customer with high engagement
Jane,Smith,+1987654321,jane.smith@techcorp.com,TechCorp Inc,lead,+1987654322,+1987654321,Marketing Manager,Interested in our premium services
Mike,Johnson,+1555123456,mike.j@startup.io,StartupXYZ,prospect,+1555123457,+1555123456,CEO,Potential enterprise client`;

// Import contacts
const formData = new FormData();
formData.append(
  "file",
  new Blob([csvContent], { type: "text/csv" }),
  "contacts.csv"
);

const response = await contactService.importContacts(formData);
console.log("Import result:", response);
// Output: { success: true, message: "Successfully imported 3 contacts", summary: { total: 3, successful: 3, failed: 0 } }
```

## 🤝 Contributing

When contributing to the contact management system:

1. Follow the existing code style and patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Ensure backward compatibility
5. Test with various data scenarios

## 📄 License

This contact management system is part of the Mayday Call Center project and follows the same licensing terms.
