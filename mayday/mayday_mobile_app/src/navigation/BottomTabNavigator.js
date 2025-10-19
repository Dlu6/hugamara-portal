import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "../utils/icons";

// Screens
import DialerScreen from "../screens/Calls/DialerScreen";
import CallHistoryScreen from "../screens/History/CallHistoryScreen";
import ContactsScreen from "../screens/Contacts/ContactsScreen";
import AgentStatusScreen from "../screens/Agent/AgentStatusScreen";
import DashboardMobileScreen from "../screens/DashboardMobileScreen/DashboardMobileScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1C1C1E",
          borderTopColor: "#3A3A3C",
          borderTopWidth: 1,
          height: 90,
          paddingBottom: 20,
          paddingTop: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#8E8E93",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
          letterSpacing: -0.2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardMobileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={CallHistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dialer"
        component={DialerScreen}
        options={{
          tabBarIcon: ({ color, size}) => (
            <Icon name="call" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Status"
        component={AgentStatusScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
