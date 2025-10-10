import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";

// Screens
import DialerScreen from "../screens/Calls/DialerScreen";
import CallHistoryScreen from "../screens/History/CallHistoryScreen";
import ContactsScreen from "../screens/Contacts/ContactsScreen";
import AgentStatusScreen from "../screens/Agent/AgentStatusScreen";
import DashboardScreen from "../screens/Dashboard/DashboardScreen";

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
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => {
            try {
              return (
                <Ionicons
                  name={focused ? "home" : "home-outline"}
                  size={24}
                  color={color}
                />
              );
            } catch (error) {
              console.log("Ionicons error:", error);
              return <Text style={{ color, fontSize: 20 }}>🏠</Text>;
            }
          },
        }}
      />
      <Tab.Screen
        name="History"
        component={CallHistoryScreen}
        options={{
          tabBarIcon: ({ focused, color }) => {
            try {
              return (
                <Ionicons
                  name={focused ? "time" : "time-outline"}
                  size={24}
                  color={color}
                />
              );
            } catch (error) {
              return <Text style={{ color, fontSize: 20 }}>🕒</Text>;
            }
          },
        }}
      />
      <Tab.Screen
        name="Dialer"
        component={DialerScreen}
        options={{
          tabBarIcon: ({ focused, color }) => {
            try {
              return (
                <Ionicons
                  name={focused ? "call" : "call-outline"}
                  size={24}
                  color={color}
                />
              );
            } catch (error) {
              return <Text style={{ color, fontSize: 20 }}>📞</Text>;
            }
          },
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => {
            try {
              return (
                <Ionicons
                  name={focused ? "people" : "people-outline"}
                  size={24}
                  color={color}
                />
              );
            } catch (error) {
              return <Text style={{ color, fontSize: 20 }}>👥</Text>;
            }
          },
        }}
      />
      <Tab.Screen
        name="Status"
        component={AgentStatusScreen}
        options={{
          tabBarIcon: ({ focused, color }) => {
            try {
              return (
                <Ionicons
                  name={focused ? "person" : "person-outline"}
                  size={24}
                  color={color}
                />
              );
            } catch (error) {
              return <Text style={{ color, fontSize: 20 }}>👤</Text>;
            }
          },
        }}
      />
    </Tab.Navigator>
  );
}
