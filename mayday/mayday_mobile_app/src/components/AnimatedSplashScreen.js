import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image } from "react-native";
import LottieView from "lottie-react-native";
import * as SplashScreen from "expo-splash-screen";

// Keep the native splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function AnimatedSplashScreen({ onFinish }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Hide the native splash screen
    SplashScreen.hideAsync();

    // Fade in and scale up the icon
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 2 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/mayday_icon_plain.png")}
          style={styles.icon}
          resizeMode="contain"
        />
        <LottieView
          source={require("../../assets/Sandy Loading.json")}
          autoPlay
          loop
          style={styles.loader}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#005370",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  loader: {
    width: 90,
    height: 90,
  },
});
