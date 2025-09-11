// socketService.js
import { Server } from "socket.io";
import { io as Client } from "socket.io-client";
import { generateFingerprint } from "../utils/serverFingerprinting.js";
import createLicenseService from "./licenseService.js";
import chalk from "chalk";

// Debug mode - set to false to reduce console clutter
const DEBUG_MODE = false;

let io = null;
let masterSocket = null;
let serverFingerprint = null;
const licenseService = createLicenseService();

export const initialize = async (httpServer) => {
  try {
    console.log("🔌 Initializing Socket.IO server...");

    // Generate server fingerprint during initialization
    serverFingerprint = await generateFingerprint();
    console.log("🔍 Generated server fingerprint:", serverFingerprint);

    io = new Server(httpServer, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      path: "/socket.io/",
      transports: ["websocket", "polling"],
    });

    // Add connection event handlers for debugging
    io.on("connection", (socket) => {
      console.log(`🔌 Client connected: ${socket.id}`);

      socket.on("disconnect", (reason) => {
        console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
        if (socket.username) {
          console.log(
            "[SocketService] Session ended for user:",
            socket.username
          );
        }
      });

      socket.on("error", (error) => {
        console.error(`🔌 Socket error for ${socket.id}:`, error);
      });

      // Handle authentication
      socket.on("authenticate", (data) => {
        console.log(`🔌 Client ${socket.id} authenticated:`, data);
        socket.userId = data.userId;
        socket.extension = data.extension;
      });

      // Handle ping/pong
      socket.on("ping", () => {
        socket.emit("pong");
      });

      // Handle license authentication for Chrome extension
      socket.on("license:authenticate", async (data) => {
        console.log(
          "[SocketService] License authentication request received:",
          {
            hasSessionToken: !!data.sessionToken,
            tokenLength: data.sessionToken?.length || 0,
            socketId: socket.id,
          }
        );

        try {
          if (!data.sessionToken) {
            console.error("[SocketService] No session token provided");
            socket.emit("license:auth_failed", {
              reason: "No session token provided",
            });
            return;
          }

          // Validate the license session token
          console.log("[SocketService] Validating session token...");
          const sessionValidation = await licenseService.validateClientSession(
            data.sessionToken
          );

          if (!sessionValidation.valid) {
            console.error(
              "[SocketService] Session validation failed:",
              sessionValidation.reason
            );
            socket.emit("license:auth_failed", {
              reason: sessionValidation.reason || "Invalid session token",
            });
            return;
          }

          console.log(
            "[SocketService] ✅ License authentication successful for user:",
            sessionValidation.username
          );

          // Send success response with license and features
          socket.emit("license:auth_success", {
            message: "License authentication successful",
            username: sessionValidation.username,
            timestamp: new Date().toISOString(),
            license: sessionValidation.license,
            features: sessionValidation.features,
          });

          // Store session info on socket for cleanup
          socket.sessionToken = data.sessionToken;
          socket.username = sessionValidation.username;
        } catch (error) {
          console.error("[SocketService] License authentication error:", error);
          socket.emit("license:auth_failed", {
            reason: error.message || "Authentication failed",
          });
        }
      });

      // Handle license heartbeat
      socket.on("license:heartbeat", () => {
        console.log(
          "[SocketService] License heartbeat received from:",
          socket.id
        );
        socket.emit("license:heartbeat_response", {
          timestamp: new Date().toISOString(),
        });
      });
    });

    console.log("✅ Socket.IO server initialized successfully");

    // Connect to master server
    connectToMaster();

    return io;
  } catch (error) {
    console.error("❌ Failed to initialize Socket.IO server:", error);
    throw error;
  }
};

const connectToMaster = () => {
  const masterUrl =
    process.env.LICENSE_MGMT_API_URL?.replace("/api", "") ||
    "http://localhost:8001";
  console.log(`Connecting to master server at: ${masterUrl}`);

  masterSocket = Client(masterUrl, {
    path: "/socket.io/",
    transports: ["websocket", "polling"],
    timeout: 5000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  masterSocket.on("connect", () => {
    console.log("✅ Connected to master license server for real-time updates.");
  });

  masterSocket.on("license:updated", async (data) => {
    console.log("📡 Received license update from master:", data);
    console.log("🔍 Current server fingerprint:", serverFingerprint);
    console.log("📡 Master server fingerprint:", data.serverFingerprint);

    if (data.serverFingerprint === serverFingerprint) {
      console.log("🔍 Fingerprint matches. Triggering local license sync.");
      try {
        const { default: createLicenseService } = await import(
          "./licenseService.js"
        );
        const licenseService = createLicenseService();

        // Force a fresh sync to get the latest license
        await licenseService.syncLicenseFromMaster();

        // Small delay to ensure cache is updated
        await new Promise((resolve) => setTimeout(resolve, 100));

        await emitLicenseUpdateToDashboards();
      } catch (error) {
        console.error("❌ Error syncing license from master:", error);
      }
    } else {
      console.log("⚠️ Fingerprint mismatch, but attempting sync anyway...");
      try {
        // Even if fingerprints don't match, try to sync to handle fingerprint updates
        const { default: createLicenseService } = await import(
          "./licenseService.js"
        );
        const licenseService = createLicenseService();
        const syncResult = await licenseService.syncLicenseFromMaster();
        if (syncResult.success) {
          console.log(
            "✅ License sync successful despite fingerprint mismatch"
          );
          await emitLicenseUpdateToDashboards();
        } else {
          console.log("⚠️ License sync failed:", syncResult.message);
        }
      } catch (error) {
        console.error("❌ Error syncing license from master:", error);
      }
    }
  });

  masterSocket.on("disconnect", () => {
    console.log("❌ Disconnected from master license server.");
  });

  masterSocket.on("connect_error", (error) => {
    console.error("❌ Failed to connect to master server:", error.message);
  });
};

export const emitLicenseUpdateToDashboards = async () => {
  if (io) {
    console.log("📤 Emitting license update to dashboard clients");

    // Get current license to include in the update
    try {
      const { default: createLicenseService } = await import(
        "./licenseService.js"
      );
      const licenseService = createLicenseService();
      const currentLicense = await licenseService.getCurrentLicense();

      const updateData = {
        message: "License has been updated.",
        timestamp: new Date().toISOString(),
        license: currentLicense,
      };

      console.log("📤 License update data:", updateData);

      // Emit to all connected clients
      io.emit("license:updated", updateData);

      // Also emit to specific rooms if needed
      const connectedClients = io.sockets.sockets.size;
      console.log(
        `📤 Emitted license update to ${connectedClients} connected clients`
      );
    } catch (error) {
      console.error("❌ Error getting current license for update:", error);
      // Fallback to basic update without license object
      const fallbackData = {
        message: "License has been updated.",
        timestamp: new Date().toISOString(),
      };
      io.emit("license:updated", fallbackData);
    }
  } else {
    console.warn("⚠️ Cannot emit license update: Socket.IO not initialized");
  }
};

export const cleanup = () => {
  if (masterSocket) {
    masterSocket.disconnect();
  }
  if (io) {
    io.close();
  }
};

// Add broadcast function for call monitoring service
export const broadcast = (event, data) => {
  if (io) {
    if (DEBUG_MODE) {
      console.log(`📤 Broadcasting ${event} to all clients`);
    }
    io.emit(event, data);
  } else {
    console.warn("⚠️ Cannot broadcast: Socket.IO not initialized");
  }
};

// Add emitToUser function for targeted messages
export const emitToUser = (userId, event, data) => {
  if (io) {
    // Find socket by user ID (you might need to store user-socket mapping)
    const sockets = Array.from(io.sockets.sockets.values());
    const userSocket = sockets.find((socket) => socket.userId === userId);

    if (userSocket) {
      if (DEBUG_MODE) {
        console.log(`📤 Emitting ${event} to user ${userId}`);
      }
      userSocket.emit(event, data);
    } else {
      console.warn(`⚠️ User ${userId} not found in connected sockets`);
    }
  } else {
    console.warn("⚠️ Cannot emit to user: Socket.IO not initialized");
  }
};

// Add emitCallHistoryUpdate function
export const emitCallHistoryUpdate = (data) => {
  if (io) {
    if (DEBUG_MODE) {
      console.log("📤 Emitting call history update to all clients");
    }
    io.emit("callHistory:update", data);
  } else {
    console.warn(
      "⚠️ Cannot emit call history update: Socket.IO not initialized"
    );
  }
};

export const socketService = {
  initialize,
  emitLicenseUpdateToDashboards,
  cleanup,
  broadcast,
  emitToUser,
  emitCallHistoryUpdate,
};

export const emitLicenseUpdate = async () =>
  await emitLicenseUpdateToDashboards();
