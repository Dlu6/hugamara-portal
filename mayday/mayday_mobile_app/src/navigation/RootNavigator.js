import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginMobileScreen from "../screens/Auth/LoginMobileScreen";
import IncomingCallScreen from "../screens/Calls/IncomingCallScreen";
import CallScreen from "../screens/Calls/CallScreen";
import DrawerNavigator from "./DrawerNavigator";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginMobileScreen} />
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );
}
