import { requestAudioPermission } from './webrtc';

let ua = null;
let lastConfig = null;
let events = {};

function on(event, handler) {
  events[event] = events[event] || [];
  events[event].push(handler);
}

function emit(event, payload) {
  (events[event] || []).forEach((h) => h(payload));
}

export async function initializeSIP({ server, extension, password, wsServers = [], iceServers = [] }) {
  try {
    await requestAudioPermission();

    // Select websocket URL
    let wsUri = null;
    if (Array.isArray(wsServers) && wsServers.length > 0) {
      wsUri = wsServers[0].uri || wsServers[0];
    } else {
      wsUri = `wss://${server}:8089/ws`;
    }

    // Dynamically import sip.js to avoid RN bundling pitfalls
    const sip = require('sip.js');

    const { UserAgent } = sip;
    if (!UserAgent) {
      console.warn('[SIP] UserAgent not available in sip.js; skipping SIP init');
      return false;
    }

    const userAgent = new UserAgent({
      uri: `sip:${extension}@${server}`,
      transportOptions: { server: wsUri },
      authorizationUsername: extension,
      authorizationPassword: password,
      sessionDescriptionHandlerFactoryOptions: {
        peerConnectionConfiguration: { iceServers }
      }
    });

    ua = userAgent;
    lastConfig = { server, extension, password, wsServers, iceServers };

    ua.transport.on('connected', () => emit('ws:connected'));
    ua.transport.on('disconnected', () => emit('ws:disconnected'));

    ua.on('registered', () => emit('registered'));
    ua.on('unregistered', () => emit('unregistered'));
    ua.on('registrationFailed', (e) => emit('registrationFailed', e));

    ua.on('invite', (session) => {
      emit('session:new', { originator: 'remote', session });
      session.stateChange.addListener((newState) => {
        if (newState === 'Established') emit('session:confirmed');
        if (newState === 'Terminated') emit('session:ended');
      });
    });

    await ua.start();
    await ua.register();
    return true;
  } catch (err) {
    console.log('[SIP] initializeSIP error:', err?.message);
    return false;
  }
}

export function makeCall(number) {
  if (!ua) return null;
  const target = number.includes('@') ? number : `sip:${number}@${lastConfig.server}`;
  try {
    const inviter = new (require('sip.js').Inviter)(ua, target, {
      sessionDescriptionHandlerOptions: { constraints: { audio: true, video: false } }
    });
    inviter.invite();
    return inviter;
  } catch (e) {
    console.log('[SIP] makeCall error:', e?.message);
    return null;
  }
}

export function answerIncoming(session) {
  try {
    if (session && session.accept) session.accept();
  } catch {}
}

export function hangup(session) {
  try {
    if (session && session.dispose) session.dispose();
  } catch {}
}

export function getUA() { return ua; }
export function onEvent(event, handler) { on(event, handler); }
