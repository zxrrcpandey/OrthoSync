import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

const StatCard = ({ title, value, emoji }: { title: string; value: string; emoji: string }) => (
  <View style={styles.statCard}>
    <BlurView intensity={20} tint="light" style={styles.statCardBlur}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </BlurView>
  </View>
);

const QuickAction = ({ title, emoji, onPress }: { title: string; emoji: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <BlurView intensity={15} tint="light" style={styles.quickActionBlur}>
      <Text style={styles.quickActionEmoji}>{emoji}</Text>
      <Text style={styles.quickActionText}>{title}</Text>
    </BlurView>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning 👋</Text>
            <Text style={styles.doctorName}>Dr. Pooja Gangare</Text>
          </View>
          <TouchableOpacity style={styles.notifButton}>
            <BlurView intensity={20} tint="light" style={styles.notifBlur}>
              <Text style={styles.notifIcon}>🔔</Text>
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>{t('dashboard.todayOverview')}</Text>
        <View style={styles.statsGrid}>
          <StatCard emoji="👥" title={t('dashboard.totalPatients')} value="0" />
          <StatCard emoji="📅" title={t('dashboard.todayAppointments')} value="0" />
          <StatCard emoji="⏳" title={t('dashboard.pendingPayments')} value="₹0" />
          <StatCard emoji="💰" title={t('dashboard.monthlyEarnings')} value="₹0" />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction emoji="➕" title={t('patient.addPatient')} onPress={() => {}} />
          <QuickAction emoji="📅" title={t('appointment.addAppointment')} onPress={() => {}} />
          <QuickAction emoji="💳" title={t('billing.createBill')} onPress={() => {}} />
          <QuickAction emoji="🏥" title={t('location.addLocation')} onPress={() => {}} />
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>{t('dashboard.recentActivity')}</Text>
        <View style={styles.emptyCard}>
          <BlurView intensity={15} tint="light" style={styles.emptyCardBlur}>
            <Text style={styles.emptyText}>{t('common.noData')}</Text>
            <Text style={styles.emptySubtext}>Start by adding patients and appointments</Text>
          </BlurView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  greeting: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
  },
  doctorName: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  notifButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  notifBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  notifIcon: { fontSize: 22 },
  sectionTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    width: '47%',
    height: 110,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  statCardBlur: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  statEmoji: { fontSize: 24, marginBottom: Spacing.xs },
  statValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  statTitle: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  quickAction: {
    width: '47%',
    height: 70,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  quickActionBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
    gap: Spacing.md,
  },
  quickActionEmoji: { fontSize: 22 },
  quickActionText: {
    color: Colors.text.primary,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  emptyCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  emptyCardBlur: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  emptySubtext: {
    color: Colors.text.tertiary,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
});
