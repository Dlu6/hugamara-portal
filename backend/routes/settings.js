import express from "express";
import {
  getSystemSettings,
  updateSystemSettings,
  updateOutletInfo,
  getUserPreferences,
  updateUserPreferences,
  getRolesAndPermissions,
  updateRolePermissions,
  getSystemStats,
  backupSystemData,
  restoreSystemData,
} from "../controllers/settingsController.js";

const router = express.Router();

// System Settings Routes
router.get("/system", getSystemSettings);
router.put("/system", updateSystemSettings);

// Outlet Information Routes
router.put("/outlet", updateOutletInfo);

// User Preferences Routes
router.get("/preferences", getUserPreferences);
router.put("/preferences", updateUserPreferences);

// Roles and Permissions Routes
router.get("/roles-permissions", getRolesAndPermissions);
router.put("/roles/:roleId/permissions", updateRolePermissions);

// System Statistics Route
router.get("/stats", getSystemStats);

// Backup and Restore Routes
router.post("/backup", backupSystemData);
router.post("/restore", restoreSystemData);

export default router;
