import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientsStackParamList } from './types';
import PatientsScreen from '../screens/main/PatientsScreen';
import AddPatientScreen from '../screens/patient/AddPatientScreen';
import PatientDetailScreen from '../screens/patient/PatientDetailScreen';
import AddTreatmentScreen from '../screens/treatment/AddTreatmentScreen';
import TreatmentDetailScreen from '../screens/treatment/TreatmentDetailScreen';
import AddTreatmentVisitScreen from '../screens/treatment/AddTreatmentVisitScreen';

const Stack = createNativeStackNavigator<PatientsStackParamList>();

export default function PatientsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PatientsList" component={PatientsScreen} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
      <Stack.Screen name="AddTreatment" component={AddTreatmentScreen} />
      <Stack.Screen name="TreatmentDetail" component={TreatmentDetailScreen} />
      <Stack.Screen name="AddTreatmentVisit" component={AddTreatmentVisitScreen} />
    </Stack.Navigator>
  );
}
