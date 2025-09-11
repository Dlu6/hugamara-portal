/**
 * Employee ID Generator Utility
 * Generates unique, consistent employee IDs
 */

/**
 * Generate a unique employee ID
 * Format: EMP + 6-digit timestamp + 3-character random string
 * @returns {string} Generated employee ID
 */
export const generateEmployeeId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `EMP${timestamp}${random}`;
};

/**
 * Validate employee ID format
 * @param {string} employeeId - Employee ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidEmployeeId = (employeeId) => {
  const pattern = /^EMP\d{6}[A-Z0-9]{3}$/;
  return pattern.test(employeeId);
};

/**
 * Extract timestamp from employee ID
 * @param {string} employeeId - Employee ID
 * @returns {number|null} Timestamp or null if invalid
 */
export const extractTimestampFromEmployeeId = (employeeId) => {
  if (!isValidEmployeeId(employeeId)) return null;
  const timestampStr = employeeId.substring(3, 9);
  return parseInt(timestampStr, 10);
};

/**
 * Get employee ID creation date
 * @param {string} employeeId - Employee ID
 * @returns {Date|null} Creation date or null if invalid
 */
export const getEmployeeIdCreationDate = (employeeId) => {
  const timestamp = extractTimestampFromEmployeeId(employeeId);
  if (!timestamp) return null;

  // Convert 6-digit timestamp to full timestamp
  const now = Date.now();
  const currentYear = new Date(now).getFullYear();
  const fullTimestamp = timestamp + (currentYear - 2000) * 1000000;

  return new Date(fullTimestamp);
};
