import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BillingStackParamList } from './types';
import BillingScreen from '../screens/main/BillingScreen';
import FeesMasterScreen from '../screens/billing/FeesMasterScreen';
import CreateBillScreen from '../screens/billing/CreateBillScreen';
import BillDetailScreen from '../screens/billing/BillDetailScreen';

const Stack = createNativeStackNavigator<BillingStackParamList>();

export default function BillingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="BillingOverview" component={BillingScreen} />
      <Stack.Screen name="FeesMaster" component={FeesMasterScreen} />
      <Stack.Screen name="CreateBill" component={CreateBillScreen} />
      <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    </Stack.Navigator>
  );
}
