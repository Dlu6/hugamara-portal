import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import RootNavigator from "./navigation/RootNavigator";
import { store } from "./store";
import { navigationRef } from "./navigation/navigationRef";
import {
  setupNotificationChannel,
  subscribeIncomingNotifications,
} from "./services/notifications";
import { ToastProvider } from "./contexts/ToastContext";
import CallManager from "./components/CallManager";

export default function App() {
  useEffect(() => {
    setupNotificationChannel("calls");
    const unsubscribe = subscribeIncomingNotifications();
    return () => unsubscribe && unsubscribe();
  }, []);

  return (
    <Provider store={store}>
      <ToastProvider>
        <NavigationContainer ref={navigationRef}>
          <CallManager />
          <RootNavigator />
        </NavigationContainer>
      </ToastProvider>
    </Provider>
  );
}
