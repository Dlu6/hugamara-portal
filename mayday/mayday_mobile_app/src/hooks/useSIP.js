import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setRegistered } from "../store/slices/sipSlice";
import {
  incomingCall,
  startCall,
  endCall,
  setMute,
  setHold,
  updateCallStatus,
} from "../store/slices/callSlice";
import { sipEvents } from "../services/sipClient";
import { navigate } from "../navigation/navigationRef";
import { scheduleIncomingCallNotification } from "../services/notifications";

export default function useSIP() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Registration events
    const onRegistered = () => dispatch(setRegistered(true));
    const onRegistrationFailed = () => dispatch(setRegistered(false));
    const onUnregistered = () => dispatch(setRegistered(false));

    // Call state events
    const onIncomingCall = (session) => {
      const from = session?.remote_identity?.uri?.user || "Unknown";
      dispatch(incomingCall({ caller: from }));

      // Schedule notification for background handling
      scheduleIncomingCallNotification({ number: from });

      navigate("IncomingCall", { caller: from });
    };
    const onOutgoingCall = (session) => {
      const number = session?.remote_identity?.uri?.user || "Unknown";
      dispatch(startCall({ number }));
      navigate("Call", { number });
    };
    const onCallProgress = () => {
      console.log("[CallManager] Call progress - updating status to ringing");
      dispatch(updateCallStatus("ringing"));
    };
    const onCallAccepted = () => {
      console.log("[CallManager] Call accepted - updating status to active");
      dispatch(updateCallStatus("active"));
    };
    const onCallConfirmed = () => {
      console.log(
        "[CallManager] Call confirmed - updating status to connected"
      );
      dispatch(updateCallStatus("connected"));
    };
    const onCallEnded = () => {
      dispatch(endCall());
      // Navigate back to Dialer when call ends
      navigate("Main", { screen: "Dialer" });
    };
    const onCallFailed = () => {
      dispatch(endCall());
      // Navigate back to Dialer when call fails
      navigate("Main", { screen: "Dialer" });
    };

    // In-call action events
    const onMute = (isMuted) => dispatch(setMute(isMuted));
    const onHold = (isHeld) => dispatch(setHold(isHeld));

    // Subscribe to events from the new sipClient
    sipEvents.on("registered", onRegistered);
    sipEvents.on("registrationFailed", onRegistrationFailed);
    sipEvents.on("unregistered", onUnregistered);
    sipEvents.on("incoming_call", onIncomingCall);
    sipEvents.on("outgoing_call", onOutgoingCall);
    sipEvents.on("call_progress", onCallProgress);
    sipEvents.on("call_accepted", onCallAccepted);
    sipEvents.on("call_confirmed", onCallConfirmed);
    sipEvents.on("call_ended", onCallEnded);
    sipEvents.on("call_failed", onCallFailed);
    sipEvents.on("mute", onMute);
    sipEvents.on("hold", onHold);

    // Cleanup listeners on unmount
    return () => {
      sipEvents.removeListener("registered", onRegistered);
      sipEvents.removeListener("registrationFailed", onRegistrationFailed);
      sipEvents.removeListener("unregistered", onUnregistered);
      sipEvents.removeListener("incoming_call", onIncomingCall);
      sipEvents.removeListener("outgoing_call", onOutgoingCall);
      sipEvents.removeListener("call_progress", onCallProgress);
      sipEvents.removeListener("call_accepted", onCallAccepted);
      sipEvents.removeListener("call_confirmed", onCallConfirmed);
      sipEvents.removeListener("call_ended", onCallEnded);
      sipEvents.removeListener("call_failed", onCallFailed);
      sipEvents.removeListener("mute", onMute);
      sipEvents.removeListener("hold", onHold);
    };
  }, [dispatch]);
}
