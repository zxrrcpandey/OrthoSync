import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MainTabParamList } from './types';
import { Colors, FontSize, Spacing } from '../theme';

// Placeholder screens - will be replaced with actual screens
import DashboardScreen from '../screens/main/DashboardScreen';
import PatientsNavigator from './PatientsNavigator';
import CalendarScreen from '../screens/main/CalendarScreen';
import BillingScreen from '../screens/main/BillingScreen';
import MoreNavigator from './MoreNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Patients: '👥',
    Calendar: '📅',
    Billing: '💰',
    More: '☰',
  };
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={styles.iconText}>{icons[name] || '•'}</Text>
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: Colors.accent.main,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.tabBarAndroid]} />
          ),
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Patients" component={PatientsNavigator} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Billing" component={BillingScreen} />
      <Tab.Screen name="More" component={MoreNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    elevation: 0,
    height: Platform.OS === 'ios' ? 88 : 65,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors.primary[900],
  },
  tabBarAndroid: {
    backgroundColor: 'rgba(27, 94, 32, 0.95)',
  },
  tabBarLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    marginTop: 2,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: Colors.glass.greenMedium,
  },
  iconText: {
    fontSize: 18,
  },
});
