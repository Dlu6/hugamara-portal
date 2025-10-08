import sequelizePkg from "sequelize";
const { DataTypes } = sequelizePkg;
import sequelize from "../config/sequelize.js";

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable("contacts", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Basic Information
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Contact Information
    primaryPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    secondaryPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Address Information
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Contact Center Specific
    contactType: {
      type: DataTypes.ENUM(
        "customer",
        "prospect",
        "supplier",
        "partner",
        "internal",
        "other"
      ),
      defaultValue: "customer",
    },
    source: {
      type: DataTypes.ENUM(
        "manual",
        "import",
        "website",
        "referral",
        "campaign",
        "other"
      ),
      defaultValue: "manual",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive", "blocked", "deleted"),
      defaultValue: "active",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "vip"),
      defaultValue: "medium",
    },

    // Communication Preferences
    preferredContactMethod: {
      type: DataTypes.ENUM("phone", "email", "whatsapp", "sms"),
      defaultValue: "phone",
    },
    preferredLanguage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "en",
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "UTC",
    },

    // Tags and Categories
    tags: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
    },
    categories: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
    },

    // Notes and Additional Info
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customFields: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
    },

    // Social Media
    socialMedia: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
    },

    // WhatsApp Integration
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    whatsappOptIn: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Assignment and Ownership
    assignedAgentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },

    // Timestamps
    lastContacted: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastInteraction: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextFollowUp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Add indexes (with error handling for existing indexes)
  try {
    await queryInterface.addIndex("contacts", ["primaryPhone"], {
      unique: true,
      name: "contacts_primary_phone_unique",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_primary_phone_unique already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["email"], {
      name: "contacts_email_index",
      where: {
        email: {
          [Sequelize.Op.ne]: null,
        },
      },
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_email_index already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["contactType"], {
      name: "contacts_type_index",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_type_index already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["status"], {
      name: "contacts_status_index",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_status_index already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["assignedAgentId"], {
      name: "contacts_assigned_agent_index",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_assigned_agent_index already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["createdBy"], {
      name: "contacts_created_by_index",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_created_by_index already exists, skipping...");
    } else {
      throw error;
    }
  }

  try {
    await queryInterface.addIndex("contacts", ["lastInteraction"], {
      name: "contacts_last_interaction_index",
    });
  } catch (error) {
    if (error.original?.code === "ER_DUP_KEYNAME") {
      console.log("Index contacts_last_interaction_index already exists, skipping...");
    } else {
      throw error;
    }
  }
};

export const down = async (queryInterface, Sequelize) => {
  await queryInterface.dropTable("contacts");
};
