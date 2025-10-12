import twilio from "twilio";

// Check webhook configuration on startup
const WEBHOOK_URL = process.env.TWILIO_WEBHOOK_URL;
const isWebhookConfigured = WEBHOOK_URL && !WEBHOOK_URL.includes("localhost");

if (!isWebhookConfigured) {
  console.warn(
    "⚠️  TWILIO_WEBHOOK_URL not set or is localhost. Real-time status updates will not work."
  );
  console.warn(
    "💡 Set TWILIO_WEBHOOK_URL to your public URL (e.g., ngrok or production domain)"
  );
  console.warn(
    "💡 Example: TWILIO_WEBHOOK_URL=https://your-ngrok-url.ngrok.io"
  );
}

// Initialize Twilio client
const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error(
      "Missing Twilio credentials. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables."
    );
  }

  return twilio(accountSid, authToken);
};

// Get WhatsApp number from environment
const getWhatsAppNumber = () => {
  return process.env.TWILIO_WHATSAPP_NUMBER || "+14255105236";
};

// Send text message via WhatsApp
export const sendText = async ({ to, from, message, messageId }) => {
  try {
    const client = getTwilioClient();
    const fromNumber = from || getWhatsAppNumber();

    // console.log("📤 Sending WhatsApp text via Twilio:", {
    //   to,
    //   from: fromNumber,
    //   message,
    //   messageId,
    // });

    const messageResponse = await client.messages.create({
      body: message,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      // Only set statusCallback if we have a public URL
      ...(messageId &&
        isWebhookConfigured && {
          statusCallback: `${WEBHOOK_URL}/api/whatsapp/webhook/statusCallback`,
        }),
    });

    // console.log("📤 Twilio WhatsApp response:", messageResponse.sid);

    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      data: messageResponse,
    };
  } catch (error) {
    console.error("📤 Twilio WhatsApp error:", error);
    throw error;
  }
};

// Send media message via WhatsApp
export const sendMedia = async ({
  to,
  from,
  mediaUrl,
  type = "image",
  caption,
}) => {
  try {
    const client = getTwilioClient();
    const fromNumber = from || getWhatsAppNumber();

    // console.log("📤 Sending WhatsApp media via Twilio:", {
    //   to,
    //   from: fromNumber,
    //   mediaUrl,
    //   type,
    //   caption,
    // });

    const messageResponse = await client.messages.create({
      mediaUrl: [mediaUrl],
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      ...(caption && { body: caption }),
      // Only set statusCallback if we have a public URL
      ...(isWebhookConfigured && {
        statusCallback: `${WEBHOOK_URL}/api/whatsapp/webhook/statusCallback`,
      }),
    });

    // console.log("📤 Twilio WhatsApp media response:", messageResponse.sid);

    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      data: messageResponse,
    };
  } catch (error) {
    console.error("📤 Twilio WhatsApp media error:", error);
    throw error;
  }
};

// Send template message via WhatsApp
export const sendTemplate = async ({
  to,
  from,
  templateName,
  languageCode = "en",
  parameters = [],
}) => {
  try {
    const client = getTwilioClient();
    const fromNumber = from || getWhatsAppNumber();

    console.log("📤 Sending WhatsApp template via Twilio:", {
      to,
      from: fromNumber,
      templateName,
      languageCode,
      parameters,
    });

    // Build the template message body
    let templateBody = `{{${templateName}}}`;

    // Add parameters if provided
    if (parameters.length > 0) {
      templateBody += `\n${parameters
        .map((param, index) => `{{${index + 1}}}`)
        .join("\n")}`;
    }

    const messageResponse = await client.messages.create({
      body: templateBody,
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      // Only set statusCallback if we have a public URL
      ...(isWebhookConfigured && {
        statusCallback: `${WEBHOOK_URL}/api/whatsapp/webhook/statusCallback`,
      }),
      // For templates, you might need to use a different approach
      // This is a simplified version - actual template sending may require different API calls
    });

    // console.log("📤 Twilio WhatsApp template response:", messageResponse.sid);

    return {
      success: true,
      messageId: messageResponse.sid,
      status: messageResponse.status,
      data: messageResponse,
    };
  } catch (error) {
    console.error("📤 Twilio WhatsApp template error:", error);
    throw error;
  }
};

// Verify webhook signature
export const verifyWebhookSignature = (req) => {
  try {
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const signature = req.headers["x-twilio-signature"];
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    if (!authToken || !signature) {
      console.warn(
        "Webhook signature verification skipped - missing auth token or signature"
      );
      return true; // Fallback when not configured
    }

    return twilio.validateRequest(authToken, signature, url, req.body);
  } catch (error) {
    console.error("Webhook signature verification error:", error);
    return true; // Allow pass-through on error
  }
};

// Get message status
export const getMessageStatus = async (messageId) => {
  try {
    const client = getTwilioClient();
    const message = await client.messages(messageId).fetch();

    return {
      success: true,
      messageId: message.sid,
      status: message.status,
      data: message,
    };
  } catch (error) {
    console.error("Error fetching message status:", error);
    throw error;
  }
};

export default {
  sendText,
  sendMedia,
  sendTemplate,
  verifyWebhookSignature,
  getMessageStatus,
};
