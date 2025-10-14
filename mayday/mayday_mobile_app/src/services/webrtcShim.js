/**
 * WebRTC Shim for JsSIP in React Native
 *
 * JsSIP expects browser WebRTC APIs (RTCPeerConnection, getUserMedia, etc.)
 * which don't exist in React Native's Hermes engine. This file provides
 * the necessary shims by using the react-native-webrtc package.
 */

import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
  mediaDevices,
} from "react-native-webrtc";

// Export WebRTC classes for JsSIP to use
export const webrtcShim = {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
  getUserMedia: (constraints) => mediaDevices.getUserMedia(constraints),
  mediaDevices,
};

/**
 * Configure JsSIP to use react-native-webrtc
 * Call this before creating any JsSIP.UA instances
 */
export function setupJsSIPWebRTC() {
  // JsSIP uses a global check for WebRTC support
  // We need to make these available globally for JsSIP to detect
  if (typeof global !== "undefined") {
    global.RTCPeerConnection = RTCPeerConnection;
    global.RTCSessionDescription = RTCSessionDescription;
    global.RTCIceCandidate = RTCIceCandidate;
    global.MediaStream = MediaStream;

    // Some versions of JsSIP check for getUserMedia
    if (!global.navigator) {
      global.navigator = {};
    }
    if (!global.navigator.mediaDevices) {
      global.navigator.mediaDevices = mediaDevices;
    }

    console.log("[WebRTC Shim] Configured react-native-webrtc for JsSIP");
  }
}

export default webrtcShim;
