import JsSIP from "jssip";
import { EventEmitter } from "events";
import { requestAudioPermission } from "./webrtc";
import { setupJsSIPWebRTC } from "./webrtcShim";
import { playRingtone, stopRingtone } from "./ringtoneService";

// Initialize WebRTC shim for JsSIP before any usage
setupJsSIPWebRTC();

// Singleton state for the SIP User Agent and session
const state = {
  ua: null,
  session: null,
  isConnected: false,
  eventEmitter: new EventEmitter(),
  lastConfig: null,
};

// --- Core SIP Service Logic (adapted from chrome-softphone-extension) ---

function setupPeerConnectionAudio(peerConnection) {
  console.log("[SIP] Setting up peer connection audio handlers");

  try {
    // Handle incoming tracks (remote audio)
    peerConnection.ontrack = (event) => {
      console.log("[SIP] Received remote track:", {
        kind: event.track.kind,
        id: event.track.id,
        readyState: event.track.readyState,
        enabled: event.track.enabled,
        muted: event.track.muted,
        streamCount: event.streams?.length || 0,
      });

      if (event.track.kind === "audio") {
        console.log("[SIP] Setting up remote audio track");

        // Use the stream from the event if available, otherwise create one
        let stream;
        if (event.streams && event.streams.length > 0) {
          stream = event.streams[0];
          console.log("[SIP] Using stream from track event");
        } else {
          stream = new MediaStream([event.track]);
          console.log("[SIP] Created new stream from track");
        }

        // Set up the audio playback
        playRemoteAudio(stream);

        // Monitor track state changes
        event.track.onended = () => {
          console.log("[SIP] Remote audio track ended");
        };

        event.track.onmute = () => {
          console.log("[SIP] Remote audio track muted");
        };

        event.track.onunmute = () => {
          console.log("[SIP] Remote audio track unmuted");
        };
      }
    };

    // Monitor connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "[SIP] ICE Connection State:",
        peerConnection.iceConnectionState
      );

      // When ICE is connected, check for streams again
      if (
        peerConnection.iceConnectionState === "connected" ||
        peerConnection.iceConnectionState === "completed"
      ) {
        console.log("[SIP] ICE connected - checking for audio streams");

        // Check for remote streams
        const remoteStreams = peerConnection.getRemoteStreams
          ? peerConnection.getRemoteStreams()
          : [];
        if (remoteStreams.length > 0) {
          console.log("[SIP] Found remote streams after ICE connection");
          remoteStreams.forEach((stream, index) => {
            const audioTracks = stream.getAudioTracks();
            if (audioTracks.length > 0) {
              console.log(`[SIP] Playing audio from remote stream ${index}`);
              playRemoteAudio(stream);
            }
          });
        }

        // Also check receivers
        const receivers = peerConnection.getReceivers();
        const audioReceivers = receivers.filter(
          (r) =>
            r.track && r.track.kind === "audio" && r.track.readyState === "live"
        );

        if (audioReceivers.length > 0 && remoteStreams.length === 0) {
          console.log(
            `[SIP] Creating stream from ${audioReceivers.length} audio receivers`
          );
          const stream = new MediaStream();
          audioReceivers.forEach((receiver) => {
            stream.addTrack(receiver.track);
          });
          playRemoteAudio(stream);
        }
      } else if (peerConnection.iceConnectionState === "failed") {
        console.error(
          "[SIP] ICE connection failed - this will cause call to drop"
        );
        state.eventEmitter.emit("call:iceFailure", {
          state: peerConnection.iceConnectionState,
          gatheringState: peerConnection.iceGatheringState,
        });
      } else if (peerConnection.iceConnectionState === "disconnected") {
        console.warn("[SIP] ICE connection disconnected - may recover");
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log("[SIP] Connection State:", peerConnection.connectionState);

      if (peerConnection.connectionState === "failed") {
        console.error("[SIP] Peer connection failed");
        state.eventEmitter.emit("call:connectionFailure", {
          connectionState: peerConnection.connectionState,
          iceConnectionState: peerConnection.iceConnectionState,
        });
      }
    };

    peerConnection.onicegatheringstatechange = () => {
      console.log(
        "[SIP] ICE Gathering State:",
        peerConnection.iceGatheringState
      );
    };

    // Check if there are already streams available
    const existingStreams = peerConnection.getRemoteStreams
      ? peerConnection.getRemoteStreams()
      : [];
    if (existingStreams.length > 0) {
      console.log("[SIP] Found existing remote streams during setup");
      existingStreams.forEach((stream, index) => {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          console.log(`[SIP] Setting up audio from existing stream ${index}`);
          playRemoteAudio(stream);
        }
      });
    }
  } catch (error) {
    console.error("[SIP] Error setting up peer connection audio:", error);
  }
}

function playRemoteAudio(stream) {
  console.log("[SIP] Setting up remote audio playback");

  try {
    // For React Native, we need to use the WebRTC audio handling
    // The audio will be played through the device's audio system
    const audioTracks = stream.getAudioTracks();
    console.log(`[SIP] Stream has ${audioTracks.length} audio track(s)`);

    audioTracks.forEach((track, index) => {
      // Only log track state changes, not constant state
      track.onended = () => {
        console.log(`[SIP] Audio track ${index} ended`);
      };

      track.onmute = () => {
        console.log(`[SIP] Audio track ${index} muted`);
      };

      track.onunmute = () => {
        console.log(`[SIP] Audio track ${index} unmuted`);
      };
    });
  } catch (error) {
    console.error("[SIP] Error setting up remote audio:", error);
  }
}

async function connect(config) {
  console.log("[SIP] Starting SIP connection with config:", config);
  const { server, extension, password, wsServers = [] } = config;

  if (!server || !extension || !password) {
    throw new Error("SIP connection requires server, extension, and password.");
  }

  // Use the first ws_server URI if available, otherwise construct one.
  const wsUri =
    wsServers.length > 0 && wsServers[0].uri
      ? wsServers[0].uri
      : `wss://${server}:8089/ws`;

  console.log("[SIP] Using WebSocket URI:", wsUri);
  const socket = new JsSIP.WebSocketInterface(wsUri);

  const configuration = {
    sockets: [socket],
    uri: `sip:${extension}@${server}`,
    password: password,
    register: true,
    session_timers: false,
    connection_recovery_min_interval: 2,
    connection_recovery_max_interval: 30,
    registrar_server: `sip:${server}`,
    contact_uri: `sip:${extension}@${server}`,
    authorization_user: extension,
    realm: server,
    register_expires: 600,
    no_answer_timeout: 30000, // Reduce to 30 seconds
    use_preloaded_route: false,
  };

  const ua = new JsSIP.UA(configuration);
  state.ua = ua;

  // --- Event Handlers ---
  ua.on("connected", () => {
    console.log("[SIP] WebSocket connected");
    state.isConnected = true;
    state.eventEmitter.emit("ws:connected");
  });

  ua.on("disconnected", () => {
    console.log("[SIP] WebSocket disconnected");
    state.isConnected = false;
    state.eventEmitter.emit("ws:disconnected");
  });

  ua.on("registered", () => {
    console.log("[SIP] ✅ Registered successfully");
    state.eventEmitter.emit("registered");
  });

  ua.on("unregistered", (e) => {
    console.log("[SIP] ❌ Unregistered", e?.cause || "");
    state.eventEmitter.emit("unregistered");
  });

  ua.on("registrationFailed", (e) => {
    console.log("[SIP] ❌ Registration Failed", e?.cause || "");
    state.eventEmitter.emit("registrationFailed", e);
  });

  ua.on("newRTCSession", (e) => {
    console.log("[SIP] New call session:", e.originator);
    state.session = e.session;

    if (e.originator === "remote") {
      // Play ringtone for incoming calls
      playRingtone();
      state.eventEmitter.emit("incoming_call", e.session);
    } else if (e.originator === "local") {
      state.eventEmitter.emit("outgoing_call", e.session);
    }

    // --- In-Call Event Handlers ---
    e.session.on("progress", (response) => {
      console.log("[SIP] Call progress - remote is ringing");
      state.eventEmitter.emit("call_progress");
    });
    e.session.on("accepted", () => {
      console.log("[SIP] Call accepted - remote answered");
      stopRingtone();
      state.eventEmitter.emit("call_accepted");

      // Set up audio after call is accepted
      if (e.session.sessionDescriptionHandler?.peerConnection) {
        setupPeerConnectionAudio(
          e.session.sessionDescriptionHandler.peerConnection
        );
      }
    });
    e.session.on("confirmed", () => {
      console.log("[SIP] Call confirmed - media established");
      state.eventEmitter.emit("call_confirmed");

      // Set up audio after call is confirmed
      if (e.session.sessionDescriptionHandler?.peerConnection) {
        setupPeerConnectionAudio(
          e.session.sessionDescriptionHandler.peerConnection
        );
      }
    });
    e.session.on("ended", () => {
      console.log("[SIP] Call ended");
      stopRingtone();
      state.session = null;
      state.eventEmitter.emit("call_ended");
    });
    e.session.on("failed", (data) => {
      console.log("[SIP] Call failed:", data?.cause || "unknown");
      console.log("[SIP] Call failed details:", {
        cause: data?.cause,
        originator: data?.originator,
        message: data?.message,
        response: data?.response?.status_code,
        reason: data?.response?.reason_phrase,
      });
      stopRingtone();
      state.session = null;
      state.eventEmitter.emit("call_failed");
    });
    e.session.on("hold", () => state.eventEmitter.emit("hold", true));
    e.session.on("unhold", () => state.eventEmitter.emit("hold", false));
    e.session.on("muted", () => state.eventEmitter.emit("mute", true));
    e.session.on("unmuted", () => state.eventEmitter.emit("mute", false));

    // Set up peer connection audio when available
    e.session.on("peerconnection", (event) => {
      if (event.peerconnection) {
        setupPeerConnectionAudio(event.peerconnection);
      }
    });

    // Monitor session description handler creation
    e.session.on("SessionDescriptionHandler-created", () => {
      if (e.session.sessionDescriptionHandler?.peerConnection) {
        setupPeerConnectionAudio(
          e.session.sessionDescriptionHandler.peerConnection
        );
      }
    });
  });

  console.log("[SIP] Starting User Agent...");
  ua.start();
}

// --- Public API ---

export async function initializeSIP(config) {
  console.log("[SIP] Initializing SIP client...");
  if (state.ua) {
    console.log(
      "[SIP] Disconnecting existing UA before initializing a new one."
    );
    await disconnect();
  }

  try {
    // For mobile, we need to request audio permissions upfront.
    await requestAudioPermission();
    state.lastConfig = config;
    await connect(config);
    return true;
  } catch (err) {
    console.error("[SIP] Initialization failed:", err);
    state.ua = null;
    return false;
  }
}

export async function disconnect() {
  if (state.ua) {
    console.log("[SIP] Disconnecting...");
    state.ua.stop();
    state.ua = null;
    state.isConnected = false;
  }
}

export function makeCall(number) {
  if (!state.ua || !state.lastConfig) {
    console.error("[SIP] Cannot make call: UA not initialized.");
    return;
  }
  const target = `sip:${number}@${state.lastConfig.server}`;
  const options = {
    mediaConstraints: { audio: true, video: false },
    pcConfig: {
      iceServers: state.lastConfig.iceServers || [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
      ],
      iceTransportPolicy: "all", // Try all candidates (relay, srflx, host)
      bundlePolicy: "balanced", // Bundle audio/video when possible
      rtcpMuxPolicy: "require", // Multiplex RTP and RTCP on same port
      iceCandidatePoolSize: 10, // Pre-gather 10 ICE candidates
    },
    iceGatheringTimeout: 5000, // Wait up to 5 seconds for ICE gathering
  };
  console.log("[SIP] Making call to:", number);
  state.ua.call(target, options);
}

export function answerCall() {
  stopRingtone();
  if (state.session) {
    console.log("[SIP] Answering call");
    state.session.answer({
      mediaConstraints: { audio: true, video: false },
      pcConfig: {
        iceServers: state.lastConfig.iceServers || [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
        iceTransportPolicy: "all", // Try all candidates (relay, srflx, host)
        bundlePolicy: "balanced", // Bundle audio/video when possible
        rtcpMuxPolicy: "require", // Multiplex RTP and RTCP on same port
        iceCandidatePoolSize: 10, // Pre-gather 10 ICE candidates
      },
      iceGatheringTimeout: 5000, // Wait up to 5 seconds for ICE gathering
    });

    // Set up audio handling after answering
    setTimeout(() => {
      if (
        state.session &&
        state.session.sessionDescriptionHandler?.peerConnection
      ) {
        console.log("[SIP] Setting up audio after answering");
        setupPeerConnectionAudio(
          state.session.sessionDescriptionHandler.peerConnection
        );
      }
    }, 100);
  }
}

export function hangupCall() {
  stopRingtone();
  if (state.session) {
    state.session.terminate();
  }
}

export function toggleMute() {
  if (state.session) {
    if (state.session.isMuted().audio) {
      state.session.unmute({ audio: true });
    } else {
      state.session.mute({ audio: true });
    }
  }
}

export function toggleHold() {
  if (state.session) {
    if (state.session.isOnHold().local) {
      state.session.unhold();
    } else {
      state.session.hold();
    }
  }
}

export const sipEvents = state.eventEmitter;
