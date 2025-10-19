import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import Icon from "../utils/icons";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { disconnect } from "../services/sipClient";
import * as SecureStore from "expo-secure-store";

export default function CustomDrawerContent(props) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const extension = useSelector((state) => state.auth.extension);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              // Disconnect SIP
              await disconnect();
              
              // Don't clear saved credentials - let "Remember me" persist
              // Only logout from the current session
              
              // Logout from auth
              dispatch(logout());
              
              // Navigate to login
              props.navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      name: "Settings",
      icon: "settings-outline",
      onPress: () => {
        props.navigation.navigate("Settings");
        props.navigation.closeDrawer();
      },
    },
    {
      name: "Logout",
      icon: "log-out-outline",
      onPress: handleLogout,
      danger: true,
    },
  ];

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.drawerContent}
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/mayday_icon_plain.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.userName}>{user?.name || user?.email || "User"}</Text>
        {extension && <Text style={styles.userExtension}>Ext: {extension}</Text>}
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, item.danger && styles.menuItemDanger]}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <Icon
              name={item.icon}
              size={24}
              color={item.danger ? "#FF3B30" : "#FFFFFF"}
              style={styles.menuIcon}
            />
            <Text
              style={[styles.menuText, item.danger && styles.menuTextDanger]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Mayday Mobile v1.1.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  profileSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#1F2937",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1C1C1E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#005370",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  logo: {
    width: 60,
    height: 60,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  userExtension: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  menuSection: {
    flex: 1,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  menuItemDanger: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  menuTextDanger: {
    color: "#FF3B30",
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
    alignItems: "center",
  },
  versionText: {
    color: "#6B7280",
    fontSize: 12,
    fontWeight: "500",
  },
});
