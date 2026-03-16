import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { MainTabParamList } from './types';
import { Colors, FontSize, Spacing } from '../theme';
import { useTheme } from '../theme';

// Placeholder screens - will be replaced with actual screens
import DashboardScreen from '../screens/main/DashboardScreen';
import PatientsNavigator from './PatientsNavigator';
import CalendarNavigator from './CalendarNavigator';
import BillingNavigator from './BillingNavigator';
import MoreNavigator from './MoreNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TabIcon = ({ name, focused, activeColor }: { name: string; focused: boolean; activeColor: string }) => {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Patients: '👥',
    Calendar: '📅',
    Billing: '💰',
    More: '☰',
  };
  return (
    <View style={[styles.iconContainer, focused && { backgroundColor: activeColor }]}>
      <Text style={styles.iconText}>{icons[name] || '•'}</Text>
    </View>
  );
};

export default function MainTabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} activeColor={colors.glass.tintMedium} />,
        tabBarActiveTintColor: colors.tabBar.active,
        tabBarInactiveTintColor: colors.tabBar.inactive,
        tabBarStyle: [styles.tabBar, Platform.OS === 'ios' ? undefined : { backgroundColor: colors.tabBar.background }],
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.tabBar.background }]} />
          ),
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Patients" component={PatientsNavigator} />
      <Tab.Screen name="Calendar" component={CalendarNavigator} />
      <Tab.Screen name="Billing" component={BillingNavigator} />
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
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : undefined,
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
  iconText: {
    fontSize: 18,
  },
});
