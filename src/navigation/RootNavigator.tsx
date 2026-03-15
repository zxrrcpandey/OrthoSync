import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import DoctorSetupScreen from '../screens/doctor/DoctorSetupScreen';
import WebNavigator from './WebNavigator';
import { useAuthStore } from '../store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  // On web, render the admin panel instead of mobile navigation
  if (Platform.OS === 'web') {
    return <WebNavigator />;
  }

  const { isAuthenticated, user } = useAuthStore();
  const needsSetup = isAuthenticated && user && !user.settings?.treatments?.length;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : needsSetup ? (
          <Stack.Screen name="DoctorSetup" component={DoctorSetupScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
