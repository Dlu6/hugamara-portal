import sequelizePkg from "sequelize";
const { DataTypes } = sequelizePkg;
import sequelize from "../config/sequelize.js";

const Contact = sequelize.define(
  "contact",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // Basic Information
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 100],
      },
    },

    // Contact Information
    primaryPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isValidPhone(value) {
          if (value && value.trim() !== "") {
            // Allow various phone formats: +1234567890, 1234567890, 123-456-7890, etc.
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ""))) {
              throw new Error("Please enter a valid phone number");
            }
          }
        },
      },
    },
    secondaryPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && value.trim() !== "") {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ""))) {
              throw new Error("Please enter a valid phone number");
            }
          }
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidEmail(value) {
          if (value && value.trim() !== "") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              throw new Error("Please enter a valid email address");
            }
          }
        },
      },
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidUrl(value) {
          if (value && value.trim() !== "") {
            try {
              new URL(value);
            } catch (error) {
              throw new Error("Please enter a valid URL");
            }
          }
        },
      },
    },

    // Address Information
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 20],
      },
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
      get() {
        const rawValue = this.getDataValue("tags");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("tags", JSON.stringify(value || []));
      },
    },
    categories: {
      type: DataTypes.TEXT,
      defaultValue: "[]",
      get() {
        const rawValue = this.getDataValue("categories");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("categories", JSON.stringify(value || []));
      },
    },

    // Notes and Additional Info
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customFields: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() {
        const rawValue = this.getDataValue("customFields");
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue("customFields", JSON.stringify(value || {}));
      },
    },

    // Social Media
    socialMedia: {
      type: DataTypes.TEXT,
      defaultValue: "{}",
      get() {
        const rawValue = this.getDataValue("socialMedia");
        return rawValue ? JSON.parse(rawValue) : {};
      },
      set(value) {
        this.setDataValue("socialMedia", JSON.stringify(value || {}));
      },
    },

    // WhatsApp Integration
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && value.trim() !== "") {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ""))) {
              throw new Error("Please enter a valid WhatsApp number");
            }
          }
        },
      },
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
  },
  {
    tableName: "contacts",
    timestamps: true,
    indexes: [
      {
        fields: ["primaryPhone"],
        unique: true,
      },
      {
        fields: ["email"],
        where: {
          email: {
            [sequelizePkg.Op.ne]: null,
          },
        },
      },
      {
        fields: ["contactType"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["assignedAgentId"],
      },
      {
        fields: ["createdBy"],
      },
      {
        fields: ["lastInteraction"],
      },
    ],
  }
);

// Virtual field for full name
Contact.prototype.getFullName = function () {
  return `${this.firstName} ${this.lastName || ""}`.trim();
};

// Virtual field for display name
Contact.prototype.getDisplayName = function () {
  if (this.company) {
    return `${this.getFullName()} (${this.company})`;
  }
  return this.getFullName();
};

// Virtual field for avatar initials
Contact.prototype.getAvatarInitials = function () {
  const firstInitial = this.firstName
    ? this.firstName.charAt(0).toUpperCase()
    : "";
  const lastInitial = this.lastName
    ? this.lastName.charAt(0).toUpperCase()
    : "";
  return firstInitial + lastInitial;
};

export default Contact;
