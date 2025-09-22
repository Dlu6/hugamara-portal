// services/smsService.js
import axios from "axios";
import https from "https";
import redisClient from "../config/redis.js";
import SmsMessage from "../models/SmsMessage.js"; // Import the SmsMessage model

function buildAxiosClient(env = process.env) {
  const baseUrl =
    env.SMS_PROVIDER_BASE_URL || "https://sms.cyber-innovative.com/secure";
  const overrideIp = env.SMS_PROVIDER_OVERRIDE_IP; // e.g., 41.77.78.156
  const strictTls = env.SMS_PROVIDER_STRICT_TLS === "true"; // default false if overriding IP

  // Build Authorization header
  let authHeader = env.SMS_PROVIDER_AUTH; // e.g., "Basic base64..."
  if (!authHeader) {
    const user = env.SMS_PROVIDER_USERNAME || env.SMS_USERNAME;
    const pass = env.SMS_PROVIDER_PASSWORD || env.SMS_PASSWORD;
    if (user && pass) {
      const token = Buffer.from(`${user}:${pass}`).toString("base64");
      authHeader = `Basic ${token}`;
    }
  }

  const headers = {};
  if (authHeader) headers["Authorization"] = authHeader;

  // Optional host/IP override for environments where DNS/SSL is tricky
  if (overrideIp) {
    // If overriding to an IP for an HTTPS host with a different cert CN, relax TLS unless explicitly strict
    const httpsAgent = new https.Agent({ rejectUnauthorized: strictTls });
    return axios.create({
      baseURL: `https://${overrideIp}`,
      headers: {
        ...headers,
        // Ensure SNI/Host header routes traffic correctly at provider edge
        Host: new URL(baseUrl).host,
      },
      httpsAgent,
      timeout: 10000,
    });
  }

  return axios.create({
    baseURL: baseUrl,
    headers,
    timeout: 10000,
  });
}

let client = buildAxiosClient();

// Runtime-configurable settings persisted to Redis (optional)
let runtimeConfig = {
  baseUrl: process.env.SMS_PROVIDER_BASE_URL,
  overrideIp: process.env.SMS_PROVIDER_OVERRIDE_IP,
  strictTls: process.env.SMS_PROVIDER_STRICT_TLS,
  authHeader: process.env.SMS_PROVIDER_AUTH,
  username: process.env.SMS_PROVIDER_USERNAME || process.env.SMS_USERNAME,
  password: process.env.SMS_PROVIDER_PASSWORD || env.SMS_PASSWORD,
  defaultSender: process.env.SMS_DEFAULT_SENDER || "Hugamara",
  dlrUrl: process.env.SMS_DLR_URL,
};

async function loadConfig() {
  try {
    if (redisClient?.isReady) {
      const raw = await redisClient.get("sms:config");
      if (raw) {
        const cfg = JSON.parse(raw);
        runtimeConfig = { ...runtimeConfig, ...cfg };
        client = buildAxiosClient({
          ...process.env,
          SMS_PROVIDER_BASE_URL:
            cfg.baseUrl || process.env.SMS_PROVIDER_BASE_URL,
          SMS_PROVIDER_OVERRIDE_IP:
            cfg.overrideIp || process.env.SMS_PROVIDER_OVERRIDE_IP,
          SMS_PROVIDER_STRICT_TLS:
            cfg.strictTls ?? process.env.SMS_PROVIDER_STRICT_TLS,
          SMS_PROVIDER_AUTH: cfg.authHeader || process.env.SMS_PROVIDER_AUTH,
          SMS_PROVIDER_USERNAME:
            cfg.username || process.env.SMS_PROVIDER_USERNAME,
          SMS_PROVIDER_PASSWORD:
            cfg.password || process.env.SMS_PROVIDER_PASSWORD,
          SMS_USERNAME: cfg.username || process.env.SMS_USERNAME,
          SMS_PASSWORD: cfg.password || process.env.SMS_PASSWORD,
        });
      }
    }
  } catch (_) {}
}

await loadConfig();

export const smsService = {
  getConfig(mask = true) {
    const cfg = { ...runtimeConfig };
    if (mask) {
      if (cfg.password) cfg.password = "********";
      if (cfg.authHeader) cfg.authHeader = "********";
    }
    return cfg;
  },

  // Backward-compatible alias used by controllers
  getProviderConfig() {
    return this.getConfig();
  },

  async setConfig(update) {
    runtimeConfig = { ...runtimeConfig, ...update };
    try {
      if (redisClient?.isReady) {
        await redisClient.set("sms:config", JSON.stringify(runtimeConfig));
      }
    } catch (_) {}

    client = buildAxiosClient({
      ...process.env,
      SMS_PROVIDER_BASE_URL:
        runtimeConfig.baseUrl || process.env.SMS_PROVIDER_BASE_URL,
      SMS_PROVIDER_OVERRIDE_IP:
        runtimeConfig.overrideIp || process.env.SMS_PROVIDER_OVERRIDE_IP,
      SMS_PROVIDER_STRICT_TLS:
        runtimeConfig.strictTls ?? process.env.SMS_PROVIDER_STRICT_TLS,
      SMS_PROVIDER_AUTH:
        runtimeConfig.authHeader || process.env.SMS_PROVIDER_AUTH,
      SMS_PROVIDER_USERNAME:
        runtimeConfig.username || process.env.SMS_PROVIDER_USERNAME,
      SMS_PROVIDER_PASSWORD:
        runtimeConfig.password || process.env.SMS_PROVIDER_PASSWORD,
      SMS_USERNAME: runtimeConfig.username || process.env.SMS_USERNAME,
      SMS_PASSWORD: runtimeConfig.password || process.env.SMS_PASSWORD,
    });
    return this.getConfig();
  },

  // Backward-compatible alias used by controllers
  async updateProviderConfig(newConfig) {
    await this.setConfig(newConfig);
    return { success: true, message: "SMS provider config updated" };
  },

  async send({ to, content, from, dlr = "yes", dlrUrl, dlrLevel = 3 }) {
    const sender = from || runtimeConfig.defaultSender || "Hugamara";
    const callbackUrl =
      dlrUrl || runtimeConfig.dlrUrl || process.env.SMS_DLR_URL;

    const payload = {
      to,
      from: sender,
      content,
      dlr,
      // Provider expects kebab-case keys for DLR parameters
      ...(callbackUrl ? { "dlr-url": callbackUrl } : {}),
      ...(dlrLevel != null ? { "dlr-level": dlrLevel } : {}),
    };

    const res = await client.post("/send", payload, {
      headers: { "Content-Type": "application/json" },
    });

    // Save the outgoing message to the database
    if (res.data) {
      await SmsMessage.create({
        providerMessageId: res.data.message_id || null, // Adjust based on provider response
        fromNumber: sender,
        toNumber: to,
        content,
        direction: "outbound",
        status: "sent", // Or 'queued' depending on provider behavior
      });
    }

    return res.data;
  },

  async balance() {
    const res = await client.get("/balance");
    return res.data;
  },

  // Delivery report callback handler helper (optional normalization)
  normalizeDlr(payload = {}) {
    // Provider specific mapping can be added here if needed
    return {
      raw: payload,
      messageId: payload?.messageId || payload?.id || null,
      status: payload?.status || payload?.dlr_status || "unknown",
      to: payload?.to || payload?.msisdn || null,
      timestamp: payload?.timestamp || new Date().toISOString(),
    };
  },
};

export default smsService;
