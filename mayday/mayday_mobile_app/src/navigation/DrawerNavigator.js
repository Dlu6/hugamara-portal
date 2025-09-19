import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import DialerScreen from "../screens/Calls/DialerScreen";
import CallHistoryScreen from "../screens/History/CallHistoryScreen";
import SettingsScreen from "../screens/Settings/SettingsScreen";
import ContactsScreen from "../screens/Contacts/ContactsScreen";
import FavoritesScreen from "../screens/Contacts/FavoritesScreen";
import AgentStatusScreen from "../screens/Agent/AgentStatusScreen";
import DiagnosticsScreen from "../screens/Diagnostics/DiagnosticsScreen";
import ProfileScreen from "../screens/Account/ProfileScreen";
import AccountsScreen from "../screens/Account/AccountsScreen";
import AudioDevicesScreen from "../screens/Settings/AudioDevicesScreen";
import NotificationsCenterScreen from "../screens/Settings/NotificationsCenterScreen";
import HelpScreen from "../screens/Help/HelpScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0A0A0A" },
        headerTintColor: "#FFFFFF",
        drawerStyle: { backgroundColor: "#0A0A0A" },
        drawerActiveTintColor: "#FFFFFF",
        drawerInactiveTintColor: "#9CA3AF",
      }}
    >
      <Drawer.Screen name="Dialer" component={DialerScreen} />
      <Drawer.Screen name="Contacts" component={ContactsScreen} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      <Drawer.Screen name="Agent Status" component={AgentStatusScreen} />
      <Drawer.Screen name="History" component={CallHistoryScreen} />
      <Drawer.Screen name="Audio Devices" component={AudioDevicesScreen} />
      <Drawer.Screen
        name="Notifications"
        component={NotificationsCenterScreen}
      />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Diagnostics" component={DiagnosticsScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Accounts" component={AccountsScreen} />
      <Drawer.Screen name="Help & Feedback" component={HelpScreen} />
    </Drawer.Navigator>
  );
}
