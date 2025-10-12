import axios from "axios";

const getApiBaseUrl = () =>
  process.env.LIPACHAT_GATEWAY_URL ||
  "https://app.lipachat.com/api/v1/whatsapp";

const getApiKey = () => process.env.LIPACHAT_API_KEY;

const getHeaders = (apiKey) => ({
  "X-LipaChat-Api-Key": apiKey || getApiKey(),
  "Content-Type": "application/json",
});

// Enhanced text message sending based on Lipachat docs
export const sendText = async ({ to, from, message, messageId, apiKey }) => {
  const payload = {
    to,
    from,
    text: message, // Use 'text' instead of 'message'
    messageId: messageId || `client-${Date.now()}`,
    type: "text",
  };
  const url = getApiBaseUrl();
  console.log("📤 Sending to Lipachat API:", url);
  console.log("📤 Payload:", JSON.stringify(payload, null, 2));
  console.log("📤 API Key passed:", apiKey);
  console.log("📤 API Key from env:", getApiKey());
  console.log("📤 Headers:", JSON.stringify(getHeaders(apiKey), null, 2));

  try {
    const res = await axios.post(url, payload, { headers: getHeaders(apiKey) });
    console.log("📤 Lipachat API Response:", res.status, res.data);
    return res.data;
  } catch (error) {
    console.error(
      "📤 Lipachat API Error:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};

// Enhanced media message sending based on Lipachat docs
export const sendMedia = async ({
  to,
  from,
  url,
  type = "image",
  caption,
  apiKey,
}) => {
  const payload = {
    to,
    from,
    type: type.toUpperCase(),
    media: { url },
    caption: caption || "",
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Send buttons based on Lipachat docs
export const sendButtons = async ({ to, from, text, buttons, apiKey }) => {
  const payload = {
    to,
    from,
    type: "INTERACTIVE",
    interactive: {
      type: "button",
      body: { text },
      action: {
        buttons: buttons.map((button, index) => ({
          type: "reply",
          reply: {
            id: `btn_${index}`,
            title: button.title,
          },
        })),
      },
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Send interactive list based on Lipachat docs
export const sendInteractiveList = async ({
  to,
  from,
  text,
  buttonText,
  sections,
  apiKey,
}) => {
  const payload = {
    to,
    from,
    type: "INTERACTIVE",
    interactive: {
      type: "list",
      body: { text },
      action: {
        button: buttonText,
        sections,
      },
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Send contact based on Lipachat docs
export const sendContact = async ({ to, from, contacts, apiKey }) => {
  const payload = {
    to,
    from,
    type: "CONTACTS",
    contacts,
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Send location based on Lipachat docs
export const sendLocation = async ({
  to,
  from,
  latitude,
  longitude,
  name,
  address,
  apiKey,
}) => {
  const payload = {
    to,
    from,
    type: "LOCATION",
    location: {
      latitude,
      longitude,
      name: name || "",
      address: address || "",
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Request location based on Lipachat docs
export const requestLocation = async ({ to, from, text, apiKey }) => {
  const payload = {
    to,
    from,
    type: "INTERACTIVE",
    interactive: {
      type: "location_request_message",
      body: { text },
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Enhanced template message sending based on Lipachat docs
export const sendTemplate = async ({ to, from, template, apiKey }) => {
  const payload = {
    to,
    from,
    type: "TEMPLATE",
    template: {
      name: template.name,
      language: { code: template.language || "en" },
      components: template.components || [],
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Send WhatsApp Flow based on Lipachat docs
export const sendFlow = async ({
  to,
  from,
  flowId,
  flowToken,
  flowCtaText,
  flowActionPayload,
  apiKey,
}) => {
  const payload = {
    to,
    from,
    type: "INTERACTIVE",
    interactive: {
      type: "flow",
      header: {
        type: "text",
        text: flowCtaText,
      },
      body: {
        text: "Complete the flow below",
      },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: flowToken,
          flow_id: flowId,
          flow_cta: flowCtaText,
          flow_action_payload: flowActionPayload,
        },
      },
    },
  };
  const apiUrl = getApiBaseUrl();
  const res = await axios.post(apiUrl, payload, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Enhanced webhook signature verification
export const verifyWebhookSignature = (req) => {
  try {
    const secret = process.env.LIPACHAT_WEBHOOK_SECRET;
    const provided =
      req.headers["x-lipachat-signature"] || req.headers["x-signature"];

    if (!secret || !provided) {
      console.warn(
        "Webhook signature verification skipped - no secret configured"
      );
      return true; // Fallback when not configured
    }

    // TODO: Implement proper HMAC verification when Lipachat provides the algorithm
    // For now, we'll do a simple comparison
    return provided === secret;
  } catch (e) {
    console.error("Webhook signature verification error:", e);
    return true; // Allow pass-through on error
  }
};

// Get message status
export const getMessageStatus = async (messageId, apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/messages/${messageId}/status`;
  const res = await axios.get(apiUrl, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// List message templates
export const getTemplates = async (apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/templates`;
  const res = await axios.get(apiUrl, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Create message template
export const createTemplate = async (templateData, apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/templates`;
  const res = await axios.post(apiUrl, templateData, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Update message template
export const updateTemplate = async (templateId, templateData, apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/templates/${templateId}`;
  const res = await axios.put(apiUrl, templateData, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// List flows
export const getFlows = async (apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/flows`;
  const res = await axios.get(apiUrl, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

// Create flow
export const createFlow = async (flowData, apiKey) => {
  const apiUrl = `${getApiBaseUrl()}/flows`;
  const res = await axios.post(apiUrl, flowData, {
    headers: getHeaders(apiKey),
  });
  return res.data;
};

export default {
  sendText,
  sendMedia,
  sendButtons,
  sendInteractiveList,
  sendContact,
  sendLocation,
  requestLocation,
  sendTemplate,
  sendFlow,
  verifyWebhookSignature,
  getMessageStatus,
  getTemplates,
  createTemplate,
  updateTemplate,
  getFlows,
  createFlow,
};
