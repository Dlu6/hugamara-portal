import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import DialerScreen from '../screens/Calls/DialerScreen';
import IncomingCallScreen from '../screens/Calls/IncomingCallScreen';
import CallScreen from '../screens/Calls/CallScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';
import CallHistoryScreen from '../screens/History/CallHistoryScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Dialer" component={DialerScreen} />
      <Stack.Screen name="IncomingCall" component={IncomingCallScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
      <Stack.Screen name="History" component={CallHistoryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
