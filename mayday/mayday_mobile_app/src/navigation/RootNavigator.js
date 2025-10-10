import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginMobileScreen from "../screens/Auth/LoginMobileScreen";
import IncomingCallScreen from "../screens/Calls/IncomingCallScreen";
import CallScreen from "../screens/Calls/CallScreen";
import BottomTabNavigator from "./BottomTabNavigator"; // Import the new Tab Navigator
import SettingsScreen from "../screens/Settings/SettingsScreen";
import ContactDetailScreen from "../screens/Contacts/ContactDetailScreen";
import CreateContactScreen from "../screens/Contacts/CreateContactScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginMobileScreen} />
      {/* Replace the DrawerNavigator with the BottomTabNavigator */}
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} />
      <Stack.Screen name="CreateContact" component={CreateContactScreen} />
    </Stack.Navigator>
  );
}
