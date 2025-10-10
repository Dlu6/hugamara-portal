import { useEffect } from "react";
import useSIP from "../hooks/useSIP";

/**
 * CallManager Component
 *
 * This component initializes the SIP event listeners and handles
 * automatic navigation to call screens when calls are received or made.
 *
 * It should be rendered once at the root level of the app.
 */
export default function CallManager() {
  // Initialize SIP event listeners
  useSIP();

  return null; // This component doesn't render anything
}
