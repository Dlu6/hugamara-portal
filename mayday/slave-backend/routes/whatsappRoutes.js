import express from "express";
import {
  addContact,
  getContacts,
  getMedia,
  getMessages,
  getMessageStatus,
  handleWebhook,
  testWebhook,
  // sendMessage,
  updateContact,
  uploadMedia,
  getWhatsAppConfig,
  updateWhatsAppConfig,
  getChats,
  getChatMessages,
  sendChatMessage,
  updateMessageStatus,
  getWhatsAppTemplates,
  getTemplateById,
  createTemplate,
  deleteTemplate,
  markChatAsRead,
  createOrLinkWhatsAppContact,
} from "../controllers/whatsappController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { Conversation } from "../models/WhatsAppModel.js";

const router = express.Router();

// Configuration endpoints
router.get("/integrations/whatsapp/config", getWhatsAppConfig);
router.post("/integrations/whatsappConfig", updateWhatsAppConfig);

// Message endpoints
// router.post("/send", authMiddleware, sendMessage);
router.get("/messages/:contactId", getMessages);
router.get("/status/:messageId", getMessageStatus);

// Contact management
router.get("/contacts", getContacts);
router.post("/contacts", authMiddleware, addContact);
router.put("/contacts/:contactId", authMiddleware, updateContact);
router.post("/contacts/link", authMiddleware, createOrLinkWhatsAppContact);

// Media handling
router.post("/media", authMiddleware, uploadMedia);
router.get("/media/:mediaId", authMiddleware, getMedia);

// Chat management
router.get("/chats", getChats);
router.get("/chats/:contactId/messages", getChatMessages);
router.post("/chats/:contactId/messages", sendChatMessage);
router.put("/messages/:messageId/status", updateMessageStatus);
router.post("/chats/:contactId/read", markChatAsRead);

// Templates
router.get("/templates", getWhatsAppTemplates);
router.get("/templates/:templateId", getTemplateById);
router.post("/templates", createTemplate);
router.delete("/templates/:templateId", deleteTemplate);

// Webhook routes
router.post("/webhook", handleWebhook);
router.get("/webhook/test", testWebhook); // Test endpoint
// router.post("/status-callback", handleWebhook);
router.post("/webhook/statusCallback", handleWebhook);

// Simple conversation management routes (MVP)
router.get("/conversations", async (req, res) => {
  try {
    const convs = await Conversation.findAll({
      order: [["updatedAt", "DESC"]],
    });
    res.json({ success: true, data: convs });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/conversations/:id/claim", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await Conversation.findByPk(id);
    if (!conv)
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    await conv.update({ assignedAgentId: req.user.id });
    res.json({ success: true, data: conv });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/conversations/:id/transfer", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { agentId } = req.body;
    const conv = await Conversation.findByPk(id);
    if (!conv)
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    await conv.update({ assignedAgentId: agentId });
    res.json({ success: true, data: conv });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post("/conversations/:id/resolve", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const conv = await Conversation.findByPk(id);
    if (!conv)
      return res
        .status(404)
        .json({ success: false, error: "Conversation not found" });
    await conv.update({ status: "resolved" });
    res.json({ success: true, data: conv });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

export default router;
