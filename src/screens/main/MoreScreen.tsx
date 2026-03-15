import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../navigation/types';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';
import { useAuthStore } from '../../store';

const MenuItem = ({ emoji, title, subtitle, onPress }: { emoji: string; title: string; subtitle?: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <BlurView intensity={15} tint="light" style={styles.menuBlur}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </BlurView>
  </TouchableOpacity>
);

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MoreStackParamList>>();
  const logout = useAuthStore((s) => s.logout);

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.7} onPress={() => navigation.navigate('DoctorProfile')}>
          <BlurView intensity={20} tint="light" style={styles.profileBlur}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>PG</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Dr. Pooja Gangare</Text>
              <Text style={styles.profileSpecialization}>Orthodontics & Dentofacial Orthopaedics</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Menu Sections */}
        <Text style={styles.sectionTitle}>Practice</Text>
        <MenuItem emoji="🏥" title={t('location.locations')} subtitle="Manage hospitals & clinics" onPress={() => navigation.navigate('Locations')} />
        <MenuItem emoji="🦷" title={t('treatment.treatments')} subtitle="Configure treatment types" onPress={() => {}} />
        <MenuItem emoji="🔔" title={t('notification.notifications')} subtitle="View all notifications" onPress={() => navigation.navigate('Notifications')} />
        <MenuItem emoji="📊" title={t('reports.reports')} subtitle="Analytics & exports" onPress={() => {}} />

        <Text style={styles.sectionTitle}>Account</Text>
        <MenuItem emoji="⚙️" title={t('doctor.settings')} subtitle="App preferences" onPress={() => navigation.navigate('Settings')} />
        <MenuItem emoji="💎" title={t('doctor.subscription')} subtitle="Free Plan" onPress={() => navigation.navigate('Subscription')} />
        <MenuItem emoji="🌐" title={t('doctor.language')} subtitle="English" onPress={() => {}} />

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <BlurView intensity={15} tint="light" style={styles.logoutBlur}>
            <Text style={styles.logoutText}>{t('doctor.logout')}</Text>
          </BlurView>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>OrthoSync</Text>
          <Text style={styles.appVersion}>Built by Dr. Pooja Gangare</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  profileCard: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  profileBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.glass.greenMedium,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.glass.border,
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  profileInfo: { flex: 1 },
  profileName: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  profileSpecialization: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    marginLeft: Spacing.xs,
  },
  menuItem: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  menuBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  menuEmoji: { fontSize: 24 },
  menuText: { flex: 1 },
  menuTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  menuSubtitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  menuArrow: {
    color: Colors.text.secondary,
    fontSize: 24,
    fontWeight: FontWeight.bold,
  },
  logoutButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginTop: Spacing.xxl,
  },
  logoutBlur: {
    padding: Spacing.lg,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    padding: Spacing.lg,
  },
  appName: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  appVersion: {
    color: Colors.text.tertiary,
    fontSize: FontSize.sm,
    marginTop: Spacing.xs,
  },
});
