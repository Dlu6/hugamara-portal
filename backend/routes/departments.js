import express from "express";
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats,
} from "../controllers/departmentController.js";
import {
  authenticateToken,
  requireRole,
  requirePermission,
} from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all departments
router.get("/", getAllDepartments);

// Get department statistics
router.get("/stats", getDepartmentStats);

// Get department by ID
router.get("/:id", getDepartmentById);

// Create new department (Admin only)
router.post("/", requireRole(["org_admin"]), createDepartment);

// Update department (Admin only)
router.put("/:id", requireRole(["org_admin"]), updateDepartment);

// Delete department (Admin only)
router.delete("/:id", requireRole(["org_admin"]), deleteDepartment);

export default router;
