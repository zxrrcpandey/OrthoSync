import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalendarStackParamList } from './types';
import CalendarViewScreen from '../screens/calendar/CalendarViewScreen';
import AddAppointmentScreen from '../screens/calendar/AddAppointmentScreen';
import AppointmentDetailScreen from '../screens/calendar/AppointmentDetailScreen';

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="CalendarView" component={CalendarViewScreen} />
      <Stack.Screen name="AddAppointment" component={AddAppointmentScreen} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </Stack.Navigator>
  );
}
