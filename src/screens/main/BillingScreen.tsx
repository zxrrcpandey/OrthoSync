import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../../theme';

export default function BillingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <LinearGradient colors={Colors.gradient.primary} style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{t('billing.billing')}</Text>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <BlurView intensity={15} tint="light" style={styles.statBlur}>
              <Text style={styles.statLabel}>{t('billing.totalAmount')}</Text>
              <Text style={styles.statValue}>₹0</Text>
            </BlurView>
          </View>
          <View style={styles.statCard}>
            <BlurView intensity={15} tint="light" style={styles.statBlur}>
              <Text style={styles.statLabel}>{t('billing.balance')}</Text>
              <Text style={[styles.statValue, { color: Colors.warning }]}>₹0</Text>
            </BlurView>
          </View>
        </View>

        {/* Menu Items */}
        {[
          { emoji: '📋', title: t('billing.feesMaster'), subtitle: 'Manage treatment rates' },
          { emoji: '💳', title: t('billing.createBill'), subtitle: 'Generate new bill' },
          { emoji: '🏦', title: t('commission.commission'), subtitle: 'Track clinic commissions' },
          { emoji: '📊', title: t('reports.reports'), subtitle: 'View financial reports' },
        ].map((item, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} activeOpacity={0.7}>
            <BlurView intensity={15} tint="light" style={styles.menuBlur}>
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </BlurView>
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  title: {
    color: Colors.text.primary,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  statBlur: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glass.borderLight,
  },
  statLabel: {
    color: Colors.text.secondary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  menuItem: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
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
  menuEmoji: { fontSize: 28 },
  menuText: { flex: 1 },
  menuTitle: {
    color: Colors.text.primary,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
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
});
