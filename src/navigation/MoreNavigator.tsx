import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreStackParamList } from './types';
import MoreScreen from '../screens/main/MoreScreen';
import DoctorProfileScreen from '../screens/doctor/DoctorProfileScreen';
import LocationsListScreen from '../screens/location/LocationsListScreen';
import AddLocationScreen from '../screens/location/AddLocationScreen';
import LocationDetailScreen from '../screens/location/LocationDetailScreen';
import NotificationsScreen from '../screens/notification/NotificationsScreen';
import SendNotificationScreen from '../screens/notification/SendNotificationScreen';
import ReportsDashboardScreen from '../screens/reports/ReportsDashboardScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreScreen} />
      <Stack.Screen name="DoctorProfile" component={DoctorProfileScreen} />
      <Stack.Screen name="Locations" component={LocationsListScreen} />
      <Stack.Screen name="AddLocation" component={AddLocationScreen} />
      <Stack.Screen name="LocationDetail" component={LocationDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="SendNotification" component={SendNotificationScreen} />
      <Stack.Screen name="Reports" component={ReportsDashboardScreen} />
    </Stack.Navigator>
  );
}
