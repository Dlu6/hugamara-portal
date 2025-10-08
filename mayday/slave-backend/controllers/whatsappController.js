import { Op } from "../config/sequelize.js";
import {
  Contact,
  WhatsAppMessage,
  WhatsAppConfig,
  Conversation,
} from "../models/WhatsAppModel.js";
import {
  socketService,
  emitWhatsAppMessage,
  emitWhatsAppStatusUpdate,
  emitGenericNotification,
} from "../services/socketService.js";
import twilioService from "../services/twilioService.js";
import pkg from "twilio";
const { Twilio } = pkg;

// Get configuration from environment variables
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber =
  process.env.TWILIO_WHATSAPP_NUMBER || "+12566809340";

console.log("Twilio Account SID:", twilioAccountSid ? "Set" : "Missing");
console.log("Twilio Auth Token:", twilioAuthToken ? "Set" : "Missing");
console.log("Twilio WhatsApp Number:", twilioWhatsAppNumber);
console.log(
  "DEBUG - twilioWhatsAppNumber value:",
  JSON.stringify(twilioWhatsAppNumber)
);
console.log("DEBUG - twilioWhatsAppNumber type:", typeof twilioWhatsAppNumber);
const lipaChatApiKey = process.env.LIPACHAT_API_KEY;
console.log("lipaChatApiKey>>>>>", lipaChatApiKey);
const lipaChatPhoneNumber = process.env.LIPACHAT_PHONE_NUMBER;
console.log(
  `CONTROLLER TOP LEVEL: lipaChatPhoneNumber from env is: ${lipaChatPhoneNumber}`
);

if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
  console.error(
    "Missing required Twilio configuration in environment variables"
  );
}

// const client = new Twilio(twilioAccountSid, twilioAuthToken); // Removed Twilio client initialization

// export const sendMessage = async (req, res) => { ... }; // Entire sendMessage function removed as it was Twilio specific

// Test endpoint to verify webhook is accessible
export const testWebhook = async (req, res) => {
  console.log("--- WEBHOOK TEST ENDPOINT HIT ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Query:", JSON.stringify(req.query, null, 2));

  res.json({
    success: true,
    message: "Webhook test endpoint is working",
    timestamp: new Date().toISOString(),
    receivedData: {
      headers: req.headers,
      body: req.body,
      query: req.query,
    },
  });
};

export const handleWebhook = async (req, res) => {
  // Temporarily disable webhook signature verification for testing
  // if (!twilioService.verifyWebhookSignature(req)) {
  //   return res.status(401).json({ success: false, error: "Invalid signature" });
  // }
  console.log("--- TWILIO WEBHOOK RECEIVED ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  console.log("Webhook URL:", req.originalUrl);
  console.log("Method:", req.method);

  const payload = req.body;

  try {
    // Handle Twilio message status updates
    if (payload.MessageStatus) {
      const { MessageSid, MessageStatus, To, From } = payload;

      console.log("Twilio message status update:", {
        MessageSid,
        MessageStatus,
        To,
        From,
      });

      if (!MessageSid || !MessageStatus) {
        console.warn(
          "Skipping Twilio status update due to missing MessageSid or MessageStatus"
        );
        return res.status(200).json({ success: true });
      }

      const existingMessage = await WhatsAppMessage.findOne({
        where: { messageId: MessageSid }, // Twilio uses MessageSid as messageId
        include: [
          {
            model: Contact,
            as: "whatsapp_contact",
            attributes: ["phoneNumber", "id"],
          },
        ],
      });

      if (existingMessage && existingMessage.whatsapp_contact) {
        await existingMessage.update({
          status: MessageStatus.toLowerCase(),
          errorMessage:
            MessageStatus === "failed" ? "Message delivery failed" : null,
        });

        console.log(
          "Emitting whatsapp:status_update for Twilio messageId:",
          MessageSid,
          "status:",
          MessageStatus
        );
        emitWhatsAppStatusUpdate({
          messageId: existingMessage.messageId,
          dbMessageId: existingMessage.id,
          status: existingMessage.status,
          timestamp: existingMessage.timestamp,
          contactPhoneNumber: existingMessage.whatsapp_contact.phoneNumber,
          contactId: existingMessage.whatsapp_contact.id,
          errorMessage: existingMessage.errorMessage,
        });
      } else {
        console.warn(
          `Received Twilio status update for unknown messageId: ${MessageSid} or message has no associated contact.`
        );
      }
    }
    // Handle Twilio incoming messages
    else if (payload.Body && payload.From && payload.To) {
      const { Body, From, To, MessageSid, NumMedia, MediaUrl0 } = payload;

      console.log("Twilio incoming message:", {
        Body,
        From,
        To,
        MessageSid,
        NumMedia,
      });

      // Extract phone number from WhatsApp format (whatsapp:+1234567890)
      const fromNumber = From.replace("whatsapp:", "");
      const toNumber = To.replace("whatsapp:", "");

      // Find or create contact
      const [contact, created] = await Contact.findOrCreate({
        where: { phoneNumber: fromNumber },
        defaults: {
          name: fromNumber,
          lastInteraction: new Date(),
          lastMessage: Body,
          isOnline: true,
          unreadCount: 1,
        },
      });

      if (!created) {
        await contact.increment("unreadCount");
        await contact.update({
          lastInteraction: new Date(),
          lastMessage: Body,
          lastMessageSender: "contact",
          lastMessageId: MessageSid,
        });
      }

      // Find/create conversation
      let conversation = await Conversation.findOne({
        where: { contactId: contact.id, status: "open" },
        order: [["updatedAt", "DESC"]],
      });

      if (!conversation) {
        conversation = await Conversation.create({
          contactId: contact.id,
          provider: "twilio",
          status: "open",
          unreadCount: 1,
          lastMessageAt: new Date(),
        });
      } else {
        await conversation.update({
          unreadCount: conversation.unreadCount + 1,
          lastMessageAt: new Date(),
        });
      }

      // Create message record
      let metadata = null;
      if (NumMedia && parseInt(NumMedia) > 0) {
        metadata = JSON.stringify({
          mediaUrl: MediaUrl0,
          numMedia: parseInt(NumMedia),
        });
      }

      const incomingMessage = await WhatsAppMessage.create({
        messageId: MessageSid,
        from: fromNumber,
        to: toNumber,
        text: Body,
        mediaUrl: MediaUrl0,
        status: "received",
        contactId: contact.id,
        sender: fromNumber,
        type: NumMedia && parseInt(NumMedia) > 0 ? "media" : "text",
        timestamp: new Date(),
        conversationId: conversation.id,
        metadata: metadata,
      });

      console.log(
        "Emitting whatsapp:message for contact:",
        contact.phoneNumber,
        "Our DB msg ID:",
        incomingMessage.id,
        "Twilio Msg ID:",
        MessageSid
      );

      emitWhatsAppMessage({
        message: {
          id: incomingMessage.id,
          messageId: incomingMessage.messageId,
          text: incomingMessage.text,
          mediaUrl: incomingMessage.mediaUrl,
          timestamp: incomingMessage.timestamp,
          sender: "contact",
          status: incomingMessage.status,
          type: incomingMessage.type,
        },
        contact: {
          id: contact.id,
          phoneNumber: contact.phoneNumber,
          name: contact.name,
          avatar:
            contact.avatar ||
            contact.name?.substring(0, 2).toUpperCase() ||
            fromNumber.substring(fromNumber.length - 2),
          lastMessage: contact.lastMessage,
          unreadCount: conversation.unreadCount,
          isOnline: contact.isOnline,
          lastMessageSender: contact.lastMessageSender,
          lastMessageId: contact.lastMessageId,
          conversationId: conversation.id,
        },
      });
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Error processing Twilio webhook:", error);
    res
      .status(500)
      .json({ success: false, error: error.message, details: error.stack });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    const messages = await WhatsAppMessage.findAll({
      where: {
        [Op.or]: [{ from: contactId }, { to: contactId }],
      },
      order: [["timestamp", "DESC"]],
      limit: 100,
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
};

export const getMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await WhatsAppMessage.findOne({
      where: { messageId },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    res.json({
      success: true,
      data: {
        messageId: message.messageId,
        status: message.status,
      },
    });
  } catch (error) {
    console.error("Error fetching message status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch message status",
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      include: [
        {
          model: WhatsAppMessage,
          as: "messageHistory",
          limit: 1,
          order: [["createdAt", "DESC"]],
          attributes: [
            "id",
            "messageId",
            "text",
            "status",
            "errorCode",
            "errorMessage",
            "createdAt",
          ],
        },
      ],
      order: [["lastInteraction", "DESC"]],
      attributes: [
        "id",
        "phoneNumber",
        "lastInteraction",
        "lastMessage",
        "unreadCount",
      ],
    });

    res.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contacts",
    });
  }
};

export const addContact = async (req, res) => {
  try {
    const { phoneNumber, name } = req.body;
    const contact = await Contact.create({
      phoneNumber,
      name,
      lastInteraction: new Date(),
    });

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error("Error adding contact:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add contact",
    });
  }
};

export const updateContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const updates = req.body;

    const [updated] = await Contact.update(updates, {
      where: { phoneNumber: contactId },
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    const updatedContact = await Contact.findOne({
      where: { phoneNumber: contactId },
    });

    res.json({
      success: true,
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update contact",
    });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    const { file } = req;
    if (!file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // TODO: Implement media upload to a storage service (e.g., S3, Cloudinary)
    // For now, returning a placeholder or saving locally if desired.
    // This example does not use Lipachat's media upload directly in this endpoint.
    // Lipachat expects a publicly accessible URL when sending media messages.

    console.warn(
      "uploadMedia: Media upload to external service not yet implemented. File details:",
      file.originalname
    );
    // Placeholder response
    res.json({
      success: true,
      data: {
        // mediaId: "placeholder-media-id", // Replace with actual ID from storage
        mediaUrl: `https://your-media-storage.example.com/${file.originalname}`, // Replace with actual URL
        message:
          "Media upload endpoint called. Implement actual storage logic.",
      },
    });
  } catch (error) {
    console.error("Error uploading media:", error);
    res.status(500).json({
      success: false,
      error: "Failed to upload media",
    });
  }
};

export const getMedia = async (req, res) => {
  try {
    const { mediaId } = req.params; // This mediaId would be our internal ID or one from a storage service

    // TODO: Implement fetching media metadata from your storage
    // This endpoint is not for fetching from Lipachat directly as they provide direct URLs in webhooks.

    console.warn(
      `getMedia: Fetching media for ID ${mediaId} not yet fully implemented.`
    );
    // Placeholder response
    res.json({
      success: true,
      data: {
        mediaId: mediaId,
        mediaUrl: `https://your-media-storage.example.com/path/to/${mediaId}`, // Replace with actual URL
        contentType: "image/jpeg", // Example
        size: 12345, // Example
        message:
          "Media fetch endpoint called. Implement actual storage retrieval.",
      },
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch media",
    });
  }
};

export const getWhatsAppConfig = async (req, res) => {
  try {
    // Prefer DB-configured values; fall back to env
    const cfg = await WhatsAppConfig.findOne();
    const phone = cfg?.phoneNumber || twilioWhatsAppNumber || null;
    if (!phone) {
      return res.status(200).json({
        success: true,
        data: {
          enabled: cfg?.enabled || false,
          phoneNumber: "",
          webhookUrl: cfg?.webhookUrl || "",
          accountSid: cfg?.accountSid || "",
          authToken: cfg?.authToken ? "***" : "",
          credentialsProvided: Boolean(cfg?.accountSid && cfg?.authToken),
        },
        warning: "WhatsApp number not configured yet.",
      });
    }

    res.json({
      success: true,
      data: {
        enabled: cfg?.enabled ?? Boolean(process.env.TWILIO_ACCOUNT_SID),
        phoneNumber: phone,
        webhookUrl: cfg?.webhookUrl || "",
        accountSid: cfg?.accountSid || process.env.TWILIO_ACCOUNT_SID || "",
        authToken: cfg?.authToken
          ? "***"
          : process.env.TWILIO_AUTH_TOKEN
          ? "***"
          : "",
        credentialsProvided: Boolean(
          (cfg?.accountSid && cfg?.authToken) ||
            (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
        ),
      },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp agent config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch WhatsApp agent configuration",
    });
  }
};

export const updateWhatsAppConfig = async (req, res) => {
  try {
    const { enabled, accountSid, authToken, phoneNumber, webhookUrl } =
      req.body;

    let config = await WhatsAppConfig.findOne();

    if (!config) {
      config = await WhatsAppConfig.create({
        enabled,
        accountSid: accountSid || null,
        authToken: authToken || null,
        phoneNumber: phoneNumber || null,
        webhookUrl: webhookUrl || null,
      });
    } else {
      await config.update({
        enabled,
        accountSid: accountSid || config.accountSid,
        authToken: authToken || config.authToken,
        phoneNumber: phoneNumber || config.phoneNumber,
        webhookUrl: webhookUrl || config.webhookUrl,
      });
    }

    // Test Twilio connection if credentials are provided
    if (accountSid && authToken) {
      try {
        const testClient = new Twilio(accountSid, authToken);
        // Simple test to verify credentials
        await testClient.api.accounts(accountSid).fetch();
        console.log("✅ Twilio credentials verified successfully");
      } catch (twilioError) {
        console.warn(
          "⚠️ Twilio credentials verification failed:",
          twilioError.message
        );
        return res.status(400).json({
          success: false,
          error:
            "Invalid Twilio credentials. Please check your Account SID and Auth Token.",
        });
      }
    }

    res.json({
      success: true,
      data: {
        enabled: config.enabled,
        phoneNumber: config.phoneNumber || "",
        webhookUrl: config.webhookUrl || "",
        accountSid: config.accountSid || "",
        authToken: config.authToken ? "***" : "",
        credentialsProvided: Boolean(config.accountSid && config.authToken),
      },
    });
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update WhatsApp configuration",
    });
  }
};

export const getChats = async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      attributes: [
        "id",
        "name",
        "phoneNumber",
        "lastMessage",
        "lastInteraction",
        "unreadCount",
        "status",
        "isOnline",
        "isBlocked",
        "isGroup",
        "lastMessageSender",
        "lastMessageId",
      ],
      include: [
        {
          model: WhatsAppMessage,
          as: "messageHistory",
          limit: 1,
          order: [["createdAt", "DESC"]],
          attributes: ["text", "timestamp", "status", "sender"],
        },
      ],
      order: [["lastInteraction", "DESC"]],
    });

    // console.log("Fetched contacts:", JSON.stringify(contacts, null, 2));

    const formattedChats = contacts.map((contact) => {
      const contactData = contact.get({ plain: true });
      // console.log("Processing contact:", contactData);

      // Determine the status to show based on lastMessageSender
      let displayStatus = contactData.status || "offline";
      if (
        contactData.lastMessageSender === "user" &&
        contactData.messageHistory?.[0]
      ) {
        // If last message was sent by user, use the message status
        displayStatus = contactData.messageHistory[0].status || displayStatus;
      }

      return {
        id: contactData.id,
        name: contactData.name || contactData.phoneNumber,
        phoneNumber: contactData.phoneNumber,
        avatar: contactData.name
          ? contactData.name.substring(0, 2).toUpperCase()
          : contactData.phoneNumber.substring(0, 2).toUpperCase(),
        lastMessage:
          contactData.messageHistory?.[0]?.text ||
          contactData.lastMessage ||
          "",
        timestamp:
          contactData.messageHistory?.[0]?.timestamp ||
          contactData.lastInteraction,
        unread: contactData.unreadCount || 0,
        status: displayStatus,
        isOnline: contactData.isOnline || false,
        isBlocked: contactData.isBlocked || false,
        isGroup: contactData.isGroup || false,
        lastMessageSender: contactData.lastMessageSender,
        lastMessageId: contactData.lastMessageId,
      };
    });

    // console.log("Formatted chats:", JSON.stringify(formattedChats, null, 2));

    res.json({
      success: true,
      data: formattedChats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch chats",
    });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findOne({
      attributes: ["id", "phoneNumber", "name"],
      where: { phoneNumber: contactId },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    const messages = await WhatsAppMessage.findAll({
      where: {
        contactId: contact.id,
      },
      order: [["timestamp", "ASC"]],
    });

    // Ensure we have a valid Twilio number
    const twilioNumber =
      twilioWhatsAppNumber ||
      process.env.TWILIO_WHATSAPP_NUMBER ||
      "+12566809340";

    // Debug logging
    console.log("DEBUG getChatMessages:");
    console.log("twilioWhatsAppNumber:", twilioWhatsAppNumber);
    console.log("typeof twilioWhatsAppNumber:", typeof twilioWhatsAppNumber);
    console.log("twilioNumber (fallback):", twilioNumber);
    console.log("messages count:", messages.length);
    if (messages.length > 0) {
      console.log("first message.from:", messages[0].from);
      console.log("first message.to:", messages[0].to);
    }

    const formattedMessages = messages.map((message) => {
      // Use the twilioNumber we defined above
      const normalizedTwilioNumber = twilioNumber.startsWith("+")
        ? twilioNumber
        : `+${twilioNumber}`;

      const sender =
        message.from === normalizedTwilioNumber
          ? "user" // Our application sent this message
          : "contact"; // The external contact sent this message

      // Debug logging for each message
      console.log("Processing message:", {
        id: message.id,
        from: message.from,
        to: message.to,
        sender: sender,
        status: message.status,
        text: message.text?.substring(0, 20) + "...",
        normalizedTwilioNumber: normalizedTwilioNumber,
        isFromTwilio: message.from === normalizedTwilioNumber,
      });

      return {
        id: message.id,
        messageId: message.messageId, // Include original messageId
        text: message.text,
        mediaUrl: message.mediaUrl, // Include mediaUrl
        timestamp: message.timestamp,
        // Determine sender based on whether the message.from matches our Twilio number
        sender: sender,
        status: message.status || "sent", // Default to "sent" if no status
        type: message.type, // Include message type
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
      };
    });

    res.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat messages",
    });
  }
};

export const sendChatMessage = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { text, mediaUrl, template } = req.body;

    console.log("SENDCHATMESSAGE: Twilio WhatsApp integration");
    console.log("SENDCHATMESSAGE: Contact ID:", contactId);
    console.log("SENDCHATMESSAGE: Message content:", {
      text,
      mediaUrl,
      template,
    });

    const contact = await Contact.findOne({
      where: { phoneNumber: contactId },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error(
        "SENDCHATMESSAGE ERROR: Twilio credentials not configured properly."
      );
      return res.status(400).json({
        success: false,
        error: "Twilio credentials not configured on the server.",
      });
    }

    // Ensure 'to' number is correctly formatted (E.164 with +)
    const toNumberForApi = contact.phoneNumber.startsWith("+")
      ? contact.phoneNumber
      : `+${contact.phoneNumber}`;

    console.log(`SENDCHATMESSAGE: Using FROM number: ${twilioWhatsAppNumber}`);
    console.log(`SENDCHATMESSAGE: Using TO number: ${toNumberForApi}`);

    let twilioMessageId = null;
    let twilioMessageStatus = "failed";
    let finalMessageType = "text";

    try {
      if (template && template.name) {
        finalMessageType = "template";
        const response = await twilioService.sendTemplate({
          to: toNumberForApi,
          from: twilioWhatsAppNumber,
          templateName: template.name,
          languageCode: template.language || "en",
          parameters: template.parameters || [],
        });
        twilioMessageId = response.messageId;
        twilioMessageStatus = response.status || "sent";
      } else if (mediaUrl) {
        finalMessageType =
          mediaUrl.includes(".jpg") || mediaUrl.includes(".png")
            ? "image"
            : mediaUrl.includes(".mp4")
            ? "video"
            : "document";
        const response = await twilioService.sendMedia({
          to: toNumberForApi,
          from: twilioWhatsAppNumber,
          mediaUrl: mediaUrl,
          type: finalMessageType,
          caption: text,
        });
        twilioMessageId = response.messageId;
        twilioMessageStatus = response.status || "sent";
      } else if (text) {
        finalMessageType = "text";
        const response = await twilioService.sendText({
          to: toNumberForApi,
          from: twilioWhatsAppNumber,
          message: text,
        });
        twilioMessageId = response.messageId;
        twilioMessageStatus = response.status || "sent";
      } else {
        return res.status(400).json({
          success: false,
          error: "No message content (text, media, or template) provided.",
        });
      }
    } catch (apiError) {
      console.error("Error calling Twilio API:", apiError);
      twilioMessageId = `twilio-error-${Date.now()}`;
      twilioMessageStatus = "failed";
    }

    // Find or create conversation for outbound message
    let conversation = await Conversation.findOne({
      where: { contactId: contact.id, status: "open" },
      order: [["updatedAt", "DESC"]],
    });
    if (!conversation) {
      conversation = await Conversation.create({
        contactId: contact.id,
        provider: "twilio",
        status: "open",
        unreadCount: 0,
        lastMessageAt: new Date(),
      });
    } else {
      await conversation.update({ lastMessageAt: new Date() });
    }

    const messageToSave = {
      messageId: twilioMessageId || `unknown-${Date.now()}`,
      from: twilioWhatsAppNumber,
      to: toNumberForApi,
      text: text,
      mediaUrl: finalMessageType !== "text" ? mediaUrl : null,
      status: twilioMessageStatus,
      contactId: contact.id,
      sender: twilioWhatsAppNumber,
      template: template ? JSON.stringify(template) : null,
      type: finalMessageType,
      timestamp: new Date(),
      conversationId: conversation.id,
    };

    const message = await WhatsAppMessage.create(messageToSave);

    await contact.update({
      lastInteraction: new Date(),
      lastMessage: text || `Sent ${finalMessageType}`,
      lastMessageSender: "user",
      lastMessageId: twilioMessageId,
    });

    emitWhatsAppMessage({
      message: {
        id: message.id,
        messageId: message.messageId,
        text: message.text,
        mediaUrl: message.mediaUrl,
        timestamp: message.timestamp,
        sender: "user",
        status: message.status,
        type: message.type,
      },
      contact: {
        id: contact.id,
        phoneNumber: contact.phoneNumber,
        lastMessageSender: "user",
        lastMessageId: message.messageId,
        conversationId: conversation.id,
      },
    });

    return res.json({
      success: twilioMessageStatus !== "failed",
      messageId: twilioMessageId,
      data: message,
    });
  } catch (error) {
    console.error("Error in sendChatMessage main try block:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    const [updated] = await WhatsAppMessage.update(
      { status },
      { where: { messageId } }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    const updatedMessage = await WhatsAppMessage.findOne({
      where: { messageId },
      include: [
        {
          model: WhatsAppMessage,
          as: "replyMessage",
          attributes: ["id", "text", "sender", "timestamp"],
        },
      ],
    });

    res.json({
      success: true,
      data: {
        id: updatedMessage.id,
        messageId: updatedMessage.messageId,
        status: updatedMessage.status,
        timestamp: updatedMessage.timestamp,
        replyTo: updatedMessage.replyMessage || null,
      },
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update message status",
    });
  }
};

export const getWhatsAppTemplates = async (req, res) => {
  try {
    // This endpoint would now need to call Lipachat's API to list templates
    // if (!lipaChatApiKey) {
    //   return res.status(400).json({ success: false, error: "Lipachat API Key not configured." });
    // }
    // const lipaTemplatesResponse = await axios.get("LIPACHAT_LIST_TEMPLATES_API_ENDPOINT", {
    //   headers: { "api-key": lipaChatApiKey },
    // });
    // const formattedTemplates = lipaTemplatesResponse.data.map(t => ({...}));

    console.warn(
      "getWhatsAppTemplates: Lipachat integration not yet implemented. Returning empty array."
    );
    res.json({
      success: true,
      data: [], // Placeholder
    });
  } catch (error) {
    console.error("Error fetching WhatsApp templates:", error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch templates: ${error.message}`,
    });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    // This endpoint would now need to call Lipachat's API to get a specific template
    // const lipaTemplateResponse = await axios.get(`LIPACHAT_GET_TEMPLATE_API_ENDPOINT/${templateId}`, { ... });
    console.warn(
      `getTemplateById: Lipachat integration for template ${templateId} not yet implemented.`
    );
    res.status(404).json({
      success: false,
      error: "Not implemented for Lipachat yet",
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch template",
    });
  }
};

export const createTemplate = async (req, res) => {
  try {
    // This endpoint would now need to call Lipachat's API to create a template
    // const lipaCreateResponse = await axios.post("LIPACHAT_CREATE_TEMPLATE_API_ENDPOINT", req.body, { ... });
    console.warn("createTemplate: Lipachat integration not yet implemented.");
    res.status(404).json({
      success: false,
      error: "Not implemented for Lipachat yet",
    });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({
      success: false,
      error: `Failed to create template: ${error.message}`,
    });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    // This endpoint would now need to call Lipachat's API to delete a template
    // await axios.delete(`LIPACHAT_DELETE_TEMPLATE_API_ENDPOINT/${templateId}`, { ... });
    console.warn(
      `deleteTemplate: Lipachat integration for template ${templateId} not yet implemented.`
    );
    res.status(404).json({
      success: false,
      error: "Not implemented for Lipachat yet",
    });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({
      success: false,
      error: `Failed to delete template: ${error.message}`,
    });
  }
};

// This function might be redundant if all status updates are handled by the main webhook.
// Kept for now if there's a direct call path, but review its necessity.
export const handleMessageStatus = async (messageId, status) => {
  try {
    const message = await WhatsAppMessage.findOne({
      where: { messageId: messageId }, // Assuming messageId is the Lipachat message ID
      include: [{ model: Contact, attributes: ["phoneNumber", "id"] }],
    });

    if (message && message.whatsapp_contact) {
      // Lipachat statuses are typically uppercase: SENT, DELIVERED, READ, FAILED
      // We store them lowercase.
      const normalizedStatus = status.toLowerCase();

      await message.update({ status: normalizedStatus });

      emitWhatsAppStatusUpdate({
        messageId: message.messageId,
        dbMessageId: message.id,
        status: normalizedStatus,
        timestamp: new Date().toISOString(), // Or use timestamp from Lipachat if available in this context
        contactPhoneNumber: message.whatsapp_contact.phoneNumber,
        contactId: message.whatsapp_contact.id,
      });
    } else {
      console.warn(
        `handleMessageStatus: Message or associated contact not found for Lipachat messageId ${messageId}`
      );
    }
  } catch (error) {
    console.error("Error updating message status from direct call:", error);
  }
};

export const markChatAsRead = async (req, res) => {
  try {
    const { contactId } = req.params; // This will be the phone number
    const phoneNumber = contactId.startsWith("+") ? contactId : `+${contactId}`;

    const contact = await Contact.findOne({
      where: { phoneNumber: phoneNumber },
    });

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: "Contact not found" });
    }

    // Reset unread on the latest open conversation
    const conversation = await Conversation.findOne({
      where: { contactId: contact.id, status: "open" },
      order: [["updatedAt", "DESC"]],
    });
    if (conversation && conversation.unreadCount > 0) {
      await conversation.update({ unreadCount: 0 });

      // Emit an update to inform clients
      emitWhatsAppMessage({
        // Re-using emitWhatsAppMessage structure for simplicity
        // It will trigger 'whatsapp:chat_update' on the frontend
        message: {
          // Provide minimal message-like info if needed, or adapt frontend
          id: null, // No specific message, just chat update
          timestamp: conversation.lastMessageAt || new Date(),
        },
        contact: {
          id: contact.id,
          phoneNumber: contact.phoneNumber,
          name: contact.name,
          avatar:
            contact.avatar ||
            contact.name?.substring(0, 2).toUpperCase() ||
            phoneNumber.substring(phoneNumber.length - 2),
          lastMessage: contact.lastMessage,
          unreadCount: 0,
          isOnline: contact.isOnline,
          lastMessageSender: contact.lastMessageSender,
          lastMessageId: contact.lastMessageId,
          conversationId: conversation.id,
        },
      });
    }

    res.json({ success: true, data: { unreadCount: 0 } });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark chat as read" });
  }
};
