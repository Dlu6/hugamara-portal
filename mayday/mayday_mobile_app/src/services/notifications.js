import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { navigate } from "../navigation/navigationRef";
import { answerCall, hangupCall } from "./sipClient";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function setupNotificationChannel(channelId = "calls") {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: "Calls",
      importance: Notifications.AndroidImportance.MAX,
      sound: "default",
      vibrationPattern: [250, 250, 250, 250],
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }
}

export async function registerPushToken() {
  if (!Device.isDevice) return null;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return null;
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function scheduleIncomingCallNotification(callerInfo) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Incoming Call",
        body: `Call from ${callerInfo.name || callerInfo.number}`,
        data: { type: "incoming_call", caller: callerInfo },
        sound: "default",
        priority: Notifications.AndroidNotificationPriority.MAX,
        categoryIdentifier: "incoming_call",
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error(
      "[Notifications] Failed to schedule incoming call notification:",
      error
    );
  }
}

export async function setupNotificationCategories() {
  try {
    await Notifications.setNotificationCategoryAsync("incoming_call", [
      {
        identifier: "answer",
        buttonTitle: "Answer",
        options: { opensAppToForeground: true },
      },
      {
        identifier: "decline",
        buttonTitle: "Decline",
        options: { opensAppToForeground: false, isDestructive: true },
      },
    ]);
  } catch (error) {
    console.error(
      "[Notifications] Failed to setup notification categories:",
      error
    );
  }
}

export function subscribeIncomingNotifications() {
  const subReceived = Notifications.addNotificationReceivedListener(
    (notification) => {
      const data = notification?.request?.content?.data || {};
      if (data.type === "incoming_call") {
        navigate("IncomingCall", { caller: data.caller.number });
      }
    }
  );

  const subResponse = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const data = response?.notification?.request?.content?.data || {};
      const actionId = response?.actionIdentifier;

      if (data.type === "incoming_call") {
        if (actionId === "answer") {
          answerCall();
          navigate("Call", { number: data.caller.number });
        } else if (actionId === "decline") {
          hangupCall();
        } else {
          // Default tap - open incoming call screen
          navigate("IncomingCall", { caller: data.caller.number });
        }
      }
    }
  );

  return () => {
    subReceived && Notifications.removeNotificationSubscription(subReceived);
    subResponse && Notifications.removeNotificationSubscription(subResponse);
  };
}
