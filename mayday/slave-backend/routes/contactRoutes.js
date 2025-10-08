import express from "express";
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  bulkUpdateContacts,
  bulkDeleteContacts,
  getContactStats,
  searchContacts,
  exportContacts,
  importContacts,
} from "../controllers/contactController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { contactUpload, debugMulter } from "../services/fileService.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Contact CRUD operations
router.get("/", getContacts);
router.get("/stats", getContactStats);
router.get("/search", searchContacts);
router.get("/export", exportContacts);
router.get("/:id", getContactById);
router.post("/", createContact);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

// Bulk operations
router.post("/bulk/update", bulkUpdateContacts);
router.post("/bulk/delete", bulkDeleteContacts);

// Import/Export
router.post(
  "/import",
  debugMulter,
  contactUpload.single("file"),
  importContacts
);

export default router;
