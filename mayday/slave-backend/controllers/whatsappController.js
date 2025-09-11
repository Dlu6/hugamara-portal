import { Op } from "../config/sequelize.js";
import {
  Contact,
  WhatsAppMessage,
  WhatsAppConfig,
} from "../models/WhatsAppModel.js";
// import pkg from "twilio"; // Removed Twilio import
import { socketService } from "../services/socketService.js";
import axios from "axios"; // Added axios import
// const { Twilio } = pkg; // Removed Twilio import

// Get configuration from environment variables
// Removed Twilio config variables
const lipaChatApiKey = process.env.LIPACHAT_API_KEY;
console.log("lipaChatApiKey>>>>>", lipaChatApiKey);
const lipaChatPhoneNumber = process.env.LIPACHAT_PHONE_NUMBER;
console.log(
  `CONTROLLER TOP LEVEL: lipaChatPhoneNumber from env is: ${lipaChatPhoneNumber}`
);

if (!lipaChatApiKey || !lipaChatPhoneNumber) {
  console.error(
    "Missing required Lipachat configuration in environment variables"
  );
}

// const client = new Twilio(twilioAccountSid, twilioAuthToken); // Removed Twilio client initialization

// export const sendMessage = async (req, res) => { ... }; // Entire sendMessage function removed as it was Twilio specific

export const handleWebhook = async (req, res) => {
  console.log("--- LIPACHAT WEBHOOK RECEIVED ---");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  const payload = req.body;
  const eventsToProcess = Array.isArray(payload) ? payload : [payload];

  try {
    for (const event of eventsToProcess) {
      // Check if it's a Lipachat message status update
      if (event.event === "MESSAGE_STATUS" && event.messageStatus) {
        const { waId, messageId, conversationId, status, statusDesc } =
          event.messageStatus;

        if (!messageId || !status) {
          console.warn(
            "Skipping Lipachat MESSAGE_STATUS update due to missing messageId or status:",
            event.messageStatus
          );
          continue;
        }

        const existingMessage = await WhatsAppMessage.findOne({
          where: { messageId: messageId }, // Lipachat uses messageId for status updates
          include: [{ model: Contact, attributes: ["phoneNumber", "id"] }],
        });

        if (existingMessage && existingMessage.whatsapp_contact) {
          await existingMessage.update({
            status: status.toLowerCase(), // DELIVERED -> delivered
            // timestamp: new Date(), // Lipachat status doesn't provide a timestamp for the status event itself
            errorMessage: statusDesc || null, // Use statusDesc for potential error messages
          });

          console.log(
            "Emitting whatsapp:status_update for Lipachat messageId:",
            messageId,
            "status:",
            status
          );
          socketService.emitWhatsAppStatusUpdate({
            messageId: existingMessage.messageId,
            dbMessageId: existingMessage.id,
            status: existingMessage.status,
            timestamp: existingMessage.timestamp, // Keep original message timestamp or update if status provides one
            contactPhoneNumber: existingMessage.whatsapp_contact.phoneNumber,
            contactId: existingMessage.whatsapp_contact.id,
            errorMessage: existingMessage.errorMessage,
          });
        } else {
          console.warn(
            `Received Lipachat MESSAGE_STATUS update for unknown messageId: ${messageId} or message has no associated contact.`
          );
          if (existingMessage) {
            console.warn(
              `Message was found for messageId ${messageId}, but contact was missing. Message details (contactId should be populated):`,
              JSON.stringify(existingMessage.toJSON(), null, 2)
            );
          } else {
            console.warn(
              `Message was NOT found in the database for messageId: ${messageId}`
            );
          }
        }
      }
      // Check if it's a Lipachat template status update
      else if (event.event === "TEMPLATE_STATUS" && event.templateStatus) {
        const { status, templateId, templateName, statusDescription } =
          event.templateStatus;
        console.log(
          `Received Lipachat TEMPLATE_STATUS update: ID ${templateId}, Name: ${templateName}, Status: ${status}, Description: ${statusDescription}`
        );
        // Here you would typically update your local database record of the template status
        // For example:
        // await YourTemplateModel.update({ status, statusDescription }, { where: { templateId } });

        // And potentially emit a socket event if your UI needs to react to template status changes
        socketService.emitGenericNotification({
          type: "TEMPLATE_STATUS_UPDATE",
          data: {
            templateId,
            templateName,
            status,
            statusDescription,
          },
        });
      }
      // Existing logic for inbound messages
      else {
        let isMessageEvent = false;
        let messages = [];

        if (event.messages && Array.isArray(event.messages)) {
          messages = event.messages;
          isMessageEvent = true;
        } else if (
          event.messageId &&
          event.from &&
          event.to &&
          event.type &&
          [
            "TEXT",
            "IMAGE",
            "VIDEO",
            "AUDIO",
            "DOCUMENT",
            "STICKER",
            "LOCATION",
            "INTERACTIVE", // Added INTERACTIVE for buttons/lists
          ].includes(event.type.toUpperCase())
        ) {
          messages = [event];
          isMessageEvent = true;
        }

        if (isMessageEvent) {
          for (const msg of messages) {
            const fromNumberRaw = msg.from;
            const toNumberRaw = msg.to;
            const fromNumber =
              fromNumberRaw && !fromNumberRaw.startsWith("+")
                ? `+${fromNumberRaw}`
                : fromNumberRaw;
            const toNumber =
              toNumberRaw && !toNumberRaw.startsWith("+")
                ? `+${toNumberRaw}`
                : toNumberRaw;
            const lipaMessageId = msg.messageId; // Lipachat specific 'messageId'
            let textContent = msg.text; // For TEXT type

            // Handle interactive messages
            if (msg.type?.toUpperCase() === "INTERACTIVE") {
              if (msg.interactive?.type === "button_reply") {
                textContent = `Button: ${msg.interactive.button_reply.title} (ID: ${msg.interactive.button_reply.id})`;
              } else if (msg.interactive?.type === "list_reply") {
                textContent = `List Reply: ${msg.interactive.list_reply.title} (ID: ${msg.interactive.list_reply.id})`;
              }
            }

            let messageType = (msg.type || "text").toLowerCase();
            let mediaUrl = null;
            const profileName = msg.profileName;

            let eventTimestamp = new Date();
            if (msg.timestamp) {
              const ts = parseInt(msg.timestamp);
              if (!isNaN(ts)) {
                eventTimestamp =
                  ts > 9999999999 ? new Date(ts) : new Date(ts * 1000);
              }
            }

            // Lipachat uses direct 'url' for media, not 'link' based on sample payload
            if (
              msg.type?.toUpperCase() === "IMAGE" &&
              msg.image &&
              msg.image.url
            ) {
              messageType = "image";
              mediaUrl = msg.image.url;
              if (msg.image.caption) textContent = msg.image.caption;
            } else if (
              msg.type?.toUpperCase() === "VIDEO" &&
              msg.video &&
              msg.video.url
            ) {
              messageType = "video";
              mediaUrl = msg.video.url;
              if (msg.video.caption) textContent = msg.video.caption;
            } else if (
              msg.type?.toUpperCase() === "AUDIO" &&
              msg.audio &&
              msg.audio.url
            ) {
              messageType = "audio";
              mediaUrl = msg.audio.url;
              if (msg.audio.caption) textContent = msg.audio.caption;
            } else if (
              msg.type?.toUpperCase() === "DOCUMENT" &&
              msg.document &&
              msg.document.url
            ) {
              messageType = "document";
              mediaUrl = msg.document.url;
              if (msg.document.caption) textContent = msg.document.caption;
            } else if (
              msg.type?.toUpperCase() === "STICKER" &&
              msg.sticker &&
              msg.sticker.url
            ) {
              messageType = "sticker";
              mediaUrl = msg.sticker.url;
              if (msg.sticker.caption) textContent = msg.sticker.caption;
            }

            if (!fromNumber || !toNumber || !lipaMessageId) {
              console.warn(
                "Skipping message due to missing critical info (from, to, or messageId):",
                msg
              );
              continue;
            }

            let contact = null;
            let unreadCountForEmit = 0;

            const [foundContact, created] = await Contact.findOrCreate({
              where: { phoneNumber: fromNumber },
              defaults: {
                name: profileName || fromNumber,
                lastInteraction: eventTimestamp,
                lastMessage: textContent || `Media (${messageType})`,
                isOnline: true,
                unreadCount: 1,
              },
            });
            contact = foundContact;

            if (!created) {
              await contact.increment("unreadCount");
              await contact.update({
                name: profileName || contact.name,
                lastInteraction: eventTimestamp,
                lastMessage: textContent || `Media (${messageType})`,
                lastMessageSender: "contact",
                lastMessageId: lipaMessageId,
              });
              await contact.reload();
              unreadCountForEmit = contact.unreadCount;
            } else {
              unreadCountForEmit = contact.unreadCount;
            }

            const incomingMessage = await WhatsAppMessage.create({
              messageId: lipaMessageId,
              from: fromNumber,
              to: toNumber,
              text: textContent,
              mediaUrl: mediaUrl,
              status: "received",
              contactId: contact.id,
              sender: fromNumber,
              type: messageType,
              timestamp: eventTimestamp,
            });

            console.log(
              "Emitting whatsapp:message for contact:",
              contact.phoneNumber,
              "Our DB msg ID:",
              incomingMessage.id,
              "Lipa Msg ID:",
              lipaMessageId
            );
            socketService.emitWhatsAppMessage({
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
                unreadCount: unreadCountForEmit,
                isOnline: contact.isOnline,
                lastMessageSender: contact.lastMessageSender,
                lastMessageId: contact.lastMessageId,
              },
            });
          }
        } else {
          console.log(
            "Received unhandled Lipachat event structure or non-message/non-status event:",
            event
          );
        }
      }
    }

    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Error processing Lipachat webhook:", error);
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
    // This function primarily returns the configured LipaChat phone number for the agent.
    // It relies on the LIPACHAT_PHONE_NUMBER environment variable.
    if (!lipaChatPhoneNumber) {
      console.error(
        "Agent WhatsApp number (LIPACHAT_PHONE_NUMBER) is not configured in environment variables."
      );
      return res.status(500).json({
        success: false,
        error: "Agent WhatsApp number is not configured on the server.",
      });
    }

    res.json({
      success: true,
      data: {
        phoneNumber: lipaChatPhoneNumber,
        // We can add other relevant config details here if needed in the future
        // For now, only the phone number is requested for display.
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
    const {
      enabled,
      // accountSid, // Removed Twilio
      // authToken, // Removed Twilio
      apiKey, // Added for Lipachat
      phoneNumber,
      webhookUrl, // This should be your app's incoming webhook URL
      // contentSid, // Removed Twilio
    } = req.body;

    // TODO: Decide if you want to save Lipachat API key and number to DB via WhatsAppConfig model
    // For now, this function might not be directly applicable if config is mainly from .env
    // Or, adapt WhatsAppConfig to store lipaApiKey, lipaPhoneNumber

    let config = await WhatsAppConfig.findOne();

    if (!config) {
      config = await WhatsAppConfig.create({
        enabled,
        // accountSid,
        // authToken,
        // Adapt model if storing Lipachat API Key here
        // lipaApiKey: apiKey,
        phoneNumber, // This would be the Lipachat number being configured
        webhookUrl, // Your app's webhook for Lipachat
        // contentSid,
      });
    } else {
      await config.update({
        enabled,
        // accountSid,
        // authToken,
        // lipaApiKey: apiKey,
        phoneNumber,
        webhookUrl,
        // contentSid,
      });
    }

    // No Twilio client to test connection with.
    // If Lipachat has a "verify credentials" API endpoint, you could call it here.

    res.json({
      success: true,
      data: {
        enabled: config.enabled,
        // accountSid: config.accountSid, // Removed
        phoneNumber: config.phoneNumber, // Lipachat phone number
        webhookUrl: config.webhookUrl,
        // contentSid: config.contentSid, // Removed
        apiKeyProvided: !!apiKey, // Indicate if API key was part of the update
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

    const formattedMessages = messages.map((message) => ({
      id: message.id,
      messageId: message.messageId, // Include original messageId
      text: message.text,
      mediaUrl: message.mediaUrl, // Include mediaUrl
      timestamp: message.timestamp,
      // Determine sender based on whether the message.from matches our Lipachat number
      sender:
        message.from ===
        (lipaChatPhoneNumber.startsWith("+")
          ? lipaChatPhoneNumber
          : `+${lipaChatPhoneNumber}`)
          ? "user" // Our application sent this message
          : "contact", // The external contact sent this message
      status: message.status,
      type: message.type, // Include message type
      errorCode: message.errorCode,
      errorMessage: message.errorMessage,
    }));

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

    console.log(
      `SENDCHATMESSAGE: lipaChatPhoneNumber (module scope): ${lipaChatPhoneNumber}`
    );
    console.log(
      `SENDCHATMESSAGE: lipaChatApiKey (module scope): ${lipaChatApiKey}`
    );

    const contact = await Contact.findOne({
      where: { phoneNumber: contactId },
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact not found",
      });
    }

    if (!lipaChatApiKey || !lipaChatPhoneNumber) {
      console.error(
        "SENDCHATMESSAGE ERROR: Lipachat API Key or Phone Number not configured properly at the top of the controller."
      );
      return res.status(400).json({
        success: false,
        error: "Lipachat API Key or Phone Number not configured on the server.",
      });
    }

    // Try sending the fromNumber exactly as it is in the .env, as per the dashboard display
    const fromNumberForApi = lipaChatPhoneNumber;

    // Ensure 'to' number is correctly formatted (E.164 with +)
    const toNumberForApi = contact.phoneNumber.startsWith("+")
      ? contact.phoneNumber
      : `+${contact.phoneNumber}`;

    // Normalize the sender's number for consistent database storage (with +)
    const normalizedFromNumberForDb = lipaChatPhoneNumber.startsWith("+")
      ? lipaChatPhoneNumber
      : `+${lipaChatPhoneNumber}`;

    console.log(
      `SENDCHATMESSAGE: Using FROM number for API: ${fromNumberForApi}`
    );
    console.log(`SENDCHATMESSAGE: Using TO number for API: ${toNumberForApi}`);

    let lipaMessageId = null;
    let lipaMessageStatus = "failed";
    let finalMessageType = "text";

    // TODO: Determine the LIPACHAT_API_BASE_URL, e.g., from .env or hardcode if static
    // Assuming it's "https://gateway.lipachat.com/api/v1/whatsapp" based on Postman
    const LIPACHAT_API_BASE_URL = process.env.LIPACHAT_GATEWAY_URL;

    if (template && template.name) {
      finalMessageType = "template";
      console.warn(
        `sendChatMessage: Sending templates via Lipachat is not yet fully implemented. Template: ${template.name}`
      );
      lipaMessageId = `lipa-template-attempt-${Date.now()}`;
    } else if (mediaUrl) {
      finalMessageType =
        mediaUrl.includes(".jpg") || mediaUrl.includes(".png")
          ? "image"
          : mediaUrl.includes(".mp4")
          ? "video"
          : "document";
      console.warn(
        `sendChatMessage: Sending media via Lipachat is not yet fully implemented. Media URL: ${mediaUrl}`
      );
      lipaMessageId = `lipa-media-attempt-${Date.now()}`;
    } else if (text) {
      finalMessageType = "text";
      const textMessagePayload = {
        message: text,
        messageId: `client-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`,
        to: toNumberForApi, // Use consistently formatted E.164 number (with +)
        from: fromNumberForApi, // Use number directly from .env for 'from' field
      };

      try {
        console.log(
          "Sending text message to Lipachat with payload:",
          JSON.stringify(textMessagePayload, null, 2)
        );
        const response = await axios.post(
          `${LIPACHAT_API_BASE_URL}`,
          textMessagePayload,
          {
            headers: {
              apiKey: lipaChatApiKey,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(
          "Lipachat API Response:",
          JSON.stringify(response.data, null, 2)
        );
        if (
          response.data &&
          response.data.status === "success" &&
          response.data.data &&
          response.data.data.messageId
        ) {
          lipaMessageId = response.data.data.messageId;
          lipaMessageStatus = response.data.data.status
            ? response.data.data.status.toLowerCase()
            : "sent";
        } else if (
          response.data &&
          response.data.messages &&
          response.data.messages.length > 0 &&
          response.data.messages[0].id
        ) {
          lipaMessageId = response.data.messages[0].id;
          lipaMessageStatus = response.data.messages[0].status
            ? response.data.messages[0].status.toLowerCase()
            : "sent";
        } else {
          console.error(
            "Lipachat API call did not return expected success structure or messageId:",
            response.data
          );
          lipaMessageId = `lipa-failed-text-${Date.now()}`;
        }
      } catch (apiError) {
        console.error(
          "Error calling Lipachat API for text message:",
          apiError.response
            ? JSON.stringify(apiError.response.data, null, 2)
            : apiError.message
        );
        lipaMessageId = `lipa-error-text-${Date.now()}`;
      }
    } else {
      return res.status(400).json({
        success: false,
        error: "No message content (text, media, or template) provided.",
      });
    }

    const messageToSave = {
      messageId: lipaMessageId || `unknown-${Date.now()}`,
      from: normalizedFromNumberForDb, // Store the number as it was sent
      to: toNumberForApi, // Store the number as it was sent
      text: text,
      mediaUrl: finalMessageType !== "text" ? mediaUrl : null,
      status: lipaMessageStatus,
      contactId: contact.id,
      sender: normalizedFromNumberForDb, // Our number is the sender
      template: template ? JSON.stringify(template) : null,
      type: finalMessageType,
      timestamp: new Date(),
    };

    const message = await WhatsAppMessage.create(messageToSave);

    await contact.update({
      lastInteraction: new Date(),
      lastMessage: text || `Sent ${finalMessageType}`,
      lastMessageSender: "user",
      lastMessageId: lipaMessageId,
    });

    socketService.emitWhatsAppMessage({
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
      },
    });

    return res.json({
      success: lipaMessageStatus !== "failed",
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

      socketService.emitWhatsAppStatusUpdate({
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

    if (contact.unreadCount > 0) {
      await contact.update({ unreadCount: 0 });
      await contact.reload(); // Get the updated contact data

      // Emit an update to inform clients
      socketService.emitWhatsAppMessage({
        // Re-using emitWhatsAppMessage structure for simplicity
        // It will trigger 'whatsapp:chat_update' on the frontend
        message: {
          // Provide minimal message-like info if needed, or adapt frontend
          id: null, // No specific message, just chat update
          timestamp: contact.lastInteraction, // Could use lastInteraction or now
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
          unreadCount: contact.unreadCount, // This will be 0
          isOnline: contact.isOnline,
          lastMessageSender: contact.lastMessageSender,
          lastMessageId: contact.lastMessageId,
        },
      });
    }

    res.json({ success: true, data: { unreadCount: contact.unreadCount } });
  } catch (error) {
    console.error("Error marking chat as read:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to mark chat as read" });
  }
};
