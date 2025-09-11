import { Inventory } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Generate a unique SKU for inventory items
 * Format: [CATEGORY_PREFIX]-[OUTLET_CODE]-[SEQUENCE_NUMBER]
 *
 * @param {string} category - Item category (food, beverage, etc.)
 * @param {string} outletCode - Outlet code (CS, VILLA, etc.)
 * @returns {Promise<string>} Generated SKU
 */
export const generateSKU = async (category, outletCode = "CS") => {
  try {
    // Category prefixes SKU
    const categoryPrefixes = {
      food: "FD",
      beverage: "BV",
      alcohol: "AL",
      cleaning: "CL",
      packaging: "PK",
      equipment: "EQ",
      other: "OT",
    };

    const prefix = categoryPrefixes[category] || "OT";
    const baseSKU = `${prefix}-${outletCode}`;

    // Find the highest sequence number for this SKU pattern
    const existingItems = await Inventory.findAll({
      where: {
        sku: {
          [Op.like]: `${baseSKU}-%`,
        },
      },
      attributes: ["sku"],
      order: [["sku", "DESC"]],
      limit: 1,
    });

    let sequenceNumber = 1;
    if (existingItems.length > 0) {
      const lastSKU = existingItems[0].sku;
      const lastSequence = parseInt(lastSKU.split("-").pop());
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }

    // Format sequence number with leading zeros (e.g., 001, 002, etc.)
    const formattedSequence = sequenceNumber.toString().padStart(3, "0");

    return `${baseSKU}-${formattedSequence}`;
  } catch (error) {
    console.error("Error generating SKU:", error);
    // Fallback to timestamp-based SKU
    const timestamp = Date.now().toString().slice(-6);
    return `SKU-${timestamp}`;
  }
};

/**
 * Validate SKU format
 * @param {string} sku - SKU to validate
 * @returns {boolean} True if valid format
 */
export const validateSKUFormat = (sku) => {
  const skuPattern = /^[A-Z]{2}-[A-Z0-9]+-\d{3}$/;
  return skuPattern.test(sku);
};

/**
 * Extract information from SKU
 * @param {string} sku - SKU to parse
 * @returns {object} Parsed SKU information
 */
export const parseSKU = (sku) => {
  const parts = sku.split("-");
  if (parts.length !== 3) {
    return null;
  }

  const [categoryPrefix, outletCode, sequence] = parts;

  // Reverse lookup category from prefix
  const categoryPrefixes = {
    FD: "food",
    BV: "beverage",
    AL: "alcohol",
    CL: "cleaning",
    PK: "packaging",
    EQ: "equipment",
    OT: "other",
  };

  return {
    categoryPrefix,
    category: categoryPrefixes[categoryPrefix] || "other",
    outletCode,
    sequence: parseInt(sequence),
  };
};
