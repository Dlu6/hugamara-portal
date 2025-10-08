import Contact from "../models/contactModel.js";
import sequelizePkg from "sequelize";
const { Op } = sequelizePkg;

// Get all contacts with filtering, sorting, and pagination
export const getContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      contactType = "",
      status = "all",
      priority = "",
      tags = "",
      assignedAgentId = "",
      sortBy = "lastInteraction",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};

    // Status filter
    if (status && status !== "all") {
      whereClause.status = status;
    }

    // Contact type filter
    if (contactType && contactType !== "all") {
      whereClause.contactType = contactType;
    }

    // Priority filter
    if (priority && priority !== "all") {
      whereClause.priority = priority;
    }

    // Assigned agent filter
    if (assignedAgentId && assignedAgentId !== "all") {
      whereClause.assignedAgentId = assignedAgentId;
    }

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { company: { [Op.iLike]: `%${search}%` } },
        { primaryPhone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { notes: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      whereClause.tags = {
        [Op.contains]: tagArray,
      };
    }

    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        exclude: ["customFields", "socialMedia"], // Exclude large JSON fields by default
      },
    });

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contacts",
    });
  }
};

// Get a single contact by ID
export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByPk(id, {
      attributes: {
        include: ["customFields", "socialMedia"], // Include all fields for detail view
      },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact",
    });
  }
};

// Create a new contact
export const createContact = async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      createdBy: req.user.id, // Assuming user ID is available in req.user
    };

    // Check for duplicate phone number
    const existingContact = await Contact.findOne({
      where: { primaryPhone: contactData.primaryPhone },
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        error: "A contact with this phone number already exists",
        data: { existingContactId: existingContact.id },
      });
    }

    // Sanitize data - convert empty strings to null for optional foreign keys
    const sanitizedData = {
      ...contactData,
      assignedAgentId:
        contactData.assignedAgentId && contactData.assignedAgentId.trim() !== ""
          ? contactData.assignedAgentId
          : null,
    };

    const contact = await Contact.create(sanitizedData);

    res.status(201).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error creating contact:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create contact",
    });
  }
};

// Update a contact
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    // Check for duplicate phone number (excluding current contact)
    if (
      updateData.primaryPhone &&
      updateData.primaryPhone !== contact.primaryPhone
    ) {
      const existingContact = await Contact.findOne({
        where: {
          primaryPhone: updateData.primaryPhone,
          id: { [Op.ne]: id },
        },
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          error: "A contact with this phone number already exists",
          data: { existingContactId: existingContact.id },
        });
      }
    }

    // Sanitize data - convert empty strings to null for optional foreign keys
    const sanitizedData = {
      ...updateData,
      assignedAgentId:
        updateData.assignedAgentId && updateData.assignedAgentId.trim() !== ""
          ? updateData.assignedAgentId
          : null,
    };

    await contact.update(sanitizedData);

    // Reload to get updated data
    await contact.reload();

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update contact",
    });
  }
};

// Delete a contact (soft delete)
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const contact = await Contact.findByPk(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    if (permanent === "true") {
      await contact.destroy();
    } else {
      await contact.update({ status: "deleted" });
    }

    res.json({
      success: true,
      message:
        permanent === "true"
          ? "Contact permanently deleted"
          : "Contact deleted",
    });
  } catch (error) {
    console.error("Error deleting contact:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete contact",
    });
  }
};

// Bulk operations
export const bulkUpdateContacts = async (req, res) => {
  try {
    const { contactIds, updateData } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact IDs are required",
      });
    }

    const [updatedCount] = await Contact.update(updateData, {
      where: { id: { [Op.in]: contactIds } },
    });

    res.json({
      success: true,
      message: `${updatedCount} contacts updated successfully`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error bulk updating contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk update contacts",
    });
  }
};

export const bulkDeleteContacts = async (req, res) => {
  try {
    const { contactIds, permanent = false } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Contact IDs are required",
      });
    }

    let deletedCount;
    if (permanent) {
      deletedCount = await Contact.destroy({
        where: { id: { [Op.in]: contactIds } },
      });
    } else {
      [deletedCount] = await Contact.update(
        { status: "deleted" },
        { where: { id: { [Op.in]: contactIds } } }
      );
    }

    res.json({
      success: true,
      message: `${deletedCount} contacts deleted successfully`,
      deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to bulk delete contacts",
    });
  }
};

// Get contact statistics
export const getContactStats = async (req, res) => {
  try {
    const stats = await Contact.findAll({
      attributes: [
        "contactType",
        "status",
        "priority",
        [sequelizePkg.fn("COUNT", sequelizePkg.col("id")), "count"],
      ],
      group: ["contactType", "status", "priority"],
      raw: true,
    });

    // Process stats into a more usable format
    const processedStats = {
      total: await Contact.count(),
      active: 0,
      customers: 0,
      leads: 0,
      byType: {},
      byStatus: {},
      byPriority: {},
    };

    stats.forEach((stat) => {
      const { contactType, status, priority, count } = stat;

      if (!processedStats.byType[contactType]) {
        processedStats.byType[contactType] = 0;
      }
      processedStats.byType[contactType] += parseInt(count);

      if (!processedStats.byStatus[status]) {
        processedStats.byStatus[status] = 0;
      }
      processedStats.byStatus[status] += parseInt(count);

      if (!processedStats.byPriority[priority]) {
        processedStats.byPriority[priority] = 0;
      }
      processedStats.byPriority[priority] += parseInt(count);

      // Map to frontend expected format
      if (contactType === "customer") {
        processedStats.customers += parseInt(count);
      } else if (contactType === "lead") {
        processedStats.leads += parseInt(count);
      }

      if (status === "active") {
        processedStats.active += parseInt(count);
      }
    });

    res.json({
      success: true,
      data: processedStats,
    });
  } catch (error) {
    console.error("Error fetching contact stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact statistics",
    });
  }
};

// Search contacts (for autocomplete, etc.)
export const searchContacts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const contacts = await Contact.findAll({
      where: {
        status: "active",
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${q}%` } },
          { lastName: { [Op.iLike]: `%${q}%` } },
          { company: { [Op.iLike]: `%${q}%` } },
          { primaryPhone: { [Op.iLike]: `%${q}%` } },
          { email: { [Op.iLike]: `%${q}%` } },
        ],
      },
      limit: parseInt(limit),
      attributes: [
        "id",
        "firstName",
        "lastName",
        "company",
        "primaryPhone",
        "email",
      ],
      order: [["lastInteraction", "DESC"]],
    });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error searching contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search contacts",
    });
  }
};

// Export contacts to CSV
export const exportContacts = async (req, res) => {
  try {
    const { format = "csv", contactType = "", status = "active" } = req.query;

    const whereClause = {};
    if (status && status !== "all") {
      whereClause.status = status;
    }
    if (contactType && contactType !== "all") {
      whereClause.contactType = contactType;
    }

    const contacts = await Contact.findAll({
      where: whereClause,
      order: [["lastInteraction", "DESC"]],
    });

    if (format === "csv") {
      const csvHeader = [
        "First Name",
        "Last Name",
        "Company",
        "Job Title",
        "Primary Phone",
        "Secondary Phone",
        "Email",
        "Website",
        "Address",
        "City",
        "State",
        "Country",
        "Postal Code",
        "Contact Type",
        "Priority",
        "Status",
        "Tags",
        "Notes",
        "Created At",
        "Last Contacted",
        "Last Interaction",
      ].join(",");

      const csvRows = contacts.map((contact) =>
        [
          contact.firstName || "",
          contact.lastName || "",
          contact.company || "",
          contact.jobTitle || "",
          contact.primaryPhone || "",
          contact.secondaryPhone || "",
          contact.email || "",
          contact.website || "",
          contact.address || "",
          contact.city || "",
          contact.state || "",
          contact.country || "",
          contact.postalCode || "",
          contact.contactType || "",
          contact.priority || "",
          contact.status || "",
          (contact.tags || []).join(";"),
          (contact.notes || "").replace(/,/g, ";"),
          contact.createdAt || "",
          contact.lastContacted || "",
          contact.lastInteraction || "",
        ]
          .map((field) => `"${field}"`)
          .join(",")
      );

      const csvContent = [csvHeader, ...csvRows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=contacts.csv");
      res.send(csvContent);
    } else {
      res.json({
        success: true,
        data: contacts,
      });
    }
  } catch (error) {
    console.error("Error exporting contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export contacts",
    });
  }
};

// Import contacts from CSV
export const importContacts = async (req, res) => {
  try {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const csv = (await import("csv-parser")).default;
    const fs = await import("fs");
    const path = await import("path");

    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Parse CSV file
    const filePath = req.file.path;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (data) => {
          rowNumber++;

          // Skip empty rows (all fields are empty or whitespace)
          const hasAnyData = Object.values(data).some(
            (value) => value && value.toString().trim() !== ""
          );

          if (!hasAnyData) {
            console.log(`Skipping empty row ${rowNumber}`);
            return;
          }

          // Validate required fields
          if (!data.firstName || !data.primaryPhone) {
            errors.push({
              row: rowNumber,
              message: `Row ${rowNumber}: firstName and primaryPhone are required`,
            });
            return;
          }

          // Clean and validate data
          let contactType = data.type?.trim() || "customer";

          // Validate and map contactType to valid ENUM values
          const validContactTypes = [
            "customer",
            "prospect",
            "supplier",
            "partner",
            "internal",
            "other",
          ];
          if (!validContactTypes.includes(contactType)) {
            // Map common invalid values to valid ones
            const typeMapping = {
              lead: "prospect",
              client: "customer",
              vendor: "supplier",
              associate: "partner",
              staff: "internal",
            };
            contactType = typeMapping[contactType.toLowerCase()] || "other";
          }

          const contactData = {
            firstName: data.firstName?.trim(),
            lastName: data.lastName?.trim() || null,
            primaryPhone: data.primaryPhone?.trim(),
            secondaryPhone: data.secondaryPhone?.trim() || null,
            whatsappNumber: data.whatsappNumber?.trim() || null,
            email: data.email?.trim() || null,
            company: data.company?.trim() || null,
            jobTitle: data.jobTitle?.trim() || null,
            contactType: contactType,
            notes: data.notes?.trim() || null,
            status: "active",
            createdBy: req.user?.id || null,
          };

          // Validate email format if provided
          if (
            contactData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)
          ) {
            errors.push({
              row: rowNumber,
              message: `Row ${rowNumber}: Invalid email format`,
            });
            return;
          }

          // Validate phone format if provided
          const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
          if (!phoneRegex.test(contactData.primaryPhone)) {
            errors.push({
              row: rowNumber,
              message: `Row ${rowNumber}: Invalid primary phone format`,
            });
            return;
          }

          results.push(contactData);
        })
        .on("end", async () => {
          try {
            // Clean up uploaded file
            fs.unlinkSync(filePath);

            if (errors.length > 0) {
              return res.json({
                success: false,
                message: `Import completed with ${errors.length} errors`,
                errors: errors,
                summary: {
                  total: rowNumber,
                  successful: results.length,
                  failed: errors.length,
                },
              });
            }

            // Bulk insert contacts
            const createdContacts = await Contact.bulkCreate(results, {
              validate: true,
              returning: true,
            });

            res.json({
              success: true,
              message: `Successfully imported ${createdContacts.length} contacts`,
              summary: {
                total: rowNumber,
                successful: createdContacts.length,
                failed: 0,
              },
              data: createdContacts,
            });
          } catch (dbError) {
            console.error("Database error during import:", dbError);
            res.status(500).json({
              success: false,
              message: "Database error during import",
              error: dbError.message,
            });
          }
        })
        .on("error", (error) => {
          console.error("CSV parsing error:", error);
          res.status(500).json({
            success: false,
            message: "Error parsing CSV file",
            error: error.message,
          });
        });
    });
  } catch (error) {
    console.error("Error importing contacts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to import contacts",
      error: error.message,
    });
  }
};
