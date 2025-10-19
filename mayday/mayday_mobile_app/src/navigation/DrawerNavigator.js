import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TouchableOpacity, StyleSheet } from "react-native";
import Icon from "../utils/icons";
import BottomTabNavigator from "./BottomTabNavigator";
import CustomDrawerContent from "./CustomDrawerContent";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: "#0A0A0A",
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.toggleDrawer()}
            style={styles.hamburgerButton}
            activeOpacity={0.7}
          >
            <Icon name="menu" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        drawerStyle: {
          backgroundColor: "#0A0A0A",
          width: 280,
        },
        drawerType: "front",
      })}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{
          title: "Mayday Mobile",
          drawerLabel: "Home",
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    marginLeft: 16,
    padding: 8,
  },
});
