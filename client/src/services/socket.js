import { io } from "socket.io-client";

let socket = null;
let connectAttempts = 0;
let reconnectTimer = null;

const MAX_BACKOFF_MS = 30000;

const getApiBase = () => {
  const url = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}:${u.port || 8000}`;
  } catch {
    return "http://localhost:8000";
  }
};

export const getSocket = () => socket;

export const connectSocket = (token, { outletId } = {}) => {
  if (socket?.connected) return socket;

  const base = getApiBase();
  const opts = {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 15000,
    auth: token ? { token } : undefined,
  };

  socket = io(base, opts);

  const joinOutlet = () => {
    if (socket && outletId) socket.emit("join-outlet", outletId);
  };

  socket.on("connect", () => {
    connectAttempts = 0;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    joinOutlet();
  });

  socket.on("disconnect", () => {
    selfHeal(token, { outletId });
  });

  socket.on("connect_error", () => {
    selfHeal(token, { outletId });
  });

  // Self-heal heartbeat
  const heartbeat = setInterval(() => {
    if (!socket) return;
    if (socket.connected) {
      try {
        socket.emit("ping");
      } catch {}
    }
  }, 10000);

  socket.__heartbeat = heartbeat;

  return socket;
};

export const selfHeal = (token, { outletId } = {}) => {
  connectAttempts += 1;
  const backoff = Math.min(
    1000 * 2 ** Math.min(connectAttempts, 5),
    MAX_BACKOFF_MS
  );
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    try {
      if (socket) {
        if (socket.__heartbeat) clearInterval(socket.__heartbeat);
        socket.removeAllListeners();
        socket.close();
      }
    } catch {}
    socket = null;
    connectSocket(token, { outletId });
  }, backoff);
};

export const disconnectSocket = () => {
  try {
    if (socket) {
      if (socket.__heartbeat) clearInterval(socket.__heartbeat);
      socket.removeAllListeners();
      socket.close();
    }
  } catch {}
  socket = null;
};
