import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginMobileScreen from "../screens/Auth/LoginMobileScreen";
import IncomingCallScreen from "../screens/Calls/IncomingCallScreen";
import CallScreen from "../screens/Calls/CallScreen";
import DrawerNavigator from "./DrawerNavigator"; // Import the Drawer Navigator
import SettingsScreen from "../screens/Settings/SettingsScreen";
import ContactDetailScreen from "../screens/Contacts/ContactDetailScreen";
import CreateContactScreen from "../screens/Contacts/CreateContactScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "#0A0A0A",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginMobileScreen} />
      {/* Use DrawerNavigator which wraps BottomTabNavigator */}
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: "Mayday Mobile",
        }}
      />
      <Stack.Screen
        name="ContactDetail"
        component={ContactDetailScreen}
        options={{
          headerShown: true,
          title: "Mayday Mobile",
        }}
      />
      <Stack.Screen
        name="CreateContact"
        component={CreateContactScreen}
        options={{
          headerShown: true,
          title: "Mayday Mobile",
        }}
      />
    </Stack.Navigator>
  );
}
