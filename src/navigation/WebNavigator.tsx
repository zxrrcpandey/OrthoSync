import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WebDashboard from '../screens/web/WebDashboard';

type WebStackParamList = {
  WebDashboard: undefined;
};

const Stack = createNativeStackNavigator<WebStackParamList>();

export default function WebNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="WebDashboard" component={WebDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
